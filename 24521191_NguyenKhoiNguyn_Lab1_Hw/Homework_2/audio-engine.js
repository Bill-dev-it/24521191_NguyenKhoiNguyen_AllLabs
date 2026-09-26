
/*
 * HW2-02: Polyphonic Audio Engine
 *
 * Audio playback is independent from keyboard bindings
 * and the future FIFO Beat Recorder.
 */

const SOUND_FILES = {
    kick: "./sounds/kick.wav",
    snare: "./sounds/snare.wav",
    hihat: "./sounds/hihat.wav",
    clap: "./sounds/clap.wav",
    tom: "./sounds/tom.wav",
    crash: "./sounds/crash.wav",
    ride: "./sounds/ride.wav"
};

class DrumAudioEngine {
    constructor(soundFiles) {
        this.sounds = new Map();

        for (const [soundId, filePath] of Object.entries(soundFiles)) {
            const audio = new Audio(filePath);
            audio.preload = "auto";

            this.sounds.set(soundId, audio);
        }
    }

    play(soundId) {
        const source = this.sounds.get(soundId);

        if (!source) {
            console.warn(`Unknown sound: ${soundId}`);
            return;
        }

        // Create a separate playback instance for each hit.
        // This allows multiple drum sounds to overlap.
        const instance = source.cloneNode(true);

        instance.play().catch((error) => {
            console.error(`Could not play ${soundId}:`, error);
        });
    }
}

// Initialize the audio engine.
const drumAudio = new DrumAudioEngine(SOUND_FILES);

// Connect the HTML drum pads to the audio engine.
document.querySelectorAll(".drum-pad").forEach((pad) => {
    pad.addEventListener("click", () => {
        const soundId = pad.dataset.sound;
        drumAudio.play(soundId);
    });
});
