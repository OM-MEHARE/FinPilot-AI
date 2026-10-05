// ==========================================
// FinPilot AI
// Login Page
// ==========================================

// Get Form
const loginForm = document.getElementById("loginForm");

// Login Event
loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get Values
    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    // Validation
    if (email === "" || password === "") {

        alert("Please fill all fields.");

        return;
    }

    try {

        // Send Login Request
        const response = await fetch(
            "/login",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email: email,

                    password: password

                })

            }
        );

        const result = await response.json();

        if (response.ok) {

            // Save Logged In User
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(result)
            );

            alert(result.message);

            // Open Dashboard
            window.location.href = "dashboard.html";

        }

        else {

            alert(result.detail);

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

});


// ==========================================
// Show / Hide Password
// ==========================================

const toggleButton = document.querySelector(".toggle-password");

const passwordInput = document.getElementById("password");

toggleButton.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        toggleButton.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    }

    else {

        passwordInput.type = "password";

        toggleButton.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});