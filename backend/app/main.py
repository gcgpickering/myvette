"""MyVette API — Corvette-only 3D configurator backend."""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.database import engine, Base

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables and seed basic data on startup."""
    # Create tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")
    except Exception as exc:
        logger.error("Table creation failed: %s", exc)

    # Seed part types
    try:
        from app.db.seed import seed_part_types
        from app.db.database import async_session

        async with async_session() as session:
            async with session.begin():
                await seed_part_types(session)
        logger.info("Part types seeded")
    except Exception as exc:
        logger.error("Part type seed failed: %s", exc)

    yield


# Ensure static directories exist
os.makedirs("static/models/corvette", exist_ok=True)
os.makedirs("static/parts", exist_ok=True)

app = FastAPI(
    title="MyVette API",
    description="Corvette 3D Configurator & Upgrade Marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
from app.api.corvettes import router as corvettes_router  # noqa: E402
from app.api.parts import router as parts_router  # noqa: E402
from app.api.marketplace import router as marketplace_router  # noqa: E402

app.include_router(corvettes_router, prefix="/api")
app.include_router(parts_router, prefix="/api")
app.include_router(marketplace_router, prefix="/api")


# --- Health ---
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


# --- Static files ---
app.mount("/static", StaticFiles(directory="static"), name="static")
