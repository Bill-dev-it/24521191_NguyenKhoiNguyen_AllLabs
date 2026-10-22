# HW3 — Engineering Task Decomposition & Implementation Plan

**Project:** FlashVault – Vietnam 11.11 High-Concurrency Flash-Sale Engine  
**Assignment:** Homework 03 – High-Concurrency Flash-Sale E-Commerce Engine  
**Technology:** React, TypeScript, Vite, Vitest  
**Architecture:** Client-Side Simulation with Domain State Machines  
**Development Strategy:** Eight Incremental Stages and Atomic Conventional Commits  
**Core Requirements:** Zero-Drift Timer, Optimistic Inventory Lock, Reservation Expiration, Checkout, AI Failure Audit

---

## 1. Executive Summary

### 1.1 Project Overview

FlashVault simulates a Vietnamese e-commerce flash-sale campaign, such as Shopee or Lazada 11.11, under high-frequency purchase demand.

The application demonstrates two major engineering concerns:

1. Accurate countdown measurement that does not accumulate timer drift.
2. Consistent inventory reservation and checkout transitions under competing purchase requests.

The implementation separates timing logic, inventory control, checkout transactions, and interface rendering.

### 1.2 Project Objectives

- Implement deadline-based countdown timing.
- Use `Date.now()` to calculate remaining time.
- Schedule UI updates with `requestAnimationFrame`.
- Model inventory using an explicit finite state machine.
- Prevent overselling in the simulated authoritative in-memory inventory engine.
- Support reservation expiration and stock release.
- Validate purchase requests against current stock and reservation state.
- Test contention, expiry, cancellation, and checkout scenarios.
- Record a minimum of three AI-related failure modes.
- Maintain at least eight meaningful Conventional Commits.

### 1.3 Scope

**Included:** Campaign countdown, product catalog, inventory simulation, reservations, expiration, checkout, automated tests, event logs, responsive dashboard.

**Excluded:** Real payments, production databases, distributed transaction coordination, multi-server inventory locks, authentication, and external e-commerce APIs.

**Engineering Boundary:** A frontend-only application can simulate high-concurrency inventory requests, but it cannot guarantee global inventory consistency across devices without a shared authoritative backend.

---

## 2. Functional Requirements

| ID | Requirement | Expected Behavior |
|---|---|---|
| FR-01 | Flash-sale countdown | Accurate remaining time based on deadline |
| FR-02 | Timer cancellation | Stops future updates after disposal |
| FR-03 | Product catalog | Displays price, stock and deal information |
| FR-04 | Inventory reservation | Temporarily reserves available stock |
| FR-05 | Stock validation | Rejects requests that exceed available stock |
| FR-06 | Reservation expiration | Releases reserved stock when lock expires |
| FR-07 | Checkout | Converts a valid reservation into a purchase |
| FR-08 | Idempotency | Prevents duplicate checkout consumption |
| FR-09 | Concurrent requests | Simulates multiple competing requests |
| FR-10 | Transaction logging | Records state transitions and failure reasons |
| FR-11 | Responsive UI | Usable on desktop and mobile |
| FR-12 | AI failure audit | Documents at least three AI implementation risks |

---

## 3. Non-Functional Requirements

### 3.1 Correctness

- Remaining countdown must not depend on accumulated interval ticks.
- Available stock must never become negative.
- Sold quantity plus reserved quantity must not exceed the initial stock.
- A reservation cannot be successfully checked out after expiration.
- A committed reservation cannot be committed twice.

### 3.2 Performance

- Countdown rendering should be lightweight.
- Domain operations should not trigger unnecessary full-page renders.
- Simulated competing requests should complete without corrupting state.

### 3.3 Maintainability

- Domain logic must remain separate from React components.
- Public operations must have explicit TypeScript types.
- State transitions should have predictable errors or result codes.

### 3.4 Testability

- Timer clock and scheduling should be injectable for deterministic tests.
- Inventory operations should run independently of React.
- Checkout tests should cover success, failure, expiry and duplicate requests.

---

## 4. Overall System Architecture

```text
FlashVault React Dashboard
          |
          +---- Campaign Countdown
          |           |
          |           v
          |    AntiDriftTimer
          |
          +---- Product Catalog
          |           |
          |           v
          |    InventoryEngine
          |           |
          |           +---- Stock Validation
          |           +---- Reservation Locks
          |           +---- Expiration
          |
          +---- Checkout Panel
          |           |
          |           v
          |    CheckoutEngine
          |
          +---- Event Log / Statistics
```

### 4.1 Component Responsibilities

| Module | Responsibility |
|---|---|
| `anti-drift-timer.ts` | Deadline computation and animation scheduling |
| `inventory-types.ts` | Product, reservation, state and result contracts |
| `inventory-engine.ts` | Authoritative in-memory inventory state transitions |
| `checkout-engine.ts` | Checkout validation, commit and idempotency |
| `product-data.ts` | Vietnamese flash-sale sample products |
| `App.tsx` | Application coordination and presentation |
| `components/` | Reusable UI elements |

---

## 5. Stage 1 — Project Setup & Decomposition

**Objective:** Establish the development environment and technical plan.

### Tasks

- [ ] Initialize Vite + React + TypeScript.
- [ ] Configure ESLint.
- [ ] Install Vitest.
- [ ] Create `TASK_DECOMPOSITION.md`.
- [ ] Verify project structure.
- [ ] Run TypeScript build and lint.
- [ ] Create initial Git commit.

### Deliverables

Project configuration, Vite application, package manifests and engineering plan.

### Acceptance Criteria

- `npm run build` succeeds.
- `npm run lint` succeeds.
- Project contains a documented implementation plan.
- No unrelated homework files are included in the commit.

**Commit:** `chore: initialize HW3 flash sale project and decomposition`

---

## 6. Stage 2 — Precision Anti-Drift Countdown

**Objective:** Build a countdown timer that computes remaining time from an absolute deadline.

### 6.1 Problem Description

A conventional interval-based countdown may decrement a variable every second.

```typescript
remaining -= 1000;
```

This assumes that every callback occurs exactly on schedule.

Browser scheduling delays, background tabs and CPU load can cause actual elapsed time to differ from the nominal interval duration.

### 6.2 Proposed Formula

```text
deadline = Date.now() + durationMs

remaining = max(0, deadline - Date.now())
```

The countdown is recalculated from the clock at every update rather than accumulated ticks.

### 6.3 Timer Invariants

- T1: Remaining time is never negative.
- T2: Completion occurs when the current clock reaches the deadline.
- T3: Cancellation prevents future callback delivery.
- T4: Repeated disposal is safe.
- T5: Callback delays do not accumulate into long-term countdown drift.

### 6.4 Implementation Tasks

- [ ] Implement `createAntiDriftTimer`.
- [ ] Support an injectable clock for tests.
- [ ] Support injected animation scheduling/cancellation.
- [ ] Calculate remaining time from deadline.
- [ ] Stop updates at zero.
- [ ] Implement cleanup.
- [ ] Test delayed callbacks and cancellation.

### 6.5 Acceptance Tests

| Test | Expected Result |
|---|---|
| Start timer | Correct initial deadline |
| Advance simulated clock | Correct remaining time |
| Delay callback | No accumulated drift |
| Advance beyond deadline | Remaining becomes zero |
| Cancel timer | No further scheduled updates |
| Cancel twice | Safe operation |

**Commit:** `feat: implement deadline based anti drift timer`

---

## 7. Stage 3 — Inventory State Machine & Types

**Objective:** Define strict domain types and valid inventory transitions.

### 7.1 Product Inventory Model

Each product has:

- Product ID
- Name
- Original price
- Flash-sale price
- Initial stock
- Available stock
- Reserved quantity
- Sold quantity
- Campaign availability

### 7.2 Reservation Model

Each reservation has:

- Reservation ID
- Product ID
- Buyer/session identifier
- Quantity
- Created timestamp
- Expiration timestamp
- Reservation state

### 7.3 Reservation State Machine

```text
REQUESTED
    |
    v
RESERVED
    |
    +------> COMMITTED
    |
    +------> EXPIRED
    |
    +------> CANCELLED
```

Rejected requests do not acquire inventory locks.

### 7.4 Valid Transitions

| Current State | Event | Next State |
|---|---|---|
| REQUESTED | Stock available | RESERVED |
| REQUESTED | Insufficient stock | REJECTED |
| RESERVED | Checkout before expiration | COMMITTED |
| RESERVED | Expiration deadline reached | EXPIRED |
| RESERVED | User cancellation | CANCELLED |
| COMMITTED | Repeated checkout | No additional deduction |
| EXPIRED | Checkout attempt | Rejected |
| CANCELLED | Checkout attempt | Rejected |

### 7.5 Inventory Invariant

For each product:

```text
initialStock =
  availableStock + reservedQuantity + soldQuantity
```

Every successful state transition must preserve this equation.

### 7.6 Tasks

- [ ] Define TypeScript domain interfaces.
- [ ] Define reservation statuses.
- [ ] Define state-transition events.
- [ ] Implement pure inventory operations.
- [ ] Prevent negative stock.
- [ ] Test invalid transitions.

**Commit:** `feat: implement typed inventory reservation state machine`

---

## 8. Stage 4 — Optimistic Stock Lock & Expiration

**Objective:** Implement temporary stock reservation without overselling.

### 8.1 Reservation Workflow

```text
Buyer requests item
        |
        v
Check current available stock
        |
        +---- Not enough -> REJECTED
        |
        v
Create reservation
        |
        v
Decrease available stock
        |
        v
Increase reserved quantity
        |
        v
Start reservation deadline
```

### 8.2 Expiration Workflow

```text
Reservation deadline reached
          |
          v
Check reservation status
          |
          +---- COMMITTED -> No release
          |
          +---- CANCELLED -> No release
          |
          v
RESERVED -> EXPIRED
          |
          v
Release reserved quantity
```

### 8.3 Locking Considerations

Reservation locks are represented in the inventory state, not as operating-system thread mutexes.

All authoritative stock modifications must occur through one inventory engine instance in the simulation.

For a distributed production application, an atomic database update, transaction, or equivalent backend coordination would be required.

### 8.4 Acceptance Tests

- [ ] Stock decreases on successful reservation.
- [ ] Reserved quantity increases consistently.
- [ ] Insufficient stock is rejected.
- [ ] Expired locks release stock.
- [ ] Double release is prevented.
- [ ] Expired reservations cannot be checked out.
- [ ] Concurrent simulated requests preserve conservation invariants.

**Commit:** `feat: implement inventory reservation locking and expiration`

---

## 9. Stage 5 — Checkout & Concurrency Simulation

**Objective:** Convert valid reservations into committed orders.

### 9.1 Checkout Workflow

```text
Checkout request
       |
       v
Find reservation
       |
       v
Validate RESERVED state
       |
       v
Validate expiration
       |
       v
Commit order
       |
       v
reservedQuantity decreases
soldQuantity increases
```

Available stock must not be deducted twice because stock was already removed from availability when the reservation was created.

### 9.2 Idempotency

A repeated checkout request for the same committed reservation must not create another stock deduction.

The system should return the existing order outcome or a documented duplicate response.

### 9.3 Concurrency Scenarios

| Scenario | Expected Result |
|---|---|
| 20 buyers, 5 units | At most 5 units reserved/sold |
| Two buyers, final unit | At most one successful reservation |
| Checkout after expiration | Rejected |
| Double checkout | Single inventory consumption |
| Cancel after commit | No stock release |
| Expire after commit | No stock release |

### 9.4 Tasks

- [ ] Implement checkout validation.
- [ ] Implement order creation.
- [ ] Implement idempotent checkout handling.
- [ ] Simulate burst requests.
- [ ] Record successful and rejected attempts.
- [ ] Test final-unit contention.

**Commit:** `feat: implement checkout and concurrent purchase simulation`

---

## 10. Stage 6 — FlashVault Dashboard

**Objective:** Deliver an interactive Vietnamese flash-sale UI.

### 10.1 UI Sections

**Campaign Header**
- FlashVault branding
- 11.11 campaign status
- Deadline-based countdown

**Product Grid**
- Product cards
- Discount information
- Available quantity
- Reserve controls

**Reservation Panel**
- Active reservation
- Expiry countdown
- Cancel action
- Checkout action

**Inventory Monitor**
- Available units
- Reserved units
- Sold units

**Event Log**
- Reservation created
- Reservation rejected
- Reservation expired
- Checkout committed
- Cancellation completed

### 10.2 Visual Direction

- Dark navy commerce dashboard
- Red/orange flash-sale emphasis
- High-contrast timer
- Responsive product cards
- Visible reservation status indicators

### 10.3 Tasks

- [ ] Build campaign countdown UI.
- [ ] Add product data and cards.
- [ ] Connect inventory engine.
- [ ] Connect reservation actions.
- [ ] Add checkout simulation.
- [ ] Display event logs.
- [ ] Implement responsive layouts.
- [ ] Verify keyboard operability.

**Commit:** `feat: build responsive flash sale dashboard`

---

## 11. Stage 7 — Automated Testing & Race Audit

**Objective:** Validate domain correctness and timing accuracy.

### 11.1 Timer Tests

- Accurate deadline computation
- Callback delay tolerance
- Zero clamping
- Timer cancellation
- Timer cleanup

### 11.2 Inventory Tests

- Reservation success
- Insufficient stock
- Negative stock prevention
- Lock expiration
- Cancel release
- Invalid state transitions

### 11.3 Checkout Tests

- Checkout success
- Expired reservation rejection
- Duplicate checkout
- Contending buyers
- Total stock conservation

### 11.4 Stress Simulation

Given initial stock of 5 units, simulate 20 buyers attempting one-unit reservations.

Expected:

```text
Successful reservations <= 5
Available stock >= 0

Available + Reserved + Sold = 5
```

### 11.5 Verification Commands

```bash
npm run build
npm run lint
npm run test
```

### 11.6 Evidence

Save actual test results, transaction logs and simulation outcomes.

**Commit:** `test: verify timer inventory and checkout invariants`

---

## 12. Stage 8 — AI Failure Audit & Documentation

**Objective:** Document AI-related engineering risks and actual verification.

### 12.1 Mandatory Audit Topics

**FM-01 — Drift-Prone Countdown**

An AI-generated countdown that decrements time on every interval may accumulate timing error.

Mitigation: Compare each frame against a fixed deadline.

**FM-02 — Inventory Race Condition**

An AI-generated implementation may check available stock and update it in separate uncontrolled operations.

Mitigation: Centralized authoritative state transitions and atomic server-side operations in production.

**FM-03 — Double Inventory Deduction**

An AI-generated checkout may subtract stock after reservation already reduced available quantity.

Mitigation: Reservation-to-checkout transition changes reserved to sold without reducing available again.

**FM-04 — Expired Lock Checkout**

A reservation may appear active in stale UI state after expiration.

Mitigation: Revalidate expiry in the domain engine at checkout time.

**FM-05 — Uncleaned Timer**

An animation loop may continue after the component unmounts.

Mitigation: `cancelAnimationFrame` and lifecycle disposal.

### 12.2 Audit Document Sections

1. Executive Summary
2. System Architecture
3. Failure Mode Matrix
4. Root Cause Analysis
5. Incorrect vs Correct Code
6. Testing Methodology
7. Observed Results
8. Git History
9. Engineering Defense Questions
10. Conclusions and Limitations

At least three failure modes must be documented. Risk scenarios must be distinguished from defects actually reproduced during development.

**Commit:** `docs: finalize HW3 failure audit and verification`

---

## 13. Requirement Traceability

| Requirement | Module | Stage | Test Evidence |
|---|---|---|---|
| Zero-drift timer | `anti-drift-timer.ts` | 2 | Fake-clock tests |
| Inventory state machine | `inventory-engine.ts` | 3 | Transition tests |
| Stock reservation | `inventory-engine.ts` | 4 | Reservation tests |
| Lock expiry | `inventory-engine.ts` | 4 | Expiration tests |
| Checkout | `checkout-engine.ts` | 5 | Checkout tests |
| Concurrency simulation | Checkout + inventory | 5, 7 | Burst simulation |
| Responsive UI | React components | 6 | Browser screenshots |
| AI audit | `AI_FAILURE_AUDIT.md` | 8 | Technical report |
| Eight commits | Git history | 1–8 | `git log` |

---

## 14. Implementation Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Background timer throttling | Inaccurate UI ticks | Deadline calculation |
| System clock adjustment | Countdown discontinuity | Define clock assumption and test |
| Duplicate reservation | Overselling | Central inventory engine |
| Expiration race | Incorrect checkout | Domain-level deadline revalidation |
| Double checkout | Duplicate sale | Idempotency |
| Browser refresh | Lost simulation state | Treat persistence as out of scope |
| Multi-tab stock changes | Inconsistent local inventory | Explicitly document frontend-only scope |
| Memory retention | Stale callbacks | Cleanup timers and subscriptions |

---

## 15. Final Acceptance Checklist

- [ ] Project initialized.
- [ ] Eight meaningful Git commits exist.
- [ ] Timer uses deadline-based computation.
- [ ] Timer cancellation works.
- [ ] Inventory states are typed.
- [ ] Reservation locks work.
- [ ] Lock expiration returns stock.
- [ ] Overselling is prevented in the simulation.
- [ ] Checkout is idempotent.
- [ ] Concurrency stress tests pass.
- [ ] Responsive dashboard is functional.
- [ ] Build succeeds.
- [ ] Lint succeeds.
- [ ] Tests pass.
- [ ] AI Failure Audit contains at least three analyzed flaws.
- [ ] Evidence screenshots are saved.

---

## 16. Engineering Conclusion

FlashVault is designed to demonstrate precision timing and inventory consistency in a high-demand e-commerce simulation.

The architecture prioritizes:

- Deadline-based time measurement
- Explicit finite state transitions
- Centralized stock ownership
- Reservation and checkout validation
- Deterministic automated testing
- Evidence-based failure analysis
- Incremental Git development

**Document Status:** Engineering plan. Implementation and verification claims must be updated only after the corresponding stage is completed.

---

**End of HW3 Engineering Task Decomposition**