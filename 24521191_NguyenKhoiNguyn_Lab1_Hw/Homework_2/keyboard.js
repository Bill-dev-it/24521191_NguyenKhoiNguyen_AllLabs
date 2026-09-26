
/*
 * HW2 - Stage 3: Keyboard Listener
 * Key bindings are read from HTML data-key attributes.
 */

// Build the key-to-pad lookup once during initialization.
const drumPads = document.querySelectorAll(".drum-pad");
const keyToPad = new Map();

drumPads.forEach((pad) => {
    const key = pad.dataset.key?.toLowerCase();

    if (!key) {
        console.warn("Drum pad is missing data-key:", pad);
        return;
    }

    if (keyToPad.has(key)) {
        console.warn(`Duplicate drum key binding: ${key}`);
        return;
    }

    keyToPad.set(key, pad);
});

function handleDrumKeydown(event) {
    // Prevent repeated triggers when a key is held.
    if (event.repeat) return;

    // Preserve normal typing in editable elements.
    const target = event.target;

    if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
    ) {
        return;
    }

    // Do not override browser or system shortcuts.
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    // Look up the drum pad directly from the HTML contract.
    const pressedKey = event.key.toLowerCase();
    const matchedPad = keyToPad.get(pressedKey);

    if (!matchedPad || matchedPad.disabled) return;

    event.preventDefault();

    // Reuse Stage 2's click-based audio playback.
    matchedPad.click();
}

document.addEventListener("keydown", handleDrumKeydown);
