// ==========================================
// FinPilot AI
// Income Page
// ==========================================


// ==========================================
// Get Logged In User
// ==========================================

const loggedInUser =
    localStorage.getItem("loggedInUser");


if (!loggedInUser) {

    alert("Please login first.");

    window.location.href = "login.html";

}


// ==========================================
// Convert Stored User Data to Object
// ==========================================

const userData =
    JSON.parse(loggedInUser);


// ==========================================
// Get Form Elements
// ==========================================

const incomeForm =
    document.getElementById("incomeForm");

const incomeList =
    document.getElementById("incomeList");

const incomeMessage =
    document.getElementById("incomeMessage");


// ==========================================
// Edit State
// ==========================================

let editingIncomeId = null;


// ==========================================
// Add Income
// ==========================================

incomeForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const source =
            document
                .getElementById("source")
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


        if (!source || !amount || !date) {

            alert(
                "Please fill in all required fields."
            );

            return;

        }


        // ==========================================
        // EDIT EXISTING INCOME
        // ==========================================

        if (editingIncomeId !== null) {

            await updateIncome(
                editingIncomeId,
                source,
                amount,
                date
            );

            return;

        }


        // ==========================================
        // ADD NEW INCOME
        // ==========================================

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8001/income",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id:
                                userData.user_id,

                            source:
                                source,

                            amount:
                                Number(amount),

                            date:
                                date

                        })

                    }
                );


            const result =
                await response.json();


            if (response.ok) {

                alert(
                    result.message
                );

                incomeForm.reset();

                loadIncome();

            }

            else {

                alert(
                    result.detail ||
                    "Unable to add income."
                );

            }

        }

        catch (error) {

            console.error(
                "Add Income Error:",
                error
            );

            alert(
                "Unable to connect to server."
            );

        }

    }
);


// ==========================================
// Load Income Records
// ==========================================

async function loadIncome() {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/income?user_id=" +
                userData.user_id
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load income records."
            );

        }


        const data =
            await response.json();


        displayIncome(
            data.income || []
        );

    }

    catch (error) {

        console.error(
            "Load Income Error:",
            error
        );

        if (incomeList) {

            incomeList.innerHTML =
                "<p>Unable to load income records.</p>";

        }

    }

}


// ==========================================
// Display Income Records
// ==========================================

function displayIncome(incomeRecords) {

    if (!incomeList) {

        return;

    }


    if (incomeRecords.length === 0) {

        incomeList.innerHTML =
            `
            <div class="empty-income">
                <i class="fa-solid fa-wallet"></i>
                <p>No income records found.</p>
            </div>
            `;

        return;

    }


    incomeList.innerHTML = "";


    incomeRecords.forEach(
        function (income) {

            const incomeCard =
                document.createElement("div");

            incomeCard.className =
                "income-record";


            incomeCard.innerHTML =
                `
                <div class="income-record-info">

                    <div class="income-icon">
                        <i class="fa-solid fa-wallet"></i>
                    </div>

                    <div>

                        <h3>
                            ${escapeHtml(income.source)}
                        </h3>

                        <p>
                            ${formatDate(income.date)}
                        </p>

                    </div>

                </div>


                <div class="income-record-right">

                    <strong>
                        ${formatCurrency(income.amount)}
                    </strong>


                    <div class="income-actions">

                        <button
                            class="edit-income-btn"
                            onclick="editIncome(${income.id})"
                            title="Edit Income"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>


                        <button
                            class="delete-income-btn"
                            onclick="deleteIncome(${income.id})"
                            title="Delete Income"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>
                `;


            incomeList.appendChild(
                incomeCard
            );

        }
    );

}


// ==========================================
// Edit Income
// ==========================================

async function editIncome(incomeId) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/income?user_id=" +
                userData.user_id
            );


        const data =
            await response.json();


        const income =
            (data.income || []).find(
                function (item) {

                    return item.id === incomeId;

                }
            );


        if (!income) {

            alert(
                "Income record not found."
            );

            return;

        }


        document.getElementById(
            "source"
        ).value =
            income.source;


        document.getElementById(
            "amount"
        ).value =
            income.amount;


        document.getElementById(
            "date"
        ).value =
            income.date;


        editingIncomeId =
            incomeId;


        const submitButton =
            incomeForm.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            submitButton.innerText =
                "Update Income";

        }


        if (incomeMessage) {

            incomeMessage.innerText =
                "Editing income record.";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    catch (error) {

        console.error(
            "Edit Income Error:",
            error
        );

        alert(
            "Unable to load income record."
        );

    }

}


// ==========================================
// Update Income
// ==========================================

async function updateIncome(
    incomeId,
    source,
    amount,
    date
) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/income/" +
                incomeId,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            userData.user_id,

                        source:
                            source,

                        amount:
                            Number(amount),

                        date:
                            date

                    })

                }
            );


        const result =
            await response.json();


        if (response.ok) {

            alert(
                result.message
            );


            editingIncomeId =
                null;


            incomeForm.reset();


            const submitButton =
                incomeForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.innerText =
                    "Add Income";

            }


            if (incomeMessage) {

                incomeMessage.innerText =
                    "";

            }


            loadIncome();

        }

        else {

            alert(
                result.detail ||
                "Unable to update income."
            );

        }

    }

    catch (error) {

        console.error(
            "Update Income Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// Delete Income
// ==========================================

async function deleteIncome(incomeId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this income record?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/income/" +
                incomeId +
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


            loadIncome();

        }

        else {

            alert(
                result.detail ||
                "Unable to delete income."
            );

        }

    }

    catch (error) {

        console.error(
            "Delete Income Error:",
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// Load Records When Page Opens
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadIncome();

    }
);