// ==========================================
// FinPilot AI
// Budget Management
// ==========================================


// ==========================================
// Check User Session
// ==========================================

const loggedInUser =
    localStorage.getItem("loggedInUser");


if (!loggedInUser) {

    alert("Please login first.");

    window.location.href = "login.html";

}


// ==========================================
// User Information
// ==========================================

const userData =
    JSON.parse(loggedInUser);


// ==========================================
// Display Logged In User
// ==========================================

const profileName =
    document.getElementById("profileName");


if (profileName && userData.full_name) {

    profileName.innerText =
        userData.full_name;

}


// ==========================================
// Current Month
// ==========================================

const currentMonth =
    document.getElementById("currentMonth");


if (currentMonth) {

    currentMonth.innerText =
        new Date().toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

}


// ==========================================
// Budget Form
// ==========================================

const budgetForm =
    document.getElementById("budgetForm");


// ==========================================
// Budget Message
// ==========================================

const budgetMessage =
    document.getElementById("budgetMessage");


// ==========================================
// Edit State
// ==========================================

let editingBudgetId = null;


// ==========================================
// Add / Update Budget
// ==========================================

budgetForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const category =
            document.getElementById(
                "budgetCategory"
            ).value;


        const amount =
            document.getElementById(
                "budgetAmount"
            ).value;


        if (!category || !amount) {

            budgetMessage.innerText =
                "Please enter all budget details.";

            return;

        }


        // ==========================================
        // Update Existing Budget
        // ==========================================

        if (editingBudgetId !== null) {

            await updateBudget(
                editingBudgetId,
                category,
                amount
            );

            return;

        }


        // ==========================================
        // Add New Budget
        // ==========================================

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8001/budgets?user_id=" +
                    userData.user_id,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id:
                                userData.user_id,

                            category:
                                category,

                            limit_amount:
                                Number(amount)

                        })

                    }
                );


            const result =
                await response.json();


            if (response.ok && result.success) {

                budgetMessage.innerText =
                    "Budget added successfully!";


                budgetForm.reset();


                await loadBudgets();

            }

            else {

                budgetMessage.innerText =
                    result.detail ||
                    "Unable to add budget.";

            }

        }

        catch (error) {

            console.error(
                "Unable to add budget:",
                error
            );


            budgetMessage.innerText =
                "Unable to connect to server.";

        }

    }
);


// ==========================================
// Load Budgets
// ==========================================

async function loadBudgets() {

    const budgetsContainer =
        document.getElementById(
            "budgetsContainer"
        );


    if (!budgetsContainer) {

        return;

    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/budgets?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load budgets."
            );

        }


        const data =
            await response.json();


        budgetsContainer.innerHTML =
            "";


        // ==========================================
        // Empty State
        // ==========================================

        if (
            !data.budgets ||
            data.budgets.length === 0
        ) {

            budgetsContainer.innerHTML = `

                <div class="empty-budget">

                    <i class="fa-solid fa-chart-pie"></i>

                    <h3>
                        No budgets found
                    </h3>

                    <p>
                        Create your first budget to start managing your spending.
                    </p>

                </div>

            `;

            return;

        }


        // ==========================================
        // Display Budget Cards
        // ==========================================

        data.budgets.forEach(
            function (budget) {

                const budgetCard =
                    document.createElement("div");


                budgetCard.className =
                    "budget-card";


                const usage =
                    Number(
                        budget.usage || 0
                    );


                const safeUsage =
                    Math.min(
                        Math.max(
                            usage,
                            0
                        ),
                        100
                    );


                const status =
                    budget.status ||
                    "Active";


                budgetCard.innerHTML = `

                    <div class="budget-card-header">

                        <div class="budget-category">

                            <div class="budget-icon">

                                <i class="fa-solid fa-wallet"></i>

                            </div>

                            <h3>
                                ${escapeHtml(
                                    budget.category
                                )}
                            </h3>

                        </div>


                        <div class="budget-card-actions">

                            <button
                                class="edit-budget-btn"
                                onclick="editBudget(${budget.id})"
                                title="Edit Budget">

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                class="delete-budget-btn"
                                onclick="deleteBudget(${budget.id})"
                                title="Delete Budget">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </div>


                    <div class="budget-stats">

                        <div class="budget-stat">

                            <span>
                                Budget
                            </span>

                            <strong>
                                ${formatCurrency(
                                    budget.limit_amount
                                )}
                            </strong>

                        </div>


                        <div class="budget-stat">

                            <span>
                                Spent
                            </span>

                            <strong>
                                ${formatCurrency(
                                    budget.spent || 0
                                )}
                            </strong>

                        </div>


                        <div class="budget-stat">

                            <span>
                                Remaining
                            </span>

                            <strong>
                                ${formatCurrency(
                                    budget.remaining || 0
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="budget-progress">

                        <div class="progress-header">

                            <span>
                                Budget Usage
                            </span>

                            <span>
                                ${usage.toFixed(0)}%
                            </span>

                        </div>


                        <div class="progress-track">

                            <div
                                class="progress-bar"
                                style="width: ${safeUsage}%">
                            </div>

                        </div>

                    </div>


                    <div class="budget-status">

                        Status:

                        <strong>
                            ${escapeHtml(status)}
                        </strong>

                    </div>

                `;


                budgetsContainer.appendChild(
                    budgetCard
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load budgets:",
            error
        );


        budgetsContainer.innerHTML = `

            <div class="empty-budget">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load budgets
                </h3>

                <p>
                    Please make sure the FinPilot AI server is running.
                </p>

            </div>

        `;

    }

}


// ==========================================
// Edit Budget
// ==========================================

async function editBudget(budgetId) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/budgets?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load budget."
            );

        }


        const data =
            await response.json();


        const budget =
            (data.budgets || []).find(
                function (item) {

                    return item.id === budgetId;

                }
            );


        if (!budget) {

            alert(
                "Budget record not found."
            );

            return;

        }


        document.getElementById(
            "budgetCategory"
        ).value =
            budget.category;


        document.getElementById(
            "budgetAmount"
        ).value =
            budget.limit_amount;


        editingBudgetId =
            budgetId;


        const submitButton =
            budgetForm.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            submitButton.innerHTML = `

                <i class="fa-solid fa-pen"></i>

                <span>
                    Update Budget
                </span>

            `;

        }


        if (budgetMessage) {

            budgetMessage.innerText =
                "Editing budget record.";

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        console.error(
            "Edit Budget Error:",
            error
        );


        alert(
            "Unable to load budget record."
        );

    }

}


// ==========================================
// Update Budget
// ==========================================

async function updateBudget(
    budgetId,
    category,
    amount
) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/budgets/" +
                budgetId,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        user_id:
                            userData.user_id,

                        category:
                            category,

                        limit_amount:
                            Number(amount)

                    })

                }
            );


        const result =
            await response.json();


        if (response.ok && result.success) {

            editingBudgetId =
                null;


            budgetForm.reset();


            const submitButton =
                budgetForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.innerHTML = `

                    <i class="fa-solid fa-plus"></i>

                    <span>
                        Add Budget
                    </span>

                `;

            }


            budgetMessage.innerText =
                "Budget updated successfully!";


            await loadBudgets();

        }

        else {

            budgetMessage.innerText =
                result.detail ||
                "Unable to update budget.";

        }

    }

    catch (error) {

        console.error(
            "Update Budget Error:",
            error
        );


        budgetMessage.innerText =
            "Unable to connect to server.";

    }

}


// ==========================================
// Delete Budget
// ==========================================

async function deleteBudget(budgetId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this budget?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/budgets/" +
                budgetId +
                "?user_id=" +
                userData.user_id,
                {

                    method: "DELETE"

                }
            );


        const result =
            await response.json();


        if (response.ok && result.success) {

            budgetMessage.innerText =
                "Budget deleted successfully!";


            await loadBudgets();

        }

        else {

            budgetMessage.innerText =
                result.detail ||
                "Unable to delete budget.";

        }

    }

    catch (error) {

        console.error(
            "Unable to delete budget:",
            error
        );


        budgetMessage.innerText =
            "Unable to connect to server.";

    }

}


// ==========================================
// Format Currency
// ==========================================

function formatCurrency(amount) {

    return (

        "₹" +

        Number(amount || 0)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            )

    );

}


// ==========================================
// Escape HTML
// ==========================================

function escapeHtml(value) {

    return String(value)

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


// ==========================================
// Logout
// ==========================================

const logoutButton =
    document.getElementById("logoutBtn");


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


            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// Load Existing Budgets
// ==========================================

loadBudgets();