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

const user = window.StudyPlanner.storage.read("studyPlannerUser", null);

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

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    startDate.value = today;

}

/* ==========================================================
                FORM ELEMENTS
========================================================== */

const plannerForm = document.getElementById("plannerForm");

const planOutput = document.getElementById("planOutput");
const escapeHtml = window.StudyPlanner.escapeHtml;
let planGenerated = false;

const renderSavedTaskData = () => {
    const tasks = window.StudyPlanner.storage.read("studyPlannerTasks", []);
    const subjects = window.StudyPlanner.storage.read("studyPlannerSubjects", []);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const todayKey = dateKey(today);
    const todayBody = document.getElementById("plannerTodaySchedule");
    const todayTasks = tasks.filter(task => task.dueDate === todayKey);
    if (todayBody) {
        todayBody.innerHTML = todayTasks.length
            ? todayTasks.map(task => `<tr><td>Today</td><td>${escapeHtml(task.title)}</td><td>${escapeHtml(task.subject || "General")}</td><td>${task.completed ? "Completed" : escapeHtml(task.priority || "Open")}</td></tr>`).join("")
            : '<tr><td colspan="4" class="text-center text-secondary">No tasks due today. Add dated tasks on the Tasks page.</td></tr>';
    }

    const upcomingBody = document.getElementById("plannerUpcomingTasks");
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 7);
    const upcomingTasks = tasks.filter(task => task.dueDate && task.dueDate >= todayKey && task.dueDate <= dateKey(limit))
        .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
    if (upcomingBody) {
        upcomingBody.innerHTML = upcomingTasks.length
            ? upcomingTasks.map(task => {
                const due = new Date(`${task.dueDate}T00:00:00`);
                return `<tr><td>${escapeHtml(due.toLocaleDateString(undefined, { weekday: "long" }))}</td><td>${escapeHtml(task.title)}</td><td>${escapeHtml(due.toLocaleDateString(undefined, { month: "short", day: "numeric" }))}</td><td>${task.completed ? "Completed" : escapeHtml(task.priority || "Open")}</td></tr>`;
            }).join("")
            : '<tr><td colspan="4" class="text-center text-secondary">No tasks due in the next seven days.</td></tr>';
    }

    const subjectNames = [...new Set([
        ...subjects.map(subject => subject.name).filter(Boolean),
        ...tasks.map(task => task.subject).filter(Boolean)
    ])];
    const progress = document.getElementById("plannerSubjectProgress");
    if (progress) {
        progress.innerHTML = subjectNames.length
            ? subjectNames.map(name => {
                const matching = tasks.filter(task => task.subject === name);
                const done = matching.filter(task => task.completed).length;
                const percent = matching.length ? Math.round(done / matching.length * 100) : 0;
                return `<div><div class="d-flex justify-content-between gap-3"><strong>${escapeHtml(name)}</strong><span>${done}/${matching.length} complete</span></div><div class="progress mt-2" role="progressbar" aria-label="${escapeHtml(name)} task completion" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:${percent}%"></div></div></div>`;
            }).join("")
            : '<div class="empty-state"><strong>No subject activity yet</strong><span>Complete tasks with a subject to track progress.</span></div>';
    }
};

renderSavedTaskData();
window.StudyPlanner.storage.subscribe("studyPlannerTasks", renderSavedTaskData);
window.StudyPlanner.storage.subscribe("studyPlannerSubjects", renderSavedTaskData);

/* ==========================================================
                GENERATE AI PLAN
========================================================== */

if (plannerForm) {

    plannerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("studentName").value.trim();

        const subject = document.getElementById("subject").value.trim();

        const goal = document.getElementById("studyGoal").value;

        const hours = document.getElementById("studyHours").value;

        const difficulty = document.getElementById("difficulty").value;

        const breakTime = document.getElementById("breakTime").value;

        const startDateValue = document.getElementById("startDate").value;

        const endDateValue = document.getElementById("endDate").value;

        if (!subject || !name || Number(hours) < 1 || Number(hours) > 12 || endDateValue < startDateValue) {

            window.StudyPlanner.notify("Check the name, subject, hours, and date range.", "error");

            return;

        }

        planOutput.innerHTML = `
        
        <div class="alert alert-success">

            <h4>Study plan draft</h4>

            <hr>

            <p><strong>Student:</strong> ${escapeHtml(name)}</p>

            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>

            <p><strong>Goal:</strong> ${escapeHtml(goal)}</p>

            <p><strong>Study Time:</strong> ${escapeHtml(hours)} Hours / Day</p>

            <p><strong>Difficulty:</strong> ${escapeHtml(difficulty)}</p>

            <p><strong>Break:</strong> ${escapeHtml(breakTime)}</p>

            <p><strong>Schedule:</strong> ${escapeHtml(startDateValue)} to ${escapeHtml(endDateValue)}</p>

            <p>This browser-generated preview uses general tips; no live AI service was contacted.</p>

            <hr>

            <p>
            ✅ Study every day consistently.<br>
            ✅ Revise for 30 minutes daily.<br>
            ✅ Practice coding after every session.<br>
            ✅ Complete weekly revision every Sunday.
            </p>

        </div>

        `;

        planGenerated = true;
        window.StudyPlanner.notify("Browser-only study plan draft built from your inputs. No AI service was contacted.");

    });

}

/* ==========================================================
                SAVE STUDY PLAN
========================================================== */

const savePlanBtn = document.getElementById("savePlan");

if (savePlanBtn) {

    savePlanBtn.addEventListener("click", () => {

        if (!planGenerated) {

            window.StudyPlanner.notify("Generate a study plan before saving it.", "error");

            return;

        }

        localStorage.setItem("savedStudyPlan", planOutput.innerText);
        window.StudyPlanner.notify("Study plan saved.");

    });

}

/* ==========================================================
                LOAD SAVED STUDY PLAN
========================================================== */

const savedPlan = localStorage.getItem("savedStudyPlan");

if (savedPlan) {

    planOutput.textContent = new DOMParser().parseFromString(savedPlan, "text/html").body.textContent;
    planGenerated = true;

}

/* ==========================================================
                DOWNLOAD STUDY PLAN
========================================================== */

const downloadBtn = document.getElementById("downloadPlan");

if (downloadBtn) {

    downloadBtn.addEventListener("click", () => {

        const content = planOutput.innerText;

        if (!planGenerated || !content.trim()) {

            window.StudyPlanner.notify("Generate a study plan before downloading it.", "error");

            return;

        }

        const blob = new Blob([content], { type: "text/plain" });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = "study-plan.txt";

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
        localStorage.removeItem("plannerFormData");
        localStorage.removeItem("savedStudyPlan");

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        if (startDate) {

            startDate.value = today;

        }

        planOutput.innerHTML = `

            <div class="alert alert-info">

                <i class="fa-solid fa-circle-info"></i>

                Fill out the form above and click
                <strong>"Build Local Study Plan"</strong>
                to create a browser-only draft. A live AI service is not connected.

            </div>

        `;

        planGenerated = false;

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

const lastData = window.StudyPlanner.storage.read("plannerFormData", null);

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

    endDateInput.min = startDate.value;

    startDate.addEventListener("change", () => {

        endDateInput.min = startDate.value;

    });

}

/* ==========================================================
                SUCCESS MESSAGE
========================================================== */

/* ==========================================================
                CONSOLE MESSAGE
========================================================== */

console.log("====================================");

console.log(" Smart AI Study Planner Loaded ");

console.log(" Developed by Team Smart AI Study Planner ");

console.log("====================================");