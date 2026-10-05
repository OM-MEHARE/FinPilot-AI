from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel

from backend.models.income import Income
from backend.database import get_connection


router = APIRouter()


# -----------------------------
# Add Income
# -----------------------------

@router.post("/income")
def add_income(income: Income):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO income (user_id, source, amount, date)
        VALUES (?, ?, ?, ?)
        """,
        (
            income.user_id,
            income.source,
            income.amount,
            income.date
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Income added successfully!"
    }


# -----------------------------
# Get Income Records
# -----------------------------

@router.get("/income")
def get_income(user_id: int):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            user_id,
            source,
            amount,
            date
        FROM income
        WHERE user_id = ?
        ORDER BY date DESC, id DESC
        """,
        (user_id,)
    )

    income_records = cursor.fetchall()

    connection.close()

    return {
        "success": True,
        "income": [
            {
                "id": record["id"],
                "user_id": record["user_id"],
                "source": record["source"],
                "amount": record["amount"],
                "date": record["date"]
            }
            for record in income_records
        ]
    }


# -----------------------------
# Update Income
# -----------------------------

class IncomeUpdate(BaseModel):
    user_id: int
    source: str
    amount: float
    date: str


@router.put("/income/{income_id}")
def update_income(
    income_id: int,
    income: IncomeUpdate
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM income
        WHERE id = ?
        AND user_id = ?
        """,
        (
            income_id,
            income.user_id
        )
    )

    existing_income = cursor.fetchone()

    if not existing_income:
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Income record not found."
        )

    cursor.execute(
        """
        UPDATE income
        SET
            source = ?,
            amount = ?,
            date = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            income.source,
            income.amount,
            income.date,
            income_id,
            income.user_id
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Income updated successfully!"
    }


# -----------------------------
# Delete Income
# -----------------------------

@router.delete("/income/{income_id}")
def delete_income(
    income_id: int,
    user_id: int
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM income
        WHERE id = ?
        AND user_id = ?
        """,
        (
            income_id,
            user_id
        )
    )

    existing_income = cursor.fetchone()

    if not existing_income:
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Income record not found."
        )

    cursor.execute(
        """
        DELETE FROM income
        WHERE id = ?
        AND user_id = ?
        """,
        (
            income_id,
            user_id
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Income deleted successfully!"
    }