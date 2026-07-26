/*=========================================
        LOGIN PAGE
=========================================*/

// Show / Hide Password
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("loginPassword");

if (togglePassword && password) {

    togglePassword.addEventListener("click", () => {

        if (password.type === "password") {

            password.type = "text";
            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        } else {

            password.type = "password";
            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    });

}

// Login Form
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const pass =
            document.getElementById("loginPassword").value.trim();

        if (email === "" || pass === "") {

            alert("Please fill all fields.");
            return;

        }

        // Save Login
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isLoggedIn", "true");

        alert("Login Successful!");

        // Redirect
        window.location.href = "dashboard.html";

    });

}

// Remember Email
window.addEventListener("load", () => {

    const email = localStorage.getItem("userEmail");

    if (email) {

        document.getElementById("loginEmail").value = email;

    }

});

console.log("✅ Login Page Loaded Successfully");

