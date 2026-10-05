// ==========================================
// FinPilot AI
// Expense Page
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
// Get Logged In User Data
// ==========================================

const userData =
    JSON.parse(loggedInUser);


// ==========================================
// Get Expense Form
// ==========================================

const expenseForm =
    document.getElementById("expenseForm");

const expenseList =
    document.getElementById("expenseList");

const expenseMessage =
    document.getElementById("expenseMessage");


// ==========================================
// Edit State
// ==========================================

let editingExpenseId = null;


// ==========================================
// Update Current Month
// ==========================================

function updateCurrentMonth() {

    const currentMonthElement =
        document.getElementById("currentMonth");

    if (!currentMonthElement) {

        return;

    }

    const now =
        new Date();

    currentMonthElement.innerText =
        now.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );

}


// ==========================================
// Update Profile Name
// ==========================================

function updateProfileName() {

    const profileName =
        document.getElementById("profileName");

    if (
        profileName &&
        userData &&
        userData.full_name
    ) {

        profileName.innerText =
            userData.full_name;

    }

}


// ==========================================
// Submit Expense Form
// ==========================================

expenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const category =
            document
                .getElementById("category")
                .value
                .trim();


        const amount =
            document
                .getElementById("amount")
                .value;


        const date =
            document
                .getElementById("date")
                .value;


        const notes =
            document
                .getElementById("notes")
                .value
                .trim();


        // ==========================================
        // Validation
        // ==========================================

        if (
            category === "" ||
            amount === "" ||
            date === ""
        ) {

            alert(
                "Please fill all required fields."
            );

            return;

        }


        // ==========================================
        // Update Existing Expense
        // ==========================================

        if (editingExpenseId !== null) {

            await updateExpense(
                editingExpenseId,
                category,
                amount,
                date,
                notes
            );

            return;

        }


        // ==========================================
        // Add New Expense
        // ==========================================

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8001/expenses",
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

                            amount:
                                Number(amount),

                            date:
                                date,

                            notes:
                                notes

                        })

                    }
                );


            const result =
                await response.json();


            if (response.ok) {

                alert(
                    result.message
                );

                expenseForm.reset();

                loadExpenses();

            }

            else {

                alert(
                    result.detail ||
                    "Failed to add expense."
                );

            }

        }

        catch (error) {

            console.error(
                "Add Expense Error:",
                error
            );

            alert(
                "Unable to connect to server."
            );

        }

    }
);


// ==========================================
// Load Expense Records
// ==========================================

async function loadExpenses() {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/expenses?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load expense records."
            );

        }


        const data =
            await response.json();


        displayExpenses(
            data.expenses || []
        );

    }

    catch (error) {

        console.error(
            "Load Expenses Error:",
            error
        );


        if (expenseList) {

            expenseList.innerHTML =
                `
                <div class="empty-expense">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Unable to load expense records.
                    </p>

                </div>
                `;

        }

    }

}


// ==========================================
// Display Expense Records
// ==========================================

function displayExpenses(expenseRecords) {

    if (!expenseList) {

        return;

    }


    if (expenseRecords.length === 0) {

        expenseList.innerHTML =
            `
            <div class="empty-expense">

                <i class="fa-solid fa-receipt"></i>

                <p>
                    No expense records found.
                </p>

            </div>
            `;

        return;

    }


    expenseList.innerHTML = "";


    expenseRecords.forEach(
        function (expense) {

            const expenseCard =
                document.createElement("div");


            expenseCard.className =
                "expense-record";


            expenseCard.innerHTML =
                `
                <div class="expense-record-info">

                    <div class="expense-icon">

                        <i class="fa-solid fa-receipt"></i>

                    </div>

                    <div>

                        <h3>
                            ${escapeHtml(
                                expense.category
                            )}
                        </h3>

                        <p>
                            ${formatDate(
                                expense.date
                            )}
                        </p>

                        ${
                            expense.notes
                            ?
                            `
                            <small>
                                ${escapeHtml(
                                    expense.notes
                                )}
                            </small>
                            `
                            :
                            ""
                        }

                    </div>

                </div>


                <div class="expense-record-right">

                    <strong>
                        -${formatCurrency(
                            expense.amount
                        )}
                    </strong>


                    <div class="expense-actions">

                        <button
                            class="edit-expense-btn"
                            onclick="editExpense(${expense.id})"
                            title="Edit Expense"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="delete-expense-btn"
                            onclick="deleteExpense(${expense.id})"
                            title="Delete Expense"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </div>
                `;


            expenseList.appendChild(
                expenseCard
            );

        }
    );

}


// ==========================================
// Edit Expense
// ==========================================

async function editExpense(expenseId) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/expenses?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load expense record."
            );

        }


        const data =
            await response.json();


        const expense =
            (data.expenses || []).find(
                function (item) {

                    return item.id === expenseId;

                }
            );


        if (!expense) {

            alert(
                "Expense record not found."
            );

            return;

        }


        document.getElementById(
            "category"
        ).value =
            expense.category;


        document.getElementById(
            "amount"
        ).value =
            expense.amount;


        document.getElementById(
            "date"
        ).value =
            expense.date;


        document.getElementById(
            "notes"
        ).value =
            expense.notes || "";


        editingExpenseId =
            expenseId;


        const submitButton =
            expenseForm.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            const buttonText =
                submitButton.querySelector("span");

            if (buttonText) {

                buttonText.innerText =
                    "Update Expense";

            }
            else {

                submitButton.innerText =
                    "Update Expense";

            }

        }


        if (expenseMessage) {

            expenseMessage.innerText =
                "Editing expense record.";

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        console.error(
            "Edit Expense Error:",
            error
        );

        alert(
            "Unable to load expense record."
        );

    }

}


// ==========================================
// Update Expense
// ==========================================

async function updateExpense(
    expenseId,
    category,
    amount,
    date,
    notes
) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/expenses/" +
                expenseId,
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

                        amount:
                            Number(amount),

                        date:
                            date,

                        notes:
                            notes

                    })

                }
            );


        const result =
            await response.json();


        if (response.ok) {

            alert(
                result.message
            );


            editingExpenseId =
                null;


            expenseForm.reset();


            const submitButton =
                expenseForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                const buttonText =
                    submitButton.querySelector("span");

                if (buttonText) {

                    buttonText.innerText =
                        "Add Expense";

                }
                else {

                    submitButton.innerText =
                        "Add Expense";

                }

            }


            if (expenseMessage) {

                expenseMessage.innerText =
                    "";

            }


            loadExpenses();

        }

        else {

            alert(
                result.detail ||
                "Unable to update expense."
            );

        }

    }

    catch (error) {

        console.error(
            "Update Expense Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// Delete Expense
// ==========================================

async function deleteExpense(expenseId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense record?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/expenses/" +
                expenseId +
                "?user_id=" +
                userData.user_id,
                {

                    method: "DELETE"

                }
            );


        const result =
            await response.json();


        if (response.ok) {

            alert(
                result.message
            );

            loadExpenses();

        }

        else {

            alert(
                result.detail ||
                "Unable to delete expense."
            );

        }

    }

    catch (error) {

        console.error(
            "Delete Expense Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

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
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
    );

}


// ==========================================
// Format Date
// ==========================================

function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


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
// Page Startup
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCurrentMonth();

        updateProfileName();

        loadExpenses();

    }
);