/*=========================================
        REGISTER PAGE
=========================================*/

// Show / Hide Password
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

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

// Register Form
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const pass = document.getElementById("password").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        if (fullName === "" || email === "" || pass === "" || confirmPass === "") {

            alert("Please fill all fields.");
            return;

        }

        if (pass !== confirmPass) {

            alert("Passwords do not match.");
            return;

        }

        // Save User
        const user = {
            fullName,
            email,
            password: pass
        };

        localStorage.setItem("studyPlannerUser", JSON.stringify(user));

        alert("Registration Successful!");

        // Redirect to Login
        window.location.href = "login.html";

    });

}

console.log("✅ Register Page Loaded Successfully");