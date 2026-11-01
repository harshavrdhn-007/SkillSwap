
// ============================================
// SKILLSWAP - AUTHENTICATION SYSTEM
// ============================================


// 1. STORAGE FUNCTIONS

const USERS_KEY = "skillswap_users";
const CURRENT_USER_KEY = "skillswap_currentUser";


function getUsers() {

    return JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


// 2. PASSWORD HASHING
// SHA-256 hash for this frontend demonstration.

async function hashPassword(password) {

    if (!window.crypto || !window.crypto.subtle) {
        throw new Error(
            "Secure password hashing is unavailable. Run this project using VS Code Live Server."
        );
    }

    const encodedPassword = new TextEncoder().encode(password);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        encodedPassword
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

}


// 3. DISPLAY ERROR MESSAGES

function showError(elementId, message) {

    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = message;
    }

}


function clearErrors() {

    document.querySelectorAll(".error-message").forEach(function(element) {

        element.textContent = "";

    });

    document.querySelectorAll(".form-message").forEach(function(element) {

        element.textContent = "";
        element.className = "form-message";

    });

}


function showMessage(elementId, message, type) {

    const element = document.getElementById(elementId);

    element.textContent = message;

    element.className = "form-message " + type;

}


// 4. GET SELECTED SKILLS

function getSelectedSkills(groupName) {

    return Array.from(
        document.querySelectorAll(
            'input[name="' + groupName + '"]:checked'
        )
    ).map(function(checkbox) {

        return checkbox.value;

    });

}


// 5. SAVE LOGIN SESSION

function saveSession(user, rememberMe) {

    const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    // Remove any previous session.

    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);

    if (rememberMe) {

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(sessionUser)
        );

    } else {

        sessionStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(sessionUser)
        );

    }

}


// ============================================
// 6. REGISTRATION
// ============================================

const registerForm = document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        clearErrors();

        // GET FORM VALUES

        const name = document.getElementById("fullName")
            .value.trim();

        const email = document.getElementById("email")
            .value.trim().toLowerCase();

        const password = document.getElementById("password")
            .value;

        const confirmPassword = document.getElementById("confirmPassword")
            .value;

        const college = document.getElementById("college")
            .value.trim();

        const department = document.getElementById("department")
            .value;

        const year = document.getElementById("year")
            .value;

        const teachSkills = getSelectedSkills("teach");

        const learnSkills = getSelectedSkills("learn");

        const terms = document.getElementById("terms").checked;


        // VALIDATION

        let isValid = true;

        const namePattern = /^[A-Za-z][A-Za-z .'-]{1,59}$/;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!namePattern.test(name)) {

            showError(
                "nameError",
                "Enter a valid name (2–60 characters)."
            );

            isValid = false;

        }


        if (!emailPattern.test(email)) {

            showError(
                "emailError",
                "Enter a valid email address."
            );

            isValid = false;

        }


        if (password.length < 8) {

            showError(
                "passwordError",
                "Password must contain at least 8 characters."
            );

            isValid = false;

        } else if (
            !/[A-Za-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {

            showError(
                "passwordError",
                "Include at least one letter and one number."
            );

            isValid = false;

        }


        if (password !== confirmPassword) {

            showError(
                "confirmError",
                "Passwords do not match."
            );

            isValid = false;

        }


        if (college.length < 2) {

            showError(
                "collegeError",
                "Enter your college name."
            );

            isValid = false;

        }


        if (!department) {

            showError(
                "departmentError",
                "Please select your department."
            );

            isValid = false;

        }


        if (!year) {

            showError(
                "yearError",
                "Please select your study year."
            );

            isValid = false;

        }


        if (teachSkills.length === 0) {

            showError(
                "teachError",
                "Select at least one skill you can teach."
            );

            isValid = false;

        }


        if (learnSkills.length === 0) {

            showError(
                "learnError",
                "Select at least one skill you want to learn."
            );

            isValid = false;

        }


        if (!terms) {

            showError(
                "termsError",
                "Please accept the terms to continue."
            );

            isValid = false;

        }


        if (!isValid) {

            return;

        }


        // CHECK EXISTING EMAIL

        const users = getUsers();

        const existingUser = users.find(function(user) {

            return user.email === email;

        });


        if (existingUser) {

            showError(
                "emailError",
                "This email is already registered. Please log in."
            );

            return;

        }


        // CREATE NEW STUDENT ACCOUNT

        const submitButton = registerForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";


        try {

            const passwordHash = await hashPassword(password);

            const newUser = {

                id: "STU" + Date.now(),

                name: name,

                email: email,

                passwordHash: passwordHash,

                college: college,

                department: department,

                year: year,

                teachSkills: teachSkills,

                learnSkills: learnSkills,

                createdAt: new Date().toISOString()

            };


            users.push(newUser);

            saveUsers(users);


            // AUTOMATIC LOGIN AFTER REGISTRATION

            saveSession(newUser, true);


            showMessage(
                "registerMessage",
                "Account created successfully! Welcome to SkillSwap.",
                "success"
            );


            submitButton.textContent = "Account Created!";

            // Go to landing page after registration.

            window.location.href = "dashboard.html";


        } catch (error) {

            showMessage(
                "registerMessage",
                error.message || "Something went wrong. Try again.",
                "error"
            );

            submitButton.disabled = false;
            submitButton.textContent = "Create My Account →";

        }

    });

}



// ============================================
// 7. LOGIN
// ============================================

const loginForm = document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        clearErrors();


        const email = document.getElementById("loginEmail")
            .value.trim().toLowerCase();

        const password = document.getElementById("loginPassword")
            .value;

        const rememberMe = document.getElementById("rememberMe")
            .checked;


        let isValid = true;


        // VALIDATE EMAIL

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showError(
                "loginEmailError",
                "Enter a valid email address."
            );

            isValid = false;

        }


        if (!password) {

            showError(
                "loginPasswordError",
                "Please enter your password."
            );

            isValid = false;

        }


        if (!isValid) {

            return;

        }


        // FIND USER

        const users = getUsers();

        const user = users.find(function(item) {

            return item.email === email;

        });


        if (!user) {

            showMessage(
                "loginMessage",
                "No account found with this email. Please register first.",
                "error"
            );

            return;

        }


        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Checking Account...";


        try {

            const enteredPasswordHash = await hashPassword(password);


            // CHECK PASSWORD

            if (enteredPasswordHash !== user.passwordHash) {

                showMessage(
                    "loginMessage",
                    "Incorrect password. Please try again.",
                    "error"
                );

                return;

            }


            // LOGIN SUCCESS

            saveSession(user, rememberMe);


            showMessage(
                "loginMessage",
                "Login successful! Welcome back, " + user.name + ".",
                "success"
            );


            submitButton.textContent = "Login Successful!";

            window.location.href = "dashboard.html";


        } catch (error) {

            showMessage(
                "loginMessage",
                error.message || "Unable to log in. Try again.",
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

            }

        }

    });

}



// ============================================
// 8. GET CURRENT LOGGED-IN USER
// ============================================

function getCurrentUser() {

    const savedUser =
        localStorage.getItem(CURRENT_USER_KEY) ||
        sessionStorage.getItem(CURRENT_USER_KEY);

    return savedUser ? JSON.parse(savedUser) : null;

}


// ============================================
// 9. LOGOUT FUNCTION
// ============================================

function logoutUser() {

    localStorage.removeItem("skillswap_currentUser");

    sessionStorage.removeItem("skillswap_currentUser");

    window.location.href = "index.html";

}


// ============================================
// 10. CHECK LOGIN STATUS
// ============================================

console.log("SkillSwap Authentication Loaded");

console.log("Current User:", getCurrentUser());
