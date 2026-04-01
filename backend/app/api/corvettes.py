"""Corvette generations API — browse models, serve GLBs, get color palettes."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.curated_registry import (
    get_generation,
    get_generation_colors,
    list_generations,
    VALID_CODES,
)

router = APIRouter(prefix="/corvettes", tags=["corvettes"])


@router.get("/generations")
async def all_generations():
    """Return metadata for all six Corvette generations (C3-C8)."""
    return list_generations()


@router.get("/model/{generation}")
async def serve_model(generation: str):
    """Serve the GLB file for a generation code (c3-c8).

    Returns a binary FileResponse with Cache-Control headers so the
    browser caches the model aggressively.
    """
    code = generation.lower()
    if code not in VALID_CODES:
        raise HTTPException(404, f"Unknown generation '{generation}'. Valid: {VALID_CODES}")

    gen = get_generation(code)
    if gen is None or not gen.exists:
        raise HTTPException(
            404,
            f"GLB file not found for {code}. Expected: {gen.glb_filename if gen else 'N/A'}",
        )

    return FileResponse(
        gen.file_path,
        media_type="model/gltf-binary",
        filename=gen.glb_filename,
        headers={
            "Cache-Control": "public, max-age=86400, immutable",
        },
    )


@router.get("/{generation}/colors")
async def generation_colors(generation: str):
    """Return the stock factory color palette for a generation."""
    code = generation.lower()
    colors = get_generation_colors(code)
    if colors is None:
        raise HTTPException(404, f"Unknown generation '{generation}'. Valid: {VALID_CODES}")
    return {"generation": code, "colors": colors}
