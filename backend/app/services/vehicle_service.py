"""Vehicle service for NHTSA vPIC API integration with caching and fallbacks."""

from __future__ import annotations

import json
import os
import time
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Load curated trims JSON at module level (loaded once)
# ---------------------------------------------------------------------------

_CURATED_TRIMS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "curated_trims.json"
)

_curated_trims: dict = {}
try:
    with open(_CURATED_TRIMS_PATH, "r", encoding="utf-8") as _f:
        _curated_trims = json.load(_f)
    logger.info("Loaded curated trims from %s", _CURATED_TRIMS_PATH)
except FileNotFoundError:
    logger.warning("Curated trims file not found at %s", _CURATED_TRIMS_PATH)
except json.JSONDecodeError as _exc:
    logger.error("Failed to parse curated trims JSON: %s", _exc)

NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles"
CACHE_TTL_SECONDS = 3600  # 1 hour
VEHICLE_TYPES = ("car", "truck")

# ---------------------------------------------------------------------------
# Simple in-memory cache
# ---------------------------------------------------------------------------

_cache: dict[str, tuple[float, Any]] = {}


def _cache_get(key: str) -> Any | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    ts, value = entry
    if time.time() - ts > CACHE_TTL_SECONDS:
        del _cache[key]
        return None
    return value


def _cache_set(key: str, value: Any) -> None:
    _cache[key] = (time.time(), value)


# ---------------------------------------------------------------------------
# Common trims fallback (NHTSA has no real trim endpoint)
# ---------------------------------------------------------------------------

COMMON_TRIMS: list[str] = [
    "Base", "S", "SE", "SEL", "Sport", "Limited", "Premium",
    "Touring", "XLE", "XSE", "LX", "EX", "EX-L", "Platinum",
    "SV", "SL", "SR",
]

# ---------------------------------------------------------------------------
# Accurate trim database per (make, model)
# Keys are (make_lower, model_lower) tuples
# ---------------------------------------------------------------------------

TRIM_DATABASE: dict[tuple[str, str], list[str]] = {
    # --- Toyota ---
    ("toyota", "camry"): ["LE", "SE", "SE Nightshade", "XLE", "XSE", "TRD"],
    ("toyota", "corolla"): ["L", "LE", "SE", "XLE", "XSE"],
    ("toyota", "corolla hatchback"): ["SE", "XSE"],
    ("toyota", "rav4"): ["LE", "XLE", "XLE Premium", "Adventure", "TRD Off-Road", "Limited"],
    ("toyota", "highlander"): ["L", "LE", "XLE", "XSE", "Limited", "Platinum"],
    ("toyota", "tacoma"): ["SR", "SR5", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro"],
    ("toyota", "tundra"): ["SR", "SR5", "Limited", "Platinum", "1794 Edition", "TRD Pro", "Capstone"],
    ("toyota", "4runner"): ["SR5", "SR5 Premium", "TRD Sport", "TRD Off-Road", "TRD Off-Road Premium", "Limited", "TRD Pro"],
    ("toyota", "prius"): ["LE", "XLE", "Limited"],
    ("toyota", "supra"): ["2.0", "3.0", "3.0 Premium", "A91 Edition"],
    ("toyota", "sienna"): ["LE", "XLE", "XSE", "Woodland Edition", "Limited", "Platinum"],
    ("toyota", "gr86"): ["Base", "Premium"],

    # --- Honda ---
    ("honda", "civic"): ["LX", "Sport", "EX", "EX-L", "Touring", "Si", "Type R"],
    ("honda", "accord"): ["LX", "EX", "EX-L", "Sport", "Sport Special Edition", "Touring"],
    ("honda", "cr-v"): ["LX", "EX", "EX-L", "Sport", "Sport Touring", "Touring"],
    ("honda", "hr-v"): ["LX", "Sport", "EX-L"],
    ("honda", "pilot"): ["LX", "Sport", "EX-L", "TrailSport", "Touring", "Elite"],
    ("honda", "odyssey"): ["LX", "EX", "EX-L", "Sport", "Touring", "Elite"],
    ("honda", "ridgeline"): ["Sport", "RTL", "RTL-E", "TrailSport", "Black Edition"],

    # --- Ford ---
    ("ford", "f-150"): ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Raptor", "Raptor R", "Tremor"],
    ("ford", "mustang"): ["EcoBoost", "EcoBoost Premium", "GT", "GT Premium", "Mach 1", "Dark Horse", "Shelby GT500"],
    ("ford", "explorer"): ["Base", "XLT", "ST", "Limited", "King Ranch", "Platinum", "Timberline"],
    ("ford", "escape"): ["Base", "Active", "ST-Line", "ST-Line Select", "Platinum"],
    ("ford", "bronco"): ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak", "Raptor"],
    ("ford", "bronco sport"): ["Base", "Big Bend", "Outer Banks", "Badlands"],
    ("ford", "maverick"): ["XL", "XLT", "Lariat", "Tremor"],
    ("ford", "ranger"): ["XL", "XLT", "Lariat", "Raptor"],
    ("ford", "edge"): ["SE", "SEL", "ST-Line", "ST", "Titanium"],
    ("ford", "expedition"): ["XL STX", "XLT", "Limited", "King Ranch", "Platinum", "Timberline"],

    # --- Chevrolet ---
    ("chevrolet", "silverado 1500"): ["WT", "Custom", "Custom Trail Boss", "LT", "RST", "LT Trail Boss", "LTZ", "High Country", "ZR2"],
    ("chevrolet", "equinox"): ["LS", "LT", "RS", "Premier", "Activ"],
    ("chevrolet", "tahoe"): ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
    ("chevrolet", "traverse"): ["LS", "LT", "RS", "Z71", "Premier", "High Country"],
    ("chevrolet", "camaro"): ["1LS", "1LT", "2LT", "3LT", "LT1", "1SS", "2SS", "ZL1"],
    ("chevrolet", "corvette"): ["1LT", "2LT", "3LT", "Z06", "E-Ray", "ZR1"],
    ("chevrolet", "malibu"): ["LS", "LT", "RS", "Premier"],
    ("chevrolet", "suburban"): ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
    ("chevrolet", "colorado"): ["WT", "LT", "Z71", "Trail Boss", "ZR2"],
    ("chevrolet", "blazer"): ["LT", "RS", "Premier"],
    ("chevrolet", "trailblazer"): ["LS", "LT", "Active", "RS", "Activ"],

    # --- Ram ---
    ("ram", "1500"): ["Tradesman", "Big Horn", "Laramie", "Rebel", "Limited", "Limited Longhorn", "TRX"],
    ("ram", "2500"): ["Tradesman", "Big Horn", "Laramie", "Power Wagon", "Limited", "Limited Longhorn"],
    ("ram", "3500"): ["Tradesman", "Big Horn", "Laramie", "Limited", "Limited Longhorn"],

    # --- GMC ---
    ("gmc", "sierra 1500"): ["Pro", "SLE", "Elevation", "SLT", "AT4", "AT4X", "Denali", "Denali Ultimate"],
    ("gmc", "yukon"): ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"],
    ("gmc", "terrain"): ["SLE", "SLT", "AT4", "Denali"],
    ("gmc", "acadia"): ["SLE", "SLT", "AT4", "Denali"],
    ("gmc", "canyon"): ["Elevation", "AT4", "AT4X", "Denali"],

    # --- Jeep ---
    ("jeep", "wrangler"): ["Sport", "Sport S", "Willys", "Sahara", "Rubicon", "Rubicon 392", "4xe"],
    ("jeep", "grand cherokee"): ["Laredo", "Altitude", "Limited", "Trailhawk", "Overland", "Summit", "Summit Reserve", "4xe"],
    ("jeep", "cherokee"): ["Latitude", "Latitude Lux", "Altitude", "X", "Limited", "Trailhawk"],
    ("jeep", "gladiator"): ["Sport", "Sport S", "Willys", "Rubicon", "Mojave"],
    ("jeep", "compass"): ["Sport", "Latitude", "Latitude Lux", "Limited", "Trailhawk"],

    # --- Hyundai ---
    ("hyundai", "tucson"): ["SE", "SEL", "N Line", "XRT", "Limited", "Hybrid Blue", "Hybrid SEL", "Hybrid Limited"],
    ("hyundai", "santa fe"): ["SE", "SEL", "XRT", "Limited", "Calligraphy"],
    ("hyundai", "elantra"): ["SE", "SEL", "N Line", "Limited", "N"],
    ("hyundai", "sonata"): ["SE", "SEL", "SEL Plus", "N Line", "Limited"],
    ("hyundai", "palisade"): ["SE", "SEL", "XRT", "Limited", "Calligraphy"],
    ("hyundai", "kona"): ["SE", "SEL", "N Line", "Limited", "N"],
    ("hyundai", "ioniq 5"): ["SE Standard Range", "SE Long Range", "SEL", "Limited"],
    ("hyundai", "ioniq 6"): ["SE Standard Range", "SE Long Range", "SEL", "Limited"],

    # --- Kia ---
    ("kia", "telluride"): ["LX", "S", "EX", "SX", "SX Prestige", "X-Line", "X-Pro"],
    ("kia", "sportage"): ["LX", "EX", "X-Line", "SX", "SX Prestige", "X-Pro", "X-Pro Prestige"],
    ("kia", "sorento"): ["LX", "S", "EX", "SX", "SX Prestige", "X-Line"],
    ("kia", "forte"): ["FE", "LXS", "GT-Line", "GT"],
    ("kia", "k5"): ["LX", "LXS", "GT-Line", "EX", "GT"],

    # --- Nissan ---
    ("nissan", "altima"): ["S", "SV", "SR", "SL", "Platinum"],
    ("nissan", "rogue"): ["S", "SV", "SL", "Platinum"],
    ("nissan", "sentra"): ["S", "SV", "SR"],
    ("nissan", "pathfinder"): ["S", "SV", "SL", "Platinum", "Rock Creek"],
    ("nissan", "frontier"): ["S", "SV", "PRO-X", "PRO-4X"],

    # --- Subaru ---
    ("subaru", "outback"): ["Base", "Premium", "Onyx Edition", "Limited", "Touring", "Wilderness"],
    ("subaru", "forester"): ["Base", "Premium", "Sport", "Limited", "Touring", "Wilderness"],
    ("subaru", "crosstrek"): ["Base", "Premium", "Sport", "Limited", "Wilderness"],
    ("subaru", "wrx"): ["Base", "Premium", "Limited", "GT"],
    ("subaru", "impreza"): ["Base", "Sport", "RS"],
    ("subaru", "ascent"): ["Base", "Premium", "Onyx Edition", "Limited", "Touring"],

    # --- Mazda ---
    ("mazda", "cx-5"): ["S", "S Select", "S Preferred", "S Carbon Edition", "S Premium", "S Premium Plus", "Turbo", "Turbo Signature"],
    ("mazda", "cx-50"): ["S", "S Select", "S Preferred", "S Preferred Plus", "S Premium", "S Premium Plus", "Turbo", "Turbo Premium", "Turbo Premium Plus", "Meridian Edition"],
    ("mazda", "cx-90"): ["S", "S Select", "S Preferred", "S Preferred Plus", "S Premium", "S Premium Plus", "Turbo", "Turbo Premium", "Turbo Premium Plus", "PHEV Premium", "PHEV Premium Plus"],
    ("mazda", "mazda3"): ["S", "S Select", "S Preferred", "S Carbon Edition", "S Premium", "Turbo", "Turbo Premium Plus"],
    ("mazda", "mx-5 miata"): ["Sport", "Club", "Grand Touring"],

    # --- BMW ---
    ("bmw", "3 series"): ["330i", "330i xDrive", "M340i", "M340i xDrive"],
    ("bmw", "5 series"): ["530i", "530i xDrive", "540i xDrive", "i5 eDrive40", "i5 xDrive40", "i5 M60 xDrive"],
    ("bmw", "x3"): ["sDrive30i", "xDrive30i", "M40i", "M"],
    ("bmw", "x5"): ["xDrive40i", "xDrive50e", "M60i", "M"],
    ("bmw", "4 series"): ["430i", "430i xDrive", "M440i", "M440i xDrive"],

    # --- Mercedes-Benz ---
    ("mercedes-benz", "c-class"): ["C 300", "C 300 4MATIC", "AMG C 43", "AMG C 63"],
    ("mercedes-benz", "e-class"): ["E 350", "E 350 4MATIC", "E 450 4MATIC", "AMG E 53"],
    ("mercedes-benz", "glc"): ["GLC 300", "GLC 300 4MATIC", "AMG GLC 43", "AMG GLC 63"],
    ("mercedes-benz", "gle"): ["GLE 350", "GLE 350 4MATIC", "GLE 450 4MATIC", "AMG GLE 53", "AMG GLE 63 S"],
    ("mercedes-benz", "gls"): ["GLS 450 4MATIC", "GLS 580 4MATIC", "AMG GLS 63"],

    # --- Audi ---
    ("audi", "a4"): ["40 Premium", "40 Premium Plus", "45 Premium", "45 Premium Plus", "45 S line Premium Plus", "45 Prestige"],
    ("audi", "a6"): ["45 Premium", "45 Premium Plus", "55 Premium Plus", "55 Prestige"],
    ("audi", "q5"): ["40 Premium", "40 Premium Plus", "45 Premium", "45 Premium Plus", "45 Prestige"],
    ("audi", "q7"): ["45 Premium", "45 Premium Plus", "55 Premium Plus", "55 Prestige"],
    ("audi", "q8"): ["55 Premium", "55 Premium Plus", "55 Prestige"],

    # --- Lexus ---
    ("lexus", "rx"): ["RX 350", "RX 350 F SPORT", "RX 350h", "RX 350h F SPORT", "RX 500h", "RX 500h F SPORT Performance"],
    ("lexus", "nx"): ["NX 250", "NX 350", "NX 350h", "NX 450h+", "F SPORT"],
    ("lexus", "es"): ["ES 250", "ES 300h", "ES 350", "F SPORT"],
    ("lexus", "is"): ["IS 300", "IS 350", "IS 500", "F SPORT"],

    # --- Tesla ---
    ("tesla", "model 3"): ["Standard Range", "Long Range", "Long Range AWD", "Performance"],
    ("tesla", "model y"): ["Standard Range", "Long Range", "Long Range AWD", "Performance"],
    ("tesla", "model s"): ["Long Range", "Plaid"],
    ("tesla", "model x"): ["Long Range", "Plaid"],

    # --- Volkswagen ---
    ("volkswagen", "jetta"): ["S", "Sport", "SE", "SEL", "GLI S", "GLI Autobahn"],
    ("volkswagen", "tiguan"): ["S", "SE", "SE R-Line", "SEL", "SEL R-Line"],
    ("volkswagen", "atlas"): ["SE", "SE with Technology", "SEL", "SEL Premium", "SEL Premium R-Line"],
    ("volkswagen", "golf gti"): ["S", "SE", "Autobahn"],
    ("volkswagen", "golf r"): ["Base"],
    ("volkswagen", "id.4"): ["Standard", "S", "S Plus", "Pro", "Pro S", "Pro S Plus"],

    # --- Dodge ---
    ("dodge", "charger"): ["SXT", "GT", "R/T", "Scat Pack", "SRT Hellcat"],
    ("dodge", "challenger"): ["SXT", "GT", "R/T", "R/T Scat Pack", "SRT Hellcat", "SRT Demon 170"],
    ("dodge", "durango"): ["SXT", "GT", "R/T", "Citadel", "SRT Hellcat"],
    ("dodge", "hornet"): ["GT", "GT Plus", "R/T", "R/T Plus"],

    # --- Acura ---
    ("acura", "integra"): ["Base", "A-Spec", "A-Spec Technology", "Type S"],
    ("acura", "tlx"): ["Base", "Technology", "A-Spec", "A-Spec Advance", "Type S", "Type S Advance"],
    ("acura", "mdx"): ["Base", "Technology", "A-Spec", "A-Spec Advance", "Type S", "Type S Advance"],
    ("acura", "rdx"): ["Base", "Technology", "A-Spec", "A-Spec Advance", "Advance"],

    # --- Cadillac ---
    ("cadillac", "escalade"): ["Luxury", "Premium Luxury", "Premium Luxury Platinum", "Sport", "Sport Platinum", "V"],
    ("cadillac", "ct4"): ["Luxury", "Premium Luxury", "Sport", "V-Series", "V-Series Blackwing"],
    ("cadillac", "ct5"): ["Luxury", "Premium Luxury", "Sport", "V-Series", "V-Series Blackwing"],
    ("cadillac", "xt4"): ["Luxury", "Premium Luxury", "Sport"],

    # --- Volvo ---
    ("volvo", "xc60"): ["Core", "Plus", "Plus Dark Theme", "Ultimate", "Polestar Engineered"],
    ("volvo", "xc90"): ["Core", "Plus", "Plus Dark Theme", "Ultimate"],
    ("volvo", "s60"): ["Core", "Plus", "Plus Dark Theme", "Ultimate", "Polestar Engineered"],
    ("volvo", "xc40"): ["Core", "Plus", "Ultimate"],

    # --- Genesis ---
    ("genesis", "g70"): ["2.5T Standard", "2.5T Advanced", "2.5T Sport Prestige", "3.3T Sport Advanced", "3.3T Sport Prestige"],
    ("genesis", "g80"): ["2.5T Standard", "2.5T Advanced", "2.5T Prestige", "Sport"],
    ("genesis", "gv70"): ["2.5T Standard", "2.5T Advanced", "2.5T Sport Prestige", "3.5T Sport Advanced", "3.5T Sport Prestige"],
    ("genesis", "gv80"): ["2.5T Standard", "2.5T Advanced", "2.5T Prestige", "3.5T Advanced", "3.5T Prestige"],

    # --- Buick ---
    ("buick", "enclave"): ["Preferred", "Essence", "Sport Touring", "Avenir"],
    ("buick", "envision"): ["Preferred", "Essence", "Sport Touring", "Avenir"],
    ("buick", "encore gx"): ["Preferred", "Select", "Essence", "Sport Touring", "Avenir"],

    # --- Lincoln ---
    ("lincoln", "navigator"): ["Standard", "Reserve", "Black Label"],
    ("lincoln", "aviator"): ["Standard", "Reserve", "Black Label"],
    ("lincoln", "corsair"): ["Standard", "Reserve", "Grand Touring"],

    # --- Infiniti ---
    ("infiniti", "qx60"): ["Pure", "Luxe", "Sensory", "Autograph"],
    ("infiniti", "qx80"): ["Luxe", "Sensory", "Autograph"],
    ("infiniti", "q50"): ["Pure", "Luxe", "Sensory", "Red Sport 400"],

    # --- Porsche ---
    ("porsche", "911"): ["Carrera", "Carrera S", "Carrera GTS", "Targa 4", "Targa 4S", "Targa 4 GTS", "Turbo", "Turbo S", "GT3", "GT3 RS"],
    ("porsche", "cayenne"): ["Base", "S", "GTS", "Turbo GT"],
    ("porsche", "macan"): ["Base", "S", "GTS", "T"],

    # --- Rivian ---
    ("rivian", "r1t"): ["Dual Standard", "Dual Large", "Dual Max", "Quad"],
    ("rivian", "r1s"): ["Dual Standard", "Dual Large", "Dual Max", "Quad"],
}


def _lookup_curated_trims(make: str, model: str) -> list[dict] | None:
    """Look up full trim data from the curated JSON.

    Returns a list of trim dicts with name, body, engine, hp, etc.
    Returns None if the vehicle is not in the curated data.
    """
    # Case-insensitive search through the curated JSON
    make_lower = make.lower().strip()
    model_lower = model.lower().strip()

    for json_make, models in _curated_trims.items():
        if json_make.lower() == make_lower:
            for json_model, year_ranges in models.items():
                if json_model.lower() == model_lower:
                    # Return the trims from the first (most recent) year range
                    for _year_range, data in year_ranges.items():
                        return data.get("trims", [])
    return None


def get_trims_for_vehicle(make: str, model: str) -> list[str] | None:
    """Look up accurate trims for a make/model combination.

    Checks the curated JSON database first (has full specs),
    then falls back to the hardcoded TRIM_DATABASE.
    Returns None if the vehicle is not in either database.
    """
    # Priority 1: Curated JSON (has full specs)
    curated = _lookup_curated_trims(make, model)
    if curated:
        return [t["name"] for t in curated]

    # Priority 2: Hardcoded TRIM_DATABASE
    key = (make.lower().strip(), model.lower().strip())
    return TRIM_DATABASE.get(key)


def get_trim_details(make: str, model: str, trim_name: str) -> dict | None:
    """Get full spec details for a specific trim from the curated JSON.

    Returns a dict with: name, body, engine, hp, torque, drivetrain,
    transmission, weight. Returns None if not found.
    """
    curated = _lookup_curated_trims(make, model)
    if not curated:
        return None

    trim_lower = trim_name.lower().strip()
    for trim in curated:
        if trim["name"].lower() == trim_lower:
            return trim
    return None


async def research_vehicle_specs_with_ai(
    year: int, make: str, model: str, trim: str,
) -> dict | None:
    """Use Claude Haiku to research vehicle specs when curated data is missing."""
    from app.config import settings

    if not settings.anthropic_api_key:
        logger.info("No anthropic_api_key configured — skipping AI spec research")
        return None

    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    vehicle_desc = f"{year} {make} {model} {trim}"
    prompt = f"""You are an automotive specs expert. Return the specifications for a {vehicle_desc} as a JSON object with exactly these fields:

- "engine_type": string (e.g. "2.0L Turbo I4", "5.0L V8", "Electric Motor")
- "displacement": float in liters (e.g. 2.0, 5.0) or null for electric
- "horsepower": integer
- "torque": integer (lb-ft)
- "drivetrain": string (e.g. "FWD", "RWD", "AWD", "4WD")
- "transmission_type": string (e.g. "CVT", "8-Speed Automatic", "6-Speed Manual")
- "curb_weight": integer in lbs

Respond with ONLY the JSON object, no other text."""

    logger.info("AI spec research request for: %s", vehicle_desc)

    try:
        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = message.content[0].text.strip()
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            response_text = "\n".join(lines)

        result = json.loads(response_text)
        logger.info("AI spec research complete for %s: %s", vehicle_desc, result)
        return result
    except Exception as exc:
        logger.warning("AI spec research failed for %s: %s", vehicle_desc, exc)
        return None

# ---------------------------------------------------------------------------
# Body type inference
# ---------------------------------------------------------------------------

_BODY_TYPE_KEYWORDS: dict[str, list[str]] = {
    "truck": [
        "f-150", "f-250", "f-350", "silverado", "sierra", "ram",
        "tundra", "titan", "tacoma", "colorado", "canyon", "ranger",
        "frontier", "ridgeline", "maverick", "gladiator",
    ],
    "suv": [
        "suv", "explorer", "tahoe", "suburban", "expedition", "4runner",
        "highlander", "pilot", "pathfinder", "traverse", "blazer",
        "equinox", "trailblazer", "rav4", "cr-v", "hr-v", "cx-5",
        "cx-9", "cx-50", "cx-90", "tucson", "santa fe", "palisade",
        "telluride", "sorento", "sportage", "wrangler", "cherokee",
        "grand cherokee", "bronco", "sequoia", "armada", "murano",
        "rogue", "escape", "edge", "envision", "enclave", "acadia",
        "terrain", "trax", "outlander", "forester", "ascent",
        "crosstrek", "tiguan", "atlas", "q5", "q7", "x3", "x5",
        "glc", "gle", "gls", "rx", "nx", "ux", "mdx", "rdx",
    ],
    "van": [
        "sienna", "odyssey", "pacifica", "carnival", "transit",
        "sprinter", "caravan", "van", "minivan",
    ],
    "coupe": [
        "coupe", "mustang", "camaro", "corvette", "86", "brz", "supra",
        "370z", "400z", "challenger", "rc",
    ],
    "convertible": ["convertible", "roadster", "miata", "mx-5", "spider", "spyder"],
    "hatchback": [
        "hatchback", "golf", "civic hatchback", "corolla hatchback",
        "veloster", "gti", "fit", "yaris",
    ],
    "wagon": ["wagon", "outback", "v60", "v90", "allroad"],
    "sedan": [
        "sedan", "camry", "accord", "civic", "corolla", "altima",
        "sentra", "maxima", "malibu", "impala", "fusion", "sonata",
        "elantra", "optima", "k5", "forte", "jetta", "passat",
        "legacy", "impreza", "3 series", "5 series", "c-class",
        "e-class", "a4", "a6", "is", "es", "gs", "ls", "tlx",
        "integra", "ct4", "ct5", "model 3", "model s",
    ],
}


def infer_body_type(make: str, model: str) -> str:
    """Guess body type from make and model name using keyword matching."""
    combined = f"{make} {model}".lower()
    for body_type, keywords in _BODY_TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in combined:
                return body_type
    return "sedan"  # default fallback


# ---------------------------------------------------------------------------
# NHTSA API helpers
# ---------------------------------------------------------------------------

async def _nhtsa_get(url: str, params: dict | None = None) -> dict | None:
    """Make a GET request to the NHTSA API. Returns None on failure."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.warning("NHTSA API call failed: %s – %s", url, exc)
        return None


async def fetch_makes() -> list[str] | None:
    """Fetch all car + truck makes from NHTSA, cached."""
    cached = _cache_get("makes_all")
    if cached is not None:
        return cached

    all_makes: set[str] = set()
    for vtype in VEHICLE_TYPES:
        url = f"{NHTSA_BASE}/GetMakesForVehicleType/{vtype}?format=json"
        data = await _nhtsa_get(url)
        if data and "Results" in data:
            for item in data["Results"]:
                name = item.get("MakeName")
                if name:
                    # Title-case for consistency
                    all_makes.add(name.strip().title())

    if not all_makes:
        return None

    result = sorted(all_makes)
    _cache_set("makes_all", result)
    return result


async def fetch_models(year: int, make: str) -> list[str] | None:
    """Fetch models for a make/year from NHTSA, cached."""
    cache_key = f"models_{year}_{make.lower()}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    all_models: set[str] = set()
    for vtype in VEHICLE_TYPES:
        url = (
            f"{NHTSA_BASE}/GetModelsForMakeYear"
            f"/make/{make}/modelyear/{year}/vehicletype/{vtype}?format=json"
        )
        data = await _nhtsa_get(url)
        if data and "Results" in data:
            for item in data["Results"]:
                name = item.get("Model_Name")
                if name:
                    all_models.add(name.strip())

    if not all_models:
        return None

    result = sorted(all_models)
    _cache_set(cache_key, result)
    return result


async def verify_vehicle_exists(year: int, make: str, model: str) -> bool:
    """Check via NHTSA whether a year/make/model combination is valid."""
    models = await fetch_models(year, make)
    if models is None:
        return False
    return model in models
