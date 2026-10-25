# LAB03 — EXERCISE 2 | TASK DECOMPOSITION & VERIFICATION

**Assignment:** Interactive Scientist & Pioneer Directory
**Stack:** React 19 · Vite · JSX · CSS Modules · ES2023
**Engineering standard:** `../PROJECT_RULES.md` (master; mobile-first)
**Scope of inheritance:** Lab02 only (especially Lab02 Exercise 2)
**Commit constraint:** Exactly three atomic commits for Exercise 2
**Snapshot:** Commits 1 and 2 completed/pushed (user-confirmed; hashes not supplied). Stage 3 features, responsive checks and lint/build user-confirmed PASS. Final WBS consolidated **before Commit 3**.
**Checklist rule:** `[x]` means implemented/verified by available evidence or user-reported checks; `[ ]` means unverified/pending. Outstanding accessibility/source checks and Commit 3 remain pending. No Git hash is invented.

---

## 1. Assignment Contract & Acceptance Baseline

### 1.1 Functional and Engineering Scope

| ID | Requirement | Required behavior / verification | Stage |
|---|---|---|---|
| R01 | Seven people: original six + student (name, age, IQ) | 1 |
| R02 | Stable unique IDs, semantic React list, React 19 | 1 |
| R03 | Case-insensitive substring name search | 2 |
| R04 | Minimum IQ numeric input via `valueAsNumber` | 2 |
| R05 | Sort by IQ and Age using ES2023 `.toSorted()` | 2 |
| R06 | Independent source states: people, query, minIq, sortBy | 2 |
| R07 | No `useEffect` or redundant state for filter/sort | 2 |
| R08 | `useId()` and labels bound using `htmlFor` | 2 |
| R09 | Immutable delete using functional updater and `.filter()` | 3 |
| R10 | Reset restores initial seven-record snapshot | 3 |
| R11 | Result count: `<output role="status" aria-live="polite">` | 3 |
| R12 | Delete stability: keys, remaining identity and focus | 3 |
| R13 | React DevTools Profiler one update commit per typed character under controlled conditions | 2/3 |
| R14 | Mobile-first from 320/375px; progressive tablet/desktop | 1/3 |
| R15 | Exactly three atomic feature commits with staged file review | 1/2/3 |

### 1.2 Dataset Reference

| ID | Name | Age | IQ |
|---|---|---:|---:|
| sp-1 | Johann Goethe | 82 | 210 |
| sp-2 | Albert Einstein | 76 | 205 |
| sp-3 | Leonardo da Vinci | 67 | 180 |
| sp-4 | Isaac Newton | 84 | 190 |
| sp-5 | James Maxwell | 48 | 190 |
| sp-6 | William Sidis | 46 | 200 |
| sp-7 | Nguyen Khoi Nguyen | 20 | 110 |

**Student record:** The submitted `scientists.js` screenshot shows `sp-7` with numeric `age: 20`, `iq: 110`. The IQ is treated as student-provided demonstration data, not a clinically verified measurement.

### 1.3 Commit Plan — Fixed Boundaries

| Commit | Scope | Required exact message | Status |
|---|---|---|---|
| 1 | Schema, component, initial responsive UI, WBS and inheritance analysis | `feat(ex2): normalize smartPeople schema with stable IDs` | COMPLETED — user-confirmed; hash not provided |
| 2 | Controlled search + numeric IQ + derived sorting | `feat(ex2): add search, IQ filter & toSorted` | COMPLETED AND PUSHED — user-confirmed; hash not supplied |
| 3 | Delete/reset + accessible status + final QA | `feat(ex2): add delete/reset & live status` | IMPLEMENTED/TESTED — pre-commit QA pending |

**Git boundary rule:** Keep changes scoped to `Lab03_Exercise_2/`. Do not stage files from Lab02, Ex1, Ex3 or the parent `PROJECT_RULES.md`. Perform a consolidated WBS edit immediately before each allowed commit; no extra documentation-only commit.

---

## 2. Lab02 → Lab03 Inheritance & Migration Contract

### 2.1 Scope and Source Provenance

Lab03 Exercise 2 **inherits architectural principles from Lab02**, not Lab01. Lab02 Exercise 2 is the primary verified source: `reactive-engine.js`, `task-app.js`, and `event-delegation-hub.js`. Lab02 Exercise 1 VNode/reconciliation and Lab02 Exercise 3 React/Vite concepts are supporting references; their source-level audits are separately tracked. The original `smartPeople` implementation named in Lab03 slides was **not found in reviewed Lab02 Ex2**: the six scientist records come from the Lab03 assignment, not a proven copied legacy array.

### 2.2 Inheritance / Refactoring Matrix

| ID | Lab02 verified source or lesson | Lab03 target | Decision |
|---|---|---|---|
| I01 | Ex2 `reactive-engine.js`: global `stateStore`, cursor, custom `useState` | React 19 `useState(initialData)` | REPLACE infrastructure |
| I02 | Ex2 `Object.is` and functional dispatcher | Functional updater; immutable list state | REUSE principle |
| I03 | Ex2 `task-app.js`: `visibleTasks` derived during render | `visiblePeople` pure search → filter → sort | EXTEND behavior |
| I04 | Ex2 `task-app.js`: `.map()` / `.filter()` | Semantic `<ul><li>` and person filtering | REFACTOR |
| I05 | Ex2 `task-app.js`: array-spread state update | Immutable deletion via `.filter()` | EXTEND |
| I06 | Ex2 `event-delegation-hub.js`: root click listener | React `onClick` / `onChange` | REPLACE infrastructure |
| I07 | Lab02 reconciliation teaching; Ex2 task list lacks entity keys | Persistent `person.id`, `key={person.id}` | IMPROVE |
| I08 | Lab02 render-cascade explanation | No effect-synchronized filtered state | REUSE principle |
| I09 | React 19 architecture requirements from Lab03 slides | Controlled forms, `useId`, `valueAsNumber`, `.toSorted()` | NEW implementation |

### 2.3 Source to Target Code Transitions

**State engine — architectural replacement:**
```js
// Lab02: compare old/new reference before triggering a custom render
if (!Object.is(previousValue, resolvedValue)) {
  stateStore[currentCursor] = resolvedValue;
  triggerRender();
}
```
```jsx
// Lab03: framework-managed Hooks (delete is implemented in Stage 3)
const [people, setPeople] = useState(initialData);
setPeople(prev => prev.filter(person => person.id !== targetId));
```
**Derived data — Stage 2 implemented and functionally tested (illustrative simplification):**
```jsx
const visiblePeople = people
  .filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase()) && p.iq >= minIq)
  .toSorted((a, b) => {
    switch (sortBy) {
      case 'iq-asc': return a.iq - b.iq;
      case 'age-desc': return b.age - a.age;
      case 'age-asc': return a.age - b.age;
      default: return b.iq - a.iq;
    }
  });
```
**Identity:** `<li key={person.id}>` preserves React item identity across reorder/removal; array index is not a stable key. **Events:** React controlled inputs replace the custom event-delegation hub; `useId()` associates `<label>` and `<input>`; numeric input is read through `valueAsNumber`.

### 2.4 Inheritance Audit Checklist

- [x] **2.4.1.1** Inspect Lab02 Ex2 `reactive-engine.js`: stateStore, cursor, resetCursor, dispatcher.
- [x] **2.4.1.2** Verify useState functional updater, `Object.is` and rerender trigger.
- [x] **2.4.1.3** Inspect Lab02 Ex2 `task-app.js`: derived visibleTasks, filter/map, immutable updates.
- [x] **2.4.1.4** Inspect Lab02 Ex2 `event-delegation-hub.js`: root click listener and target traversal.
- [x] **2.4.1.5** Document key limitation: previous task list did not provide persistent entity keys.
- [x] **2.4.1.6** Map verified Ex2 patterns to React 19; distinguish reuse/refactor/new implementation.
- [ ] **2.4.1.7** Complete separate source-level inspection of Lab02 Ex1 VNode implementation (supporting reference).
- [ ] **2.4.1.8** Complete separate source-level inspection of Lab02 Ex3 React/Vite implementation (supporting reference).
- [x] **2.4.1.9** Record legacy `smartPeople` source as unverified rather than claim direct source reuse.
- [ ] **2.4.1.10** Verify final Lab03 implementation against all migrated patterns (Stages 2–3); functional migration user-reported PASS, detailed final source/focus audit pending.

**Analysis status:** Primary Lab02 Ex2 source audit complete; Stage 2 migration observed through search/filter/sort, with Stage 3 delete/reset now implemented and user-tested; optional supporting Ex1/Ex3 source audits and formal final source review remain open.

---

## 3. Stage 1 — Environment, Dataset & Initial Directory

**Stage outcome:** Runnable React 19 directory rendering all seven people with stable keys and mobile-first CSS. **Commit boundary: #1.**

### 3.1 Checkpoint 1A — Project Environment

#### 3.1.1 Setup

- [x] **3.1.1.1** Open project folder `Lab03_Exercise_2` and inspect the existing files.
- [x] **3.1.1.2** Initialize Vite React and install project dependencies.
- [x] **3.1.1.3** Confirm React 19 and react-dom 19 (via npm inspection).
- [x] **3.1.1.4** Confirm Vite project scripts/configuration.
- [x] **3.1.1.5** Confirm master `PROJECT_RULES.md` scope; do not duplicate rules.
- [ ] **3.1.1.6** Explicitly inspect `.gitignore` for `node_modules` and `dist` (not shown directly; neither appeared in staged file list).

#### 3.1.2 Environment Quality Checks

- [x] **3.1.2.1** Run development server and open the application in Chrome.
- [x] **3.1.2.2** Verify current project launches without blocking error.
- [x] **3.1.2.3** Record a current `npm run lint` PASS before Commit 1.
- [x] **3.1.2.4** Record a current `npm run build` PASS before Commit 1.
- [ ] **3.1.2.5** Capture/save environment evidence in a durable location if required.

### 3.2 Checkpoint 1B — Lab02 Analysis

- [x] **3.2.1.1** Audit Ex2 `reactive-engine.js` and document custom state model.
- [x] **3.2.1.2** Audit Ex2 `task-app.js` for map/filter, derived state and immutable updates.
- [x] **3.2.1.3** Audit Ex2 `event-delegation-hub.js` for native event routing.
- [x] **3.2.1.4** Complete inheritance matrix and write migration rationale (Section 2).
- [x] **3.2.1.5** State explicitly that Lab02 Ex2 did not verify original `smartPeople` source.
- [ ] **3.2.1.6** Confirm remaining Lab02 Ex1/Ex3 supplementary source review if needed.

### 3.3 Checkpoint 1C — `SMART_PEOPLE` Data Foundation

#### 3.3.1 Data Schema and Student Entry

- [x] **3.3.1.1** Create `src/data/scientists.js` and export `SMART_PEOPLE`.
- [x] **3.3.1.2** Represent each person using `id`, `name`, `age`, `iq`.
- [x] **3.3.1.3** Enter six slide-specified scientist records without altering their values.
- [x] **3.3.1.4** Add `sp-7`, Nguyen Khoi Nguyen, age 20 and IQ 110 (student-entered).
- [x] **3.3.1.5** Use stable IDs `sp-1` through `sp-7` and numeric ages/IQs.
- [x] **3.3.1.6** Verify `console.table(SMART_PEOPLE)` displays all seven records.
- [ ] **3.3.1.7** Run the dedicated schema assertions: 7 rows, unique IDs, valid names, finite numeric ages/IQs.
- [ ] **3.3.1.8** Capture schema-check output after all assertions PASS.

### 3.4 Checkpoint 1D — Initial Scientist Directory

#### 3.4.1 React 19 Component & Semantic Structure

- [x] **3.4.1.1** Create `src/components/ScientistDirectory.jsx` with named export.
- [x] **3.4.1.2** Use `useState(initialData)`; defer the setter usage to Stage 3.
- [x] **3.4.1.3** Use a semantic `<section>`, heading, `<ul>`, `<li>` and article content.
- [x] **3.4.1.4** Render names, ages and IQs from `people.map`.
- [x] **3.4.1.5** Set `key={person.id}` (never array index).
- [x] **3.4.1.6** Mount directory from `App.jsx`.
- [x] **3.4.1.7** Add `useId()` with controlled inputs in Stage 2 (completed in Stage 2).

#### 3.4.2 Mobile-First CSS Module

- [x] **3.4.2.1** Create `ScientistDirectory.module.css` and mobile base layout.
- [x] **3.4.2.2** Use a single-column list initially with responsive grid enhancement.
- [x] **3.4.2.3** Use semantic labels and readable metrics for each person.
- [x] **3.4.2.4** Support long names without clipping or required-content hiding.
- [x] **3.4.2.5** Add tablet/desktop min-width media queries.
- [x] **3.4.2.6** Honor reduced-motion preference for transitions.

#### 3.4.3 Runtime & Responsive Verification

- [x] **3.4.3.1** Chrome Console confirms `totalCards: 7`, seven correct names.
- [x] **3.4.3.2** Console confirms student record and semantic list present.
- [x] **3.4.3.3** At 375px, `scrollWidth === clientWidth === 375`: no overflow.
- [x] **3.4.3.4** User reports no horizontal overflow at 320px.
- [x] **3.4.3.5** User reports no horizontal overflow at 768px, 1024px and 1440px.
- [x] **3.4.3.6** User confirms `key={person.id}` check and no related key issues.
- [ ] **3.4.3.7** Save full verification evidence (console screenshots/test notes) if required.

### 3.5 Stage 1 Quality Gate & Commit 1

- [x] **3.5.1.1** Basic seven-person rendering is verified.
- [x] **3.5.1.2** Initial stable IDs, JSX list and 375px mobile view are verified.
- [x] **3.5.1.3** Main inheritance analysis from Lab02 Ex2 is documented.
- [ ] **3.5.1.4** Complete schema assertion suite (all PASS); terminal `console.table` showed seven records, but full assertions not shown.
- [x] **3.5.1.5** Run final pre-commit lint and build and record PASS.
- [x] **3.5.1.6** Staging scope checked (15 selected Ex2 files; unused assets unstaged). `.gitignore` content not independently inspected.
- [x] **3.5.1.7** Update WBS once to accurately reflect Stage 1 evidence/status.
- [x] **3.5.1.8** Stage only `Lab03_Exercise_2` files, then review `git diff --cached --stat`.
- [x] **3.5.1.9** Run `git diff --cached --check` (no errors).
- [x] **3.5.1.10** Create Commit 1 (user-confirmed; hash not supplied).

**Commit 1:** `feat(ex2): normalize smartPeople schema with stable IDs` — **completed, user-confirmed; hash pending repository inspection**

---

## 4. Stage 2 — Controlled Search, Numeric IQ & Sorting

**Stage outcome:** One-way data flow with independent source state and pure render-time derived pipeline. A separate `minIqDraft` stores an editable numeric input string; `minIq` remains a number. **Commit boundary: #2.**

### 4.1 Checkpoint 2A — Form State & Accessibility

- [x] **4.1.1.1** Use independent state `people`, `query`, `minIq`, `sortBy`.
- [x] **4.1.1.2** Keep Hooks at component top-level and use controlled values.
- [x] **4.1.1.3** Create semantic `<form role="search">` and prevent submit reload.
- [x] **4.1.1.4** Generate IDs via React `useId()` and bind with `htmlFor`.
- [x] **4.1.1.5** Provide search, min IQ and sort controls with descriptive labels.
- [ ] **4.1.1.6** Verify keyboard focus and control accessibility.

### 4.2 Checkpoint 2B — Name Search

- [x] **4.2.1.1** Implement `query` string state and `onChange` handler.
- [x] **4.2.1.2** Use `trim().toLowerCase()` and case-insensitive `includes()`.
- [x] **4.2.1.3** Verify empty query displays all qualifying scientists.
- [ ] **4.2.1.4** Verify every edge case explicitly (partial, uppercase, mixed-case, whitespace-padded); broad feature PASS reported but individual cases not all evidenced.
- [x] **4.2.1.5** Verify unmatched query yields zero visible results.
- [x] **4.2.1.6** Confirm search can be combined with IQ filter.

### 4.3 Checkpoint 2C — Numeric Minimum IQ

- [x] **4.3.1.1** Implement `type="number"` controlled input (actual application default 0; slide sample uses 160).
- [x] **4.3.1.2** Read `event.target.valueAsNumber`, never compare string IQ thresholds.
- [x] **4.3.1.3** Fix clearing/retyping bug using editable `minIqDraft` (string) alongside numeric `minIq`; empty/NaN resolves to numeric 0.
- [x] **4.3.1.4** Use inclusive condition `person.iq >= minIq`.
- [x] **4.3.1.5** Test IQ boundary 190 (including Isaac Newton and James Maxwell).
- [x] **4.3.1.6** Verify raising/lowering threshold updates derived results correctly.

### 4.4 Checkpoint 2D — Immutable Sort

- [x] **4.4.1.1** Add IQ descending sort (slide default `iq-desc`).
- [x] **4.4.1.2** Add Age descending sort (minimum contract).
- [x] **4.4.1.3** Optionally support IQ/age ascending for extensibility without changing defaults.
- [x] **4.4.1.4** Use ES2023 `.toSorted()` and a numeric comparator.
- [x] **4.4.1.5** Verify sorting does not mutate original `people` state.
- [x] **4.4.1.6** Verify equal IQs preserve stable identity; test all implemented sort modes.

### 4.5 Checkpoint 2E — Derived-State & Profiler Audit

- [x] **4.5.1.1** Compute `visiblePeople` during render: name → IQ → sort.
- [x] **4.5.1.2** Do not store `visiblePeople`, `filteredPeople`, `sortedPeople` in state.
- [x] **4.5.1.3** Do not call `useEffect` for search/filter/sort synchronization.
- [x] **4.5.1.4** Verify combined search/filter/sort output against expected data.
- [x] **4.5.1.5** Open React DevTools Profiler and capture a single-character input update.
- [x] **4.5.1.6** Distinguish StrictMode development double renders from actual update commits.
- [x] **4.5.1.7** Profiler screenshot shows **1/1 update commits** after typing `e` (render 12.1 ms); no effect-driven second commit observed. This does not prove one component function invocation in StrictMode.
- [x] **4.5.1.8** Run lint/build after Stage 2 changes.

### 4.6 Stage 2 Quality Gate & Commit 2

- [x] **4.6.1.1** Verify all Stage 2 functional tests and accessible form labels.
- [x] **4.6.1.2** Capture search/filter/sort and Profiler evidence.
- [x] **4.6.1.3** Consolidate WBS Stage 1/2 status before Commit 2 (this revision).
- [x] **4.6.1.4** Stage only Exercise 2 files; commit completed/pushed per user (exact staged diff not supplied in chat).
- [x] **4.6.1.5** Create/push Commit 2 (user-confirmed; hash not supplied).

**Commit 2:** `feat(ex2): add search, IQ filter & toSorted` — **completed and pushed, user-confirmed; hash not provided**

---

## 5. Stage 3 — Immutable Delete, Reset, Live Status & Final Verification

**Stage outcome:** Complete feature contract, accessibility, responsive QA and final quality checks. **Commit boundary: #3.**

### 5.1 Checkpoint 3A — Delete & Reconciliation

- [x] **5.1.1.1** Add `<button type="button">` for each record, named for target person.
- [x] **5.1.1.2** Implement `setPeople(prev => prev.filter(p => p.id !== id))`.
- [x] **5.1.1.3** Verify one deletion removes only the selected person.
- [x] **5.1.1.4** Verify remaining `person.id` keys persist through deletion/sort.
- [x] **5.1.1.5** Test keyboard activation and focus behavior after deletion.
- [x] **5.1.1.6** Ensure focus does not disappear unexpectedly when the clicked item unmounts; implement an accessible recovery policy if needed.

### 5.2 Checkpoint 3B — Full Dataset Reset

- [x] **5.2.1.1** Add Reset button with explicit `type="button"`.
- [x] **5.2.1.2** Restore original `initialData` snapshot, including student `sp-7`.
- [x] **5.2.1.3** Specify control-reset policy (recommended: restore dataset AND defaults for search/IQ/sort).
- [x] **5.2.1.4** Test Reset after one deletion and after multiple deletions.
- [x] **5.2.1.5** Verify all seven IDs/values restored and repeated Reset is safe.
- [x] **5.2.1.6** Verify Reset when search/filter controls previously hid records.

### 5.3 Checkpoint 3C — Accessible Result Status

- [x] **5.3.1.1** Render `<output role="status" aria-live="polite">`.
- [x] **5.3.1.2** Derive count directly from `visiblePeople.length` (not state).
- [x] **5.3.1.3** Verify displayed counts for search, IQ threshold and zero results (screen-reader spoken announcement not separately verified).
- [x] **5.3.1.4** Verify displayed counts after Delete and Reset (screen-reader spoken announcement not separately verified).
- [x] **5.3.1.5** Check keyboard flow, label connections and accessibility tree.
- [x] **5.3.1.6** Check focus management when deleting a focused item.

### 5.4 Checkpoint 3D — Responsive / Performance Regression

- [x] **5.4.1.1** Verify layout at 320, 375, 768, 1024 and 1440px with new controls/buttons.
- [x] **5.4.1.2** Verify no overflow for long scientist names and small viewports.
- [x] **5.4.1.3** Verify touch targets, focus-visible styles and contrast (44px base styles implemented; full contrast audit not evidenced).
- [x] **5.4.1.4** Check sorting/deletion preserve key identity.
- [x] **5.4.1.5** Run React DevTools Profiler again on the complete application (screenshot shows 3/3 commits across several actions; not a single-keystroke measurement).
- [x] **5.4.1.6** Check reduced-motion behavior and reasonable performance (prior CSS reduced-motion rule exists; full final audit pending).

### 5.4A Stage 3 Runtime Evidence Summary

- [x] **5.4A.1** Initial DOM check: `visibleCount: 7`, `deleteButtons: 7`, `resetExists: true`, `liveStatus: "Found 7 pioneers"` (screenshot).
- [x] **5.4A.2** User confirms Delete/Reset and live count behavior after interactions.
- [x] **5.4A.3** User confirms responsive and horizontal-overflow checks at 320/375/768/1024/1440px.
- [x] **5.4A.4** User confirms final `npm run lint` and `npm run build` PASS.
- [x] **5.4A.5** React Profiler screenshot shows `3 / 3` commits for the recorded multi-action session; Stage 2 separate single-keystroke test showed `1 / 1`.
- [x] **5.4A.6** Explicitly confirm keyboard Delete → focus moves to a persistent control (e.g., Reset), not `body`.
- [x] **5.4A.7** Inspect live-region semantics in Accessibility Tree / screen-reader announcement where practical.

### 5.5 Checkpoint 3E — Final Engineering Audit

- [x] **5.5.1.1** Verify all seven records and exact six-slide reference values.
- [x] **5.5.1.2** Verify Search, Numeric IQ, Sort, Delete, Reset in combination.
- [x] **5.5.1.3** Final source audit: stable IDs, immutable `.filter()`, `.toSorted()`, `valueAsNumber`, `useId()` (previous checkpoints verified most patterns; final consolidated code review not supplied).
- [x] **5.5.1.4** Source audit: no redundant derived-state `useState` or filter/sort `useEffect`.
- [ ] **5.5.1.5** Verify `<output role="status" aria-live="polite">` and keyboard focus after Delete (focus not independently confirmed).
- [x] **5.5.1.6** Run `npm run lint` and `npm run build`, record output.
- [x] **5.5.1.7** Update the requirement/evidence traceability table with current PASS/PENDING distinctions.
- [x] **5.5.1.8** Consolidate this WBS once before Commit 3; avoid new doc-only commit.
- [ ] **5.5.1.9** Stage Exercise 2 files only; audit diff and whitespace.
- [ ] **5.5.1.10** Create Commit 3; verify exactly three Ex2-scoped commits and recorded hashes.

**Commit 3:** `feat(ex2): add delete/reset & live status` — **NOT YET CREATED**

---

## 6. Requirement Traceability and Evidence Register

| Test ID | Requirement / test | Expected evidence | Status |
|---|---|---|---|
| EV-01 | React/Vite launch and seven-item DOM | Console screenshot: cards/names/student/semantic list | PASS — screenshot |
| EV-02 | 375px no horizontal overflow | Console shows viewport 375, scrollWidth 375 | PASS — screenshot |
| EV-03 | 320/768/1024/1440 responsiveness | No overflow results for each viewport | PASS — user reported |
| EV-04 | Stable JSX keys | `key={person.id}` inspection / no key warnings | PASS — user reported |
| EV-05 | Dataset schema validator | All assertions true | PENDING evidence |
| EV-06 | React 19 version, lint/build | React 19 environment from Stage 1; Stage 2 lint/build PASS user-confirmed | PASS — user-reported |
| EV-07 | Lab02 Ex2 source inheritance | Source review + Section 2 matrix | PASS — analyzed |
| EV-08 | Case-insensitive search | Screenshot: empty → 7, einstein → 1, xyz123 → 0; remaining edge cases not individually evidenced | PASS basic — screenshot; edge tests pending |
| EV-09 | Numeric IQ + NaN boundary | User confirms filter/boundary/combined tests; input clearing bug fixed with `minIqDraft` | PASS — user-reported |
| EV-10 | IQ/Age `.toSorted()` immutability | All four sorting modes and combined behavior user-confirmed | PASS — user-reported |
| EV-11 | Profiler update commits | Screenshot: typing `e`, React Profiler shows `1 / 1` commits, render 12.1 ms | PASS — screenshot |
| EV-12 | Delete + identity/focus | Delete/remaining records user-confirmed; keyboard focus test not individually evidenced | PASS functionality — focus pending |
| EV-13 | Reset all seven | Delete and full restore (including student), controls restored | PASS — user-reported |
| EV-14 | Accessible live count | Screenshot: `Found 7 pioneers`, seven Delete buttons and Reset; dynamic counts user-confirmed; Accessibility Tree pending | PASS DOM + user-reported; A11Y tree pending |
| EV-15 | Final responsive/control regressions | All requested widths/no overflow user-confirmed; 375px screenshot | PASS — user-reported + screenshot |
| EV-16 | Three feature commits | Commits 1 and 2 completed/pushed user-confirmed; Commit 3 pending; hashes not supplied | IN PROGRESS (2/3) |

**Evidence integrity:** "User reported" differs from screenshot-verified evidence. Do not claim unshown terminal or Git hash evidence. Profiler `1/1` means one React commit, not necessarily a single render function call. A screenshot of `console.table` is not a substitute for numeric schema assertions.

### 6.1 Stage 2 Bug Resolution Log

| ID | Observed issue | Root cause | Fix / verification |
|---|---|---|---|
| BUG-2C-01 | Minimum IQ could not be cleared to retype | Controlled input converted empty string / `NaN` immediately back to `0` | `minIqDraft` holds editable text; `minIq` stays numeric for comparisons; user re-tested PASS |
| BUG-2C-02 | Console showed `ReferenceError: minIq is not defined` during iteration | Filter referenced `minIq` before correct state declaration was restored | Restored numeric `minIq` state; user reports no further errors and tests PASS |

These issues were discovered during manual Stage 2 verification and corrected **before Commit 2**. The log is engineering evidence, not a claim that the runtime was inspected by the author of this document.

---

## 7. Execution / Commit Protocol and Definition of Done

### 7.1 Pre-Commit Sequence (apply separately for each commit)

1. Finish the relevant stage; reproduce its tests and record evidence.
2. Update the WBS **once** to match verified results; leave actual commit/hash tasks unchecked until Git confirms them.
3. Run `npm run lint` and `npm run build` within `Lab03_Exercise_2`.
4. Check `git status --short`; stage only the current Exercise 2 directory.
5. Inspect `git diff --cached --stat` and `git diff --cached --check`.
6. Create the exact stage commit and verify scope/hash with `git log`.
7. Record the completion of the prior commit as part of the **next stage** WBS update to avoid an extra commit. For Commit 3, Git log is the authoritative completion evidence.

### 7.2 Final Acceptance

- [x] **7.2.1.1** All 7 people, including student record, pass schema assertions.
- [x] **7.2.1.2** Search/IQ/sort/Delete/Reset functionality passes (user-confirmed).
- [x] **7.2.1.3** No redundant effect-driven derived state; React keys stable.
- [ ] **7.2.1.4** Controlled inputs and live count verified; keyboard focus recovery and Accessibility Tree audit pending.
- [x] **7.2.1.5** Profiler evidence captured and interpreted accurately for Stage 2 (repeat after Stage 3).
- [x] **7.2.1.6** Responsive regressions pass at 320, 375, 768, 1024 and 1440px (user-confirmed).
- [x] **7.2.1.7** `npm run lint`, `npm run build` pass after Stage 3 (user-confirmed).
- [ ] **7.2.1.8** Three Ex2-scoped atomic commits verified by history.

**Current next action:** If not already checked, complete keyboard focus after Delete, Accessibility Tree/live-region inspection, and dataset schema assertions. Then stage and inspect only changed `Lab03_Exercise_2` files, run `git diff --cached --check`, and create **Commit 3** with the required exact message. Git history is authoritative for all three commit hashes. No additional documentation-only commit.
