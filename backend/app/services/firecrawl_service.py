"""Firecrawl-powered aftermarket parts search service."""

import logging
import re
from typing import Any

import httpx
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


# Regex to extract the first image URL from markdown content
_MD_IMAGE_RE = re.compile(r'!\[.*?\]\((https?://[^\s)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s)]*)?)\)', re.I)
_HTML_IMG_RE = re.compile(r'<img[^>]+src=["\']?(https?://[^\s"\'>\)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"\'>\)]*)?)', re.I)


def _extract_image(item: dict, metadata: dict) -> str | None:
    """Extract image URL from a dict-based Firecrawl result."""
    img = (
        item.get("image_url")
        or item.get("image")
        or item.get("thumbnail")
        or metadata.get("og:image")
        or metadata.get("ogImage")
        or metadata.get("og_image")
        or metadata.get("image")
    )
    if img:
        return img
    # Fallback: extract first image from scraped markdown/html content
    return _extract_image_from_content(item.get("markdown") or item.get("html") or "")


def _extract_image_from_obj(item: object, metadata: dict | object) -> str | None:
    """Extract image URL from an SDK object-based Firecrawl result."""
    img = (
        getattr(item, "image_url", None)
        or getattr(item, "image", None)
        or getattr(item, "thumbnail", None)
    )
    if img:
        return img
    # Try metadata dict/object keys
    if isinstance(metadata, dict):
        img = (
            metadata.get("og:image")
            or metadata.get("ogImage")
            or metadata.get("og_image")
            or metadata.get("image")
        )
    else:
        img = (
            getattr(metadata, "og_image", None)
            or getattr(metadata, "ogImage", None)
            or getattr(metadata, "image", None)
        )
    if img:
        return img
    # Fallback: extract first image from scraped markdown/html content
    content = getattr(item, "markdown", None) or getattr(item, "html", None) or ""
    return _extract_image_from_content(content)


def _extract_image_from_content(content: str) -> str | None:
    """Pull the first product image URL from markdown or HTML content."""
    if not content:
        return None
    # Try markdown image syntax first
    m = _MD_IMAGE_RE.search(content)
    if m:
        url = m.group(1)
        # Skip tiny icons, tracking pixels, SVGs in URL
        if not any(skip in url.lower() for skip in ['icon', 'logo', '1x1', 'pixel', 'tracking', '.svg']):
            return url
    # Try HTML img src
    m = _HTML_IMG_RE.search(content)
    if m:
        url = m.group(1)
        if not any(skip in url.lower() for skip in ['icon', 'logo', '1x1', 'pixel', 'tracking', '.svg']):
            return url
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

    async def _search_with_scrape(self, query: str, limit: int) -> list[dict[str, Any]]:
        """Call Firecrawl REST API directly with scrapeOptions for og:image metadata.

        The Python SDK v4.21 silently drops scrape_options, so we bypass it.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.firecrawl.dev/v1/search",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.firecrawl_api_key}",
                },
                json={
                    "query": query,
                    "limit": min(limit, 10),
                    "scrapeOptions": {"formats": ["markdown"], "onlyMainContent": True},
                    "timeout": 20000,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        if not data.get("success"):
            logger.warning("Firecrawl search returned success=false: %s", data.get("error"))
            return []

        results: list[dict[str, Any]] = []
        for item in data.get("data", []):
            name = item.get("title", "")
            desc = item.get("description", "")
            url = item.get("url", "")
            metadata = item.get("metadata", {}) or {}
            markdown = item.get("markdown", "") or ""

            image = (
                metadata.get("og:image")
                or metadata.get("ogImage")
                or _extract_image_from_content(markdown)
            )

            results.append({
                "name": name,
                "price": _extract_price(
                    metadata.get("product:price:amount", "")
                    or f"{name} {desc}"
                ),
                "url": url,
                "source": _extract_domain(url),
                "description": desc,
                "image_url": image,
            })

        return results

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
        base_parts.append("buy price upgrade")
        search_query = " ".join(base_parts)

        all_results: list[dict[str, Any]] = []

        try:
            logger.info("Firecrawl competitive search: %s (limit=%d)", search_query, limit)
            all_results = await self._search_with_scrape(search_query, limit)
        except Exception:
            logger.warning("REST search with scrape failed, falling back to SDK")
            try:
                raw = self.app.search(search_query, limit=limit)
                all_results = self._parse_results(raw)
            except Exception:
                logger.exception("Firecrawl competitive search failed: %s", search_query)

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
            return await self._search_with_scrape(search_query, limit)
        except Exception:
            logger.warning("REST search with scrape failed, falling back to SDK")
            try:
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
                    "image_url": _extract_image(item, metadata),
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
                    "image_url": _extract_image_from_obj(item, metadata),
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
