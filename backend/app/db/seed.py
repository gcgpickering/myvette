"""Seed database with vehicle and part data.

Provides a comprehensive static dataset of vehicles (2018-2025),
part types with educational content, and upgrade categories.
Idempotent: safe to run multiple times.
"""

import asyncio
from sqlalchemy import select, func
from app.db.database import engine, async_session, Base
from app.models.vehicle import Vehicle
from app.models.part import PartType, UpgradeCategory


# ---------------------------------------------------------------------------
# Vehicle seed data
# ---------------------------------------------------------------------------

VEHICLES: list[dict] = []


def _add(make: str, model: str, trims: list[dict]):
    """Helper to expand trims across year ranges into VEHICLES list."""
    for t in trims:
        years = t.pop("years", [2024])
        for yr in years:
            VEHICLES.append({"year": yr, "make": make, "model": model, **t})


# ---- Toyota ---------------------------------------------------------------
_add("Toyota", "Camry", [
    {"trim": "LE", "body_type": "sedan", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 203, "torque": 184, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3310, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "XSE V6", "body_type": "sedan", "engine_type": "3.5L V6", "displacement": 3.5,
     "horsepower": 301, "torque": 267, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3572, "years": [2021, 2022, 2023, 2024]},
])
_add("Toyota", "Corolla", [
    {"trim": "LE", "body_type": "sedan", "engine_type": "2.0L I4", "displacement": 2.0,
     "horsepower": 169, "torque": 151, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 2910, "years": [2020, 2021, 2022, 2023, 2024, 2025]},
    {"trim": "SE", "body_type": "hatchback", "engine_type": "2.0L I4", "displacement": 2.0,
     "horsepower": 169, "torque": 151, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 2955, "years": [2022, 2023, 2024]},
])
_add("Toyota", "RAV4", [
    {"trim": "LE", "body_type": "suv", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 203, "torque": 184, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3615, "years": [2020, 2021, 2022, 2023, 2024, 2025]},
    {"trim": "TRD Off-Road", "body_type": "suv", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 203, "torque": 184, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3715, "years": [2022, 2023, 2024]},
])
_add("Toyota", "Tacoma", [
    {"trim": "SR5", "body_type": "truck", "engine_type": "2.4L I4 Turbo", "displacement": 2.4,
     "horsepower": 278, "torque": 317, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 4515, "years": [2024, 2025]},
    {"trim": "TRD Sport", "body_type": "truck", "engine_type": "3.5L V6", "displacement": 3.5,
     "horsepower": 278, "torque": 265, "drivetrain": "4WD", "transmission_type": "6-speed auto",
     "curb_weight": 4425, "years": [2020, 2021, 2022, 2023]},
])
_add("Toyota", "Supra", [
    {"trim": "3.0 Premium", "body_type": "coupe", "engine_type": "3.0L I6 Turbo", "displacement": 3.0,
     "horsepower": 382, "torque": 368, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3400, "years": [2023, 2024, 2025]},
])

# ---- Honda ----------------------------------------------------------------
_add("Honda", "Civic", [
    {"trim": "LX", "body_type": "sedan", "engine_type": "2.0L I4", "displacement": 2.0,
     "horsepower": 158, "torque": 138, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 2877, "years": [2022, 2023, 2024, 2025]},
    {"trim": "Sport Touring", "body_type": "hatchback", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 180, "torque": 177, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 3077, "years": [2022, 2023, 2024]},
])
_add("Honda", "Accord", [
    {"trim": "Sport", "body_type": "sedan", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 192, "torque": 192, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 3240, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "Sport 2.0T", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 252, "torque": 273, "drivetrain": "FWD", "transmission_type": "10-speed auto",
     "curb_weight": 3428, "years": [2020, 2021, 2022]},
])
_add("Honda", "CR-V", [
    {"trim": "EX-L", "body_type": "suv", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 190, "torque": 179, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3455, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Honda", "Civic Type R", [
    {"trim": "Base", "body_type": "hatchback", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 315, "torque": 310, "drivetrain": "FWD", "transmission_type": "6-speed manual",
     "curb_weight": 3118, "years": [2023, 2024, 2025]},
])

# ---- Ford -----------------------------------------------------------------
_add("Ford", "F-150", [
    {"trim": "XLT", "body_type": "truck", "engine_type": "2.7L V6 Twin-Turbo", "displacement": 2.7,
     "horsepower": 325, "torque": 400, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 4705, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "Lariat 5.0", "body_type": "truck", "engine_type": "5.0L V8", "displacement": 5.0,
     "horsepower": 400, "torque": 410, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 4920, "years": [2021, 2022, 2023, 2024]},
])
_add("Ford", "Mustang", [
    {"trim": "EcoBoost", "body_type": "coupe", "engine_type": "2.3L I4 Turbo", "displacement": 2.3,
     "horsepower": 315, "torque": 350, "drivetrain": "RWD", "transmission_type": "10-speed auto",
     "curb_weight": 3532, "years": [2024, 2025]},
    {"trim": "GT", "body_type": "coupe", "engine_type": "5.0L V8", "displacement": 5.0,
     "horsepower": 480, "torque": 415, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 3807, "years": [2024, 2025]},
    {"trim": "GT", "body_type": "coupe", "engine_type": "5.0L V8", "displacement": 5.0,
     "horsepower": 450, "torque": 410, "drivetrain": "RWD", "transmission_type": "10-speed auto",
     "curb_weight": 3743, "years": [2020, 2021, 2022]},
])
_add("Ford", "Bronco", [
    {"trim": "Big Bend", "body_type": "suv", "engine_type": "2.3L I4 Turbo", "displacement": 2.3,
     "horsepower": 275, "torque": 315, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 4345, "years": [2022, 2023, 2024, 2025]},
])
_add("Ford", "Explorer", [
    {"trim": "XLT", "body_type": "suv", "engine_type": "2.3L I4 Turbo", "displacement": 2.3,
     "horsepower": 300, "torque": 310, "drivetrain": "RWD", "transmission_type": "10-speed auto",
     "curb_weight": 4345, "years": [2021, 2022, 2023, 2024]},
])

# ---- Chevrolet ------------------------------------------------------------
_add("Chevrolet", "Silverado 1500", [
    {"trim": "LT", "body_type": "truck", "engine_type": "2.7L I4 Turbo", "displacement": 2.7,
     "horsepower": 310, "torque": 430, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 4710, "years": [2022, 2023, 2024, 2025]},
    {"trim": "LT Trail Boss", "body_type": "truck", "engine_type": "5.3L V8", "displacement": 5.3,
     "horsepower": 355, "torque": 383, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 5150, "years": [2022, 2023, 2024]},
])
_add("Chevrolet", "Camaro", [
    {"trim": "LT1", "body_type": "coupe", "engine_type": "6.2L V8", "displacement": 6.2,
     "horsepower": 455, "torque": 455, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 3685, "years": [2020, 2021, 2022, 2023, 2024]},
])
_add("Chevrolet", "Corvette", [
    {"trim": "Stingray 1LT", "body_type": "coupe", "engine_type": "6.2L V8", "displacement": 6.2,
     "horsepower": 490, "torque": 465, "drivetrain": "RWD", "transmission_type": "8-speed DCT",
     "curb_weight": 3637, "years": [2023, 2024, 2025]},
])
_add("Chevrolet", "Equinox", [
    {"trim": "LT", "body_type": "suv", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 175, "torque": 203, "drivetrain": "FWD", "transmission_type": "6-speed auto",
     "curb_weight": 3274, "years": [2020, 2021, 2022, 2023, 2024]},
])

# ---- BMW ------------------------------------------------------------------
_add("BMW", "3 Series", [
    {"trim": "330i", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 255, "torque": 295, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3582, "years": [2020, 2021, 2022, 2023, 2024, 2025]},
    {"trim": "M340i xDrive", "body_type": "sedan", "engine_type": "3.0L I6 Turbo", "displacement": 3.0,
     "horsepower": 382, "torque": 369, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3876, "years": [2022, 2023, 2024]},
])
_add("BMW", "5 Series", [
    {"trim": "530i", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 255, "torque": 295, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 4012, "years": [2021, 2022, 2023, 2024]},
])
_add("BMW", "X3", [
    {"trim": "xDrive30i", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 248, "torque": 258, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4034, "years": [2022, 2023, 2024, 2025]},
])
_add("BMW", "M4", [
    {"trim": "Competition", "body_type": "coupe", "engine_type": "3.0L I6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 503, "torque": 479, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3830, "years": [2023, 2024, 2025]},
])

# ---- Mercedes-Benz --------------------------------------------------------
_add("Mercedes-Benz", "C-Class", [
    {"trim": "C 300", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 255, "torque": 295, "drivetrain": "RWD", "transmission_type": "9-speed auto",
     "curb_weight": 3660, "years": [2022, 2023, 2024, 2025]},
])
_add("Mercedes-Benz", "E-Class", [
    {"trim": "E 350", "body_type": "sedan", "engine_type": "2.0L I4 Turbo + EQ Boost", "displacement": 2.0,
     "horsepower": 255, "torque": 295, "drivetrain": "RWD", "transmission_type": "9-speed auto",
     "curb_weight": 4053, "years": [2024, 2025]},
])
_add("Mercedes-Benz", "GLC", [
    {"trim": "GLC 300 4MATIC", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 258, "torque": 295, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 4134, "years": [2022, 2023, 2024, 2025]},
])
_add("Mercedes-Benz", "AMG C 63", [
    {"trim": "S E Performance", "body_type": "sedan", "engine_type": "2.0L I4 Turbo + Hybrid", "displacement": 2.0,
     "horsepower": 671, "torque": 752, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 4654, "years": [2024, 2025]},
])

# ---- Audi -----------------------------------------------------------------
_add("Audi", "A4", [
    {"trim": "Premium", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 201, "torque": 236, "drivetrain": "FWD", "transmission_type": "7-speed DCT",
     "curb_weight": 3483, "years": [2020, 2021, 2022, 2023, 2024]},
])
_add("Audi", "A6", [
    {"trim": "Premium Plus", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 261, "torque": 273, "drivetrain": "AWD", "transmission_type": "7-speed DCT",
     "curb_weight": 3990, "years": [2022, 2023, 2024]},
])
_add("Audi", "Q5", [
    {"trim": "Premium Plus", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 261, "torque": 273, "drivetrain": "AWD", "transmission_type": "7-speed DCT",
     "curb_weight": 4056, "years": [2022, 2023, 2024, 2025]},
])
_add("Audi", "RS 5", [
    {"trim": "Sportback", "body_type": "sedan", "engine_type": "2.9L V6 Twin-Turbo", "displacement": 2.9,
     "horsepower": 444, "torque": 443, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4178, "years": [2023, 2024]},
])

# ---- Nissan ---------------------------------------------------------------
_add("Nissan", "Altima", [
    {"trim": "SV", "body_type": "sedan", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 188, "torque": 180, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 3208, "years": [2021, 2022, 2023, 2024]},
])
_add("Nissan", "Rogue", [
    {"trim": "SL", "body_type": "suv", "engine_type": "1.5L I3 Turbo", "displacement": 1.5,
     "horsepower": 201, "torque": 225, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3604, "years": [2022, 2023, 2024, 2025]},
])
_add("Nissan", "370Z", [
    {"trim": "Sport", "body_type": "coupe", "engine_type": "3.7L V6", "displacement": 3.7,
     "horsepower": 332, "torque": 270, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 3333, "years": [2018, 2019, 2020]},
])
_add("Nissan", "Z", [
    {"trim": "Performance", "body_type": "coupe", "engine_type": "3.0L V6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 400, "torque": 350, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 3536, "years": [2023, 2024, 2025]},
])

# ---- Hyundai --------------------------------------------------------------
_add("Hyundai", "Elantra", [
    {"trim": "SEL", "body_type": "sedan", "engine_type": "2.0L I4", "displacement": 2.0,
     "horsepower": 147, "torque": 132, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 2850, "years": [2022, 2023, 2024, 2025]},
    {"trim": "N", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 276, "torque": 289, "drivetrain": "FWD", "transmission_type": "6-speed manual",
     "curb_weight": 3197, "years": [2023, 2024, 2025]},
])
_add("Hyundai", "Tucson", [
    {"trim": "SEL", "body_type": "suv", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 187, "torque": 178, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3649, "years": [2022, 2023, 2024, 2025]},
])
_add("Hyundai", "Sonata", [
    {"trim": "SEL", "body_type": "sedan", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 191, "torque": 181, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3326, "years": [2020, 2021, 2022, 2023, 2024]},
])

# ---- Kia ------------------------------------------------------------------
_add("Kia", "K5", [
    {"trim": "GT-Line", "body_type": "sedan", "engine_type": "1.6L I4 Turbo", "displacement": 1.6,
     "horsepower": 180, "torque": 195, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3282, "years": [2022, 2023, 2024, 2025]},
])
_add("Kia", "Sportage", [
    {"trim": "X-Line", "body_type": "suv", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 187, "torque": 178, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3690, "years": [2023, 2024, 2025]},
])
_add("Kia", "Telluride", [
    {"trim": "SX", "body_type": "suv", "engine_type": "3.8L V6", "displacement": 3.8,
     "horsepower": 291, "torque": 262, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4482, "years": [2022, 2023, 2024]},
])
_add("Kia", "Stinger", [
    {"trim": "GT", "body_type": "sedan", "engine_type": "3.3L V6 Twin-Turbo", "displacement": 3.3,
     "horsepower": 368, "torque": 376, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3965, "years": [2018, 2019, 2020, 2021, 2022]},
])

# ---- Volkswagen -----------------------------------------------------------
_add("Volkswagen", "Jetta", [
    {"trim": "SE", "body_type": "sedan", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 158, "torque": 184, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3029, "years": [2022, 2023, 2024, 2025]},
])
_add("Volkswagen", "GTI", [
    {"trim": "S", "body_type": "hatchback", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 241, "torque": 273, "drivetrain": "FWD", "transmission_type": "6-speed manual",
     "curb_weight": 3186, "years": [2022, 2023, 2024, 2025]},
])
_add("Volkswagen", "Golf R", [
    {"trim": "Base", "body_type": "hatchback", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 315, "torque": 295, "drivetrain": "AWD", "transmission_type": "7-speed DCT",
     "curb_weight": 3417, "years": [2022, 2023, 2024, 2025]},
])
_add("Volkswagen", "Tiguan", [
    {"trim": "SE", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 184, "torque": 221, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3812, "years": [2022, 2023, 2024]},
])

# ---- Subaru ---------------------------------------------------------------
_add("Subaru", "WRX", [
    {"trim": "Premium", "body_type": "sedan", "engine_type": "2.4L H4 Turbo", "displacement": 2.4,
     "horsepower": 271, "torque": 258, "drivetrain": "AWD", "transmission_type": "6-speed manual",
     "curb_weight": 3349, "years": [2022, 2023, 2024, 2025]},
])
_add("Subaru", "Outback", [
    {"trim": "Premium", "body_type": "suv", "engine_type": "2.5L H4", "displacement": 2.5,
     "horsepower": 182, "torque": 176, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3672, "years": [2021, 2022, 2023, 2024]},
])
_add("Subaru", "Crosstrek", [
    {"trim": "Premium", "body_type": "suv", "engine_type": "2.0L H4", "displacement": 2.0,
     "horsepower": 152, "torque": 145, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3213, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Subaru", "BRZ", [
    {"trim": "Premium", "body_type": "coupe", "engine_type": "2.4L H4", "displacement": 2.4,
     "horsepower": 228, "torque": 184, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 2835, "years": [2022, 2023, 2024, 2025]},
])

# ---- Mazda ----------------------------------------------------------------
_add("Mazda", "Mazda3", [
    {"trim": "Preferred", "body_type": "sedan", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 191, "torque": 186, "drivetrain": "FWD", "transmission_type": "6-speed auto",
     "curb_weight": 3124, "years": [2021, 2022, 2023, 2024]},
    {"trim": "Turbo Premium Plus", "body_type": "hatchback", "engine_type": "2.5L I4 Turbo", "displacement": 2.5,
     "horsepower": 250, "torque": 320, "drivetrain": "AWD", "transmission_type": "6-speed auto",
     "curb_weight": 3389, "years": [2022, 2023, 2024]},
])
_add("Mazda", "CX-5", [
    {"trim": "Carbon Edition Turbo", "body_type": "suv", "engine_type": "2.5L I4 Turbo", "displacement": 2.5,
     "horsepower": 256, "torque": 320, "drivetrain": "AWD", "transmission_type": "6-speed auto",
     "curb_weight": 3726, "years": [2022, 2023, 2024]},
])
_add("Mazda", "MX-5 Miata", [
    {"trim": "Club", "body_type": "coupe", "engine_type": "2.0L I4", "displacement": 2.0,
     "horsepower": 181, "torque": 151, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 2341, "years": [2022, 2023, 2024, 2025]},
])

# ---- Lexus ----------------------------------------------------------------
_add("Lexus", "IS", [
    {"trim": "IS 350 F Sport", "body_type": "sedan", "engine_type": "3.5L V6", "displacement": 3.5,
     "horsepower": 311, "torque": 280, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3703, "years": [2022, 2023, 2024]},
])
_add("Lexus", "RX", [
    {"trim": "RX 350 Premium", "body_type": "suv", "engine_type": "2.4L I4 Turbo", "displacement": 2.4,
     "horsepower": 275, "torque": 317, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4222, "years": [2023, 2024, 2025]},
])
_add("Lexus", "RC F", [
    {"trim": "Base", "body_type": "coupe", "engine_type": "5.0L V8", "displacement": 5.0,
     "horsepower": 472, "torque": 395, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3902, "years": [2020, 2021, 2022, 2023, 2024]},
])

# ---- Jeep -----------------------------------------------------------------
_add("Jeep", "Wrangler", [
    {"trim": "Rubicon", "body_type": "suv", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 285, "torque": 260, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 4449, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Jeep", "Grand Cherokee", [
    {"trim": "Limited", "body_type": "suv", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 293, "torque": 260, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 4513, "years": [2022, 2023, 2024]},
])
_add("Jeep", "Gladiator", [
    {"trim": "Sport S", "body_type": "truck", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 285, "torque": 260, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 4650, "years": [2022, 2023, 2024]},
])

# ---- Ram ------------------------------------------------------------------
_add("Ram", "1500", [
    {"trim": "Big Horn", "body_type": "truck", "engine_type": "5.7L V8 HEMI", "displacement": 5.7,
     "horsepower": 395, "torque": 410, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 5014, "years": [2021, 2022, 2023, 2024]},
    {"trim": "Laramie", "body_type": "truck", "engine_type": "3.0L I6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 420, "torque": 469, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 5186, "years": [2025]},
])
_add("Ram", "TRX", [
    {"trim": "Base", "body_type": "truck", "engine_type": "6.2L V8 Supercharged", "displacement": 6.2,
     "horsepower": 702, "torque": 650, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 6395, "years": [2022, 2023]},
])

# ---- Tesla ----------------------------------------------------------------
_add("Tesla", "Model 3", [
    {"trim": "Long Range", "body_type": "sedan", "engine_type": "Electric", "displacement": 0.0,
     "horsepower": 346, "torque": 389, "drivetrain": "AWD", "transmission_type": "1-speed direct",
     "curb_weight": 3862, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "Performance", "body_type": "sedan", "engine_type": "Electric", "displacement": 0.0,
     "horsepower": 510, "torque": 546, "drivetrain": "AWD", "transmission_type": "1-speed direct",
     "curb_weight": 3965, "years": [2021, 2022, 2023, 2024]},
])
_add("Tesla", "Model Y", [
    {"trim": "Long Range", "body_type": "suv", "engine_type": "Electric", "displacement": 0.0,
     "horsepower": 384, "torque": 375, "drivetrain": "AWD", "transmission_type": "1-speed direct",
     "curb_weight": 4398, "years": [2022, 2023, 2024, 2025]},
])
_add("Tesla", "Model S", [
    {"trim": "Plaid", "body_type": "sedan", "engine_type": "Electric Tri-Motor", "displacement": 0.0,
     "horsepower": 1020, "torque": 1050, "drivetrain": "AWD", "transmission_type": "1-speed direct",
     "curb_weight": 4766, "years": [2023, 2024, 2025]},
])

# ---- Porsche --------------------------------------------------------------
_add("Porsche", "911", [
    {"trim": "Carrera S", "body_type": "coupe", "engine_type": "3.0L H6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 443, "torque": 390, "drivetrain": "RWD", "transmission_type": "8-speed PDK",
     "curb_weight": 3382, "years": [2022, 2023, 2024, 2025]},
])
_add("Porsche", "Cayenne", [
    {"trim": "S", "body_type": "suv", "engine_type": "4.0L V8 Twin-Turbo", "displacement": 4.0,
     "horsepower": 468, "torque": 442, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4850, "years": [2022, 2023, 2024]},
])
_add("Porsche", "718 Cayman", [
    {"trim": "GTS 4.0", "body_type": "coupe", "engine_type": "4.0L H6", "displacement": 4.0,
     "horsepower": 394, "torque": 309, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 3161, "years": [2022, 2023, 2024]},
])

# ---- Dodge ----------------------------------------------------------------
_add("Dodge", "Challenger", [
    {"trim": "R/T Scat Pack", "body_type": "coupe", "engine_type": "6.4L V8 HEMI", "displacement": 6.4,
     "horsepower": 485, "torque": 475, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 4230, "years": [2020, 2021, 2022, 2023]},
    {"trim": "SRT Hellcat", "body_type": "coupe", "engine_type": "6.2L V8 Supercharged", "displacement": 6.2,
     "horsepower": 717, "torque": 656, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 4448, "years": [2020, 2021, 2022, 2023]},
])
_add("Dodge", "Charger", [
    {"trim": "Scat Pack", "body_type": "sedan", "engine_type": "6.4L V8 HEMI", "displacement": 6.4,
     "horsepower": 485, "torque": 475, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 4381, "years": [2020, 2021, 2022, 2023]},
])
_add("Dodge", "Durango", [
    {"trim": "R/T", "body_type": "suv", "engine_type": "5.7L V8 HEMI", "displacement": 5.7,
     "horsepower": 360, "torque": 390, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 5363, "years": [2021, 2022, 2023, 2024]},
])

# ---- GMC ------------------------------------------------------------------
_add("GMC", "Sierra 1500", [
    {"trim": "AT4", "body_type": "truck", "engine_type": "5.3L V8", "displacement": 5.3,
     "horsepower": 355, "torque": 383, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 5161, "years": [2022, 2023, 2024, 2025]},
    {"trim": "Denali", "body_type": "truck", "engine_type": "6.2L V8", "displacement": 6.2,
     "horsepower": 420, "torque": 460, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 5385, "years": [2022, 2023, 2024]},
])
_add("GMC", "Yukon", [
    {"trim": "SLT", "body_type": "suv", "engine_type": "5.3L V8", "displacement": 5.3,
     "horsepower": 355, "torque": 383, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 5684, "years": [2022, 2023, 2024]},
])
_add("GMC", "Canyon", [
    {"trim": "AT4X", "body_type": "truck", "engine_type": "2.7L I4 Turbo", "displacement": 2.7,
     "horsepower": 310, "torque": 430, "drivetrain": "4WD", "transmission_type": "8-speed auto",
     "curb_weight": 4742, "years": [2023, 2024, 2025]},
])

# ---- Acura ---------------------------------------------------------------
_add("Acura", "TLX", [
    {"trim": "Technology", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 272, "torque": 280, "drivetrain": "FWD", "transmission_type": "10-speed auto",
     "curb_weight": 3682, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "Type S", "body_type": "sedan", "engine_type": "3.0L V6 Turbo", "displacement": 3.0,
     "horsepower": 355, "torque": 354, "drivetrain": "AWD", "transmission_type": "10-speed auto",
     "curb_weight": 4111, "years": [2022, 2023, 2024, 2025]},
])
_add("Acura", "MDX", [
    {"trim": "Technology", "body_type": "suv", "engine_type": "3.5L V6", "displacement": 3.5,
     "horsepower": 290, "torque": 267, "drivetrain": "AWD", "transmission_type": "10-speed auto",
     "curb_weight": 4451, "years": [2022, 2023, 2024, 2025]},
    {"trim": "Type S", "body_type": "suv", "engine_type": "3.0L V6 Turbo", "displacement": 3.0,
     "horsepower": 355, "torque": 354, "drivetrain": "AWD", "transmission_type": "10-speed auto",
     "curb_weight": 4714, "years": [2022, 2023, 2024, 2025]},
])
_add("Acura", "Integra", [
    {"trim": "A-Spec", "body_type": "hatchback", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 200, "torque": 192, "drivetrain": "FWD", "transmission_type": "CVT",
     "curb_weight": 3073, "years": [2023, 2024, 2025]},
    {"trim": "Type S", "body_type": "hatchback", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 320, "torque": 310, "drivetrain": "FWD", "transmission_type": "6-speed manual",
     "curb_weight": 3206, "years": [2024, 2025]},
])
_add("Acura", "RDX", [
    {"trim": "Technology", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 272, "torque": 280, "drivetrain": "AWD", "transmission_type": "10-speed auto",
     "curb_weight": 3902, "years": [2021, 2022, 2023, 2024, 2025]},
])

# ---- Alfa Romeo ----------------------------------------------------------
_add("Alfa Romeo", "Giulia", [
    {"trim": "Sprint", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 256, "torque": 295, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3514, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "Quadrifoglio", "body_type": "sedan", "engine_type": "2.9L V6 Twin-Turbo", "displacement": 2.9,
     "horsepower": 505, "torque": 443, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3753, "years": [2021, 2022, 2023, 2024]},
])
_add("Alfa Romeo", "Stelvio", [
    {"trim": "Sprint", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 256, "torque": 295, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3968, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "Quadrifoglio", "body_type": "suv", "engine_type": "2.9L V6 Twin-Turbo", "displacement": 2.9,
     "horsepower": 505, "torque": 443, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4266, "years": [2021, 2022, 2023, 2024]},
])

# ---- Buick ---------------------------------------------------------------
_add("Buick", "Enclave", [
    {"trim": "Essence", "body_type": "suv", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 310, "torque": 266, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 4685, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Buick", "Encore GX", [
    {"trim": "Sport Touring", "body_type": "suv", "engine_type": "1.3L I3 Turbo", "displacement": 1.3,
     "horsepower": 155, "torque": 174, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 3301, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Buick", "Envision", [
    {"trim": "Essence", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 228, "torque": 258, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 3809, "years": [2021, 2022, 2023, 2024]},
])

# ---- Cadillac ------------------------------------------------------------
_add("Cadillac", "CT4", [
    {"trim": "Premium Luxury", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 237, "torque": 258, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3461, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "V-Series Blackwing", "body_type": "sedan", "engine_type": "3.6L V6 Twin-Turbo", "displacement": 3.6,
     "horsepower": 472, "torque": 445, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 3884, "years": [2022, 2023, 2024, 2025]},
])
_add("Cadillac", "CT5", [
    {"trim": "Premium Luxury", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 237, "torque": 258, "drivetrain": "RWD", "transmission_type": "10-speed auto",
     "curb_weight": 3659, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "V-Series Blackwing", "body_type": "sedan", "engine_type": "6.2L V8 Supercharged", "displacement": 6.2,
     "horsepower": 668, "torque": 659, "drivetrain": "RWD", "transmission_type": "6-speed manual",
     "curb_weight": 4216, "years": [2022, 2023, 2024, 2025]},
])
_add("Cadillac", "Escalade", [
    {"trim": "Premium Luxury", "body_type": "suv", "engine_type": "6.2L V8", "displacement": 6.2,
     "horsepower": 420, "torque": 460, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 5822, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Cadillac", "XT4", [
    {"trim": "Premium Luxury", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 235, "torque": 258, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 3871, "years": [2021, 2022, 2023, 2024]},
])
_add("Cadillac", "XT5", [
    {"trim": "Premium Luxury", "body_type": "suv", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 310, "torque": 271, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 4217, "years": [2021, 2022, 2023, 2024]},
])
_add("Cadillac", "XT6", [
    {"trim": "Premium Luxury", "body_type": "suv", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 310, "torque": 271, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 4473, "years": [2021, 2022, 2023, 2024]},
])

# ---- Chrysler ------------------------------------------------------------
_add("Chrysler", "300", [
    {"trim": "Touring", "body_type": "sedan", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 292, "torque": 260, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 4013, "years": [2020, 2021, 2022, 2023]},
])
_add("Chrysler", "Pacifica", [
    {"trim": "Touring L", "body_type": "van", "engine_type": "3.6L V6", "displacement": 3.6,
     "horsepower": 287, "torque": 262, "drivetrain": "FWD", "transmission_type": "9-speed auto",
     "curb_weight": 4330, "years": [2021, 2022, 2023, 2024, 2025]},
])

# ---- Genesis -------------------------------------------------------------
_add("Genesis", "G70", [
    {"trim": "2.5T Sport", "body_type": "sedan", "engine_type": "2.5L I4 Turbo", "displacement": 2.5,
     "horsepower": 300, "torque": 311, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3627, "years": [2022, 2023, 2024, 2025]},
    {"trim": "3.3T Sport", "body_type": "sedan", "engine_type": "3.3L V6 Twin-Turbo", "displacement": 3.3,
     "horsepower": 365, "torque": 376, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3887, "years": [2020, 2021, 2022]},
])
_add("Genesis", "G80", [
    {"trim": "2.5T Advanced", "body_type": "sedan", "engine_type": "2.5L I4 Turbo", "displacement": 2.5,
     "horsepower": 300, "torque": 311, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4244, "years": [2022, 2023, 2024, 2025]},
])
_add("Genesis", "G90", [
    {"trim": "3.5T Prestige", "body_type": "sedan", "engine_type": "3.5L V6 Twin-Turbo", "displacement": 3.5,
     "horsepower": 409, "torque": 405, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 5071, "years": [2023, 2024, 2025]},
])
_add("Genesis", "GV70", [
    {"trim": "2.5T Advanced", "body_type": "suv", "engine_type": "2.5L I4 Turbo", "displacement": 2.5,
     "horsepower": 300, "torque": 311, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4156, "years": [2022, 2023, 2024, 2025]},
])
_add("Genesis", "GV80", [
    {"trim": "2.5T Advanced", "body_type": "suv", "engine_type": "2.5L I4 Turbo", "displacement": 2.5,
     "horsepower": 300, "torque": 311, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4576, "years": [2022, 2023, 2024, 2025]},
])

# ---- Infiniti ------------------------------------------------------------
_add("Infiniti", "Q50", [
    {"trim": "Luxe", "body_type": "sedan", "engine_type": "3.0L V6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 300, "torque": 295, "drivetrain": "RWD", "transmission_type": "7-speed auto",
     "curb_weight": 3714, "years": [2020, 2021, 2022, 2023, 2024]},
    {"trim": "Red Sport 400", "body_type": "sedan", "engine_type": "3.0L V6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 400, "torque": 350, "drivetrain": "RWD", "transmission_type": "7-speed auto",
     "curb_weight": 3774, "years": [2020, 2021, 2022, 2023, 2024]},
])
_add("Infiniti", "Q60", [
    {"trim": "Luxe", "body_type": "coupe", "engine_type": "3.0L V6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 300, "torque": 295, "drivetrain": "RWD", "transmission_type": "7-speed auto",
     "curb_weight": 3800, "years": [2020, 2021, 2022]},
])
_add("Infiniti", "QX50", [
    {"trim": "Sensory", "body_type": "suv", "engine_type": "2.0L I4 Turbo VC", "displacement": 2.0,
     "horsepower": 268, "torque": 280, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3979, "years": [2021, 2022, 2023, 2024]},
])
_add("Infiniti", "QX60", [
    {"trim": "Luxe", "body_type": "suv", "engine_type": "3.5L V6", "displacement": 3.5,
     "horsepower": 295, "torque": 270, "drivetrain": "AWD", "transmission_type": "9-speed auto",
     "curb_weight": 4556, "years": [2022, 2023, 2024, 2025]},
])
_add("Infiniti", "QX80", [
    {"trim": "Sensory", "body_type": "suv", "engine_type": "5.6L V8", "displacement": 5.6,
     "horsepower": 400, "torque": 413, "drivetrain": "4WD", "transmission_type": "7-speed auto",
     "curb_weight": 5817, "years": [2021, 2022, 2023, 2024]},
])

# ---- Land Rover ----------------------------------------------------------
_add("Land Rover", "Defender", [
    {"trim": "110 S", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 296, "torque": 295, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4904, "years": [2021, 2022, 2023, 2024, 2025]},
    {"trim": "V8", "body_type": "suv", "engine_type": "5.0L V8 Supercharged", "displacement": 5.0,
     "horsepower": 518, "torque": 461, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 5401, "years": [2022, 2023]},
])
_add("Land Rover", "Range Rover", [
    {"trim": "SE", "body_type": "suv", "engine_type": "3.0L I6 Turbo MHEV", "displacement": 3.0,
     "horsepower": 395, "torque": 406, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 5588, "years": [2022, 2023, 2024, 2025]},
])
_add("Land Rover", "Range Rover Sport", [
    {"trim": "Dynamic SE", "body_type": "suv", "engine_type": "3.0L I6 Turbo MHEV", "displacement": 3.0,
     "horsepower": 355, "torque": 369, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 5090, "years": [2023, 2024, 2025]},
])
_add("Land Rover", "Discovery", [
    {"trim": "S", "body_type": "suv", "engine_type": "3.0L I6 Turbo MHEV", "displacement": 3.0,
     "horsepower": 355, "torque": 369, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4935, "years": [2021, 2022, 2023, 2024]},
])

# ---- Lincoln -------------------------------------------------------------
_add("Lincoln", "Aviator", [
    {"trim": "Reserve", "body_type": "suv", "engine_type": "3.0L V6 Twin-Turbo", "displacement": 3.0,
     "horsepower": 400, "torque": 415, "drivetrain": "AWD", "transmission_type": "10-speed auto",
     "curb_weight": 5165, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Lincoln", "Corsair", [
    {"trim": "Reserve", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 250, "torque": 280, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3915, "years": [2021, 2022, 2023, 2024, 2025]},
])
_add("Lincoln", "Navigator", [
    {"trim": "Reserve", "body_type": "suv", "engine_type": "3.5L V6 Twin-Turbo", "displacement": 3.5,
     "horsepower": 440, "torque": 510, "drivetrain": "4WD", "transmission_type": "10-speed auto",
     "curb_weight": 5855, "years": [2021, 2022, 2023, 2024, 2025]},
])

# ---- Maserati ------------------------------------------------------------
_add("Maserati", "Ghibli", [
    {"trim": "GT", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 325, "torque": 332, "drivetrain": "RWD", "transmission_type": "8-speed auto",
     "curb_weight": 3906, "years": [2021, 2022, 2023]},
])
_add("Maserati", "Levante", [
    {"trim": "GT", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 325, "torque": 332, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4668, "years": [2021, 2022, 2023]},
])

# ---- Mini ----------------------------------------------------------------
_add("Mini", "Cooper", [
    {"trim": "S", "body_type": "hatchback", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 189, "torque": 207, "drivetrain": "FWD", "transmission_type": "7-speed DCT",
     "curb_weight": 2888, "years": [2022, 2023, 2024, 2025]},
])
_add("Mini", "Countryman", [
    {"trim": "S ALL4", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 189, "torque": 207, "drivetrain": "AWD", "transmission_type": "7-speed DCT",
     "curb_weight": 3483, "years": [2022, 2023, 2024, 2025]},
])

# ---- Mitsubishi ----------------------------------------------------------
_add("Mitsubishi", "Outlander", [
    {"trim": "SEL", "body_type": "suv", "engine_type": "2.5L I4", "displacement": 2.5,
     "horsepower": 181, "torque": 181, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3682, "years": [2022, 2023, 2024, 2025]},
])
_add("Mitsubishi", "Eclipse Cross", [
    {"trim": "SEL", "body_type": "suv", "engine_type": "1.5L I4 Turbo", "displacement": 1.5,
     "horsepower": 152, "torque": 184, "drivetrain": "AWD", "transmission_type": "CVT",
     "curb_weight": 3461, "years": [2021, 2022, 2023, 2024, 2025]},
])

# ---- Rivian --------------------------------------------------------------
_add("Rivian", "R1T", [
    {"trim": "Dual Large", "body_type": "truck", "engine_type": "Electric Dual-Motor", "displacement": 0.0,
     "horsepower": 600, "torque": 600, "drivetrain": "AWD", "transmission_type": "1-speed direct",
     "curb_weight": 6171, "years": [2022, 2023, 2024, 2025]},
])
_add("Rivian", "R1S", [
    {"trim": "Dual Large", "body_type": "suv", "engine_type": "Electric Dual-Motor", "displacement": 0.0,
     "horsepower": 600, "torque": 600, "drivetrain": "AWD", "transmission_type": "1-speed direct",
     "curb_weight": 6400, "years": [2022, 2023, 2024, 2025]},
])

# ---- Volvo ---------------------------------------------------------------
_add("Volvo", "S60", [
    {"trim": "Plus Dark Theme", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 247, "torque": 258, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3726, "years": [2022, 2023, 2024, 2025]},
])
_add("Volvo", "S90", [
    {"trim": "Plus Dark Theme", "body_type": "sedan", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 295, "torque": 310, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4070, "years": [2022, 2023, 2024]},
])
_add("Volvo", "XC40", [
    {"trim": "Plus", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 247, "torque": 258, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 3768, "years": [2022, 2023, 2024, 2025]},
])
_add("Volvo", "XC60", [
    {"trim": "Plus Dark Theme", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 247, "torque": 258, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4112, "years": [2022, 2023, 2024, 2025]},
])
_add("Volvo", "XC90", [
    {"trim": "Plus Dark Theme", "body_type": "suv", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 295, "torque": 310, "drivetrain": "AWD", "transmission_type": "8-speed auto",
     "curb_weight": 4576, "years": [2022, 2023, 2024, 2025]},
])
_add("Volvo", "V60", [
    {"trim": "Plus Dark Theme", "body_type": "wagon", "engine_type": "2.0L I4 Turbo", "displacement": 2.0,
     "horsepower": 247, "torque": 258, "drivetrain": "FWD", "transmission_type": "8-speed auto",
     "curb_weight": 3726, "years": [2022, 2023, 2024]},
])

# ---------------------------------------------------------------------------
# Part Type seed data
# ---------------------------------------------------------------------------

PART_TYPES: list[dict] = [
    {
        "name": "Engine",
        "slug": "engine",
        "category": "Powertrain",
        "icon": "\U0001F525",  # fire
        "description": (
            "The engine is the heart of your vehicle, converting fuel or electrical "
            "energy into mechanical motion. It determines your car's power output, "
            "fuel efficiency, and overall driving character."
        ),
        "how_it_works": (
            "Internal combustion engines operate on the four-stroke cycle: intake, "
            "compression, combustion, and exhaust. During the intake stroke, the "
            "piston moves down and draws in a mixture of air and fuel. The "
            "compression stroke pushes the piston up to compress this mixture, "
            "dramatically increasing its temperature and pressure.\n\n"
            "At the top of the compression stroke, the spark plug fires (in "
            "gasoline engines) or the fuel self-ignites (in diesels), forcing the "
            "piston down in the power stroke. Finally, the exhaust stroke pushes "
            "the spent gases out through the exhaust valve. This cycle repeats "
            "thousands of times per minute, with the crankshaft converting the "
            "pistons' linear motion into rotational force.\n\n"
            "Modern engines use sophisticated electronic fuel injection, variable "
            "valve timing (VVT), turbocharging, and direct injection to maximize "
            "power while minimizing emissions and fuel consumption. Electric "
            "motors, by contrast, use electromagnetic fields to spin a rotor "
            "directly, delivering instant torque with far fewer moving parts."
        ),
        "maintenance_schedule": (
            "Oil and filter change every 5,000-7,500 miles (conventional) or "
            "7,500-10,000 miles (synthetic). Spark plugs every 30,000-100,000 "
            "miles depending on type (copper vs. iridium). Timing belt/chain "
            "inspection at 60,000-100,000 miles. Valve adjustment (if applicable) "
            "every 60,000-90,000 miles."
        ),
        "common_failures": [
            "Oil leaks from valve cover gaskets and rear main seal",
            "Worn timing chain/belt causing rough idle or engine damage",
            "Carbon buildup on intake valves (direct injection engines)",
            "Head gasket failure causing coolant/oil mixing",
            "Failing ignition coils causing misfires",
            "Worn piston rings leading to oil consumption",
        ],
        "svg_diagram_key": "engine",
    },
    {
        "name": "Transmission",
        "slug": "transmission",
        "category": "Powertrain",
        "icon": "\u2699\uFE0F",  # gear
        "description": (
            "The transmission transfers engine power to the wheels through a series "
            "of gear ratios, allowing the vehicle to operate efficiently across a "
            "wide range of speeds. It is one of the most complex mechanical "
            "assemblies in your vehicle."
        ),
        "how_it_works": (
            "Manual transmissions use a clutch pedal and gear lever to let the "
            "driver select different gear ratios. When you press the clutch, it "
            "disconnects the engine from the gearbox, allowing you to slide gears "
            "into place. Lower gears provide more torque for acceleration while "
            "higher gears allow efficient cruising.\n\n"
            "Automatic transmissions use a torque converter (a fluid coupling) "
            "instead of a clutch, and planetary gear sets that are engaged by "
            "hydraulic clutch packs controlled by the transmission computer (TCM). "
            "Modern automatics with 8, 9, or 10 speeds achieve excellent fuel "
            "economy by keeping the engine in its most efficient RPM range.\n\n"
            "Continuously Variable Transmissions (CVTs) use a belt or chain "
            "running between two variable-diameter pulleys, providing an infinite "
            "number of gear ratios. Dual-Clutch Transmissions (DCTs) use two "
            "clutches — one for odd gears and one for even gears — enabling "
            "lightning-fast shifts with no torque interruption."
        ),
        "maintenance_schedule": (
            "Automatic transmission fluid change every 30,000-60,000 miles. "
            "Manual transmission fluid change every 30,000-60,000 miles. "
            "CVT fluid change every 25,000-30,000 miles. "
            "DCT fluid change every 40,000 miles. "
            "Clutch inspection (manual) at 60,000 miles."
        ),
        "common_failures": [
            "Worn clutch disc (manual) causing slipping",
            "Failing torque converter causing shudder",
            "Solenoid failures causing harsh or delayed shifting",
            "CVT belt/chain stretch causing juddering",
            "Transmission fluid leaks from pan gasket or seals",
            "Worn synchros (manual) making shifting difficult",
        ],
        "svg_diagram_key": "transmission",
    },
    {
        "name": "Suspension",
        "slug": "suspension",
        "category": "Chassis",
        "icon": "\U0001F6DE",  # wheel
        "description": (
            "The suspension system absorbs road imperfections, maintains tire "
            "contact with the road, and controls body movement during cornering, "
            "braking, and acceleration. It is critical to both ride comfort and "
            "handling performance."
        ),
        "how_it_works": (
            "Suspension systems consist of springs (coil, leaf, or air) that "
            "support the vehicle's weight and absorb bumps, and dampers (shock "
            "absorbers or struts) that control the rate at which the springs "
            "compress and rebound. Without dampers, the car would bounce "
            "uncontrollably after hitting a bump.\n\n"
            "Most modern cars use MacPherson strut front suspension, which "
            "integrates the spring, damper, and steering pivot into one compact "
            "unit. The rear may use a multi-link, torsion beam, or double-wishbone "
            "design. Anti-roll bars (sway bars) connect the left and right sides "
            "and resist body roll during cornering.\n\n"
            "Performance-oriented vehicles may feature adaptive or magnetic ride "
            "dampers that adjust firmness in real time, or air suspension that can "
            "raise and lower the vehicle. The geometry of the suspension — camber, "
            "caster, and toe angles — determines tire wear patterns and how the "
            "vehicle handles at the limit."
        ),
        "maintenance_schedule": (
            "Shock absorbers/struts inspection every 50,000 miles, replacement "
            "at 50,000-100,000 miles. Wheel alignment check every 12 months or "
            "after hitting a pothole. Ball joint and tie rod end inspection every "
            "40,000-50,000 miles. Bushings inspection every 60,000-80,000 miles."
        ),
        "common_failures": [
            "Worn shock absorbers causing excessive bouncing",
            "Broken coil springs causing uneven ride height",
            "Worn ball joints causing clunking and imprecise steering",
            "Deteriorated control arm bushings causing vibrations",
            "Leaking struts leaving oil residue on the housing",
            "Worn sway bar end links causing rattling over bumps",
        ],
        "svg_diagram_key": "suspension",
    },
    {
        "name": "Brakes",
        "slug": "brakes",
        "category": "Chassis",
        "icon": "\U0001F6D1",  # stop sign
        "description": (
            "The braking system converts the kinetic energy of your moving vehicle "
            "into heat through friction, allowing you to slow down and stop safely. "
            "Modern vehicles use disc brakes on the front and either disc or drum "
            "brakes on the rear."
        ),
        "how_it_works": (
            "When you press the brake pedal, a push rod activates the brake booster "
            "(which multiplies pedal force using engine vacuum or an electric pump), "
            "which then pushes a piston in the master cylinder. The master cylinder "
            "pressurizes brake fluid, sending hydraulic force through steel and "
            "rubber lines to each wheel.\n\n"
            "At each wheel, the pressurized fluid pushes pistons inside the brake "
            "caliper, which clamp the brake pads against the spinning rotor (disc). "
            "The friction between pad and rotor converts motion into heat, slowing "
            "the wheel. Ventilated rotors have internal cooling vanes to dissipate "
            "heat more effectively during heavy braking.\n\n"
            "The Anti-lock Braking System (ABS) uses wheel speed sensors to detect "
            "if a wheel is about to lock up. If lockup is detected, the ABS module "
            "rapidly modulates brake pressure (up to 15 times per second) to "
            "maintain traction. Electronic Stability Control (ESC) builds on ABS "
            "by selectively braking individual wheels to prevent skids."
        ),
        "maintenance_schedule": (
            "Brake pad inspection every 12,000-15,000 miles, replacement at "
            "25,000-70,000 miles depending on driving style. Rotor inspection at "
            "every pad change, replacement or resurfacing as needed. Brake fluid "
            "flush every 2 years or 30,000 miles. Brake line inspection annually."
        ),
        "common_failures": [
            "Worn brake pads causing squealing or grinding",
            "Warped rotors causing pedal pulsation",
            "Leaking brake calipers reducing stopping power",
            "Deteriorated brake hoses (rubber) causing spongy pedal",
            "Contaminated brake fluid absorbing moisture",
            "Seized caliper slide pins causing uneven pad wear",
        ],
        "svg_diagram_key": "brakes",
    },
    {
        "name": "Exhaust System",
        "slug": "exhaust",
        "category": "Powertrain",
        "icon": "\U0001F4A8",  # dash
        "description": (
            "The exhaust system routes combustion gases away from the engine, "
            "reduces harmful emissions through catalytic conversion, and manages "
            "noise levels through mufflers and resonators. It also affects engine "
            "performance through backpressure."
        ),
        "how_it_works": (
            "After combustion, exhaust gases exit the cylinder head through the "
            "exhaust manifold (or headers in performance applications), which "
            "collects gases from all cylinders into a single pipe. Turbocharged "
            "engines route these gases through the turbo's turbine wheel first, "
            "using their energy to spin the compressor.\n\n"
            "The gases then flow through the catalytic converter, which uses "
            "precious metals (platinum, palladium, rhodium) as catalysts to convert "
            "harmful carbon monoxide, hydrocarbons, and nitrogen oxides into less "
            "harmful carbon dioxide, water vapor, and nitrogen. Oxygen sensors "
            "before and after the catalytic converter allow the ECU to monitor its "
            "efficiency.\n\n"
            "From there, the exhaust passes through one or more resonators (which "
            "cancel specific sound frequencies) and mufflers (which use baffles or "
            "packing material to reduce overall volume) before exiting the tailpipe. "
            "Performance exhausts use larger-diameter piping and less restrictive "
            "mufflers to reduce backpressure and increase power."
        ),
        "maintenance_schedule": (
            "Visual inspection annually for rust, leaks, and damage. "
            "Catalytic converter lifespan typically 100,000+ miles. "
            "Oxygen sensor replacement every 60,000-100,000 miles. "
            "Exhaust hangers and clamps inspection every 30,000 miles."
        ),
        "common_failures": [
            "Rust-through on exhaust pipes and muffler body",
            "Failed catalytic converter causing P0420 code and rotten egg smell",
            "Cracked exhaust manifold causing ticking noise when cold",
            "Failing oxygen sensors causing poor fuel economy",
            "Broken exhaust hangers causing rattling",
            "Leaking gaskets at flange connections",
        ],
        "svg_diagram_key": "exhaust",
    },
    {
        "name": "Tires & Wheels",
        "slug": "tires-wheels",
        "category": "Chassis",
        "icon": "\U0001F6DE",  # wheel
        "description": (
            "Tires are the only contact point between your vehicle and the road. "
            "Along with the wheels they mount on, they affect handling, ride "
            "comfort, braking distance, fuel economy, and road noise. Proper "
            "tire selection and maintenance is critical for safety."
        ),
        "how_it_works": (
            "A tire is a complex composite of rubber compounds, steel belts, nylon "
            "or polyester cord plies, and bead wire. The tread pattern channels "
            "water away (preventing hydroplaning) and provides grip through a "
            "combination of mechanical interlocking with the road surface and "
            "adhesive friction from the rubber compound.\n\n"
            "Tire sidewalls contain key information: the size designation (e.g., "
            "P225/45R17) tells you the width in mm, aspect ratio (sidewall height "
            "as a percentage of width), construction type (R = radial), and wheel "
            "diameter in inches. Speed ratings and load indexes indicate the tire's "
            "maximum capabilities.\n\n"
            "Wheels (rims) are typically made from cast or forged aluminum alloy, "
            "or steel for budget applications. Wheel dimensions (width, diameter, "
            "offset, and bolt pattern) must match the vehicle. Wider wheels allow "
            "wider tires for more grip, but can increase steering effort and "
            "susceptibility to road damage. Lighter wheels reduce unsprung mass, "
            "improving handling response and ride quality."
        ),
        "maintenance_schedule": (
            "Tire pressure check monthly, set to door placard specification. "
            "Tire rotation every 5,000-7,500 miles. Wheel alignment check every "
            "12 months. Tire replacement when tread depth reaches 2/32 inch. "
            "Wheel balance check whenever vibration is felt."
        ),
        "common_failures": [
            "Uneven tread wear from improper alignment or inflation",
            "Sidewall bubbles from pothole or curb impacts",
            "Tire dry rot (cracking) from age and UV exposure",
            "Bent or cracked alloy wheels from impacts",
            "Slow air leaks from corroded wheel bead seat",
            "Tire noise from cupping caused by worn suspension",
        ],
        "svg_diagram_key": "tires-wheels",
    },
    {
        "name": "Air Intake",
        "slug": "air-intake",
        "category": "Powertrain",
        "icon": "\U0001F32C\uFE0F",  # wind
        "description": (
            "The air intake system delivers clean, filtered air to the engine for "
            "combustion. It includes the air filter, intake tubing, mass airflow "
            "sensor, and throttle body. Proper airflow is essential for engine "
            "performance and longevity."
        ),
        "how_it_works": (
            "Air enters through an opening at the front of the vehicle and passes "
            "through the air filter, which traps dust, pollen, and debris. The "
            "filtered air then flows through the intake tube past the Mass Airflow "
            "(MAF) sensor, which measures the volume and density of incoming air. "
            "This measurement is critical — the ECU uses it to calculate the "
            "correct amount of fuel to inject.\n\n"
            "The air then reaches the throttle body, a butterfly valve that "
            "controls airflow based on accelerator pedal position (drive-by-wire). "
            "From the throttle body, air enters the intake manifold, which "
            "distributes it evenly to each cylinder through individual runners. "
            "Runner length and diameter are tuned to take advantage of air pulse "
            "resonance for better cylinder filling.\n\n"
            "Performance intake systems (cold air intakes, short ram intakes) "
            "aim to reduce restrictions, lower intake air temperature, and improve "
            "airflow. Cooler, denser air contains more oxygen molecules, enabling "
            "more fuel to be burned and more power to be produced."
        ),
        "maintenance_schedule": (
            "Air filter replacement every 15,000-30,000 miles or annually. "
            "MAF sensor cleaning every 15,000-30,000 miles with dedicated cleaner. "
            "Throttle body cleaning every 30,000-60,000 miles. "
            "Intake hose and clamp inspection annually."
        ),
        "common_failures": [
            "Clogged air filter reducing airflow and fuel economy",
            "Contaminated MAF sensor causing incorrect fuel mixture",
            "Cracked or disconnected intake hose causing vacuum leak",
            "Carbon-fouled throttle body causing rough idle",
            "Failed idle air control valve causing stalling",
            "Intake manifold gasket leak causing vacuum loss",
        ],
        "svg_diagram_key": "air-intake",
    },
    {
        "name": "ECU / Electronics",
        "slug": "ecu-electronics",
        "category": "Electrical",
        "icon": "\U0001F4BB",  # laptop
        "description": (
            "The Engine Control Unit (ECU) is the vehicle's primary computer, "
            "managing fuel injection, ignition timing, emissions, and dozens of "
            "other engine parameters. Modern vehicles contain 30-100+ electronic "
            "control modules managing every system from the powertrain to comfort."
        ),
        "how_it_works": (
            "The ECU continuously reads data from dozens of sensors — MAF, MAP, "
            "O2 sensors, coolant temperature, crank/cam position, throttle "
            "position, knock sensors, and more. Using lookup tables and algorithms "
            "stored in its firmware, it calculates the optimal fuel injection "
            "duration, ignition timing advance, idle speed, and variable valve "
            "timing position hundreds of times per second.\n\n"
            "The ECU also manages emissions controls, activating the EGR valve, "
            "purge valve (EVAP system), and secondary air injection at precise "
            "moments. It monitors catalyst efficiency via pre- and post-catalyst "
            "oxygen sensors and stores Diagnostic Trouble Codes (DTCs) when "
            "faults are detected, triggering the check engine light.\n\n"
            "Beyond the engine ECU, modern vehicles have a Transmission Control "
            "Module (TCM), Body Control Module (BCM), ABS module, airbag module, "
            "and many more. These communicate over the CAN bus (Controller Area "
            "Network), a serial data network that allows modules to share sensor "
            "data and coordinate actions at high speed."
        ),
        "maintenance_schedule": (
            "No regular maintenance required for the ECU itself. "
            "Battery and charging system check annually. "
            "Diagnostic scan recommended at every service visit. "
            "Software/firmware updates as released by manufacturer. "
            "CAN bus connector inspection if communication faults arise."
        ),
        "common_failures": [
            "Corroded connectors causing intermittent sensor faults",
            "Failed sensors providing incorrect data to ECU",
            "Water intrusion damaging electronic modules",
            "Software bugs requiring dealer firmware update",
            "Battery voltage issues corrupting module memory",
            "CAN bus wiring faults causing multiple warning lights",
        ],
        "svg_diagram_key": "ecu-electronics",
    },
    {
        "name": "Turbo / Supercharger",
        "slug": "turbo-supercharger",
        "category": "Powertrain",
        "icon": "\U0001F300",  # cyclone
        "description": (
            "Forced induction systems — turbochargers and superchargers — compress "
            "incoming air to pack more oxygen into each cylinder, dramatically "
            "increasing engine power output without increasing engine displacement. "
            "They are key to modern downsized engine strategies."
        ),
        "how_it_works": (
            "A turbocharger uses exhaust gas energy to spin a turbine wheel at up "
            "to 250,000 RPM. This turbine shares a shaft with a compressor wheel "
            "on the intake side, which compresses incoming air. Because "
            "compressing air also heats it (reducing density), an intercooler is "
            "used to cool the charge air before it enters the engine, maximizing "
            "the density benefit.\n\n"
            "Superchargers are mechanically driven by a belt connected to the "
            "crankshaft. Common types include Roots (twin rotating lobes), "
            "twin-screw (meshing helical rotors), and centrifugal (looks like a "
            "turbo compressor but belt-driven). Because they are directly driven, "
            "superchargers provide immediate boost with no turbo lag, but consume "
            "some engine power to operate.\n\n"
            "The wastegate (turbo) or bypass valve (supercharger) regulates "
            "maximum boost pressure to protect the engine. The ECU also retards "
            "ignition timing and enriches the fuel mixture under boost to prevent "
            "detonation (knock). Boost pressure is typically 7-25 PSI on factory "
            "turbo engines, with performance tunes pushing higher."
        ),
        "maintenance_schedule": (
            "Use quality synthetic oil and change on schedule — turbo oil feeds "
            "are critical. Intercooler inspection every 60,000 miles. "
            "Boost leak check if power loss is noticed. "
            "Turbo oil feed/drain line inspection at 80,000 miles. "
            "Supercharger belt inspection every 30,000 miles."
        ),
        "common_failures": [
            "Turbo oil seal failure causing blue exhaust smoke",
            "Wastegate actuator failure causing over- or under-boost",
            "Intercooler leaks reducing charge air cooling",
            "Compressor wheel damage from debris ingestion",
            "Turbo lag compensation — blow-off valve failure",
            "Supercharger bearing wear causing whining noise",
        ],
        "svg_diagram_key": "turbo-supercharger",
    },
    {
        "name": "Fuel System",
        "slug": "fuel-system",
        "category": "Powertrain",
        "icon": "\u26FD",  # fuel pump
        "description": (
            "The fuel system stores, filters, and delivers fuel to the engine at "
            "the correct pressure and volume. It includes the fuel tank, pump, "
            "filter, fuel rail, and injectors. Proper fuel delivery is essential "
            "for clean combustion and maximum power."
        ),
        "how_it_works": (
            "The electric fuel pump, located inside the fuel tank and submerged in "
            "gasoline (which acts as coolant), pressurizes fuel and sends it "
            "through the fuel line to the engine bay. Port injection systems "
            "operate at 40-60 PSI, while direct injection systems require a "
            "mechanical high-pressure pump (driven by a camshaft lobe) to achieve "
            "2,000-3,000+ PSI.\n\n"
            "A fuel filter removes contaminants that could damage injectors. The "
            "fuel rail distributes pressurized fuel evenly to all injectors. The "
            "fuel pressure regulator maintains consistent pressure (returning "
            "excess fuel to the tank in returnless systems via the regulator at "
            "the pump module).\n\n"
            "Fuel injectors are electromagnetic valves that spray a precisely "
            "metered amount of fuel in a fine mist pattern. The ECU controls "
            "injector pulse width (open time) in milliseconds, adjusting fuel "
            "delivery based on sensor inputs. Modern engines may use both port "
            "and direct injection together (dual injection) to combine the "
            "benefits of each system."
        ),
        "maintenance_schedule": (
            "Fuel filter replacement every 20,000-40,000 miles (external) or "
            "lifetime (in-tank). Fuel injector cleaning every 30,000-60,000 "
            "miles. Fuel system pressure test if performance issues arise. "
            "Use Top Tier gasoline to prevent deposit buildup."
        ),
        "common_failures": [
            "Clogged fuel injectors causing misfires and rough idle",
            "Weak fuel pump causing stalling or hard starting",
            "Leaking fuel injector O-rings creating fire hazard",
            "Failed fuel pressure regulator causing rich/lean condition",
            "EVAP system purge valve leak triggering check engine light",
            "Contaminated fuel (water intrusion) causing poor running",
        ],
        "svg_diagram_key": "fuel-system",
    },
    {
        "name": "Cooling System",
        "slug": "cooling-system",
        "category": "Powertrain",
        "icon": "\u2744\uFE0F",  # snowflake
        "description": (
            "The cooling system maintains the engine at its optimal operating "
            "temperature (195-220\u00B0F / 90-105\u00B0C), preventing overheating while "
            "allowing the engine to warm up quickly. It also provides cabin heat "
            "through the heater core."
        ),
        "how_it_works": (
            "Coolant (a 50/50 mixture of antifreeze and water) circulates through "
            "passages in the engine block and cylinder head, absorbing combustion "
            "heat. The water pump, driven by a belt or the engine directly, "
            "circulates this coolant continuously. When the engine is cold, the "
            "thermostat remains closed, allowing the engine to warm up quickly by "
            "preventing coolant from reaching the radiator.\n\n"
            "Once the coolant reaches operating temperature, the thermostat opens, "
            "allowing hot coolant to flow to the radiator. The radiator is a "
            "heat exchanger with thin aluminum tubes and fins — as air passes "
            "through (aided by electric fans at low speeds), heat transfers from "
            "the coolant to the air. The cooled coolant then returns to the engine.\n\n"
            "The system operates under pressure (13-18 PSI) via the radiator cap, "
            "which raises the boiling point of the coolant to approximately "
            "265\u00B0F. An expansion/overflow tank accommodates coolant expansion as "
            "it heats. Turbocharged engines often have a separate coolant circuit "
            "for the intercooler, and some performance vehicles add an oil cooler "
            "to the system."
        ),
        "maintenance_schedule": (
            "Coolant level check monthly. Coolant flush and replacement every "
            "30,000-60,000 miles or 5 years (long-life coolant). "
            "Radiator hose inspection every 30,000 miles, replacement at 60,000. "
            "Water pump inspection at timing belt service. "
            "Thermostat replacement if sticking (typically 80,000-100,000 miles)."
        ),
        "common_failures": [
            "Thermostat stuck open or closed causing overcooling or overheating",
            "Radiator leak from corrosion or stone impact",
            "Water pump bearing or seal failure causing leak and noise",
            "Cracked or swollen radiator hoses causing coolant loss",
            "Leaking heater core causing foggy windshield and sweet smell",
            "Radiator fan motor or relay failure causing overheating at idle",
        ],
        "svg_diagram_key": "cooling-system",
    },
    {
        "name": "Steering System",
        "slug": "steering",
        "category": "Chassis",
        "icon": "\U0001F3CE\uFE0F",  # racing car
        "description": (
            "The steering system allows the driver to control the direction of the "
            "vehicle by converting steering wheel rotation into lateral wheel "
            "movement. Modern vehicles use power-assisted rack-and-pinion steering "
            "for precise, low-effort control."
        ),
        "how_it_works": (
            "When you turn the steering wheel, the steering column transmits the "
            "rotation through universal joints to the steering rack. The rack-and-"
            "pinion mechanism converts the rotary motion of the pinion gear into "
            "linear motion of the rack, which pushes or pulls the tie rods "
            "connected to the steering knuckles at each front wheel.\n\n"
            "Electric Power Steering (EPS) uses an electric motor mounted on the "
            "steering column or rack to provide assist. A torque sensor measures "
            "how much the driver is turning the wheel, and the EPS control module "
            "adjusts motor output accordingly. EPS is speed-sensitive — providing "
            "more assist at low speeds (parking) and less at highway speeds for "
            "better road feel.\n\n"
            "Older vehicles use Hydraulic Power Steering (HPS) with a belt-driven "
            "pump that pressurizes power steering fluid. This fluid acts on a "
            "piston in the rack to assist steering effort. While HPS provides "
            "excellent road feel, EPS is more efficient because it only draws "
            "power when steering assist is needed, improving fuel economy by "
            "1-3%."
        ),
        "maintenance_schedule": (
            "Power steering fluid check every 6 months (hydraulic systems). "
            "Power steering fluid flush every 50,000-75,000 miles (hydraulic). "
            "Tie rod end inspection every 40,000-50,000 miles. "
            "Steering rack boot inspection annually. "
            "EPS systems are maintenance-free under normal conditions."
        ),
        "common_failures": [
            "Worn tie rod ends causing wandering and uneven tire wear",
            "Power steering pump failure (hydraulic) causing stiff steering",
            "Leaking steering rack seals causing fluid loss",
            "EPS motor or torque sensor failure causing assist loss",
            "Worn steering rack bushings causing clunking on center",
            "Intermediate shaft U-joint wear causing clicking when turning",
        ],
        "svg_diagram_key": "steering",
    },
]

# ---------------------------------------------------------------------------
# Upgrade Category seed data
# ---------------------------------------------------------------------------

UPGRADE_CATEGORIES: dict[str, list[dict]] = {
    "engine": [
        {"name": "Performance Tune", "slug": "engine-performance-tune",
         "description": "ECU remapping or piggyback tuning to optimize fuel maps, ignition timing, and boost targets for increased horsepower and torque.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["OBD-II laptop/cable", "Tuning software"]},
        {"name": "Engine Mount Kit", "slug": "engine-mount-kit",
         "description": "Upgraded polyurethane or solid engine mounts that reduce drivetrain movement under hard acceleration, improving shift feel and throttle response.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Jack and jack stands", "Socket set", "Torque wrench", "Engine support bar"]},
        {"name": "Spark Plug Kit", "slug": "engine-spark-plug-kit",
         "description": "High-performance iridium or platinum spark plugs that provide a stronger, more consistent spark for improved combustion and throttle response.",
         "difficulty_rating": 2, "estimated_install_time": "30 min - 1 hour",
         "tools_needed": ["Spark plug socket", "Torque wrench", "Anti-seize compound", "Gap gauge"]},
        {"name": "Valve Cover / Dress-Up", "slug": "engine-valve-cover",
         "description": "Aftermarket valve covers and engine bay dress-up kits that improve aesthetics and can address common oil leak issues.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Socket set", "Screwdriver set", "RTV sealant", "Torque wrench"]},
    ],
    "transmission": [
        {"name": "Short Throw Shifter", "slug": "transmission-short-throw-shifter",
         "description": "Reduces shift throw distance by 20-40% for quicker, more precise gear changes. A popular upgrade for manual transmission enthusiasts.",
         "difficulty_rating": 3, "estimated_install_time": "2-3 hours",
         "tools_needed": ["Socket set", "Ratchet", "Shifter bushing tool", "Transmission fluid"]},
        {"name": "Transmission Fluid Upgrade", "slug": "transmission-fluid-upgrade",
         "description": "High-performance synthetic transmission fluid that provides better thermal stability and smoother shifts under demanding conditions.",
         "difficulty_rating": 2, "estimated_install_time": "30 min - 1 hour",
         "tools_needed": ["Drain pan", "Socket set", "Fluid pump", "Torque wrench"]},
        {"name": "Clutch Kit", "slug": "transmission-clutch-kit",
         "description": "Upgraded clutch disc, pressure plate, and throw-out bearing to handle increased power from engine modifications. Available in organic, cerametallic, or multi-disc configurations.",
         "difficulty_rating": 5, "estimated_install_time": "6-10 hours",
         "tools_needed": ["Transmission jack", "Clutch alignment tool", "Socket set", "Torque wrench", "Flywheel lock"]},
        {"name": "Lightweight Flywheel", "slug": "transmission-lightweight-flywheel",
         "description": "Reduces rotational mass for faster engine response and quicker rev-matching. Typically paired with a clutch upgrade.",
         "difficulty_rating": 5, "estimated_install_time": "6-10 hours (with clutch)",
         "tools_needed": ["Transmission jack", "Flywheel lock tool", "Torque wrench", "Thread locker"]},
    ],
    "suspension": [
        {"name": "Coilover Kit", "slug": "suspension-coilover-kit",
         "description": "Height-adjustable coilover suspension with independent ride height and damping adjustment. The most versatile suspension upgrade for street and track use.",
         "difficulty_rating": 4, "estimated_install_time": "4-6 hours",
         "tools_needed": ["Spring compressor", "Socket set", "Torque wrench", "Jack and jack stands", "Alignment recommended"]},
        {"name": "Lowering Springs", "slug": "suspension-lowering-springs",
         "description": "Progressive-rate springs that lower the vehicle 1-2 inches for improved handling and appearance while retaining factory dampers.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Spring compressor", "Socket set", "Jack and jack stands", "Alignment recommended"]},
        {"name": "Strut / Shock Kit", "slug": "suspension-strut-shock-kit",
         "description": "Performance dampers calibrated for sportier handling with improved body control during cornering, braking, and acceleration.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Socket set", "Spring compressor (for struts)", "Torque wrench", "Jack and jack stands"]},
        {"name": "Sway Bar Kit", "slug": "suspension-sway-bar-kit",
         "description": "Thicker front and/or rear anti-roll bars that reduce body roll during cornering. Adjustable end links allow fine-tuning of balance.",
         "difficulty_rating": 3, "estimated_install_time": "1-3 hours",
         "tools_needed": ["Socket set", "Ratchet", "Jack and jack stands", "Penetrating lubricant"]},
        {"name": "Camber Kit", "slug": "suspension-camber-kit",
         "description": "Adjustable camber arms or plates that allow precise alignment settings beyond factory specifications, essential for lowered vehicles.",
         "difficulty_rating": 3, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Socket set", "Torque wrench", "Alignment recommended"]},
    ],
    "brakes": [
        {"name": "Brake Pad Kit", "slug": "brakes-pad-kit",
         "description": "Performance brake pads (ceramic, semi-metallic, or track compound) that offer improved stopping power, fade resistance, and reduced dust.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Socket set", "C-clamp or brake piston tool", "Brake cleaner", "Anti-squeal compound"]},
        {"name": "Brake Rotor Kit", "slug": "brakes-rotor-kit",
         "description": "Slotted, drilled, or two-piece rotors that improve heat dissipation and wet-weather braking while reducing unsprung weight.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Socket set", "Torque wrench", "Brake cleaner", "Thread locker (if needed)"]},
        {"name": "Big Brake Kit", "slug": "brakes-big-brake-kit",
         "description": "Larger calipers, rotors, and pads that dramatically increase braking force and heat capacity. Essential for high-power builds or track use.",
         "difficulty_rating": 4, "estimated_install_time": "3-5 hours",
         "tools_needed": ["Socket set", "Torque wrench", "Brake bleeding kit", "Brake fluid", "Jack and jack stands"]},
        {"name": "Stainless Steel Brake Lines", "slug": "brakes-ss-lines",
         "description": "Braided stainless steel brake lines that eliminate the expansion of rubber hoses under pressure, providing a firmer, more consistent pedal feel.",
         "difficulty_rating": 3, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Flare nut wrenches", "Brake bleeding kit", "Brake fluid", "Jack and jack stands"]},
    ],
    "exhaust": [
        {"name": "Cat-Back Exhaust", "slug": "exhaust-cat-back",
         "description": "Complete exhaust system from the catalytic converter back, including mid-pipe, muffler, and tips. Improves sound, reduces weight, and can add 5-15 HP.",
         "difficulty_rating": 3, "estimated_install_time": "2-3 hours",
         "tools_needed": ["Socket set", "Penetrating lubricant", "Jack and jack stands", "Exhaust hangers"]},
        {"name": "Axle-Back Exhaust", "slug": "exhaust-axle-back",
         "description": "Replaces the muffler and tailpipe section only. The easiest exhaust upgrade for improved sound with minimal impact on emissions.",
         "difficulty_rating": 2, "estimated_install_time": "30 min - 1 hour",
         "tools_needed": ["Socket set", "Penetrating lubricant", "Jack and jack stands"]},
        {"name": "Headers", "slug": "exhaust-headers",
         "description": "Tubular exhaust manifolds with tuned runner lengths for improved exhaust scavenging. Offers the biggest power gains of any exhaust component.",
         "difficulty_rating": 4, "estimated_install_time": "4-8 hours",
         "tools_needed": ["Socket set (deep)", "Header gaskets", "Penetrating lubricant", "Jack and jack stands", "O2 sensor socket"]},
        {"name": "Downpipe", "slug": "exhaust-downpipe",
         "description": "Larger-diameter pipe connecting the turbo outlet to the rest of the exhaust. Reduces backpressure on turbocharged engines for significant power gains.",
         "difficulty_rating": 4, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Socket set", "Penetrating lubricant", "Jack and jack stands", "O2 sensor socket", "V-band clamp pliers"]},
    ],
    "tires-wheels": [
        {"name": "Performance Tire Set", "slug": "tires-performance-set",
         "description": "Ultra-high-performance summer or all-season tires with aggressive tread compounds for maximum grip in dry and wet conditions.",
         "difficulty_rating": 1, "estimated_install_time": "1 hour (shop mount/balance)",
         "tools_needed": ["Tire mounting machine (shop)", "Wheel balancer (shop)", "Torque wrench"]},
        {"name": "Wheel Upgrade", "slug": "tires-wheel-upgrade",
         "description": "Lightweight forged or flow-formed alloy wheels that reduce unsprung mass, improve handling response, and enhance vehicle appearance.",
         "difficulty_rating": 1, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Torque wrench", "Hub-centric rings (if needed)", "Jack and jack stands"]},
        {"name": "Wheel Spacers", "slug": "tires-wheel-spacers",
         "description": "Hub-centric spacers that push the wheels outward for a wider stance, improving cornering stability and filling out the wheel wells.",
         "difficulty_rating": 2, "estimated_install_time": "1 hour",
         "tools_needed": ["Torque wrench", "Extended wheel studs (if needed)", "Jack and jack stands"]},
        {"name": "TPMS Sensor Kit", "slug": "tires-tpms-kit",
         "description": "Replacement or additional tire pressure monitoring sensors for aftermarket wheels, ensuring the dash warning system functions correctly.",
         "difficulty_rating": 2, "estimated_install_time": "1 hour (with tire dismount)",
         "tools_needed": ["TPMS programming tool", "Torque wrench", "Tire machine (shop)"]},
    ],
    "air-intake": [
        {"name": "Cold Air Intake", "slug": "air-intake-cold-air",
         "description": "Relocates the air filter away from engine heat, drawing cooler, denser air for improved combustion. Typically adds 5-20 HP and an aggressive intake sound.",
         "difficulty_rating": 2, "estimated_install_time": "30 min - 1 hour",
         "tools_needed": ["Socket set", "Screwdriver set", "Hose clamp pliers"]},
        {"name": "Short Ram Intake", "slug": "air-intake-short-ram",
         "description": "A shorter, less restrictive intake tube with a high-flow filter. Easier to install than a cold air intake but may draw warmer engine bay air.",
         "difficulty_rating": 1, "estimated_install_time": "20-30 minutes",
         "tools_needed": ["Socket set", "Screwdriver set"]},
        {"name": "Air Filter (Drop-in)", "slug": "air-intake-drop-in-filter",
         "description": "High-flow reusable cotton or foam air filter that drops into the factory airbox. The simplest intake upgrade with no modification required.",
         "difficulty_rating": 1, "estimated_install_time": "5-10 minutes",
         "tools_needed": ["None (hand removal of airbox clips)"]},
    ],
    "ecu-electronics": [
        {"name": "ECU Tune / Flash", "slug": "ecu-tune-flash",
         "description": "Custom or off-the-shelf ECU calibration that optimizes ignition timing, fuel maps, boost targets, and rev limits for increased performance.",
         "difficulty_rating": 2, "estimated_install_time": "30 min - 1 hour",
         "tools_needed": ["OBD-II tuning device", "Laptop with tuning software"]},
        {"name": "Piggyback Tune Module", "slug": "ecu-piggyback-module",
         "description": "Plug-and-play module that intercepts and modifies sensor signals to adjust fueling and boost without altering the factory ECU software.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Trim removal tools", "Zip ties", "Wiring connectors"]},
        {"name": "Wideband O2 Gauge", "slug": "ecu-wideband-o2-gauge",
         "description": "A precision air-fuel ratio gauge that lets you monitor combustion mixture in real time — essential for tuning safety.",
         "difficulty_rating": 3, "estimated_install_time": "2-3 hours",
         "tools_needed": ["Drill and step bit (for gauge pod)", "O2 sensor bung welder or adapter", "Wire strippers", "Soldering iron"]},
        {"name": "Data Logger / OBD-II Monitor", "slug": "ecu-data-logger",
         "description": "A device that records real-time engine data for analysis. Helps identify issues, validate tunes, and track performance improvements.",
         "difficulty_rating": 1, "estimated_install_time": "5 minutes (plug-in)",
         "tools_needed": ["OBD-II port access"]},
    ],
    "turbo-supercharger": [
        {"name": "Turbo Upgrade Kit", "slug": "turbo-upgrade-kit",
         "description": "Larger or more efficient turbocharger with supporting hardware. Significant power gains but requires supporting fuel and ECU modifications.",
         "difficulty_rating": 5, "estimated_install_time": "8-16 hours",
         "tools_needed": ["Socket set (metric/SAE)", "Turbo oil line kit", "Torque wrench", "Exhaust gaskets", "Coolant", "Oil"]},
        {"name": "Intercooler Upgrade", "slug": "turbo-intercooler-upgrade",
         "description": "Larger front-mount or top-mount intercooler for lower charge air temperatures, reducing the risk of detonation and enabling higher boost levels.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Socket set", "Hose clamp pliers", "Trim removal tools", "Zip ties"]},
        {"name": "Blow-Off Valve", "slug": "turbo-blow-off-valve",
         "description": "Vents excess boost pressure when the throttle closes, preventing compressor surge. Adjustable for full vent-to-atmosphere or recirculation.",
         "difficulty_rating": 2, "estimated_install_time": "30 min - 1 hour",
         "tools_needed": ["Socket set", "Hose clamp pliers", "Vacuum line"]},
        {"name": "Boost Controller", "slug": "turbo-boost-controller",
         "description": "Manual or electronic device that controls wastegate duty cycle to achieve higher or more consistent boost pressure than factory settings.",
         "difficulty_rating": 3, "estimated_install_time": "1-3 hours",
         "tools_needed": ["Vacuum/boost line", "Zip ties", "Wiring tools (electronic type)", "Socket set"]},
    ],
    "fuel-system": [
        {"name": "Fuel Injector Upgrade", "slug": "fuel-injector-upgrade",
         "description": "Higher-flow fuel injectors to support increased power from turbo, supercharger, or other modifications. Must be paired with an ECU tune.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Socket set", "Fuel injector removal tool", "O-ring lube", "Shop towels"]},
        {"name": "High-Flow Fuel Pump", "slug": "fuel-pump-upgrade",
         "description": "In-tank or inline fuel pump with higher flow capacity to ensure adequate fuel delivery at high power levels.",
         "difficulty_rating": 4, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Fuel pump access tool", "Socket set", "Fuel line disconnect tool", "Multimeter"]},
        {"name": "Fuel Pressure Regulator", "slug": "fuel-pressure-regulator",
         "description": "Adjustable fuel pressure regulator for fine-tuning fuel delivery. Important for forced induction builds requiring higher fuel pressure under boost.",
         "difficulty_rating": 3, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Fuel line wrenches", "Teflon tape", "Socket set", "Fuel pressure gauge"]},
        {"name": "Flex Fuel Kit", "slug": "fuel-flex-fuel-kit",
         "description": "Ethanol content sensor and ECU tune that allow the vehicle to run on any blend of gasoline and E85 ethanol, which supports higher boost and power.",
         "difficulty_rating": 3, "estimated_install_time": "1-3 hours",
         "tools_needed": ["Fuel line tools", "Socket set", "Wiring tools", "ECU tuning device"]},
    ],
    "cooling-system": [
        {"name": "Radiator Upgrade", "slug": "cooling-radiator-upgrade",
         "description": "Larger or thicker aluminum radiator with increased cooling capacity for modified engines or track use.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Socket set", "Drain pan", "Coolant", "Hose clamp pliers", "Trim removal tools"]},
        {"name": "Oil Cooler Kit", "slug": "cooling-oil-cooler-kit",
         "description": "Auxiliary oil-to-air or oil-to-water cooler that keeps engine oil temperatures in the safe range during spirited driving or towing.",
         "difficulty_rating": 3, "estimated_install_time": "2-4 hours",
         "tools_needed": ["Socket set", "Oil filter sandwich plate", "AN fittings", "Zip ties", "Engine oil"]},
        {"name": "Silicone Hose Kit", "slug": "cooling-silicone-hose-kit",
         "description": "Multi-ply silicone coolant hoses that withstand higher temperatures and pressures than rubber, with a longer service life and cleaner appearance.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Hose clamp pliers", "Drain pan", "Coolant", "T-stat housing gasket"]},
        {"name": "Electric Fan Upgrade", "slug": "cooling-electric-fan-upgrade",
         "description": "High-CFM electric cooling fans with programmable controller, replacing less efficient mechanical fans or upgrading factory electric fans.",
         "difficulty_rating": 3, "estimated_install_time": "2-3 hours",
         "tools_needed": ["Socket set", "Wire strippers", "Relay and wiring kit", "Zip ties", "Drill (for mounting)"]},
    ],
    "steering": [
        {"name": "Quick-Ratio Steering Rack", "slug": "steering-quick-ratio-rack",
         "description": "Steering rack with a faster ratio for quicker turn-in response. Reduces the number of turns lock-to-lock for a sportier feel.",
         "difficulty_rating": 5, "estimated_install_time": "4-6 hours",
         "tools_needed": ["Socket set", "Tie rod end separator", "Power steering fluid", "Alignment required"]},
        {"name": "Steering Wheel Upgrade", "slug": "steering-wheel-upgrade",
         "description": "Aftermarket flat-bottom or deep-dish steering wheel with improved grip and ergonomics. Often paired with a quick-release hub for easy removal.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Steering wheel puller", "Socket set", "Torx set (for airbag)", "Clock spring adapter"]},
        {"name": "Power Steering Cooler", "slug": "steering-ps-cooler",
         "description": "Inline cooler for hydraulic power steering fluid, preventing overheating during spirited driving or autocross events.",
         "difficulty_rating": 2, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Flare nut wrenches", "Power steering fluid", "Zip ties", "Hose clamps"]},
        {"name": "Tie Rod Upgrade", "slug": "steering-tie-rod-upgrade",
         "description": "Heavy-duty or adjustable tie rod ends for improved durability and precise alignment adjustment, especially important for lowered or tracked vehicles.",
         "difficulty_rating": 3, "estimated_install_time": "1-2 hours",
         "tools_needed": ["Tie rod separator", "Adjustable wrench", "Torque wrench", "Alignment required"]},
    ],
}


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

async def seed_vehicles(session):
    """Insert vehicles if the table is empty."""
    count = (await session.execute(select(func.count(Vehicle.id)))).scalar()
    if count > 0:
        print(f"  Vehicles table already has {count} rows — skipping.")
        return

    objects = [Vehicle(**v) for v in VEHICLES]
    session.add_all(objects)
    await session.flush()
    print(f"  Inserted {len(objects)} vehicles.")


async def seed_part_types(session) -> dict[str, int]:
    """Insert part types if the table is empty. Returns slug->id map."""
    count = (await session.execute(select(func.count(PartType.id)))).scalar()
    if count > 0:
        print(f"  PartTypes table already has {count} rows — skipping.")
        rows = (await session.execute(select(PartType))).scalars().all()
        return {r.slug: r.id for r in rows}

    slug_to_id: dict[str, int] = {}
    for pt_data in PART_TYPES:
        pt = PartType(**pt_data)
        session.add(pt)
        await session.flush()
        slug_to_id[pt.slug] = pt.id
    print(f"  Inserted {len(PART_TYPES)} part types.")
    return slug_to_id


async def seed_upgrade_categories(session, slug_to_id: dict[str, int]):
    """Insert upgrade categories if the table is empty."""
    count = (await session.execute(select(func.count(UpgradeCategory.id)))).scalar()
    if count > 0:
        print(f"  UpgradeCategories table already has {count} rows — skipping.")
        return

    total = 0
    for part_slug, categories in UPGRADE_CATEGORIES.items():
        pt_id = slug_to_id.get(part_slug)
        if pt_id is None:
            print(f"  WARNING: No part type found for slug '{part_slug}' — skipping its upgrades.")
            continue
        for cat_data in categories:
            cat = UpgradeCategory(part_type_id=pt_id, **cat_data)
            session.add(cat)
            total += 1
    await session.flush()
    print(f"  Inserted {total} upgrade categories.")


async def seed_all():
    """Create tables and seed all data."""
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables ready.\n")

    print("Seeding data...")
    async with async_session() as session:
        async with session.begin():
            await seed_vehicles(session)
            slug_to_id = await seed_part_types(session)
            await seed_upgrade_categories(session, slug_to_id)

    print(f"\nDone. Total vehicle entries in dataset: {len(VEHICLES)}")


if __name__ == "__main__":
    asyncio.run(seed_all())
