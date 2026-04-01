/**
 * Marketplace service — convenience wrapper around the marketplace API.
 *
 * Components can import from here instead of reaching into the api/ layer
 * directly.  The Firecrawl-powered search is the primary export.
 */

export { searchParts } from '../api/marketplace'
export type { PartSearchResult } from '../api/marketplace'
