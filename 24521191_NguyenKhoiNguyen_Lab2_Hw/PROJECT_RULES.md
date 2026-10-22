# LAB02 PROJECT RULES

**Project:** Lab02 — Web Application Development (Three Homeworks)  
**Scope:** `Lab02_Homework_1`, `Lab02_Homework_2`, `Lab02_Homework_3`  
**Stack:** React, TypeScript, Vite, ESLint, Vitest where applicable  
**Status:** Repository engineering rules and review standard; not a claim that every test or audit was performed.

> **Purpose.** This file is the single governing reference for how the three homeworks should be maintained, reviewed, tested, documented, and submitted. It records the team's *chosen engineering rules* in addition to the assignment requirements. It is not a substitute for the actual source code, test output, Lighthouse results, or Git history.

## Part 0 — Global Rules for Lab02

### G01 — Repository boundaries and file ownership

1. Keep the three homeworks as separate applications. Each has its own `src/`, `package.json`, local dependencies, scripts, documentation, and evidence.
2. A change for HW1 must not modify HW2 or HW3; likewise for the other homeworks, except when a clearly documented repository-wide maintenance change is expressly required.
3. Place this file at the **Lab02 homework parent folder** (beside the three `Lab02_Homework_*` directories). Do not duplicate conflicting copies.
4. Treat the application source as authoritative for implementation facts. Keep `README.md`, `TASK_DECOMPOSITION.md`, and `AI_FAILURE_AUDIT.md` consistent with actual code.
5. Never commit `node_modules/`, `dist/`, cache folders, local secrets, private keys, `.env.local`, or generated temporary files.
6. Preserve existing functional modules unless a test, review, or reproducible defect justifies editing them. Prefer the smallest viable change.

### G02 — Engineering order and decomposition

Every homework uses the same delivery process: **requirements → decomposition → domain contracts → implementation → tests → browser validation → audit → evidence → commit**.

- Before coding, identify input/output contracts, state owners, side effects, browser API dependencies, error states, cleanup obligations, and acceptance criteria.
- Each stage must produce an independently reviewable deliverable. Decomposition documents must be operational: task IDs, dependencies, file ownership, done criteria, edge cases, and planned evidence, not vague lists of features.
- Do not mark stages or checklist items `DONE` based only on code being pasted. Mark them done after the relevant checks pass.
- When a bug is found, add a regression scenario/test if practical, and record its root cause and the verified fix.
- Do not refactor unrelated working code during final verification.

### G03 — TypeScript and architecture

1. Use explicit domain types for publicly shared data and statuses. Avoid `any`, implicit `any`, and unvalidated type assertions.
2. A React component owns presentation and user interaction; domain modules own business invariants; adapter modules own browser API integration.
3. Prefer dependency injection for external effects (`fetch`, clocks, schedulers, ID generation, decoding) when deterministic tests are beneficial.
4. Avoid mutating state snapshots or React props. Treat snapshots as read-only projections of authoritative domain state.
5. Validate inputs at module boundaries; rejected operations must not partially mutate domain data.
6. All asynchronous operations must have explicit success, failure, cancellation, and cleanup paths.
7. Use descriptive names, short functions with narrow responsibilities, and comments that explain *why* an invariant is necessary.
8. No silent catches that conceal business failures. Cleanup-only catches may be narrow and documented.

### G04 — Testing and claims

- In each homework directory run `npm run build`, `npm run lint`, and `npm run test` when test suites exist. A build passing is **not** equivalent to functional browser validation.
- Do not report `100/100`, `60 FPS`, `zero memory leaks`, `49/49 tests`, or any other metric unless actual evidence has been captured. Use `target`, `expected`, or `not verified` as appropriate.
- Unit tests validate modeled behavior; integration tests validate real browser APIs and wiring; manual checks validate UX. The three categories must be distinguished.
- Tests should include normal operations, boundary conditions, invalid input, repeated actions, interrupted operations, and cleanup where relevant.
- Do not weaken assertions or disable lint rules just to make checks pass. If a rule must be suppressed, explain the reason near the suppression and in the audit.
- Never invent screenshots, audit scores, test logs, or Git commits.

### G05 — Git and atomic commit policy

- Homework 3 requires **at least eight discrete Conventional Commits** by the assignment. HW1/HW2 also follow an incremental stage-by-stage commit workflow adopted for this repository.
- Use prefixes such as `chore:`, `feat:`, `fix:`, `test:`, `docs:`, `refactor:`; one commit should describe one logical change.
- Stage only the relevant files (`git add <explicit paths>`). Review `git diff --cached` before committing.
- Run relevant checks before the commit; do not commit knowingly broken states unless explicitly documenting a reproducible failure in a dedicated experiment branch.
- Do not falsify incremental history by splitting one already-finished code dump into artificial commits. Each commit should represent real progression.
- `git push` is separate from `git commit`; verify the correct repository and branch before pushing.
- Verify final history with `git log --oneline` and final changes with `git status --short`.

### G06 — AI-assisted development and originality

- Use references, including teammate code, to understand *requirements and engineering tradeoffs*, not to mask copied code through superficial renaming.
- Independently justify architecture, error handling, UI design, and tests; implementation differences should arise from real design choices.
- AI-generated code is untrusted until read, compiled, tested, and run in the browser.
- Document at least the assignment-required AI failure modes. Label each as **Observed**, **Reproduced in controlled test**, or **Potential risk**.
- For each audit finding document: context → symptom → root cause → incorrect pattern → correction → evidence → limits → prevention rule.
- Do not describe hypothetical failure cases as bugs that actually occurred.

### G07 — Evidence and final submission

- Store proof under each homework's `evidence/` folder with ordered descriptive filenames.
- Prefer screenshots showing context and result together (application UI, browser tooling, and/or test summary). Do not crop away a failure that changes the interpretation.
- Include actual test outputs, important interaction states, and the meaningful Git history.
- Screenshots are evidence of the visible state at capture time, not blanket proof of long-term correctness.
- Final submission check: source, config, package lock, decomposition, audit, build/lint/test output, required screenshots, no secrets, no accidental generated dependencies.

---

# Part I — HW1: Production Enterprise Data-Grid (WCAG 2.2 AA)

## HW1.01 — Scope and accessibility contract

HW1 is a **native-table-first, accessible enterprise asset registry**. Its defining requirements are sorting, filtering, pagination, keyboard navigation, selection, semantic grid structure, screen-reader support, WCAG 2.2 Level AA expectations, at least **4.5:1 normal text contrast**, and verified **100/100 Lighthouse Accessibility and Best Practices** as assignment targets.

The product scenario is **Enterprise Asset Management / IT Operations**; the dataset is an enterprise asset inventory with stable IDs, device names, categories, departments, and statuses. The visual styling can vary, but the interaction contract cannot be weakened for aesthetics.

## HW1.02 — Semantic markup rules

1. Use native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, and `<button>` rather than a grid built from generic `<div>` elements.
2. Preserve real table relationships for headers and cells; avoid arbitrary nesting that breaks table semantics.
3. The assignment's ARIA grid requirement (`role="grid"`, `role="row"`, `role="gridcell"`) must be implemented thoughtfully with native elements. Do not redundantly override native semantics without testing in assistive technology.
4. Give the data grid a meaningful accessible name via a visible caption or a valid accessible labeling relationship.
5. Use actual `<button>` elements for sortable column headers and row actions; do not use clickable noninteractive spans.
6. Accessible names must describe the action, e.g., `View details for asset IT001`, not merely `Click`.
7. Use `aria-sort` only on the column actively controlling order; use permitted values (`ascending`, `descending`, `none`) consistently.

## HW1.03 — Keyboard navigation rules

- Arrow Up/Down/Left/Right moves active grid focus according to the documented cell-navigation model.
- Enter activates the selected cell's intended primary action; Space toggles selection where that behavior is defined. Do not break default controls or hijack Space on unrelated buttons/inputs.
- Use a consistent roving `tabIndex` strategy, or an equivalently verified accessible focus system; only the intended cell is part of the active grid tab sequence.
- Focus must not be trapped. Tab and Shift+Tab can enter and leave the grid.
- Prevent default scroll behavior only for keys handled by grid navigation and only in the appropriate context.
- Sorting, filtering, page changes, and row removal must never leave focus pointing to an element that no longer exists. Repair focus to the nearest valid target.
- Keyboard behavior must remain correct with 0, 1, and many matching rows.

## HW1.04 — Data operations and component contracts

- Keep the typed generic grid contract centered on `ColumnDef<T>` and `DataGridProps<T>`; columns expose headers and typed accessor keys, with optional sorting capability.
- Treat sorting, filtering and pagination as derived views over one authoritative dataset. **Apply filter → sort → paginate** in that order.
- Sorting must be deterministic; apply a stable secondary comparison when values are equal if necessary.
- Pagination boundaries must be clamped after filtering or a page-size change.
- Search should be case-insensitive and trim extra spaces; document which fields are searched.
- Empty result states must announce that no records matched and provide a way to clear filters.
- The selection state must use stable asset identifiers rather than row indices, which change under sort/filter/pagination.
- A row's View action must actually open relevant details or perform its advertised action; inert buttons are defects.
- Keep sample asset data distinct from grid behavior so the component remains reusable.

## HW1.05 — Contrast, responsiveness, and inclusive design

- Normal body text must meet WCAG AA contrast of at least **4.5:1**; large text generally requires at least **3:1**. Evaluate non-text control boundaries and focus indicators separately under applicable WCAG criteria.
- Preserve visible focus indicators in both light and dark themes; never remove outlines without equivalent replacement.
- Labels, instructions, errors, selected states and disabled states must not be conveyed by color alone.
- Touch targets, spacing, zoom/reflow, and reduced-motion behavior must be examined against relevant WCAG 2.2 AA criteria.
- Prefer horizontal table scrolling at narrow widths rather than hiding essential columns without a documented alternative.
- Do not introduce inaccessible hover-only actions.

## HW1.06 — Accessibility verification policy

1. Run Lighthouse on a production build or clearly state the environment and mode used.
2. Record **Accessibility** and **Best Practices** separately. A 100 score is a requested outcome, not a permanent claim.
3. Test keyboard-only workflows: navigate cells, sort, filter, select, change page, and open details.
4. Use browser accessibility inspection and at least one screen-reader smoke test where available; Lighthouse cannot establish complete WCAG conformance.
5. Test 200% zoom / narrow viewport, focus visibility, empty results and long cell values.
6. When a Lighthouse finding originates from browser extensions, third-party tooling or local server settings, identify it explicitly; do not hide legitimate app defects by changing the test environment without explanation.
7. Keep the `AI_FAILURE_AUDIT.md` grounded in actual failures and architectural risks, including native semantics, ARIA misapplication, keyboard focus, and browser/security tooling observations.

## HW1.07 — Evidence and acceptance

Recommended files: dashboard overview; keyboard focus/navigation; sorting and filtering; pagination/empty state; View/selection; Lighthouse Accessibility 100; Lighthouse Best Practices 100; Git stage history. Only label `100` in a filename when the screenshot shows that measured result.

**HW1 done condition:** semantics + functional controls + documented keyboard flow + verified accessibility checks + no unexplained console errors + build/lint pass + audit and evidence consistent with actual results.

---

# Part II — HW2: Concurrent FIFO Audio Visualizer Queue Engine

## HW2.01 — Scope and module boundaries

HW2 is **SonicFlow**, a browser audio workstation with FIFO task scheduling, download and audio decoding, cancellation, Web Audio playback, FFT-based visualization, and careful cleanup. Main modules are `audio-types.ts`, `audio-queue-controller.ts`, `audio-loader.ts`, `audio-engine.ts`, `AudioVisualizer.tsx`, and `App.tsx`.

The target includes Web Audio `AnalyserNode` FFT sizes 256 and 512, responsive 60 FPS Canvas rendering where practical, and no unowned audio or rendering resources. These are requirements and engineering targets, not automatically verified performance metrics.

## HW2.02 — Queue and concurrency invariants

1. Every enqueued task receives a stable ID and an explicit lifecycle status.
2. Exactly one task processor may be active at once **for the FIFO execution pipeline**; this does not prohibit multiple UI submissions.
3. Process the pending queue in insertion order. A failed or cancelled task must not permanently block later tasks.
4. Resolve or reject a task Promise no more than once. Cancellation must not allow a late successful result to re-enter UI state.
5. Keep `AbortController` per task; cancellation of one task must not inadvertently cancel another.
6. Task snapshots supplied to React must not expose mutable queue internals.
7. Disposal must reject or settle pending tasks according to the controller's documented contract, clear subscriptions and stop new enqueue operations.
8. FIFO ordering must be demonstrated with deterministic deferred-Promise tests, not only a quick browser screenshot.

## HW2.03 — Fetch and audio decoding rules

- Inject a fetch implementation for unit tests, but bind the native browser fetch correctly when storing it as a method: `options.fetcher ?? window.fetch.bind(window)`.
- **Confirmed incident:** unbound `fetch` produced `Failed to execute 'fetch' on 'Window': Illegal invocation` for demo WAV tasks. This regression must be documented and covered by appropriate browser integration verification.
- Propagate `AbortSignal` into network operations. Distinguish network errors, non-OK HTTP responses, invalid audio payloads, decoding failures and user cancellation.
- Do not claim `decodeAudioData()` is directly abortable. If cancellation occurs during decoding, suppress/discard the eventual result after resolving the decode promise.
- Use `Blob` object URLs only as long as needed; revoke them in success, error, cancellation and unmount paths, without revoking them before an in-flight fetch can finish.
- External URLs can fail due to CORS, formats or server permissions; expose actionable errors instead of misleading `FAILED` labels alone.

## HW2.04 — Web Audio state and cleanup

1. `AudioEngine` owns its AudioContext, active AudioBufferSourceNode, AnalyserNode and GainNode.
2. Graph ownership: source → analyser → gain → destination. Avoid duplicate graph connections and multiple active sources during track changes.
3. An AudioBufferSourceNode is one-shot. Pause/resume must create a fresh source using a captured playback offset.
4. Source release must remove callbacks, stop when applicable, disconnect and clear references; stale `onended` callbacks cannot mutate a newer source's state.
5. Volume is clamped to `[0,1]`; FFT size is restricted to 256 or 512, giving 128 or 256 frequency bins.
6. Initialization, playback, pause, stop and disposal must tolerate repeated user actions and rejected browser promises.
7. `AudioContext` initialization must respect autoplay/user-gesture restrictions. Do not assume that `context.state === 'running'` before playback.
8. Context disposal must be idempotent. Do not reuse an instance that has already been disposed.

## HW2.05 — React StrictMode lifecycle rule (critical)

**Confirmed incident:** SonicFlow briefly rendered and then went blank with `AudioEngine has already been disposed` when `AudioVisualizer.subscribe()` ran against a disposed engine during React StrictMode's effect setup/cleanup rehearsal.

- Keep React StrictMode enabled during the final development validation whenever possible. Disabling it may diagnose the issue but is not a genuine fix.
- Never create a lifetime resource in a persistent React initializer and permanently dispose it during an effect cleanup if a subsequent setup will reuse it.
- Assign one lifecycle owner for each engine, subscription, interval, decoder context and RAF loop.
- Ensure every setup/cleanup/re-setup sequence is valid, especially in development StrictMode.
- UI status labels such as LIVE/STANDBY must derive from real engine state. Subscribe safely or use a suitable external-store bridge; stale labels do not prove audio is playing.
- Test navigation/unmount, component remount and rapid Play/Pause/Stop without blank screens or unhandled rejections.

## HW2.06 — Visualizer and performance rules

- Render frequency/waveform samples to Canvas directly within `requestAnimationFrame`; do not call React `setState` per visual frame.
- Only update FPS or nonvisual telemetry at a lower rate, e.g., once a second.
- Support Spectrum, Oscilloscope and Circular modes; changing mode or FFT size must not leak multiple RAF loops.
- Manage Canvas resolution using dimensions and device pixel ratio; detach `ResizeObserver` and cancel the scheduled frame on cleanup.
- Show a truthful standby state when no track is playing, and a descriptive fallback for unsupported Canvas APIs.
- **60 FPS is a target**, influenced by refresh rate, CPU/GPU, tab visibility and throttling. Record observed FPS and test conditions before claiming success.
- Unit tests verifying `.stop()`, `.disconnect()` and `.close()` are valuable but do **not** establish absolute zero memory leaks. Use repeated playback cycles and browser memory snapshots to support claims.

## HW2.07 — HW2 acceptance and evidence

Test queue ordering, concurrent enqueue requests, cancellation, failure recovery, network/decode errors, source recreation on resume, cleanup, FFT bin counts, volume clamps, live browser playback, all three visualization modes and no React runtime crash. Expected test counts from the developed suites were 6 FIFO + 7 loader + 8 engine = 21, **subject to the final actual test run**.

Recommended evidence: SonicFlow dashboard; pending/processing/completed FIFO; cancellation; ready track and audio playback; each visualization mode; FFT 256/512; observed FPS; tests; browser memory investigation; Git history. Do not stage demo media files unnecessarily or publish copyrighted audio without permission.

**HW2 done condition:** working real-browser demo, correct FIFO/cancellation contracts, safe resource lifecycle, build/lint/test pass, verified metrics where claimed, and audit distinguishes the two confirmed browser/lifecycle incidents from potential risks.

---

# Part III — HW3: High-Concurrency Flash-Sale E-Commerce Engine

## HW3.01 — Scope and honest concurrency model

HW3 is **FlashVault 11.11**, a Vietnamese flash-sale *simulation* using a zero-drift countdown and inventory reservation state machine. Main modules: `anti-drift-timer.ts`, `inventory-types.ts`, `inventory-engine.ts`, `checkout-engine.ts`, `product-data.ts`, `App.tsx`, plus tests.

- Use VND formatting and a distinctly Vietnamese 11.11 mega-sale scenario; sample product names, prices and stock are simulated data.
- **Do not claim global consistency across users, tabs, devices or servers.** Each browser session owns an in-memory inventory instance. `Promise.all()` models competing asynchronous submissions but does not create a distributed transaction protocol.
- Real production correctness would require a shared backend with atomic conditional stock updates, persistence, idempotency keys and server-authoritative deadlines.

## HW3.02 — Anti-drift countdown contract

1. Compute `deadline = Date.now() + durationMs` once at timer creation.
2. At every update compute `remaining = Math.max(0, deadline - Date.now())`; do not decrement by guessed `setInterval` periods.
3. `requestAnimationFrame` schedules visualization; it is **not** the clock source.
4. Remaining time is never negative. At zero the timer transitions to completed and schedules no more frames.
5. `cancel()` is idempotent and prevents further tick delivery. Clear all scheduled callbacks on unmount.
6. Inject clock/scheduler in timer unit tests to simulate delayed frames and cancellation deterministically.
7. `Date.now()` may jump when the system clock changes; this approach addresses callback drift only, not clock tampering or server-time accuracy.
8. Campaign cutoff and reservation lock expiration are separate deadlines. Do not confuse the campaign's 10-minute demo timer with each reservation's 30-second lock.

## HW3.03 — Inventory domain and state transitions

Domain inventory values are `initialStock`, `availableStock`, `reservedQuantity`, `soldQuantity`, and `version`. A reservation has a stable ID, product ID, buyer ID, quantity, creation time, expiry deadline, and status.

- Allowed persisted reservation statuses: `reserved`, `committed`, `expired`, `cancelled`; `REQUESTED`/`REJECTED` describe request decisions, not persistent successful locks.
- Normal transitions: request → reserved; reserved → committed OR expired OR cancelled. Terminal states cannot transition again.
- Validate positive safe-integer quantities and valid positive finite reservation durations; reject insufficient stock and unknown products before mutation.
- Enforce `initialStock = availableStock + reservedQuantity + soldQuantity` and nonnegative counters after every successful transition.
- `reserve()` decreases Available and increases Reserved **once**; `cancel()`/expiry reverses that transfer **once**; `commitReservation()` decreases Reserved and increases Sold, **without reducing Available again**.
- Product and reservation snapshots returned to React are copies; outside callers must not mutate internal inventory state.
- All stock-changing commands go through a single InventoryEngine instance for the simulation. The `version` field records revisions; it is **not** a distributed compare-and-swap mechanism.

## HW3.04 — Reservation lock expiry rules

1. Every reservation stores `expiresAt = createdAt + lockDurationMs`.
2. At any operation that depends on the lock's validity (especially new reservation, cancellation and checkout), reconcile overdue reservations against the current clock.
3. A lock is expired when `now >= expiresAt` (exact boundary matters).
4. An expired lock releases Reserved to Available exactly once; multiple expiry sweeps may not double-release stock.
5. Committed and cancelled reservations must never expire into another terminal state.
6. An expiry monitor may poll periodically for UI responsiveness, but absolute expiry timestamps remain authoritative.
7. Starting the monitor repeatedly must not create duplicate intervals; stopping/disposal must clear it.
8. Do not authorize checkout merely because a stale React countdown still displays time remaining.

## HW3.05 — Checkout and order idempotency

- Checkout must verify reservation existence, active status and expiry **at commit time**.
- `InventoryEngine.commitReservation()` is the only operation allowed to transfer Reserved to Sold.
- `CheckoutEngine` coordinates order creation and reads authoritative state; it must not directly mutate copied product snapshots.
- Map committed orders by reservation ID. Repeated checkout for the same reservation in the same CheckoutEngine instance returns the existing order, not another stock mutation.
- Price and quantity should be captured consistently for the order. If production prices become mutable, lock the quoted price at reservation time; document this extension rather than implying current persistence.
- Revenue includes confirmed orders only; cancelled, expired and rejected attempts produce no revenue.
- Order idempotency is session-local. Durable exactly-once payment/checkout requires an external transaction system and is out of scope.

## HW3.06 — Stress test and fairness rules

- Test 20 buyers for 5 units, 100 buyers for 5 units, and contention over the last single unit.
- Expected for an empty, fresh stock=5 session with quantity=1: 20 attempts → at most 5 successes/15 rejections; 100 attempts → at most 5 successes/95 rejections.
- Outcomes depend on *remaining* stock, not always the product's initial stock. Reset the session before screenshotting a predefined scenario.
- Test just before expiry and **exactly at** expiry; repeated checkout; cancellation followed by expiry; checkout followed by expiry; mixed operations; invariant preservation.
- Tests must use a deterministic fake clock or injected scheduler rather than sleeping for 30 seconds.
- Do not label single-threaded Promise scheduling as true distributed contention or network load testing. Clarify the simulation model in the audit.

## HW3.07 — UI interaction and lifecycle rules

- The flash-sale UI must reflect true inventory-engine snapshots for Available, Reserved, Sold, and event history.
- The user must see whether an action succeeded or failed, why a reservation was rejected, and whether a lock is active or expired.
- Confirmed Checkout and Cancel buttons must actually invoke engine operations and update display state.
- Keep the session creation and interval lifecycle compatible with React StrictMode. Cleanup effect-owned timers without destroying domain state that the next development setup will reuse.
- Give visible labels and accessible focus styles to product buttons, Buyer ID input, checkout/cancel actions, and the burst test control.
- Use accessible number/currency formatting (`Intl.NumberFormat('vi-VN', { currency:'VND', style:'currency' })`).
- A disabled button does not replace domain validation; every operation must validate its state independently from the UI.

## HW3.08 — Required audit content and evidence

`AI_FAILURE_AUDIT.md` must document **at least three** AI failure modes; this project analyzes six: interval drift, overselling race, double stock deduction, expiry/check-out race, duplicate checkout, and timer cleanup. Explicitly identify which were actually reproduced; do not fabricate a defect history.

Expected test-suite plan after Stages 1–7: 9 timer + 20 inventory + 10 checkout + 10 stress = 49 tests. Treat **49/49** as a target until the actual final Vitest output confirms it.

Recommended evidence: full dashboard; timer/fake-clock tests; reservation before/after stock state; confirmed checkout; expired lock and released stock; 20-buyer burst on a fresh 5-unit session; full test summary; eight meaningful Git commits. Add a separate 100-buyer stress screenshot when useful.

**HW3 done condition:** deadline timer, state machine, expiry, idempotent checkout, browser interactions and stress tests work; invariant stays valid; documentation is accurate; and **at least eight real, discrete Conventional Commits** exist.

---

# Final Cross-Homework Review Gate

Before final submission, verify each item below for **all three** homework folders:

- [ ] `npm install` (if fresh clone) and `npm run build` succeed.
- [ ] `npm run lint` passes without unexplained errors.
- [ ] All implemented unit tests pass; record exact totals and test date.
- [ ] Real browser workflow has been checked; no unresolved runtime crash.
- [ ] Mandatory assignment-specific behavior was tested, not merely implemented.
- [ ] Each `TASK_DECOMPOSITION.md` matches completed stages and source paths.
- [ ] Each `AI_FAILURE_AUDIT.md` distinguishes observed failures from theoretical risks.
- [ ] Evidence filenames correspond to genuine captured results.
- [ ] Git history shows meaningful incremental work and correct commit messages.
- [ ] `git status --short` is understood; no unintended files remain.
- [ ] No secrets, `node_modules`, or build outputs are included in commits.

**Rule priority:** instructor rubric and explicit requirements → verified code behavior and test evidence → this project rulebook → stylistic preferences. If a conflict appears, document and resolve it; do not silently assert compliance.
