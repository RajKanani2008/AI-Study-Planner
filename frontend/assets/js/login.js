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
            togglePassword.setAttribute("aria-label", "Hide password");
            togglePassword.setAttribute("aria-pressed", "true");

        } else {

            password.type = "password";
            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';
            togglePassword.setAttribute("aria-label", "Show password");
            togglePassword.setAttribute("aria-pressed", "false");

        }

    });

}

// Login Form
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const emailFeedback = document.getElementById("loginEmailError");
const passwordFeedback = document.getElementById("loginPasswordError");
const loginSubmit = document.getElementById("loginSubmit");
const loginStatus = document.getElementById("loginStatus");

function updateFieldError(field, feedback, message) {

    const invalid = Boolean(message);
    field.classList.toggle("is-invalid", invalid);
    field.setAttribute("aria-invalid", String(invalid));
    feedback.textContent = message;
    feedback.hidden = !invalid;
    return !invalid;

}

function validateEmail() {

    if (!emailInput.value.trim()) return "Enter your email address.";
    if (!emailInput.validity.valid) return "Enter a valid email address.";
    return "";

}

function validatePassword() {

    return password.value.trim() ? "" : "Enter your password.";

}

emailInput.addEventListener("blur", () => {

    updateFieldError(emailInput, emailFeedback, validateEmail());

});

password.addEventListener("blur", () => {

    updateFieldError(password, passwordFeedback, validatePassword());

});

loginForm.addEventListener("input", event => {

    if (event.target === emailInput && emailInput.classList.contains("is-invalid")) {
        updateFieldError(emailInput, emailFeedback, validateEmail());
    }

    if (event.target === password && password.classList.contains("is-invalid")) {
        updateFieldError(password, passwordFeedback, validatePassword());
    }

    if (loginStatus) loginStatus.textContent = "";

});

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordHelp = document.getElementById("forgotPasswordHelp");

if (forgotPasswordLink && forgotPasswordHelp) {

    forgotPasswordLink.addEventListener("click", event => {
        event.preventDefault();
        const expanded = forgotPasswordLink.getAttribute("aria-expanded") === "true";
        forgotPasswordLink.setAttribute("aria-expanded", String(!expanded));
        forgotPasswordHelp.hidden = expanded;
    });

}

if (loginForm) {

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const email = emailInput.value.trim();

        const pass =
            document.getElementById("loginPassword").value.trim();

        const emailValid = updateFieldError(emailInput, emailFeedback, validateEmail());
        const passwordValid = updateFieldError(password, passwordFeedback, validatePassword());

        if (!emailValid || !passwordValid) {

            loginStatus.textContent = "Review the highlighted fields to continue.";
            (emailValid ? password : emailInput).focus();
            return;

        }

        if (loginSubmit.disabled) return;

        loginSubmit.disabled = true;
        loginSubmit.setAttribute("aria-busy", "true");
        loginSubmit.querySelector("[data-submit-label]").textContent = "Signing in…";
        loginSubmit.querySelector(".login-spinner").hidden = false;
        loginSubmit.querySelector(".login-spinner").setAttribute("aria-hidden", "false");
        loginStatus.textContent = "Signing in…";

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

