// =========================================
// FinPilot AI
// Register Page
// =========================================

// Get Form
const registerForm = document.getElementById("registerForm");

// Listen for Submit
registerForm.addEventListener("submit", async function (event) {

    // Stop Page Refresh
    event.preventDefault();

    // Get Form Values
    const fullName = document.getElementById("fullname").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    const terms = document.getElementById("terms").checked;

    // Check Empty Fields
    if (
        fullName === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    // Check Password Match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Check Terms
    if (!terms) {
        alert("Please accept Terms & Conditions.");
        return;
    }

    // Prepare Data
    const userData = {
        full_name: fullName,
        email: email,
        password: password
    };

    try {

        // Send Data to Backend
        const response = await fetch(
            "http://127.0.0.1:8001/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(userData)
            }
        );

        const result = await response.json();

        // Success
        if (response.ok) {

            alert(result.message);

            window.location.href = "login.html";

        } else {

            alert(result.detail);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

});
// =========================================
// Show / Hide Password
// =========================================

const toggleButton = document.querySelector(".toggle-password");
const passwordInput = document.getElementById("password");

toggleButton.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        toggleButton.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";

        toggleButton.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});