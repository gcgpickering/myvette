from pydantic import BaseModel


class VehicleBase(BaseModel):
    year: int
    make: str
    model: str
    trim: str
    body_type: str


class VehicleResponse(VehicleBase):
    id: int
    engine_type: str | None = None
    displacement: float | None = None
    horsepower: int | None = None
    torque: int | None = None
    drivetrain: str | None = None
    transmission_type: str | None = None
    curb_weight: int | None = None

    model_config = {"from_attributes": True}


class VehicleSearchParams(BaseModel):
    year: int | None = None
    make: str | None = None
    model: str | None = None
