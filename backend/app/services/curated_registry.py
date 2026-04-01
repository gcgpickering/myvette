"""Curated Corvette Registry — generation-keyed catalog of all six Corvette eras.

Each generation includes the GLB model path, stock color palette, specs,
heritage info, and mesh metadata. Primary key is the generation code (c3-c8).

All 3D models are CC Attribution licensed. Credits:
- C3 Stingray: Kryox Shade (Sketchfab)
- C4 1990: Ricy (Sketchfab)
- C5 1997: Randomness (Sketchfab)
- C6 ZR1: Black Snow (Sketchfab)
- C7 Stingray: Martin Trafas (Sketchfab)
- C8 Stingray: (Sketchfab)
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

CURATED_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "static", "models", "corvette",
)


@dataclass
class StockColor:
    """A factory paint option."""
    name: str
    hex: str


@dataclass
class Specs:
    """Key performance specifications."""
    engine: str
    hp: int
    torque_lb_ft: int
    zero_to_sixty: float
    transmission: str


@dataclass
class Generation:
    """Complete metadata for a single Corvette generation."""
    code: str               # c3, c4, c5, c6, c7, c8
    name: str               # display name
    year_range: str          # e.g. "1968-1982"
    tagline: str            # one-line heritage summary
    glb_filename: str       # filename inside CURATED_DIR
    mesh_count: int
    mesh_quality: str       # generic, good, excellent
    specs: Specs
    colors: list[StockColor] = field(default_factory=list)
    credit: str = ""

    @property
    def file_path(self) -> str:
        return os.path.join(CURATED_DIR, self.glb_filename)

    @property
    def exists(self) -> bool:
        return os.path.exists(self.file_path)

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "name": self.name,
            "yearRange": self.year_range,
            "tagline": self.tagline,
            "glbFilename": self.glb_filename,
            "meshCount": self.mesh_count,
            "meshQuality": self.mesh_quality,
            "available": self.exists,
            "specs": {
                "engine": self.specs.engine,
                "hp": self.specs.hp,
                "torqueLbFt": self.specs.torque_lb_ft,
                "zeroToSixty": self.specs.zero_to_sixty,
                "transmission": self.specs.transmission,
            },
            "colors": [{"name": c.name, "hex": c.hex} for c in self.colors],
            "credit": self.credit,
        }


# ---------------------------------------------------------------------------
# Generation definitions
# ---------------------------------------------------------------------------

GENERATIONS: list[Generation] = [
    Generation(
        code="c3",
        name="C3 Stingray",
        year_range="1968-1982",
        tagline="The shark-body icon that defined American muscle.",
        glb_filename="c3_stingray_1969.glb",
        mesh_count=18,
        mesh_quality="generic",
        credit="Kryox Shade / Sketchfab (CC Attribution)",
        specs=Specs(
            engine="5.7L L88 V8",
            hp=430,
            torque_lb_ft=460,
            zero_to_sixty=5.3,
            transmission="4-speed manual",
        ),
        colors=[
            StockColor("Tuxedo Black", "#0E0E0E"),
            StockColor("Monza Red", "#B31B1B"),
            StockColor("Riverside Gold", "#C5922A"),
            StockColor("LeMans Blue", "#1B3F8B"),
            StockColor("Cortez Silver", "#A8A9AD"),
            StockColor("Can-Am White", "#F5F5F0"),
            StockColor("Fathom Green", "#004D40"),
            StockColor("Daytona Yellow", "#FFD700"),
        ],
    ),
    Generation(
        code="c4",
        name="C4",
        year_range="1984-1996",
        tagline="Digital dash meets wedge-shape — the tech-forward Corvette.",
        glb_filename="c4_1990.glb",
        mesh_count=98,
        mesh_quality="excellent",
        credit="Ricy / Sketchfab (CC Attribution)",
        specs=Specs(
            engine="5.7L L98 V8",
            hp=245,
            torque_lb_ft=340,
            zero_to_sixty=5.7,
            transmission="6-speed manual",
        ),
        colors=[
            StockColor("Black", "#0E0E0E"),
            StockColor("Bright Red", "#CC0000"),
            StockColor("Competition Yellow", "#FFD200"),
            StockColor("White", "#FFFFFF"),
            StockColor("Polo Green", "#2D5A3D"),
            StockColor("Admiral Blue", "#003366"),
            StockColor("Dark Red Metallic", "#6B1C23"),
            StockColor("Quasar Blue", "#3A5BA0"),
        ],
    ),
    Generation(
        code="c5",
        name="C5",
        year_range="1997-2004",
        tagline="Hydroformed frame, pop-up headlights gone — the modern era begins.",
        glb_filename="c5_1997.glb",
        mesh_count=15,
        mesh_quality="generic",
        credit="Randomness / Sketchfab (CC Attribution)",
        specs=Specs(
            engine="5.7L LS1 V8",
            hp=345,
            torque_lb_ft=350,
            zero_to_sixty=4.7,
            transmission="6-speed manual",
        ),
        colors=[
            StockColor("Torch Red", "#E21A1A"),
            StockColor("Black", "#0E0E0E"),
            StockColor("Millennium Yellow", "#FFD700"),
            StockColor("Nassau Blue", "#1F3A5F"),
            StockColor("Magnetic Red", "#7B1E3A"),
            StockColor("Arctic White", "#F8F8FF"),
            StockColor("Quicksilver", "#A6A6A6"),
            StockColor("Electron Blue", "#0055BF"),
        ],
    ),
    Generation(
        code="c6",
        name="C6 ZR1",
        year_range="2005-2013",
        tagline="Exposed headlamps return; the supercharged ZR1 hits 205 mph.",
        glb_filename="c6_zr1_2009.glb",
        mesh_count=573,
        mesh_quality="excellent",
        credit="Black Snow / Sketchfab (CC Attribution)",
        specs=Specs(
            engine="6.2L LS9 Supercharged V8",
            hp=638,
            torque_lb_ft=604,
            zero_to_sixty=3.4,
            transmission="6-speed manual",
        ),
        colors=[
            StockColor("Inferno Orange", "#E25822"),
            StockColor("Torch Red", "#E21A1A"),
            StockColor("Jetstream Blue", "#3B6AA0"),
            StockColor("Velocity Yellow", "#FFD200"),
            StockColor("Black", "#0E0E0E"),
            StockColor("Blade Silver", "#B0B0B0"),
            StockColor("Arctic White", "#F8F8FF"),
            StockColor("Crystal Red", "#9B1B30"),
        ],
    ),
    Generation(
        code="c7",
        name="C7 Stingray",
        year_range="2014-2019",
        tagline="Angular aggression and LT1 power — the last front-engine Corvette.",
        glb_filename="c7_stingray_2014.glb",
        mesh_count=55,
        mesh_quality="good",
        credit="Martin Trafas / Sketchfab (CC Attribution)",
        specs=Specs(
            engine="6.2L LT1 V8",
            hp=455,
            torque_lb_ft=460,
            zero_to_sixty=3.7,
            transmission="7-speed manual",
        ),
        colors=[
            StockColor("Torch Red", "#E21A1A"),
            StockColor("Black", "#0E0E0E"),
            StockColor("Arctic White", "#F8F8FF"),
            StockColor("Laguna Blue", "#0059A6"),
            StockColor("Shark Gray", "#6B6B6B"),
            StockColor("Long Beach Red", "#7B1E3A"),
            StockColor("Corvette Racing Yellow", "#FFD200"),
            StockColor("Watkins Glen Gray", "#4E4E4E"),
        ],
    ),
    Generation(
        code="c8",
        name="C8 Stingray",
        year_range="2020-present",
        tagline="Mid-engine revolution — 60 years of tradition, reinvented.",
        glb_filename="c8_stingray_2020.glb",
        mesh_count=119,
        mesh_quality="excellent",
        credit="Sketchfab (CC Attribution)",
        specs=Specs(
            engine="6.2L LT2 V8",
            hp=495,
            torque_lb_ft=470,
            zero_to_sixty=2.9,
            transmission="8-speed dual-clutch",
        ),
        colors=[
            StockColor("Torch Red", "#E21A1A"),
            StockColor("Black", "#0E0E0E"),
            StockColor("Arctic White", "#F8F8FF"),
            StockColor("Rapid Blue", "#0077C8"),
            StockColor("Accelerate Yellow", "#FFD200"),
            StockColor("Red Mist", "#7B1E3A"),
            StockColor("Silver Flare", "#C0C0C0"),
            StockColor("Amplify Orange", "#FF6B2B"),
            StockColor("Hypersonic Gray", "#4A4A4A"),
            StockColor("Elkhart Lake Blue", "#004B87"),
        ],
    ),
]

# Lookup by generation code
_code_index: dict[str, Generation] = {g.code: g for g in GENERATIONS}

VALID_CODES = list(_code_index.keys())


def get_generation(code: str) -> Generation | None:
    """Get a generation by its code (c3-c8). Case-insensitive."""
    return _code_index.get(code.lower())


def list_generations() -> list[dict]:
    """Return all generations as serializable dicts for the API."""
    return [g.to_dict() for g in GENERATIONS]


def get_generation_colors(code: str) -> list[dict] | None:
    """Return the stock color palette for a generation, or None if not found."""
    gen = get_generation(code)
    if gen is None:
        return None
    return [{"name": c.name, "hex": c.hex} for c in gen.colors]
