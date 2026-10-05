from pydantic import BaseModel


class Income(BaseModel):

    user_id: int

    source: str

    amount: float

    date: str