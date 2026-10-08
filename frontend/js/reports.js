/* =========================================================
   FINPILOT AI - REPORTS
========================================================= */

const loggedInUser =
    localStorage.getItem("loggedInUser");


let reportData = null;

let reportGoalsData = [];

let reportBudgetsData = [];


/* =========================================================
   SESSION CHECK
========================================================= */

if (!loggedInUser) {

    alert("Please login first.");

    window.location.href = "login.html";

}


const userData =
    JSON.parse(loggedInUser);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupProfile();

        setupCurrentMonth();

        setupLogout();

        loadReports();

    }
);


/* =========================================================
   PROFILE
========================================================= */

function setupProfile() {

    const profileName =
        document.getElementById("profileName");

    const profileAvatar =
        document.getElementById("profileAvatar");


    const fullName =
        userData.full_name || "User";


    if (profileName) {

        profileName.innerText =
            fullName;

    }


    if (profileAvatar) {

        const initials =
            fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    function (part) {
                        return part.charAt(0);
                    }
                )
                .join("")
                .toUpperCase();


        profileAvatar.innerText =
            initials || "U";

    }

}


/* =========================================================
   CURRENT MONTH
========================================================= */

function setupCurrentMonth() {

    const currentMonth =
        document.getElementById(
            "currentMonth"
        );


    if (!currentMonth) {
        return;
    }


    const now =
        new Date();


    currentMonth.innerText =
        now.toLocaleString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "loggedInUser"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   LOAD REPORTS
========================================================= */

async function loadReports() {

    try {

        const dashboardResponse =
            await fetch(
                "http://192.168.0.152:8001/dashboard?user_id=" +
                userData.user_id
            );


        if (!dashboardResponse.ok) {

            throw new Error(
                "Unable to load dashboard data."
            );

        }


        const data =
            await dashboardResponse.json();


        reportData = data;


        console.log(
            "Reports Dashboard Data:",
            data
        );


        displaySummary(data);

        displayCategories(data);

        displayMonthlySpending(data);

        await displayGoals();

        await loadReportBudgets();


    } catch (error) {

        console.error(
            "Reports Error:",
            error
        );


        showReportError(
            "reportMonthly",
            "Unable to load monthly spending."
        );


        showReportError(
            "reportCategories",
            "Unable to load expense categories."
        );


        showReportError(
            "reportGoals",
            "Unable to load savings goals."
        );

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function displaySummary(data) {

    const reportIncome =
        document.getElementById(
            "reportIncome"
        );


    const reportExpenses =
        document.getElementById(
            "reportExpenses"
        );


    const reportBalance =
        document.getElementById(
            "reportBalance"
        );


    if (reportIncome) {

        reportIncome.innerText =
            formatCurrency(
                data.total_income || 0
            );

    }


    if (reportExpenses) {

        reportExpenses.innerText =
            formatCurrency(
                data.total_expenses || 0
            );

    }


    if (reportBalance) {

        reportBalance.innerText =
            formatCurrency(
                data.balance || 0
            );

    }

}


/* =========================================================
   EXPENSE CATEGORIES
========================================================= */

function displayCategories(data) {

    const categoriesElement =
        document.getElementById(
            "reportCategories"
        );


    if (!categoriesElement) {
        return;
    }


    const categories =
        data.category_expenses || [];


    if (categories.length === 0) {

        categoriesElement.innerHTML =
            `
                <p class="report-empty">
                    No expense categories available.
                </p>
            `;

        return;

    }


    const categoryMap = {};


    categories.forEach(
        function (category) {

            const categoryKey =
                String(
                    category.category || ""
                )
                .trim()
                .toLowerCase();


            if (!categoryKey) {
                return;
            }


            if (
                Object.prototype.hasOwnProperty.call(
                    categoryMap,
                    categoryKey
                )
            ) {

                categoryMap[categoryKey] +=
                    Number(
                        category.total || 0
                    );

            } else {

                categoryMap[categoryKey] =
                    Number(
                        category.total || 0
                    );

            }

        }
    );


    const mergedCategories =
        Object.keys(categoryMap);


    if (mergedCategories.length === 0) {

        categoriesElement.innerHTML =
            `
                <p class="report-empty">
                    No expense categories available.
                </p>
            `;

        return;

    }


    categoriesElement.innerHTML = "";


    mergedCategories.forEach(
        function (category) {

            const displayName =
                category.charAt(0).toUpperCase() +
                category.slice(1);


            const amount =
                categoryMap[category];


            const categoryItem =
                document.createElement(
                    "div"
                );


            categoryItem.className =
                "report-item";


            categoryItem.innerHTML =
                `
                    <div>
                        <strong>
                            ${escapeHtml(displayName)}
                        </strong>
                    </div>

                    <div>
                        <strong class="amount">
                            ${formatCurrency(amount)}
                        </strong>
                    </div>
                `;


            categoriesElement.appendChild(
                categoryItem
            );

        }
    );

}


/* =========================================================
   MONTHLY SPENDING
========================================================= */

function displayMonthlySpending(data) {

    const monthlyElement =
        document.getElementById(
            "reportMonthly"
        );


    if (!monthlyElement) {
        return;
    }


    const monthlyData =
        data.monthly_expenses || [];


    if (monthlyData.length === 0) {

        monthlyElement.innerHTML =
            `
                <p class="report-empty">
                    No monthly spending data available.
                </p>
            `;

        return;

    }


    monthlyElement.innerHTML = "";


    monthlyData.forEach(
        function (monthData) {

            const monthItem =
                document.createElement(
                    "div"
                );


            monthItem.className =
                "report-item";


            const monthName =
                formatMonth(
                    monthData.month
                );


            monthItem.innerHTML =
                `
                    <div>
                        <strong>
                            ${escapeHtml(monthName)}
                        </strong>
                    </div>

                    <div>
                        <strong class="amount">
                            ${formatCurrency(
                                monthData.total || 0
                            )}
                        </strong>
                    </div>
                `;


            monthlyElement.appendChild(
                monthItem
            );

        }
    );

}


/* =========================================================
   SAVINGS GOALS
========================================================= */

async function displayGoals() {

    const goalsElement =
        document.getElementById(
            "reportGoals"
        );


    if (!goalsElement) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://192.168.0.152:8001/goals?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load goals."
            );

        }


        const goals =
            await response.json();


        if (Array.isArray(goals)) {

            reportGoalsData =
                goals;

        } else if (
            goals &&
            Array.isArray(goals.goals)
        ) {

            reportGoalsData =
                goals.goals;

        } else {

            reportGoalsData = [];

        }


        console.log(
            "Reports Goals Data:",
            reportGoalsData
        );


        if (
            reportGoalsData.length === 0
        ) {

            goalsElement.innerHTML =
                `
                    <p class="report-empty">
                        No savings goals created yet.
                    </p>
                `;

            return;

        }


        goalsElement.innerHTML = "";


        reportGoalsData.forEach(
            function (goal) {

                const targetAmount =
                    Number(
                        goal.target_amount || 0
                    );


                const savedAmount =
                    Number(
                        goal.saved_amount || 0
                    );


                let progress = 0;


                if (targetAmount > 0) {

                    progress =
                        (
                            savedAmount /
                            targetAmount
                        ) * 100;

                }


                progress =
                    Math.min(
                        Math.max(progress, 0),
                        100
                    );


                const goalItem =
                    document.createElement(
                        "div"
                    );


                goalItem.className =
                    "report-goal-item";


                goalItem.innerHTML =
                    `
                        <div class="report-goal-top">

                            <span class="report-goal-name">
                                ${escapeHtml(
                                    goal.goal_name ||
                                    "Unnamed Goal"
                                )}
                            </span>

                            <span class="report-goal-progress">
                                ${progress.toFixed(1)}%
                            </span>

                        </div>


                        <div class="report-goal-details">

                            <span>
                                ${formatCurrency(savedAmount)}
                                saved
                            </span>

                            <span>
                                ${formatCurrency(targetAmount)}
                                target
                            </span>

                        </div>


                        <div class="goal-progress-track">

                            <div
                                class="goal-progress-bar"
                                style="width:${progress}%"
                            ></div>

                        </div>


                        <div class="report-goal-date">

                            <i class="fa-regular fa-calendar"></i>

                            Target:
                            ${escapeHtml(
                                goal.target_date ||
                                "Not specified"
                            )}

                        </div>
                    `;


                goalsElement.appendChild(
                    goalItem
                );

            }
        );


    } catch (error) {

        console.error(
            "Goals Report Error:",
            error
        );


        goalsElement.innerHTML =
            `
                <p class="report-empty">
                    Unable to load savings goals.
                </p>
            `;

    }

}


/* =========================================================
   LOAD BUDGETS FOR PDF
========================================================= */

async function loadReportBudgets() {

    try {

        const response =
            await fetch(
                "http://192.168.0.152:8001/budgets?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load budgets."
            );

        }


        const result =
            await response.json();


        if (Array.isArray(result)) {

            reportBudgetsData =
                result;

        } else if (
            result &&
            Array.isArray(result.budgets)
        ) {

            reportBudgetsData =
                result.budgets;

        } else {

            reportBudgetsData = [];

        }


        console.log(
            "Reports Budget Data:",
            reportBudgetsData
        );


    } catch (error) {

        console.error(
            "Budget Report Error:",
            error
        );


        reportBudgetsData = [];

    }

}


/* =========================================================
   DOWNLOAD PDF REPORT
========================================================= */

function downloadPDFReport() {

    if (!reportData) {

        alert(
            "Report data is still loading. Please try again in a moment."
        );

        return;

    }


    if (
        typeof window.jspdf === "undefined"
    ) {

        alert(
            "PDF library could not be loaded. Please check your internet connection and try again."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF();


    /* =====================================================
       USER INFORMATION
    ====================================================== */

    const fullName =
        userData.full_name || "User";


    const email =
        userData.email || "Not available";


    const generatedDate =
        new Date().toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );


    /* =====================================================
       PDF HEADER
    ====================================================== */

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(22);

    pdf.text(
        "FinPilot AI",
        20,
        20
    );


    pdf.setFontSize(15);

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.text(
        "Personal Finance Report",
        20,
        29
    );


    pdf.setFontSize(10);

    pdf.setTextColor(
        100,
        100,
        100
    );

    pdf.text(
        "Smart Personal Finance & AI Budget Coach",
        20,
        36
    );


    /* =====================================================
       USER DETAILS
    ====================================================== */

    pdf.setTextColor(
        40,
        40,
        40
    );

    pdf.setFontSize(10);

    pdf.text(
        "Name: " + fullName,
        20,
        48
    );


    pdf.text(
        "Email: " + email,
        20,
        55
    );


    pdf.text(
        "Generated: " + generatedDate,
        20,
        62
    );


    /* =====================================================
       FINANCIAL SUMMARY
    ====================================================== */

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(14);

    pdf.text(
        "Financial Summary",
        20,
        77
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(11);


    const totalIncome =
        Number(
            reportData.total_income || 0
        );


    const totalExpenses =
        Number(
            reportData.total_expenses || 0
        );


    const balance =
        Number(
            reportData.balance || 0
        );


    pdf.text(
        "Total Income: " +
        formatCurrency(totalIncome),
        25,
        87
    );


    pdf.text(
        "Total Expenses: " +
        formatCurrency(totalExpenses),
        25,
        95
    );


    pdf.text(
        "Current Balance: " +
        formatCurrency(balance),
        25,
        103
    );


    /* =====================================================
       EXPENSE CATEGORIES
    ====================================================== */

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(14);

    pdf.text(
        "Expense Categories",
        20,
        118
    );


    const categories =
        reportData.category_expenses || [];


    const categoryMap = {};


    categories.forEach(
        function (category) {

            const key =
                String(
                    category.category || ""
                )
                .trim()
                .toLowerCase();


            if (!key) {
                return;
            }


            if (
                Object.prototype.hasOwnProperty.call(
                    categoryMap,
                    key
                )
            ) {

                categoryMap[key] +=
                    Number(
                        category.total || 0
                    );

            } else {

                categoryMap[key] =
                    Number(
                        category.total || 0
                    );

            }

        }
    );


    const categoryRows =
        Object.keys(categoryMap)
        .map(
            function (category) {

                const displayName =
                    category.charAt(0).toUpperCase() +
                    category.slice(1);


                return [
                    displayName,
                    formatCurrency(
                        categoryMap[category]
                    )
                ];

            }
        );


    if (categoryRows.length > 0) {

        pdf.autoTable({

            startY: 123,

            head: [
                [
                    "Category",
                    "Amount"
                ]
            ],

            body: categoryRows,

            theme: "grid",

            styles: {
                fontSize: 9
            },

            headStyles: {
                fontStyle: "bold"
            }

        });

    } else {

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(10);

        pdf.text(
            "No expense categories available.",
            25,
            130
        );

    }


    /* =====================================================
       MONTHLY SPENDING
    ====================================================== */

    let monthlyStartY =
        pdf.lastAutoTable
            ? pdf.lastAutoTable.finalY + 15
            : 145;


    if (monthlyStartY > 260) {

        pdf.addPage();

        monthlyStartY = 20;

    }


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(14);

    pdf.text(
        "Monthly Spending",
        20,
        monthlyStartY
    );


    const monthlyData =
        reportData.monthly_expenses || [];


    const monthlyRows =
        monthlyData.map(
            function (monthData) {

                return [
                    formatMonth(
                        monthData.month
                    ),

                    formatCurrency(
                        monthData.total || 0
                    )
                ];

            }
        );


    if (monthlyRows.length > 0) {

        pdf.autoTable({

            startY:
                monthlyStartY + 5,

            head: [
                [
                    "Month",
                    "Total Spending"
                ]
            ],

            body: monthlyRows,

            theme: "grid",

            styles: {
                fontSize: 9
            },

            headStyles: {
                fontStyle: "bold"
            }

        });

    } else {

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(10);

        pdf.text(
            "No monthly spending data available.",
            25,
            monthlyStartY + 10
        );

    }


    /* =====================================================
       BUDGET STATUS
    ====================================================== */

    let budgetStartY =
        pdf.lastAutoTable
            ? pdf.lastAutoTable.finalY + 15
            : monthlyStartY + 25;


    if (budgetStartY > 260) {

        pdf.addPage();

        budgetStartY = 20;

    }


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(14);

    pdf.text(
        "Budget Status",
        20,
        budgetStartY
    );


    const budgetRows =
        reportBudgetsData.map(
            function (budget) {

                const category =
                    String(
                        budget.category || ""
                    );


                const limit =
                    Number(
                        budget.limit_amount || 0
                    );


                const categoryKey =
                    category
                        .trim()
                        .toLowerCase();


                const matchingCategory =
                    categoryMap[
                        categoryKey
                    ] || 0;


                const remaining =
                    limit -
                    matchingCategory;


                let status =
                    "Within Budget";


                if (
                    matchingCategory >
                    limit
                ) {

                    status =
                        "Over Budget";

                } else if (
                    limit > 0 &&
                    matchingCategory >=
                    limit * 0.8
                ) {

                    status =
                        "Near Limit";

                }


                return [
                    category,
                    formatCurrency(limit),
                    formatCurrency(matchingCategory),
                    formatCurrency(remaining),
                    status
                ];

            }
        );


    if (budgetRows.length > 0) {

        pdf.autoTable({

            startY:
                budgetStartY + 5,

            head: [
                [
                    "Category",
                    "Budget",
                    "Spent",
                    "Remaining",
                    "Status"
                ]
            ],

            body: budgetRows,

            theme: "grid",

            styles: {
                fontSize: 8
            },

            headStyles: {
                fontStyle: "bold"
            }

        });

    } else {

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(10);

        pdf.text(
            "No budgets created yet.",
            25,
            budgetStartY + 10
        );

    }


    /* =====================================================
       SAVINGS GOALS
    ====================================================== */

    let goalsStartY =
        pdf.lastAutoTable
            ? pdf.lastAutoTable.finalY + 15
            : budgetStartY + 25;


    if (goalsStartY > 260) {

        pdf.addPage();

        goalsStartY = 20;

    }


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(14);

    pdf.text(
        "Savings Goals",
        20,
        goalsStartY
    );


    const goalRows =
        reportGoalsData.map(
            function (goal) {

                const target =
                    Number(
                        goal.target_amount || 0
                    );


                const saved =
                    Number(
                        goal.saved_amount || 0
                    );


                let progress = 0;


                if (target > 0) {

                    progress =
                        (
                            saved /
                            target
                        ) * 100;

                }


                progress =
                    Math.min(
                        progress,
                        100
                    );


                return [

                    String(
                        goal.goal_name ||
                        "Unnamed Goal"
                    ),

                    formatCurrency(
                        target
                    ),

                    formatCurrency(
                        saved
                    ),

                    progress.toFixed(1) +
                    "%",

                    String(
                        goal.target_date ||
                        "Not specified"
                    )

                ];

            }
        );


    if (goalRows.length > 0) {

        pdf.autoTable({

            startY:
                goalsStartY + 5,

            head: [
                [
                    "Goal",
                    "Target",
                    "Saved",
                    "Progress",
                    "Target Date"
                ]
            ],

            body: goalRows,

            theme: "grid",

            styles: {
                fontSize: 8
            },

            headStyles: {
                fontStyle: "bold"
            }

        });

    } else {

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(10);

        pdf.text(
            "No savings goals created yet.",
            25,
            goalsStartY + 10
        );

    }


    /* =====================================================
       PDF FOOTER
    ====================================================== */

    const pageCount =
        pdf.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        pdf.setPage(page);


        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(
            120,
            120,
            120
        );


        pdf.text(
            "Generated by FinPilot AI",
            20,
            290
        );


        pdf.text(
            "Page " +
            page +
            " of " +
            pageCount,
            170,
            290
        );

    }


    /* =====================================================
       SAVE PDF
    ====================================================== */

    const safeName =
        String(fullName)
        .trim()
        .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
        );


    pdf.save(
        "FinPilot_AI_Report_" +
        safeName +
        ".pdf"
    );

}


/* =========================================================
   CURRENCY FORMAT
========================================================= */

function formatCurrency(amount) {

    return "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}


/* =========================================================
   MONTH FORMAT
========================================================= */

function formatMonth(monthValue) {

    if (!monthValue) {

        return "Unknown Month";

    }


    const parts =
        String(monthValue).split("-");


    if (parts.length !== 2) {

        return monthValue;

    }


    const year =
        Number(parts[0]);


    const month =
        Number(parts[1]);


    if (
        !year ||
        !month ||
        month < 1 ||
        month > 12
    ) {

        return monthValue;

    }


    const date =
        new Date(
            year,
            month - 1,
            1
        );


    return date.toLocaleString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showReportError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.innerHTML =
        `
            <p class="report-empty">
                ${escapeHtml(message)}
            </p>
        `;

}