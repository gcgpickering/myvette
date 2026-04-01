from datetime import datetime

from pydantic import BaseModel


class ScrapeResultResponse(BaseModel):
    id: int
    retailer: str
    product_name: str
    price: float
    currency: str
    rating: float | None = None
    review_count: int | None = None
    image_url: str | None = None
    product_url: str
    seller_name: str | None = None
    shipping_estimate: str | None = None
    fitment_confidence: float
    scraped_at: datetime

    model_config = {"from_attributes": True}


class ScrapeJobResponse(BaseModel):
    id: int
    vehicle_id: int
    upgrade_category_id: int
    status: str
    started_at: datetime | None = None
    completed_at: datetime | None = None
    error_message: str | None = None

    model_config = {"from_attributes": True}


class ScrapeRequest(BaseModel):
    vehicle_id: int
    upgrade_category_id: int
