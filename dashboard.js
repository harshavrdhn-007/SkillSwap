
/* =====================================
   SKILLSWAP STUDENT DASHBOARD
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    // ---------------------------------
    // 1. CHECK LOGIN SESSION
    // ---------------------------------

    const currentUser = getCurrentUser();

    // If no student is logged in, go to login page
    if (!currentUser) {
        window.location.replace("login.html");
        return;
    }


    // ---------------------------------
    // 2. GET STUDENT INFORMATION
    // ---------------------------------

    const allUsers = getUsers();

    // Find the complete registration record
    const student = allUsers.find(function (user) {
        return user.email.toLowerCase() ===
            currentUser.email.toLowerCase();
    }) || currentUser;


    const studentName = student.name || "Student";

    const studentEmail = student.email || "";

    const college = student.college || "College not provided";

    const department = student.department || "Department not provided";

    const year = student.year || "Year not provided";

    const teachSkills = Array.isArray(student.teachSkills)
        ? student.teachSkills
        : [];

    const learnSkills = Array.isArray(student.learnSkills)
        ? student.learnSkills
        : [];


    // ---------------------------------
    // 3. DISPLAY STUDENT PROFILE
    // ---------------------------------

    function setText(id, value) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    }


    const firstLetter = studentName.charAt(0).toUpperCase();

    setText("welcomeName", studentName);

    setText("studentName", studentName);

    setText("studentEmail", studentEmail);

    setText("studentCollege", college);

    setText("studentDepartment", department);

    setText("studentYear", year);

    setText("sidebarName", studentName);

    setText("topbarName", studentName);


    setText("sidebarAvatar", firstLetter);

    setText("topAvatar", firstLetter);

    setText("profileAvatar", firstLetter);


    // ---------------------------------
    // 4. DISPLAY SKILLS
    // ---------------------------------

    function displaySkills(containerId, skills, className) {

        const container = document.getElementById(containerId);

        container.replaceChildren();

        if (skills.length === 0) {

            const message = document.createElement("p");

            message.className = "empty-skills";

            message.textContent = "No skills added yet.";

            container.appendChild(message);

            return;
        }


        skills.forEach(function (skill) {

            const tag = document.createElement("span");

            tag.className = "skill-tag " + className;

            tag.textContent = skill;

            container.appendChild(tag);

        });

    }


    displaySkills(
        "teachSkillsList",
        teachSkills,
        "teach-tag"
    );


    displaySkills(
        "learnSkillsList",
        learnSkills,
        "learn-tag"
    );


    // ---------------------------------
    // 5. CALCULATE DASHBOARD STATISTICS
    // ---------------------------------

    setText("teachCount", teachSkills.length);

    setText("learnCount", learnSkills.length);

    setText("studentCount", allUsers.length);


    // Calculate profile completion

    const profileFields = [
        student.name,
        student.email,
        student.college,
        student.department,
        student.year,
        teachSkills.length > 0,
        learnSkills.length > 0
    ];

    const completedFields = profileFields.filter(Boolean).length;

    const completion = Math.round(
        (completedFields / profileFields.length) * 100
    );

    setText("profileCompletion", completion + "%");


    // ---------------------------------
    // 6. SAMPLE RECOMMENDATIONS
    // ---------------------------------

    // These are displayed only when no other students
    // have registered in the browser.

    const sampleStudents = [

        {
            name: "Arjun Kumar",
            college: "Demo Engineering College",
            department: "CSE",
            teachSkills: ["Java", "Python"],
            learnSkills: ["JavaScript", "UI/UX Design"]
        },

        {
            name: "Priya Sharma",
            college: "Demo Engineering College",
            department: "IT",
            teachSkills: ["HTML & CSS", "JavaScript"],
            learnSkills: ["Python", "Data Science"]
        },

        {
            name: "Rahul Verma",
            college: "Demo Engineering College",
            department: "ECE",
            teachSkills: ["C Programming", "Python"],
            learnSkills: ["Java", "Data Science"]
        }

    ];


    // ---------------------------------
    // 7. FIND OTHER REGISTERED STUDENTS
    // ---------------------------------

    function getRecommendations() {

        const otherStudents = allUsers.filter(function (user) {

            return user.email.toLowerCase() !==
                currentUser.email.toLowerCase();

        });


        // Use sample students only if there are no
        // other registered accounts.

        const studentsToCompare = otherStudents.length > 0
            ? otherStudents
            : sampleStudents;


        return studentsToCompare.map(function (otherStudent) {

            const otherTeach = Array.isArray(otherStudent.teachSkills)
                ? otherStudent.teachSkills
                : [];

            const otherLearn = Array.isArray(otherStudent.learnSkills)
                ? otherStudent.learnSkills
                : [];


            // Skills the other student can teach
            // that the current student wants to learn.

            const learningMatches = learnSkills.filter(function (skill) {

                return otherTeach.some(function (otherSkill) {

                    return otherSkill.toLowerCase() ===
                        skill.toLowerCase();

                });

            });


            // Skills the current student can teach
            // that the other student wants to learn.

            const teachingMatches = teachSkills.filter(function (skill) {

                return otherLearn.some(function (otherSkill) {

                    return otherSkill.toLowerCase() ===
                        skill.toLowerCase();

                });

            });


            const matchCount =
                learningMatches.length + teachingMatches.length;


            const possibleMatches =
                teachSkills.length + learnSkills.length;


            const matchPercentage = possibleMatches > 0
                ? Math.round((matchCount / possibleMatches) * 100)
                : 0;


            return {

                name: otherStudent.name || "Student",

                college: otherStudent.college || "College not provided",

                department: otherStudent.department || "Student",

                teachSkills: otherTeach,

                matchCount: matchCount,

                matchPercentage: matchPercentage,

                isSample: otherStudents.length === 0

            };

        }).sort(function (a, b) {

            return b.matchCount - a.matchCount;

        });

    }


    // ---------------------------------
    // 8. DISPLAY RECOMMENDED STUDENTS
    // ---------------------------------

    const recommendedStudents =
        document.getElementById("recommendedStudents");


    function displayRecommendations(students) {

        recommendedStudents.replaceChildren();


        if (students.length === 0) {

            const message = document.createElement("p");

            message.className = "no-results";

            message.textContent =
                "No students found. Try another search.";

            recommendedStudents.appendChild(message);

            return;

        }


        students.forEach(function (student) {

            const card = document.createElement("article");

            card.className = "student-card";


            // Student card header

            const top = document.createElement("div");

            top.className = "student-card-top";


            const avatar = document.createElement("div");

            avatar.className = "student-avatar";

            avatar.textContent =
                student.name.charAt(0).toUpperCase();


            const details = document.createElement("div");


            const name = document.createElement("h3");

            name.textContent = student.name;


            const collegeName = document.createElement("p");

            collegeName.className = "college";

            collegeName.textContent = student.college;


            details.appendChild(name);

            details.appendChild(collegeName);

            top.appendChild(avatar);

            top.appendChild(details);


            // Department

            const departmentName = document.createElement("p");

            departmentName.className = "department";

            departmentName.textContent = student.department;


            // Match label

            const match = document.createElement("span");

            match.className = "match-label";

            match.textContent = student.matchCount > 0
                ? student.matchPercentage + "% skill compatibility"
                : "Potential skill exchange";


            // Skills

            const skillContainer = document.createElement("div");

            skillContainer.className = "student-skills";


            student.teachSkills.slice(0, 4).forEach(function (skill) {

                const tag = document.createElement("span");

                tag.className = "student-skill";

                tag.textContent = skill;

                skillContainer.appendChild(tag);

            });


            // Assemble card

            card.appendChild(top);

            card.appendChild(departmentName);

            card.appendChild(match);

            card.appendChild(skillContainer);


            // Clearly identify demonstration profiles

            if (student.isSample) {

                const sampleLabel = document.createElement("span");

                sampleLabel.className = "sample-label";

                sampleLabel.textContent = "Sample profile";

                card.appendChild(sampleLabel);

            }


            recommendedStudents.appendChild(card);

        });

    }


    const recommendations = getRecommendations();

    displayRecommendations(recommendations);


    // ---------------------------------
    // 9. SEARCH STUDENTS
    // ---------------------------------

    const studentSearch =
        document.getElementById("studentSearch");


    studentSearch.addEventListener("input", function () {

        const searchText = studentSearch.value
            .trim()
            .toLowerCase();


        const filteredStudents = recommendations.filter(
            function (student) {

                const searchableText = [

                    student.name,

                    student.college,

                    student.department,

                    ...student.teachSkills

                ].join(" ").toLowerCase();


                return searchableText.includes(searchText);

            }
        );


        displayRecommendations(filteredStudents);

    });


    // ---------------------------------
    // 10. MOBILE SIDEBAR
    // ---------------------------------

    const sidebar = document.getElementById("sidebar");

    const menuToggle = document.getElementById("menuToggle");


    menuToggle.addEventListener("click", function () {

        sidebar.classList.toggle("open");

    });


    // Close mobile sidebar after clicking navigation

    document.querySelectorAll(".nav-link").forEach(function (link) {

        link.addEventListener("click", function () {

            sidebar.classList.remove("open");

            document.querySelectorAll(".nav-link").forEach(
                function (navLink) {

                    navLink.classList.remove("active");

                }
            );

            link.classList.add("active");

        });

    });


    // ---------------------------------
    // 11. LOGOUT
    // ---------------------------------

    const logoutBtn = document.getElementById("logoutBtn");


    logoutBtn.addEventListener("click", function () {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );


        if (confirmLogout) {

            logoutUser();

        }

    });


    // ---------------------------------
    // 12. CURRENT YEAR
    // ---------------------------------

    setText("currentYear", new Date().getFullYear());


    console.log("SkillSwap dashboard loaded successfully!");

});
