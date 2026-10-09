// =========================================================
// FinPilot AI - AI Coach
// =========================================================


// =========================================================
// Check User Session
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
// User Profile
// =========================================================

const profileName =
    document.getElementById("profileName");


const profileAvatar =
    document.getElementById("profileAvatar");


if (
    profileName &&
    userData.full_name
) {

    profileName.innerText =
        userData.full_name;

}


if (
    profileAvatar &&
    userData.full_name
) {

    const nameParts =
        userData.full_name
            .trim()
            .split(/\s+/);


    let initials = "";


    if (
        nameParts.length >= 2
    ) {

        initials =
            nameParts[0].charAt(0) +
            nameParts[nameParts.length - 1].charAt(0);

    } else {

        initials =
            nameParts[0].substring(0, 2);

    }


    profileAvatar.innerText =
        initials.toUpperCase();

}


// =========================================================
// Current Month
// =========================================================

const currentMonth =
    document.getElementById("currentMonth");


if (currentMonth) {

    const now =
        new Date();


    currentMonth.innerText =
        now.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );

}


// =========================================================
// Load AI Insight
// =========================================================

async function loadAIInsight() {

    try {

        const response =
            await fetch(
                "/ai-coach?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "AI Coach:",
            data
        );


        if (
            !data.success ||
            !data.insight
        ) {

            return;

        }


        const aiTitle =
            document.getElementById("aiTitle");


        const aiMessage =
            document.getElementById("aiMessage");


        const aiStatus =
            document.getElementById("aiStatus");


        const aiRecommendation =
            document.getElementById("aiRecommendation");


        if (aiTitle) {

            aiTitle.innerText =
                data.insight.title;

        }


        if (aiMessage) {

            aiMessage.innerText =
                data.insight.message;

        }


        if (aiStatus) {

            aiStatus.innerText =
                data.insight.status;

        }


        if (aiRecommendation) {

            aiRecommendation.innerText =
                data.insight.recommendation ||
                "Continue monitoring your financial activity and maintain healthy spending habits.";

        }

    }

    catch (error) {

        console.error(
            "Unable to load AI insight:",
            error
        );


        const aiMessage =
            document.getElementById("aiMessage");


        if (aiMessage) {

            aiMessage.innerText =
                "Unable to load AI financial guidance.";

        }

    }

}


// =========================================================
// Load Savings Goals
// =========================================================

async function loadCoachGoals() {

    try {

        const response =
            await fetch(
                "/goals?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "Coach Goals:",
            data
        );


        const coachGoals =
            document.getElementById("coachGoals");


        if (!coachGoals) {
            return;
        }


        coachGoals.innerHTML = "";


        if (
            !data.goals ||
            data.goals.length === 0
        ) {

            coachGoals.innerHTML = `

                <div class="loading-state">

                    <i class="fa-solid fa-bullseye"></i>

                    No savings goals created yet.

                </div>

            `;

            return;

        }


        data.goals.forEach(
            function (goal) {

                const goalCard =
                    document.createElement("div");


                goalCard.className =
                    "coach-goal-card";


                const progress =
                    Math.min(
                        Math.max(
                            Number(
                                goal.progress || 0
                            ),
                            0
                        ),
                        100
                    );


                goalCard.innerHTML = `

                    <div class="coach-goal-title">

                        <div class="coach-goal-icon">

                            <i class="fa-solid fa-bullseye"></i>

                        </div>

                        <h4>
                            ${escapeHtml(
                                goal.goal_name
                            )}
                        </h4>

                    </div>


                    <div class="coach-goal-progress">

                        <span>
                            Progress
                        </span>

                        <strong>
                            ${progress}%
                        </strong>

                    </div>


                    <div class="goal-progress-track">

                        <div
                            class="goal-progress-bar"
                            style="width: ${progress}%"
                        ></div>

                    </div>


                    <p>

                        ₹${Number(
                            goal.saved_amount || 0
                        ).toLocaleString("en-IN")}

                        saved of

                        ₹${Number(
                            goal.target_amount || 0
                        ).toLocaleString("en-IN")}

                    </p>

                `;


                coachGoals.appendChild(
                    goalCard
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load savings goals:",
            error
        );

    }

}


// =========================================================
// Load Financial Summary
// =========================================================

async function loadFinancialSummary() {

    try {

        const response =
            await fetch(
                "/dashboard?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "Financial Summary:",
            data
        );


        const totalIncome =
            document.getElementById(
                "coachTotalIncome"
            );


        const totalExpenses =
            document.getElementById(
                "coachTotalExpenses"
            );


        const balance =
            document.getElementById(
                "coachBalance"
            );


        if (totalIncome) {

            totalIncome.innerText =
                "₹" +
                Number(
                    data.total_income || 0
                ).toLocaleString("en-IN");

        }


        if (totalExpenses) {

            totalExpenses.innerText =
                "₹" +
                Number(
                    data.total_expenses || 0
                ).toLocaleString("en-IN");

        }


        if (balance) {

            balance.innerText =
                "₹" +
                Number(
                    data.balance || 0
                ).toLocaleString("en-IN");

        }

    }

    catch (error) {

        console.error(
            "Unable to load financial summary:",
            error
        );

    }

}


// =========================================================
// Load Budget Status
// =========================================================

async function loadBudgetStatus() {

    try {

        const response =
            await fetch(
                "/budgets?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "Budget Status:",
            data
        );


        const budgets =
            data.budgets || [];


        let overBudgetCount = 0;

        let nearLimitCount = 0;


        budgets.forEach(
            function (budget) {

                if (
                    budget.status ===
                    "Over Budget"
                ) {

                    overBudgetCount++;

                }

                else if (
                    budget.status ===
                    "Near Limit"
                ) {

                    nearLimitCount++;

                }

            }
        );


        const totalBudgets =
            document.getElementById(
                "coachTotalBudgets"
            );


        const overBudget =
            document.getElementById(
                "coachOverBudget"
            );


        const nearLimit =
            document.getElementById(
                "coachNearLimit"
            );


        if (totalBudgets) {

            totalBudgets.innerText =
                budgets.length;

        }


        if (overBudget) {

            overBudget.innerText =
                overBudgetCount;

        }


        if (nearLimit) {

            nearLimit.innerText =
                nearLimitCount;

        }

    }

    catch (error) {

        console.error(
            "Unable to load budget status:",
            error
        );

    }

}


// =========================================================
// Load Spending Breakdown
// =========================================================

async function loadSpendingBreakdown() {

    try {

        const response =
            await fetch(
                "/dashboard?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "Spending Breakdown:",
            data
        );


        const spendingBreakdown =
            document.getElementById(
                "spendingBreakdown"
            );


        if (!spendingBreakdown) {
            return;
        }


        spendingBreakdown.innerHTML = "";


        const categories =
            data.category_expenses || [];


        if (
            categories.length === 0
        ) {

            spendingBreakdown.innerHTML = `

                <div class="loading-state">

                    <i class="fa-solid fa-receipt"></i>

                    No expense data available.

                </div>

            `;

            return;

        }


        const highestAmount =
            Math.max(
                ...categories.map(
                    function (item) {

                        return Number(
                            item.total || 0
                        );

                    }
                )
            );


        categories.forEach(
            function (item) {

                const category =
                    document.createElement("div");


                category.className =
                    "spending-category";


                const amount =
                    Number(
                        item.total || 0
                    );


                let percentage = 0;


                if (
                    highestAmount > 0
                ) {

                    percentage =
                        (
                            amount /
                            highestAmount
                        ) * 100;

                }


                category.innerHTML = `

                    <div class="spending-category-header">

                        <span class="spending-category-name">
                            ${escapeHtml(
                                item.category
                            )}
                        </span>

                        <span class="spending-category-amount">
                            ₹${amount.toLocaleString("en-IN")}
                        </span>

                    </div>


                    <div class="spending-category-bar">

                        <div
                            class="spending-category-progress"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                `;


                spendingBreakdown.appendChild(
                    category
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load spending breakdown:",
            error
        );

    }

}


// =========================================================
// Load Monthly Spending Trend
// =========================================================

async function loadMonthlySpending() {

    try {

        const response =
            await fetch(
                "/dashboard?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        console.log(
            "Monthly Spending:",
            data
        );


        const monthlySpending =
            document.getElementById(
                "monthlySpending"
            );


        if (!monthlySpending) {
            return;
        }


        monthlySpending.innerHTML = "";


        const monthlyData =
            data.monthly_expenses || [];


        // =================================================
        // Calculate Spending Trend
        // =================================================

        const spendingTrendMessage =
            document.getElementById(
                "spendingTrendMessage"
            );


        if (
            monthlyData.length < 2
        ) {

            if (spendingTrendMessage) {

                spendingTrendMessage.innerText =
                    "More monthly spending data is needed to identify a spending trend.";

            }

        }

        else {

            const previousMonth =
                Number(
                    monthlyData[
                        monthlyData.length - 2
                    ].total || 0
                );


            const currentMonthAmount =
                Number(
                    monthlyData[
                        monthlyData.length - 1
                    ].total || 0
                );


            if (
                previousMonth > 0
            ) {

                const change =
                    (
                        (
                            currentMonthAmount -
                            previousMonth
                        ) /
                        previousMonth
                    ) * 100;


                const roundedChange =
                    Math.abs(
                        change
                    ).toFixed(1);


                if (
                    change > 0
                ) {

                    spendingTrendMessage.innerText =
                        "Your spending increased by " +
                        roundedChange +
                        "% compared with the previous month.";

                }

                else if (
                    change < 0
                ) {

                    spendingTrendMessage.innerText =
                        "Your spending decreased by " +
                        roundedChange +
                        "% compared with the previous month.";

                }

                else {

                    spendingTrendMessage.innerText =
                        "Your spending remained stable compared with the previous month.";

                }

            }

            else {

                spendingTrendMessage.innerText =
                    "Your current month has spending data, but there is not enough previous spending data to calculate a percentage change.";

            }

        }


        if (
            monthlyData.length === 0
        ) {

            monthlySpending.innerHTML = `

                <div class="loading-state">

                    <i class="fa-solid fa-chart-line"></i>

                    No monthly spending data available.

                </div>

            `;

            return;

        }


        monthlyData.forEach(
            function (item) {

                const monthItem =
                    document.createElement("div");


                monthItem.className =
                    "monthly-spending-item";


                const amount =
                    Number(
                        item.total || 0
                    );


                let displayMonth =
                    item.month;


                if (
                    item.month &&
                    item.month.length === 7
                ) {

                    const parts =
                        item.month.split("-");


                    const year =
                        parts[0];


                    const month =
                        Number(
                            parts[1]
                        );


                    const date =
                        new Date(
                            year,
                            month - 1,
                            1
                        );


                    displayMonth =
                        date.toLocaleDateString(
                            "en-IN",
                            {
                                month: "long",
                                year: "numeric"
                            }
                        );

                }


                monthItem.innerHTML = `

                    <div class="monthly-spending-header">

                        <span class="monthly-spending-month">

                            ${escapeHtml(
                                displayMonth
                            )}

                        </span>


                        <span class="monthly-spending-amount">

                            ₹${amount.toLocaleString("en-IN")}

                        </span>

                    </div>

                `;


                monthlySpending.appendChild(
                    monthItem
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load monthly spending:",
            error
        );

    }

}


// =========================================================
// AI CHAT
// =========================================================

const aiChatInput =
    document.getElementById(
        "aiChatInput"
    );


const aiChatSend =
    document.getElementById(
        "aiChatSend"
    );


const aiChatMessages =
    document.getElementById(
        "aiChatMessages"
    );


// =========================================================
// Add Chat Message
// =========================================================

function addChatMessage(
    message,
    sender
) {

    const messageContainer =
        document.createElement("div");


    messageContainer.className =
        "ai-chat-message " +
        (
            sender === "user"
                ? "ai-message-user"
                : "ai-message-bot"
        );


    if (
        sender === "user"
    ) {

        messageContainer.innerHTML = `

            <div class="ai-chat-bubble">

                <strong>
                    You
                </strong>

                <p>
                    ${escapeChatMessage(message)}
                </p>

            </div>

        `;

    }

    else {

        messageContainer.innerHTML = `

            <div class="ai-chat-avatar">

                <i class="fa-solid fa-robot"></i>

            </div>


            <div class="ai-chat-bubble">

                <strong>
                    FinPilot AI
                </strong>

                <p>
                    ${escapeChatMessage(message)}
                </p>

            </div>

        `;

    }


    if (aiChatMessages) {

        aiChatMessages.appendChild(
            messageContainer
        );


        aiChatMessages.scrollTop =
            aiChatMessages.scrollHeight;

    }

}


// =========================================================
// Protect Chat Messages
// =========================================================

function escapeChatMessage(message) {

    const div =
        document.createElement("div");


    div.innerText =
        message;


    return div.innerHTML;

}


// =========================================================
// Send AI Chat Message
// =========================================================

async function sendAIChatMessage() {

    if (
        !aiChatInput ||
        !aiChatSend
    ) {

        return;

    }


    const message =
        aiChatInput.value.trim();


    if (!message) {
        return;
    }


    addChatMessage(
        message,
        "user"
    );


    aiChatInput.value = "";

    aiChatInput.disabled = true;

    aiChatSend.disabled = true;


    try {

        const response =
            await fetch(
                "/ai-chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            userData.user_id,

                        message:
                            message

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "AI Chat:",
            data
        );


        if (
            data.success &&
            data.reply
        ) {

            addChatMessage(
                data.reply,
                "bot"
            );

        }

        else {

            addChatMessage(
                "I was unable to process your question.",
                "bot"
            );

        }

    }

    catch (error) {

        console.error(
            "Unable to send AI chat message:",
            error
        );


        addChatMessage(
            "Unable to connect to the AI assistant.",
            "bot"
        );

    }


    aiChatInput.disabled = false;

    aiChatSend.disabled = false;

    aiChatInput.focus();

}


// =========================================================
// Chat Send Button
// =========================================================

if (aiChatSend) {

    aiChatSend.addEventListener(
        "click",
        sendAIChatMessage
    );

}


// =========================================================
// Enter Key
// =========================================================

if (aiChatInput) {

    aiChatInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendAIChatMessage();

            }

        }
    );

}


// =========================================================
// Logout
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


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem(
                "loggedInUser"
            );


            alert(
                "Logged out successfully."
            );


            window.location.href =
                "login.html";

        }
    );

}


// =========================================================
// Escape HTML
// =========================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// Start AI Coach
// =========================================================

loadAIInsight();

loadCoachGoals();

loadFinancialSummary();

loadBudgetStatus();

loadSpendingBreakdown();

loadMonthlySpending();