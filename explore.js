
/* =========================================
   SKILLSWAP - EXPLORE STUDENTS
   STEP 4.4: STUDENT DATA INTEGRATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // 1. GET CURRENTLY LOGGED-IN STUDENT

    const currentUser = getCurrentUser();

    // If nobody is logged in, redirect to login page

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }


    // 2. GET ALL REGISTERED STUDENTS

    const users = getUsers();


    // 3. FIND THE FULL CURRENT USER RECORD

    const loggedInStudent = users.find(function (user) {
        return user.email === currentUser.email;
    });

    // Store current student's full profile

loggedInStudentData = loggedInStudent;


    // 4. UPDATE THE SIDEBAR AND TOPBAR

    if (loggedInStudent) {

        const name = loggedInStudent.name;

        document.getElementById("sidebarName").textContent = name;

        document.getElementById("topbarName").textContent = name;

        document.getElementById("sidebarAvatar").textContent =
            name.charAt(0).toUpperCase();

        document.getElementById("topbarAvatar").textContent =
            name.charAt(0).toUpperCase();
    }


    // 5. REMOVE THE CURRENT STUDENT FROM THE RESULTS

    const otherStudents = users.filter(function (user) {

        return user.email !== currentUser.email;

    });


    // Initialize search and filters

initializeSearch(otherStudents);

// Display registered students

displayStudents(otherStudents);

// Display incoming and sent requests

renderExchangeRequests();

// Initialize request button events

initializeRequestActions();


    // 7. LOGOUT FUNCTIONALITY

    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", function () {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (confirmLogout) {
            logoutUser();
        }

    });

});


/* =========================================
   DISPLAY STUDENTS
========================================= */

function displayStudents(students) {

    const studentGrid = document.getElementById("studentGrid");

    const studentCount = document.getElementById("studentCount");

    // Clear previous content

    studentGrid.innerHTML = "";


    // Update total student count

    studentCount.textContent =
        students.length + (students.length === 1 ? " Student" : " Students");


    // Check whether students are available

    if (students.length === 0) {

        studentGrid.innerHTML = `
            <div class="empty-state">
                <h3>No students found yet!</h3>
                <p>Invite your friends to join SkillSwap and start exchanging skills.</p>
            </div>
        `;

        return;
    }


    // Generate a card for every student

    students.forEach(function (student) {

        const card = createStudentCard(student);

        studentGrid.appendChild(card);

    });

}



/* =========================================
   CREATE STUDENT CARD WITH MATCH PERCENTAGE
========================================= */

function createStudentCard(student) {

    const card = document.createElement("article");

    card.className = "student-card";


    // Get student's first letter

    const initial = student.name
        ? student.name.charAt(0).toUpperCase()
        : "?";


    // Get skill lists safely

    const teachSkills = Array.isArray(student.teachSkills)
        ? student.teachSkills
        : [];

    const learnSkills = Array.isArray(student.learnSkills)
        ? student.learnSkills
        : [];


    // Calculate skill matching percentage

    const match = calculateSkillMatch(student);


    // Create card HTML

    card.innerHTML = `

        <div class="student-card-header">

            <div class="student-avatar">
                ${escapeHTML(initial)}
            </div>

            <div class="student-info">

                <h3>${escapeHTML(student.name || "Student")}</h3>

                <p>${escapeHTML(student.department || "Department not specified")}</p>

            </div>

            <span class="match-badge">
                ${match.percentage}% Match
            </span>

        </div>


        <div class="student-details">

            <p>🏫 ${escapeHTML(student.college || "College not specified")}</p>

            <p>📚 ${escapeHTML(student.year || "Year not specified")}</p>

        </div>


        <div class="student-skills">

            <div class="skill-group">

                <h4>Can Teach</h4>

                <div class="skill-tags">

                    ${
                        teachSkills.length > 0
                        ? teachSkills.map(skill =>
                            `<span>${escapeHTML(skill)}</span>`
                          ).join("")
                        : "<span>No teaching skills added</span>"
                    }

                </div>

            </div>


            <div class="skill-group">

                <h4>Wants to Learn</h4>

                <div class="skill-tags learn-tags">

                    ${
                        learnSkills.length > 0
                        ? learnSkills.map(skill =>
                            `<span>${escapeHTML(skill)}</span>`
                          ).join("")
                        : "<span>No learning interests added</span>"
                    }

                </div>

            </div>

        </div>


        <div class="match-details">

            <p>
                <strong>Can teach you:</strong>
                ${match.canTeachMe.length
                    ? match.canTeachMe.map(skill =>
                        escapeHTML(skill)).join(", ")
                    : "No matching skills"}
            </p>

            <p>
                <strong>Can learn from you:</strong>
                ${match.canLearnFromMe.length
                    ? match.canLearnFromMe.map(skill =>
                        escapeHTML(skill)).join(", ")
                    : "No matching skills"}
            </p>

        </div>


        <button
    class="exchange-btn send-request-btn"
    type="button"
    data-email="${escapeHTML(student.email || "")}"
>
    Send Exchange Request →
</button>

    `;


    return card;

}



/* =========================================
   HTML ESCAPING
   Helps prevent user-entered text from
   being interpreted as HTML.
========================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];

    });

}


/* =========================================
   STEP 4.5: SEARCH AND FILTER STUDENTS
========================================= */

// Store the registered students available for searching

let allStudents = [];
let loggedInStudentData = null;


/* =========================================
   INITIALIZE SEARCH
========================================= */

function initializeSearch(students) {

    // Store students globally

    allStudents = students;


    // Get HTML elements

    const searchInput = document.getElementById("studentSearch");

    const searchBtn = document.getElementById("searchBtn");

    const departmentFilter =
        document.getElementById("departmentFilter");

    const skillFilter =
        document.getElementById("skillFilter");


    // Search when the user types

    searchInput.addEventListener("input", function () {

        applyFilters();

    });


    // Search when the button is clicked

    searchBtn.addEventListener("click", function () {

        applyFilters();

    });


    // Filter when department changes

    departmentFilter.addEventListener("change", function () {

        applyFilters();

    });


    // Filter when skill changes

    skillFilter.addEventListener("change", function () {

        applyFilters();

    });

}


/* =========================================
   APPLY ALL SEARCH FILTERS
========================================= */

function applyFilters() {

    // Read search text

    const searchText = document
        .getElementById("studentSearch")
        .value
        .trim()
        .toLowerCase();


    // Read selected department

    const selectedDepartment = document
        .getElementById("departmentFilter")
        .value
        .toLowerCase();


    // Read selected skill

    const selectedSkill = document
        .getElementById("skillFilter")
        .value
        .toLowerCase();


    // Filter students

    const filteredStudents = allStudents.filter(function (student) {

        // Get student details as searchable text

        const name = (student.name || "").toLowerCase();

        const college = (student.college || "").toLowerCase();

        const department = (student.department || "").toLowerCase();


        // Get skill lists safely

        const teachSkills = Array.isArray(student.teachSkills)
            ? student.teachSkills
            : [];

        const learnSkills = Array.isArray(student.learnSkills)
            ? student.learnSkills
            : [];


        // Search through all student information

        const allSkills = [...teachSkills, ...learnSkills]
            .join(" ")
            .toLowerCase();


        // Check whether search text matches

        const matchesSearch =
            name.includes(searchText) ||
            college.includes(searchText) ||
            department.includes(searchText) ||
            allSkills.includes(searchText);


        // Check department filter

        const matchesDepartment =
            selectedDepartment === "" ||
            department === selectedDepartment;


        // Check skill filter

        const matchesSkill =
            selectedSkill === "" ||
            teachSkills.some(skill =>
                skill.toLowerCase() === selectedSkill
            ) ||
            learnSkills.some(skill =>
                skill.toLowerCase() === selectedSkill
            );


        // Student must match every active filter

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesSkill
        );

    });


    // Display filtered students

    displayStudents(filteredStudents);

}


/* =========================================
   STEP 4.6: SKILL MATCHING ALGORITHM
========================================= */

function calculateSkillMatch(otherStudent) {

    // Check whether current student data exists

    if (!loggedInStudentData) {
        return {
            percentage: 0,
            canTeachMe: [],
            canLearnFromMe: []
        };
    }


    // Get current student's skills

    const myTeachSkills =
        loggedInStudentData.teachSkills || [];

    const myLearnSkills =
        loggedInStudentData.learnSkills || [];


    // Get other student's skills

    const otherTeachSkills =
        otherStudent.teachSkills || [];

    const otherLearnSkills =
        otherStudent.learnSkills || [];


    // Convert skills to lowercase for comparison

    const myTeach = myTeachSkills.map(skill =>
        String(skill).toLowerCase()
    );

    const myLearn = myLearnSkills.map(skill =>
        String(skill).toLowerCase()
    );

    const otherTeach = otherTeachSkills.map(skill =>
        String(skill).toLowerCase()
    );

    const otherLearn = otherLearnSkills.map(skill =>
        String(skill).toLowerCase()
    );


    // Direction 1:
    // What can the other student teach me?

    const canTeachMe = myLearnSkills.filter(skill =>
        otherTeach.includes(String(skill).toLowerCase())
    );


    // Direction 2:
    // What can I teach the other student?

    const canLearnFromMe = otherLearnSkills.filter(skill =>
        myTeach.includes(String(skill).toLowerCase())
    );


    // Calculate total matched learning needs

    const totalMatched =
        canTeachMe.length + canLearnFromMe.length;


    // Calculate total learning needs

    const totalNeeds =
        myLearnSkills.length + otherLearnSkills.length;


    // Calculate matching percentage

    const percentage = totalNeeds > 0
        ? Math.round((totalMatched / totalNeeds) * 100)
        : 0;


    // Return matching information

    return {
        percentage: percentage,
        canTeachMe: canTeachMe,
        canLearnFromMe: canLearnFromMe
    };

}


/* =========================================
   STEP 4.7: EXCHANGE REQUEST SYSTEM
========================================= */

// Local Storage key for exchange requests

const REQUESTS_KEY = "skillswap_requests";


/* =========================================
   GET ALL EXCHANGE REQUESTS
========================================= */

function getExchangeRequests() {

    try {

        const requests = localStorage.getItem(REQUESTS_KEY);

        return requests ? JSON.parse(requests) : [];

    } catch (error) {

        console.error("Unable to read exchange requests:", error);

        return [];

    }

}


/* =========================================
   SAVE EXCHANGE REQUESTS
========================================= */

function saveExchangeRequests(requests) {

    localStorage.setItem(
        REQUESTS_KEY,
        JSON.stringify(requests)
    );

}


/* =========================================
   SEND EXCHANGE REQUEST
========================================= */

function sendExchangeRequest(recipientEmail) {

    const sender = loggedInStudentData;

    if (!sender || !sender.email) {

        alert("Please log in again.");

        return;

    }


    // Prevent sending a request to yourself

    if (sender.email.toLowerCase() === recipientEmail.toLowerCase()) {

        alert("You cannot send a request to yourself.");

        return;

    }


    // Find recipient in registered users

    const users = getUsers();

    const recipient = users.find(function (user) {

        return user.email &&
            user.email.toLowerCase() === recipientEmail.toLowerCase();

    });


    if (!recipient) {

        alert("Student not found.");

        return;

    }


    // Read existing requests

    const requests = getExchangeRequests();


    // Check whether a pending or accepted request already exists

    const existingRequest = requests.find(function (request) {

        return (
            request.fromEmail.toLowerCase() === sender.email.toLowerCase() &&
            request.toEmail.toLowerCase() === recipient.email.toLowerCase() &&
            ["pending", "accepted"].includes(request.status)
        );

    });


    if (existingRequest) {

        alert("You already have a pending or accepted request with this student.");

        return;

    }


    // Create a new request

    const newRequest = {

        id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 8),

        fromEmail: sender.email,

        fromName: sender.name,

        toEmail: recipient.email,

        toName: recipient.name,

        status: "pending",

        createdAt: new Date().toISOString()

    };


    // Save request

    requests.push(newRequest);

    saveExchangeRequests(requests);


    alert("Exchange request sent successfully!");


    // Refresh student cards and request lists

    applyFilters();

    renderExchangeRequests();

}


/* =========================================
   HANDLE ACCEPT / REJECT REQUEST
========================================= */

function updateRequestStatus(requestId, newStatus) {

    if (!["accepted", "rejected"].includes(newStatus)) {
        return;
    }


    const requests = getExchangeRequests();


    const request = requests.find(function (item) {

        return item.id === requestId;

    });


    if (!request) {

        alert("Request not found.");

        return;

    }


    // Only the recipient can respond to the request

    if (
        !loggedInStudentData ||
        request.toEmail.toLowerCase() !==
        loggedInStudentData.email.toLowerCase()
    ) {

        alert("You are not authorized to respond to this request.");

        return;

    }


    if (request.status !== "pending") {

        alert("This request has already been processed.");

        return;

    }


    // Update status

    request.status = newStatus;

    request.updatedAt = new Date().toISOString();


    // Save changes

    saveExchangeRequests(requests);


    alert(
        newStatus === "accepted"
        ? "Exchange request accepted!"
        : "Exchange request rejected."
    );


    // Refresh both request lists

    renderExchangeRequests();

}


/* =========================================
   RENDER INCOMING AND SENT REQUESTS
========================================= */

function renderExchangeRequests() {

    if (!loggedInStudentData) {
        return;
    }


    const requests = getExchangeRequests();

    const currentEmail =
        loggedInStudentData.email.toLowerCase();


    // Incoming requests

    const incoming = requests.filter(function (request) {

        return (
            request.toEmail.toLowerCase() === currentEmail
        );

    });


    // Sent requests

    const outgoing = requests.filter(function (request) {

        return (
            request.fromEmail.toLowerCase() === currentEmail
        );

    });


    const incomingContainer =
        document.getElementById("incomingRequests");

    const outgoingContainer =
        document.getElementById("outgoingRequests");


    // Display incoming requests

    incomingContainer.innerHTML = incoming.length
        ? incoming.map(createIncomingRequestCard).join("")
        : '<p class="request-empty">You have no incoming requests.</p>';


    // Display outgoing requests

    outgoingContainer.innerHTML = outgoing.length
        ? outgoing.map(createOutgoingRequestCard).join("")
        : '<p class="request-empty">You have not sent any requests.</p>';

}


/* =========================================
   CREATE INCOMING REQUEST CARD
========================================= */

function createIncomingRequestCard(request) {

    const status = request.status;

    const actions = status === "pending"
        ? `
            <div class="request-actions">

                <button
                    class="accept-btn"
                    data-request-id="${escapeHTML(request.id)}"
                    type="button"
                >
                    Accept
                </button>

                <button
                    class="reject-btn"
                    data-request-id="${escapeHTML(request.id)}"
                    type="button"
                >
                    Reject
                </button>

            </div>
        `
        : "";


    return `

        <article class="request-card">

            <div class="request-info">

                <h4>${escapeHTML(request.fromName || "Student")}</h4>

                <p>Wants to exchange skills with you.</p>

                <span class="request-status ${status}">
                    ${escapeHTML(status)}
                </span>

            </div>

            ${actions}

        </article>

    `;

}


/* =========================================
   CREATE OUTGOING REQUEST CARD
========================================= */

function createOutgoingRequestCard(request) {

    return `

        <article class="request-card">

            <div class="request-info">

                <h4>${escapeHTML(request.toName || "Student")}</h4>

                <p>You sent an exchange request.</p>

                <span class="request-status ${escapeHTML(request.status)}">
                    ${escapeHTML(request.status)}
                </span>

            </div>

        </article>

    `;

}


/* =========================================
   INITIALIZE REQUEST BUTTON EVENTS
========================================= */

function initializeRequestActions() {

    const studentGrid = document.getElementById("studentGrid");

    const incomingContainer =
        document.getElementById("incomingRequests");


    // Send exchange request

    studentGrid.addEventListener("click", function (event) {

        const button = event.target.closest(".send-request-btn");

        if (!button) {
            return;
        }

        const recipientEmail = button.dataset.email;

        if (recipientEmail) {
            sendExchangeRequest(recipientEmail);
        }

    });


    // Accept or reject incoming requests

    incomingContainer.addEventListener("click", function (event) {

        const acceptButton = event.target.closest(".accept-btn");

        const rejectButton = event.target.closest(".reject-btn");


        if (acceptButton) {

            updateRequestStatus(
                acceptButton.dataset.requestId,
                "accepted"
            );

        }


        if (rejectButton) {

            updateRequestStatus(
                rejectButton.dataset.requestId,
                "rejected"
            );

        }

    });

}
