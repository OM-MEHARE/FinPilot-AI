from fastapi import APIRouter, HTTPException
from backend.models.user import UserRegister
from backend.database import get_connection
from pwdlib import PasswordHash

router = APIRouter()

password_hash = PasswordHash.recommended()


@router.post("/register")
def register(user: UserRegister):

    connection = get_connection()
    cursor = connection.cursor()

    # Check if email already exists
    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (user.email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # Hash the password before storing it
    hashed_password = password_hash.hash(user.password)

    # Insert new user
    cursor.execute(
        """
        INSERT INTO users(full_name, email, password)
        VALUES (?, ?, ?)
        """,
        (
            user.full_name,
            user.email,
            hashed_password
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "User registered successfully!"
    }