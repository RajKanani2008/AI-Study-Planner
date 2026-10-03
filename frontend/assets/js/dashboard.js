/* ==========================================================
                DASHBOARD JS
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
                COUNTER ANIMATION
========================================================== */

const counters = document.querySelectorAll("[data-count]");
const studyStorage = window.StudyPlanner.storage;
const dashboardTasks = studyStorage.read("studyPlannerTasks", []);
const dashboardSubjects = studyStorage.read("studyPlannerSubjects", []);
const dashboardSessions = studyStorage.read("studySessions", []);
const dashboardDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const todayKey = dashboardDateKey(new Date());
const todayTasks = dashboardTasks.filter(task => task.dueDate === todayKey);
const todayCompleted = todayTasks.filter(task => task.completed).length;
const todayFocusMinutes = dashboardSessions.filter(session => (session.date || session.completedAt?.slice(0, 10)) === todayKey).reduce((total, session) => total + (Number(session.minutes) || 0), 0);
const focusMinutes = dashboardSessions.reduce((total, session) => total + (Number(session.minutes) || 0), 0);
const sessionDays = new Set(dashboardSessions.map(session => session.completedAt?.slice(0, 10)).filter(Boolean));
let focusStreak = 0;
const streakDate = new Date();
streakDate.setHours(0, 0, 0, 0);
if (!sessionDays.has(`${streakDate.getFullYear()}-${String(streakDate.getMonth() + 1).padStart(2, "0")}-${String(streakDate.getDate()).padStart(2, "0")}`)) {
    streakDate.setDate(streakDate.getDate() - 1);
}
while (sessionDays.has(`${streakDate.getFullYear()}-${String(streakDate.getMonth() + 1).padStart(2, "0")}-${String(streakDate.getDate()).padStart(2, "0")}`)) {
    focusStreak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
}
[
    dashboardSubjects.length,
    dashboardTasks.filter(task => task.completed).length,
    focusStreak,
    Math.round(focusMinutes / 60)
].forEach((value, index) => {
    if (counters[index]) counters[index].dataset.count = String(value);
});

const completionPercent = todayTasks.length ? Math.round(todayCompleted / todayTasks.length * 100) : 0;
const completionBadge = document.getElementById("todayCompletion");
const completionBar = document.getElementById("todayProgressBar");
if (completionBadge) completionBadge.textContent = `${completionPercent}% completed`;
if (completionBar) {
    completionBar.style.width = `${completionPercent}%`;
    completionBar.setAttribute("aria-valuenow", String(completionPercent));
    completionBar.setAttribute("role", "progressbar");
    completionBar.setAttribute("aria-label", "Tasks completed today");
    completionBar.setAttribute("aria-valuemin", "0");
    completionBar.setAttribute("aria-valuemax", "100");
}
const todayTaskCount = document.getElementById("todayTaskCount");
const todayFocusTime = document.getElementById("todayFocusTime");
const todayDoneCount = document.getElementById("todayDoneCount");
if (todayTaskCount) todayTaskCount.textContent = String(todayTasks.length);
if (todayFocusTime) todayFocusTime.textContent = todayFocusMinutes >= 60 ? `${Math.round(todayFocusMinutes / 60 * 10) / 10}h` : `${todayFocusMinutes}m`;
if (todayDoneCount) todayDoneCount.textContent = `${completionPercent}%`;

const todaySchedule = document.getElementById("todaySchedule");
if (todaySchedule) {
    todaySchedule.innerHTML = todayTasks.length ? todayTasks.map(task => `<article class="schedule-item"><div><strong>${window.StudyPlanner.escapeHtml(task.title)}</strong><p>${window.StudyPlanner.escapeHtml(task.subject || "General")} · Due today</p></div><span class="badge ${task.completed ? "text-bg-success" : task.priority === "high" ? "text-bg-danger" : "text-bg-secondary"}">${task.completed ? "Completed" : window.StudyPlanner.escapeHtml(task.priority || "Open")}</span></article>`).join("") : '<div class="empty-state"><i class="fa-regular fa-calendar" aria-hidden="true"></i><strong>No tasks due today</strong><span>Add tasks to see your study schedule here.</span><a class="btn btn-sm btn-outline-primary mt-2" href="tasks.html">Add a task</a></div>';
}

const dashboardSearch = document.querySelector(".dashboard-navbar .search-box input");
if (dashboardSearch) {
    const searchableItems = [...document.querySelectorAll(".schedule-item, .recommend-item")];
    const searchStatus = document.createElement("span");
    searchStatus.className = "visually-hidden";
    searchStatus.setAttribute("aria-live", "polite");
    dashboardSearch.parentElement.append(searchStatus);
    dashboardSearch.addEventListener("input", () => {
        const query = dashboardSearch.value.trim().toLocaleLowerCase();
        let matches = 0;
        searchableItems.forEach(item => {
            const visible = !query || item.textContent.toLocaleLowerCase().includes(query);
            item.hidden = !visible;
            if (visible) matches += 1;
        });
        searchStatus.textContent = query ? `${matches} dashboard results` : "Search cleared";
    });
}

counters.forEach(counter => {

    const target = Number(counter.dataset.count);

    let count = 0;

    const speed = target / 80;

    const updateCounter = () => {

        count += speed;

        if (count < target) {

            counter.innerText = Math.ceil(count);

            requestAnimationFrame(updateCounter);

        } else {

            counter.innerText = target;

        }

    };

    updateCounter();

});

/* ==========================================================
                CHART.JS
========================================================== */

const chartCanvas = document.getElementById("studyChart");
const chartTextColor = getComputedStyle(document.body).getPropertyValue("--muted").trim() || "#667a73";
const chartDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const key = dashboardDateKey(day);
    const minutes = dashboardSessions.filter(session => (session.date || session.completedAt?.slice(0, 10)) === key).reduce((total, session) => total + (Number(session.minutes) || 0), 0);
    return { label: day.toLocaleDateString(undefined, { weekday: "short" }), hours: Math.round(minutes / 60 * 10) / 10 };
});

if (chartCanvas && typeof Chart !== "undefined") {

    new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: chartDays.map(day => day.label),

            datasets: [

                {

                    label: "Study Hours",

                    data: chartDays.map(day => day.hours),

                    borderColor: "#16765f",

                    backgroundColor: "rgba(22,118,95,.14)",

                    fill: true,

                    tension: 0.4,

                    borderWidth: 3,

                    pointRadius: 5,

                    pointBackgroundColor: "#16765f"

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    labels: {

                        color: chartTextColor

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: chartTextColor

                    },

                    grid: {

                        color: "rgba(102,122,115,.16)"

                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: chartTextColor

                    },

                    grid: {

                        color: "rgba(102,122,115,.16)"

                    }

                }

            }

        }

    });

}

/* ==========================================================
                LOAD USER NAME
========================================================== */

const user = window.StudyPlanner.storage.read("studyPlannerUser", null);

if (user) {

    const dashboardUser = document.getElementById("dashboardUser");

    const chatUser = document.getElementById("chatUser");

    if (dashboardUser) {

        dashboardUser.textContent = user.fullName;

    }

    if (chatUser) {

        chatUser.textContent = user.fullName;

    }

}

/* ==========================================================
                PROFILE DROPDOWN
========================================================== */

const profileBtn = document.getElementById("profileBtn");

const profileMenu = document.getElementById("profileMenu");

if (profileBtn && profileMenu) {

    profileBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        profileMenu.classList.toggle("show");

    });

    document.addEventListener("click", () => {

        profileMenu.classList.remove("show");

    });

}

/* ==========================================================
                LOGOUT
========================================================== */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("studyPlannerUser");

        localStorage.removeItem("isLoggedIn");

        window.location.href = "login.html";

    });

}

/* ==========================================================
                POMODORO TIMER
========================================================== */

const timerDisplay = document.getElementById("timer");

const startBtn = document.getElementById("startTimer");

const pauseBtn = document.getElementById("pauseTimer");

const resetBtn = document.getElementById("resetTimer");

let totalSeconds = 25 * 60;

let timerInterval = null;

let isRunning = false;

/* --------------------------
    UPDATE TIMER
-------------------------- */

function updateTimer() {

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    if (timerDisplay) {

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");

    }

}

/* --------------------------
    START TIMER
-------------------------- */

if (startBtn) {

    startBtn.addEventListener("click", () => {

        if (isRunning) return;

        isRunning = true;

        timerInterval = setInterval(() => {

            if (totalSeconds > 0) {

                totalSeconds--;

                updateTimer();

            } else {

                clearInterval(timerInterval);

                isRunning = false;

                alert("🎉 Focus Session Completed!");

            }

        }, 1000);

    });

}

/* --------------------------
    PAUSE TIMER
-------------------------- */

if (pauseBtn) {

    pauseBtn.addEventListener("click", () => {

        clearInterval(timerInterval);

        isRunning = false;

    });

}

/* --------------------------
    RESET TIMER
-------------------------- */

if (resetBtn) {

    resetBtn.addEventListener("click", () => {

        clearInterval(timerInterval);

        isRunning = false;

        totalSeconds = 25 * 60;

        updateTimer();

    });

}

/* --------------------------
    INITIAL LOAD
-------------------------- */

updateTimer();

/* ==========================================================
                QUICK NOTES (LOCAL STORAGE)
========================================================== */

const notesSection = [...document.querySelectorAll(".glass-card")]
    .find(card => card.querySelector("h3")?.textContent.includes("Quick Notes"));

const notesArea = notesSection?.querySelector("textarea");

const saveNotesBtn = notesSection?.querySelector(".btn-primary");

const saveQuickNote = content => {
    const notes = studyStorage.read("studyPlannerNotes", []);
    const existing = notes.find(note => note.id === "dashboard-quick-note");
    const updated = notes.filter(note => note.id !== "dashboard-quick-note");
    if (content.trim()) {
        updated.unshift({
            id: "dashboard-quick-note",
            title: "Quick notes",
            subject: "General",
            body: content.trim(),
            pinned: existing?.pinned || false,
            updatedAt: new Date().toISOString()
        });
    }
    studyStorage.write("studyPlannerNotes", updated);
};

if (notesArea) {

    // Load saved notes
    const savedNotes = localStorage.getItem("studyNotes");

    if (savedNotes) {

        notesArea.value = savedNotes;
        saveQuickNote(savedNotes);

    }

}

if (saveNotesBtn && notesArea) {

    saveNotesBtn.addEventListener("click", () => {

        localStorage.setItem("studyNotes", notesArea.value);
        saveQuickNote(notesArea.value);

        window.StudyPlanner.notify("Notes saved.");

    });

}

/* ==========================================================
                AI CHAT DEMO
========================================================== */

const chatInput = document.querySelector(".chat-input input");

const chatButton = document.querySelector(".chat-input button");

const chatContainer = document.querySelector(".chat-container");

if (chatButton && chatInput && chatContainer) {

    chatButton.addEventListener("click", sendMessage);

    chatInput.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            sendMessage();

        }

    });

}

function sendMessage() {

    const message = chatInput.value.trim();

    if (message === "") return;

    const addMessage = (role, text) => {
        const row = document.createElement("div");
        row.className = `chat-message ${role}`;
        const avatar = document.createElement("div");
        avatar.className = "chat-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = role === "user" ? "S" : "AI";
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";
        bubble.textContent = text;
        row.append(avatar, bubble);
        chatContainer.append(row);
    };

    addMessage("user", message);

    chatInput.value = "";

    setTimeout(() => {

        addMessage("ai", `Demo response: “${message}” was received. No AI service is connected.`);

        chatContainer.scrollTop = chatContainer.scrollHeight;

    }, 1000);

}

/* ==========================================================
                NOTIFICATION DEMO
========================================================== */

setTimeout(() => {

    console.log("🔔 Welcome to Smart AI Study Planner");

}, 2000);

/* ==========================================================
                AUTO SAVE NOTES
========================================================== */

if (notesArea) {

    notesArea.addEventListener("input", () => {

        localStorage.setItem("studyNotes", notesArea.value);
        saveQuickNote(notesArea.value);

    });

}

/* ==========================================================
                AOS INITIALIZE
========================================================== */

if (typeof AOS !== "undefined") {

    AOS.init({

        duration: 1000,

        once: true,

        offset: 80

    });

}

/* ==========================================================
                RESPONSIVE SIDEBAR
========================================================== */

window.addEventListener("resize", () => {

    const sidebar = document.querySelector(".sidebar");

    if (window.innerWidth > 992 && sidebar) {

        sidebar.classList.remove("show");

    }

});

/* ==========================================================
                ACTIVE SIDEBAR MENU
========================================================== */

const menuLinks = document.querySelectorAll(".sidebar-menu li");

menuLinks.forEach(item => {

    item.addEventListener("click", () => {

        menuLinks.forEach(link => link.classList.remove("active"));

        item.classList.add("active");

    });

});

/* ==========================================================
                SMOOTH SCROLL
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

/* ==========================================================
                FADE IN ANIMATION
========================================================== */

const cards = document.querySelectorAll(".glass-card");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show-card");

        }

    });

}, {

    threshold: 0.2

});

cards.forEach(card => observer.observe(card));

/* ==========================================================
                DASHBOARD READY
========================================================== */

console.log("✅ Smart AI Study Planner Dashboard Loaded Successfully");