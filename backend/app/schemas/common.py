from pydantic import BaseModel


class Health(BaseModel):
    status: str
    version: str
    env: str


class ErrorBody(BaseModel):
    code: str
    message: str
