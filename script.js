
// ======================================
// 1. MOBILE NAVIGATION
// ======================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {

    navLinks.classList.toggle("show");

    const isOpen = navLinks.classList.contains("show");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.textContent = isOpen ? "✕" : "☰";

});


// ======================================
// 2. CLOSE MENU AFTER CLICKING A LINK
// ======================================

const navigationLinks = document.querySelectorAll(".nav-links a");

navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("show");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

    });

});


// ======================================
// 3. ACTIVE NAVIGATION HIGHLIGHT
// ======================================

navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navigationLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

    });

});


// ======================================
// 4. AUTOMATIC COPYRIGHT YEAR
// ======================================

const yearElement = document.getElementById("year");

yearElement.textContent = new Date().getFullYear();


// ======================================
// 5. SKILL CARD INTERACTIONS
// ======================================

const skillCards = document.querySelectorAll(".skill-card");

skillCards.forEach(function (card) {

    const link = card.querySelector("a");

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const skillName = card.querySelector("h3").textContent;

        alert(
            "Welcome to SkillSwap!\n\n" +
            "You selected: " + skillName +
            "\n\nJoin our community to explore students " +
            "who can teach this skill."
        );

    });

});


// ======================================
// 6. JOIN BUTTON INTERACTION
// ======================================

// const joinButtons = document.querySelectorAll(
//     'a[href="#join"], a[href="register.html"]'
// );

// joinButtons.forEach(function (button) {

//     button.addEventListener("click", function (event) {

//         // The registration page will be implemented later.
//         if (button.getAttribute("href") === "register.html") {
//             event.preventDefault();

//             alert(
//                 "Registration module is coming next!\n\n" +
//                 "You will soon be able to create your SkillSwap account."
//             );
//         }

//     });

// });


// ======================================
// 7. WELCOME MESSAGE IN CONSOLE
// ======================================

console.log(
    "%cWelcome to SkillSwap!",
    "color: #6855e8; font-size: 22px; font-weight: bold;"
);

console.log("Learn Together. Teach Each Other. Grow Together.");
