const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");

if (themeToggle && themeIcon && themeLabel) {
    let theme = "dark";

    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            theme = savedTheme;
        }
    } catch {}

    const applyTheme = () => {
        const isLight = theme === "light";
        document.documentElement.dataset.theme = theme;
        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeIcon.textContent = isLight ? "\u263E" : "\u263C";
        themeLabel.textContent = isLight
            ? "Switch to dark theme"
            : "Switch to light theme";
    };

    applyTheme();

    themeToggle.addEventListener("click", () => {
        theme = theme === "dark" ? "light" : "dark";
        applyTheme();

        try {
            localStorage.setItem("theme", theme);
        } catch {}
    });
}