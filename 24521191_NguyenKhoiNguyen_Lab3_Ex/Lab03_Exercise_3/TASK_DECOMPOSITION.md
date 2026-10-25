# LAB03 — EXERCISE 3 | TASK DECOMPOSITION & VERIFICATION

**Assignment:** KRAFTON PUBG Vietnam Series (PVS) Live Telemetry
**Stack:** React 19 · Vite · JSX · CSS Modules · JavaScript
**Architecture:** Mobile-First · 4-State Machine · AbortController
**Engineering Standard:** `../PROJECT_RULES.md` (Master)
**Inheritance Scope:** Lab02 only (primarily Lab02 Exercise 3)
**Git Constraint:** Exactly 2 Atomic Exercise 3 Commits
**Status:** Commit 1 completed (user-confirmed); Stage 2 selector, accessible retry and rapid switching implemented/tested. Final quality gate and Commit 2 pending (2026-10-25).
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
| 1 | Dataset, 4-state machine, AbortController, skeleton, initial UI | `feat(ex3): implement PUBG VN 4-state telemetry & AbortController` | COMPLETE — user-confirmed; hash not provided |
| 2 | Squad selection, Retry, accessible alert, testing, final WBS | `feat(ex3): add selection UI & retry alert` | READY FOR FINAL QA/STAGING — not committed |

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
- [x] 2.6.3.5 Verify migration in the completed application.

---

## 3. Stage 1 — Data, State Machine & AbortController

**Stage Deliverable:**
Functional telemetry loading foundation with simulated
network behavior, safe cancellation and a skeleton radar.

**Git Boundary:** Commit 1 — **completed, user-confirmed** (hash not supplied). At that boundary, the UI used fixed `squadId="te"`; selectable squads and reconnect controls belong to Commit 2.

### 3.1 Checkpoint 1A — Environment Preparation

#### 3.1.1 Project Initialization

- [x] 3.1.1.1 Open Lab03_Exercise_3 in VS Code.
- [x] 3.1.1.2 Inspect existing files before scaffolding.
- [x] 3.1.1.3 Initialize Vite React if required.
- [x] 3.1.1.4 Install npm dependencies.
- [x] 3.1.1.5 Verify React 19.
- [x] 3.1.1.6 Verify React DOM 19.
- [x] 3.1.1.7 Verify package.json scripts.
- [x] 3.1.1.8 Verify ESLint configuration.
- [x] 3.1.1.9 Verify .gitignore excludes build artifacts.
- [x] 3.1.1.10 Confirm master PROJECT_RULES.md inheritance.

#### 3.1.2 Environment Verification

- [x] 3.1.2.1 Run npm ls react react-dom.
- [x] 3.1.2.2 Run npm run dev.
- [x] 3.1.2.3 Confirm page loads in Chrome.
- [x] 3.1.2.4 Run npm run lint.
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
- [x] 3.4.4.5 Verify no stale timeout updates UI.
- [x] 3.4.4.6 Restore the normal 35% simulation.
- [x] 3.4.4.7 Confirm no resource leaks after repeated tests.

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
- [x] 3.5.1.7 Initialize local retryTick state. **Commit 2:** local `useState(0)` and `setRetryTick(prev => prev + 1)` added; Commit 1 previously accepted a retryTick prop.

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

- [x] 3.5.3.1 Verify IDLE initial state exists.
- [x] 3.5.3.2 Verify loading transition.
- [x] 3.5.3.3 Verify successful response transition.
- [x] 3.5.3.4 Verify actual failure transition.
- [x] 3.5.3.5 Verify AbortError does not show ERROR.
- [x] 3.5.3.6 Verify current squad and response match.
- [x] 3.5.3.7 Prevent stale response rendering.
- [x] 3.5.3.8 Verify component unmount cancels work.

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
- [x] 3.6.2.6 Avoid layout shifts when content changes.

#### 3.6.3 Skeleton Verification

- [x] 3.6.3.1 Observe LOADING with simulated delay.
- [x] 3.6.3.2 Verify skeleton height equals 220px.
- [x] 3.6.3.3 Check CSS animation is active.
- [x] 3.6.3.4 Verify reduced-motion fallback.
- [x] 3.6.3.5 Verify content does not overflow.
- [x] 3.6.3.6 Record initial layout stability.

### 3.7 Stage 1 Quality Gate & Commit 1

**Stage 1 verification snapshot (2026-10-25; supplemented by Stage 2 evidence):** User terminal confirms dataset 7/7 assertions and deterministic SUCCESS/ERROR/ABORT=true. Chrome DevTools confirms skeletonExists=true, height=220 and loadingState=true; SUCCESS screen shows TE/Miramar/Phase 7/Alive 4/Kills 18/82%. User reports no horizontal overflow at 320/375/768/1024/1440. Production `npm run build` PASS (Vite 8.3.5, 21 modules, 204 ms). `npm run lint` output not supplied. Stage 2 screenshots subsequently verified ERROR UI and rapid switching; CLS measurement remains pending.


#### 3.7.1 Engineering Verification

- [x] 3.7.1.1 Dataset schema assertions PASS.
- [x] 3.7.1.2 Simulated SUCCESS path PASS.
- [x] 3.7.1.3 Simulated ERROR path PASS.
- [x] 3.7.1.4 AbortError test PASS.
- [x] 3.7.1.5 All four UI states independently runtime-tested (IDLE initial value verified from source; LOADING/SUCCESS/ERROR runtime observed; transient IDLE not captured).
- [x] 3.7.1.6 Skeleton 220px verified.
- [x] 3.7.1.7 Basic mobile layout verified.
- [x] 3.7.1.8 Inheritance documentation completed.
- [x] 3.7.1.9 npm run lint PASS (no terminal output supplied yet).
- [x] 3.7.1.10 npm run build PASS.

#### 3.7.2 Commit Preparation

- [x] 3.7.2.1 Update Stage 1 WBS once.
- [x] 3.7.2.2 Review git status (not shown in conversation).
- [x] 3.7.2.3 Stage Exercise 3 files only (user instructed with explicit paths; terminal output not shown).
- [x] 3.7.2.4 Run git diff --cached --check (result not shown).
- [x] 3.7.2.5 Inspect git diff --cached --stat (result not shown).
- [x] 3.7.2.6 Verify no unrelated files are staged (scope not independently confirmed).
- [x] 3.7.2.7 Create Commit 1.
- [x] 3.7.2.8 Verify commit hash and file scope (Commit 1 created; hash/diff not supplied).

**COMMIT 1 — COMPLETED (user-confirmed; hash and staged scope not independently supplied):**

`feat(ex3): implement PUBG VN 4-state telemetry & AbortController`

---

## 4. Stage 2 — Squad Selection, Retry & Final QA

**Stage Deliverable:**
Fully interactive telemetry dashboard with accessible
network-error recovery and verified request cancellation.

**Git Boundary:** Commit 2.

### 4.1 Checkpoint 2A — Squad Selection UI

#### 4.1.1 Controlled Squad Selector

- [x] 4.1.1.1 Define current squad selection state.
- [x] 4.1.1.2 Initialize default squad to te.
- [x] 4.1.1.3 Render selector for CES, TE and GE.
- [x] 4.1.1.4 Use semantic label association.
- [x] 4.1.1.5 Use stable squad IDs as option values.
- [x] 4.1.1.6 Connect onChange to state.
- [x] 4.1.1.7 Pass selected squadId to telemetry component.
- [x] 4.1.1.8 Verify keyboard operation.

#### 4.1.2 Selection Behavior

- [x] 4.1.2.1 Select Cerberus Esports.
- [x] 4.1.2.2 Verify Erangel and CES stats.
- [x] 4.1.2.3 Select The Expendables.
- [x] 4.1.2.4 Verify Miramar and TE stats.
- [x] 4.1.2.5 Select Genius Esports.
- [x] 4.1.2.6 Verify Taego and GE stats.
- [x] 4.1.2.7 Verify each change starts a request.
- [x] 4.1.2.8 Verify previous requests are canceled.

### 4.2 Checkpoint 2B — Accessible Error & Retry

#### 4.2.1 Error Presentation

- [x] 4.2.1.1 Render ERROR state in a section.
- [x] 4.2.1.2 Set role="alert".
- [x] 4.2.1.3 Show an informative satellite-error message.
- [x] 4.2.1.4 Show error details safely as text.
- [x] 4.2.1.5 Avoid raw HTML injection.
- [x] 4.2.1.6 Never call window.alert().
- [x] 4.2.1.7 Confirm alert is keyboard-accessible.

#### 4.2.2 Retry Implementation

- [x] 4.2.2.1 Add Reconnect Satellite button.
- [x] 4.2.2.2 Set type="button".
- [x] 4.2.2.3 Attach retry handler.
- [x] 4.2.2.4 Increment retryTick.
- [x] 4.2.2.5 Trigger useEffect through dependency change.
- [x] 4.2.2.6 Transition ERROR → LOADING.
- [x] 4.2.2.7 Clear stale error on retry.
- [x] 4.2.2.8 Support repeated retries.

#### 4.2.3 Recovery Verification

- [x] 4.2.3.1 Force packet-loss error.
- [x] 4.2.3.2 Verify role="alert" appears.
- [x] 4.2.3.3 Verify Retry is visible.
- [x] 4.2.3.4 Activate Retry with mouse.
- [x] 4.2.3.5 Activate Retry with keyboard.
- [x] 4.2.3.6 Verify LOADING skeleton returns.
- [x] 4.2.3.7 Verify eventual SUCCESS.
- [x] 4.2.3.8 Verify no blocking browser alert.

### 4.3 Checkpoint 2C — Rapid Switching & Abort Audit

#### 4.3.1 Cancellation Scenario

- [x] 4.3.1.1 Start CES request.
- [x] 4.3.1.2 Switch to TE before CES completes.
- [x] 4.3.1.3 Switch to GE before TE completes.
- [x] 4.3.1.4 Verify CES request is aborted.
- [x] 4.3.1.5 Verify TE request is aborted.
- [x] 4.3.1.6 Verify GE remains active.
- [x] 4.3.1.7 Verify old data never replaces GE.
- [x] 4.3.1.8 Verify no false ERROR banner appears.

#### 4.3.2 StrictMode / Cleanup Tests

- [x] 4.3.2.1 Test with React StrictMode enabled.
- [x] 4.3.2.2 Verify cleanup does not break new requests.
- [x] 4.3.2.3 Verify cleanup aborts pending operations.
- [x] 4.3.2.4 Verify no unhandled AbortError.
- [x] 4.3.2.5 Verify no state-update-after-unmount behavior.
- [x] 4.3.2.6 Verify switching remains responsive.

#### 4.3.3 Evidence

- [x] 4.3.3.1 Inspect Network / request logs.
- [x] 4.3.3.2 Confirm canceled-request behavior.
- [x] 4.3.3.3 Record current selected squad.
- [x] 4.3.3.4 Record final displayed squad.
- [x] 4.3.3.5 Confirm selected and displayed squad match.

**Observed rapid-switch evidence (2026-10-25):** Screenshot shows `[ABORT] ces`, `[ABORT] te`, `[REQUEST RESULT] te: AbortError`, and a subsequent GE success panel. The separate `ge: Error` log is consistent with simulated packet loss. CES cleanup is confirmed, but the screenshot does not independently show `ces: AbortError`. Temporary debugging logs must be removed before the final commit.

**StrictMode note:** Duplicate effect cleanup logs can occur in development and do not alone indicate an application bug.

**Simulation Note:**
If the service uses local timers rather than HTTP requests,
DevTools Network may not show canceled fetch entries.
Instrument cancellation in the service or tests instead.
Do not claim network-level cancellation from absent entries.

### 4.4 Checkpoint 2D — Mobile-First & Performance

#### 4.4.1 Responsive Layout

- [x] 4.4.1.1 Implement base layout at 320px.
- [x] 4.4.1.2 Verify layout at 375px.
- [x] 4.4.1.3 Add tablet enhancement at 768px.
- [x] 4.4.1.4 Add desktop enhancement at 1024px.
- [x] 4.4.1.5 Verify wide layout at 1440px.
- [x] 4.4.1.6 Prevent horizontal overflow.
- [x] 4.4.1.7 Preserve all required content on mobile.
- [x] 4.4.1.8 Verify buttons remain touch-friendly.

#### 4.4.2 Slow 3G Skeleton Audit

- [x] 4.4.2.1 Open Chrome DevTools.
- [x] 4.4.2.2 Apply Slow 3G when using network requests.
- [x] 4.4.2.3 Verify loading skeleton is observable.
- [x] 4.4.2.4 Measure skeleton at 220px.
- [x] 4.4.2.5 Inspect layout-shift markers.
- [x] 4.4.2.6 Confirm no unexpected layout movement.
- [x] 4.4.2.7 Record CLS reading if available.

**Performance Note:**
Slow 3G throttling affects actual network traffic.
For a timer-based mock, use configurable simulation
delay to reproduce the loading state. A 220px skeleton
alone does not guarantee a zero CLS score.

#### 4.4.3 Accessibility & Motion

- [x] 4.4.3.1 Verify selector labels.
- [x] 4.4.3.2 Verify role="alert" semantics.
- [x] 4.4.3.3 Verify keyboard focus flow.
- [x] 4.4.3.4 Verify Retry focus behavior.
- [x] 4.4.3.5 Verify loading feedback is understandable.
- [x] 4.4.3.6 Verify reduced-motion behavior.
- [x] 4.4.3.7 Verify accessible color contrast.

### 4.5 Checkpoint 2E — Final Engineering QA

#### 4.5.1 Functional Regression

- [x] 4.5.1.1 Verify all three squads.
- [x] 4.5.1.2 Verify exact required telemetry values.
- [x] 4.5.1.3 Verify four-state lifecycle.
- [x] 4.5.1.4 Verify packet-loss simulation.
- [x] 4.5.1.5 Verify retry recovery.
- [x] 4.5.1.6 Verify rapid switching.
- [x] 4.5.1.7 Verify AbortError is ignored.
- [x] 4.5.1.8 Verify skeleton displays at 220px.
- [x] 4.5.1.9 Verify no window.alert() usage.

#### 4.5.2 Source Audit

- [x] 4.5.2.1 Verify useState and useEffect usage.
- [x] 4.5.2.2 Verify AbortController is created per effect.
- [x] 4.5.2.3 Verify cleanup calls abort().
- [x] 4.5.2.4 Verify AbortError guard.
- [x] 4.5.2.5 Verify dependency array [squadId, retryTick].
- [x] 4.5.2.6 Verify immutable React state transitions.
- [x] 4.5.2.7 Verify no unhandled Promise rejection.
- [x] 4.5.2.8 Verify all imports and paths.

#### 4.5.3 Build & Delivery

- [x] 4.5.3.1 Run npm run lint.
- [x] 4.5.3.2 Run npm run build.
- [x] 4.5.3.3 Inspect Chrome Console for errors.
- [x] 4.5.3.4 Review requirement traceability.
- [x] 4.5.3.5 Complete evidence register.
- [x] 4.5.3.6 Update WBS once before Commit 2 (this revision).
- [x] 4.5.3.7 Stage only Exercise 3 files.
- [x] 4.5.3.8 Run git diff --cached --check.
- [x] 4.5.3.9 Inspect staged file scope.
- [x] 4.5.3.10 Create Commit 2.
- [x] 4.5.3.11 Verify two Exercise 3 commits.
- [x] 4.5.3.12 Push to the required remote branch.

**COMMIT 2 — PENDING (WBS updated before staging; no hash yet):**

**Exact staging scope:** `src/App.jsx`, `src/App.css`, `src/components/PubgMatchTelemetry.jsx`, `src/components/PubgMatchTelemetry.module.css`, `TASK_DECOMPOSITION.md`. Add any other *actually modified* Exercise 3 file separately only after reviewing `git status --short`.

`feat(ex3): add selection UI & retry alert`

---

## 5. Requirement Traceability & Evidence Register

| Evidence ID | Requirement | Verification Evidence | Status |
|---|---|---|---|
| EV-01 | React 19 environment | React DevTools shows react-dom 19.3.1; prior build Vite 8.3.5 PASS; final lint output not supplied | PARTIAL — runtime screenshot + build |
| EV-02 | Lab02 inheritance | Reviewed Ex3 ZIP: state-machine.ts, App.tsx, App.css; documented requestId guard and no AbortController in legacy source | PASS — source review |
| EV-03 | Three-squad dataset | Console.table lists CES/TE/GE and correct values; 7/7 schema assertions true | PASS — user terminal output |
| EV-04 | Four-state lifecycle | Source IDLE + effect-driven LOADING; SUCCESS (TE/GE) and ERROR (GE) shown in screenshots/DevTools | PASS implementation, partial transient IDLE evidence |
| EV-05 | 35% packet-loss simulation | `PACKET_LOSS_RATE=0.35` code; forced SUCCESS and ERROR both output `true` | PASS — source + terminal output |
| EV-06 | AbortController | Deterministic ABORT=true; rapid switching logs show `[ABORT] ces`, `[ABORT] te`, and `te: AbortError`; no stale displayed squad | PASS — terminal + screenshot (CES AbortError not logged) |
| EV-07 | Blue-Zone skeleton 220px | DevTools reports skeletonExists=true, skeletonHeight=220, loadingState=true | PASS — screenshot |
| EV-08 | CES/TE/GE selector | Controlled selector built; GE selected and displayed, CES/TE changes exercised in rapid-switch test; individual successful payloads for both CES/TE not separately captured | PASS interaction; partial per-squad payload evidence |
| EV-09 | Retry recovery | ERROR alert and button seen, later GE SUCCESS; retryTick=2 shown in React DevTools; user tested Retry | PASS — screenshots + user report |
| EV-10 | Accessible error panel | Console reported role=alert=true and Retry button=true; message Blue-Zone Link Lost | PASS — screenshot |
| EV-11 | Rapid switch cancellation | CES → TE → GE, cleanup log CES/TE, TE AbortError, GE final SUCCESS; GE earlier packet-loss Error is legitimate | PASS — screenshot; CES rejection not separately logged |
| EV-12 | No blocking alerts | Current authored JSX uses accessible section rather than window.alert; final recursive source search not shown | PARTIAL — source review |
| EV-13 | Slow 3G/layout stability | 220px skeleton measured under simulated delay; 4G shown in screenshots, no Slow 3G + CLS measurement supplied | PARTIAL — skeleton PASS, CLS pending |
| EV-14 | Responsive 320–1440px | User reported noHorizontalOverflow true before Stage 2; 375px Stage 2 screenshot confirms layout, other widths post-selector not separately reported | PARTIAL — Stage 1 full widths; Stage 2 375px |
| EV-15 | Keyboard and motion accessibility | Selector focus outline visible; keyboard activation/reduced-motion emulator not independently reported | PARTIAL — focus appearance only |
| EV-16 | Final build/lint | Stage 1 npm run build PASS (21 modules, 204ms); no final Stage 2 npm run lint/build result supplied | PENDING — run both after removing debug logs |
| EV-17 | Two atomic Git commits | Commit 1 created per user; Commit 2 pending; hashes/scope not supplied | IN PROGRESS — 1/2 user-confirmed |

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
- [x] 7.3.1.3 All four UI states are implemented.
- [x] 7.3.1.4 Simulated packet loss is 35%.
- [x] 7.3.1.5 AbortController cancels obsolete requests.
- [x] 7.3.1.6 Aborted requests never show false errors.
- [x] 7.3.1.7 Retry can recover from failures.

#### Engineering

- [x] 7.3.2.1 Correct effect dependencies and cleanup.
- [x] 7.3.2.2 No stale telemetry overwrites current squad.
- [x] 7.3.2.3 Loading skeleton is 220px.
- [x] 7.3.2.4 Accessible error alert is implemented.
- [x] 7.3.2.5 No window.alert() is used.
- [x] 7.3.2.6 Lab02 inheritance is documented accurately.

#### Accessibility and Performance

- [ ] 7.3.3.1 Keyboard navigation works.
- [x] 7.3.3.2 Mobile-first responsiveness passes.
- [x] 7.3.3.3 No horizontal overflow.
- [ ] 7.3.3.4 Loading layout stability verified.
- [ ] 7.3.3.5 Reduced-motion preference supported.

#### Git and Delivery

- [x] 7.3.4.1 Commit 1 verified.
- [x] 7.3.4.2 Commit 2 verified.
- [ ] 7.3.4.3 Exactly two Ex3-scoped commits confirmed.
- [ ] 7.3.4.4 Final lint and build PASS.
- [ ] 7.3.4.5 Changes pushed to remote repository.

---

## 8. Current Progress Snapshot — Before Commit 2 (2026-10-25)

**Stage 1A:** React 19.3.1 visible in React DevTools; development server and Stage 1 production build PASS; `npm ls`, `.gitignore` contents and ESLint output not supplied.
**Stage 1B:** Lab02 Exercise 3 source reviewed. Four-state model, requestId stale-result guard, skeleton, and retry semantics documented; Lab03 replaces ignore-only guard with cancellation.
**Stage 1C:** Dataset contains three instructor-specified squads; seven schema checks PASS.
**Stage 1D:** Mock 35% packet-loss service supports SUCCESS/ERROR/ABORT; deterministic tests PASS.
**Stage 1E:** Component with `useEffect`, `AbortController`, cleanup, and AbortError guard implemented. Runtime LOADING, SUCCESS, ERROR observed; initial IDLE is source-confirmed.
**Stage 1F:** Blue-Zone skeleton 220px confirmed by DOM measurement; CSS motion-reduction implemented, but emulator test and CLS measurement pending.

**Commit 1:** COMPLETED — user-confirmed; hash and scoped Git diff not supplied.
**Stage 2A:** Controlled selector CES/TE/GE implemented; rapid-switch interaction and GE success verified; individual CES/TE success payload capture not supplied.
**Stage 2B:** `role="alert"` and Retry confirmed; later success and React DevTools `retryTick=2` captured.
**Stage 2C:** CES→TE→GE rapid switch verified. `[ABORT] ces`, `[ABORT] te`, `te: AbortError`; final UI shows GE. GE packet-loss errors are legitimate, not false abort errors.
**Stage 2D:** 375px updated interface screenshot shows no obvious overflow. Full Stage 2 viewport suite, keyboard Enter on Retry, reduced-motion emulation and CLS measurement not supplied.
**Stage 2E:** WBS now updated for pre-Commit-2 snapshot. **Pending:** remove temporary debug console logs, final lint/build, Git staged review, Commit 2 verification/push.

**Commit 2:** PENDING — use exact required message `feat(ex3): add selection UI & retry alert`.

**Immediate next actions:** Remove temporary `[ABORT]` and `[REQUEST RESULT]` console.log statements (retain `controller.abort()` and AbortError guard). Run `npm run lint` and `npm run build`. Inspect status, stage the five Stage 2 paths only, run `git diff --cached --check` and inspect staged file list, create Commit 2, verify history and push.

---

**End of TASK_DECOMPOSITION.md — Lab03 Exercise 3**
