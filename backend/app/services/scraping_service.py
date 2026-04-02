import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.database import async_session
from app.models.scrape import ScrapeResult, ScrapeJob
from app.models.vehicle import Vehicle
from app.models.part import UpgradeCategory
from app.scrapers import ALL_SCRAPERS, MOCK_SCRAPER
from app.scrapers.base import BaseScraper, ScrapedProduct

logger = logging.getLogger(__name__)


class ScrapingService:
    """Orchestrates scraping across multiple retailers with caching."""

    async def get_cached_results(
        self,
        db: AsyncSession,
        vehicle_id: int,
        upgrade_category_id: int,
    ) -> list[ScrapeResult] | None:
        """Return cached results if they exist and haven't expired.

        Returns None if no valid cache exists (triggers a new scrape).
        Returns an empty list if cached but genuinely found nothing.
        """
        now = datetime.now(timezone.utc)
        stmt = (
            select(ScrapeResult)
            .where(
                ScrapeResult.vehicle_id == vehicle_id,
                ScrapeResult.upgrade_category_id == upgrade_category_id,
                ScrapeResult.expires_at > now,
            )
            .order_by(ScrapeResult.price.asc())
        )
        result = await db.execute(stmt)
        rows = result.scalars().all()

        if not rows:
            # Check whether we have *expired* rows (means we scraped before but cache is stale)
            expired_stmt = select(ScrapeResult.id).where(
                ScrapeResult.vehicle_id == vehicle_id,
                ScrapeResult.upgrade_category_id == upgrade_category_id,
            ).limit(1)
            expired = await db.execute(expired_stmt)
            if expired.scalar_one_or_none() is not None:
                # Had results before, they're just expired — delete them
                await db.execute(
                    delete(ScrapeResult).where(
                        ScrapeResult.vehicle_id == vehicle_id,
                        ScrapeResult.upgrade_category_id == upgrade_category_id,
                    )
                )
                await db.commit()
            return None  # No valid cache

        return list(rows)

    async def start_scrape_job(
        self,
        db: AsyncSession,
        vehicle_id: int,
        upgrade_category_id: int,
    ) -> ScrapeJob:
        """Create a scrape job record and return it.

        The actual scraping is dispatched separately via run_scrape_job().
        """
        job = ScrapeJob(
            vehicle_id=vehicle_id,
            upgrade_category_id=upgrade_category_id,
            status="pending",
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return job

    async def run_scrape_job(self, job_id: int) -> None:
        """Execute the scrape job in the background using a fresh DB session.

        Dispatches all scrapers in parallel, stores results, updates job status.
        """
        async with async_session() as db:
            # Load the job
            job = await db.get(ScrapeJob, job_id)
            if not job:
                logger.error("ScrapeJob %d not found", job_id)
                return

            job.status = "running"
            job.started_at = datetime.now(timezone.utc)
            await db.commit()

            # Load vehicle and upgrade category
            vehicle = await db.get(Vehicle, job.vehicle_id)
            upgrade_cat = await db.get(UpgradeCategory, job.upgrade_category_id)

            if not vehicle or not upgrade_cat:
                job.status = "failed"
                job.error_message = "Vehicle or upgrade category not found"
                job.completed_at = datetime.now(timezone.utc)
                await db.commit()
                return

            # Build the search query from upgrade category name
            query = upgrade_cat.name

            # Dispatch all scrapers in parallel
            scrapers_to_run: list[BaseScraper] = list(ALL_SCRAPERS)

            # In debug mode, always include mock scraper for guaranteed results
            if settings.debug:
                scrapers_to_run.append(MOCK_SCRAPER)

            # Each scraper gets its own session — AsyncSession is not safe for concurrent use
            tasks = [
                self._run_scraper_isolated(scraper, query, vehicle, job)
                for scraper in scrapers_to_run
            ]

            all_results = await asyncio.gather(*tasks, return_exceptions=True)

            # Count successes
            total_products = 0
            errors: list[str] = []
            for i, result in enumerate(all_results):
                if isinstance(result, Exception):
                    scraper_name = scrapers_to_run[i].retailer_name
                    logger.error("Scraper %s raised: %s", scraper_name, result)
                    errors.append(f"{scraper_name}: {result}")
                elif isinstance(result, list):
                    total_products += len(result)

            # If no real results, log a warning (mock fallback removed)
            if total_products == 0 and not settings.debug:
                logger.warning(
                    "All scrapers returned 0 results for job %d (vehicle=%d, category=%d)",
                    job_id, job.vehicle_id, job.upgrade_category_id,
                )

            # Update job status
            job.status = "completed" if total_products > 0 else "failed"
            if errors and total_products == 0:
                job.error_message = "; ".join(errors[:3])
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()

            logger.info(
                "ScrapeJob %d completed: %d products from %d scrapers",
                job_id,
                total_products,
                len(scrapers_to_run),
            )

    async def _run_scraper_isolated(
        self,
        scraper: BaseScraper,
        query: str,
        vehicle: Vehicle,
        job: ScrapeJob,
    ) -> list[ScrapedProduct]:
        """Run a single scraper with its own DB session to avoid concurrent session issues."""
        try:
            products = await scraper.search(
                query=query,
                vehicle_year=vehicle.year,
                vehicle_make=vehicle.make,
                vehicle_model=vehicle.model,
                vehicle_engine=vehicle.engine_type,
            )
        except Exception:
            logger.exception("Scraper %s failed for job %d", scraper.retailer_name, job.id)
            raise

        if not products:
            return []

        # Limit results per retailer
        products = products[: settings.scrape_max_results_per_retailer]

        expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.scrape_cache_ttl_hours)

        async with async_session() as db:
            for product in products:
                result = ScrapeResult(
                    vehicle_id=job.vehicle_id,
                    upgrade_category_id=job.upgrade_category_id,
                    retailer=product.retailer,
                    product_name=product.product_name,
                    price=product.price,
                    currency=product.currency,
                    rating=product.rating,
                    review_count=product.review_count,
                    image_url=product.image_url,
                    product_url=product.product_url,
                    seller_name=product.seller_name,
                    shipping_estimate=product.shipping_estimate,
                    fitment_confidence=product.fitment_confidence,
                    expires_at=expires_at,
                )
                db.add(result)

            await db.commit()
        return products


scraping_service = ScrapingService()
