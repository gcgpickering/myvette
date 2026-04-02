"""Firecrawl-powered aftermarket parts search service."""

import logging
import re
from typing import Any

from firecrawl import FirecrawlApp

from app.config import settings

logger = logging.getLogger(__name__)

# Regex patterns for extracting prices from text
_PRICE_PATTERNS = [
    re.compile(r'\$\s?([\d,]+\.?\d{0,2})'),           # $1,234.56 or $99
    re.compile(r'(?:USD|Price:?)\s*\$?([\d,]+\.?\d{0,2})', re.I),
    re.compile(r'(?:from|starting at|only)\s+\$?([\d,]+\.?\d{0,2})', re.I),
]


def _extract_price(text: str) -> float | None:
    """Try to pull a USD price from a text string."""
    for pat in _PRICE_PATTERNS:
        m = pat.search(text)
        if m:
            try:
                return float(m.group(1).replace(",", ""))
            except ValueError:
                continue
    return None


# Key Corvette aftermarket retailers for competitive pricing
CORVETTE_RETAILERS = [
    {"name": "Summit Racing", "domain": "summitracing.com"},
    {"name": "Corvette Central", "domain": "corvettecentral.com"},
    {"name": "Paragon Corvette", "domain": "parfrp.com"},
    {"name": "Zip Corvette", "domain": "zip-corvette.com"},
    {"name": "Mid America Motorworks", "domain": "mamotorworks.com"},
    {"name": "eBay Motors", "domain": "ebay.com"},
    {"name": "Amazon", "domain": "amazon.com"},
    {"name": "CARiD", "domain": "carid.com"},
]


class FirecrawlService:
    """Wraps the Firecrawl /search endpoint to find aftermarket Corvette parts."""

    def __init__(self) -> None:
        self._app: FirecrawlApp | None = None

    @property
    def app(self) -> FirecrawlApp:
        if self._app is None:
            self._app = FirecrawlApp(api_key=settings.firecrawl_api_key)
        return self._app

    async def search_parts_competitive(
        self,
        query: str,
        generation: str = "",
        part_category: str = "",
        limit: int = 16,
    ) -> list[dict[str, Any]]:
        """Search multiple Corvette retailers for price comparison.

        Uses site:-scoped queries to get results from specific retailers,
        then merges with a general search for broader coverage.
        """
        if not settings.firecrawl_api_key:
            logger.warning("FIRECRAWL_API_KEY is not set; skipping search")
            return []

        base_parts = ["corvette"]
        if generation:
            base_parts.append(generation)
        base_parts.append(query)
        if part_category and part_category.lower() not in query.lower():
            base_parts.append(part_category)
        base_query = " ".join(base_parts)

        # Build a site-scoped query targeting top retailers
        retailer_domains = " OR ".join(
            f"site:{r['domain']}" for r in CORVETTE_RETAILERS
        )
        scoped_query = f"{base_query} buy price ({retailer_domains})"

        all_results: list[dict[str, Any]] = []

        try:
            logger.info("Firecrawl competitive search: %s (limit=%d)", scoped_query, limit)
            raw = self.app.search(scoped_query, limit=limit)
            all_results.extend(self._parse_results(raw))
        except Exception:
            logger.exception("Firecrawl competitive search failed: %s", scoped_query)

        # Deduplicate by URL
        seen_urls: set[str] = set()
        deduped: list[dict[str, Any]] = []
        for r in all_results:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                deduped.append(r)

        # Sort: items with prices first, then by price ascending
        deduped.sort(key=lambda x: (x["price"] is None, x["price"] or 0))
        return deduped

    async def search_parts(
        self,
        query: str,
        generation: str = "",
        part_category: str = "",
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Search for aftermarket Corvette parts using Firecrawl.

        Args:
            query: Free-text search query (e.g. "cold air intake").
            generation: Corvette generation filter (e.g. "c8", "c7").
            part_category: Part category filter (e.g. "engine", "exhaust").
            limit: Maximum number of results to return.

        Returns:
            List of dicts with keys: name, price, url, source, description, image_url.
            Returns an empty list on any failure.
        """
        if not settings.firecrawl_api_key:
            logger.warning("FIRECRAWL_API_KEY is not set; skipping search")
            return []

        # Build a targeted search query for specific product listings (not category pages)
        parts = ["corvette"]
        if generation:
            parts.append(generation)
        parts.append(query)
        if part_category and part_category.lower() not in query.lower():
            parts.append(part_category)
        parts.append("buy price upgrade")
        search_query = " ".join(parts)

        try:
            logger.info("Firecrawl search: %s (limit=%d)", search_query, limit)
            result = self.app.search(search_query, limit=limit)

            return self._parse_results(result)
        except Exception:
            logger.exception("Firecrawl search failed for query: %s", search_query)
            return []

    @staticmethod
    def _parse_results(raw: Any) -> list[dict[str, Any]]:
        """Normalise Firecrawl search results into a consistent shape."""
        results: list[dict[str, Any]] = []

        # The SDK v2 returns a SearchData with `.web` list
        items = []
        if hasattr(raw, "web") and isinstance(raw.web, list):
            items = raw.web
        elif hasattr(raw, "data") and isinstance(raw.data, list):
            items = raw.data
        elif isinstance(raw, dict):
            items = raw.get("web", []) or raw.get("data", [])
        elif isinstance(raw, list):
            items = raw

        for item in items:
            if isinstance(item, dict):
                name = item.get("title") or item.get("name") or ""
                desc = item.get("description") or item.get("snippet") or ""
                url = item.get("url") or item.get("link") or ""
                metadata = item.get("metadata") or {}
                entry = {
                    "name": name,
                    "price": item.get("price") or _extract_price(f"{name} {desc}"),
                    "url": url,
                    "source": _extract_domain(url),
                    "description": desc,
                    "image_url": (
                        item.get("image_url")
                        or item.get("image")
                        or metadata.get("og:image")
                        or metadata.get("ogImage")
                        or None
                    ),
                }
            elif hasattr(item, "url"):
                # SDK object with attributes
                name = getattr(item, "title", "") or getattr(item, "name", "") or ""
                desc = getattr(item, "description", "") or getattr(item, "snippet", "") or ""
                url = getattr(item, "url", "") or ""
                metadata = getattr(item, "metadata", {}) or {}
                entry = {
                    "name": name,
                    "price": getattr(item, "price", None) or _extract_price(f"{name} {desc}"),
                    "url": url,
                    "source": _extract_domain(url),
                    "description": desc,
                    "image_url": (
                        getattr(item, "image_url", None)
                        or getattr(item, "image", None)
                        or (metadata.get("og:image") if isinstance(metadata, dict) else None)
                        or (metadata.get("ogImage") if isinstance(metadata, dict) else None)
                        or None
                    ),
                }
            else:
                continue

            if entry["url"]:
                results.append(entry)

        return results


def _extract_domain(url: str) -> str:
    """Pull the domain name from a URL for the 'source' field."""
    try:
        from urllib.parse import urlparse
        host = urlparse(url).netloc
        # Strip www.
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return ""


# Module-level singleton
firecrawl_service = FirecrawlService()
