
/*
 * HW3 — Slice 2B: Registration Form State Machine
 * Simulated submission; no backend connection yet.
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

// Centralize all UI updates in one state transition function.
function setFormState(nextState, message = "") {
    currentState = nextState;

    submitBtn.disabled = nextState === FormState.SUBMITTING;
    submitBtn.textContent =
        nextState === FormState.SUBMITTING
            ? "Submitting..."
            : "Register";

    formStatus.dataset.state = nextState;
    formStatus.textContent = message;
}

function validateForm() {
    let valid = true;

    nameError.textContent = "";
    emailError.textContent = "";
    nameInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");

    if (!nameInput.value.trim()) {
        nameError.textContent = "Please enter your full name.";
        nameInput.setAttribute("aria-invalid", "true");
        valid = false;
    }

    if (!emailInput.validity.valid ||
        !emailInput.value.trim()) {
        emailError.textContent =
            "Please enter a valid email address.";
        emailInput.setAttribute("aria-invalid", "true");
        valid = false;
    }

    return valid;
}

// Simulate an asynchronous server request.
function simulateSubmission() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Use this email to test the Error state.
            if (emailInput.value.trim().toLowerCase() ===
                "error@example.com") {
                reject(new Error("Simulated server error"));
            } else {
                resolve();
            }
        }, 1200);
    });
}

form.addEventListener("submit", async (event) => {
    // Prevent the default page reload.
    event.preventDefault();

    if (!validateForm()) {
        setFormState(
            FormState.ERROR,
            "Please correct the highlighted fields."
        );
        return;
    }

    setFormState(
        FormState.SUBMITTING,
        "Submitting your registration..."
    );

    try {
        await simulateSubmission();

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
    }
});

setFormState(FormState.IDLE);
