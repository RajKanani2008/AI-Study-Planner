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
const dashboardDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
let dashboardChart;
const renderDashboardData = () => {
    const dashboardTasks = studyStorage.read("studyPlannerTasks", []);
    const dashboardSubjects = studyStorage.read("studyPlannerSubjects", []);
    const dashboardSessions = studyStorage.read("studySessions", []);
    const todayKey = dashboardDateKey(new Date());
    const todayTasks = dashboardTasks.filter(task => task.dueDate === todayKey);
    const todayCompleted = todayTasks.filter(task => task.completed).length;
    const todayFocusMinutes = dashboardSessions.filter(session => (session.date || session.completedAt?.slice(0, 10)) === todayKey).reduce((total, session) => total + (Number(session.minutes) || 0), 0);
    const focusMinutes = dashboardSessions.reduce((total, session) => total + (Number(session.minutes) || 0), 0);
    const sessionDays = new Set(dashboardSessions.map(session => (session.completedAt || session.date || "").slice(0, 10)).filter(Boolean));
    let focusStreak = 0;
    const streakDate = new Date();
    streakDate.setHours(0, 0, 0, 0);
    if (!sessionDays.has(dashboardDateKey(streakDate))) streakDate.setDate(streakDate.getDate() - 1);
    while (sessionDays.has(dashboardDateKey(streakDate))) {
        focusStreak += 1;
        streakDate.setDate(streakDate.getDate() - 1);
    }

    [
        dashboardSubjects.length,
        dashboardTasks.filter(task => task.completed).length,
        focusStreak,
        Math.round(focusMinutes / 60)
    ].forEach((value, index) => {
        if (counters[index]) {
            counters[index].dataset.count = String(value);
            counters[index].textContent = String(value);
        }
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

    const subjectProgress = document.getElementById("dashboardSubjectProgress");
    if (subjectProgress) {
        const names = [...new Set([
            ...dashboardSubjects.map(subject => subject.name).filter(Boolean),
            ...dashboardTasks.map(task => task.subject).filter(Boolean)
        ])];
        subjectProgress.innerHTML = names.length
            ? names.map(name => {
                const tasks = dashboardTasks.filter(task => task.subject === name);
                const completed = tasks.filter(task => task.completed).length;
                const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
                return `<div class="subject-item mt-4"><div class="d-flex justify-content-between"><span>${window.StudyPlanner.escapeHtml(name)}</span><strong>${percent}%</strong></div><div class="progress mt-2" role="progressbar" aria-label="${window.StudyPlanner.escapeHtml(name)} task completion" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:${percent}%"></div></div><small class="calendar-subtitle">${completed} of ${tasks.length} tasks complete</small></div>`;
            }).join("")
            : '<div class="empty-state"><i class="fa-solid fa-book-open" aria-hidden="true"></i><strong>No subject activity yet</strong><span>Add subjects and tasks to see progress.</span><a class="btn btn-sm btn-outline-primary mt-2" href="subjects.html">Add a subject</a></div>';
    }

    const dashboardNotifications = document.getElementById("dashboardNotifications");
    if (dashboardNotifications) {
        const updates = dashboardTasks.map(task => {
            const dueTodayOrEarlier = task.dueDate && task.dueDate <= todayKey;
            if (task.completed) return { task, message: "Task completed" };
            if (dueTodayOrEarlier) return { task, message: task.dueDate < todayKey ? "Past due" : "Due today" };
            return null;
        }).filter(Boolean).slice(0, 5);
        dashboardNotifications.innerHTML = updates.length
            ? updates.map(({ task, message }) => `<li>${window.StudyPlanner.escapeHtml(message)}: ${window.StudyPlanner.escapeHtml(task.title)}</li>`).join("")
            : '<li>No due or completed task updates yet.</li>';
    }

    const productivityScore = document.getElementById("productivityScore");
    const productivityCaption = document.getElementById("productivityCaption");
    const completedTaskCount = dashboardTasks.filter(task => task.completed).length;
    const taskCompletionRate = dashboardTasks.length ? Math.round(completedTaskCount / dashboardTasks.length * 100) : 0;
    if (productivityScore) productivityScore.textContent = `${taskCompletionRate}%`;
    if (productivityCaption) {
        productivityCaption.textContent = dashboardTasks.length
            ? `${completedTaskCount} of ${dashboardTasks.length} saved tasks complete on this device.`
            : "Add tasks to calculate your local completion rate.";
    }

    const recentActivity = document.getElementById("dashboardRecentActivity");
    if (recentActivity) {
        const activityItems = [
            ...dashboardSessions.map(session => ({
                date: session.completedAt || session.date,
                title: "Focus session completed",
                detail: `${Number(session.minutes) || 0} focus minutes`
            })),
            ...studyStorage.read("studyPlannerNotes", []).map(note => ({
                date: note.updatedAt,
                title: "Note updated",
                detail: note.title || "Untitled note"
            }))
        ].filter(item => item.date && !Number.isNaN(new Date(item.date).getTime()))
            .sort((first, second) => new Date(second.date) - new Date(first.date))
            .slice(0, 6);
        recentActivity.innerHTML = activityItems.length
            ? activityItems.map(item => `<article class="timeline-item"><div class="timeline-dot bg-primary"></div><div class="timeline-content"><h5>${window.StudyPlanner.escapeHtml(item.title)}</h5><p>${window.StudyPlanner.escapeHtml(item.detail)}</p><small>${window.StudyPlanner.escapeHtml(new Date(item.date).toLocaleString())}</small></div></article>`).join("")
            : '<div class="empty-state"><i class="fa-regular fa-clock" aria-hidden="true"></i><strong>No recent activity yet</strong><span>Completed focus sessions and updated notes will appear here.</span></div>';
    }

    const weeklyHeatmap = document.getElementById("weeklyHeatmap");
    if (weeklyHeatmap) {
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (6 - index));
            const key = dashboardDateKey(date);
            const minutes = dashboardSessions
                .filter(session => (session.date || session.completedAt?.slice(0, 10)) === key)
                .reduce((total, session) => total + (Number(session.minutes) || 0), 0);
            return { date, minutes };
        });
        const maximum = Math.max(...days.map(day => day.minutes), 1);
        weeklyHeatmap.innerHTML = days.map(({ date, minutes }) => {
            const intensity = minutes === 0 ? "low" : minutes < maximum / 2 ? "medium" : "high";
            const label = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
            return `<div class="heat ${intensity}" role="img" aria-label="${window.StudyPlanner.escapeHtml(label)}: ${minutes} focus minutes" title="${window.StudyPlanner.escapeHtml(label)} · ${minutes} minutes"></div>`;
        }).join("");
    }

    if (dashboardChart) {
        dashboardChart.data.datasets[0].data = dashboardWeekData(dashboardSessions).map(day => day.hours);
        dashboardChart.update();
    }
    applyDashboardSearch();
};

function dashboardWeekData(sessions) {
    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - (6 - index));
        const key = dashboardDateKey(day);
        const minutes = sessions.filter(session => (session.date || session.completedAt?.slice(0, 10)) === key)
            .reduce((total, session) => total + (Number(session.minutes) || 0), 0);
        return { label: day.toLocaleDateString(undefined, { weekday: "short" }), hours: Math.round(minutes / 60 * 10) / 10 };
    });
}

const dashboardSearch = document.querySelector(".dashboard-navbar .search-box input");
let searchStatus;
if (dashboardSearch) {
    searchStatus = document.createElement("span");
    searchStatus.className = "visually-hidden";
    searchStatus.setAttribute("aria-live", "polite");
    dashboardSearch.parentElement.append(searchStatus);
    dashboardSearch.addEventListener("input", applyDashboardSearch);
}

function applyDashboardSearch() {
    if (!dashboardSearch || !searchStatus) return;
    const query = dashboardSearch.value.trim().toLocaleLowerCase();
    const searchableItems = [...document.querySelectorAll(".schedule-item, .recommend-item")];
    let matches = 0;
    searchableItems.forEach(item => {
        const visible = !query || item.textContent.toLocaleLowerCase().includes(query);
        item.hidden = !visible;
        if (visible) matches += 1;
    });
    searchStatus.textContent = query ? `${matches} dashboard results` : "Search cleared";
}

renderDashboardData();

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
const chartDays = dashboardWeekData(studyStorage.read("studySessions", []));

if (chartCanvas && typeof Chart !== "undefined") {

    dashboardChart = new Chart(chartCanvas, {

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

["studyPlannerTasks", "studyPlannerSubjects", "studyPlannerNotes", "studySessions"].forEach(key => {
    studyStorage.subscribe(key, renderDashboardData);
});

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

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        sessionStorage.removeItem("userEmail");

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

        if (isRunning || totalSeconds <= 0) return;

        isRunning = true;

        timerInterval = setInterval(() => {

            if (totalSeconds > 0) {

                totalSeconds--;

                updateTimer();

            } else {

                clearInterval(timerInterval);

                isRunning = false;

                const completedAt = new Date();
                try {
                    const sessions = studyStorage.read("studySessions", []);
                    sessions.push({
                        id: String(Date.now()),
                        minutes: 25,
                        date: dashboardDateKey(completedAt),
                        completedAt: completedAt.toISOString()
                    });
                    studyStorage.write("studySessions", sessions);
                    window.StudyPlanner.notify("Focus session completed and saved.");
                } catch (error) {
                    console.error("Unable to save the completed focus session.", error);
                    window.StudyPlanner.notify("Focus session completed, but it could not be saved.", "error");
                }

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
    const savedNotes = localStorage.getItem("studyNotes")
        ?? studyStorage.read("studyPlannerNotes", []).find(note => note.id === "dashboard-quick-note")?.body
        ?? "";

    if (savedNotes) {

        notesArea.value = savedNotes;
        saveQuickNote(savedNotes);

    }

}

if (saveNotesBtn && notesArea) {

    saveNotesBtn.addEventListener("click", () => {

        saveQuickNote(notesArea.value);
        if (notesArea.value.trim()) localStorage.setItem("studyNotes", notesArea.value);
        else localStorage.removeItem("studyNotes");

        window.StudyPlanner.notify("Notes saved.");

    });

}

studyStorage.subscribe("studyPlannerNotes", value => {
    if (notesArea && document.activeElement !== notesArea) {
        notesArea.value = value.find(note => note.id === "dashboard-quick-note")?.body || "";
    }
});

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