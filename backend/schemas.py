from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ClientCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: Optional[EmailStr] = None


class ClientUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[EmailStr] = None


class ClientViewModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: Optional[EmailStr] = None
