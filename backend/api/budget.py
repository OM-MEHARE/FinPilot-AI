from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3


router = APIRouter()


# ==========================================
# Budget Request Model
# ==========================================

class BudgetCreate(BaseModel):

    user_id: int
    category: str
    limit_amount: float


# ==========================================
# Add Budget
# ==========================================

@router.post("/budgets")
def add_budget(budget: BudgetCreate):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO budgets
        (
            user_id,
            category,
            limit_amount
        )
        VALUES (?, ?, ?)
        """,
        (
            budget.user_id,
            budget.category,
            budget.limit_amount
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Budget added successfully!"
    }


# ==========================================
# Get User Budgets
# ==========================================

@router.get("/budgets")
def get_budgets(user_id: int):

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
            limit_amount
        FROM budgets
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (
            user_id,
        )
    )

    budgets = cursor.fetchall()

    budget_list = []

    for budget in budgets:

        cursor.execute(
            """
            SELECT
                IFNULL(SUM(amount), 0) AS spent
            FROM expenses
            WHERE user_id = ?
            AND category = ?
            """,
            (
                budget["user_id"],
                budget["category"]
            )
        )

        expense_result = cursor.fetchone()

        spent = expense_result["spent"]

        remaining = (
            budget["limit_amount"] - spent
        )

        if budget["limit_amount"] > 0:

            usage = (
                spent /
                budget["limit_amount"]
            ) * 100

        else:

            usage = 0

        if usage >= 100:

            status = "Over Budget"

        elif usage >= 80:

            status = "Near Limit"

        else:

            status = "On Track"

        budget_list.append({

            "id":
                budget["id"],

            "user_id":
                budget["user_id"],

            "category":
                budget["category"],

            "limit_amount":
                budget["limit_amount"],

            "spent":
                spent,

            "remaining":
                remaining,

            "usage":
                round(usage, 2),

            "status":
                status

        })

    connection.close()

    return {

        "success": True,

        "budgets":
            budget_list

    }


# ==========================================
# Get Budget Alerts
# ==========================================

@router.get("/budget-alerts")
def get_budget_alerts(user_id: int):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            b.id,
            b.category,
            b.limit_amount,
            IFNULL(SUM(e.amount), 0) AS spent
        FROM budgets b
        LEFT JOIN expenses e
            ON b.user_id = e.user_id
            AND b.category = e.category
        WHERE b.user_id = ?
        GROUP BY
            b.id,
            b.category,
            b.limit_amount
        ORDER BY b.id DESC
        """,
        (
            user_id,
        )
    )

    budgets = cursor.fetchall()

    alerts = []

    for budget in budgets:

        budget_limit = budget["limit_amount"]

        spent = budget["spent"]

        if budget_limit > 0:

            usage = (
                spent /
                budget_limit
            ) * 100

        else:

            usage = 0

        if usage >= 100:

            alert_type = "Over Budget"

        elif usage >= 80:

            alert_type = "Near Limit"

        else:

            continue

        alerts.append({

            "category":
                budget["category"],

            "budget":
                budget_limit,

            "spent":
                spent,

            "usage":
                round(
                    usage,
                    2
                ),

            "alert_type":
                alert_type

        })

    connection.close()

    return {

        "success": True,

        "alerts":
            alerts

    }
# ==========================================
# Delete Budget
# ==========================================

@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    user_id: int
):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM budgets
        WHERE id = ?
        AND user_id = ?
        """,
        (
            budget_id,
            user_id
        )
    )

    budget = cursor.fetchone()

    if not budget:

        connection.close()

        return {
            "success": False,
            "message": "Budget not found."
        }

    cursor.execute(
        """
        DELETE FROM budgets
        WHERE id = ?
        AND user_id = ?
        """,
        (
            budget_id,
            user_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Budget deleted successfully!"
    }

# ==========================================
# Update Budget
# ==========================================

class BudgetUpdate(BaseModel):

    user_id: int
    category: str
    limit_amount: float


@router.put("/budgets/{budget_id}")
def update_budget(
    budget_id: int,
    budget: BudgetUpdate
):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    # Check whether the budget belongs to the logged-in user
    cursor.execute(
        """
        SELECT id
        FROM budgets
        WHERE id = ?
        AND user_id = ?
        """,
        (
            budget_id,
            budget.user_id
        )
    )

    existing_budget = cursor.fetchone()

    if not existing_budget:

        connection.close()

        return {
            "success": False,
            "message": "Budget not found."
        }

    # Update the budget
    cursor.execute(
        """
        UPDATE budgets
        SET
            category = ?,
            limit_amount = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            budget.category,
            budget.limit_amount,
            budget_id,
            budget.user_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Budget updated successfully!"
    }
