# AI Failure Mode Audit — FlashVault 11.11

**Assignment:** Homework 03 – High-Concurrency Flash-Sale E-Commerce Engine  
**Project:** FlashVault – Vietnam Mega-Sale Simulation  
**Student:** Nguyen Khoi Nguyen  
**Student ID:** 24521191  
**Technology:** React, TypeScript, Vite, Vitest  
**Architecture:** Client-Side Inventory State Machine  
**Document Type:** Engineering Audit and Verification Report  
**Status:** Final review; evidence-dependent results must be confirmed before submission

---

## 1. Executive Summary

FlashVault is a browser-based simulation of a Vietnamese 11.11 flash-sale platform. The application demonstrates precision countdown timing, inventory reservation, lock expiration, checkout validation, idempotency, and high-demand purchase simulation.

The engineering implementation separates timing, inventory state management, checkout, and UI responsibilities into independent TypeScript modules.

The development process uses eight incremental stages to support task decomposition, testing, debugging, and atomic Git commits.

This audit examines six potential failure modes associated with AI-assisted implementation.

The primary engineering concerns are countdown drift, inventory overselling, duplicate stock deduction, expired reservation checkout, duplicate orders, and uncleaned asynchronous timers.

Automated tests were designed to verify these behaviors using deterministic clocks, reservation state transitions, checkout tests, and purchase-burst simulations.

The application operates as a single-instance, in-memory simulation. It does not implement distributed transactions across devices or multiple servers.

### 1.1 Audit Objectives

1. Analyze failure-prone AI-generated implementation patterns.
2. Identify root causes and affected components.
3. Document corrected implementation strategies.
4. Validate timer and inventory invariants.
5. Verify reservation lifecycle and checkout consistency.
6. Examine high-demand purchase scenarios.
7. Distinguish simulated concurrency from real distributed concurrency.
8. Record test results and development evidence.

---

## 2. System Overview

### 2.1 System Architecture

```text
FlashVault React Dashboard
          |
          +---- Anti-Drift Timer
          |          |
          |          v
          |     Date.now() Deadline
          |          |
          |          v
          |     requestAnimationFrame
          |
          +---- Product Catalog
          |          |
          |          v
          |     InventoryEngine
          |          |
          |          +---- Reserve
          |          +---- Cancel
          |          +---- Expire
          |          +---- Commit
          |
          +---- Checkout Panel
          |          |
          |          v
          |     CheckoutEngine
          |          |
          |          +---- Validate
          |          +---- Confirm Order
          |          +---- Idempotency
          |
          +---- Concurrency Simulator
          |          |
          |          v
          |     Multiple Buyer Requests
          |
          +---- Statistics & Event Log
```

### 2.2 Source Modules

| Source File | Responsibility |
|---|---|
| `anti-drift-timer.ts` | Precision deadline-based countdown |
| `inventory-types.ts` | Domain contracts and reservation statuses |
| `inventory-engine.ts` | Authoritative in-memory inventory transitions |
| `checkout-engine.ts` | Checkout coordination and order idempotency |
| `product-data.ts` | Simulated 11.11 product catalog |
| `App.tsx` | Dashboard integration and user interaction |
| `anti-drift-timer.test.ts` | Timer behavior verification |
| `inventory-engine.test.ts` | Inventory and expiry verification |
| `checkout-engine.test.ts` | Checkout verification |
| `flash-sale-stress.test.ts` | Stress and race-boundary simulation |

### 2.3 Inventory State Machine

```text
                REQUESTED
                    |
             Stock validation
                    |
           +--------+--------+
           |                 |
        REJECTED          RESERVED
                             |
                   +---------+---------+
                   |         |         |
                COMMITTED  EXPIRED   CANCELLED
```

The `REQUESTED` and `REJECTED` states represent the request decision process. Persisted successful reservations use the statuses `reserved`, `committed`, `expired`, or `cancelled`.

### 2.4 Core Invariants

**INV-01: Inventory Conservation**

```text
initialStock =
  availableStock +
  reservedQuantity +
  soldQuantity
```

**INV-02: Non-Negative Inventory**

```text
availableStock >= 0
reservedQuantity >= 0
soldQuantity >= 0
```

**INV-03: Single Reservation Terminal Transition**

A reservation must not transition from one terminal state to another.

**INV-04: Idempotent Checkout**

Repeated checkout of a committed reservation must not create additional stock consumption.

**INV-05: Absolute Expiration**

The authoritative reservation deadline is `expiresAt`, not the number of timer callbacks received.

**INV-06: Single Authoritative Inventory Engine**

All simulated stock mutations must be performed through `InventoryEngine`, not through React state copies.

---

## 3. AI Failure Mode Matrix

| ID | Failure Mode | Root Cause | Impact | Mitigation | Verification |
|---|---|---|---|---|---|
| FM-01 | Countdown Drift | Decrementing a timer on assumed interval durations | Incorrect sale countdown | Absolute deadline using `Date.now()` | Fake-clock tests |
| FM-02 | Inventory Race Condition | Separated stock check and update | Overselling | Centralized synchronous inventory transition | Burst tests |
| FM-03 | Double Stock Deduction | Deducting Available during both reservation and checkout | Incorrect stock counts | Reserved-to-Sold transfer | Checkout tests |
| FM-04 | Reservation Expiry Race | Trusting stale UI status | Checkout after deadline | Revalidate expiry during commit | Deadline boundary tests |
| FM-05 | Duplicate Checkout | Missing idempotency | Duplicate orders or charges | Reservation-to-order lookup | Repeated checkout tests |
| FM-06 | Timer Lifecycle Leak | Missing scheduler cancellation | Stale updates and retained callbacks | Timer cleanup and monitor disposal | Cancellation tests and code review |

These are analyzed failure modes and regression targets. A passing prevention test does not establish that an incorrect implementation was previously observed.

---

## 4. FM-01 — Countdown Drift

### 4.1 Problem

A naive countdown implementation may decrement the remaining time after every scheduled interval:

```typescript
setInterval(() => {
  remaining -= 1000;
}, 1000);
```

This assumes the callback runs exactly once every 1000 milliseconds.

However, JavaScript timers are affected by event-loop congestion, background tab throttling, and browser scheduling.

If callbacks are delayed, the stored remaining time may no longer match elapsed wall-clock time.

### 4.2 Root Cause

The source of truth is an incrementally modified counter rather than an actual deadline.

Scheduling delays accumulate because missed time is not accounted for.

### 4.3 Corrected Approach

FlashVault calculates a deadline when the timer starts:

```typescript
const startTime = Date.now();
const deadline = startTime + durationMs;
```

Every subsequent update computes:

```typescript
const remaining = Math.max(
  0,
  deadline - Date.now()
);
```

The requestAnimationFrame callback determines when the display refreshes, but the wall-clock deadline determines the remaining time.

### 4.4 Test Scenario

Given:

```text
Start time: 100000 ms
Duration: 10000 ms
Deadline: 110000 ms
```

After a delayed callback at 101350 ms:

```text
Remaining = 110000 - 101350
          = 8650 ms
```

The timer does not assume exactly one second has elapsed.

### 4.5 Verification

The anti-drift timer suite contains 9 tests covering initial duration, delayed callbacks, completion, cancellation, invalid duration, and formatting.

**Expected:** 9/9 passing.

**Actual final result:** [Enter verified output]

### 4.6 Engineering Limitations

Using `Date.now()` removes accumulated callback drift relative to the system clock, but it does not eliminate changes caused by manual clock adjustments or operating-system time synchronization.

A production campaign commonly requires a server-authoritative deadline.

### 4.7 Engineering Lesson

Do not treat callback frequency as an accurate source of elapsed time.

Use absolute deadlines and derive the remaining time on every update.

---

## 5. FM-02 — Inventory Race Condition and Overselling

### 5.1 Problem

During a flash sale, many buyers may attempt to reserve the final product units.

A naive implementation may execute stock validation and stock deduction as separate asynchronous operations:

```typescript
if (availableStock > 0) {
  await processRequest();
  availableStock -= 1;
}
```

Multiple requests could observe the same stock value before any of them performs the update.

### 5.2 Failure Scenario

Suppose one unit remains:

```text
Buyer A reads stock = 1
Buyer B reads stock = 1

Buyer A proceeds
Buyer B proceeds

Two purchases attempt to consume one unit
```

The result may be overselling if the authoritative backend does not protect the shared state.

### 5.3 FlashVault Implementation

FlashVault routes reservation requests through one `InventoryEngine` instance.

```typescript
if (product.availableStock < quantity) {
  return {
    success: false,
    code: "INSUFFICIENT_STOCK",
    message: "Not enough available inventory",
  };
}

product.availableStock -= quantity;
product.reservedQuantity += quantity;
product.version++;
```

The stock check and mutation occur in one synchronous method without an intervening asynchronous suspension point.

Within a single JavaScript execution context, this prevents competing calls from interleaving inside this critical section.

### 5.4 High-Concurrency Simulation

Test configuration:

```text
Initial stock: 5
Buyer requests: 100
Quantity per buyer: 1
```

Expected result:

```text
Successful reservations: 5
Rejected reservations: 95
Available stock: 0
Reserved quantity: 5
Sold quantity: 0
```

### 5.5 Version Metadata

Each product maintains a `version` value incremented when stock changes.

This supports observing inventory revisions.

However, version increments alone are not a true optimistic compare-and-swap protocol.

A production implementation would need an atomic conditional database update or transaction.

### 5.6 Verification

The test suite includes scenarios involving 20 buyers, 50 buyers, 100 buyers and repeated burst submissions.

**Expected:** No stock conservation violations.

**Actual final result:** [Enter verified output]

### 5.7 Engineering Limitation

`Promise.all()` does not by itself create parallel execution across threads.

FlashVault simulates competing asynchronous submissions that ultimately mutate one in-memory inventory engine.

It does not establish distributed concurrency correctness.

### 5.8 Engineering Lesson

Inventory correctness must be enforced by a single authoritative state transition, not through independently updated UI values.

---

## 6. FM-03 — Double Stock Deduction

### 6.1 Problem

Inventory reservation and checkout are separate business operations.

An incorrect implementation may decrease available stock when creating a reservation and decrease it again during checkout.

### 6.2 Incorrect Scenario

Initial stock:

```text
Available: 5
Reserved: 0
Sold: 0
```

After reserving two items:

```text
Available: 3
Reserved: 2
Sold: 0
```

If checkout subtracts two more units from Available:

```text
Available: 1
Reserved: 0
Sold: 2
```

The conservation invariant is violated because:

```text
1 + 0 + 2 = 3
```

but the initial stock was 5.

### 6.3 Correct Transition

Reservation:

```typescript
product.availableStock -= quantity;
product.reservedQuantity += quantity;
```

Checkout:

```typescript
product.reservedQuantity -= quantity;
product.soldQuantity += quantity;
```

Available stock is not deducted a second time.

### 6.4 Correct Result

```text
Initial:    Available 5, Reserved 0, Sold 0
Reserve 2:  Available 3, Reserved 2, Sold 0
Checkout 2: Available 3, Reserved 0, Sold 2
```

Conservation:

```text
3 + 0 + 2 = 5
```

### 6.5 Verification

The CheckoutEngine suite includes a test verifying that Available remains unchanged during checkout.

The engine also exposes `validateInvariants()`.

**Expected:** The stock conservation invariant remains true.

**Actual final result:** [Enter verified output]

### 6.6 Engineering Lesson

Inventory operations must be modeled as explicit state transitions.

Reservation creates a temporary commitment; checkout finalizes that commitment rather than consuming another unit of stock.

---

## 7. FM-04 — Reservation Expiration Race

### 7.1 Problem

A reservation may appear active on the user interface even after its deadline has passed.

This can happen if browser timer callbacks are delayed or the tab is backgrounded.

If the checkout operation relies only on displayed state, a buyer could attempt checkout after the reservation is no longer valid.

### 7.2 Incorrect Pattern

```typescript
if (reservation.status === "reserved") {
  confirmOrder();
}
```

The `reserved` status alone does not guarantee that the lock has not expired.

### 7.3 Corrected Approach

The InventoryEngine runs expiration validation before committing:

```typescript
commitReservation(
  reservationId: string
) {
  this.expireReservations();

  const reservation =
    this.reservations.get(reservationId);

  // Validate current reservation status.
}
```

Expiration uses the absolute deadline:

```typescript
timestamp >= reservation.expiresAt
```

### 7.4 Boundary Tests

For a reservation created at 100000 ms with a 1000 ms duration:

```text
Expiration deadline: 101000 ms
```

At 100999 ms:

```text
Checkout allowed
```

At 101000 ms:

```text
Checkout rejected
Reservation expired
Inventory released
```

### 7.5 Automatic Expiration

The background expiry monitor periodically checks reservations.

However, it is not the authoritative source of expiration.

Even when the monitor is delayed, a domain operation can call `expireReservations()` to validate current deadlines.

### 7.6 Verification

The tests cover expiration exactly at the deadline, just before the deadline, after expiration, and prevention of duplicate stock release.

**Actual final result:** [Enter verified output]

### 7.7 Engineering Lesson

Business validity must be checked at transaction time.

UI countdowns and background schedulers are useful feedback mechanisms but cannot replace authoritative deadline validation.

---

## 8. FM-05 — Duplicate Checkout and Idempotency

### 8.1 Problem

A user may double-click Checkout, experience a network retry, or resubmit the same request.

A naive checkout implementation could create duplicate orders or deduct inventory multiple times.

### 8.2 Incorrect Pattern

```typescript
function checkout(reservationId: string) {
  const order = createOrder(reservationId);
  reduceStock();
  return order;
}
```

If called twice without an idempotency guard, this operation can produce duplicate effects.

### 8.3 FlashVault Implementation

The CheckoutEngine stores confirmed orders by reservation ID:

```typescript
private readonly orders =
  new Map<string, FlashSaleOrder>();
```

Before performing a checkout, it checks:

```typescript
const existingOrder =
  this.orders.get(reservationId);

if (existingOrder) {
  return {
    success: true,
    data: { ...existingOrder },
  };
}
```

A repeated checkout against the same CheckoutEngine returns the existing order instead of creating another.

### 8.4 Test Scenario

Twenty checkout calls are submitted for the same reservation.

Expected:

```text
Checkout calls: 20
Confirmed orders: 1
Sold quantity: 1
Unique order IDs: 1
```

### 8.5 Verification

The CheckoutEngine tests include repeated checkout and revenue calculations.

The stress suite includes a 20-request duplicate checkout scenario.

**Actual final result:** [Enter verified output]

### 8.6 Engineering Limitation

Idempotency applies within the lifetime of a single CheckoutEngine instance.

Refreshing the browser or creating a separate CheckoutEngine instance does not preserve the in-memory order map.

Durable multi-instance idempotency requires backend persistence and a shared transaction boundary.

### 8.7 Engineering Lesson

Checkout must be designed as an idempotent business operation, not merely a button click.

---

## 9. FM-06 — Timer and React Lifecycle Management

### 9.1 Problem

Browser timers and requestAnimationFrame callbacks may continue executing after React components unmount if the application does not release them.

Potential consequences include:

- Stale callbacks
- Unnecessary CPU activity
- Repeated state updates
- Duplicate timers during development
- Retained references and potential memory leaks

### 9.2 Timer Cleanup

The AntiDriftTimer exposes:

```typescript
cancel(): void
```

Its implementation cancels the pending animation frame.

The timer also supports repeated cancellation without scheduling additional work.

### 9.3 Inventory Monitor Cleanup

InventoryEngine provides:

```typescript
startExpiryMonitor()
stopExpiryMonitor()
dispose()
```

The React integration clears its dashboard refresh interval and stops the expiry monitor during effect cleanup.

### 9.4 React StrictMode Considerations

React development mode can run effect setup and cleanup more than once to expose lifecycle mistakes.

An implementation that permanently destroys a resource during the first cleanup and then reuses it during the next setup may fail.

FlashVault separates in-memory domain state from effect-owned timer scheduling.

The current InventoryEngine `dispose()` stops monitor scheduling; it does not destroy the stored product and reservation state.

### 9.5 Verification

Timer cancellation is covered by automated unit tests.

The inventory expiry monitor also has a cleanup test.

**Browser memory measurements:** [Not recorded]

### 9.6 Engineering Limitation

The existence of cleanup methods does not conclusively prove zero memory leaks.

Memory profiling requires browser-level observation over repeated lifecycle cycles.

### 9.7 Engineering Lesson

Every recurring callback should have a clearly defined owner and cleanup path.

---

## 10. Test Strategy and Verification Matrix

### 10.1 Automated Test Suites

| Test File | Cases Planned |
|---|---:|
| `anti-drift-timer.test.ts` | 9 |
| `inventory-engine.test.ts` | 20 |
| `checkout-engine.test.ts` | 10 |
| `flash-sale-stress.test.ts` | 10 |
| **Total** | **49** |

Run:

```bash
npm run build
npm run lint
npm run test
```

**Actual verification result:** [Insert final terminal output]

The planned total is 49 tests. It must not be reported as 49 passing tests until the final run confirms it.

### 10.2 Business Scenario Tests

| Scenario | Expected Outcome |
|---|---|
| Reserve one item | Available -1, Reserved +1 |
| Cancel reservation | Available +1, Reserved -1 |
| Checkout reservation | Reserved -1, Sold +1 |
| Expire reservation | Available restored |
| Checkout at deadline | Rejected |
| Checkout before deadline | Confirmed |
| Double checkout | One order |
| 20 buyers / 5 units | 5 success, 15 rejected |
| 100 buyers / 5 units | 5 success, 95 rejected |
| Mixed transactions | Conservation invariant holds |

### 10.3 UI Verification

- [ ] Dashboard loads without runtime errors.
- [ ] Countdown decreases correctly.
- [ ] Six products display with VND prices.
- [ ] Reserve Now creates a lock.
- [ ] Lock countdown is displayed.
- [ ] Cancellation releases reserved inventory.
- [ ] Checkout creates a confirmed order.
- [ ] Expiration automatically returns stock.
- [ ] 20-Buyer Burst updates inventory.
- [ ] Stock invariant remains VALID.
- [ ] Event Log reflects business transactions.
- [ ] Dashboard remains usable on mobile.

---

## 11. Git Decomposition & Commit History

The project was planned across eight development stages.

| Stage | Conventional Commit | Purpose |
|---|---|---|
| 1 | `chore: initialize HW3 flash sale project and decomposition` | Setup and requirements breakdown |
| 2 | `feat: implement deadline based anti drift timer` | Precision countdown |
| 3 | `feat: implement typed inventory reservation state machine` | Inventory contracts and transitions |
| 4 | `feat: implement inventory reservation locking and expiration` | Reservation expiry |
| 5 | `feat: implement checkout and concurrent purchase simulation` | Checkout and contention |
| 6 | `feat: build responsive flash sale dashboard` | React application |
| 7 | `test: verify timer inventory and checkout invariants` | Stress and race tests |
| 8 | `docs: finalize HW3 failure audit and verification` | Final audit and documentation |

Verify actual commit history using:

```bash
git log --oneline -8
```

The final submission should use the actual commit IDs and messages from Git rather than assuming planned labels match the repository.

### 11.1 Why Incremental Commits Matter

Task decomposition separates technical responsibilities and permits focused review.

Each stage produces a meaningful engineering deliverable that can be tested before integration with subsequent modules.

This reduces debugging scope and improves requirement traceability.

---

## 12. Technical Defense Questions

### Q1. What is a zero-drift countdown timer?

A timer that computes remaining time from an absolute deadline rather than subtracting a fixed amount on each scheduled callback.

It avoids accumulated callback scheduling drift relative to the chosen clock.

### Q2. Why use Date.now() instead of decrementing every second?

Because scheduled callbacks may execute late. Date.now() allows the application to calculate actual elapsed wall-clock time.

### Q3. Does this timer remain accurate if the system clock changes?

Not necessarily. Date.now() uses system wall-clock time and may jump if the system time changes.

A production system should use an authoritative campaign deadline and appropriate clock synchronization.

### Q4. What is optimistic inventory locking in this project?

A buyer temporarily reserves stock while preparing checkout.

The reservation decreases available inventory, records a deadline and either commits, expires or is cancelled.

The product version tracks changes, but the client-side simulation does not implement distributed optimistic locking.

### Q5. How does the system prevent overselling?

All reservations use one authoritative InventoryEngine instance.

The stock availability check and reservation mutation run synchronously without yielding between them.

### Q6. Why can 20 buyers submit requests concurrently but only five succeed?

The engine begins with five available units.

Each successful reservation removes one unit from availability. Once availability reaches zero, remaining requests are rejected.

### Q7. Does Promise.all mean the code runs on 20 threads?

No. Promise.all coordinates multiple asynchronous operations, but JavaScript callbacks execute according to the runtime event loop.

The current simulation does not provide 20 independent threads or distributed clients.

### Q8. How does reservation expiration work?

Every reservation stores `expiresAt`.

The engine compares the current timestamp against that deadline. Expired reservations release their reserved stock exactly once.

### Q9. Why can't the UI countdown determine whether checkout is allowed?

The UI can be stale or delayed.

Checkout must validate the current reservation status and expiration time through the domain engine.

### Q10. Why is available stock not reduced during checkout?

Because available stock was already reduced when the reservation was created.

Checkout transfers quantity from Reserved to Sold.

### Q11. What is idempotent checkout?

A repeated checkout request for the same reservation returns the previously confirmed outcome without producing another order or stock deduction.

### Q12. Can FlashVault prevent overselling across multiple browsers?

Not with the current architecture.

Each browser session has its own in-memory engine. A shared authoritative backend and atomic database operations are required for global inventory consistency.

### Q13. What role does the version field play?

It records the number of inventory mutations for a product.

A production optimistic concurrency system could use version comparison with conditional updates. FlashVault currently uses it as revision metadata.

### Q14. How do you verify the stock invariant?

After inventory operations, the engine validates:

```text
initialStock =
  availableStock + reservedQuantity + soldQuantity
```

The tests assert this invariant after reservations, cancellations, expirations and checkout.

### Q15. What are the most important AI-generated implementation risks?

Countdown drift, non-atomic stock updates, duplicate stock deductions, expired reservation checkout, duplicate orders and stale asynchronous callbacks.

These patterns require code review and targeted tests rather than reliance on generated code alone.

---

## 13. Final Acceptance Checklist

### Implemented Features

- [x] Precision deadline-based timer
- [x] RequestAnimationFrame scheduling
- [x] Typed inventory contracts
- [x] Reservation state machine
- [x] Reservation cancellation
- [x] Lock expiration
- [x] Checkout engine
- [x] Order idempotency
- [x] Purchase-burst simulator
- [x] Responsive FlashVault dashboard
- [x] Inventory event log
- [x] Source-level invariant checking

### Evidence to Verify

- [ ] Final build succeeds
- [ ] Final ESLint succeeds
- [ ] All expected tests pass
- [ ] Reservation/checkout browser behavior verified
- [ ] Lock expiry browser behavior verified
- [ ] Burst simulation result captured
- [ ] Timer drift test output captured
- [ ] Git history captured
- [ ] Responsive layout captured
- [ ] Final source changes committed

---

## 14. Engineering Findings

The FlashVault implementation demonstrates several design principles.

**First**, timing calculations should use an absolute reference rather than relying on callback frequency.

**Second**, stock consistency requires centralized authority and carefully defined state transitions.

**Third**, reservation and checkout must preserve inventory conservation.

**Fourth**, expiration must be checked at the transaction boundary.

**Fifth**, repeated business requests require idempotent processing.

**Sixth**, a passing client-side simulation is not equivalent to a production-grade distributed transaction system.

These principles apply to real e-commerce systems but require backend transactions, durable persistence and multi-client synchronization before production use.

---

## 15. Conclusion

FlashVault provides an academic simulation of a high-demand Vietnamese e-commerce flash sale.

The system implements an anti-drift countdown, typed inventory state machine, reservation locks, checkout validation, order idempotency and competing purchase-request simulations.

The technical audit identifies six AI-assisted development risks and documents the safeguards used in the codebase.

Automated and manual verification results must be reported according to the actual execution evidence.

**Final Engineering Statement:** FlashVault demonstrates correctness mechanisms for a single-instance in-memory flash-sale engine. It does not claim production-level distributed concurrency guarantees or unmeasured performance characteristics.

---

**End of AI Failure Mode Audit — Homework 03**