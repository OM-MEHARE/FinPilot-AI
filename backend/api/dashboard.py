from fastapi import APIRouter
from backend.database import get_connection


router = APIRouter()


# ==========================================
# Dashboard
# ==========================================

@router.get("/dashboard")
def dashboard(user_id: int):

    connection = get_connection()

    cursor = connection.cursor()


    # ==========================================
    # Get Total Income
    # ==========================================

    cursor.execute(
        """
        SELECT
            IFNULL(SUM(amount), 0) AS total_income
        FROM income
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    )

    income_result = cursor.fetchone()


    # ==========================================
    # Get Total Expenses
    # ==========================================

    cursor.execute(
        """
        SELECT
            IFNULL(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    )

    expense_result = cursor.fetchone()


    # ==========================================
    # Get Recent Expenses
    # ==========================================

    cursor.execute(
        """
        SELECT
            category,
            amount,
            date,
            notes
        FROM expenses
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 5
        """,
        (
            user_id,
        )
    )

    recent_expenses = cursor.fetchall()


    # ==========================================
    # Get Monthly Expenses
    # ==========================================

    cursor.execute(
        """
        SELECT
            strftime('%Y-%m', date) AS month,
            SUM(amount) AS total
        FROM expenses
        WHERE user_id = ?
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month
        """,
        (
            user_id,
        )
    )

    monthly_expenses = cursor.fetchall()


    # ==========================================
    # Get Expense Categories
    # ==========================================

    cursor.execute(
        """
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE user_id = ?
        GROUP BY category
        ORDER BY total DESC
        """,
        (
            user_id,
        )
    )

    category_expenses = cursor.fetchall()


    # ==========================================
    # Close Database Connection
    # ==========================================

    connection.close()


    # ==========================================
    # Calculate Financial Summary
    # ==========================================

    total_income =income_result["total_income"]

    total_expenses =expense_result["total_expenses"]

    balance =total_income - total_expenses


    # ==========================================
    # Prepare Recent Transactions
    # ==========================================

    transactions = []


    for expense in recent_expenses:

        transactions.append({

            "category":
                expense["category"],

            "amount":
                expense["amount"],

            "date":
                expense["date"],

            "notes":
                expense["notes"]

        })


    # ==========================================
    # Return Dashboard Data
    # ==========================================

    return {

        "total_income":
            total_income,

        "total_expenses":
            total_expenses,

        "balance":
            balance,

        "recent_transactions":
            transactions,

        "monthly_expenses": [

            {

                "month":
                    expense["month"],

                "total":
                    expense["total"]

            }

            for expense in monthly_expenses

        ],

        "category_expenses": [

            {

                "category":
                    expense["category"],

                "total":
                    expense["total"]

            }

            for expense in category_expenses

        ]

    }