import asyncio
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)


def compute_fitment_confidence(
    product_name: str,
    vehicle_year: int,
    vehicle_make: str,
    vehicle_model: str,
    vehicle_engine: str | None = None,
) -> float:
    """Score how well a product title matches the target vehicle (0.0-1.0)."""
    score = 0.0
    title_lower = product_name.lower()
    if str(vehicle_year) in product_name:
        score += 0.25
    if vehicle_make.lower() in title_lower:
        score += 0.25
    if vehicle_model.lower() in title_lower:
        score += 0.25
    if vehicle_engine and vehicle_engine.lower() in title_lower:
        score += 0.15
    if any(
        kw in title_lower
        for kw in ["direct fit", "exact fit", "oem", "oe replacement", "factory replacement"]
    ):
        score += 0.10
    return min(score, 1.0)


@dataclass
class ScrapedProduct:
    """Represents a product scraped from a retailer."""

    retailer: str
    product_name: str
    price: float
    currency: str = "USD"
    rating: float | None = None
    review_count: int | None = None
    image_url: str | None = None
    product_url: str = ""
    seller_name: str | None = None
    shipping_estimate: str | None = None
    fitment_confidence: float = 0.0


class BaseScraper(ABC):
    """Abstract base class for retailer scrapers."""

    retailer_name: str = "unknown"
    base_url: str = ""
    rate_limit_seconds: float = 2.0

    @abstractmethod
    async def search(
        self,
        query: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
        vehicle_engine: str | None = None,
    ) -> list[ScrapedProduct]:
        """Search for products matching the query and vehicle."""
        ...

    async def _fetch_with_retry(
        self,
        url: str,
        headers: dict,
        max_retries: int = 2,
        base_delay: float = 1.0,
        timeout: float = 15.0,
    ) -> httpx.Response:
        """Fetch a URL with exponential-backoff retry on transient errors."""
        last_exc: Exception | None = None
        for attempt in range(max_retries + 1):
            try:
                async with httpx.AsyncClient(
                    headers=headers, follow_redirects=True, timeout=timeout
                ) as client:
                    response = await client.get(url)
                    response.raise_for_status()
                    return response
            except httpx.HTTPError as exc:
                last_exc = exc
                if attempt < max_retries:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(
                        "%s attempt %d/%d failed (%s), retrying in %.1fs",
                        self.retailer_name, attempt + 1, max_retries + 1, exc, delay,
                    )
                    await asyncio.sleep(delay)
        raise last_exc  # type: ignore[misc]

    @abstractmethod
    async def verify_fitment(
        self,
        product_url: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
    ) -> float:
        """Verify product fitment, returns confidence 0.0-1.0."""
        ...
