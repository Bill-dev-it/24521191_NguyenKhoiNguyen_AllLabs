
# Homework 2 — Drum Kit Engine

## Work Breakdown Structure

### HW2-01: HTML Data-Sound Contract

Objective: Define the drum pads, keyboard bindings,
sound identifiers and accessible HTML structure
before implementing JavaScript.

Deliverables:
- index.html
- Defined data-sound and data-key attributes
- Accessible drum pad buttons

Acceptance Criteria:
- Every drum pad has a unique sound identifier.
- Every drum pad has a keyboard binding.
- HTML contains no inline event handlers.
- No JavaScript implementation is included.
- The HTML contract is committed independently.

### HW2-02: Polyphonic Audio Engine

Objective: Implement audio playback independently
from keyboard controls and the recorder.

Deliverables:
- audio-engine.js
- sounds/kick.wav
- sounds/snare.wav
- sounds/hihat.wav
- sounds/clap.wav
- sounds/tom.wav
- sounds/crash.wav
- sounds/ride.wav

Acceptance Criteria:
- Multiple drum sounds can overlap.
- Repeated triggers can play without interrupting
  previously triggered sounds.
- The engine loads and decodes samples independently
  from keyboard controls and the FIFO recorder.

Dependency: HW2-01

### HW2-03: Keyboard Event Listener

Objective: Connect keyboard interactions to the
existing HTML contract and Audio Engine.

Deliverables:
- keyboard.js

Acceptance Criteria:
- Configured keys trigger the corresponding sounds.
- event.repeat prevents unwanted repeated triggers.
- Key bindings can be changed without modifying
  the Audio Engine.

Dependency: HW2-02

### HW2-04: FIFO Beat Recorder

Objective: Record and replay drum events using
an ordered, timestamped event queue.

Deliverables:
- recorder.js

Acceptance Criteria:
- Drum events are recorded in chronological order.
- Each recorded event includes a timestamp.
- Playback preserves the recorded timing and order.

Dependency: HW2-03

### HW2-05: Integration and Live Defense

Objective: Verify the complete Drum Kit and demonstrate
that keyboard bindings can be modified quickly.

Acceptance Criteria:
- All four implementation stages work together.
- The instructor's requested key-binding change
  can be completed and verified within 3 minutes.
- Each mandatory architectural milestone has
  its own Git commit.
