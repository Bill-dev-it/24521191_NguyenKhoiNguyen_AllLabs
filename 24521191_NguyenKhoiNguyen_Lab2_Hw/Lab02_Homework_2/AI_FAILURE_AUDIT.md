# AI Failure Mode Audit: Concurrent Audio Processing, Browser Security & Memory Lifecycle

**Document Identifier:** `AI_FAILURE_AUDIT.md`  
**Project:** SonicFlow – Concurrent FIFO Audio Visualizer Workstation  
**Assignment:** Homework 02 – Concurrent FIFO Audio Visualizer Queue Engine  
**Student:** Nguyen Khoi Nguyen  
**Student ID:** 24521191  
**Workspace:** `Lab02_Homework_2`  
**Technology:** React, TypeScript, Vite, Vitest, Web Audio API, Canvas API  
**Engineering Baseline:** FIFO scheduling, AbortController, Web Audio resource cleanup, FFT 256/512, requestAnimationFrame  
**Document Status:** Final development audit; manual performance and memory verification remains evidence-dependent

---

## 1. Executive Summary

Homework 02 implements SonicFlow, a browser-based audio processing workstation that combines asynchronous FIFO task scheduling, Web Audio playback, real-time frequency visualization, and explicit resource lifecycle management.

The application separates queue execution, network downloading, audio decoding, playback, and Canvas rendering into independent modules.

The development followed eight stages with incremental Git commits.

AI-assisted implementation required additional engineering review because several patterns that appear correct in TypeScript or mocked unit tests can fail in real browser environments.

A confirmed example occurred during browser integration testing: all generated WAV tracks initially failed because the native Fetch API was invoked with an incorrect execution context.

The browser reported:

`Failed to execute 'fetch' on 'Window': Illegal invocation`

The problem was traced to the Fetch API reference stored inside the AudioLoader class.

The implementation was corrected by binding the native method to its browser context.

This audit documents that issue alongside other high-priority concurrency, cancellation, memory, and rendering risks.

### 1.1 Audit Objectives

1. Investigate failures in AI-assisted asynchronous application development.
2. Verify FIFO task scheduling and cancellation behavior.
3. Identify native browser API binding hazards.
4. Review AudioContext and AudioBufferSourceNode lifecycles.
5. Assess real-time Canvas rendering architecture.
6. Document engineering safeguards and test evidence.
7. Prepare technical answers for classroom evaluation.

### 1.2 Verification Scope

| Verification Area | Evidence / Status |
|---|---|
| FIFO Queue | 6 Vitest cases passed |
| AudioLoader | 7 Vitest cases passed |
| AudioEngine | 8 test cases planned/implemented; verify final Vitest output |
| Browser Fetch Binding | Confirmed defect identified and corrected |
| Actual WAV Download | Previously failed; user confirmed the error was resolved |
| Audio Playback & Visualizer | Implemented; final manual results should be recorded |
| FFT 256/512 | Implemented |
| RAF Cleanup | Cleanup code implemented |
| Zero Memory Leaks | Not conclusively established |
| Sustained 60 FPS | Performance target; measured result not provided |

The difference between successful unit tests and empirical performance or memory verification is maintained throughout this report.

---

## 2. System Architecture

### 2.1 Modular Organization

The application contains five major subsystems.

| Module | Responsibility |
|---|---|
| `audio-types.ts` | Shared contracts, task types and statuses |
| `audio-queue-controller.ts` | FIFO scheduling, task lifecycle and cancellation |
| `audio-loader.ts` | Audio downloading, buffer reading and decoding |
| `audio-engine.ts` | Playback, AudioContext and source management |
| `AudioVisualizer.tsx` | Canvas rendering, visualization modes and FPS telemetry |
| `App.tsx` | User interface integration and resource ownership |

### 2.2 Processing Pipeline

```text
User selects audio
         |
         v
React Application
         |
         v
AudioTaskQueue.enqueue()
         |
         v
FIFO Pending Queue
         |
         v
AudioLoader.load()
         |
         v
fetch(URL, AbortSignal)
         |
         v
Response ArrayBuffer
         |
         v
AudioContext.decodeAudioData()
         |
         v
Decoded AudioBuffer
         |
         v
AudioEngine.loadBuffer()
         |
         v
AudioBufferSourceNode
         |
         v
AnalyserNode
         |
         v
GainNode -> AudioDestination
         |
         v
Frequency / Waveform Data
         |
         v
Canvas Visualization
```

### 2.3 Architectural Invariants

**Invariant I1 – FIFO Ordering**

Tasks begin processing in the order in which they were successfully enqueued.

**Invariant I2 – Single Active Processing Pipeline**

Only one FIFO worker may process the download/decoding pipeline at a time.

**Invariant I3 – Exactly-Once Promise Settlement**

A queued task must not resolve or reject its Promise more than once.

**Invariant I4 – Cancellation Safety**

Cancellation must not cause a previously cancelled task to deliver a usable result later.

**Invariant I5 – Source Ownership**

Only the AudioEngine manages active AudioBufferSourceNodes.

**Invariant I6 – Rendering Ownership**

Only the Visualizer component owns its requestAnimationFrame loop and associated Canvas rendering resources.

**Invariant I7 – Cleanup**

Every resource-owning component must explicitly release the resources it creates.

---

## 3. AI Failure Mode Audit Matrix

| ID | Failure Mode | Affected Module | Root Cause | Detection | Engineering Response |
|---|---|---|---|---|---|
| FM-01 | Native Fetch API Illegal Invocation | `audio-loader.ts` | Incorrect browser API method binding | Live browser test and application error message | `window.fetch.bind(window)` |
| FM-02 | Duplicate FIFO Workers / Race Conditions | `audio-queue-controller.ts` | Concurrent scheduling without a single-worker guard | Controlled asynchronous unit tests | `isProcessing` guard and sequential worker loop |
| FM-03 | Cancellation During Async Decoding | `audio-loader.ts`, queue | `decodeAudioData()` is not directly abortable | Deferred Promise tests | Abort checks and discarded late results |
| FM-04 | Audio Source Retention | `audio-engine.ts` | Missing stop, disconnect or callback cleanup | Mock AudioEngine lifecycle tests | Explicit `releaseSource()` and `dispose()` |
| FM-05 | RAF Lifecycle & React State Thrashing | `AudioVisualizer.tsx` | Frame-by-frame React updates or missing frame cancellation | Code review and performance testing | Canvas rendering, RAF cleanup, throttled telemetry |
| FM-06 | AudioContext Initialization Problems | `App.tsx`, `audio-engine.ts` | Browser gesture requirements and incorrect context lifecycle | Browser integration and lifecycle tests | Controlled context initialization and reuse |

FM-01 is a confirmed application defect encountered during development.

FM-02 through FM-06 are engineering failure modes reviewed or mitigated by the architecture. They should not be described as observed production failures unless separate reproduction evidence exists.

---

## 4. Failure Mode 01: Native Fetch API Illegal Invocation

### 4.1 Observed Defect

During the SonicFlow UI integration test, the user enqueued three generated WAV tracks:

- Neon Pulse
- Cyber Rhythm
- Midnight Signal

All three tasks entered the failed state.

The UI displayed:

```text
Total Tasks: 3
Pending: 0
Completed: 0
Failed / Cancelled: 3
```

The Audio Player status reported a network error containing:

`Failed to execute 'fetch' on 'Window': Illegal invocation`

This was a directly observed failure in the browser, despite the previously successful mock-based AudioLoader tests.

### 4.2 Root Cause

The original AudioLoader stored the browser Fetch API as an unbound function reference:

```typescript
this.fetcher = options.fetcher ?? fetch;
```

Later, it invoked the reference through an instance property:

```typescript
const response = await this.fetcher(trackUrl, {
  method: "GET",
  signal,
});
```

In the tested browser environment, the invocation caused an invalid native method receiver error.

Some browser-native functions are sensitive to their execution context.

Storing a native function and invoking it as an arbitrary object's method may result in an incorrect `this` binding.

### 4.3 Diagnostic Methodology

The investigation followed these steps:

1. Enqueued generated WAV tracks from the SonicFlow UI.
2. Observed that each task reached the `failed` state.
3. Inspected the Audio Player's status message.
4. Identified the browser's `Illegal invocation` error.
5. Traced the error to the Fetch API invocation in `AudioLoader`.
6. Compared the browser execution path with mocked Vitest behavior.
7. Corrected the method binding.
8. Repeated the browser test.

The issue was not caused by the FIFO scheduling algorithm itself.

### 4.4 Engineering Fix

The Fetch API reference was explicitly bound to the browser window:

```typescript
this.fetcher =
  options.fetcher ?? window.fetch.bind(window);
```

The injected mock fetcher path remains configurable through `AudioLoaderOptions`.

This preserves dependency injection while providing a correctly bound browser-native implementation.

### 4.5 Verification Outcome

**Before Fix:** Generated WAV queue tasks failed with `Illegal invocation`.

**After Fix:** The user confirmed that the error was resolved.

The fix was included in the Stage 7 source changes.

Additional automated integration coverage for the default native-fetch path would further reduce the likelihood of regression.

### 4.6 Engineering Lesson

A successful mocked unit test does not guarantee that a native browser API will behave identically during real execution.

Browser integration testing is essential when working with Web APIs whose implementation may depend on an internal receiver or browser context.

---

## 5. Failure Mode 02: Duplicate FIFO Workers and Race Conditions

### 5.1 Failure Description

An asynchronous audio queue may receive multiple enqueue requests before the previous task completes.

For example:

```typescript
queue.enqueue(trackA);
queue.enqueue(trackB);
queue.enqueue(trackC);
```

A naive implementation could start a separate processing loop for each enqueue operation.

This may cause all three audio downloads and decode operations to execute simultaneously, violating FIFO processing constraints.

### 5.2 Consequences

Potential consequences include:

- Incorrect task execution order
- Concurrent decoding when sequential processing is required
- Duplicate worker execution
- Inconsistent queue snapshots
- Race conditions in task completion
- Incorrect cancellation behavior

### 5.3 Implemented Single-Worker Guard

The AudioTaskQueue uses an explicit processing flag.

```typescript
private async processNext(): Promise<void> {
  if (this.isProcessing || this.disposed) {
    return;
  }

  this.isProcessing = true;
  this.notify();

  try {
    while (
      this.pending.length > 0 &&
      !this.disposed
    ) {
      const entry = this.pending.shift()!;

      // Process the active entry.
    }
  } finally {
    this.isProcessing = false;
    this.notify();
  }
}
```

The guard prevents a second worker from entering while the existing worker is active.

Each task is awaited before the worker continues to the next eligible entry.

### 5.4 Test Procedure

Three tasks are submitted synchronously.

Expected execution trace:

```text
start:A
end:A
start:B
end:B
start:C
end:C
```

Invalid concurrent execution:

```text
start:A
start:B
start:C
end:B
end:A
end:C
```

### 5.5 Verification Evidence

The Stage 2 queue tests included:

- Strict FIFO ordering
- No simultaneous processing
- Pending task cancellation
- Active cancellation with late results
- Queue continuation after failure
- Disposal behavior

**Verified result:** 6/6 FIFO unit tests passed during development.

### 5.6 Engineering Lesson

Concurrency support does not necessarily mean parallel execution.

The system accepts concurrent requests while deliberately serializing the processing pipeline to preserve FIFO ordering and simplify resource management.

---

## 6. Failure Mode 03: AbortController and Non-Abortable Decoding

### 6.1 Failure Description

Audio processing includes several asynchronous stages:

```text
Fetch
  ↓
Read Stream
  ↓
Decode Audio
  ↓
Return AudioBuffer
```

Fetch supports AbortSignal cancellation.

However, `AudioContext.decodeAudioData()` does not provide the same direct AbortSignal cancellation mechanism.

Therefore, cancellation after decoding begins requires additional application-level state validation.

### 6.2 Race Condition Scenario

Consider:

```text
Task A begins decoding
        |
        v
User cancels Task A
        |
        v
AbortController.abort()
        |
        v
decodeAudioData() continues
        |
        v
Decoder resolves AudioBuffer
```

Without a post-decode cancellation check, the result could be delivered after the user has cancelled the task.

### 6.3 Implemented Cancellation Check

The loader checks the signal after decoding:

```typescript
const decoded =
  await this.decoder.decodeAudioData(arrayBuffer);

this.assertNotCancelled(signal);

return decoded;
```

If cancellation occurred while decoding, the loader rejects instead of returning the buffer.

The FIFO controller also inspects the task's AbortSignal before treating the result as successful.

### 6.4 Exactly-Once Settlement

The queue maintains a settlement guard:

```typescript
private settleReject(
  entry: InternalTask<TResult>,
  reason: unknown
): void {
  if (entry.settled) return;

  entry.settled = true;
  entry.reject(reason);
}
```

A corresponding guard protects successful resolution.

This prevents duplicate settlement attempts from producing inconsistent application-level outcomes.

### 6.5 Testing Strategy

Tests cover the following scenarios:

| Scenario | Expected Behavior |
|---|---|
| Cancel before fetch | Fetch does not begin |
| Cancel pending queue entry | Task is removed and rejected |
| Cancel active request | Abort signal is triggered |
| Cancel during decode | Late result is discarded |
| Failed download | Queue continues |
| Invalid decode result | Loader rejects |

### 6.6 Verification Outcome

The AudioLoader test suite reported **7/7 passed** during development.

The queue cancellation tests also passed.

This confirms the tested cancellation paths under mocked conditions.

It does not imply that the browser can physically terminate an in-progress decode operation.

### 6.7 Engineering Lesson

Aborting an operation and cancelling its result are distinct concepts.

When an API cannot terminate an operation directly, the application must ensure its eventual output cannot affect state after cancellation.

---

## 7. Failure Mode 04: AudioBufferSourceNode and Resource Cleanup

### 7.1 Failure Description

A common Web Audio memory-management mistake is retaining obsolete audio nodes after playback stops or changes.

Potential defects include:

- Failing to stop an active AudioBufferSourceNode
- Failing to disconnect obsolete nodes
- Retaining stale `onended` handlers
- Creating a new AudioContext for every playback request
- Keeping references to old AudioBuffers unnecessarily
- Failing to close the AudioContext during final disposal

### 7.2 One-Shot Source Constraint

An `AudioBufferSourceNode` is a one-shot playback source.

A source cannot be restarted after it has already been started and stopped.

Therefore, pause and resume must not attempt to restart the same source object.

### 7.3 Implemented Playback Strategy

The AudioEngine stores playback offset separately from the active source.

When the user pauses:

1. Calculate playback position.
2. Store the offset.
3. Stop the active source.
4. Disconnect the source.
5. Transition to paused state.

When the user resumes:

1. Create a new AudioBufferSourceNode.
2. Reconnect it to the AnalyserNode.
3. Start playback at the stored offset.
4. Update playback state.

### 7.4 Implemented Source Cleanup

```typescript
private releaseSource(): void {
  const source = this.source;

  this.sourceGeneration++;
  this.source = null;

  if (!source) return;

  source.onended = null;

  try {
    source.stop();
  } catch {
    // The source may already be stopped.
  }

  try {
    source.disconnect();
  } catch {
    // Ignore cleanup of disconnected nodes.
  }
}
```

This function centralizes cleanup instead of duplicating stop/disconnect logic throughout the player.

### 7.5 Source Generation Protection

AudioEngine maintains a source generation counter.

Callbacks from obsolete sources are ignored when they do not belong to the current generation.

This prevents a late `onended` event from a replaced source from incorrectly stopping the new playback state.

### 7.6 Engine Disposal

The engine's disposal procedure includes:

- Releasing the active source
- Disconnecting analyser and gain nodes
- Removing retained audio references
- Closing the AudioContext
- Clearing registered listeners

### 7.7 Unit Verification

The Stage 7 AudioEngine tests cover:

1. Single AudioContext initialization
2. Playback rejection without a buffer
3. Active source creation
4. Pause cleanup
5. New source creation on resume
6. FFT configuration
7. Volume boundaries
8. Engine disposal

Record the final Vitest result here:

**AudioEngine tests:** [Enter verified number passed]

**Overall unit tests:** [Enter verified number passed]

### 7.8 Limitations

Successful mock tests demonstrate cleanup method calls under the simulated conditions.

They do not conclusively prove that the browser retains no objects after repeated playback sessions.

A complete memory assessment requires browser-level observation, such as repeated lifecycle cycles and heap snapshots.

**Engineering lesson:** Explicit resource ownership and idempotent cleanup are necessary foundations for preventing memory leaks.

---

## 8. Failure Mode 05: requestAnimationFrame and React State Thrashing

### 8.1 Failure Description

Audio visualization requires frequent graphics updates.

A straightforward but inefficient implementation may update React state on every animation frame.

Example:

```typescript
function render() {
  setFrequencyData(readFrequencyData());
  requestAnimationFrame(render);
}
```

This can trigger unnecessary React reconciliation at display refresh frequency.

The actual performance impact depends on component complexity and rendering conditions.

### 8.2 Performance Target

The assignment specifies a 60 FPS visualization target.

At 60 FPS, the approximate frame interval is:

`1000 / 60 = 16.67 ms`

The browser ultimately determines requestAnimationFrame scheduling.

Background tabs, display refresh rates, CPU load, GPU load and power-saving settings may affect observed frame rate.

### 8.3 Implemented Canvas Rendering

The Visualizer uses direct Canvas drawing:

```typescript
const render = (timestamp: number) => {
  if (disposed) return;

  ctx.clearRect(0, 0, width, height);

  const playing = engine?.getStatus() === "playing";

  if (playing && engine) {
    const frequency = engine.getFrequencyData();

    drawSpectrum(
      ctx,
      frequency,
      width,
      height
    );
  }

  frameId = requestAnimationFrame(render);
};
```

The exact drawing function varies by selected visualization mode.

Three modes are implemented:

- Spectrum
- Oscilloscope
- Circular

### 8.4 Reduced React Update Frequency

FPS telemetry is updated approximately once per second:

```typescript
if (elapsed >= 1000) {
  setFps(
    Math.round(frameCount * 1000 / elapsed)
  );

  frameCount = 0;
  lastMeasure = timestamp;
}
```

This avoids triggering React state updates for every visualized frame.

### 8.5 Animation Cleanup

The Visualizer effect returns a cleanup function:

```typescript
return () => {
  disposed = true;
  cancelAnimationFrame(frameId);
  observer.disconnect();
};
```

This cancels the pending animation frame and releases the ResizeObserver.

The `disposed` flag prevents the render callback from continuing after cleanup.

### 8.6 Memory and Performance Review

Recommended browser test:

1. Start audio playback.
2. Open Chrome DevTools Performance.
3. Observe rendering and scripting activity.
4. Change visualization modes.
5. Stop playback.
6. Navigate away or unmount the component.
7. Confirm that no stale visualization loop continues.
8. Repeat several times and observe memory behavior.

### 8.7 Verification Status

**Implementation:** RAF rendering and cleanup present.

**Measured sustained FPS:** [Not recorded]

**Browser heap growth:** [Not recorded]

**Zero-leak declaration:** Not established by current evidence.

### 8.8 Engineering Lesson

High-frequency visual updates should be separated from ordinary application state management.

Direct Canvas rendering and low-frequency telemetry reduce unnecessary work, while explicit cleanup prevents orphaned rendering loops.

---

## 9. Failure Mode 06: AudioContext Initialization and Browser Restrictions

### 9.1 Failure Description

Modern browsers apply autoplay restrictions to prevent unexpected audio playback.

Creating or resuming an AudioContext outside a permitted user interaction can leave the context suspended.

An audio application may therefore appear ready while not producing audible sound.

### 9.2 Related Engineering Risks

- Automatically initializing playback before user interaction
- Creating unnecessary AudioContext instances
- Attempting playback with a suspended context
- Failing to handle resume errors
- Closing a context while asynchronous initialization is incomplete
- Failing to release decoder contexts during unmount

### 9.3 Implemented Initialization Strategy

AudioEngine initializes its playback graph on demand.

The application can use an AudioContext for decoding and a separate context for playback.

The playback engine reuses its initialized AudioContext rather than creating a new one for every track.

### 9.4 Lifecycle Verification

Recommended scenarios:

| Scenario | Expected Behavior |
|---|---|
| First user-initiated Play | Playback context becomes usable |
| Pause / Resume | Playback continues from offset |
| Stop / Play | New source starts correctly |
| Change track | Previous source is released |
| Unmount application | Context and retained resources are disposed |
| Repeated playback | No accumulation of active source nodes |

### 9.5 Engineering Lesson

Browser APIs must be integrated according to their lifecycle and permission models.

Correct TypeScript code alone does not guarantee correct execution when browser gesture and context-state requirements apply.

---

## 10. Engineering Verification Matrix

### 10.1 Automated Tests

| Test Suite | Scope | Result |
|---|---|---|
| FIFO Controller | Scheduling, cancellation, recovery and disposal | 6 passed |
| AudioLoader | Download, validation, cancellation and integration | 7 passed |
| AudioEngine | Playback and lifecycle behaviors | Verify final result |

Use the following commands:

```bash
npm run build
npm run lint
npm run test
```

If all eight AudioEngine cases pass, the expected total is:

**21/21 tests passed.**

This figure must match the actual final Vitest output before being reported as verified.

### 10.2 Browser Integration

| Scenario | Status |
|---|---|
| Initial three generated WAV tasks | FAILED before browser fetch fix |
| Fetch binding correction | Implemented |
| Illegal invocation regression | User confirmed resolved |
| File upload and decoding | Manual result not documented |
| External HTTP URL loading | Manual result not documented |
| Actual audio playback | Manual result not documented |
| Visualization responsiveness | Manual result not documented |

### 10.3 Memory Verification

The code includes cleanup for:

- AudioBufferSourceNode
- AnalyserNode
- GainNode
- AudioContext
- requestAnimationFrame
- ResizeObserver
- Object URLs
- Queue subscriptions
- Pending queue tasks

A declaration of zero memory leaks requires additional browser measurement and should not rely solely on the presence of cleanup code.

---

## 11. Git Commit History & Task Decomposition

The project was developed through eight planned stages.

| Stage | Commit Message | Engineering Purpose |
|---|---|---|
| 1 | `docs: initialize HW2 project and detailed task decomposition` | Project setup and planning |
| 2 | `feat: implement typed FIFO audio task controller` | FIFO scheduling and Promise management |
| 3 | `feat: add abortable audio fetching and decoding` | Async network and decoder pipeline |
| 4 | `feat: implement audio playback engine with safe cleanup` | Web Audio graph and lifecycle |
| 5 | `feat: build RAF-driven audio frequency visualizer` | Canvas frequency visualization |
| 6 | `feat: integrate SonicFlow audio queue workstation interface` | User-facing audio workstation |
| 7 | `test: verify audio lifecycle and fix browser fetch binding` | Tests and confirmed browser integration fix |
| 8 | `docs: complete HW2 engineering and failure mode audit` | Final technical documentation |

Commit SHAs must be obtained from the actual repository:

```bash
git log --oneline -8
```

The final audit should preserve the distinction between actual Git history and planned commit labels.

### 11.1 Benefits of Decomposition

The implementation stages separate responsibilities so that individual decisions remain traceable.

- Queue scheduling is tested independently of Web Audio.
- Audio downloading is tested independently of the player.
- Audio playback is separated from Canvas rendering.
- UI integration occurs after core modules exist.
- Concurrency and lifecycle verification follow integration.
- Documentation records the final architecture and observed failures.

This reduces debugging complexity and supports meaningful incremental Git commits.

---

## 12. Technical Defense Questions and Answers

### Q1. What is the difference between concurrency and parallelism in this project?

**Answer:**

SonicFlow accepts multiple audio tasks concurrently, but the FIFO Queue serializes their execution through one active processing worker.

This preserves the enqueue order and prevents overlapping processing pipelines.

### Q2. How is FIFO ordering guaranteed?

**Answer:**

Each task is appended to the pending array.

A single worker removes entries using `shift()` and awaits the active processor before handling the next task.

The `isProcessing` flag prevents additional workers from starting simultaneously.

### Q3. Why does each task need an AbortController?

**Answer:**

Each task needs an independent cancellation token so that cancelling one download does not automatically cancel unrelated queue entries.

The AbortSignal is passed into Fetch and inspected during the task lifecycle.

### Q4. Can AbortController cancel decodeAudioData()?

**Answer:**

Not directly through the `decodeAudioData()` API.

Instead, SonicFlow checks cancellation state after decoding finishes and discards the result when the task has been cancelled.

### Q5. What caused the Illegal invocation failure?

**Answer:**

The native browser Fetch function was stored as an unbound reference and later invoked as a class property.

In the tested browser, this produced an invalid receiver error.

Binding Fetch to `window` corrected the execution context.

### Q6. Why did the unit tests pass even though the browser audio loading failed?

**Answer:**

The loader tests used mocked Fetch implementations.

Those mocks did not reproduce the native browser receiver behavior.

Real browser integration testing was required to detect the problem.

### Q7. Why can't an AudioBufferSourceNode be reused after stopping?

**Answer:**

It is a one-shot source.

Once started, it cannot be started again.

Pause/resume therefore requires creating a fresh source and starting playback at the recorded offset.

### Q8. How does AudioEngine avoid retaining old source nodes?

**Answer:**

AudioEngine centralizes source cleanup through `releaseSource()`.

The function clears handlers, stops the source, disconnects it and releases the active reference.

A generation counter prevents obsolete callbacks from modifying current playback state.

### Q9. Why use requestAnimationFrame rather than setInterval?

**Answer:**

requestAnimationFrame integrates with the browser's rendering cycle and is designed for visual animation.

It also allows the application to cancel pending rendering work when the component unmounts.

### Q10. Why avoid React setState on every frame?

**Answer:**

Updating state every animation frame can trigger unnecessary React rendering work.

The Visualizer draws directly onto Canvas and only updates React state for low-frequency telemetry, such as FPS.

### Q11. What is the relationship between FFT size and frequency bins?

**Answer:**

For an AnalyserNode:

`frequencyBinCount = fftSize / 2`

Therefore:

- FFT 256 provides 128 frequency bins.
- FFT 512 provides 256 frequency bins.

Larger FFT sizes provide more frequency bins but also affect time resolution and processing characteristics.

### Q12. How did you prove zero memory leaks?

**Answer:**

The current implementation uses explicit cleanup methods, and unit tests verify several lifecycle behaviors.

However, these are not sufficient to prove zero memory leaks absolutely.

To support that claim, repeated playback and disposal cycles must be measured using browser memory tooling, and retained allocations must be investigated.

The appropriate technical conclusion is that the architecture includes memory-leak prevention mechanisms, with empirical validation still required.

### Q13. What is the most important AI failure discovered in this project?

**Answer:**

The browser Fetch API binding error was the clearest confirmed failure.

The implementation compiled and passed mocked tests, but every real WAV download failed.

The issue demonstrated why AI-generated code must be validated in the runtime environment, not only through static checking and unit mocks.

---

## 13. Final Review Checklist

### Implemented Architecture

- [x] Typed FIFO task contracts
- [x] Single-worker queue controller
- [x] AbortController support
- [x] Audio downloading and decoding module
- [x] AudioEngine lifecycle methods
- [x] FFT 256/512 configuration
- [x] Canvas rendering modes
- [x] requestAnimationFrame cleanup
- [x] SonicFlow user interface
- [x] Browser fetch binding correction

### Verified Development Evidence

- [x] 6 FIFO tests passed during development
- [x] 7 AudioLoader tests passed during development
- [x] Browser Illegal invocation error reproduced
- [x] Native fetch binding corrected
- [x] User confirmed browser error was resolved

### Final Verification to Complete

- [ ] Confirm and record final 21/21 Vitest results
- [ ] Confirm final TypeScript build and ESLint
- [ ] Record actual audio playback results
- [ ] Record FPS observations
- [ ] Capture browser memory profiling evidence
- [ ] Verify repeated playback cleanup
- [ ] Verify all expected Git commits exist
- [ ] Capture final working application screenshots

---

## 14. Conclusion & Engineering Declaration

SonicFlow demonstrates modular asynchronous audio processing using React, TypeScript, Web Audio API and Canvas.

Its architecture separates scheduling, downloading, decoding, playback and visualization to reduce coupling and make individual modules easier to test.

The implementation addresses six important engineering failure modes:

1. Native browser Fetch API invocation
2. Concurrent FIFO worker scheduling
3. Cancellation during asynchronous decoding
4. Audio node ownership and cleanup
5. High-frequency graphics rendering
6. AudioContext lifecycle restrictions

The confirmed browser Fetch issue demonstrated an important limitation of mock-based testing: code that passes unit tests can still fail during real browser execution.

The project includes automated tests, explicit cleanup procedures and an incremental Git history.

**Final Engineering Status:** Core functionality implemented; browser fetch binding defect resolved. Final performance and memory-safety claims remain subject to documented empirical testing.

---

**End of AI Failure Mode Audit – SonicFlow Homework 02**