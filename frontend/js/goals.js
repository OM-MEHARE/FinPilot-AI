// =========================================================
// FinPilot AI - Goals
// =========================================================


// =========================================================
// Check User Session
// =========================================================

const loggedInUser = localStorage.getItem("loggedInUser");

if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
}

const userData = JSON.parse(loggedInUser);


// =========================================================
// User Profile
// =========================================================

const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");

if (profileName && userData.full_name) {
    profileName.innerText = userData.full_name;
}

if (profileAvatar && userData.full_name) {

    const nameParts = userData.full_name
        .trim()
        .split(/\s+/);

    let initials = "";

    if (nameParts.length >= 2) {
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

    const now = new Date();

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
// Goal Elements
// =========================================================

const showGoalFormBtn =
    document.getElementById("showGoalFormBtn");

const goalForm =
    document.getElementById("goalForm");

const cancelGoalBtn =
    document.getElementById("cancelGoalBtn");

const createGoalBtn =
    document.getElementById("createGoalBtn");


// =========================================================
// Show Goal Form
// =========================================================

if (showGoalFormBtn) {

    showGoalFormBtn.addEventListener(
        "click",
        function () {

            goalForm.style.display = "block";

            goalForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


// =========================================================
// Hide Goal Form
// =========================================================

if (cancelGoalBtn) {

    cancelGoalBtn.addEventListener(
        "click",
        function () {

            goalForm.style.display = "none";

        }
    );

}


// =========================================================
// Load Goals
// =========================================================

async function loadGoals() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8001/goals?user_id=" +
            userData.user_id
        );

        if (!response.ok) {
            throw new Error("Unable to load goals.");
        }

        const data = await response.json();

        console.log("Goals:", data);

        const goalsContainer =
            document.getElementById("goalsContainer");

        if (!goalsContainer) {
            return;
        }

        goalsContainer.innerHTML = "";


        // =================================================
        // No Goals
        // =================================================

        if (
            !data.goals ||
            data.goals.length === 0
        ) {

            goalsContainer.innerHTML = `

                <div class="empty-goals">

                    <div class="empty-goals-icon">
                        <i class="fa-solid fa-bullseye"></i>
                    </div>

                    <h3>
                        No savings goals yet
                    </h3>

                    <p>
                        Create your first goal and start building your financial future.
                    </p>

                </div>

            `;

            return;
        }


        // =================================================
        // Display Goals
        // =================================================

        data.goals.forEach(function (goal) {

            const goalCard =
                document.createElement("div");

            goalCard.className =
                "goal-card";


            const progress =
                Math.min(
                    Math.max(
                        Number(goal.progress || 0),
                        0
                    ),
                    100
                );


            const targetAmount =
                Number(
                    goal.target_amount || 0
                );


            const savedAmount =
                Number(
                    goal.saved_amount || 0
                );


            const remaining =
                Number(
                    goal.remaining || 0
                );


            goalCard.innerHTML = `

                <div class="goal-card-header">

                    <div class="goal-title-wrapper">

                        <div class="goal-icon">

                            <i class="fa-solid fa-bullseye"></i>

                        </div>

                        <h3>
                            ${escapeHtml(goal.goal_name)}
                        </h3>

                    </div>

                </div>


                <div class="goal-stats">

                    <div class="goal-stat">

                        <span>
                            Target
                        </span>

                        <strong>
                            ₹${targetAmount.toLocaleString("en-IN")}
                        </strong>

                    </div>


                    <div class="goal-stat">

                        <span>
                            Saved
                        </span>

                        <strong>
                            ₹${savedAmount.toLocaleString("en-IN")}
                        </strong>

                    </div>


                    <div class="goal-stat">

                        <span>
                            Remaining
                        </span>

                        <strong>
                            ₹${remaining.toLocaleString("en-IN")}
                        </strong>

                    </div>

                </div>


                <div class="goal-progress">

                    <div class="progress-header">

                        <span>
                            Savings Progress
                        </span>

                        <span>
                            ${progress}%
                        </span>

                    </div>


                    <div class="progress-track">

                        <div
                            class="progress-bar"
                            style="width: ${progress}%"
                        ></div>

                    </div>

                </div>


                <div class="goal-date">

                    <i class="fa-regular fa-calendar"></i>

                    <span>
                        Target Date:
                        ${escapeHtml(goal.target_date || "Not specified")}
                    </span>

                </div>


                <div class="goal-actions">

                    <button
                        class="update-goal-btn"
                        type="button"
                    >

                        <i class="fa-solid fa-pen"></i>

                        Update Savings

                    </button>


                    <button
                        class="delete-goal-btn"
                        type="button"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Delete Goal

                    </button>

                </div>

            `;


            // =================================================
            // Update Savings
            // =================================================

            const updateButton =
                goalCard.querySelector(
                    ".update-goal-btn"
                );


            updateButton.addEventListener(
                "click",
                async function () {

                    const newSavedAmount =
                        prompt(
                            "Enter the new saved amount:",
                            goal.saved_amount
                        );


                    if (
                        newSavedAmount === null
                    ) {
                        return;
                    }


                    const newAmount =
                        Number(newSavedAmount);


                    if (
                        isNaN(newAmount) ||
                        newAmount < 0
                    ) {

                        alert(
                            "Please enter a valid saved amount."
                        );

                        return;
                    }


                    if (
                        newAmount >
                        targetAmount
                    ) {

                        alert(
                            "Saved amount cannot be greater than the target amount."
                        );

                        return;
                    }


                    try {

                        const response =
                            await fetch(
                                "http://127.0.0.1:8001/goals/" +
                                goal.id,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({

                                        user_id:
                                            userData.user_id,

                                        goal_name:
                                            goal.goal_name,

                                        target_amount:
                                            targetAmount,

                                        saved_amount:
                                            newAmount,

                                        target_date:
                                            goal.target_date

                                    })
                                }
                            );


                        const result =
                            await response.json();


                        console.log(
                            "Update Goal:",
                            result
                        );


                        if (
                            response.ok &&
                            result.success
                        ) {

                            alert(
                                "Goal updated successfully!"
                            );

                            loadGoals();

                        } else {

                            alert(
                                result.message ||
                                result.detail ||
                                "Unable to update goal."
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Unable to update goal:",
                            error
                        );

                        alert(
                            "Unable to connect to the server."
                        );

                    }

                }
            );


            // =================================================
            // Delete Goal
            // =================================================

            const deleteButton =
                goalCard.querySelector(
                    ".delete-goal-btn"
                );


            deleteButton.addEventListener(
                "click",
                async function () {

                    const confirmDelete =
                        confirm(
                            "Are you sure you want to delete this goal?"
                        );


                    if (!confirmDelete) {
                        return;
                    }


                    try {

                        const response =
                            await fetch(
                                "http://127.0.0.1:8001/goals/" +
                                goal.id +
                                "?user_id=" +
                                userData.user_id,
                                {
                                    method: "DELETE"
                                }
                            );


                        const result =
                            await response.json();


                        console.log(
                            "Delete Goal:",
                            result
                        );


                        if (
                            response.ok &&
                            result.success
                        ) {

                            alert(
                                "Goal deleted successfully!"
                            );

                            loadGoals();

                        } else {

                            alert(
                                result.message ||
                                result.detail ||
                                "Unable to delete goal."
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Unable to delete goal:",
                            error
                        );

                        alert(
                            "Unable to connect to the server."
                        );

                    }

                }
            );


            goalsContainer.appendChild(
                goalCard
            );

        });

    } catch (error) {

        console.error(
            "Unable to load goals:",
            error
        );

        const goalsContainer =
            document.getElementById("goalsContainer");

        if (goalsContainer) {

            goalsContainer.innerHTML = `

                <div class="empty-goals">

                    <div class="empty-goals-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <h3>
                        Unable to load goals
                    </h3>

                    <p>
                        Please make sure the FinPilot AI server is running.
                    </p>

                </div>

            `;

        }

    }

}


// =========================================================
// Create New Goal
// =========================================================

if (createGoalBtn) {

    createGoalBtn.addEventListener(
        "click",
        async function () {

            const goalName =
                document.getElementById(
                    "goalName"
                ).value.trim();


            const targetAmount =
                Number(
                    document.getElementById(
                        "targetAmount"
                    ).value
                );


            const savedAmount =
                Number(
                    document.getElementById(
                        "savedAmount"
                    ).value
                );


            const targetDate =
                document.getElementById(
                    "targetDate"
                ).value;


            // =================================================
            // Validation
            // =================================================

            if (!goalName) {

                alert(
                    "Please enter a goal name."
                );

                return;
            }


            if (
                !targetAmount ||
                targetAmount <= 0
            ) {

                alert(
                    "Please enter a valid target amount."
                );

                return;
            }


            if (
                savedAmount < 0
            ) {

                alert(
                    "Saved amount cannot be negative."
                );

                return;
            }


            if (
                savedAmount >
                targetAmount
            ) {

                alert(
                    "Saved amount cannot be greater than the target amount."
                );

                return;
            }


            // =================================================
            // Send Goal to Backend
            // =================================================

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8001/goals",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                user_id:
                                    userData.user_id,

                                goal_name:
                                    goalName,

                                target_amount:
                                    targetAmount,

                                saved_amount:
                                    savedAmount,

                                target_date:
                                    targetDate || null

                            })
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Create Goal:",
                    result
                );


                if (
                    response.ok &&
                    result.success
                ) {

                    alert(
                        "Goal created successfully!"
                    );


                    document.getElementById(
                        "goalName"
                    ).value = "";


                    document.getElementById(
                        "targetAmount"
                    ).value = "";


                    document.getElementById(
                        "savedAmount"
                    ).value = "0";


                    document.getElementById(
                        "targetDate"
                    ).value = "";


                    goalForm.style.display =
                        "none";


                    loadGoals();

                } else {

                    alert(
                        result.message ||
                        result.detail ||
                        "Unable to create goal."
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to create goal:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


// =========================================================
// Logout
// =========================================================

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
// Start Goals
// =========================================================

loadGoals();