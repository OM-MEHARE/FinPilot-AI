from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash

from backend.database import get_connection


router = APIRouter()

password_hash = PasswordHash.recommended()


class LoginUser(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(user: LoginUser):

    connection = get_connection()
    cursor = connection.cursor()

    # Find the user by email
    cursor.execute(
        """
        SELECT * FROM users
        WHERE email = ?
        """,
        (user.email,)
    )

    existing_user = cursor.fetchone()

    if not existing_user:
        connection.close()

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    stored_password = existing_user["password"]

    # =========================================================
    # SECURE ARGON2 PASSWORD
    # =========================================================

    if stored_password.startswith("$argon2"):

        password_is_valid = password_hash.verify(
            user.password,
            stored_password
        )

    # =========================================================
    # LEGACY PASSWORD SUPPORT
    # =========================================================

    else:

        password_is_valid = (
            user.password == stored_password
        )

        # Automatically upgrade the legacy password
        # after successful login.
        if password_is_valid:

            hashed_password = password_hash.hash(
                user.password
            )

            cursor.execute(
                """
                UPDATE users
                SET password = ?
                WHERE id = ?
                """,
                (
                    hashed_password,
                    existing_user["id"]
                )
            )

            connection.commit()

    connection.close()

    if not password_is_valid:

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