# HW2 – Engineering Task Decomposition & Implementation Plan

**Project:** SonicFlow – Concurrent FIFO Audio Visualizer Workstation  
**Assignment:** Homework 02 – Concurrent FIFO Audio Visualizer Queue Engine  
**Course:** Web Application Development – Lab 02  
**Student:** Nguyen Khoi Nguyen  
**Workspace:** `Lab02_Homework_2`  
**Technology:** React, TypeScript, Vite, Web Audio API, Canvas API  
**Development Strategy:** Incremental Engineering, Modular Architecture, Atomic Git Commits

---

## 1. Executive Summary

### 1.1 Project Overview

SonicFlow is a browser-based audio processing and visualization application designed to demonstrate asynchronous concurrency, FIFO task scheduling, Web Audio processing, and explicit resource lifecycle management.

The system allows users to enqueue multiple audio tracks, process downloads and audio decoding sequentially, control playback, and visualize real-time audio frequency data.

The architecture separates asynchronous task management from audio playback and high-frequency graphics rendering.

### 1.2 Engineering Objectives

The project has five major engineering objectives:

1. Implement a predictable First-In-First-Out audio task processing system.
2. Support cancellation of queued and active audio tasks using AbortController.
3. Integrate Web Audio API for playback and real-time frequency analysis.
4. Render an audio visualizer targeting 60 FPS without excessive React state updates.
5. Release audio resources, animation frames, timers, listeners, and asynchronous operations correctly.

### 1.3 Required Technical Capabilities

| ID | Requirement | Implementation Target |
|---|---|---|
| FR-01 | FIFO Task Queue | Deterministic task processing order |
| FR-02 | Concurrent Enqueue Requests | Accept multiple submissions without parallel queue processing |
| FR-03 | Audio Download | Fetch audio tracks asynchronously |
| FR-04 | Audio Decoding | Decode ArrayBuffer into AudioBuffer |
| FR-05 | Task Cancellation | AbortController and AbortSignal |
| FR-06 | Audio Playback | Web Audio API |
| FR-07 | Frequency Analysis | AnalyserNode |
| FR-08 | FFT Configuration | fftSize 256 or 512 |
| FR-09 | Visualizer | Canvas and requestAnimationFrame |
| FR-10 | Resource Cleanup | Explicit teardown and cancellation |
| FR-11 | Task Monitoring | Pending, active and completed states |
| FR-12 | Performance Monitoring | FPS and audio resource telemetry |

### 1.4 Scope Boundaries

**Included:**
- Client-side audio task management
- Sequential FIFO processing
- Audio downloads and decoding
- Track playback controls
- Visual audio frequency analysis
- Queue cancellation
- Responsive user interface
- Lifecycle cleanup and engineering tests

**Excluded:**
- Backend authentication
- Cloud audio storage
- Database persistence
- Multi-user synchronization
- Digital rights management
- Streaming server implementation

---

## 2. System Architecture

### 2.1 Architectural Layers

The system is divided into five main layers:

**Layer 1 – Presentation**

Responsible for application controls, task lists, audio status and performance metrics.

Main modules:
- `App.tsx`
- `QueuePanel.tsx`
- `PlayerControls.tsx`
- `PerformancePanel.tsx`

**Layer 2 – Queue Controller**

Responsible for accepting tasks, preserving processing order and handling cancellation.

Main module:
- `audio-queue-controller.ts`

**Layer 3 – Audio Processing**

Responsible for creating and managing the Web Audio graph, playback, pause/resume and audio node cleanup.

Main module:
- `audio-engine.ts`

**Layer 4 – Frequency Analysis**

Responsible for reading FFT data from the AnalyserNode.

Supported FFT configurations:
- `fftSize = 256` → 128 frequency bins
- `fftSize = 512` → 256 frequency bins

**Layer 5 – Visualization**

Responsible for rendering audio-reactive graphics independently from React's component rendering cycle.

Main module:
- `AudioVisualizer.tsx`

### 2.2 Primary Data Flow

```text
User selects audio track
          |
          v
Application UI
          |
          v
AudioTaskQueue.enqueue()
          |
          v
FIFO Pending Queue
          |
          v
Download using fetch + AbortSignal
          |
          v
ArrayBuffer
          |
          v
AudioContext.decodeAudioData()
          |
          v
Decoded AudioBuffer
          |
          v
AudioEngine
          |
          v
AudioBufferSourceNode
          |
          v
AnalyserNode
          |
          +------> GainNode ------> Destination
          |
          v
Frequency Data
          |
          v
Canvas Visualizer
```

The diagram describes the intended logical pipeline. Queue implementation details and graph connections must be verified against the final source code.

---

## 3. Stage 1 – Project Initialization & Engineering Planning

### 3.1 Objective

Establish the TypeScript development environment and define a complete implementation plan.

### 3.2 Tasks

- [ ] Create the Vite React TypeScript project.
- [ ] Configure ESLint.
- [ ] Install project dependencies.
- [ ] Verify the development server.
- [ ] Create the engineering decomposition document.
- [ ] Establish the source directory structure.
- [ ] Verify Git repository boundaries.
- [ ] Commit project initialization separately.

### 3.3 Deliverables

- `package.json`
- `package-lock.json`
- Vite and TypeScript configuration files
- `TASK_DECOMPOSITION.md`
- Base React application

### 3.4 Verification

Commands:

```bash
npm install
npm run build
npm run lint
npm run dev
```

Expected results:
- Dependencies installed.
- Development server starts.
- Build completes without TypeScript errors.
- Linter reports no blocking errors.

### 3.5 Commit

`docs: initialize HW2 project and detailed task decomposition`

---

## 4. Stage 2 – Typed FIFO Queue Controller

### 4.1 Objective

Build a standalone task controller responsible for accepting and scheduling audio processing requests in strict FIFO order.

### 4.2 Required Data Structures

Each task contains:

| Property | Purpose |
|---|---|
| `id` | Unique identifier |
| `trackUrl` | Source of audio |
| `title` | Display title |
| `controller` | AbortController instance |
| `resolve` | Promise completion callback |
| `reject` | Promise error callback |
| `status` | Current processing state |
| `enqueuedAt` | Enqueue timestamp |

### 4.3 Task Lifecycle

```text
QUEUED
   |
   v
DOWNLOADING
   |
   v
DECODING
   |
   v
COMPLETED
```

Alternative transitions:

```text
QUEUED ------> CANCELLED
DOWNLOADING -> CANCELLED
DOWNLOADING -> ERROR
DECODING ----> ERROR
```

Cancellation during decoding requires special handling because `decodeAudioData()` itself does not accept an AbortSignal. A cancelled decode must not be delivered as a successful result.

### 4.4 Queue Invariants

**Invariant Q1 – FIFO Ordering**

Tasks start processing in the same order in which they were successfully enqueued.

**Invariant Q2 – Single Active Worker**

No more than one queue task may execute the download/decode pipeline at a time.

**Invariant Q3 – Exactly-Once Settlement**

Each task promise must resolve or reject exactly once.

**Invariant Q4 – Safe Cancellation**

Cancelling one task must not corrupt the remaining queue.

**Invariant Q5 – Queue Continuation**

Completion, rejection, or cancellation of the active task must allow the next eligible task to proceed.

### 4.5 Deliverables

- `audio-types.ts`
- `audio-queue-controller.ts`
- Initial unit tests for scheduling behavior

### 4.6 Acceptance Criteria

- [ ] Multiple tasks can be enqueued synchronously.
- [ ] FIFO start order is preserved.
- [ ] Only one worker processes tasks.
- [ ] Task identifiers are unique.
- [ ] Promises settle correctly.
- [ ] Internal state can be inspected safely.

### 4.7 Commit

`feat: implement typed FIFO audio task controller`

---

## 5. Stage 3 – Async Download, Decoding & Cancellation

### 5.1 Objective

Integrate real audio download and decoding into the FIFO task pipeline.

### 5.2 Functional Requirements

The controller must support:

- Fetching audio data with AbortSignal.
- Detecting HTTP errors.
- Receiving ArrayBuffer content.
- Decoding audio through AudioContext.
- Cancelling queued tasks.
- Cancelling an active download.
- Rejecting cancelled task promises.
- Continuing processing after handled failures.

### 5.3 Cancellation Model

Each task has its own AbortController.

For an active download:

```text
User Cancel
    |
    v
AbortController.abort()
    |
    v
Fetch rejects with AbortError
    |
    v
Task -> CANCELLED
    |
    v
Next eligible task
```

For a queued task:

```text
User Cancel
    |
    v
Remove task from pending queue
    |
    v
Reject task promise
    |
    v
Keep active task unchanged
```

### 5.4 Decoding Constraints

Web Audio's `decodeAudioData()` generally does not provide direct AbortSignal support.

Therefore:

- Cancellation must be recorded in task state.
- Decoded results from cancelled tasks must be discarded.
- Cancelled tasks must not activate playback.
- Queue progression must remain deterministic.

### 5.5 Failure Scenarios

| Scenario | Expected Behavior |
|---|---|
| HTTP 404 | Task rejected, queue continues |
| Network failure | Error recorded, next task starts |
| Invalid audio file | Decode error handled |
| Cancel pending task | Pending promise rejected |
| Cancel active fetch | Fetch aborted |
| Cancel during decode | Result discarded |
| Multiple rapid enqueue calls | FIFO processing preserved |

### 5.6 Deliverables

- Completed queue processing logic
- Cancellation methods
- Error propagation
- Queue progress/status notifications
- Async test scenarios

### 5.7 Commit

`feat: add abortable audio fetching and decoding`

---

## 6. Stage 4 – Web Audio Engine & Memory Lifecycle

### 6.1 Objective

Build the audio playback subsystem using the Web Audio API with explicit ownership and cleanup of audio nodes.

### 6.2 Audio Graph

```text
AudioBufferSourceNode
          |
          v
AnalyserNode
          |
          v
GainNode
          |
          v
AudioDestinationNode
```

### 6.3 Core Audio Operations

- Initialize or resume AudioContext after user interaction.
- Play a decoded AudioBuffer.
- Pause and resume playback.
- Stop playback.
- Control volume.
- Mute and unmute.
- Change FFT size.
- Read frequency data.
- Release active audio sources.

### 6.4 Memory Ownership

The AudioEngine owns:

- AudioContext
- AnalyserNode
- GainNode
- Active AudioBufferSourceNode
- Playback timing state

The queue owns:

- Pending tasks
- AbortControllers
- Active download/decode task state

The visualizer owns:

- Canvas reference
- Animation frame request
- Frequency arrays
- Drawing resources

### 6.5 Cleanup Requirements

When replacing or stopping a source:

1. Clear event handlers where necessary.
2. Stop the active source if applicable.
3. Disconnect the source from the audio graph.
4. Release stored references.
5. Prevent duplicate cleanup.

When the audio engine is permanently disposed:

1. Stop active playback.
2. Disconnect audio nodes.
3. Close AudioContext.
4. Release retained resources.

### 6.6 Important Web Audio Constraint

`AudioBufferSourceNode` is a one-shot playback source.

Once started and stopped, the same source cannot be restarted.

Pause/resume behavior must therefore create an appropriate new source and restore playback from the recorded offset.

### 6.7 Acceptance Criteria

- [ ] Audio plays correctly.
- [ ] Playback controls work.
- [ ] FFT size can change between 256 and 512.
- [ ] The correct frequency bin count is exposed.
- [ ] Audio source replacement does not retain stale connections.
- [ ] Engine disposal releases resources.

### 6.8 Commit

`feat: implement audio playback engine with safe cleanup`

---

## 7. Stage 5 – 60 FPS Audio Visualizer

### 7.1 Objective

Create an audio-reactive visualization system that runs independently from high-frequency React re-rendering.

### 7.2 Rendering Strategy

The visualizer uses:

```typescript
requestAnimationFrame(renderFrame);
```

Within each frame:

1. Read AnalyserNode frequency data.
2. Clear the drawing surface.
3. Calculate visual geometry.
4. Draw the selected visualizer mode.
5. Request the next animation frame.

### 7.3 Visualization Modes

**Mode A – Spectrum**

Frequency bars display the amplitude of individual frequency bands.

**Mode B – Oscilloscope**

A time-domain waveform shows the instantaneous audio signal.

**Mode C – Circular**

Frequency amplitudes are drawn around a circular center.

These modes form the project's own visual design rather than reproducing the full mode set of the reference implementation.

### 7.4 React Performance Constraint

Avoid calling React state setters on every animation frame.

Instead:

- Store rapidly changing values in refs or local rendering buffers.
- Render directly to Canvas.
- Keep the animation loop separate from the React UI update cycle.
- Update telemetry at a lower frequency.

### 7.5 Performance Target

Target refresh rate: 60 FPS on an appropriate display under normal testing conditions.

Typical frame budget:

`1000 / 60 ≈ 16.67 ms`

The browser controls actual animation scheduling. A 60 FPS target does not guarantee a constant measured 60 FPS.

### 7.6 Cleanup

On component unmount:

- Cancel pending animation frames.
- Disconnect observation/listener resources owned by the visualizer.
- Release large temporary buffers where appropriate.
- Prevent rendering after unmount.

### 7.7 Deliverables

- `AudioVisualizer.tsx`
- Spectrum rendering
- Oscilloscope rendering
- Circular rendering
- FFT switching support
- FPS telemetry

### 7.8 Commit

`feat: build RAF-driven audio frequency visualizer`

---

## 8. Stage 6 – SonicFlow Application Integration

### 8.1 Objective

Integrate the queue, Web Audio engine and visualizer into a usable application.

### 8.2 User Interface Modules

**Queue Panel**
- List pending tasks
- Display active task
- Display task outcomes
- Cancel queued or active tasks

**Player Controls**
- Play
- Pause
- Resume
- Stop
- Volume
- Current track information

**Visualizer Panel**
- Canvas display
- Visualization mode selection
- FFT resolution selection
- Current playback status

**Performance Panel**
- Target/observed FPS
- FFT resolution
- Frequency bin count
- Active source node information
- Cleanup counters

### 8.3 User Workflow

```text
Open SonicFlow
      |
      v
Select or add track
      |
      v
Enqueue track
      |
      v
Queue processes download/decode
      |
      v
Track becomes available
      |
      v
Start playback
      |
      v
Visualizer reads audio data
      |
      v
User adjusts controls or cancels tasks
```

### 8.4 UI Requirements

- Responsive layout
- Accessible button labels
- Visible task states
- Error messages for failed tasks
- No unexpected automatic playback
- User-initiated AudioContext activation
- No unsafe dynamic HTML rendering

### 8.5 Commit

`feat: integrate audio queue workstation interface`

---

## 9. Stage 7 – Concurrency, Performance & Memory Testing

### 9.1 Objective

Verify correctness under simultaneous requests, repeated playback changes and component lifecycle transitions.

### 9.2 FIFO Test

Enqueue:

```text
Track A
Track B
Track C
```

Expected processing start order:

```text
A -> B -> C
```

The application must not start B while A is still inside its active processing pipeline.

### 9.3 Cancellation Test

Enqueue A, B and C.

Cancel B while A is active.

Expected execution:

```text
A -> C
```

B must settle as cancelled.

### 9.4 Network Failure Test

Simulate a failed download for A.

Expected behavior:
- A reports error.
- Active worker resets correctly.
- B begins processing.
- No permanent queue deadlock.

### 9.5 Memory Lifecycle Test

Repeat the following sequence:

```text
Load
Play
Stop
Play
Pause
Resume
Stop
```

Check:
- Old source nodes are disconnected.
- Active references are cleared.
- No redundant animation loops remain.
- The application can continue playback.

### 9.6 Performance Test

Measure visualizer FPS during audio playback.

Check:
- Canvas updates smoothly.
- React does not re-render at every animation frame.
- FFT size changes correctly.
- Rendering stops when its component is disposed.

### 9.7 Verification Tools

- Chrome DevTools Performance
- Chrome DevTools Memory
- Browser Console
- React DevTools
- TypeScript compiler
- Automated unit tests for queue scheduling

### 9.8 Commit

`test: verify FIFO cancellation and audio resource cleanup`

---

## 10. Stage 8 – AI Failure Mode Audit & Final Documentation

### 10.1 Objective

Prepare an engineering audit documenting AI-related failure risks, implemented safeguards and verified behavior.

### 10.2 Audit Topics

**Failure Mode 01 – Race Conditions**

Multiple enqueued requests may cause concurrent queue workers to execute unexpectedly.

Mitigation:
- Single-worker scheduling
- Explicit active-task state
- FIFO invariants

**Failure Mode 02 – Memory Leaks**

Audio nodes, event handlers or animation frames may remain active after a component or source is disposed.

Mitigation:
- Audio source cleanup
- Cancellation of animation frames
- Listener removal
- Controlled AudioContext disposal

**Failure Mode 03 – Cancellation Inconsistency**

A cancelled download or decode may still resolve unexpectedly.

Mitigation:
- AbortSignal checks
- Task status validation
- Exactly-once promise settlement

**Failure Mode 04 – React State Thrashing**

Updating React state on every animation frame can cause unnecessary reconciliation and degraded rendering performance.

Mitigation:
- Ref-based animation values
- Direct Canvas rendering
- Low-frequency UI telemetry

### 10.3 Audit Document Structure

`AI_FAILURE_AUDIT.md` should contain:

1. Executive Summary
2. System Architecture
3. Audit Matrix
4. Technical Failure Analysis
5. Diagnostic Procedures
6. Engineering Safeguards
7. Testing Results
8. Git Commit History
9. Technical Defense Questions
10. Conclusion

### 10.4 Final Deliverables

- Complete application source
- Detailed task decomposition
- AI Failure Audit
- Git commit history
- Functional test evidence
- Concurrency test evidence
- Memory cleanup observations
- Performance measurements

### 10.5 Commit

`docs: complete HW2 engineering and failure mode audit`

---

## 11. Requirements Traceability Matrix

| Requirement | Module | Planned Stage | Verification |
|---|---|---|---|
| FIFO scheduling | AudioTaskQueue | 2 | Queue ordering test |
| AbortController cancellation | AudioTaskQueue | 3 | Cancellation test |
| Audio decoding | AudioTaskQueue | 3 | Valid and invalid audio tests |
| Playback | AudioEngine | 4 | Play/pause/stop tests |
| Node cleanup | AudioEngine | 4, 7 | Lifecycle tests |
| FFT 256/512 | AudioEngine | 4 | Bin count verification |
| Canvas visualization | AudioVisualizer | 5 | Visual test |
| 60 FPS target | AudioVisualizer | 5, 7 | Performance measurement |
| UI integration | App | 6 | User workflow test |
| Failure audit | Documentation | 8 | Report review |

---

## 12. Acceptance Criteria

The project is ready for final review when:

- [ ] All required source modules are implemented.
- [ ] FIFO processing order is verified.
- [ ] Simultaneous enqueue operations do not create multiple active workers.
- [ ] Pending and active task cancellation are tested.
- [ ] Audio playback operates correctly.
- [ ] FFT 256 and 512 configurations work.
- [ ] Visualizer updates from actual audio analysis data.
- [ ] Rendering uses requestAnimationFrame.
- [ ] Animation avoids per-frame React state updates.
- [ ] Audio resource cleanup is verified.
- [ ] TypeScript build succeeds.
- [ ] ESLint checks succeed.
- [ ] Git commits reflect meaningful implementation stages.
- [ ] AI Failure Audit contains actual observations and supporting evidence.

---

## 13. Engineering Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Duplicate queue workers | FIFO violation | Single active processing guard |
| Fetch cancellation race | Incorrect task completion | AbortSignal and task state checks |
| Decode failure | Queue interruption | Error handling and continuation |
| AudioContext autoplay restriction | Playback blocked | Initialize after user gesture |
| Stale AudioBufferSourceNode | Resource retention | Stop, disconnect and dereference |
| Zombie animation loop | CPU usage after unmount | cancelAnimationFrame |
| Excessive React updates | FPS degradation | Direct Canvas rendering |
| Cross-origin audio URL | Failed network request | CORS-compatible source or local audio |
| Unhandled promise rejection | Console errors | Catch and classify task failures |

---

## 14. Final Engineering Declaration

SonicFlow is designed as a modular frontend audio processing application centered on asynchronous task correctness, real-time visualization and explicit resource ownership.

Its implementation plan follows eight incremental stages, each with defined responsibilities, acceptance criteria and an atomic Git commit.

The architecture is intended to demonstrate:

- TypeScript type safety
- FIFO asynchronous scheduling
- Cancellation-aware task processing
- Web Audio API integration
- High-performance Canvas rendering
- Memory lifecycle management
- Evidence-based engineering verification

**Document status:** Planning baseline. All checkboxes and results must be updated after the corresponding work has actually been implemented and tested.

---

**End of Engineering Task Decomposition**