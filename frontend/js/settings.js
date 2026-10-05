// =========================================================
// FINPILOT AI - SETTINGS
// =========================================================


// =========================================================
// CHECK USER SESSION
// =========================================================

const loggedInUser =
    localStorage.getItem("loggedInUser");


if (!loggedInUser) {

    alert("Please login first.");

    window.location.href =
        "login.html";

}


// =========================================================
// GET USER DATA
// =========================================================

const userData =
    JSON.parse(loggedInUser);


// =========================================================
// DISPLAY PROFILE
// =========================================================

function setupProfile() {

    const profileName =
        document.getElementById(
            "profileName"
        );


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    const settingsAvatar =
        document.getElementById(
            "settingsAvatar"
        );


    const fullName =
        userData.full_name || "User";


    // Header name

    if (profileName) {

        profileName.innerText =
            fullName;

    }


    // Create initials

    const initials =
        fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                function (part) {

                    return part
                        .charAt(0)
                        .toUpperCase();

                }
            )
            .join("");


    // Header avatar

    if (profileAvatar) {

        profileAvatar.innerText =
            initials || "U";

    }


    // Settings avatar

    if (settingsAvatar) {

        settingsAvatar.innerText =
            initials || "U";

    }

}


// =========================================================
// DISPLAY USER INFORMATION
// =========================================================

function displayUserInformation() {

    const settingsUserName =
        document.getElementById(
            "settingsUserName"
        );


    const settingsFullName =
        document.getElementById(
            "settingsFullName"
        );


    const settingsEmail =
        document.getElementById(
            "settingsEmail"
        );


    if (userData.full_name) {

        if (settingsUserName) {

            settingsUserName.innerText =
                userData.full_name;

        }


        if (settingsFullName) {

            settingsFullName.innerText =
                userData.full_name;

        }

    }


    if (
        settingsEmail &&
        userData.email
    ) {

        settingsEmail.innerText =
            userData.email;

    }

}


// =========================================================
// CURRENT MONTH
// =========================================================

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


// =========================================================
// BACK TO DASHBOARD
// =========================================================

function setupDashboardButton() {

    const dashboardBtn =
        document.getElementById(
            "dashboardBtn"
        );


    if (!dashboardBtn) {
        return;
    }


    dashboardBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

function logoutUser() {

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


// =========================================================
// SETUP LOGOUT BUTTONS
// =========================================================

function setupLogout() {

    const settingsLogoutBtn =
        document.getElementById(
            "settingsLogoutBtn"
        );


    const sidebarLogoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (settingsLogoutBtn) {

        settingsLogoutBtn.addEventListener(
            "click",
            logoutUser
        );

    }


    if (sidebarLogoutBtn) {

        sidebarLogoutBtn.addEventListener(
            "click",
            logoutUser
        );

    }

}


// =========================================================
// INITIALIZE SETTINGS PAGE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupProfile();

        displayUserInformation();

        setupCurrentMonth();

        setupDashboardButton();

        setupLogout();

    }
);