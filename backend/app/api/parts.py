from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.part import PartType, VehiclePart, UpgradeCategory
from app.schemas.part import PartTypeResponse, VehiclePartResponse, UpgradeCategoryResponse

router = APIRouter(prefix="/parts", tags=["parts"])


@router.get("/types", response_model=list[PartTypeResponse])
async def get_part_types(db: AsyncSession = Depends(get_db)):
    """Get all part types with education content."""
    result = await db.execute(select(PartType).order_by(PartType.name))
    return result.scalars().all()


@router.get("/types/{slug}", response_model=PartTypeResponse)
async def get_part_type(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a specific part type by slug."""
    result = await db.execute(select(PartType).where(PartType.slug == slug))
    part_type = result.scalar_one_or_none()
    if not part_type:
        raise HTTPException(status_code=404, detail="Part type not found")
    return part_type


@router.get("/vehicle/{vehicle_id}", response_model=list[VehiclePartResponse])
async def get_vehicle_parts(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    """Get all parts for a specific vehicle."""
    result = await db.execute(
        select(VehiclePart)
        .where(VehiclePart.vehicle_id == vehicle_id)
        .options(selectinload(VehiclePart.part_type))
    )
    return result.scalars().all()


@router.get("/vehicle/{vehicle_id}/{slug}", response_model=VehiclePartResponse)
async def get_vehicle_part(
    vehicle_id: int, slug: str, db: AsyncSession = Depends(get_db)
):
    """Get a specific part for a vehicle by part type slug."""
    result = await db.execute(
        select(VehiclePart)
        .join(PartType)
        .where(VehiclePart.vehicle_id == vehicle_id, PartType.slug == slug)
        .options(selectinload(VehiclePart.part_type))
    )
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Vehicle part not found")
    return part


@router.get("/upgrades/{slug}", response_model=list[UpgradeCategoryResponse])
async def get_upgrade_categories(slug: str, db: AsyncSession = Depends(get_db)):
    """Get upgrade categories for a part type."""
    result = await db.execute(
        select(UpgradeCategory)
        .join(PartType)
        .where(PartType.slug == slug)
        .order_by(UpgradeCategory.name)
    )
    return result.scalars().all()


@router.get("/positions")
async def get_part_positions(
    make: str = Query(...),
    model: str = Query(...),
    year: int = Query(...),
    trim: str = Query(""),
    db: AsyncSession = Depends(get_db),
):
    """Get part positions for a vehicle (cached or AI-researched)."""
    from app.services.part_position_service import part_position_service
    result = await part_position_service.get_positions(db, make, model, year, trim)
    return result
