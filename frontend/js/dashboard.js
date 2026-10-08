// =========================================================
// FINPILOT AI - DASHBOARD JAVASCRIPT
// =========================================================


// =========================================================
// CHART INSTANCES
// =========================================================

let expenseChartInstance = null;

let budgetChartInstance = null;


// =========================================================
// CHECK USER SESSION
// =========================================================

const loggedInUser =
    localStorage.getItem("loggedInUser");


if (!loggedInUser) {

    alert("Please login first.");

    window.location.href = "login.html";

}


const userData =
    JSON.parse(loggedInUser);


// =========================================================
// DISPLAY LOGGED IN USER
// =========================================================

const profileName =
    document.getElementById("profileName");


if (
    profileName &&
    userData.full_name
) {

    profileName.innerText =
        userData.full_name;

}


// =========================================================
// DYNAMIC GREETING
// =========================================================

const greetingMessage =
    document.getElementById(
        "greetingMessage"
    );


const currentHour =
    new Date().getHours();


let greeting = "Good Evening";


if (currentHour < 12) {

    greeting = "Good Morning";

}

else if (currentHour < 17) {

    greeting = "Good Afternoon";

}

else if (currentHour < 21) {

    greeting = "Good Evening";

}

else {

    greeting = "Good Night";

}


if (greetingMessage) {

    const firstName =
        userData.full_name
            ? userData.full_name.split(" ")[0]
            : "there";

    greetingMessage.innerText =
        greeting +
        ", " +
        firstName +
        " 👋";

}


// =========================================================
// PERSONALIZED FINANCIAL MESSAGE
// =========================================================

const financialMessage =
    document.getElementById(
        "financialMessage"
    );


if (
    financialMessage &&
    userData.full_name
) {

    financialMessage.innerText =
        "Here's your financial overview. Stay on track and achieve your goals.";

}


// =========================================================
// CURRENT MONTH
// =========================================================

const currentMonthElement =
    document.getElementById(
        "currentMonth"
    );


if (currentMonthElement) {

    currentMonthElement.innerText =
        new Date().toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

}


// =========================================================
// LOGOUT
// =========================================================

const logoutButton =
    document.getElementById(
        "logoutBtn"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                localStorage.removeItem(
                    "loggedInUser"
                );

                alert(
                    "Logged out successfully."
                );

                window.location.href =
                    "login.html";

            }

        }
    );

}


// =========================================================
// FORMAT CURRENCY
// =========================================================

function formatCurrency(amount) {

    return (
        "₹" +
        Number(amount || 0).toLocaleString(
            "en-IN"
        )
    );

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// MONTH KEY
// =========================================================

function getMonthKey(dateString) {

    if (!dateString) {
        return "";
    }

    return dateString.substring(
        0,
        7
    );

}


// =========================================================
// MONTH LABEL
// =========================================================

function getMonthLabel(monthKey) {

    const parts =
        monthKey.split("-");


    if (parts.length !== 2) {
        return monthKey;
    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);


    return new Date(
        year,
        month - 1,
        1
    ).toLocaleDateString(
        "en-IN",
        {
            month: "short"
        }
    );

}


// =========================================================
// NORMALIZE API LIST
// =========================================================

function normalizeList(data) {

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(data.income)
    ) {

        return data.income;

    }


    if (
        data &&
        Array.isArray(data.incomes)
    ) {

        return data.incomes;

    }


    if (
        data &&
        Array.isArray(data.expenses)
    ) {

        return data.expenses;

    }


    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    return [];

}


// =========================================================
// GET LAST SIX MONTHS
// =========================================================

function getLastSixMonths() {

    const months = [];

    const now =
        new Date();


    for (
        let index = 5;
        index >= 0;
        index--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - index,
                1
            );


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        months.push(
            year + "-" + month
        );

    }


    return months;

}


// =========================================================
// LOAD DASHBOARD
// =========================================================

async function loadDashboard() {

    try {

        const dashboardResponse =
            await fetch(
                "http://192.168.0.152:8001/dashboard?user_id=" +
                userData.user_id
            );


        if (!dashboardResponse.ok) {

            throw new Error(
                "Unable to load dashboard."
            );

        }


        const dashboardData =
            await dashboardResponse.json();


        console.log(
            "Dashboard Data:",
            dashboardData
        );


        // =================================================
        // LOAD INCOME RECORDS
        // =================================================

        let incomeRecords = [];


        try {

            const incomeResponse =
                await fetch(
                    "http://192.168.0.152:8001/income?user_id=" +
                    userData.user_id
                );


            if (incomeResponse.ok) {

                const incomeData =
                    await incomeResponse.json();

                incomeRecords =
                    normalizeList(
                        incomeData
                    );

            }

        }

        catch (incomeError) {

            console.warn(
                "Income records could not be loaded:",
                incomeError
            );

        }


        // =================================================
        // LOAD EXPENSE RECORDS
        // =================================================

        let expenseRecords = [];


        try {

            const expenseResponse =
                await fetch(
                    "http://192.168.0.152:8001/expenses?user_id=" +
                    userData.user_id
                );


            if (expenseResponse.ok) {

                const expenseData =
                    await expenseResponse.json();

                expenseRecords =
                    normalizeList(
                        expenseData
                    );

            }

        }

        catch (expenseError) {

            console.warn(
                "Expense records could not be loaded:",
                expenseError
            );

        }


        // =================================================
        // SUMMARY VALUES
        // =================================================

        const totalIncome =
            Number(
                dashboardData.total_income || 0
            );


        const totalExpenses =
            Number(
                dashboardData.total_expenses || 0
            );


        const balance =
            Number(
                dashboardData.balance || 0
            );


        const savingsRate =
            totalIncome > 0
                ? (
                    (balance / totalIncome) *
                    100
                )
                : 0;


        const incomeElement =
            document.getElementById(
                "totalIncome"
            );


        const expensesElement =
            document.getElementById(
                "totalExpenses"
            );


        const balanceElement =
            document.getElementById(
                "totalBalance"
            );


        const savingsElement =
            document.getElementById(
                "savingsRate"
            );


        if (incomeElement) {

            incomeElement.innerText =
                formatCurrency(
                    totalIncome
                );

        }


        if (expensesElement) {

            expensesElement.innerText =
                formatCurrency(
                    totalExpenses
                );

        }


        if (balanceElement) {

            balanceElement.innerText =
                formatCurrency(
                    balance
                );

        }


        if (savingsElement) {

            savingsElement.innerText =
                Math.max(
                    0,
                    savingsRate
                ).toFixed(0) +
                "%";

        }


        // =================================================
        // INCOME VS EXPENSES CHART
        // =================================================

        createIncomeExpenseChart(
            dashboardData,
            incomeRecords
        );


        // =================================================
        // BUDGET DISTRIBUTION
        // =================================================

        createBudgetDistribution(
            dashboardData
        );


        // =================================================
        // RECENT TRANSACTIONS
        // =================================================

        createRecentTransactions(
            dashboardData,
            incomeRecords,
            expenseRecords
        );

    }

    catch (error) {

        console.error(
            "Unable to load dashboard data:",
            error
        );

    }

}


// =========================================================
// CREATE INCOME VS EXPENSES CHART
// =========================================================

function createIncomeExpenseChart(
    dashboardData,
    incomeRecords
) {

    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) {
        return;
    }


    if (expenseChartInstance) {

        expenseChartInstance.destroy();

    }


    const months =
        getLastSixMonths();


    const incomeMap = {};


    const expenseMap = {};


    // =================================================
    // MONTHLY INCOME
    // =================================================

    incomeRecords.forEach(
        function (income) {

            const date =
                income.date ||
                income.created_at ||
                "";


            const month =
                getMonthKey(date);


            if (!month) {
                return;
            }


            const amount =
                Number(
                    income.amount || 0
                );


            if (!incomeMap[month]) {

                incomeMap[month] = 0;

            }


            incomeMap[month] +=
                amount;

        }
    );


    // =================================================
    // MONTHLY EXPENSES
    // =================================================

    const monthlyExpenses =
        dashboardData.monthly_expenses ||
        [];


    monthlyExpenses.forEach(
        function (expense) {

            const month =
                expense.month;


            if (!month) {
                return;
            }


            expenseMap[month] =
                Number(
                    expense.total || 0
                );

        }
    );


    // =================================================
    // LABELS
    // =================================================

    const labels =
        months.map(
            function (month) {

                return getMonthLabel(
                    month
                );

            }
        );


    const incomeValues =
        months.map(
            function (month) {

                return Number(
                    incomeMap[month] || 0
                );

            }
        );


    const expenseValues =
        months.map(
            function (month) {

                return Number(
                    expenseMap[month] || 0
                );

            }
        );


    expenseChartInstance =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label: "Income",

                            data:
                                incomeValues,

                            borderColor:
                                "#2563eb",

                            backgroundColor:
                                "rgba(37, 99, 235, 0.08)",

                            borderWidth: 3,

                            pointRadius: 4,

                            pointHoverRadius: 6,

                            pointBackgroundColor:
                                "#2563eb",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            tension: 0.38,

                            fill: false

                        },


                        {

                            label: "Expenses",

                            data:
                                expenseValues,

                            borderColor:
                                "#f97316",

                            backgroundColor:
                                "rgba(249, 115, 22, 0.08)",

                            borderWidth: 3,

                            pointRadius: 4,

                            pointHoverRadius: 6,

                            pointBackgroundColor:
                                "#f97316",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            tension: 0.38,

                            fill: false

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: "index",

                        intersect: false

                    },


                    scales: {

                        x: {

                            grid: {

                                display: false

                            },

                            border: {

                                display: false

                            },

                            ticks: {

                                color: "#94a3b8",

                                font: {

                                    size: 9

                                }

                            }

                        },


                        y: {

                            beginAtZero: true,

                            border: {

                                display: false

                            },

                            grid: {

                                color:
                                    "#edf1f5",

                                drawTicks: false

                            },

                            ticks: {

                                color: "#94a3b8",

                                font: {

                                    size: 8

                                },

                                padding: 8,

                                callback:
                                    function (
                                        value
                                    ) {

                                        return (
                                            "₹" +
                                            Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            backgroundColor:
                                "#172033",

                            padding: 10,

                            titleFont: {

                                size: 10

                            },

                            bodyFont: {

                                size: 9

                            },

                            displayColors: true

                        }

                    }


                }

            }
        );

}


// =========================================================
// CREATE BUDGET DISTRIBUTION
// =========================================================

function createBudgetDistribution(
    dashboardData
) {

    const canvas =
        document.getElementById(
            "budgetChart"
        );


    const legend =
        document.getElementById(
            "budgetLegend"
        );


    const totalElement =
        document.getElementById(
            "budgetTotalSpent"
        );


    if (!canvas) {
        return;
    }


    if (budgetChartInstance) {

        budgetChartInstance.destroy();

    }


    const rawCategories =
        dashboardData.category_expenses ||
        [];


    const categoryMap = {};


    rawCategories.forEach(
        function (item) {

            const originalName =
                item.category ||
                "Other";


            const key =
                originalName
                    .trim()
                    .toLowerCase();


            if (!categoryMap[key]) {

                categoryMap[key] = {

                    name:
                        originalName
                            .trim(),

                    amount: 0

                };

            }


            categoryMap[key].amount +=
                Number(
                    item.total || 0
                );

        }
    );


    const categories =
        Object.values(
            categoryMap
        );


    categories.sort(
        function (a, b) {

            return (
                b.amount -
                a.amount
            );

        }
    );


    const totalSpent =
        categories.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    item.amount
                );

            },
            0
        );


    if (totalElement) {

        totalElement.innerText =
            formatCurrency(
                totalSpent
            );

    }


    if (
        categories.length === 0 ||
        totalSpent <= 0
    ) {

        if (legend) {

            legend.innerHTML = `

                <div class="empty-state">
                    No expense data available.
                </div>

            `;

        }


        return;

    }


    const colors = [

        "#2563eb",
        "#fbbf24",
        "#f97316",
        "#10b981",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#64748b"

    ];


    const labels =
        categories.map(
            function (item) {

                return item.name;

            }
        );


    const values =
        categories.map(
            function (item) {

                return item.amount;

            }
        );


    budgetChartInstance =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor:
                                colors.slice(
                                    0,
                                    values.length
                                ),

                            borderColor:
                                "#ffffff",

                            borderWidth: 3,

                            hoverOffset: 7,

                            spacing: 2

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            backgroundColor:
                                "#172033",

                            padding: 10,

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const value =
                                            Number(
                                                context.raw
                                            );


                                        const percentage =
                                            (
                                                value /
                                                totalSpent
                                            ) *
                                            100;


                                        return (
                                            " " +
                                            formatCurrency(
                                                value
                                            ) +
                                            " (" +
                                            percentage.toFixed(
                                                1
                                            ) +
                                            "%)"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );


    // =================================================
    // CUSTOM LEGEND
    // =================================================

    if (legend) {

        legend.innerHTML = "";


        categories.forEach(
            function (
                item,
                index
            ) {

                const percentage =
                    (
                        item.amount /
                        totalSpent
                    ) *
                    100;


                const legendItem =
                    document.createElement(
                        "div"
                    );


                legendItem.className =
                    "budget-legend-item";


                const dot =
                    document.createElement(
                        "span"
                    );


                dot.className =
                    "budget-legend-dot";


                dot.style.background =
                    colors[
                        index %
                        colors.length
                    ];


                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "budget-legend-name";


                name.innerText =
                    item.name;


                const percent =
                    document.createElement(
                        "span"
                    );


                percent.className =
                    "budget-legend-percent";


                percent.innerText =
                    percentage.toFixed(
                        0
                    ) +
                    "%";


                const amount =
                    document.createElement(
                        "span"
                    );


                amount.className =
                    "budget-legend-amount";


                amount.innerText =
                    formatCurrency(
                        item.amount
                    );


                legendItem.appendChild(
                    dot
                );


                legendItem.appendChild(
                    name
                );


                legendItem.appendChild(
                    percent
                );


                legendItem.appendChild(
                    amount
                );


                legend.appendChild(
                    legendItem
                );

            }
        );

    }

}


// =========================================================
// GET CATEGORY COLOR
// =========================================================

function getCategoryClass(
    category
) {

    const value =
        String(
            category || ""
        )
        .trim()
        .toLowerCase();


    if (
        value.includes("shop") ||
        value.includes("travel") ||
        value.includes("transport")
    ) {

        return "category-blue";

    }


    if (
        value.includes("food") ||
        value.includes("lunch") ||
        value.includes("restaurant")
    ) {

        return "category-orange";

    }


    if (
        value.includes("salary") ||
        value.includes("income") ||
        value.includes("freelance")
    ) {

        return "category-green";

    }


    if (
        value.includes("education") ||
        value.includes("course") ||
        value.includes("study")
    ) {

        return "category-purple";

    }


    if (
        value.includes("health") ||
        value.includes("medical")
    ) {

        return "category-red";

    }


    if (
        value.includes("entertainment") ||
        value.includes("movie")
    ) {

        return "category-pink";

    }


    if (
        value.includes("bill") ||
        value.includes("utility")
    ) {

        return "category-teal";

    }


    return "category-gray";

}


// =========================================================
// CREATE RECENT TRANSACTIONS
// =========================================================

function createRecentTransactions(
    dashboardData,
    incomeRecords,
    expenseRecords
) {

    const transactionsBody =
        document.getElementById(
            "transactionsBody"
        );


    if (!transactionsBody) {
        return;
    }


    const transactions = [];


    // =================================================
    // ADD INCOME RECORDS
    // =================================================

    incomeRecords.forEach(
        function (income) {

            transactions.push({

                date:
                    income.date ||
                    "",

                name:
                    income.source ||
                    "Income",

                category:
                    income.source ||
                    "Income",

                amount:
                    Number(
                        income.amount || 0
                    ),

                type:
                    "Income"

            });

        }
    );


    // =================================================
    // ADD EXPENSE RECORDS
    // =================================================

    expenseRecords.forEach(
        function (expense) {

            transactions.push({

                date:
                    expense.date ||
                    "",

                name:
                    expense.notes ||
                    expense.category ||
                    "Expense",

                category:
                    expense.category ||
                    "Other",

                amount:
                    Number(
                        expense.amount || 0
                    ),

                type:
                    "Expense"

            });

        }
    );


    // =================================================
    // FALLBACK TO DASHBOARD TRANSACTIONS
    // =================================================

    if (
        transactions.length === 0 &&
        dashboardData.recent_transactions
    ) {

        dashboardData.recent_transactions.forEach(
            function (transaction) {

                transactions.push({

                    date:
                        transaction.date ||
                        "",

                    name:
                        transaction.notes ||
                        transaction.category ||
                        "Transaction",

                    category:
                        transaction.category ||
                        "Other",

                    amount:
                        Number(
                            transaction.amount || 0
                        ),

                    type:
                        "Expense"

                });

            }
        );

    }


    // =================================================
    // SORT BY DATE
    // =================================================

    transactions.sort(
        function (a, b) {

            return (
                new Date(
                    b.date
                ) -
                new Date(
                    a.date
                )
            );

        }
    );


    // Show maximum 5 transactions

    const recentTransactions =
        transactions.slice(
            0,
            5
        );


    transactionsBody.innerHTML =
        "";


    if (
        recentTransactions.length === 0
    ) {

        transactionsBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >
                    No transactions recorded yet.
                </td>

            </tr>

        `;

        return;

    }


    recentTransactions.forEach(
        function (transaction) {

            const row =
                document.createElement(
                    "tr"
                );


            // =================================================
            // DATE
            // =================================================

            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.innerText =
                transaction.date
                    ? formatDate(
                        transaction.date
                    )
                    : "-";


            // =================================================
            // NAME
            // =================================================

            const nameCell =
                document.createElement(
                    "td"
                );


            nameCell.innerText =
                transaction.name;


            // =================================================
            // CATEGORY
            // =================================================

            const categoryCell =
                document.createElement(
                    "td"
                );


            const categoryPill =
                document.createElement(
                    "span"
                );


            categoryPill.className =
                "transaction-category " +
                getCategoryClass(
                    transaction.category
                );


            categoryPill.innerText =
                transaction.category;


            categoryCell.appendChild(
                categoryPill
            );


            // =================================================
            // AMOUNT
            // =================================================

            const amountCell =
                document.createElement(
                    "td"
                );


            amountCell.className =
                "transaction-amount " +
                (
                    transaction.type ===
                    "Income"
                        ? "income"
                        : ""
                );


            amountCell.innerText =
                (
                    transaction.type ===
                    "Income"
                        ? "+"
                        : ""
                ) +
                formatCurrency(
                    transaction.amount
                );


            // =================================================
            // TYPE
            // =================================================

            const typeCell =
                document.createElement(
                    "td"
                );


            const typePill =
                document.createElement(
                    "span"
                );


            typePill.className =
                "transaction-type " +
                (
                    transaction.type ===
                    "Income"
                        ? "income"
                        : "expense"
                );


            typePill.innerText =
                transaction.type;


            typeCell.appendChild(
                typePill
            );


            // =================================================
            // STATUS
            // =================================================

            const statusCell =
                document.createElement(
                    "td"
                );


            const statusPill =
                document.createElement(
                    "span"
                );


            statusPill.className =
                "transaction-status";


            statusPill.innerText =
                "Completed";


            statusCell.appendChild(
                statusPill
            );


            // =================================================
            // APPEND CELLS
            // =================================================

            row.appendChild(
                dateCell
            );


            row.appendChild(
                nameCell
            );


            row.appendChild(
                categoryCell
            );


            row.appendChild(
                amountCell
            );


            row.appendChild(
                typeCell
            );


            row.appendChild(
                statusCell
            );


            transactionsBody.appendChild(
                row
            );

        }
    );

}


// =========================================================
// LOAD BUDGET ALERTS
// =========================================================

async function loadBudgetAlerts() {

    try {

        const response =
            await fetch(
                "http://192.168.0.152:8001/budget-alerts?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "Budget Alerts:",
            data
        );


        const budgetAlerts =
            document.getElementById(
                "budgetAlerts"
            );


        if (!budgetAlerts) {
            return;
        }


        budgetAlerts.innerHTML =
            "";


        if (
            !data.alerts ||
            data.alerts.length === 0
        ) {

            budgetAlerts.innerHTML = `

                <li>
                    ✓ All budgets are currently on track.
                </li>

            `;

            return;

        }


        data.alerts.forEach(
            function (alert) {

                const alertItem =
                    document.createElement(
                        "li"
                    );


                if (
                    alert.alert_type ===
                    "Over Budget"
                ) {

                    alertItem.innerText =
                        "⚠️ " +
                        alert.category +
                        " Budget - Over Budget";

                }

                else {

                    alertItem.innerText =
                        "⚠️ " +
                        alert.category +
                        " Budget - " +
                        alert.usage +
                        "% Used";

                }


                budgetAlerts.appendChild(
                    alertItem
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load budget alerts:",
            error
        );

    }

}


// =========================================================
// LOAD AI FINANCIAL INSIGHT
// =========================================================

async function loadAIInsight() {

    try {

        const response =
            await fetch(
                "http://192.168.0.152:8001/ai-coach?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "AI Coach:",
            data
        );


        const aiInsightMessage =
            document.getElementById(
                "aiInsightMessage"
            );


        if (!aiInsightMessage) {
            return;
        }


        if (
            data.success &&
            data.insight
        ) {

            aiInsightMessage.innerText =
                data.insight.message;

        }

    }

    catch (error) {

        console.error(
            "Unable to load AI financial insight:",
            error
        );

    }

}


// =========================================================
// LOAD SAVINGS GOALS
// =========================================================

async function loadDashboardGoals() {

    try {

        const goalsResponse =
            await fetch(
                "http://192.168.0.152:8001/goals?user_id=" +
                userData.user_id
            );


        const data =
            await goalsResponse.json();


        console.log(
            "Dashboard Goals:",
            data
        );


        const dashboardGoals =
            document.getElementById(
                "dashboardGoals"
            );


        if (!dashboardGoals) {
            return;
        }


        dashboardGoals.innerHTML =
            "";


        if (
            !data.goals ||
            data.goals.length === 0
        ) {

            dashboardGoals.innerHTML = `

                <p class="empty-state">
                    No savings goals created yet.
                </p>

            `;

            return;

        }


        const goals =
            data.goals.slice(
                0,
                3
            );


        goals.forEach(
            function (goal) {

                const goalItem =
                    document.createElement(
                        "div"
                    );


                goalItem.className =
                    "dashboard-goal-item";


                goalItem.innerHTML = `

                    <div class="dashboard-goal-header">

                        <span>
                            ${goal.goal_name}
                        </span>

                        <strong>
                            ${goal.progress}%
                        </strong>

                    </div>


                    <progress
                        value="${goal.progress}"
                        max="100"
                    ></progress>


                    <p class="dashboard-goal-amount">

                        ₹${Number(
                            goal.saved_amount
                        ).toLocaleString(
                            "en-IN"
                        )}

                        saved of

                        ₹${Number(
                            goal.target_amount
                        ).toLocaleString(
                            "en-IN"
                        )}

                    </p>

                `;


                dashboardGoals.appendChild(
                    goalItem
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load dashboard goals:",
            error
        );

    }

}


// =========================================================
// START DASHBOARD
// =========================================================

loadDashboard();

loadBudgetAlerts();

loadAIInsight();

loadDashboardGoals();