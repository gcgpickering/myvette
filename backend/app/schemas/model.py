from pydantic import BaseModel


class ModelStatusResponse(BaseModel):
    status: str
    slug: str
    source: str | None = None
    file_path: str | None = None
    error: str | None = None


class ModelGenerateRequest(BaseModel):
    year: int
    make: str
    model: str
    body_type: str = "sedan"
