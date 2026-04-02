import asyncio
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db, async_session
from app.models.scrape import ScrapeResult, ScrapeJob
from app.schemas.scrape import ScrapeResultResponse, ScrapeJobResponse, ScrapeRequest
from app.services.scraping_service import scraping_service
from pydantic import BaseModel
from app.services.firecrawl_service import firecrawl_service
from app.services.upgrade_analyzer import analyze_upgrade

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


@router.get("/search")
async def search_parts(
    q: str = Query(..., min_length=1, description="Search query"),
    generation: str = Query("", description="Corvette generation, e.g. c8"),
    category: str = Query("", description="Part category, e.g. engine"),
    limit: int = Query(10, ge=1, le=20, description="Max results"),
    competitive: bool = Query(False, description="Enable multi-retailer competitive pricing"),
):
    """Search aftermarket Corvette parts via Firecrawl."""
    if competitive:
        results = await firecrawl_service.search_parts_competitive(
            query=q,
            generation=generation,
            part_category=category,
            limit=limit,
        )
    else:
        results = await firecrawl_service.search_parts(
            query=q,
            generation=generation,
            part_category=category,
            limit=limit,
        )
    return results


class AnalyzeRequest(BaseModel):
    generation: str
    part_category: str
    product_name: str
    product_description: str = ""
    product_price: str | None = None


@router.post("/analyze")
async def analyze_upgrade_endpoint(req: AnalyzeRequest):
    """Analyze the performance impact of an aftermarket upgrade using AI."""
    result = await analyze_upgrade(
        generation=req.generation,
        part_category=req.part_category,
        product_name=req.product_name,
        product_description=req.product_description,
        product_price=req.product_price,
    )
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


@router.get("/results", response_model=list[ScrapeResultResponse])
async def get_results(
    vehicle_id: int = Query(...),
    upgrade_category_id: int = Query(...),
    sort_by: str = Query("best_value", pattern="^(price|rating|best_value)$"),
    min_rating: float = Query(0.0),
    max_price: float | None = Query(None),
    retailer: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get cached scraping results with filtering and sorting."""
    stmt = select(ScrapeResult).where(
        ScrapeResult.vehicle_id == vehicle_id,
        ScrapeResult.upgrade_category_id == upgrade_category_id,
        ScrapeResult.expires_at > datetime.now(timezone.utc),
    )

    # Apply filters
    if min_rating > 0:
        stmt = stmt.where(ScrapeResult.rating >= min_rating)
    if max_price is not None:
        stmt = stmt.where(ScrapeResult.price <= max_price)
    if retailer:
        stmt = stmt.where(ScrapeResult.retailer == retailer)

    # Apply sorting
    if sort_by == "price":
        stmt = stmt.order_by(ScrapeResult.price.asc())
    elif sort_by == "rating":
        stmt = stmt.order_by(ScrapeResult.rating.desc().nullslast())
    else:
        # best_value = price * (5 - rating)  — lower is better
        # Products with no rating get a penalty (treated as rating=0)
        best_value_expr = ScrapeResult.price * (
            5.0 - case(
                (ScrapeResult.rating.is_not(None), ScrapeResult.rating),
                else_=0.0,
            )
        )
        stmt = stmt.order_by(best_value_expr.asc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/scrape", response_model=ScrapeJobResponse)
async def start_scrape(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Start a new scraping job.

    Returns cached results immediately if cache is fresh.
    Otherwise creates a background scraping job and returns the job object
    so the frontend can poll or subscribe via WebSocket.
    """
    # Check cache first
    cached = await scraping_service.get_cached_results(
        db, request.vehicle_id, request.upgrade_category_id
    )
    if cached is not None:
        # Return a synthetic "completed" job to indicate cache hit
        # The frontend should then call GET /results to fetch the actual data
        job = ScrapeJob(
            id=0,
            vehicle_id=request.vehicle_id,
            upgrade_category_id=request.upgrade_category_id,
            status="completed",
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )
        # We can't return a transient object with id=0 from the DB,
        # so build the response manually
        return ScrapeJobResponse(
            id=0,
            vehicle_id=request.vehicle_id,
            upgrade_category_id=request.upgrade_category_id,
            status="cached",
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )

    # Check if there's already a running job for this vehicle+category
    running_stmt = select(ScrapeJob).where(
        ScrapeJob.vehicle_id == request.vehicle_id,
        ScrapeJob.upgrade_category_id == request.upgrade_category_id,
        ScrapeJob.status.in_(["pending", "running"]),
    )
    existing = await db.execute(running_stmt)
    existing_job = existing.scalar_one_or_none()
    if existing_job:
        return existing_job

    # Create new job
    job = await scraping_service.start_scrape_job(
        db, request.vehicle_id, request.upgrade_category_id
    )

    # Dispatch scraping in background (don't await)
    background_tasks.add_task(scraping_service.run_scrape_job, job.id)

    return job


@router.get("/jobs/{job_id}", response_model=ScrapeJobResponse)
async def get_job_status(job_id: int, db: AsyncSession = Depends(get_db)):
    """Get the status of a scraping job."""
    job = await db.get(ScrapeJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.websocket("/ws/scrape/{job_id}")
async def scrape_websocket(websocket: WebSocket, job_id: int):
    """WebSocket endpoint for real-time scraping updates.

    Streams new results to the client as scrapers complete.
    Polls the DB every 2 seconds for new results and job status changes.
    Closes when the job is completed or failed.
    """
    await websocket.accept()

    last_result_count = 0

    try:
        await websocket.send_json({"type": "connected", "job_id": job_id})

        while True:
            async with async_session() as db:
                # Check job status
                job = await db.get(ScrapeJob, job_id)
                if not job:
                    await websocket.send_json({"type": "error", "message": "Job not found"})
                    break

                # Get current results count and any new results
                stmt = (
                    select(ScrapeResult)
                    .where(
                        ScrapeResult.vehicle_id == job.vehicle_id,
                        ScrapeResult.upgrade_category_id == job.upgrade_category_id,
                    )
                    .order_by(ScrapeResult.id.asc())
                    .offset(last_result_count)
                )
                result = await db.execute(stmt)
                new_results = result.scalars().all()

                if new_results:
                    await websocket.send_json({
                        "type": "results",
                        "results": [
                            {
                                "id": r.id,
                                "retailer": r.retailer,
                                "product_name": r.product_name,
                                "price": r.price,
                                "currency": r.currency,
                                "rating": r.rating,
                                "review_count": r.review_count,
                                "image_url": r.image_url,
                                "product_url": r.product_url,
                                "seller_name": r.seller_name,
                                "shipping_estimate": r.shipping_estimate,
                                "fitment_confidence": r.fitment_confidence,
                            }
                            for r in new_results
                        ],
                    })
                    last_result_count += len(new_results)

                # Send status update
                await websocket.send_json({
                    "type": "status",
                    "status": job.status,
                    "result_count": last_result_count,
                })

                # If job is done, close
                if job.status in ("completed", "failed"):
                    await websocket.send_json({
                        "type": "complete",
                        "status": job.status,
                        "total_results": last_result_count,
                        "error_message": job.error_message,
                    })
                    break

            await asyncio.sleep(2)

    except WebSocketDisconnect:
        logger.debug("WebSocket client disconnected for job %d", job_id)
    except Exception:
        logger.exception("WebSocket error for job %d", job_id)
