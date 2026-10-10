# Lab 02 — Exercise 3: Task Decomposition

**Exercise:** Resilient State Machine & Skeleton Loader  
**Sprint:** In-Class Sprint 3 — 35 Minutes  
**Technology:** React, TypeScript, CSS  
**Accessibility Target:** WCAG 2.0 Level AA  
**Status:** Functional Implementation Completed — Final Audit

## 1. Objective and Scope

Implement a resilient asynchronous data component with four strictly defined states: IDLE, LOADING, SUCCESS, and ERROR.

The solution must prevent stale requests from overwriting newer results, display a pulsing CSS skeleton during loading, provide a readable error message, and allow users to retry failed requests.

No backend, database, authentication, or unrelated features are required.

## 2. Requirement Traceability

| ID | Instructor Requirement | WBS | Status |
|---|---|---|---|
| R1 | Prevent race conditions and inconsistent UI | 2, 3 | PASS |
| R2 | Strict four-state lifecycle | 1, 2 | PASS |
| R3 | Animated pulsing skeleton during LOADING | 4 | PASS |
| R4 | Readable ERROR and Retry Connection | 5 | PASS |
| R5 | Mandatory Git milestone commit | 6 | Pending commit |
| A1 | Relevant WCAG 2.0 AA checks | 7 | Final review |

## 3. WBS 1 — Strict Four-State Machine

- [x] 1.1 Set up React + TypeScript using Vite.
- [x] 1.2 Create `src/state-machine.ts`.
- [x] 1.3 Define the generic `ViewState<T>` type.
- [x] 1.4 Define `IDLE` without data or error.
- [x] 1.5 Define `LOADING` without data or error.
- [x] 1.6 Define `SUCCESS` with typed data.
- [x] 1.7 Define `ERROR` with an error message.
- [x] 1.8 Use TypeScript discriminated unions to restrict valid state shapes.
- [x] 1.9 Initialize the component in IDLE.

**Result:** PASS — The application uses the required four-state model.

## 4. WBS 2 — Asynchronous Lifecycle

- [x] 2.1 Implement the asynchronous `loadData()` function.
- [x] 2.2 Enter LOADING before awaiting data.
- [x] 2.3 Await the asynchronous operation.
- [x] 2.4 Transition to SUCCESS when data is returned.
- [x] 2.5 Transition to ERROR when loading fails.
- [x] 2.6 Store a readable message in ERROR.
- [x] 2.7 Render content according to the current state.
- [x] 2.8 Verify the IDLE → LOADING → ERROR lifecycle.
- [x] 2.9 Verify ERROR → LOADING → SUCCESS through retry.

**Result:** PASS — All four states were demonstrated in the browser.

## 5. WBS 3 — Race Condition Prevention

- [x] 3.1 Create a request identifier using `useRef`.
- [x] 3.2 Increment the identifier for each request.
- [x] 3.3 Associate each request with its identifier.
- [x] 3.4 Compare the completed request identifier with the latest identifier.
- [x] 3.5 Ignore results belonging to outdated requests.
- [x] 3.6 Prevent an outdated request from replacing newer state.
- [x] 3.7 Execute a two-request concurrency test.
- [x] 3.8 Verify that only the newest request is accepted.
- [x] 3.9 Remove temporary testing buttons and console logs from the final implementation.

**Observed Console Result:**

`Started request: 1`

`Started request: 2`

`Accepted request: 2`

**Result:** PASS — The observed test confirms stale-request rejection. A separately controlled reverse-completion-order test was not performed.

## 6. WBS 4 — Skeleton Loader

- [x] 4.1 Create the loading skeleton structure.
- [x] 4.2 Display the skeleton during LOADING.
- [x] 4.3 Implement the CSS pulse animation.
- [x] 4.4 Display readable loading status text.
- [x] 4.5 Use `role="status"` for loading feedback.
- [x] 4.6 Mark decorative skeleton elements with `aria-hidden="true"`.
- [x] 4.7 Stop rendering the skeleton after the loading state ends.
- [x] 4.8 Include a reduced-motion CSS preference.

**Result:** PASS — Pulsing skeleton feedback appears during LOADING.

## 7. WBS 5 — Error Handling and Retry

- [x] 5.1 Catch asynchronous errors.
- [x] 5.2 Transition to ERROR after a failed request.
- [x] 5.3 Display a human-readable error message.
- [x] 5.4 Expose the error through `role="alert"`.
- [x] 5.5 Render the `Retry Connection` button.
- [x] 5.6 Trigger another loading attempt when Retry is activated.
- [x] 5.7 Transition from ERROR back to LOADING.
- [x] 5.8 Display SUCCESS after a successful retry.
- [x] 5.9 Render the returned items.

**Observed Result:** First simulated attempt fails; retry succeeds and displays `Review PR` and `Verify AST`.

**Result:** PASS.

## 8. WBS 6 — Quality Verification and Git

### 6.1 Build and Code Quality

- [x] 6.1.1 Confirm the Vite development server starts.
- [x] 6.1.2 Verify the application renders in Chrome.
- [x] 6.1.3 Run the production build.
- [x] 6.1.4 Confirm the build completes successfully.
- [ ] 6.1.5 Independently confirm `npm run lint` completes without errors.
- [ ] 6.1.6 Independently confirm the TypeScript-only check completes without errors.

**Observed Build Result:** Vite production build completed successfully, with 17 modules transformed.

### 6.2 Mandatory Commit

- [ ] 6.2.1 Confirm final implementation excludes temporary test controls.
- [ ] 6.2.2 Stage the Exercise 3 source and configuration files.
- [ ] 6.2.3 Exclude `node_modules` and `dist`.
- [ ] 6.2.4 Create the mandatory Git commit.
- [ ] 6.2.5 Verify the commit in Git history.

**Required Commit:**

`feat(ui): implement multi-state data component with skeleton feedback`

## 9. WBS 7 — WCAG 2.0 Level AA Review

### 7.1 Perceivable

- [x] 7.1.1 Use semantic headings and sections (1.3.1).
- [x] 7.1.2 Preserve meaningful reading order (1.3.2).
- [x] 7.1.3 Communicate lifecycle states using text, not only color (1.4.1).
- [ ] 7.1.4 Confirm text contrast meets the applicable ratios (1.4.3).
- [ ] 7.1.5 Confirm text can be resized to 200% without loss (1.4.4).

### 7.2 Operable

- [x] 7.2.1 Use native buttons for Load Data, Retry and Reload (2.1.1).
- [x] 7.2.2 Implement visible CSS focus styling (2.4.7).
- [x] 7.2.3 Respect the user's reduced-motion preference.
- [ ] 7.2.4 Confirm Enter and Space keyboard activation (2.1.1).
- [ ] 7.2.5 Confirm no keyboard traps (2.1.2).
- [ ] 7.2.6 Confirm logical keyboard focus order (2.4.3).

### 7.3 Understandable

- [x] 7.3.1 Provide the page's primary language attribute (3.1.1).
- [x] 7.3.2 Provide readable status and error messages.
- [ ] 7.3.3 Confirm the final page title describes the application (2.4.2).
- [ ] 7.3.4 Confirm focus does not unexpectedly change context (3.2.1).

### 7.4 Robust

- [x] 7.4.1 Use native controls with programmatically identifiable names (4.1.2).
- [x] 7.4.2 Implement status and alert semantics.
- [ ] 7.4.3 Complete a final DOM validity check (4.1.1).
- [ ] 7.4.4 Confirm loading and error announcements with an appropriate accessibility inspection.

**Accessibility Status:** Core accessibility features implemented; remaining manual checks have not been independently confirmed.

**Conformance Note:** The exercise-level checklist does not constitute a formal WCAG 2.0 Level AA conformance audit.

## 10. WBS 8 — Screenshots and Report

- [x] 8.1 Capture IDLE.
- [x] 8.2 Capture LOADING with skeleton.
- [x] 8.3 Capture ERROR with Retry Connection.
- [x] 8.4 Capture SUCCESS with loaded items.
- [x] 8.5 Capture race-condition Console output.
- [x] 8.6 Capture successful build output.
- [ ] 8.7 Finalize the short evidence-based report.

## 11. Final Acceptance Summary

| Requirement | Status |
|---|---|
| Four-state lifecycle | PASS |
| Async state transitions | PASS |
| Skeleton loader | PASS |
| Error and Retry | PASS |
| Stale-request protection | PASS for observed test |
| Production build | PASS |
| ESLint and separate TypeScript checks | Awaiting confirmation |
| WCAG exercise-level audit | Final manual checks pending |
| Mandatory Git commit | Pending |
| Screenshot evidence | Captured |

**Final Implementation Status:** Core implementation completed. Final checks, documentation, and Git commit remain.

**Reference:** https://www.w3.org/TR/WCAG20/