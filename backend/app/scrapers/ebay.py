import asyncio
import logging
from urllib.parse import quote_plus

import httpx
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper, ScrapedProduct, compute_fitment_confidence

logger = logging.getLogger(__name__)


class EbayScraper(BaseScraper):
    """Scrapes eBay search results for auto parts."""

    retailer_name = "eBay"
    base_url = "https://www.ebay.com"
    rate_limit_seconds = 2.0

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    }

    async def search(
        self,
        query: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
        vehicle_engine: str | None = None,
    ) -> list[ScrapedProduct]:
        """Search eBay for auto parts matching the vehicle and query."""
        search_query = f"{vehicle_year} {vehicle_make} {vehicle_model} {query}"
        if vehicle_engine:
            search_query += f" {vehicle_engine}"

        encoded = quote_plus(search_query)
        # eBay Motors parts category = 6000
        url = f"{self.base_url}/sch/i.html?_nkw={encoded}&_sacat=6000&_from=R40&rt=nc"

        await asyncio.sleep(self.rate_limit_seconds)

        try:
            response = await self._fetch_with_retry(url, self.HEADERS)
        except httpx.HTTPError as exc:
            logger.warning("eBay request failed: %s", exc)
            return []

        products = self._parse_results(response.text)
        for p in products:
            p.fitment_confidence = compute_fitment_confidence(
                p.product_name, vehicle_year, vehicle_make, vehicle_model, vehicle_engine,
            )
        return products

    def _parse_results(self, html: str) -> list[ScrapedProduct]:
        """Parse eBay search results HTML into ScrapedProduct list."""
        products: list[ScrapedProduct] = []
        soup = BeautifulSoup(html, "html.parser")

        # eBay uses .s-item for search result items
        items = soup.select(".s-item")
        for item in items[:20]:
            try:
                product = self._parse_single_result(item)
                if product:
                    products.append(product)
            except Exception as exc:  # noqa: BLE001
                logger.debug("Failed to parse eBay result: %s", exc)
                continue

        return products

    def _parse_single_result(self, item) -> ScrapedProduct | None:
        """Extract product data from a single eBay search result."""
        # Product name
        title_el = item.select_one(".s-item__title")
        if not title_el:
            return None
        name = title_el.get_text(strip=True)
        # Skip the "Shop on eBay" placeholder items
        if name.lower().startswith("shop on ebay"):
            return None

        # Product URL
        link_el = item.select_one(".s-item__link")
        product_url = link_el.get("href", "") if link_el else ""

        # Price
        price_el = item.select_one(".s-item__price")
        if not price_el:
            return None
        price_text = price_el.get_text(strip=True)
        try:
            # Handle "to" ranges like "$29.99 to $49.99" — take the lower price
            cleaned = price_text.replace("$", "").replace(",", "")
            if " to " in cleaned.lower():
                cleaned = cleaned.lower().split(" to ")[0].strip()
            price = float(cleaned)
        except ValueError:
            return None

        # Seller info
        seller_el = item.select_one(".s-item__seller-info-text")
        seller_name = seller_el.get_text(strip=True) if seller_el else None

        # Shipping
        shipping_el = item.select_one(".s-item__shipping, .s-item__freeXDays")
        shipping = shipping_el.get_text(strip=True) if shipping_el else None

        # Image
        img_el = item.select_one(".s-item__image-wrapper img")
        image_url = img_el.get("src") if img_el else None

        return ScrapedProduct(
            retailer=self.retailer_name,
            product_name=name,
            price=price,
            image_url=image_url,
            product_url=product_url,
            seller_name=seller_name,
            shipping_estimate=shipping,
        )

    async def verify_fitment(
        self,
        product_url: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
    ) -> float:
        """Verify fitment for an eBay listing.

        eBay parts compatibility is listed on the item page. A full
        implementation would fetch the page and check the compatibility table.
        """
        return 0.3
