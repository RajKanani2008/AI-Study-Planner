const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const registerForm = document.getElementById("registerForm");
const registerStatus = document.getElementById("registerStatus");
const registerSubmit = registerForm.querySelector('[type="submit"]');

togglePassword.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    togglePassword.innerHTML = show
        ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
    togglePassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
    togglePassword.setAttribute("aria-pressed", String(show));
});

const strengthLabel = document.getElementById("passwordStrength");
password.addEventListener("input", () => {
    const value = password.value;
    const score = [
        value.length >= 8,
        value.length >= 12,
        /[a-z]/.test(value) && /[A-Z]/.test(value),
        /\d/.test(value),
        /[^A-Za-z0-9]/.test(value)
    ].filter(Boolean).length;
    const levels = ["Use at least 8 characters.", "Weak", "Fair", "Good", "Strong", "Very strong"];
    strengthLabel.textContent = levels[score];
});

registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    registerStatus.textContent = "";
    if (!registerForm.reportValidity()) return;

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const pass = password.value;
    if (pass !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
        confirmPassword.reportValidity();
        confirmPassword.setCustomValidity("");
        return;
    }

    try {
        const { account } = window.StudyPlannerAuth.readAccount();
        if (account?.email?.toLowerCase() === email) {
            registerStatus.textContent = "This browser already has an account for that email. Sign in instead.";
            return;
        }
        if (account?.email && account.email.toLowerCase() !== email
            && !window.confirm("This browser already has a local profile. Replace its sign-in profile? Your study data will stay on this device.")) {
            return;
        }

        registerSubmit.disabled = true;
        registerSubmit.setAttribute("aria-busy", "true");
        registerSubmit.textContent = "Creating profile…";
        await window.StudyPlannerAuth.createAccount({ fullName, email, password: pass });
        registerStatus.textContent = "Local demo profile created. This is not a server account; sign in on this browser to continue.";
        window.setTimeout(() => { window.location.href = "login.html"; }, 1100);
    } catch (error) {
        registerStatus.textContent = error.message || "Could not create the local demo profile.";
    } finally {
        registerSubmit.disabled = false;
        registerSubmit.removeAttribute("aria-busy");
        registerSubmit.textContent = "Register";
    }
});
