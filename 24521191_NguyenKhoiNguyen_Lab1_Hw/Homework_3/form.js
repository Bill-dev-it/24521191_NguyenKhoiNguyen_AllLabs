
/*
 * HW3 — Slice 3: Safe Registration Form
 * State machine, duplicate-submit prevention,
 * input validation and safe DOM rendering.
 */

const form = document.querySelector("#registration-form");
const submitBtn = document.querySelector("#submit-btn");
const formStatus = document.querySelector("#form-status");
const nameInput = document.querySelector("#full-name");
const emailInput = document.querySelector("#email");
const nameError = document.querySelector("#name-error");
const emailError = document.querySelector("#email-error");

const FormState = Object.freeze({
    IDLE: "idle",
    SUBMITTING: "submitting",
    SUCCESS: "success",
    ERROR: "error"
});

let currentState = FormState.IDLE;
let submissionInProgress = false;

function setFormState(nextState, message = "") {
    currentState = nextState;

    submitBtn.disabled = nextState === FormState.SUBMITTING;
    submitBtn.textContent =
        nextState === FormState.SUBMITTING
            ? "Submitting..."
            : "Register";

    formStatus.dataset.state = nextState;

    // Safe rendering: never interpret user input as HTML.
    formStatus.textContent = message;
}

function normalizeInput(value) {
    return value.trim().normalize("NFC");
}

function validateForm() {
    nameError.textContent = "";
    emailError.textContent = "";

    nameInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");

    const fullName = normalizeInput(nameInput.value);
    const email = normalizeInput(emailInput.value).toLowerCase();

    let valid = true;

    if (
        fullName.length < 2 ||
        fullName.length > 100 ||
        /[<>]/.test(fullName)
    ) {
        nameError.textContent =
            "Enter a valid name (2–100 characters).";
        nameInput.setAttribute("aria-invalid", "true");
        valid = false;
    }

    // Use the browser's email syntax validation.
    if (
        !email ||
        email.length > 254 ||
        !emailInput.validity.valid ||
        /[<>]/.test(email)
    ) {
        emailError.textContent =
            "Please enter a valid email address.";
        emailInput.setAttribute("aria-invalid", "true");
        valid = false;
    }

    if (!valid) return null;

    return { fullName, email };
}

function simulateSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (data.email === "error@example.com") {
                reject(new Error("Simulated server error"));
            } else {
                resolve();
            }
        }, 1200);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Prevent duplicate submissions at the handler level.
    if (submissionInProgress) return;

    const data = validateForm();

    if (!data) {
        setFormState(
            FormState.ERROR,
            "Please correct the highlighted fields."
        );
        return;
    }

    submissionInProgress = true;

    setFormState(
        FormState.SUBMITTING,
        "Submitting your registration..."
    );

    try {
        await simulateSubmission(data);

        setFormState(
            FormState.SUCCESS,
            "Registration completed successfully!"
        );

        form.reset();
    } catch (error) {
        console.error("Submission failed:", error);

        setFormState(
            FormState.ERROR,
            "Registration failed. Please try again."
        );
    } finally {
        submissionInProgress = false;
    }
});

setFormState(FormState.IDLE);
