# Lab 02 — Exercise 2: Task Decomposition

**Exercise:** Reactive State Machine & Delegation Hub  
**Sprint:** In-Class Sprint 2 — 40 Minutes  
**Accessibility Target:** WCAG 2.0 Level AA  
**Workflow:** Requirement-Based WBS → Incremental Implementation → Verification → Report

## 1. Objective and Scope

Build a reactive Task Manager using a custom `useState` implementation and a root Event Delegation Hub.

The implementation must support state persistence across renders, UI-triggered state updates, dynamic task filtering, and unidirectional data flow.

**In scope:**
- External state store and render cursor.
- Closure-based `useState` dispatcher.
- State updates and re-rendering.
- Root event delegation.
- Reactive Task Manager with dynamic filters.
- Checkpoint 2 verification.
- Four required atomic Git commits.
- Applicable WCAG 2.0 Level AA accessibility checks.

**Out of scope:**
- External state libraries.
- Database integration.
- Authentication.
- Backend APIs.
- Unrequested Task Manager features.
- External UI frameworks or JSX tooling unless separately authorized.

## 2. Requirement Traceability Matrix

| ID | Instructor Requirement | WBS |
|---|---|---|
| R1 | Custom `useState` closure engine | 1, 2 |
| R2 | Root Event Delegation Hub | 3 |
| R3 | Reactive Task Manager with filter toggles | 4 |
| R4 | Four mandatory Git commits | 5 |
| R5 | UI mutation and zero orphan listeners | 6 |
| A1 | WCAG 2.0 Level AA accessibility | 7 |

## 3. WBS 1 — State Store and Cursor Engine

**Source:** R1 — Custom state engine.

### 1.1 External State Storage

- [ ] 1.1.1 Create `reactive-engine.js`.
- [ ] 1.1.2 Declare the external `stateStore` array.
- [ ] 1.1.3 Declare the state cursor.
- [ ] 1.1.4 Preserve state values outside component execution.

### 1.2 Cursor Management

- [ ] 1.2.1 Implement `resetCursor()`.
- [ ] 1.2.2 Reset the cursor at the beginning of a render.
- [ ] 1.2.3 Ensure state slots maintain consistent hook ordering.
- [ ] 1.2.4 Verify state indexing remains deterministic.

**Acceptance:** State persists across render executions, and the cursor starts from zero on every render pass.

## 4. WBS 2 — Reactive useState Dispatcher

**Source:** R1 — Closure-based `useState`.

### 2.1 Hook Initialization

- [ ] 2.1.1 Implement and export `useState(initialValue)`.
- [ ] 2.1.2 Read the current cursor position.
- [ ] 2.1.3 Initialize a state slot if it has no assigned value.
- [ ] 2.1.4 Preserve previously assigned state values.
- [ ] 2.1.5 Increment the cursor after each hook call.
- [ ] 2.1.6 Return the current value and setter.

### 2.2 Closure-Based Setter

- [ ] 2.2.1 Create a setter that captures its state index.
- [ ] 2.2.2 Support direct replacement values.
- [ ] 2.2.3 Support functional updater callbacks.
- [ ] 2.2.4 Evaluate functional updates using the previous value.
- [ ] 2.2.5 Compare previous and next values using `Object.is`.
- [ ] 2.2.6 Avoid re-rendering when the state value has not changed.

### 2.3 Render Dispatcher

- [ ] 2.3.1 Implement a render trigger.
- [ ] 2.3.2 Re-execute the application function when state changes.
- [ ] 2.3.3 Reset cursor position before re-execution.
- [ ] 2.3.4 Produce the updated VNode tree.
- [ ] 2.3.5 Synchronize the updated tree with the application DOM.

**Acceptance:** UI events update the intended state slot and produce an updated interface without losing other state values.

## 5. WBS 3 — Root Event Delegation Hub

**Source:** R2 — Root event delegation.

### 3.1 Root Listener

- [ ] 3.1.1 Identify the application root container.
- [ ] 3.1.2 Create the root Event Delegation Hub.
- [ ] 3.1.3 Attach the required click event listener to the root.
- [ ] 3.1.4 Avoid attaching click listeners individually to button children.

### 3.2 Event Dispatching

- [ ] 3.2.1 Capture the native browser event at the root.
- [ ] 3.2.2 Identify the originating event target.
- [ ] 3.2.3 Traverse the event target's ancestor chain up to the root.
- [ ] 3.2.4 Locate the corresponding virtual event handler.
- [ ] 3.2.5 Execute the correct handler.
- [ ] 3.2.6 Stop traversal at the defined boundary.

### 3.3 Re-render Safety

- [ ] 3.3.1 Keep root listener attachment stable across renders.
- [ ] 3.3.2 Verify newly rendered buttons still respond to clicks.
- [ ] 3.3.3 Confirm no duplicate event-handler execution.
- [ ] 3.3.4 Confirm no orphan listeners remain on removed button children.

**Acceptance:** Button interactions work through root delegation without direct click listeners on individual buttons.

## 6. WBS 4 — Reactive Task Manager Application

**Source:** R3 — Real-time Task Manager with dynamic filter toggles.

### 4.1 Application Structure

- [ ] 4.1.1 Create the application entry point.
- [ ] 4.1.2 Implement `TaskApp`.
- [ ] 4.1.3 Use semantic HTML for the task interface.
- [ ] 4.1.4 Render the application through the custom reactive engine.

### 4.2 Task State

- [ ] 4.2.1 Initialize the task collection using `useState`.
- [ ] 4.2.2 Display the current task count.
- [ ] 4.2.3 Render the task collection.
- [ ] 4.2.4 Implement the Add Task button.
- [ ] 4.2.5 Append a new task through the state setter.
- [ ] 4.2.6 Verify the interface updates automatically.

### 4.3 Dynamic Filter State

- [ ] 4.3.1 Initialize filter state using `useState`.
- [ ] 4.3.2 Define the filter options required by the UI.
- [ ] 4.3.3 Implement interactive filter toggle controls.
- [ ] 4.3.4 Update filter state through the corresponding setter.
- [ ] 4.3.5 Derive the visible task collection from task and filter state.
- [ ] 4.3.6 Re-render visible results when the filter changes.
- [ ] 4.3.7 Preserve the complete task collection when switching filters.

**Acceptance:** Adding tasks and changing filters update the visible UI without a browser reload.

**Scope note:** The slide does not prescribe exact filter categories or task-status behavior. Select the minimum coherent filter behavior during UI implementation; do not introduce unrelated task-management features.

### 4.4 Unidirectional Data Flow

- [ ] 4.4.1 Read application state during rendering.
- [ ] 4.4.2 Convert state into the visible VNode structure.
- [ ] 4.4.3 Handle user actions through event callbacks.
- [ ] 4.4.4 Update state through setters.
- [ ] 4.4.5 Trigger a new render from updated state.

**Expected flow:**

State → UI → User Event → State Setter → Re-render → Updated UI

## 7. WBS 5 — Git Milestones

**Source:** R4 — Four mandatory atomic commits.

### 5.1 Commit 1

- [ ] Complete and verify the state store and cursor engine.
- [ ] Commit with the required message.

`feat(state): implement stateStore and resetCursor engine`

### 5.2 Commit 2

- [ ] Complete and verify the reactive `useState` dispatcher.
- [ ] Commit with the required message.

`feat(state): implement reactive useState dispatcher`

### 5.3 Commit 3

- [ ] Complete and verify the root event delegation listener.
- [ ] Commit with the required message.

`feat(events): attach root event delegation listener`

### 5.4 Commit 4

- [ ] Complete and verify the reactive Task Manager.
- [ ] Commit with the required message.

`feat(ui): assemble reactive todo application`

**Acceptance:** Git history contains four separate commits with the specified messages and logical implementation boundaries.

## 8. WBS 6 — Checkpoint 2 Verification

**Source:** R5 — UI-triggered state mutation and event listener audit.

### 6.1 Prepare Checkpoint

- [ ] 6.1.1 Provide the expected `reactive-engine.js` module.
- [ ] 6.1.2 Export `useState` and `renderApp`.
- [ ] 6.1.3 Prepare the TaskApp checkpoint scenario.
- [ ] 6.1.4 Preserve the instructor's specified initial tasks.
- [ ] 6.1.5 Preserve the initial filter value `ALL`.

### 6.2 State Mutation Verification

- [ ] 6.2.1 Render the initial task interface.
- [ ] 6.2.2 Verify initial task count.
- [ ] 6.2.3 Click Add Task.
- [ ] 6.2.4 Verify the task collection grows.
- [ ] 6.2.5 Verify the displayed task count updates.
- [ ] 6.2.6 Verify the UI re-renders without page reload.
- [ ] 6.2.7 Verify filter state is not unintentionally reset.

### 6.3 Event Listener Audit

- [ ] 6.3.1 Inspect the root event listener.
- [ ] 6.3.2 Inspect button child event listeners.
- [ ] 6.3.3 Confirm buttons do not have unintended direct click listeners.
- [ ] 6.3.4 Verify dynamic elements still respond correctly.
- [ ] 6.3.5 Verify no duplicate event execution after re-render.

**Acceptance:** UI-triggered state changes produce correct re-rendering with no orphan button listeners.

## 9. WBS 7 — WCAG 2.0 Level AA Accessibility

**Source:** A1 — Lab 02 accessibility requirements.

### 7.1 Perceivable

- [ ] 7.1.1 Preserve semantic structure and task relationships (1.3.1).
- [ ] 7.1.2 Preserve meaningful content sequence (1.3.2).
- [ ] 7.1.3 Do not communicate filter selection using color alone (1.4.1).
- [ ] 7.1.4 Verify text contrast meets applicable minimum ratios (1.4.3).
- [ ] 7.1.5 Verify usability when text is resized to 200% (1.4.4).

### 7.2 Operable

- [ ] 7.2.1 Ensure Add Task is keyboard operable (2.1.1).
- [ ] 7.2.2 Ensure filter controls are keyboard operable (2.1.1).
- [ ] 7.2.3 Verify there are no keyboard traps (2.1.2).
- [ ] 7.2.4 Preserve logical focus order (2.4.3).
- [ ] 7.2.5 Provide descriptive control labels (2.4.6).
- [ ] 7.2.6 Verify visible keyboard focus (2.4.7).

### 7.3 Understandable

- [ ] 7.3.1 Declare the document language (3.1.1).
- [ ] 7.3.2 Provide a descriptive page title (2.4.2).
- [ ] 7.3.3 Ensure focus does not unexpectedly change context (3.2.1).
- [ ] 7.3.4 Ensure changing a filter does not unexpectedly navigate away (3.2.2).

### 7.4 Robust

- [ ] 7.4.1 Verify valid markup and unique IDs (4.1.1).
- [ ] 7.4.2 Verify accessible names and roles for interactive controls (4.1.2).
- [ ] 7.4.3 Verify active filter state is programmatically identifiable where needed (4.1.2).
- [ ] 7.4.4 Verify the application remains operable after dynamic re-rendering.

**Accessibility acceptance:** Record applicable criteria as PASS, FAIL, NOT APPLICABLE, or NOT TESTED. Do not claim full WCAG 2.0 AA conformance from a partial checklist.

## 10. Implementation Stages

| Stage | WBS | Required Output |
|---|---|---|
| 1 — Setup | 6.1 (initial setup) | Working directory and module structure |
| 2 — State Memory | 1, 5.1 | State store, cursor, Commit 1 |
| 3 — useState Dispatcher | 2, 5.2 | Reactive state engine, Commit 2 |
| 4 — Event Delegation | 3, 5.3 | Root listener, Commit 3 |
| 5 — Task Manager | 4, 5.4 | Reactive UI, Commit 4 |
| 6 — Verification | 6, 7 | Checkpoint, DOM and WCAG audit |

## 11. Final Acceptance Checklist

- [ ] Custom stateStore implemented.
- [ ] Cursor reset works.
- [ ] Closure-based useState works.
- [ ] State updates trigger re-rendering.
- [ ] Root event delegation works.
- [ ] Task Manager supports adding tasks.
- [ ] Dynamic filters work.
- [ ] Unidirectional data flow preserved.
- [ ] Zero orphan button event listeners verified.
- [ ] Checkpoint 2 passed.
- [ ] Four mandatory Git commits verified.
- [ ] Relevant WCAG 2.0 Level AA checks completed.
- [ ] Result screenshots captured.
- [ ] Short evidence-based report completed.

**Current Status:** Not started.

## 12. References

- Instructor's Lab 02 Exercise 2 specification and Checkpoint 2.
- W3C WCAG 2.0: https://www.w3.org/TR/WCAG20/