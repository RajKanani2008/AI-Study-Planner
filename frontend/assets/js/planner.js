/* ==========================================================
                PLANNER JS
        Smart AI Study Planner
========================================================== */

/* ==========================================================
                PAGE LOADER
========================================================== */

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        setTimeout(() => {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

        }, 600);

    }

});

/* ==========================================================
                LOAD USER NAME
========================================================== */

const user = JSON.parse(localStorage.getItem("studyPlannerUser"));

if (user) {

    const dashboardUser = document.getElementById("dashboardUser");

    const studentName = document.getElementById("studentName");

    if (dashboardUser) {

        dashboardUser.textContent = user.fullName;

    }

    if (studentName) {

        studentName.value = user.fullName;

    }

}

/* ==========================================================
                AUTO SET TODAY DATE
========================================================== */

const startDate = document.getElementById("startDate");

if (startDate) {

    const today = new Date().toISOString().split("T")[0];

    startDate.value = today;

}

/* ==========================================================
                FORM ELEMENTS
========================================================== */

const plannerForm = document.getElementById("plannerForm");

const planOutput = document.getElementById("planOutput");

/* ==========================================================
                GENERATE AI PLAN
========================================================== */

if (plannerForm) {

    plannerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("studentName").value;

        const subject = document.getElementById("subject").value;

        const goal = document.getElementById("studyGoal").value;

        const hours = document.getElementById("studyHours").value;

        const difficulty = document.getElementById("difficulty").value;

        const breakTime = document.getElementById("breakTime").value;

        planOutput.innerHTML = `
        
        <div class="alert alert-success">

            <h4>🤖 AI Study Plan Generated</h4>

            <hr>

            <p><strong>Student :</strong> ${name}</p>

            <p><strong>Subject :</strong> ${subject}</p>

            <p><strong>Goal :</strong> ${goal}</p>

            <p><strong>Study Time :</strong> ${hours} Hours / Day</p>

            <p><strong>Difficulty :</strong> ${difficulty}</p>

            <p><strong>Break :</strong> ${breakTime}</p>

            <hr>

            <p>
            ✅ Study every day consistently.<br>
            ✅ Revise for 30 minutes daily.<br>
            ✅ Practice coding after every session.<br>
            ✅ Complete weekly revision every Sunday.
            </p>

        </div>

        `;

    });

}

/* ==========================================================
                SAVE STUDY PLAN
========================================================== */

const savePlanBtn = document.getElementById("savePlan");

if (savePlanBtn) {

    savePlanBtn.addEventListener("click", () => {

        if (!planOutput.innerHTML.trim()) {

            alert("Please generate a study plan first.");

            return;

        }

        localStorage.setItem("savedStudyPlan", planOutput.innerHTML);

        alert("✅ Study Plan Saved Successfully!");

    });

}

/* ==========================================================
                LOAD SAVED STUDY PLAN
========================================================== */

const savedPlan = localStorage.getItem("savedStudyPlan");

if (savedPlan) {

    planOutput.innerHTML = savedPlan;

}

/* ==========================================================
                DOWNLOAD STUDY PLAN
========================================================== */

const downloadBtn = document.getElementById("downloadPlan");

if (downloadBtn) {

    downloadBtn.addEventListener("click", () => {

        const content = planOutput.innerText;

        if (!content.trim()) {

            alert("Please generate a study plan first.");

            return;

        }

        const blob = new Blob([content], { type: "text/plain" });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = "AI_Study_Plan.txt";

        link.click();

        URL.revokeObjectURL(link.href);

    });

}

/* ==========================================================
                AUTO SCROLL TO RESULT
========================================================== */

if (plannerForm) {

    plannerForm.addEventListener("submit", () => {

        setTimeout(() => {

            document.getElementById("planResult")
                .scrollIntoView({

                    behavior: "smooth"

                });

        }, 300);

    });

}

/* ==========================================================
                DARK MODE
========================================================== */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        const isDark = document.body.classList.contains("dark-mode");

        localStorage.setItem("plannerTheme", isDark ? "dark" : "light");

    });

}

/* ==========================================================
                LOAD SAVED THEME
========================================================== */

const savedTheme = localStorage.getItem("plannerTheme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

}

/* ==========================================================
                FORM VALIDATION
========================================================== */

plannerForm?.addEventListener("submit", function (e) {

    const subject = document.getElementById("subject").value.trim();

    const hours = parseInt(document.getElementById("studyHours").value);

    if (subject === "") {

        alert("Please enter a subject.");

        e.preventDefault();

        return;

    }

    if (isNaN(hours) || hours < 1 || hours > 12) {

        alert("Study hours must be between 1 and 12.");

        e.preventDefault();

        return;

    }

});

/* ==========================================================
                CHARACTER COUNTER (SUBJECT)
========================================================== */

const subjectInput = document.getElementById("subject");

if (subjectInput) {

    subjectInput.addEventListener("input", () => {

        console.log(
            `Subject Length: ${subjectInput.value.length}`
        );

    });

}

/* ==========================================================
                RESET FORM
========================================================== */

const resetBtn = document.createElement("button");

if (plannerForm) {

    resetBtn.type = "button";

    resetBtn.className = "btn btn-secondary btn-lg ms-3";

    resetBtn.innerHTML = `

        <i class="fa-solid fa-rotate-left"></i>

        Reset

    `;

    plannerForm.querySelector(".text-center").appendChild(resetBtn);

    resetBtn.addEventListener("click", () => {

        plannerForm.reset();

        const today = new Date().toISOString().split("T")[0];

        if (startDate) {

            startDate.value = today;

        }

        planOutput.innerHTML = `

            <div class="alert alert-info">

                <i class="fa-solid fa-circle-info"></i>

                Fill out the form above and click
                <strong>"Generate AI Study Plan"</strong>
                to see your personalized study schedule.

            </div>

        `;

    });

}

/* ==========================================================
                SAVE LAST FORM DATA
========================================================== */

plannerForm?.addEventListener("input", () => {

    const formData = {

        studentName: document.getElementById("studentName").value,

        subject: document.getElementById("subject").value,

        studyGoal: document.getElementById("studyGoal").value,

        studyHours: document.getElementById("studyHours").value,

        difficulty: document.getElementById("difficulty").value,

        breakTime: document.getElementById("breakTime").value,

        startDate: document.getElementById("startDate").value,

        endDate: document.getElementById("endDate").value

    };

    localStorage.setItem("plannerFormData", JSON.stringify(formData));

});

/* ==========================================================
                LOAD LAST FORM DATA
========================================================== */

const lastData = JSON.parse(localStorage.getItem("plannerFormData"));

if (lastData) {

    document.getElementById("studentName").value = lastData.studentName || "";

    document.getElementById("subject").value = lastData.subject || "";

    document.getElementById("studyGoal").value = lastData.studyGoal || "";

    document.getElementById("studyHours").value = lastData.studyHours || "";

    document.getElementById("difficulty").value = lastData.difficulty || "Easy";

    document.getElementById("breakTime").value = lastData.breakTime || "10 Minutes";

    document.getElementById("startDate").value = lastData.startDate || "";

    document.getElementById("endDate").value = lastData.endDate || "";

}

/* ==========================================================
                BUTTON ANIMATION
========================================================== */

document.querySelectorAll(".btn").forEach((button) => {

    button.addEventListener("click", function () {

        this.classList.add("active-btn");

        setTimeout(() => {

            this.classList.remove("active-btn");

        }, 200);

    });

});

/* ==========================================================
                AI GREETING
========================================================== */

const currentHour = new Date().getHours();

let greeting = "Hello";

if (currentHour < 12) {

    greeting = "🌅 Good Morning";

} else if (currentHour < 17) {

    greeting = "☀️ Good Afternoon";

} else {

    greeting = "🌙 Good Evening";

}

const plannerTitle = document.querySelector(".planner-content h1");

if (plannerTitle) {

    plannerTitle.innerHTML = `${greeting}, Welcome to Smart AI Study Planner`;

}

/* ==========================================================
                AUTO MIN END DATE
========================================================== */

const endDateInput = document.getElementById("endDate");

if (startDate && endDateInput) {

    startDate.addEventListener("change", () => {

        endDateInput.min = startDate.value;

    });

}

/* ==========================================================
                SUCCESS MESSAGE
========================================================== */

function showSuccess(message) {

    const toast = document.createElement("div");

    toast.className = "alert alert-success position-fixed";

    toast.style.top = "20px";

    toast.style.right = "20px";

    toast.style.zIndex = "9999";

    toast.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        ${message}

    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

if (savePlanBtn) {

    savePlanBtn.addEventListener("click", () => {

        showSuccess("Study Plan Saved Successfully!");

    });

}

/* ==========================================================
                CONSOLE MESSAGE
========================================================== */

console.log("====================================");

console.log(" Smart AI Study Planner Loaded ");

console.log(" Developed by Team Smart AI Study Planner ");

console.log("====================================");