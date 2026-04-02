# MyVette — CLI Agent Instructions

## What This Is
Corvette-only 3D configurator MVP. Not a generic car app — built for Corvette owners who want to see what mods exist for their specific generation and how each mod impacts performance. The depth of parts data IS the product. Deadline: Thursday night 2026-04-03.

## Architecture (DO NOT EXPLORE — use this map)

### Stack
- **Frontend**: React + TypeScript + React Three Fiber (Three.js) + Tailwind — Vite dev server
- **Backend**: FastAPI + async SQLAlchemy + Anthropic SDK + Firecrawl SDK
- **3D Models**: Sketchfab GLBs hosted on Cloudflare R2 CDN (production) / `backend/static/models/corvette/` (local dev, gitignored)
- **Ports (local)**: Backend = 8001, Vite proxy in `vite.config.ts` → 8001
- **Production URLs**:
  - Frontend: `https://myvette.vercel.app` (Vercel)
  - Backend API: `https://myvette-production.up.railway.app` (Railway)
  - 3D Models: `https://pub-6f765b566e324f15bd5134e7598e4824.r2.dev` (Cloudflare R2)

### Layout
- Top 55% = 3D car viewer (Normal + X-Ray modes)
- Bottom 45% = tab-based parts panel with RPG stat bars
- When a part tab is selected, top splits 60/40 — car left, isolated part mesh viewer right
- Right column of parts panel = sub-component picker (pill buttons) + marketplace cards (scrollable)

### File Map — READ THESE, DON'T SEARCH

#### Frontend Components
- `frontend/src/components/PartViewer/PartViewer.tsx` — 3D isolated part mesh viewer. OrbitControls inside IsolatedPart with ref, target = mesh center
- `frontend/src/components/PartsPanel/PartsPanel.tsx` — Tab bar + PartDetail (stat bars left, sub-component picker + marketplace right)
- `frontend/src/components/PartsPanel/MarketplaceSearch.tsx` — eBay-style product cards with AI analysis panels, thumbnails, prices, analyze buttons
- `frontend/src/components/CarModel/` — Main 3D car scene
- `frontend/src/components/ColorStudio/` — Color picker overlay
- `frontend/src/components/GenerationPicker/` — Landing page generation selector

#### Frontend Data (STATIC — no API calls needed)
- `frontend/src/data/corvette-sub-components.ts` — 1713 lines. 4-level taxonomy with generation-specific filtering. `getSubComponents(gen, slug)` returns grouped sub-components with search keywords
- `frontend/src/data/corvette-mesh-maps.ts` — GLB node name → zone mapping per generation
- `frontend/src/data/corvette-part-impacts.ts` — HP/weight/0-60 impact ranges per part per gen
- `frontend/src/data/corvette-generations.ts` — Stock specs, model URLs per generation. `MODEL_BASE` switches between R2 CDN (prod) and local static (dev)
- `frontend/src/data/corvette-colors.ts` — OEM color palettes

#### Frontend API Layer
- `frontend/src/api/marketplace.ts` — `searchParts()`, `analyzeUpgrade()` + interfaces
- `frontend/src/api/client.ts` — Axios with **auto snake_case↔camelCase interceptors**. Backend returns `image_url` → frontend sees `imageUrl`. ALL interfaces use camelCase. `API_BASE` switches between Railway URL (prod) and `/api` proxy (dev).

#### Backend Services
- `backend/app/services/firecrawl_service.py` — Firecrawl web search for parts
- `backend/app/services/upgrade_analyzer.py` — Claude Haiku upgrade impact analysis
- `backend/app/services/vehicle_service.py` — Vehicle data + existing Anthropic usage pattern
- `backend/app/services/curated_registry.py` — Curated parts registry

#### Backend API
- `backend/app/api/marketplace.py` — `GET /search` and `POST /analyze` endpoints
- `backend/app/api/corvettes.py` — Generation data endpoints
- `backend/app/api/parts.py` — Parts data endpoints

#### Config
- `backend/app/config.py` — Settings with `load_dotenv(override=True)` fix. Has `firecrawl_api_key` and `anthropic_api_key`
- `backend/.env` — API keys (gitignored)
- `frontend/vite.config.ts` — Proxy → 8001

## Git Identity — ALWAYS USE THESE
```
git config user.name "gcgpickering"
git config user.email "gcgpickering@gmail.com"
```
Before ANY commit, verify with `git config user.email`. If it says anything other than `gcgpickering@gmail.com`, fix it first. Vercel Hobby blocks deploys from unrecognized committers.

## Critical Conventions — FOLLOW THESE

1. **Axios interceptors auto-convert case**. Backend = snake_case, Frontend = camelCase. When writing TypeScript interfaces, use camelCase (`estimatedHpGain`, not `estimated_hp_gain`). When writing Python models, use snake_case.

2. **PartSlug values**: `engine`, `transmission`, `suspension`, `brakes`, `exhaust`, `tires-wheels`, `air-intake`, `ecu-electronics`, `turbo-supercharger`, `fuel-system`, `cooling-system`, `steering`, `body-shell`, `interior`, `lights`, `glass`

3. **GLB mesh normalization**: GLB uses underscores + strips dots (`62L_LT2_V8`), mesh maps use spaces + dots (`6.2L LT2 V8`). `normalizeName()` in PartViewer handles this.

4. **Cache-buster**: PartViewer uses `useGLTF(modelUrl + '#partviewer')` to get separate GLTF cache from CarScene.

5. **Styling**: Dark theme, Corvette red accents (`rgba(196,30,42,...)`), `DM Mono` monospace font, RPG stat bar aesthetic. Hover effects use red border glow. Cards use staggered fade-in animations.

6. **Sub-components drive search**: When user clicks a sub-component pill, its `keywords[]` array builds the marketplace search query (e.g., "C8 Corvette CHE trunnion upgrade" not just "Engine").

## Token Conservation Rules

**DO NOT:**
- Run `find` or `grep` across the whole repo to "understand the codebase" — the file map above IS the codebase understanding
- Read files you don't need to edit
- Explore `node_modules/`, `__pycache__/`, or `backend/static/models/`
- Re-read data files (`corvette-sub-components.ts`, `corvette-mesh-maps.ts`, etc.) unless editing them — they are large static data
- Run `git log` or `git diff` unless committing

**DO:**
- Go straight to the file you need using the file map above
- Read only the specific file you're about to edit
- Make targeted edits, not full file rewrites
- Use `npx tsc --noEmit` to verify TypeScript after frontend changes
- Use `curl localhost:8001/api/...` to verify backend endpoints

## The 6 Corvette Generations
1. **C3 Stingray (1968-1982)** — 350ci SBC, 300hp
2. **C4 (1984-1996)** — 5.7L L98 V8, 245hp
3. **C5 (1997-2004)** — 5.7L LS1 V8, 345hp
4. **C6 (2005-2013)** — 6.2L LS3 V8, 430hp
5. **C7 (2014-2019)** — 6.2L LT1 V8, 455hp
6. **C8 (2020-present)** — 6.2L LT2 V8, 495hp, mid-engine

## Current State (as of 2026-04-02)

### What's Done
- 3D viewer with Normal/X-Ray modes, color studio
- Part tabs with RPG stat bars showing upgrade impact ranges
- PartViewer orbit centering (orbits around mesh center, not origin)
- Sub-component taxonomy (1713 lines, all 6 gens, generation-specific filtering)
- Sub-component picker UI (pill buttons → targeted marketplace search)
- eBay-style marketplace cards (thumbnails, descriptions, green prices, source badges, hover glow)
- AI upgrade analyzer (Claude Haiku → HP/torque/weight/0-60 estimates, pros/cons, difficulty)
- Scroll isolation (marketplace scrolls independently)
- **Deployed and live**:
  - Frontend on Vercel: `https://myvette.vercel.app`
  - Backend on Railway: `https://myvette-production.up.railway.app`
  - 3D models on Cloudflare R2 CDN
  - CORS configured for Vercel → Railway communication
  - Railway env vars: `FIRECRAWL_API_KEY`, `ANTHROPIC_API_KEY`, `CORS_ORIGINS`
- GitHub: https://github.com/gcgpickering/myvette (private)

### What Needs Doing (Priority Order)
1. **Competitive pricing** — Show same part across multiple retailers (Summit Racing, Paragon, eBay, Corvette Central, etc.) side-by-side. Price comparison is a key value prop. See `myvette/research-output-summary.md` for retailer list by generation specialty
2. **UI polish** — Brighter, more photoreal feel. Use 21st.dev components where applicable. Web search for modern component patterns
3. **Verify card display** — Confirm marketplace cards render full-size with thumbnails, prices, and ANALYZE UPGRADE buttons on the live site

## Design System Notes
- When using 21st.dev elements or external component patterns found via web search, adapt them to the existing dark theme + Corvette red accent system
- Maintain the RPG stat bar aesthetic — this is a core differentiator
- Cards and panels use `border-radius: 10-12px`, subtle glass morphism (`rgba(255,255,255,0.02-0.05)` backgrounds)
- Animations: staggered fade-ins on cards, pulse on loading states, smooth bar grows on stat bars

## Session Memory
Full session history with all decisions, fixes, and context: see `~/.claude/projects/C--Users-gcgpi-autotwin/memory/myvette_session_20260401.md`
