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

if (chartCanvas) {

    new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: [

                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"

            ],

            datasets: [

                {

                    label: "Study Hours",

                    data: [

                        2,
                        3,
                        1,
                        4,
                        5,
                        2,
                        6

                    ],

                    borderColor: "#4f46e5",

                    backgroundColor: "rgba(79,70,229,.15)",

                    fill: true,

                    tension: 0.4,

                    borderWidth: 3,

                    pointRadius: 5,

                    pointBackgroundColor: "#4f46e5"

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    labels: {

                        color: "#ffffff"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#cbd5e1"

                    },

                    grid: {

                        color: "rgba(255,255,255,.08)"

                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#cbd5e1"

                    },

                    grid: {

                        color: "rgba(255,255,255,.08)"

                    }

                }

            }

        }

    });

}

/* ==========================================================
                LOAD USER NAME
========================================================== */

const user = JSON.parse(localStorage.getItem("studyPlannerUser"));

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
                DARK MODE
========================================================== */

const themeBtn = document.getElementById("themeToggle");

if (themeBtn) {

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark-theme");

    }

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark-theme");

        if (document.body.classList.contains("dark-theme")) {

            localStorage.setItem("theme", "dark");

        } else {

            localStorage.removeItem("theme");

        }

    });

}

/* ==========================================================
                SIDEBAR TOGGLE
========================================================== */

const menuToggle = document.getElementById("menuToggle");

const sidebar = document.querySelector(".sidebar");

if (menuToggle && sidebar) {

    menuToggle.addEventListener("click", () => {

        sidebar.classList.toggle("show");

    });

}

/* ==========================================================
                CLOSE SIDEBAR ON MOBILE
========================================================== */

document.querySelectorAll(".sidebar-menu a").forEach(link => {

    link.addEventListener("click", () => {

        if (window.innerWidth < 992 && sidebar) {

            sidebar.classList.remove("show");

        }

    });

});

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

const notesArea = document.querySelector("textarea");

const saveNotesBtn = document.querySelector(".glass-card .btn-primary");

if (notesArea) {

    // Load saved notes
    const savedNotes = localStorage.getItem("studyNotes");

    if (savedNotes) {

        notesArea.value = savedNotes;

    }

}

if (saveNotesBtn && notesArea) {

    saveNotesBtn.addEventListener("click", () => {

        localStorage.setItem("studyNotes", notesArea.value);

        alert("✅ Notes saved successfully!");

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

    chatContainer.innerHTML += `
        <div class="chat-message user">
            <div class="chat-avatar">👨</div>
            <div class="chat-bubble">${message}</div>
        </div>
    `;

    chatInput.value = "";

    setTimeout(() => {

        chatContainer.innerHTML += `
            <div class="chat-message ai">
                <div class="chat-avatar">🤖</div>
                <div class="chat-bubble">
                    AI Demo Response:<br>
                    "${message}" received successfully.<br>
                    AI integration will be connected later.
                </div>
            </div>
        `;

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