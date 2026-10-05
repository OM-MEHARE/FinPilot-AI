from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3

from backend.services.ai_service import (
    generate_financial_insight
)


router = APIRouter()

# ==========================================
# AI Chat Request Model
# ==========================================

class AIChatRequest(BaseModel):

    user_id: int
    message: str


# ==========================================
# AI Budget Coach
# ==========================================

@router.get("/ai-coach")
def ai_coach(user_id: int):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()


    # ==========================================
    # Get Total Income for Current User
    # ==========================================

    cursor.execute(
        """
        SELECT
            IFNULL(SUM(amount), 0) AS total_income
        FROM income
        WHERE user_id = ?
        """,
        (user_id,)
    )

    income_result = cursor.fetchone()


    # ==========================================
    # Get Total Expenses for Current User
    # ==========================================

    cursor.execute(
        """
        SELECT
            IFNULL(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE user_id = ?
        """,
        (user_id,)
    )

    total_expense_result = cursor.fetchone()


    # ==========================================
    # Analyze Expense Categories for Current User
    # ==========================================

    cursor.execute(
        """
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE user_id = ?
        GROUP BY LOWER(category)
        ORDER BY total DESC
        """,
        (user_id,)
    )

    category_rows = cursor.fetchall()

    expense_categories = []

    for category in category_rows:

        expense_categories.append({

            "category":
                category["category"],

            "total":
                category["total"]

        })


    # ==========================================
    # Get Budgets for Current User
    # ==========================================

    cursor.execute(
        """
        SELECT
            id,
            category,
            limit_amount,
            user_id
        FROM budgets
        WHERE user_id = ?
        """,
        (user_id,)
    )

    budget_rows = cursor.fetchall()

    budgets = []


    for budget in budget_rows:

        cursor.execute(
            """
            SELECT
                IFNULL(SUM(amount), 0) AS spent
            FROM expenses
            WHERE user_id = ?
            AND LOWER(category) = LOWER(?)
            """,
            (
                user_id,
                budget["category"]
            )
        )

        budget_expense_result =cursor.fetchone()


        spent =budget_expense_result["spent"]


        # ==========================================
        # Calculate Budget Usage
        # ==========================================

        if budget["limit_amount"] > 0:

            usage = (
                spent /
                budget["limit_amount"]
            ) * 100

        else:

            usage = 0


        budgets.append({

            "category":
                budget["category"],

            "limit_amount":
                budget["limit_amount"],

            "spent":
                spent,

            "usage":
                usage

        })


    # ==========================================
    # Get Savings Goals for Current User
    # ==========================================

    cursor.execute(
        """
        SELECT
            id,
            goal_name,
            target_amount,
            saved_amount,
            target_date
        FROM goals
        WHERE user_id = ?
        """,
        (user_id,)
    )

    goal_rows = cursor.fetchall()

    goals = []


    for goal in goal_rows:

        target_amount =goal["target_amount"]

        saved_amount =goal["saved_amount"]


        # ==========================================
        # Calculate Goal Progress
        # ==========================================

        if target_amount > 0:

            progress = (
                saved_amount /
                target_amount
            ) * 100

        else:

            progress = 0


        goals.append({

            "goal_name":
                goal["goal_name"],

            "target_amount":
                target_amount,

            "saved_amount":
                saved_amount,

            "progress":
                round(
                    min(progress, 100),
                    2
                ),

            "target_date":
                goal["target_date"]

        })


    # ==========================================
    # Generate AI Insight
    # ==========================================

    insight = generate_financial_insight(
        income_result["total_income"],
        total_expense_result["total_expenses"],
        budgets,
        goals,
        expense_categories
    )


    # ==========================================
    # Close Database Connection
    # ==========================================

    connection.close()


    # ==========================================
    # Return AI Coach Data
    # ==========================================

    return {

        "success": True,

        "insight": insight

    }

# ==========================================
# AI Financial Chat Assistant
# ==========================================

@router.post("/ai-chat")
def ai_chat(request: AIChatRequest):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    connection.row_factory = sqlite3.Row

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
        (request.user_id,)
    )

    income_result = cursor.fetchone()

    total_income = income_result["total_income"]


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
        (request.user_id,)
    )

    expense_result = cursor.fetchone()

    total_expenses = expense_result["total_expenses"]


    # ==========================================
    # Get Highest Spending Category
    # ==========================================

    cursor.execute(
        """
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE user_id = ?
        GROUP BY LOWER(category)
        ORDER BY total DESC
        LIMIT 1
        """,
        (request.user_id,)
    )

    highest_category = cursor.fetchone()


    # ==========================================
    # Get Budget Information
    # ==========================================

    cursor.execute(
        """
        SELECT
            b.category,
            b.limit_amount,
            IFNULL(
                (
                    SELECT SUM(e.amount)
                    FROM expenses e
                    WHERE e.user_id = b.user_id
                    AND LOWER(e.category) = LOWER(b.category)
                ),
                0
            ) AS spent
        FROM budgets b
        WHERE b.user_id = ?
        ORDER BY b.id DESC
        """,
        (request.user_id,)
    )

    budget_rows = cursor.fetchall()


    # ==========================================
    # Get Savings Goals
    # ==========================================

    cursor.execute(
        """
        SELECT
            goal_name,
            target_amount,
            saved_amount,
            target_date
        FROM goals
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (request.user_id,)
    )

    goal_rows = cursor.fetchall()


    connection.close()


    # ==========================================
    # Calculate Balance
    # ==========================================

    balance = total_income - total_expenses


    # ==========================================
    # Prepare User Message
    # ==========================================

    message = request.message.strip().lower()


    if not message:

        return {
            "success": False,
            "message": "Please enter a question."
        }


    # ==========================================
    # Financial Questions
    # ==========================================

    if (
        "income" in message
        or "earned" in message
        or "earn" in message
        or "salary" in message
    ):

        reply = (
            "Your total recorded income is ₹" +
            f"{total_income:,.2f}."
        )


    elif (
        "expense" in message
        or "spent" in message
        or "spending" in message
        or "spend" in message
    ):

        reply = (
            "Your total recorded expenses are ₹" +
            f"{total_expenses:,.2f}."
        )


    elif (
        "balance" in message
        or "left" in message
        or "remaining money" in message
        or "how much money" in message
    ):

        reply = (
            "Your current balance is ₹" +
            f"{balance:,.2f}."
        )


    elif (
        "highest" in message
        or "most" in message
        or "largest" in message
        or "category" in message
    ):

        if highest_category:

            category_name = highest_category["category"]
            category_amount = highest_category["total"]

            reply = (
                "Your highest spending category is " +
                str(category_name) +
                ", with spending of ₹" +
                f"{category_amount:,.2f}."
            )

        else:

            reply = (
                "You do not have any expense records yet."
            )


    elif (
        "budget" in message
        or "budgets" in message
    ):

        if not budget_rows:

            reply = (
                "You currently do not have any budgets. "
                "Create a budget to start monitoring your spending."
            )

        else:

            budget_messages = []

            for budget in budget_rows:

                category = budget["category"]
                limit_amount = budget["limit_amount"]
                spent = budget["spent"]

                if limit_amount > 0:

                    usage = (
                        spent /
                        limit_amount
                    ) * 100

                else:

                    usage = 0

                if usage >= 100:

                    status = "over budget"

                elif usage >= 80:

                    status = "close to its limit"

                else:

                    status = "on track"

                budget_messages.append(
                    category +
                    " is " +
                    status +
                    " with ₹" +
                    f"{spent:,.2f}" +
                    " spent out of ₹" +
                    f"{limit_amount:,.2f}."
                )

            reply = "Here is your current budget status: " + " ".join(
                budget_messages
            )


    elif (
        "goal" in message
        or "goals" in message
        or "saving" in message
        or "savings" in message
    ):

        if not goal_rows:

            reply = (
                "You currently do not have any savings goals. "
                "Create a goal to start tracking your savings progress."
            )

        else:

            goal_messages = []

            for goal in goal_rows:

                target = goal["target_amount"]
                saved = goal["saved_amount"]

                if target > 0:

                    progress = (
                        saved /
                        target
                    ) * 100

                else:

                    progress = 0

                progress = min(progress, 100)

                goal_messages.append(
                    goal["goal_name"] +
                    " is " +
                    f"{progress:.1f}" +
                    "% complete."
                )

            reply = "Here is your savings goal progress: " + " ".join(
                goal_messages
            )


    elif (
        "advice" in message
        or "recommend" in message
        or "suggest" in message
        or "help" in message
        or "save money" in message
        or "reduce" in message
    ):

        if total_income <= 0:

            reply = (
                "Start by adding your income information. "
                "Once your income is recorded, I can provide "
                "more personalized financial guidance."
            )

        elif total_expenses > total_income:

            reply = (
                "Your recorded expenses are higher than your "
                "income. Review your largest expense categories "
                "and consider reducing non-essential spending."
            )

        elif highest_category:

            category_name = highest_category["category"]
            category_amount = highest_category["total"]

            reply = (
                "Your highest spending category is " +
                str(category_name) +
                " at ₹" +
                f"{category_amount:,.2f}." +
                " Review this category and identify expenses "
                "that could be reduced."
            )

        else:

            reply = (
                "Continue tracking your income and expenses "
                "regularly. Setting budgets and savings goals "
                "can help you maintain better financial control."
            )


    elif (
        "hello" in message
        or "hi" in message
        or "hey" in message
    ):

        reply = (
            "Hello! I am your FinPilot financial assistant. "
            "You can ask me about your income, expenses, "
            "balance, budgets, spending categories, or savings goals."
        )


    else:

        reply = (
            "I can help you understand your income, expenses, "
            "balance, budgets, spending categories, and savings goals. "
            "Try asking something like "
            "\"How much did I spend?\" or "
            "\"What is my highest spending category?\""
        )


    return {
        "success": True,
        "reply": reply
    }