from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3


router = APIRouter()


# ==========================================
# Goal Request Model
# ==========================================

class GoalCreate(BaseModel):

    user_id: int

    goal_name: str

    target_amount: float

    saved_amount: float = 0

    target_date: str | None = None


# ==========================================
# Add Goal
# ==========================================

@router.post("/goals")
def add_goal(goal: GoalCreate):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO goals
        (
            user_id,
            goal_name,
            target_amount,
            saved_amount,
            target_date
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            goal.user_id,
            goal.goal_name,
            goal.target_amount,
            goal.saved_amount,
            goal.target_date
        )
    )

    connection.commit()

    connection.close()

    return {

        "success": True,

        "message": "Goal added successfully!"

    }


# ==========================================
# Get Goals
# ==========================================

@router.get("/goals")
def get_goals(user_id: int):

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
        goal_name,
        target_amount,
        saved_amount,
        target_date
    FROM goals
    WHERE user_id = ?
    ORDER BY id DESC
    """,
    (
        user_id,
    )
)

    goals = cursor.fetchall()

    goal_list = []


    for goal in goals:

        target_amount = goal["target_amount"]

        saved_amount = goal["saved_amount"]


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


        # ==========================================
        # Calculate Remaining Amount
        # ==========================================

        remaining = (
            target_amount -
            saved_amount
        )


        goal_list.append({

            "id": goal["id"],

            "user_id": goal["user_id"],

            "goal_name": goal["goal_name"],

            "target_amount": target_amount,

            "saved_amount": saved_amount,

            "remaining": remaining,

            "progress": round(
                min(progress, 100),
                2
            ),

            "target_date": goal["target_date"]

        })


    connection.close()


    return {

        "success": True,

        "goals": goal_list

    }

# ==========================================
# Update Goal
# ==========================================

class GoalUpdate(BaseModel):

    user_id: int

    goal_name: str

    target_amount: float

    saved_amount: float

    target_date: str | None = None


@router.put("/goals/{goal_id}")
def update_goal(
    goal_id: int,
    goal: GoalUpdate
):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    # ==========================================
    # Check Goal
    # ==========================================

    cursor.execute(
        """
        SELECT id
        FROM goals
        WHERE id = ?
        AND user_id = ?
        """,
        (
            goal_id,
            goal.user_id
        )
    )

    existing_goal = cursor.fetchone()

    if not existing_goal:

        connection.close()

        return {
            "success": False,
            "message": "Goal not found."
        }


    # ==========================================
    # Validate Amounts
    # ==========================================

    if goal.target_amount <= 0:

        connection.close()

        return {
            "success": False,
            "message": "Target amount must be greater than zero."
        }


    if goal.saved_amount < 0:

        connection.close()

        return {
            "success": False,
            "message": "Saved amount cannot be negative."
        }


    if goal.saved_amount > goal.target_amount:

        connection.close()

        return {
            "success": False,
            "message": "Saved amount cannot be greater than the target amount."
        }


    # ==========================================
    # Update Goal
    # ==========================================

    cursor.execute(
        """
        UPDATE goals

        SET
            goal_name = ?,
            target_amount = ?,
            saved_amount = ?,
            target_date = ?

        WHERE id = ?
        AND user_id = ?
        """,
        (
            goal.goal_name,
            goal.target_amount,
            goal.saved_amount,
            goal.target_date,
            goal_id,
            goal.user_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Goal updated successfully!"
    }

# ==========================================
# Delete Goal
# ==========================================

@router.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: int,
    user_id: int
):

    connection = sqlite3.connect(
        "database/finpilot.db"
    )

    cursor = connection.cursor()

    # ==========================================
    # Check Goal
    # ==========================================

    cursor.execute(
        """
        SELECT id
        FROM goals
        WHERE id = ?
        AND user_id = ?
        """,
        (
            goal_id,
            user_id
        )
    )

    existing_goal = cursor.fetchone()

    if not existing_goal:

        connection.close()

        return {
            "success": False,
            "message": "Goal not found."
        }


    # ==========================================
    # Delete Goal
    # ==========================================

    cursor.execute(
        """
        DELETE FROM goals
        WHERE id = ?
        AND user_id = ?
        """,
        (
            goal_id,
            user_id
        )
    )

    connection.commit()

    connection.close()

    return {
        "success": True,
        "message": "Goal deleted successfully!"
    }