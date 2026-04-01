from app.scrapers.amazon import AmazonScraper
from app.scrapers.ebay import EbayScraper
from app.scrapers.google_shopping import GoogleShoppingScraper
from app.scrapers.mock import MockScraper

ALL_SCRAPERS = [AmazonScraper(), EbayScraper(), GoogleShoppingScraper()]
MOCK_SCRAPER = MockScraper()

__all__ = [
    "AmazonScraper",
    "EbayScraper",
    "GoogleShoppingScraper",
    "MockScraper",
    "ALL_SCRAPERS",
    "MOCK_SCRAPER",
]
