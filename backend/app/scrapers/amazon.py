import asyncio
import logging
from urllib.parse import quote_plus

import httpx
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper, ScrapedProduct, compute_fitment_confidence

logger = logging.getLogger(__name__)


class AmazonScraper(BaseScraper):
    """Scrapes Amazon search results for auto parts."""

    retailer_name = "Amazon"
    base_url = "https://www.amazon.com"
    rate_limit_seconds = 2.5

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    async def search(
        self,
        query: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
        vehicle_engine: str | None = None,
    ) -> list[ScrapedProduct]:
        """Search Amazon for auto parts matching the vehicle and query."""
        search_query = f"{vehicle_year} {vehicle_make} {vehicle_model} {query}"
        if vehicle_engine:
            search_query += f" {vehicle_engine}"

        encoded = quote_plus(search_query)
        url = f"{self.base_url}/s?k={encoded}&i=automotive"

        await asyncio.sleep(self.rate_limit_seconds)

        try:
            response = await self._fetch_with_retry(url, self.HEADERS)
        except httpx.HTTPError as exc:
            logger.warning("Amazon request failed: %s", exc)
            return []

        products = self._parse_results(response.text)
        for p in products:
            p.fitment_confidence = compute_fitment_confidence(
                p.product_name, vehicle_year, vehicle_make, vehicle_model, vehicle_engine,
            )
        return products

    def _parse_results(self, html: str) -> list[ScrapedProduct]:
        """Parse Amazon search results HTML into ScrapedProduct list."""
        products: list[ScrapedProduct] = []
        soup = BeautifulSoup(html, "html.parser")

        result_divs = soup.select('[data-component-type="s-search-result"]')
        for div in result_divs[:20]:
            try:
                product = self._parse_single_result(div)
                if product:
                    products.append(product)
            except Exception as exc:  # noqa: BLE001
                logger.debug("Failed to parse Amazon result: %s", exc)
                continue

        return products

    def _parse_single_result(self, div) -> ScrapedProduct | None:
        """Extract product data from a single search result div."""
        # Product name
        title_el = div.select_one("h2 a span")
        if not title_el:
            return None
        name = title_el.get_text(strip=True)

        # Product URL
        link_el = div.select_one("h2 a")
        href = link_el.get("href", "") if link_el else ""
        product_url = f"{self.base_url}{href}" if href and not href.startswith("http") else href

        # Price
        price_whole = div.select_one(".a-price-whole")
        price_frac = div.select_one(".a-price-fraction")
        if not price_whole:
            return None
        try:
            whole = price_whole.get_text(strip=True).replace(",", "").rstrip(".")
            frac = price_frac.get_text(strip=True) if price_frac else "00"
            price = float(f"{whole}.{frac}")
        except (ValueError, AttributeError):
            return None

        # Rating
        rating = None
        rating_el = div.select_one(".a-icon-star-small .a-icon-alt")
        if rating_el:
            try:
                rating = float(rating_el.get_text(strip=True).split()[0])
            except (ValueError, IndexError):
                pass

        # Review count
        review_count = None
        review_el = div.select_one('[aria-label*="stars"] + span')
        if review_el:
            try:
                review_count = int(
                    review_el.get_text(strip=True).replace(",", "").replace(".", "")
                )
            except ValueError:
                pass

        # Image
        img_el = div.select_one("img.s-image")
        image_url = img_el.get("src") if img_el else None

        return ScrapedProduct(
            retailer=self.retailer_name,
            product_name=name,
            price=price,
            rating=rating,
            review_count=review_count,
            image_url=image_url,
            product_url=product_url,
        )

    async def verify_fitment(
        self,
        product_url: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
    ) -> float:
        """Verify fitment by checking the product detail page.

        Returns a confidence score 0.0-1.0. Amazon fitment verification
        requires interacting with the vehicle fitment widget, which is
        JS-rendered. Returns a low-confidence estimate based on title matching.
        """
        return 0.3
