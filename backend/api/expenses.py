from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
import sqlite3


router = APIRouter()


# ==========================================
# Expense Request Model
# ==========================================

class ExpenseCreate(BaseModel):

    user_id: int
    category: str
    amount: float
    date: str
    notes: str = ""


# ==========================================
# Expense Update Model
# ==========================================

class ExpenseUpdate(BaseModel):

    user_id: int
    category: str
    amount: float
    date: str
    notes: str = ""


# ==========================================
# Add Expense
# ==========================================

@router.post("/expenses")
def add_expense(expense: ExpenseCreate):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO expenses
        (
            user_id,
            category,
            amount,
            date,
            notes
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            expense.user_id,
            expense.category,
            expense.amount,
            expense.date,
            expense.notes
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Expense added successfully!"
    }


# ==========================================
# Get Expense Records
# ==========================================

@router.get("/expenses")
def get_expenses(user_id: int):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            user_id,
            category,
            amount,
            date,
            notes
        FROM expenses
        WHERE user_id = ?
        ORDER BY date DESC, id DESC
        """,
        (user_id,)
    )

    expense_records = cursor.fetchall()

    connection.close()

    return {
        "success": True,
        "expenses": [
            {
                "id": expense["id"],
                "user_id": expense["user_id"],
                "category": expense["category"],
                "amount": expense["amount"],
                "date": expense["date"],
                "notes": expense["notes"]
            }
            for expense in expense_records
        ]
    }


# ==========================================
# Update Expense
# ==========================================

@router.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    expense: ExpenseUpdate
):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM expenses
        WHERE id = ?
        AND user_id = ?
        """,
        (
            expense_id,
            expense.user_id
        )
    )

    existing_expense = cursor.fetchone()

    if not existing_expense:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Expense record not found."
        )

    cursor.execute(
        """
        UPDATE expenses
        SET
            category = ?,
            amount = ?,
            date = ?,
            notes = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            expense.category,
            expense.amount,
            expense.date,
            expense.notes,
            expense_id,
            expense.user_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Expense updated successfully!"
    }


# ==========================================
# Delete Expense
# ==========================================

@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    user_id: int
):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM expenses
        WHERE id = ?
        AND user_id = ?
        """,
        (
            expense_id,
            user_id
        )
    )

    existing_expense = cursor.fetchone()

    if not existing_expense:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Expense record not found."
        )

    cursor.execute(
        """
        DELETE FROM expenses
        WHERE id = ?
        AND user_id = ?
        """,
        (
            expense_id,
            user_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Expense deleted successfully!"
    }