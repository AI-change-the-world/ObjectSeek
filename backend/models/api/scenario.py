from pydantic import BaseModel


class CreateScenarioRequest(BaseModel):
    name: str
    description: str = ""


class UpdateScenarioRequest(BaseModel):
    name: str = None
    description: str = None
    id: int
