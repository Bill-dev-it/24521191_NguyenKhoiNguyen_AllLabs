
/*
 * HW3 — Slice 1: Drift-Free Countdown Engine
 * The deadline uses a UTC ISO 8601 timestamp.
 */

const countdown = document.querySelector("#countdown");
const deadlineString = countdown.dataset.deadline;

const deadline = Date.parse(deadlineString);

const daysElement = document.querySelector("#days");
const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");
const statusElement = document.querySelector("#countdown-status");

let countdownInterval = null;

function updateCountdown() {
    // Recalculate from the actual current time on every tick.
    const remaining = Math.max(0, deadline - Date.now());

    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    daysElement.textContent = String(days).padStart(2, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent =
        String(minutes).padStart(2, "0");
    secondsElement.textContent =
        String(seconds).padStart(2, "0");

    if (remaining === 0) {
        statusElement.textContent = "The event has started.";

        // Stop the timer when the deadline is reached.
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Accept only explicit UTC timestamps such as 2026-12-01T09:00:00Z.
const utcTimestampPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

if (
    !utcTimestampPattern.test(deadlineString) ||
    !Number.isFinite(deadline) ||
    new Date(deadline).toISOString().replace(".000Z", "Z") !==
        deadlineString
) {
    statusElement.textContent = "Invalid event deadline.";
    console.error("Invalid UTC deadline:", deadlineString);
} else {
    statusElement.textContent = "Countdown is running.";

    // Render immediately without waiting for the first interval.
    updateCountdown();

    if (deadline > Date.now()) {
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Refresh immediately when returning to the browser tab.
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            updateCountdown();
        }
    });

    // Clean up the timer when leaving the page.
    window.addEventListener("pagehide", () => {
        clearInterval(countdownInterval);
        countdownInterval = null;
    });
}
