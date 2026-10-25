# LAB03 — EXERCISE 3 | TASK DECOMPOSITION & VERIFICATION

**Assignment:** KRAFTON PUBG Vietnam Series (PVS) Live Telemetry
**Stack:** React 19 · Vite · JSX · CSS Modules · JavaScript
**Architecture:** Mobile-First · 4-State Machine · AbortController
**Engineering Standard:** `../PROJECT_RULES.md` (Master)
**Inheritance Scope:** Lab02 only (primarily Lab02 Exercise 3)
**Git Constraint:** Exactly 2 Atomic Exercise 3 Commits
**Status:** Stage 1 implementation substantially complete; pre-Commit 1 validation and staging pending (as of 2026-10-25).
**Checklist Rule:** `[x]` = implemented and/or verified through reviewed code, screenshot or user-reported execution (see Evidence Register for proof level); `[ ]` = unverified/pending. Do not treat code inspection as an independent runtime test.

---

## 1. Assignment Contract & Acceptance Baseline

### 1.1 Project Objective

Build a fault-tolerant PUBG Vietnam Series (PVS)
telemetry dashboard using React 19.

The application must:

- Monitor three predefined Vietnamese PUBG squads.
- Simulate asynchronous satellite telemetry requests.
- Use a four-state lifecycle.
- Render a 220px Blue-Zone loading skeleton.
- Simulate 35% packet loss.
- Cancel stale requests using AbortController.
- Recover from network failures through a Retry button.
- Display accessible error feedback without window.alert().
- Maintain stable behavior under rapid squad switching.
- Support mobile-first responsive layouts.

The dataset is simulated for educational purposes.
No real PUBG API integration is required.

### 1.2 Functional Requirements

| ID | Requirement | Implementation Contract | Stage |
|---|---|---|---|
| FR-01 | Three PUBG squads | CES, TE, GE | 1 |
| FR-02 | Exact telemetry dataset | Fields and values match slide | 1 |
| FR-03 | Reusable React component | PubgMatchTelemetry.jsx | 1 |
| FR-04 | Four-state lifecycle | IDLE, LOADING, SUCCESS, ERROR | 1 |
| FR-05 | Asynchronous telemetry | fetchTelemetry(squadId, signal) | 1 |
| FR-06 | Simulated packet loss | 35% probability | 1 |
| FR-07 | Request cancellation | AbortController and cleanup | 1 |
| FR-08 | AbortError handling | Ignore intentional cancellation | 1 |
| FR-09 | Loading skeleton | Blue-Zone animation, 220px | 1 |
| FR-10 | Squad selector | CES, TE, GE interactive selection | 2 |
| FR-11 | Retry mechanism | retryTick triggers useEffect | 2 |
| FR-12 | Accessible error | section role="alert" | 2 |
| FR-13 | No window.alert() | Source-level verification | 2 |
| FR-14 | Rapid switching safety | Old requests cannot overwrite new data | 2 |
| FR-15 | Network throttling QA | Slow 3G and layout stability | 2 |
| FR-16 | Responsive dashboard | Mobile-first through desktop | 1–2 |
| FR-17 | Atomic Git history | Exactly two Exercise 3 commits | 1–2 |

### 1.3 PUBG VN Telemetry Dataset

| ID | Team | Map | Phase | Alive | Kills | WWCD | Status |
|---|---|---|---|---:|---:|---|---|
| ces | Cerberus Esports | Erangel | Phase 6 | 4 | 14 | 68% | In Safe Zone |
| te | The Expendables | Miramar | Phase 7 | 4 | 18 | 82% | Holding High Ground |
| ge | Genius Esports | Taego | Phase 5 | 3 | 9 | 41% | Rotating Blue Zone |

**Data source:** Instructor-provided Lab03 Exercise 3 slide.

**Data classification:** Simulated match telemetry.

### 1.4 Mandatory Git Commit Plan

| Commit | Scope | Exact Commit Message | Status |
|---|---|---|---|
| 1 | Dataset, 4-state machine, AbortController, skeleton, initial UI | `feat(ex3): implement PUBG VN 4-state telemetry & AbortController` | PENDING |
| 2 | Squad selection, Retry, accessible alert, testing, final WBS | `feat(ex3): add selection UI & retry alert` | PENDING |

**Git Rules:**

- Exactly two Exercise 3 feature commits.
- No separate WBS/documentation commits.
- Consolidate WBS changes before each commit.
- Stage only Lab03_Exercise_3 files.
- Exclude node_modules, dist, and unused assets.
- Do not amend or rewrite previous Exercise commits.

---

## 2. Lab02 → Lab03 Inheritance Specification

### 2.1 Inheritance Scope

Lab03 Exercise 3 builds upon the asynchronous state
management concepts introduced in Lab02 Exercise 3:
Resilient State Machine & Skeleton Loader.

Lab02 Exercise 2 provides supporting knowledge about
reactive state updates and event-driven rendering.

The inheritance is architectural and behavioral.
Actual direct source-code reuse must be verified
against the Lab02 files before being claimed.

Lab01 is outside the inheritance scope.

### 2.2 Source-to-Target Inheritance Matrix

| ID | Lab02 Source / Concept | Lab03 Exercise 3 Target | Migration |
|---|---|---|---|
| INH-01 | Ex3 state-machine.ts: four-state model | Telemetry state lifecycle | REUSE |
| INH-02 | Ex3 App.tsx: asynchronous data flow | Satellite telemetry loading | EXTEND |
| INH-03 | Ex3 loading skeleton | 220px Blue-Zone radar skeleton | REFACTOR |
| INH-04 | Ex3 error handling | Accessible network error panel | IMPROVE |
| INH-05 | Ex3 Retry workflow | retryTick-based recovery | EXTEND |
| INH-06 | Ex3 race-condition prevention objective | AbortController cleanup | IMPROVE |
| INH-07 | Ex2 custom reactive state concepts | React 19 useState | REPLACE |
| INH-08 | Lab02 event-driven updates | React onChange/onClick | REFACTOR |
| INH-09 | Lab02 rendering/lifecycle concepts | useEffect cleanup lifecycle | EXTEND |
| INH-10 | No verified PUBG dataset in Lab02 | PUBG_VN_SQUADS | NEW |
| INH-11 | No verified 35% packet-loss simulator | Simulated telemetry API | NEW |

**Verification note:**
The above maps instructor requirements and known
Lab02 concepts. Lab02 Exercise 3 ZIP was reviewed: `src/state-machine.ts`, `src/App.tsx`, `src/App.css` and its task decomposition. Lab02 uses a typed four-state model, a 1500 ms `Promise`/`setTimeout` simulation, first-attempt failure then retry success, an incrementing `requestId` via `useRef` to ignore stale completions, and an accessible skeleton. It does **not** use `useEffect` or `AbortController` in its inspected `App.tsx`. Lab03 adds true cancellation rather than only disregarding stale results.

### 2.3 Architectural Transition A — State Machine

**Lab02 Concept:**

Represent UI lifecycle explicitly using four states:

IDLE → LOADING → SUCCESS / ERROR

**Lab03 Target:**

```jsx
const [view, setView] = useState({
  status: "IDLE",
  data: null,
  error: null,
});
```

**State Invariants:**

- IDLE: No active telemetry result.
- LOADING: Current squad request is pending.
- SUCCESS: Data corresponds to the selected squad.
- ERROR: Current non-aborted request has failed.
- AbortError: Must not transition to ERROR.

### 2.4 Architectural Transition B — Async Cleanup

**Lab02 verified concept:**
Prevent stale asynchronous operations from corrupting UI using a `useRef` request ID. That guards the displayed result but does not cancel an outstanding timer/request.

**Lab03 Target:**

```jsx
useEffect(() => {
  const controller = new AbortController();

  return () => controller.abort();
}, [squadId, retryTick]);
```

**Engineering Requirement:**

- Abort pending requests on squad changes.
- Abort pending requests during component unmount.
- Ignore AbortError in the catch handler.
- Prevent stale request results from overwriting
  the currently selected squad.

### 2.5 Architectural Transition C — Skeleton and Retry

**Lab02 verified:**
Generic loading skeleton, retryable failure and status/alert semantics from the inspected source.

**Lab03:**
PUBG-themed loading radar with 220px reserved height,
Blue-Zone animation, packet timeout alert and Retry.

The application must not use blocking window.alert().

### 2.6 Inheritance Analysis Checklist

#### 2.6.1 Primary Lab02 Exercise 3

- [x] 2.6.1.1 Open Lab02 Exercise_3/state-machine.ts.
- [x] 2.6.1.2 Identify IDLE, LOADING, SUCCESS and ERROR.
- [x] 2.6.1.3 Identify permitted state transitions.
- [x] 2.6.1.4 Open Lab02 Exercise_3/App.tsx.
- [x] 2.6.1.5 Identify useState implementation.
- [x] 2.6.1.6 Identify asynchronous loading logic.
- [x] 2.6.1.7 Identify skeleton rendering.
- [x] 2.6.1.8 Identify error and retry behavior.
- [x] 2.6.1.9 Inspect request-race handling.
- [x] 2.6.1.10 Document verified source limitations.

#### 2.6.2 Supporting Lab02 Exercise 2

- [x] 2.6.2.1 Reference Ex2 reactive state principles.
- [x] 2.6.2.2 Map user actions to React state updates.
- [x] 2.6.2.3 Document differences from the custom engine.

#### 2.6.3 Migration Acceptance

- [x] 2.6.3.1 Record verified inheritance relationships.
- [x] 2.6.3.2 Distinguish inherited and new features.
- [x] 2.6.3.3 Confirm React 19 APIs replace custom internals.
- [x] 2.6.3.4 Confirm no unsupported direct reuse claims.
- [ ] 2.6.3.5 Verify migration in the completed application.

---

## 3. Stage 1 — Data, State Machine & AbortController

**Stage Deliverable:**
Functional telemetry loading foundation with simulated
network behavior, safe cancellation and a skeleton radar.

**Git Boundary:** Commit 1 — **not yet created**. The reference UI currently uses fixed `squadId="te"`; squad selection and reconnect controls are intentionally assigned to Commit 2.

### 3.1 Checkpoint 1A — Environment Preparation

#### 3.1.1 Project Initialization

- [x] 3.1.1.1 Open Lab03_Exercise_3 in VS Code.
- [x] 3.1.1.2 Inspect existing files before scaffolding.
- [x] 3.1.1.3 Initialize Vite React if required.
- [x] 3.1.1.4 Install npm dependencies.
- [ ] 3.1.1.5 Verify React 19.
- [ ] 3.1.1.6 Verify React DOM 19.
- [x] 3.1.1.7 Verify package.json scripts.
- [x] 3.1.1.8 Verify ESLint configuration.
- [ ] 3.1.1.9 Verify .gitignore excludes build artifacts.
- [x] 3.1.1.10 Confirm master PROJECT_RULES.md inheritance.

#### 3.1.2 Environment Verification

- [ ] 3.1.2.1 Run npm ls react react-dom.
- [x] 3.1.2.2 Run npm run dev.
- [x] 3.1.2.3 Confirm page loads in Chrome.
- [ ] 3.1.2.4 Run npm run lint.
- [x] 3.1.2.5 Run npm run build.
- [x] 3.1.2.6 Confirm no blocking runtime errors.
- [x] 3.1.2.7 Record actual verification results.

### 3.2 Checkpoint 1B — Inheritance Analysis

#### 3.2.1 Legacy Source Review

- [x] 3.2.1.1 Inspect Lab02 Ex3 state-machine.ts.
- [x] 3.2.1.2 Inspect Lab02 Ex3 App.tsx.
- [x] 3.2.1.3 Identify 4-state lifecycle.
- [x] 3.2.1.4 Identify async operations.
- [x] 3.2.1.5 Identify skeleton behavior.
- [x] 3.2.1.6 Identify error recovery.
- [x] 3.2.1.7 Identify stale-request risks.

#### 3.2.2 Migration Documentation

- [x] 3.2.2.1 Complete source-level inheritance matrix.
- [x] 3.2.2.2 Identify functionality reused conceptually.
- [x] 3.2.2.3 Identify replaced infrastructure.
- [x] 3.2.2.4 Identify new PUBG-specific functionality.
- [x] 3.2.2.5 Confirm no unsupported reuse claims.

### 3.3 Checkpoint 1C — PUBG VN Squad Dataset

#### 3.3.1 Data Contract

- [x] 3.3.1.1 Create src/data/squads.js.
- [x] 3.3.1.2 Export PUBG_VN_SQUADS.
- [x] 3.3.1.3 Use stable string squad IDs.
- [x] 3.3.1.4 Define name, map and phase fields.
- [x] 3.3.1.5 Define alive and kills as integers.
- [x] 3.3.1.6 Define wwcdProb and status fields.
- [x] 3.3.1.7 Avoid unnecessary data duplication.

#### 3.3.2 Required Squad Records

- [x] 3.3.2.1 Add Cerberus Esports (ces).
- [x] 3.3.2.2 Set Erangel / Phase 6.
- [x] 3.3.2.3 Set Alive 4 / Kills 14 / WWCD 68%.
- [x] 3.3.2.4 Set status In Safe Zone.
- [x] 3.3.2.5 Add The Expendables (te).
- [x] 3.3.2.6 Set Miramar / Phase 7.
- [x] 3.3.2.7 Set Alive 4 / Kills 18 / WWCD 82%.
- [x] 3.3.2.8 Set status Holding High Ground.
- [x] 3.3.2.9 Add Genius Esports (ge).
- [x] 3.3.2.10 Set Taego / Phase 5.
- [x] 3.3.2.11 Set Alive 3 / Kills 9 / WWCD 41%.
- [x] 3.3.2.12 Set status Rotating Blue Zone.

#### 3.3.3 Dataset Verification

- [x] 3.3.3.1 Confirm exactly three records.
- [x] 3.3.3.2 Confirm IDs ces, te and ge are unique.
- [x] 3.3.3.3 Confirm all required fields exist.
- [x] 3.3.3.4 Confirm alive and kills are integers.
- [x] 3.3.3.5 Confirm WWCD percentage format.
- [x] 3.3.3.6 Compare every value with instructor slide.
- [x] 3.3.3.7 Run schema assertions.
- [x] 3.3.3.8 Capture verification output.

### 3.4 Checkpoint 1D — Simulated Telemetry Service

#### 3.4.1 Service Contract

- [x] 3.4.1.1 Create src/services/telemetryApi.js.
- [x] 3.4.1.2 Export fetchTelemetry().
- [x] 3.4.1.3 Accept squadId argument.
- [x] 3.4.1.4 Accept AbortSignal argument.
- [x] 3.4.1.5 Resolve matching squad data.
- [ ] 3.4.1.6 Reject unknown squad IDs.
- [x] 3.4.1.7 Keep simulation logic outside JSX.

#### 3.4.2 Simulated Network Delay

- [x] 3.4.2.1 Define an observable async delay.
- [x] 3.4.2.2 Keep delay configurable for testing.
- [x] 3.4.2.3 Respect AbortSignal during waiting.
- [x] 3.4.2.4 Cancel pending timeout on abort.
- [x] 3.4.2.5 Clean up listeners/timers after settling.
- [x] 3.4.2.6 Do not continue after cancellation.

#### 3.4.3 Packet Loss Simulation

- [x] 3.4.3.1 Define PACKET_LOSS_RATE = 0.35.
- [x] 3.4.3.2 Use random probability for normal simulation.
- [x] 3.4.3.3 Reject packet-loss requests with an Error.
- [x] 3.4.3.4 Resolve successful requests with squad data.
- [x] 3.4.3.5 Preserve a distinct AbortError path.
- [x] 3.4.3.6 Avoid confusing network loss with cancellation.

#### 3.4.4 Deterministic Service Tests

- [x] 3.4.4.1 Force SUCCESS in a test configuration.
- [x] 3.4.4.2 Force ERROR in a test configuration.
- [x] 3.4.4.3 Abort a pending request deliberately.
- [x] 3.4.4.4 Verify aborted request rejects as AbortError.
- [ ] 3.4.4.5 Verify no stale timeout updates UI.
- [x] 3.4.4.6 Restore the normal 35% simulation.
- [ ] 3.4.4.7 Confirm no resource leaks after repeated tests.

**Testing Rule:** A 35% probability does not imply
exactly 35 failures in every 100 random requests.

### 3.5 Checkpoint 1E — Four-State Telemetry Engine

#### 3.5.1 Component Contract

- [x] 3.5.1.1 Create PubgMatchTelemetry.jsx.
- [x] 3.5.1.2 Export named PubgMatchTelemetry component.
- [x] 3.5.1.3 Accept squadId prop (default te).
- [x] 3.5.1.4 Import useState and useEffect.
- [x] 3.5.1.5 Import fetchTelemetry service.
- [x] 3.5.1.6 Initialize view with IDLE status.
- [ ] 3.5.1.7 Initialize local retryTick state. **Clarification:** Commit 1 component accepts `retryTick = 0` as a prop; local Retry control/state will be added at Commit 2 (or owned by parent as explicitly documented).

#### 3.5.2 useEffect Request Lifecycle

- [x] 3.5.2.1 Create AbortController inside useEffect.
- [x] 3.5.2.2 Set LOADING when a request starts.
- [x] 3.5.2.3 Call fetchTelemetry with controller.signal.
- [x] 3.5.2.4 Transition to SUCCESS on valid response.
- [x] 3.5.2.5 Transition to ERROR on genuine request failure.
- [x] 3.5.2.6 Ignore AbortError in catch.
- [x] 3.5.2.7 Return cleanup function.
- [x] 3.5.2.8 Call controller.abort() during cleanup.
- [x] 3.5.2.9 Use squadId and retryTick as dependencies.
- [x] 3.5.2.10 Avoid accidental infinite effect loops.

#### 3.5.3 State Invariants

- [ ] 3.5.3.1 Verify IDLE initial state exists.
- [x] 3.5.3.2 Verify loading transition.
- [x] 3.5.3.3 Verify successful response transition.
- [ ] 3.5.3.4 Verify actual failure transition.
- [x] 3.5.3.5 Verify AbortError does not show ERROR.
- [x] 3.5.3.6 Verify current squad and response match.
- [ ] 3.5.3.7 Prevent stale response rendering.
- [ ] 3.5.3.8 Verify component unmount cancels work.

### 3.6 Checkpoint 1F — 220px Blue-Zone Skeleton

#### 3.6.1 Skeleton Rendering

- [x] 3.6.1.1 Render skeleton during LOADING.
- [x] 3.6.1.2 Use semantic section.
- [x] 3.6.1.3 Add aria-busy="true".
- [x] 3.6.1.4 Reserve 220px skeleton height.
- [x] 3.6.1.5 Add informative loading text.
- [x] 3.6.1.6 Prevent overflow at narrow widths.

#### 3.6.2 Visual Design

- [x] 3.6.2.1 Create CSS Module styling.
- [x] 3.6.2.2 Implement Blue-Zone radar appearance.
- [x] 3.6.2.3 Add a visible pulse animation.
- [x] 3.6.2.4 Respect prefers-reduced-motion.
- [x] 3.6.2.5 Maintain readable foreground contrast.
- [ ] 3.6.2.6 Avoid layout shifts when content changes.

#### 3.6.3 Skeleton Verification

- [x] 3.6.3.1 Observe LOADING with simulated delay.
- [x] 3.6.3.2 Verify skeleton height equals 220px.
- [ ] 3.6.3.3 Check CSS animation is active.
- [ ] 3.6.3.4 Verify reduced-motion fallback.
- [x] 3.6.3.5 Verify content does not overflow.
- [ ] 3.6.3.6 Record initial layout stability.

### 3.7 Stage 1 Quality Gate & Commit 1

**Stage 1 verification snapshot (2026-10-25):** User terminal confirms dataset 7/7 assertions and deterministic SUCCESS/ERROR/ABORT=true. Chrome DevTools confirms skeletonExists=true, height=220 and loadingState=true; SUCCESS screen shows TE/Miramar/Phase 7/Alive 4/Kills 18/82%. User reports no horizontal overflow at 320/375/768/1024/1440. Production `npm run build` PASS (Vite 8.3.5, 21 modules, 204 ms). `npm run lint` output not supplied; error-state UI, complete 4-state runtime/CLS and rapid switching are not claimed verified.


#### 3.7.1 Engineering Verification

- [x] 3.7.1.1 Dataset schema assertions PASS.
- [x] 3.7.1.2 Simulated SUCCESS path PASS.
- [x] 3.7.1.3 Simulated ERROR path PASS.
- [x] 3.7.1.4 AbortError test PASS.
- [ ] 3.7.1.5 All four UI states independently runtime-tested (IDLE and ERROR not separately evidenced; SUCCESS/LOADING observed).
- [x] 3.7.1.6 Skeleton 220px verified.
- [x] 3.7.1.7 Basic mobile layout verified.
- [x] 3.7.1.8 Inheritance documentation completed.
- [ ] 3.7.1.9 npm run lint PASS (no terminal output supplied yet).
- [x] 3.7.1.10 npm run build PASS.

#### 3.7.2 Commit Preparation

- [x] 3.7.2.1 Update Stage 1 WBS once.
- [ ] 3.7.2.2 Review git status.
- [ ] 3.7.2.3 Stage Exercise 3 files only.
- [ ] 3.7.2.4 Run git diff --cached --check.
- [ ] 3.7.2.5 Inspect git diff --cached --stat.
- [ ] 3.7.2.6 Verify no unrelated files are staged.
- [ ] 3.7.2.7 Create Commit 1.
- [ ] 3.7.2.8 Verify commit hash and file scope.

**COMMIT 1 — PENDING (WBS updated before staging):**

`feat(ex3): implement PUBG VN 4-state telemetry & AbortController`

---

## 4. Stage 2 — Squad Selection, Retry & Final QA

**Stage Deliverable:**
Fully interactive telemetry dashboard with accessible
network-error recovery and verified request cancellation.

**Git Boundary:** Commit 2.

### 4.1 Checkpoint 2A — Squad Selection UI

#### 4.1.1 Controlled Squad Selector

- [ ] 4.1.1.1 Define current squad selection state.
- [ ] 4.1.1.2 Initialize default squad to te.
- [ ] 4.1.1.3 Render selector for CES, TE and GE.
- [ ] 4.1.1.4 Use semantic label association.
- [ ] 4.1.1.5 Use stable squad IDs as option values.
- [ ] 4.1.1.6 Connect onChange to state.
- [ ] 4.1.1.7 Pass selected squadId to telemetry component.
- [ ] 4.1.1.8 Verify keyboard operation.

#### 4.1.2 Selection Behavior

- [ ] 4.1.2.1 Select Cerberus Esports.
- [ ] 4.1.2.2 Verify Erangel and CES stats.
- [ ] 4.1.2.3 Select The Expendables.
- [ ] 4.1.2.4 Verify Miramar and TE stats.
- [ ] 4.1.2.5 Select Genius Esports.
- [ ] 4.1.2.6 Verify Taego and GE stats.
- [ ] 4.1.2.7 Verify each change starts a request.
- [ ] 4.1.2.8 Verify previous requests are canceled.

### 4.2 Checkpoint 2B — Accessible Error & Retry

#### 4.2.1 Error Presentation

- [ ] 4.2.1.1 Render ERROR state in a section.
- [ ] 4.2.1.2 Set role="alert".
- [ ] 4.2.1.3 Show an informative satellite-error message.
- [ ] 4.2.1.4 Show error details safely as text.
- [ ] 4.2.1.5 Avoid raw HTML injection.
- [ ] 4.2.1.6 Never call window.alert().
- [ ] 4.2.1.7 Confirm alert is keyboard-accessible.

#### 4.2.2 Retry Implementation

- [ ] 4.2.2.1 Add Reconnect Satellite button.
- [ ] 4.2.2.2 Set type="button".
- [ ] 4.2.2.3 Attach retry handler.
- [ ] 4.2.2.4 Increment retryTick.
- [ ] 4.2.2.5 Trigger useEffect through dependency change.
- [ ] 4.2.2.6 Transition ERROR → LOADING.
- [ ] 4.2.2.7 Clear stale error on retry.
- [ ] 4.2.2.8 Support repeated retries.

#### 4.2.3 Recovery Verification

- [ ] 4.2.3.1 Force packet-loss error.
- [ ] 4.2.3.2 Verify role="alert" appears.
- [ ] 4.2.3.3 Verify Retry is visible.
- [ ] 4.2.3.4 Activate Retry with mouse.
- [ ] 4.2.3.5 Activate Retry with keyboard.
- [ ] 4.2.3.6 Verify LOADING skeleton returns.
- [ ] 4.2.3.7 Verify eventual SUCCESS.
- [ ] 4.2.3.8 Verify no blocking browser alert.

### 4.3 Checkpoint 2C — Rapid Switching & Abort Audit

#### 4.3.1 Cancellation Scenario

- [ ] 4.3.1.1 Start CES request.
- [ ] 4.3.1.2 Switch to TE before CES completes.
- [ ] 4.3.1.3 Switch to GE before TE completes.
- [ ] 4.3.1.4 Verify CES request is aborted.
- [ ] 4.3.1.5 Verify TE request is aborted.
- [ ] 4.3.1.6 Verify GE remains active.
- [ ] 4.3.1.7 Verify old data never replaces GE.
- [ ] 4.3.1.8 Verify no false ERROR banner appears.

#### 4.3.2 StrictMode / Cleanup Tests

- [ ] 4.3.2.1 Test with React StrictMode enabled.
- [ ] 4.3.2.2 Verify cleanup does not break new requests.
- [ ] 4.3.2.3 Verify cleanup aborts pending operations.
- [ ] 4.3.2.4 Verify no unhandled AbortError.
- [ ] 4.3.2.5 Verify no state-update-after-unmount behavior.
- [ ] 4.3.2.6 Verify switching remains responsive.

#### 4.3.3 Evidence

- [ ] 4.3.3.1 Inspect Network / request logs.
- [ ] 4.3.3.2 Confirm canceled-request behavior.
- [ ] 4.3.3.3 Record current selected squad.
- [ ] 4.3.3.4 Record final displayed squad.
- [ ] 4.3.3.5 Confirm selected and displayed squad match.

**Simulation Note:**
If the service uses local timers rather than HTTP requests,
DevTools Network may not show canceled fetch entries.
Instrument cancellation in the service or tests instead.
Do not claim network-level cancellation from absent entries.

### 4.4 Checkpoint 2D — Mobile-First & Performance

#### 4.4.1 Responsive Layout

- [ ] 4.4.1.1 Implement base layout at 320px.
- [ ] 4.4.1.2 Verify layout at 375px.
- [ ] 4.4.1.3 Add tablet enhancement at 768px.
- [ ] 4.4.1.4 Add desktop enhancement at 1024px.
- [ ] 4.4.1.5 Verify wide layout at 1440px.
- [ ] 4.4.1.6 Prevent horizontal overflow.
- [ ] 4.4.1.7 Preserve all required content on mobile.
- [ ] 4.4.1.8 Verify buttons remain touch-friendly.

#### 4.4.2 Slow 3G Skeleton Audit

- [ ] 4.4.2.1 Open Chrome DevTools.
- [ ] 4.4.2.2 Apply Slow 3G when using network requests.
- [ ] 4.4.2.3 Verify loading skeleton is observable.
- [ ] 4.4.2.4 Measure skeleton at 220px.
- [ ] 4.4.2.5 Inspect layout-shift markers.
- [ ] 4.4.2.6 Confirm no unexpected layout movement.
- [ ] 4.4.2.7 Record CLS reading if available.

**Performance Note:**
Slow 3G throttling affects actual network traffic.
For a timer-based mock, use configurable simulation
delay to reproduce the loading state. A 220px skeleton
alone does not guarantee a zero CLS score.

#### 4.4.3 Accessibility & Motion

- [ ] 4.4.3.1 Verify selector labels.
- [ ] 4.4.3.2 Verify role="alert" semantics.
- [ ] 4.4.3.3 Verify keyboard focus flow.
- [ ] 4.4.3.4 Verify Retry focus behavior.
- [ ] 4.4.3.5 Verify loading feedback is understandable.
- [ ] 4.4.3.6 Verify reduced-motion behavior.
- [ ] 4.4.3.7 Verify accessible color contrast.

### 4.5 Checkpoint 2E — Final Engineering QA

#### 4.5.1 Functional Regression

- [ ] 4.5.1.1 Verify all three squads.
- [ ] 4.5.1.2 Verify exact required telemetry values.
- [ ] 4.5.1.3 Verify four-state lifecycle.
- [ ] 4.5.1.4 Verify packet-loss simulation.
- [ ] 4.5.1.5 Verify retry recovery.
- [ ] 4.5.1.6 Verify rapid switching.
- [ ] 4.5.1.7 Verify AbortError is ignored.
- [ ] 4.5.1.8 Verify skeleton displays at 220px.
- [ ] 4.5.1.9 Verify no window.alert() usage.

#### 4.5.2 Source Audit

- [ ] 4.5.2.1 Verify useState and useEffect usage.
- [ ] 4.5.2.2 Verify AbortController is created per effect.
- [ ] 4.5.2.3 Verify cleanup calls abort().
- [ ] 4.5.2.4 Verify AbortError guard.
- [ ] 4.5.2.5 Verify dependency array [squadId, retryTick].
- [ ] 4.5.2.6 Verify immutable React state transitions.
- [ ] 4.5.2.7 Verify no unhandled Promise rejection.
- [ ] 4.5.2.8 Verify all imports and paths.

#### 4.5.3 Build & Delivery

- [ ] 4.5.3.1 Run npm run lint.
- [ ] 4.5.3.2 Run npm run build.
- [ ] 4.5.3.3 Inspect Chrome Console for errors.
- [ ] 4.5.3.4 Review requirement traceability.
- [ ] 4.5.3.5 Complete evidence register.
- [ ] 4.5.3.6 Update WBS once before Commit 2.
- [ ] 4.5.3.7 Stage only Exercise 3 files.
- [ ] 4.5.3.8 Run git diff --cached --check.
- [ ] 4.5.3.9 Inspect staged file scope.
- [ ] 4.5.3.10 Create Commit 2.
- [ ] 4.5.3.11 Verify two Exercise 3 commits.
- [ ] 4.5.3.12 Push to the required remote branch.

**COMMIT 2:**

`feat(ex3): add selection UI & retry alert`

---

## 5. Requirement Traceability & Evidence Register

| Evidence ID | Requirement | Verification Evidence | Status |
|---|---|---|---|
| EV-01 | React 19 environment | Vite 8.3.5 build output (21 modules, 204 ms); React 19 version command and lint not independently supplied | PARTIAL — build screenshot/text PASS |
| EV-02 | Lab02 inheritance | Reviewed Ex3 ZIP: state-machine.ts, App.tsx, App.css; documented requestId guard and no AbortController in legacy source | PASS — source review |
| EV-03 | Three-squad dataset | Console.table lists CES/TE/GE and correct values; 7/7 schema assertions true | PASS — user terminal output |
| EV-04 | Four-state lifecycle | JSX includes IDLE/LOADING/SUCCESS/ERROR; LOADING & SUCCESS observed, error service tested; UI ERROR/IDLE not separately verified | PARTIAL — source + screenshot |
| EV-05 | 35% packet-loss simulation | `PACKET_LOSS_RATE=0.35` code; forced SUCCESS and ERROR both output `true` | PASS — source + terminal output |
| EV-06 | AbortController | AbortSignal, cleanup implementation; forced ABORT outputs `true`; rapid switching/unmount pending | PARTIAL — source + terminal output |
| EV-07 | Blue-Zone skeleton 220px | DevTools reports skeletonExists=true, skeletonHeight=220, loadingState=true | PASS — screenshot |
| EV-08 | CES/TE/GE selector | Controlled UI interaction | PENDING |
| EV-09 | Retry recovery | ERROR → LOADING → SUCCESS | PENDING |
| EV-10 | Accessible error panel | role=alert inspection | PENDING |
| EV-11 | Rapid switch cancellation | CES → TE → GE test/logs | PENDING |
| EV-12 | No blocking alerts | Reviewed provided Stage 1 component contains no `window.alert()` calls; full final source audit pending | PARTIAL — code review |
| EV-13 | Slow 3G/layout stability | Performance audit | PENDING |
| EV-14 | Responsive 320–1440px | User confirmed `noHorizontalOverflow: true` across required widths; 375px screenshot provided | PASS — user-reported + screenshot |
| EV-15 | Keyboard and motion accessibility | Browser inspection | PENDING |
| EV-16 | Final build/lint | `npm run build`: PASS, Vite 8.3.5, 21 modules, 204ms; lint not evidenced | PARTIAL — build PASS, lint pending |
| EV-17 | Two atomic Git commits | Git log and staged scope | PENDING |

### 5.1 Evidence Integrity Rules

- Screenshot evidence and user-reported tests must be
  distinguished when recording results.
- Do not claim a test passed merely because code exists.
- Do not invent commit hashes or DevTools measurements.
- Do not claim packet-loss frequency is exactly 35%
  based on a small random sample.
- Do not claim Network-tab cancellation if no actual
  HTTP request is sent.
- Do not declare zero CLS without a valid measurement.

---

## 6. Bug Resolution Log

Record errors discovered during development.

| Bug ID | Checkpoint | Symptom | Root Cause | Resolution | Verified |
|---|---|---|---|---|---|
| — | — | No bugs recorded yet | — | — | — |

**Rule:** Only record genuine observed issues.
Do not invent bugs to populate this table.

---

## 7. Execution Protocol & Definition of Done

### 7.1 Per-Checkpoint Workflow

1. Implement only the current atomic subtask.
2. Explain the associated Lab02 inheritance concept.
3. Verify the actual behavior.
4. Record evidence or test result.
5. Continue to the next checkpoint.
6. Do not create unscheduled Git commits.

### 7.2 Pre-Commit Workflow

1. Finish all required work inside the commit boundary.
2. Update TASK_DECOMPOSITION.md once.
3. Run npm run lint and npm run build.
4. Review git status.
5. Stage Exercise 3 files only.
6. Check git diff --cached --check.
7. Inspect git diff --cached --stat.
8. Commit using the exact required message.
9. Verify hash and files using git log / git show.

Commit 1 must be completed before Stage 2 is committed.
Commit 2 must contain remaining required functionality.
Do not create a third Exercise 3 commit for documentation.

### 7.3 Final Acceptance Criteria

#### Data and Functionality

- [x] 7.3.1.1 Three required PUBG squads are present.
- [x] 7.3.1.2 Telemetry matches instructor dataset.
- [ ] 7.3.1.3 All four UI states are implemented.
- [x] 7.3.1.4 Simulated packet loss is 35%.
- [ ] 7.3.1.5 AbortController cancels obsolete requests.
- [ ] 7.3.1.6 Aborted requests never show false errors.
- [ ] 7.3.1.7 Retry can recover from failures.

#### Engineering

- [x] 7.3.2.1 Correct effect dependencies and cleanup.
- [ ] 7.3.2.2 No stale telemetry overwrites current squad.
- [x] 7.3.2.3 Loading skeleton is 220px.
- [ ] 7.3.2.4 Accessible error alert is implemented.
- [ ] 7.3.2.5 No window.alert() is used.
- [x] 7.3.2.6 Lab02 inheritance is documented accurately.

#### Accessibility and Performance

- [ ] 7.3.3.1 Keyboard navigation works.
- [x] 7.3.3.2 Mobile-first responsiveness passes.
- [x] 7.3.3.3 No horizontal overflow.
- [ ] 7.3.3.4 Loading layout stability verified.
- [ ] 7.3.3.5 Reduced-motion preference supported.

#### Git and Delivery

- [ ] 7.3.4.1 Commit 1 verified.
- [ ] 7.3.4.2 Commit 2 verified.
- [ ] 7.3.4.3 Exactly two Ex3-scoped commits confirmed.
- [ ] 7.3.4.4 Final lint and build PASS.
- [ ] 7.3.4.5 Changes pushed to remote repository.

---

## 8. Current Progress Snapshot

**Stage 1A:** Vite dev/build demonstrated; React version command, `.gitignore` audit, and lint evidence pending.
**Stage 1B:** Lab02 Ex3 source audit completed and inheritance matrix corrected to distinguish requestId guard from cancellation.
**Stage 1C:** PUBG_VN_SQUADS complete; `console.table` and 7/7 assertions PASS.
**Stage 1D:** Simulated API implemented; deterministic SUCCESS/ERROR/ABORT PASS. Unknown-ID, repeated-abort/stress/leak testing pending.
**Stage 1E:** React component and effect cleanup implemented; LOADING and SUCCESS screenshot verified; UI ERROR/IDLE and real squad switch/unmount not yet tested.
**Stage 1F:** Blue-Zone skeleton rendered and measured 220px; responsive no-overflow confirmed by user. Reduced-motion/contrast and CLS measurement still pending.

**Commit 1:** PENDING — WBS revision prepared; lint, scope/diff and Git commit verification remain.
**Stage 2:** PENDING.
**Commit 2:** PENDING.

**Next Action (before Commit 1):** Run `npm run lint` and provide PASS evidence; optionally force ERROR UI once for complete 4-state runtime coverage; inspect `.gitignore` and `git status --short`; stage only Exercise 3 files; run `git diff --cached --check` and `git diff --cached --stat`. Create Commit 1 only after confirming the quality gate. Stage 2 selector/retry and rapid-switch verification remain pending.

---

**End of TASK_DECOMPOSITION.md — Lab03 Exercise 3**
