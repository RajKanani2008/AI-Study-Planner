const ctx = document.getElementById("studyChart");

if (ctx) {

    new Chart(ctx, {

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

            datasets: [{

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

                borderColor: "#2563eb",

                backgroundColor: "rgba(37,99,235,.15)",

                tension: .4,

                fill: true

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: true

                }

            }

        }

    });

}

// =========================
// Load User Name
// =========================

const user = JSON.parse(localStorage.getItem("studyPlannerUser"));

if(user){

    document.getElementById("userName").innerText=user.fullName;

}

// =========================
// Profile Dropdown
// =========================

const profileBtn=document.getElementById("profileBtn");

const profileMenu=document.getElementById("profileMenu");

profileBtn.onclick=()=>{

    profileMenu.classList.toggle("show");

};

// =========================
// Dark Mode
// =========================

const darkBtn=document.querySelector(".fa-moon");

darkBtn.parentElement.onclick=()=>{

    document.querySelector(".dashboard").classList.toggle("dark");

};

// =========================
// Sidebar Toggle
// =========================

const menuBtn=document.getElementById("menuToggle");

menuBtn.onclick=()=>{

    document.querySelector(".sidebar").classList.toggle("show");

};

// =========================
// Logout
// =========================

document.getElementById("logoutBtn").onclick=()=>{

    localStorage.removeItem("isLoggedIn");

    window.location.href="login.html";

};