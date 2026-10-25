
/*
 * HW2 - Stage 4: FIFO Beat Recorder
 * Records timestamped drum events and replays them
 * in chronological order using the existing Audio Engine.
 */

class BeatRecorder {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.events = [];

        this.isRecording = false;
        this.isPlaying = false;

        this.startTime = 0;
        this.playbackTimers = [];
    }

    start() {
        if (this.isRecording || this.isPlaying) return;

        // Start a fresh recording.
        this.events = [];
        this.startTime = performance.now();
        this.isRecording = true;
    }

    record(soundId) {
        if (!this.isRecording) return;

        const timestamp = performance.now() - this.startTime;

        // Append events in the order they occur (FIFO).
        this.events.push({
            soundId,
            timestamp
        });
    }

    stop() {
        this.isRecording = false;
    }

    play(onFinish) {
        if (
            this.isRecording ||
            this.isPlaying ||
            this.events.length === 0
        ) {
            return;
        }

        this.isPlaying = true;

        // Process events in recording order.
        const queue = [...this.events];

        queue.forEach((event) => {
            const timer = setTimeout(() => {
                this.audioEngine.play(event.soundId);
            }, event.timestamp);

            this.playbackTimers.push(timer);
        });

        const lastEvent = queue[queue.length - 1];

        const finishTimer = setTimeout(() => {
            this.isPlaying = false;
            this.playbackTimers = [];

            if (onFinish) onFinish();
        }, lastEvent.timestamp + 100);

        this.playbackTimers.push(finishTimer);
    }

    clear() {
        if (this.isRecording || this.isPlaying) return;
        this.events = [];
    }
}

// Existing Audio Engine from Stage 2.
const recorder = new BeatRecorder(drumAudio);

// UI elements
const recordBtn = document.querySelector("#record-btn");
const stopBtn = document.querySelector("#stop-btn");
const playBtn = document.querySelector("#play-btn");
const clearBtn = document.querySelector("#clear-btn");

const statusText = document.querySelector("#recording-status");
const eventList = document.querySelector("#event-list");

function updateRecorderUI() {
    recordBtn.disabled =
        recorder.isRecording || recorder.isPlaying;

    stopBtn.disabled = !recorder.isRecording;

    playBtn.disabled =
        recorder.isRecording ||
        recorder.isPlaying ||
        recorder.events.length === 0;

    clearBtn.disabled =
        recorder.isRecording ||
        recorder.isPlaying ||
        recorder.events.length === 0;

    eventList.replaceChildren();

    recorder.events.forEach((event) => {
        const item = document.createElement("li");

        item.textContent =
            `${event.soundId} — ${Math.round(event.timestamp)} ms`;

        eventList.appendChild(item);
    });
}

// Capture drum-pad clicks from both mouse and keyboard.
// Keyboard Stage 3 already uses matchedPad.click().
document.querySelectorAll(".drum-pad").forEach((pad) => {
    pad.addEventListener("click", () => {
        recorder.record(pad.dataset.sound);

        if (recorder.isRecording) {
            updateRecorderUI();
        }
    });
});

recordBtn.addEventListener("click", () => {
    recorder.start();
    statusText.textContent = "Recording...";
    updateRecorderUI();
});

stopBtn.addEventListener("click", () => {
    recorder.stop();
    statusText.textContent =
        `Recording stopped: ${recorder.events.length} events`;
    updateRecorderUI();
});

playBtn.addEventListener("click", () => {
    statusText.textContent = "Playing recording...";

    recorder.play(() => {
        statusText.textContent = "Playback finished";
        updateRecorderUI();
    });

    updateRecorderUI();
});

clearBtn.addEventListener("click", () => {
    recorder.clear();
    statusText.textContent = "Recording cleared";
    updateRecorderUI();
});

updateRecorderUI();
