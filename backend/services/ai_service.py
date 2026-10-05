# ==========================================
# FinPilot AI - AI Budget Coach
# ==========================================


def generate_financial_insight(
    total_income,
    total_expenses,
    budgets,
    goals,
    expense_categories
):
    # ==========================================
    # Calculate Balance
    # ==========================================

    balance = total_income - total_expenses

        # ==========================================
    # Analyze Savings Goals
    # ==========================================

    incomplete_goals = []

    completed_goals = []


    for goal in goals:

        progress = goal["progress"]

        goal_name = goal["goal_name"]


        if progress >= 100:

            completed_goals.append(
                goal_name
            )

        else:

            incomplete_goals.append({
                "goal_name": goal_name,
                "progress": progress
            })

                # ==========================================
    # Analyze Highest Expense Category
    # ==========================================

    highest_expense_category = None

    if expense_categories:

        highest_expense_category = (
            expense_categories[0]
        )


    # ==========================================
    # Handle No Income
    # ==========================================

    if total_income <= 0:

        return {
            "title": "Financial Insight",
            "message": (
                "Add your income information to receive "
                "personalized financial guidance."
            ),
            "status": "Getting Started"
        }


    # ==========================================
    # Calculate Expense Ratio
    # ==========================================

    expense_ratio = (
        total_expenses / total_income
    ) * 100


    # ==========================================
    # Check Over Budget Categories
    # ==========================================

    over_budget_categories = []

    near_limit_categories = []


    for budget in budgets:

        usage = budget["usage"]

        category = budget["category"]


        if usage >= 100:

            over_budget_categories.append(
                category
            )

        elif usage >= 80:

            near_limit_categories.append(
                category
            )


    # ==========================================
    # Generate Financial Insight
    # ==========================================

    if over_budget_categories:

        categories = ", ".join(
            over_budget_categories
        )

        return {
    "title": "Budget Warning",
            "message": (
                "Your spending has exceeded the budget "
                "for " + categories +
                ". Review your recent expenses and "
                "reduce non-essential spending."
            ),
            "recommendation": (
                "Try reducing non-essential spending "
                "in " + categories +
                " and keep your upcoming expenses "
                "within the planned budget."
            ),
            "status": "Needs Attention"
}


    if near_limit_categories:

        categories = ", ".join(
            near_limit_categories
        )

        return {

            "title": "Budget Alert",
            "message": (
                "Your " + categories +
                " budget is close to its limit. "
                "Consider controlling discretionary "
                "spending for the rest of the month."
            ),
            "recommendation": (
                "Monitor your remaining spending carefully "
                "and prioritize essential expenses until "
                "the budget period ends."
            ),
            "status": "Monitor Spending"
        }


        # ==========================================
    # Savings Goal Insight
    # ==========================================

    if incomplete_goals:

        goal = incomplete_goals[0]

        return {

            "title": "Savings Goal Progress",
            "message": (
                "Your " +
                goal["goal_name"] +
                " goal is currently " +
                str(goal["progress"]) +
                "% funded. "
                "Consider setting aside a fixed amount "
                "from your income to reach your target."
            ),
            "recommendation": (
                "Set aside a fixed portion of your available "
                "balance regularly to make steady progress "
                "toward your savings goal."
            ),
            "status": "Goal In Progress"

        }


    # ==========================================
    # Check Expense Ratio
    # ==========================================

    if expense_ratio >= 80:

        return {

            "title": "High Spending",
            "message": (
                "Your expenses are using a large portion "
                "of your income. Review your spending "
                "patterns and look for opportunities to save."
            ),
            "recommendation": (
                "Review your largest expense categories "
                "and reduce unnecessary spending to improve "
                "your monthly savings."
            ),
            "status": "Needs Attention"

        }

        # ==========================================
    # Spending Pattern Insight
    # ==========================================

    if highest_expense_category:

        category_name = (
            highest_expense_category["category"]
        )

        category_amount = (
            highest_expense_category["total"]
        )

        return {
            "title": "Spending Pattern",
            "message": (
                "Your highest spending category is " +
                category_name +
                ", with total spending of ₹" +
                str(round(category_amount, 2)) +
                "."
            ),
            "recommendation": (
                "Review your spending in " +
                category_name +
                " and identify any non-essential "
                "expenses that could be reduced."
            ),
            "status": "Review Spending"
        }


    if expense_ratio <= 50:

        return {

            "title": "Excellent Financial Health",
            "message": (
                "Your current expenses are well below "
                "your income. Continue maintaining healthy "
                "spending habits and consider increasing "
                "your savings."
            ),
            "recommendation": (
                "Continue your current spending discipline "
                "and consider directing more of your "
                "available balance toward your savings goals."
            ),
            "status": "Healthy"
        }


    # ==========================================
    # Default Financial Insight
    # ==========================================

    return {

       "title": "Financial Insight",
        "message": (
            "Your finances are currently balanced. "
            "Continue monitoring your expenses and "
            "maintaining a consistent savings habit."
        ),
        "recommendation": (
            "Continue tracking your spending and "
            "maintain a consistent amount of savings "
            "from each income cycle."
        ),
        "status": "On Track"

    }