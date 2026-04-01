import asyncio
import hashlib
import random

from app.scrapers.base import BaseScraper, ScrapedProduct


# Realistic product templates keyed by common part keywords
_BRAND_POOLS = {
    "brake": ["Brembo", "EBC", "StopTech", "Hawk", "Power Stop", "ACDelco", "Wagner"],
    "exhaust": ["Borla", "MagnaFlow", "Flowmaster", "Corsa", "AWE Tuning", "Invidia"],
    "intake": ["K&N", "AEM", "Injen", "S&B Filters", "aFe Power", "Spectre"],
    "suspension": ["Bilstein", "KW", "Eibach", "Tein", "BC Racing", "Koni"],
    "turbo": ["Garrett", "BorgWarner", "Precision Turbo", "Turbonetics", "HKS"],
    "oil": ["Mobil 1", "Royal Purple", "Castrol", "Pennzoil", "Valvoline", "Amsoil"],
    "spark": ["NGK", "Denso", "Bosch", "ACDelco", "Autolite", "Champion"],
    "filter": ["K&N", "Wix", "Fram", "Bosch", "Mann-Filter", "Purolator"],
    "coilover": ["BC Racing", "KW", "Fortune Auto", "Tein", "Bilstein", "Ohlins"],
    "wheel": ["Enkei", "BBS", "Volk Racing", "Konig", "Titan 7", "Gram Lights"],
    "tire": ["Michelin", "Continental", "Bridgestone", "Pirelli", "Goodyear", "Toyo"],
    "default": ["Dorman", "Moog", "Duralast", "ACDelco", "Denso", "Bosch"],
}

_CONDITION_MODIFIERS = ["Performance", "Premium", "OEM Replacement", "Racing", "Street"]


def _deterministic_seed(query: str, index: int) -> int:
    """Generate a deterministic seed from query + index for reproducible results."""
    h = hashlib.md5(f"{query}:{index}".encode()).hexdigest()
    return int(h[:8], 16)


def _pick_brands(query: str) -> list[str]:
    """Pick the brand pool most relevant to the query."""
    query_lower = query.lower()
    for keyword, brands in _BRAND_POOLS.items():
        if keyword in query_lower:
            return brands
    return _BRAND_POOLS["default"]


class MockScraper(BaseScraper):
    """Generates realistic demo results for testing and development.

    Results are deterministic per query so the same search always returns
    the same products (useful for caching and testing).
    """

    retailer_name = "Demo"
    base_url = "https://example.com"
    rate_limit_seconds = 0.0

    async def search(
        self,
        query: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
        vehicle_engine: str | None = None,
    ) -> list[ScrapedProduct]:
        """Generate 5-10 realistic mock products based on the query."""
        # Simulate a small delay as if we actually fetched data
        await asyncio.sleep(0.3)

        full_query = f"{vehicle_year} {vehicle_make} {vehicle_model} {query}"
        brands = _pick_brands(query)

        seed = _deterministic_seed(full_query, 0)
        rng = random.Random(seed)
        count = rng.randint(5, 10)

        products: list[ScrapedProduct] = []
        for i in range(count):
            item_rng = random.Random(_deterministic_seed(full_query, i))
            brand = item_rng.choice(brands)
            modifier = item_rng.choice(_CONDITION_MODIFIERS)
            price = round(item_rng.uniform(25.0, 450.0), 2)
            rating = round(item_rng.uniform(3.0, 5.0), 1)
            review_count = item_rng.randint(10, 5000)

            product_name = (
                f"{brand} {modifier} {query.title()} - "
                f"{vehicle_year} {vehicle_make} {vehicle_model}"
            )

            products.append(
                ScrapedProduct(
                    retailer=self.retailer_name,
                    product_name=product_name,
                    price=price,
                    currency="USD",
                    rating=rating,
                    review_count=review_count,
                    image_url=f"https://placehold.co/300x300?text={brand.replace(' ', '+')}",
                    product_url=f"https://example.com/product/demo-{i}-{brand.lower().replace(' ', '-')}",
                    seller_name=f"{brand} Official Store",
                    shipping_estimate=item_rng.choice(
                        ["Free shipping", "2-3 business days", "$5.99 shipping", "Prime - free 2-day"]
                    ),
                    fitment_confidence=round(item_rng.uniform(0.6, 1.0), 2),
                )
            )

        return products

    async def verify_fitment(
        self,
        product_url: str,
        vehicle_year: int,
        vehicle_make: str,
        vehicle_model: str,
    ) -> float:
        """Mock fitment verification always returns high confidence."""
        return 0.85
