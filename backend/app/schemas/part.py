from pydantic import BaseModel


class PartTypeResponse(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    icon: str | None = None
    description: str
    how_it_works: str
    maintenance_schedule: str | None = None
    common_failures: list[str] = []
    svg_diagram_key: str | None = None

    model_config = {"from_attributes": True}


class VehiclePartResponse(BaseModel):
    id: int
    vehicle_id: int
    part_type_id: int
    part_type: PartTypeResponse
    specs: dict = {}
    oem_part_numbers: list[str] = []

    model_config = {"from_attributes": True}


class UpgradeCategoryResponse(BaseModel):
    id: int
    part_type_id: int
    name: str
    slug: str
    description: str | None = None
    difficulty_rating: int | None = None
    estimated_install_time: str | None = None
    tools_needed: list[str] = []

    model_config = {"from_attributes": True}
