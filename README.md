# MyVette

**A Corvette-only 3D configurator and aftermarket marketplace.**

Live: [myvette.vercel.app](https://myvette.vercel.app)

Not a generic car app. Built for Corvette owners who want to see what mods exist for their specific generation, how each mod affects performance, and where to buy it. Covers C3 through C8.

---

## What It Does

- **Interactive 3D viewer** for all 6 generations of Corvette (C3 Stingray through C8 Stingray). GLB models served from Cloudflare R2 CDN.
- **Normal and X-ray modes** with per-part isolation. Click a part category and the car splits into a main view plus an isolated-mesh viewer of just that component.
- **Parts panel with RPG-style stat bars** showing per-generation stock specs and upgrade deltas (HP, torque, 0-60, weight).
- **Sub-component taxonomy** -- 4-level hierarchy with generation-specific filtering. Clicking a sub-component builds a targeted search query (e.g., "C8 Corvette CHE trunnion upgrade").
- **Competitive marketplace search** powered by Firecrawl across Summit Racing, Corvette Central, Zip Corvette, Paragon, Mid America Motorworks, eBay Motors, Amazon, and CARiD. Products render with thumbnails, prices, and retailer source.
- **AI upgrade analysis** via Claude Haiku. Given a product and the user's generation, it estimates HP/weight/0-60 impact ranges with reasoning.
- **Color studio** with OEM color palettes per generation.

---

## Architecture

```
Frontend (Vercel)              Backend (Railway)             CDN (Cloudflare R2)
---------------                -----------------             -------------------
React + Vite                   FastAPI (async)               GLB models for all 6
TypeScript                     SQLAlchemy                    generations, served
React Three Fiber              Anthropic SDK (Claude)        with public CORS
Tailwind CSS                   Firecrawl SDK
                               httpx REST clients
```

**Frontend**
- React + Vite + TypeScript
- React Three Fiber / Three.js for the 3D scene
- Tailwind CSS with a Corvette-red dark theme
- Axios with snake_case <-> camelCase interceptors so backend stays snake_case and frontend stays camelCase

**Backend**
- FastAPI + async SQLAlchemy
- Firecrawl for competitive parts search (REST API direct, not SDK, to access scrape options)
- Anthropic Claude Haiku for upgrade impact analysis
- Curated registry for pre-verified 3D models (skips the AI generation pipeline)

**Infrastructure**
- Frontend deployed on Vercel
- Backend deployed on Railway
- 3D models hosted on Cloudflare R2 with unrestricted CORS for browser fetches

---

## Data Model

The depth of parts data is the product. Key static data:

- `corvette-sub-components.ts` -- 1,713-line taxonomy covering 16 top-level part categories (engine, transmission, suspension, brakes, exhaust, tires/wheels, air intake, ECU/electronics, turbo/supercharger, fuel system, cooling, steering, body shell, interior, lights, glass) with sub-components filtered by generation.
- `corvette-mesh-maps.ts` -- per-generation GLB node name to zone mapping, so the X-ray and part isolation features know which meshes belong to which categories.
- `corvette-part-impacts.ts` -- HP / weight / 0-60 impact ranges per part per generation.
- `corvette-generations.ts` -- stock specs (HP, torque, weight, engine, transmission) per generation.
- `corvette-colors.ts` -- OEM color palettes.

---

## Notable Engineering

- **Production URL switching** via `import.meta.env.PROD` in both `client.ts` (API base) and `corvette-generations.ts` (model URLs). Same codebase, different endpoints in dev vs prod.
- **GLB mesh name normalization** -- GLB format strips dots and uses underscores, mesh maps use spaces and dots. A `normalizeName()` helper reconciles them so X-ray mode actually works.
- **Cache-busting GLB loader** -- two Three.js scenes load the same GLB but need separate caches, so the isolated part viewer appends `#partviewer` to force a distinct `useGLTF` cache entry.
- **Firecrawl REST over SDK** -- Firecrawl's Python SDK silently drops `scrapeOptions`, so the backend hits the REST API directly to get `og:image` metadata for marketplace thumbnails.

---

## Running Locally

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

Backend runs on port 8001. Vite proxies `/api/*` to the backend. You will need `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and `FIRECRAWL_API_KEY` in `backend/.env`.

---

## Status

MVP shipped. Active development on:
- Graceful disabling of X-ray / part isolation for generations without named meshes (C3, C5 have generic Blender names)
- Competitive pricing UI (same part across multiple retailers side by side)
- Product image reliability (some retailers block `og:image` via referer checks)
- UI polish on the glass-tab marketplace panel

---

Built by [@gcgpickering](https://github.com/gcgpickering).
