import asyncio
import logging
from urllib.parse import quote_plus

import httpx
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper, ScrapedProduct, compute_fitment_confidence

logger = logging.getLogger(__name__)


class GoogleShoppingScraper(BaseScraper):
    """Scrapes Google Shopping results for auto parts.

    NOTE: Google Shopping results are heavily JS-rendered. This httpx-based
    implementation hits the non-JS endpoint and may return limited results.
    A production upgrade would use Playwright for full JS rendering.
    """

    retailer_name = "Google Shopping"
    base_url = "https://www.google.com"
    rate_limit_seconds = 3.0

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    async def search(
        self,
        query: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
        vehicle_engine: str | None = None,
    ) -> list[ScrapedProduct]:
        """Search Google Shopping for auto parts."""
        search_query = f"{vehicle_year} {vehicle_make} {vehicle_model} {query}"
        if vehicle_engine:
            search_query += f" {vehicle_engine}"

        encoded = quote_plus(search_query)
        # tbm=shop triggers shopping results
        url = f"{self.base_url}/search?q={encoded}&tbm=shop"

        await asyncio.sleep(self.rate_limit_seconds)

        try:
            response = await self._fetch_with_retry(url, self.HEADERS)
        except httpx.HTTPError as exc:
            logger.warning("Google Shopping request failed: %s", exc)
            return []

        products = self._parse_results(response.text)
        for p in products:
            p.fitment_confidence = compute_fitment_confidence(
                p.product_name, vehicle_year, vehicle_make, vehicle_model, vehicle_engine,
            )
        return products

    def _parse_results(self, html: str) -> list[ScrapedProduct]:
        """Parse Google Shopping results HTML.

        Google Shopping's HTML structure changes frequently. This parser
        targets the common non-JS rendered structure with shopping cards.
        """
        products: list[ScrapedProduct] = []
        soup = BeautifulSoup(html, "html.parser")

        # Google Shopping cards are typically in divs with class "sh-dgr__content"
        # or similar. The structure varies, so we try multiple selectors.
        cards = soup.select(".sh-dgr__content")
        if not cards:
            # Fallback: try the grid-based layout
            cards = soup.select("[data-docid]")
        if not cards:
            # Another fallback for different rendering
            cards = soup.select(".sh-dlr__list-result")

        for card in cards[:20]:
            try:
                product = self._parse_single_result(card)
                if product:
                    products.append(product)
            except Exception as exc:  # noqa: BLE001
                logger.debug("Failed to parse Google Shopping result: %s", exc)
                continue

        return products

    def _parse_single_result(self, card) -> ScrapedProduct | None:
        """Extract product data from a single Google Shopping card."""
        # Product name — typically in an h3 or a link with specific class
        title_el = card.select_one("h3") or card.select_one(".tAxDx") or card.select_one("a")
        if not title_el:
            return None
        name = title_el.get_text(strip=True)
        if not name:
            return None

        # Product URL
        link_el = card.select_one("a[href]")
        href = link_el.get("href", "") if link_el else ""
        if href.startswith("/"):
            product_url = f"{self.base_url}{href}"
        else:
            product_url = href

        # Price
        price_el = card.select_one(".a8Pemb") or card.select_one("[aria-label*='$']")
        if not price_el:
            # Try finding any element with a dollar sign
            for el in card.find_all(string=True):
                text = str(el).strip()
                if "$" in text:
                    try:
                        cleaned = text.replace("$", "").replace(",", "").split()[0]
                        price = float(cleaned)
                        break
                    except ValueError:
                        continue
            else:
                return None
        else:
            try:
                price_text = price_el.get_text(strip=True)
                cleaned = price_text.replace("$", "").replace(",", "")
                price = float(cleaned)
            except ValueError:
                return None

        # Rating
        rating = None
        rating_el = card.select_one("[aria-label*='out of 5']")
        if rating_el:
            try:
                label = rating_el.get("aria-label", "")
                rating = float(label.split()[0])
            except (ValueError, IndexError):
                pass

        # Seller name
        seller_el = card.select_one(".aULzUe") or card.select_one(".IuHnof")
        seller_name = seller_el.get_text(strip=True) if seller_el else None

        # Image
        img_el = card.select_one("img")
        image_url = img_el.get("src") if img_el else None

        return ScrapedProduct(
            retailer=self.retailer_name,
            product_name=name,
            price=price,
            rating=rating,
            image_url=image_url,
            product_url=product_url,
            seller_name=seller_name,
        )

    async def verify_fitment(
        self,
        product_url: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
    ) -> float:
        """Google Shopping doesn't provide fitment data directly.

        Returns a low confidence score. A production implementation would
        follow the product URL to the actual retailer and check there.
        """
        return 0.1
