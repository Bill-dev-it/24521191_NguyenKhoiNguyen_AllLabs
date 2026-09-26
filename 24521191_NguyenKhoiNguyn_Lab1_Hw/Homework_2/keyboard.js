
/*
 * HW2 - Stage 3: Keyboard Listener
 * Key bindings are read from HTML data-key attributes.
 */

const drumPads = document.querySelectorAll(".drum-pad");

function handleDrumKeydown(event) {
    // Prevent repeated sounds when holding a key.
    if (event.repeat) {
        return;
    }

    // Avoid intercepting typing in text fields.
    if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
         ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
    ) {
        return;
    }

    // Ignore modified keyboard shortcuts.
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    const pressedKey = event.key.toLowerCase();

    // Find the pad using the HTML contract.
    const matchedPad = Array.from(drumPads).find(
        (pad) => pad.dataset.key === pressedKey
    );

    if (!matchedPad) {
        return;
    }

    // Prevent the browser's default action.
    event.preventDefault();

    // Reuse the existing click -> Audio Engine pathway.
    matchedPad.click();
}

document.addEventListener("keydown", handleDrumKeydown);
