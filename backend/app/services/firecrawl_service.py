"""Firecrawl-powered aftermarket parts search service."""

import logging
from typing import Any

from firecrawl import FirecrawlApp

from app.config import settings

logger = logging.getLogger(__name__)


class FirecrawlService:
    """Wraps the Firecrawl /search endpoint to find aftermarket Corvette parts."""

    def __init__(self) -> None:
        self._app: FirecrawlApp | None = None

    @property
    def app(self) -> FirecrawlApp:
        if self._app is None:
            self._app = FirecrawlApp(api_key=settings.firecrawl_api_key)
        return self._app

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
                entry = {
                    "name": item.get("title") or item.get("name") or "",
                    "price": item.get("price"),
                    "url": item.get("url") or item.get("link") or "",
                    "source": _extract_domain(item.get("url") or item.get("link") or ""),
                    "description": item.get("description") or item.get("snippet") or "",
                    "image_url": item.get("image_url") or item.get("image") or None,
                }
            elif hasattr(item, "url"):
                # SDK object with attributes
                entry = {
                    "name": getattr(item, "title", "") or getattr(item, "name", "") or "",
                    "price": getattr(item, "price", None),
                    "url": getattr(item, "url", "") or "",
                    "source": _extract_domain(getattr(item, "url", "") or ""),
                    "description": getattr(item, "description", "") or getattr(item, "snippet", "") or "",
                    "image_url": getattr(item, "image_url", None) or getattr(item, "image", None),
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
