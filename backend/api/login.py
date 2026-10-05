from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.database import get_connection

router = APIRouter()


class LoginUser(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(user: LoginUser):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT * FROM users
        WHERE email = ? AND password = ?
        """,
        (user.email, user.password)
    )

    existing_user = cursor.fetchone()

    connection.close()

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
    "success": True,
    "message": "Login successful!",
    "user_id": existing_user["id"],
    "full_name": existing_user["full_name"],
    "email": existing_user["email"]
}