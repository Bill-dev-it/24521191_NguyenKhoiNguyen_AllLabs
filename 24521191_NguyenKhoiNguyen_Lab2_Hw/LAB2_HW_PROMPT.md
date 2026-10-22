# LAB02 — COMPLETE RECREATION PROMPT PLAYBOOK

**Document:** `PROMPT.md`  
**Scope:** `Lab02_Homework_1` → `Lab02_Homework_2` → `Lab02_Homework_3`  
**Primary stack:** React + TypeScript + Vite + ESLint, Vitest for domain logic  
**Usage:** Copy each prompt block into an AI coding assistant, in the prescribed order, inside the target project.  
**Purpose:** Rebuild the three applications from requirements and independently specified behavior, without relying on any preexisting implementation.

> **Recreation contract:** This is a detailed engineering *prompt specification*, not a claim that the text below is a verbatim historical transcript. It describes the desired output, interfaces, files, behavior, checks, known integration pitfalls, and stage-by-stage development process. An AI must implement and verify what is asked; it must not report unobserved results as facts.

---

## 0. How to use this playbook

1. Create the Lab02 homework parent folder and a Git repository. Create the three applications in **separate folders**: `Lab02_Homework_1`, `Lab02_Homework_2`, `Lab02_Homework_3`.
2. Execute **Prompt G0** once. Then run **HW1-P1 … HW1-P8**, followed by **HW2-P1 … HW2-P8**, then **HW3-P1 … HW3-P8**. Do not issue every prompt in a single turn. Review and test each stage.
3. A prompt is a *task handoff*. Ask for complete, working file contents, exact paths, test commands, explanations for risky lifecycle decisions, and a narrow commit. Run verification locally before accepting a stage.
4. Replace placeholders such as `[REPOSITORY_ROOT]` and `[SCREENSHOT_NAME]` with actual values; never invent Git SHAs, Lighthouse numbers, test outcomes or screenshots.
5. In each stage: **requirements → implementation → tests → browser verification if needed → documentation update → one logical Conventional Commit**.
6. Keep the delivery self-contained: do not depend on remote APIs for basic demos, on unavailable external media, or on undocumented local setup.
7. Keep independent local project naming/visual choices as specified below so the three homeworks are distinct: **Enterprise Asset Management** (HW1), **SonicFlow** (HW2), **FlashVault 11.11** (HW3).
8. Read `PROJECT_RULES.md` alongside these prompts, when available. In a conflict, the stated assignment requirement wins; document the decision.

### Expected parent structure

```text
Lab02/
└── 24521191_NguyenKhoiNguyen_Lab2_Hw/
    ├── PROJECT_RULES.md
    ├── PROMPT.md
    ├── Lab02_Homework_1/
    │   ├── src/
    │   ├── TASK_DECOMPOSITION.md
    │   ├── AI_FAILURE_AUDIT.md
    │   └── evidence/
    ├── Lab02_Homework_2/
    │   ├── src/
    │   ├── TASK_DECOMPOSITION.md
    │   ├── AI_FAILURE_AUDIT.md
    │   └── evidence/
    └── Lab02_Homework_3/
        ├── src/
        ├── TASK_DECOMPOSITION.md
        ├── AI_FAILURE_AUDIT.md
        └── evidence/
```

**Important:** Some folders are created later. A placeholder file with `.test.ts` extension must contain actual tests or be kept outside Vitest matching until its development stage.

---

## G0 — Master prompt for a new AI assistant

**COPY / PASTE PROMPT G0**

```text
You are a senior frontend engineer, TypeScript architect, quality engineer, and technical documentation writer. Build three independent React + TypeScript + Vite applications for a Web Application Development Lab02. The projects are:

(1) Homework 1: Production Enterprise Data-Grid (WCAG 2.2 AA), presented as an IT Asset Registry / Enterprise Asset Management dashboard.
(2) Homework 2: Concurrent FIFO Audio Visualizer Queue Engine, branded SonicFlow.
(3) Homework 3: High-Concurrency Flash-Sale E-Commerce Engine, branded FlashVault 11.11 with a Vietnamese e-commerce simulation.

Treat these as three separate deliverables. Build iteratively, not as one giant code dump. Use 8 logically distinct development stages for each homework (and at least eight discrete Conventional Commits for HW3). Begin each homework by writing a detailed TASK_DECOMPOSITION.md with requirements, architecture, milestones, file ownership, acceptance tests, risks, and traceability. Maintain AI_FAILURE_AUDIT.md recording observed defects separately from anticipated risk scenarios.

When implementing, always provide full code for the file(s) assigned to the current stage, paths, commands to run and verify, and exact narrow git add/commit commands. Never stage node_modules, dist, generated assets, secrets, or unrelated homework changes. Do not commit a failing stage. Do not invent test pass counts, screenshots, performance results or Git history. Prefer semantic HTML, WCAG-aware interaction, strict TypeScript types, deterministic tests, browser integration checks, and explicit cleanup. Build and lint checks are not substitutes for browser tests.

Use original sample data, independent designs, and justified architecture decisions. For visual appearance: HW1 uses a dark-navy corporate operations dashboard with cyan emphasis; HW2 uses a dark navy/cyan workstation interface; HW3 uses a dark navy/orange-red commerce dashboard. Code must be sufficiently complete for a new machine using npm install, npm run dev, npm run build, npm run lint and (where tests exist) npm run test.

At the end of each stage, report changed files, the observable acceptance criteria, test commands and a single conventional commit message. Stop after that stage for verification before proceeding.
```

### G1 — General implementation guardrails (prepend when an AI deviates)

```text
Audit your work against these rules. Do not weaken requirements to silence errors. The application must run on the real browser, not just compile. Strictly separate React UI state and business logic. Use real, scoped cleanup for timers, subscriptions, AbortControllers, object URLs, audio nodes, and RAF. Treat browser-native methods carefully when extracted to variables (e.g. bind window.fetch). Retain React StrictMode unless a temporary diagnostic demands otherwise, then restore and solve the lifecycle fault. Keep native semantic HTML and keyboard operation accessible. Fix type and ESLint diagnostics rather than disabling checks. Verify mocks are representative but also perform browser integration tests. Avoid claiming external-system atomicity from a single JS in-memory model. State every result as observed, simulated, expected, or not yet measured.
```

### G2 — Standard stage review / Git prompt

```text
Review only the files relevant to the current stage in the current homework directory. Run npm run build, npm run lint and npm run test if a real suite exists. Diagnose and correct any failures without removing the intended behavior or weakening test assertions. If browser interaction is required, give reproducible manual verification steps and do not claim they were performed unless witnessed. Show git status --short and git diff --stat. Stage exactly the files changed for this stage (not node_modules or dist). Create one meaningful Conventional Commit only after automated checks pass and manual acceptance has been acknowledged. Print the actual commit SHA and updated git log. Do not push unless explicitly instructed.
```

---

# PART I — HOMEWORK 1: PRODUCTION ENTERPRISE DATA-GRID

## HW1: Desired application specification

**Goal:** Implement an industrial-strength enterprise IT asset registry. Native semantic `<table>` with robust data-grid keyboard interaction, accessible sorting, filtering, pagination, row selection, and asset details. Assignment targets **WCAG 2.2 Level AA**, at least **4.5:1 text contrast**, useful screen-reader support and **verified Lighthouse Accessibility and Best Practices scores of 100/100**. Do not claim full WCAG conformance solely from Lighthouse.

**Preferred domain/data:** 12+ stable assets with `assetId`, `deviceName`, `category`, `department`, `status` (`Active`, `Maintenance`, `Inactive`). Examples: Dell Latitude 7440, MacBook Pro M3, HP EliteDesk 800, Cisco Catalyst 9200, Dell PowerEdge R750. The overview shows initial counters **Total 12, Active 7, Maintenance 3, Inactive 2** if the seed data is configured accordingly. These must be computed from data, not independently hardcoded.

**Visual:** Dark navy operations dashboard, cyan labels/borders, four KPI cards, a professional searchable sortable table, accessible buttons and a details dialog. Responsive without sacrificing usable table navigation. Page title **Enterprise Asset Management**; eyebrow **IT OPERATIONS / ASSET REGISTRY**.

**Interface contract:**

```typescript
export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
}
export interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?: (item: T) => void;
  ariaLabel: string;
}
```

Use real native table structure and carefully considered ARIA grid roles / cell roles where interactive grid semantics are implemented. Do not replace the table with generic `div` soup. Explain and correctly implement focus ownership, keyboard event handling, and accessible announcements.

## HW1-P1 — Setup and decomposition

```text
Initialize Lab02_Homework_1 with Vite React TypeScript, ESLint, a project-specific name in package.json, a clean index.html, main.tsx and .gitignore. Create a detailed TASK_DECOMPOSITION.md for 8 stages covering semantic table, data model, dashboard, sorting/filtering/pagination, keyboard grid semantics, selection/details dialog, WCAG verification, Lighthouse, audit and documentation. For each stage list specific files, tasks, acceptance criteria, failure cases, screenshots and commit message. Create a starter accessible app shell and verify npm run build/npm run lint. Stage only setup files and the decomposition. Commit: chore: initialize Vite React TypeScript project and HW1 decomposition. Do not implement all stages yet.
```

## HW1-P2 — Domain contracts and seeded asset dataset

```text
Implement src/data-grid-contract.ts, src/asset-data.ts (or asset-data equivalent), and a typed seed of at least twelve distinct IT assets matching an enterprise IT asset registry. Include a stable ID, device name, category, department, and status. Use discriminated status union. Provide ColumnDef<T> and DataGridProps<T> precisely, typed comparators and any reusable helpers needed later. Data must produce counters Total 12, Active 7, Maintenance 3, Inactive 2. Design tests or executable assertions for unique IDs, field completeness and counter consistency. No random dates or external APIs. Keep the data and contracts independent from App and the grid. Run build/lint. Commit: feat: define typed enterprise asset grid contracts and data.
```

## HW1-P3 — Semantic table, dashboard and asset details

```text
Create src/DataGrid.tsx, src/DataGrid.css and src/App.tsx for a functional enterprise asset management dashboard. Render an overview header and four computed KPI cards. Use <table>, <caption> or equivalent accessible table name, <thead>, <tbody>, <tr>, <th scope="col">, <td>, and actual <button> controls. Columns: Asset ID, Device Name, Category, Department, Status, Actions. Include a per-row View button that opens accessible asset details with meaningful labels; do not ship an inert View button. Include proper dialog semantics, focus initialization, Escape to close and focus return. The dashboard must display and respond correctly even before filtering/pagination is introduced. Make visuals distinct: cyan/indigo accent, spacious cards, dark surface and strong contrast. Test keyboard activation and dialog closure manually. Run build and lint. Commit: feat: build semantic enterprise asset grid and details dialog.
```

## HW1-P4 — Sorting, filtering, pagination and selection

```text
Extend the data grid with case-insensitive search over asset ID, device, department, category and status. Add stable ascending/descending sort via visible header buttons with aria-sort on the active column header; explain initial sort behavior. Add pagination (5 records per page) with Previous/Next controls, page number, current range and matching record count. Clamp/reset the page after changing search/sort. Preserve record identity using stable asset IDs and do not mutate the input data. Support Space to select/deselect a row with an accessible state announcement, and Enter to activate the asset View/details action. Make filter, sort, page, selection work together. Add meaningful empty state and test the edge case of zero matches. Run checks. Commit: feat: add accessible filtering sorting pagination and selection.
```

## HW1-P5 — Keyboard navigation and screen-reader semantics

```text
Implement full Data Grid keyboard interaction: ArrowUp/ArrowDown/ArrowLeft/ArrowRight navigate the intended interactive grid cells, Home/End when appropriate, Enter selects or opens details as specified, and Space toggles row selection. Avoid hijacking arrows while the user is editing search input or using a native form control. Use either a well-described roving tabindex strategy or aria-activedescendant with a single reliable focus owner. Preserve visible focus outlines, restore focus after dialog close, announce result count and row selection in aria-live regions without excessive chatter. Ensure screen readers can identify row/column associations. For every custom role and ARIA attribute, confirm validity on a native table element. Test mouse and keyboard paths. Run build/lint/tests if available. Commit: feat: add keyboard grid navigation and screen reader support.
```

## HW1-P6 — WCAG styling and browser regression fixes

```text
Polish src/DataGrid.css, overall app styles, and responsive behavior without breaking semantic markup. Target WCAG 2.2 AA, including normal-text contrast of >= 4.5:1, clear visible focus, logical tab order, pointer target usability, input labeling, zoom and small-view handling. No color-only status meaning. Ensure status labels have text, pagination controls have disabled states, dialogs remain keyboard-operable and page overflow is deliberate. Add reduced-motion handling. Manually test sorted/filter states, mobile widths, 200% zoom, Escape, Tab, Shift+Tab and no horizontal focus clipping. Fix discovered issues with the smallest change. Run automated checks. Commit: fix: refine WCAG keyboard focus contrast and responsive layout.
```

## HW1-P7 — Lighthouse 100/100 target and AI audit

```text
Run Lighthouse on a production preview and examine both Accessibility and Best Practices. Target verified 100/100 for each; do not write 100 if measured otherwise. Fix actual findings and browser security issues without unsafe relaxations. Test in a clean/incognito profile when extensions affect auditing and explicitly record the environment; a CSP-related Chrome DevTools issue must be diagnosed separately from application vulnerabilities. Create AI_FAILURE_AUDIT.md with detailed sections: executive summary, scope, actual defects vs hypothetical failure modes, incorrect patterns, root cause, corrected approach, affected modules, reproduction/test steps, Lighthouse evidence and limitations. Include cases such as div-soup accessibility loss, missing keyboard flow, row focus errors, stale pagination selection, contrast, and misleading automatic audit scores. Record screenshots and exact measured scores. Commit: test: audit accessible enterprise grid and browser best practices.
```

## HW1-P8 — Final documentation/evidence

```text
Complete HW1 README.md and AI_FAILURE_AUDIT.md using verified results only. Update TASK_DECOMPOSITION.md with actual status and changed file names. Prepare evidence checklist: full dashboard, asset selection, View/details dialog, search, sorting, pagination, keyboard navigation, Lighthouse Accessibility score, Lighthouse Best Practices score, Git history. Validate npm run build/lint, final browser behavior and responsiveness. Record actual Git commits. Commit only documentation and evidence files with: docs: finalize HW1 accessible grid audit and evidence. Provide a concise final acceptance matrix listing achieved, unverified and pending criteria.
```

### HW1 definitive acceptance / reproduction review

- Native table semantics, correctly labeled headers and buttons, functional View dialog.
- Sorting, text filtering, pagination, focus navigation and selection all interact correctly.
- Computed counters match the 12-item seed (7 active, 3 maintenance, 2 inactive).
- Keyboard-only operation, screen-reader naming, focus contrast and responsive tests.
- Lighthouse targets independently measured; do not assert that 100/100 proves all WCAG criteria.
- `DataGrid.tsx`, `DataGrid.css`, `data-grid-contract.ts`, `asset-data.ts`, `App.tsx`, project docs and evidence organized coherently.

---

# PART II — HOMEWORK 2: SONICFLOW FIFO AUDIO VISUALIZER

## HW2: Desired application specification

**Goal:** A concurrent-submission, **single-worker FIFO** audio downloading/decoding queue, cancellation via AbortController, Web Audio playback engine, memory-safe source node lifecycle, Canvas visualization driven by RAF, FFT sizes 256 and 512, and user-facing playback controls. Assignment target: **60 FPS** visualizer without excessive React state updates and **zero memory leaks** as an objective requiring measurement, not a blanket claim.

**UI/branding:** **SONICFLOW**, eyebrow **WEB AUDIO ENGINE / FIFO CONTROLLER**, dark navy/cyan workstation, four task stats (Total, Pending, Completed, Failed/Cancelled), demo audio library, file chooser, remote audio URL field, FIFO task queue, Ready Tracks, a Now Playing area with play/pause/resume/stop and volume, three visualization modes **Spectrum**, **Oscilloscope**, **Circular**. Provide 3 self-generated five-second WAV demo tones **Neon Pulse** (220 Hz), **Cyber Rhythm** (330 Hz), **Midnight Signal** (440 Hz) so the system works without external media or CORS.

**Core files:** `src/audio-types.ts`, `audio-queue-controller.ts`, `audio-queue-controller.test.ts`, `audio-loader.ts`, `audio-loader.test.ts`, `audio-engine.ts`, `audio-engine.test.ts`, `AudioVisualizer.tsx`, `AudioVisualizer.css`, `App.tsx`, `App.css`, `index.css`, `main.tsx`, `AI_FAILURE_AUDIT.md`, `TASK_DECOMPOSITION.md`.

**Queue contracts:** typed task identifiers, task states (`queued`, `processing`, `completed`, `failed`, `cancelled`), pending queue, active job, per-task AbortController, result Promise, cancel function, disposal, immutable snapshots and subscribers. **Invariant:** one active processing worker; settled promises never settle again; expired/cancelled results may not enter Ready Tracks.

## HW2-P1 — Setup and detailed decomposition

```text
Initialize Lab02_Homework_2 as its own Vite React TypeScript application with ESLint and Vitest. Use package name lab02-homework-2, not vite-temp. Add scripts dev, build, lint, test, preview; verify package-lock and .gitignore. Write a detailed TASK_DECOMPOSITION.md (requirements, architecture, source modules, input/output contracts, stage dependencies, acceptance checks, failure tests, cleanup ownership, Git plan) divided into eight commits. Create placeholder modules only if valid and compilable; never leave empty .test.ts files. Write meaningful README instructions. Run build/lint. Commit: chore: initialize SonicFlow Vite TypeScript and task decomposition.
```

## HW2-P2 — Typed FIFO queue and deterministic queue tests

```text
Implement src/audio-types.ts and src/audio-queue-controller.ts. Build AudioTaskQueue<TResult> with a single worker, FIFO pending tasks, enqueue({trackUrl,title}) returning an ID/cancel method/result Promise, AbortController per task, subscribe/unsubscribe and getSnapshot, processNext guard, dispose and settle-once guarantees. Never start a second worker while one is active. On cancellation: reject pending immediately and prevent active late resolves from becoming success. Continue to next task after a download/decode failure. Write src/audio-queue-controller.test.ts with six deterministic unit tests: strict order, no parallel processor, pending cancellation, active cancellation with late result, recovery after failure, and dispose prevention. Avoid dangling promises in tests. Verify build/lint/Vitest. Commit: feat: implement typed FIFO audio task controller.
```

## HW2-P3 — Abortable loader and native Fetch binding

```text
Implement src/audio-loader.ts with injected fetch and decoder dependencies, HTTP status validation, response body/ArrayBuffer handling, AbortSignal checks before fetch, after download and after decode, descriptive error types and no uncontrolled retries. Real browser fetch must be called with its proper receiver: use options.fetcher ?? window.fetch.bind(window), not an unbound extracted native fetch invoked through an unrelated class object. Provide a safe environment fallback if runtime tests do not expose window, without weakening actual browser behavior. Decode via AudioContext.decodeAudioData; be explicit that decoding itself is not directly abortable, so cancelled late results must be discarded. Implement seven deterministic loader tests: successful fetch/decode, HTTP failure, network failure, abort before fetch, cancellation during download, cancellation during decode, and invalid audio handling (or equivalent scoped cases). After tests pass, manually enqueue an actual Blob WAV URL in a browser to catch native binding problems mocks can miss. Commit: feat: add abortable audio fetching and decoding.
```

## HW2-P4 — AudioEngine lifecycle and playback state

```text
Implement src/audio-engine.ts with AudioContext initialized on demand, AnalyserNode, GainNode and AudioBufferSourceNode graph. Define a typed status/snapshot contract and subscribe/unsubscribe API. Support loadBuffer(AudioBuffer), initialize, play, pause, resume, stop, setVolume (clamp 0..1), setFFTSize(256|512), getFrequencyBinCount, getFrequencyData, getWaveformData, getStatus/getSnapshot, and idempotent dispose. An AudioBufferSourceNode is one-shot: after stop/pause, create a NEW source on resume with a saved offset. Explicitly stop/disconnect the old source and clear onended callbacks. Guard stale onended handlers with generation token. Close AudioContext on final dispose only. Respect browser gesture restrictions and suspended contexts. Do not allocate AudioContexts unnecessarily. Record node counts in tests, no claims of proven zero heap leaks. Commit: feat: implement Web Audio playback engine with safe cleanup.
```

## HW2-P5 — Three Canvas visualization modes

```text
Implement src/AudioVisualizer.tsx and dedicated src/AudioVisualizer.css. Add Spectrum bars, Oscilloscope waveform and Circular frequency ring. Include mode buttons and FFT 256/512 controls; clearly report 128 or 256 frequency bins. Render with requestAnimationFrame and Canvas directly; do not set React frequency-array state 60 times per second. Update FPS telemetry around once per second. Handle device pixel ratio, resizing via ResizeObserver, zero dimensions, stopped audio, and prefers-reduced-motion where practical. Cleanup RAF and observer on unmount. Subscription cleanup must be reliable. Keep an explicit LIVE AUDIO vs STANDBY status based on AudioEngine state, not an unreactive read in the render path. Test mode switching while audio plays and while stopped. Commit: feat: build RAF driven audio frequency visualizer.
```

## HW2-P6 — SonicFlow UI and real-browser integration

```text
Create SonicFlow src/App.tsx, App.css, index.css, index.html. Build the complete responsive dark navy/cyan dashboard. Show four queue stats; three demo tracks generated as valid 16-bit PCM WAV Blob URLs with 5 s duration and correct RIFF headers; local MP3/WAV file upload; validated HTTP(S) URL input; Ready Tracks with per-item Play; active FIFO list with per-item Cancel; Now Playing; Play/Pause/Resume/Stop; volume slider; visualization controls. Generate unique object URLs and revoke them on settlement/unmount. Queue resolves to AudioBuffer and adds it to Ready Tracks, errors shown accessibly (role=status) without crashing React. Do not infer audio success from unit tests: play an actual decoded demo sound and verify Canvas frames in the browser. Keep real user-accessible controls usable with keyboard. Run build/lint/tests, then manual browser acceptance. Commit: feat: integrate SonicFlow audio queue workstation interface.
```

### HW2 critical integration addendum — React StrictMode and disposed engine

**Use this prompt before accepting HW2 Stage 6/7 if the app shows a blank page after initially rendering.**

```text
Audit App/AudioVisualizer lifecycle under React StrictMode. A known anti-pattern is allocating a single AudioEngine via useState(() => new AudioEngine()) and permanently disposing that instance in the first useEffect cleanup; React development StrictMode replays setup/cleanup and then tries to subscribe to an already disposed engine. Error symptom: 'AudioEngine has already been disposed' at AudioEngine.subscribe from AudioVisualizer. DO NOT accept disabling StrictMode as the final fix. Implement correct lifecycle ownership so each effect setup receives a usable engine (or defer final destruction until a true owner lifecycle); ensure UI subscription is not attached to disposed engine. Avoid calling setState synchronously in effects when react-hooks/set-state-in-effect disallows it; use lifecycle-safe state architecture such as a dedicated owner component and stable resource management. Preserve subscriptions, RAF cleanup, and actual audio playback. Write or run a React StrictMode integration test plus browser refresh verification. Deliver complete corrected files, not a one-line speculative workaround.
```

## HW2-P7 — AudioEngine tests, browser bug regression and performance review

```text
Add src/audio-engine.test.ts with at least eight tests around context initialization once, playback with/without buffer, active source count, pause disconnection, resume using a NEW source and saved offset, FFT 256/512 bin counts, volume clamping, and disposal idempotency. Use controlled mocked Web Audio API objects and inspect stop/disconnect/close calls. Confirm total targeted test count of 6 queue + 7 loader + 8 engine = 21, but only report 21/21 if the final Vitest run proves it. Add a browser-facing regression test or manual evidence for the native window.fetch receiver issue ('Illegal invocation'), and test real Blob WAV loading in Chrome. Verify real playback and visualizer LIVE mode with a longer local audio file, as 5-second demos are easy to miss. In DevTools Performance/Memory inspect repeated Play/Stop cycles and RAF behavior; record actual FPS and memory observations rather than claiming 60 FPS or zero leaks without measurements. Run build/lint/test. Commit: test: verify audio lifecycle and fix browser fetch binding.
```

## HW2-P8 — Detailed audit, documentation and evidence

```text
Write a thorough AI_FAILURE_AUDIT.md in technical engineering style: executive summary, architecture diagram, contracts/invariants, failure mode matrix, wrong patterns, root causes, fixes, test evidence, limits and 12+ defense questions. Cover at least: native fetch Illegal Invocation as a concrete browser integration defect, duplicate FIFO workers, AbortController vs non-abortable decodeAudioData, AudioBufferSourceNode one-shot and cleanup, RAF/React state thrashing, AudioContext autoplay/StrictMode lifecycle. Separate ACTUALLY OBSERVED defects from hypothetical risks. Include verified test results and never invent memory/FPS measurements. Update TASK_DECOMPOSITION.md and README, provide evidence checklist: dashboard, queue processing/completed, task cancel, playback, Spectrum, Oscilloscope, Circular, FFT sizes, tests, browser performance/memory, Git commits. After final checks, commit only documentation/evidence: docs: complete HW2 engineering and failure mode audit.
```

### HW2 acceptance / known failure diagnosis

| Symptom | Diagnosis to perform | Correct direction |
|---|---|---|
| All demo tracks FAILED | Inspect UI error, Fetch API receiver and Blob requests | `window.fetch.bind(window)` when storing native method |
| Ready Track exists but no sound | Check AudioContext state, output device, play gesture and source start | Resume context and create fresh source |
| Audio plays but Visualizer stays STANDBY | Engine status not subscribed / demo too short | Subscribe to status and test with longer audio |
| Blank page after refresh | Runtime console `AudioEngine has already been disposed` | StrictMode-safe engine ownership; keep StrictMode |
| Build succeeds but UI breaks | Browser runtime behavior not tested | Console, actual interactions, regression test |
| Tests pass but memory unknown | Mock cleanup != heap profiling | Perform memory timeline / heap snapshots |

---

# PART III — HOMEWORK 3: FLASHVAULT 11.11 FLASH-SALE ENGINE

## HW3: Desired application specification

**Assignment:** Vietnam Mega-Sale / Shopee-Lazada inspired 11.11 simulation. Implement **zero-drift countdown** (`Date.now()` delta/deadline with RAF), typed inventory state machine, temporary reservations with expiration, optimistic inventory lock semantics, checkout, idempotency, stress simulation, **AI_FAILURE_AUDIT.md with at least three analyzed AI flaws**, and **minimum eight discrete Conventional Commits**.

**Brand/UI:** **FLASHVAULT** / **VIETNAM MEGA SALE ENGINE**; dark navy with orange/red commercial highlights. Hero **THE ULTIMATE FLASH SALE.**, ten-minute demo countdown, 6 product cards with fake VND prices/discounts, KPI cards initial/available/reserved/sold, buyer ID field, active lock panel (30 seconds), checkout/cancel controls, concurrency lab (20-buyer burst), confirmed orders/revenue/invariant state, and transaction event log. Seed: six original tech product examples in `product-data.ts`; first product **Galaxy S25 Ultra**, initial stock **5** (for reproducible 20 buyers → expected 5 success, 15 reject). Other product examples: ASUS Vivobook 15, Sony WH-1000XM5, Galaxy Watch 7, Logitech MX Master 3S, iPad Air 11-inch. Prices are explicitly synthetic demo data, not real offers.

**Important domain boundary:** One in-memory authoritative InventoryEngine instance simulates multiple concurrent purchase attempts. This does **not** prove multi-tab, multi-device, distributed database, or server-side atomic inventory handling. `version` counts mutations but is **not** a CAS lock without atomic comparison on the authority.

**Core invariant:** `initialStock = availableStock + reservedQuantity + soldQuantity` with all components nonnegative.

**Reservation statuses:** `reserved`, `committed`, `expired`, `cancelled` (Requested and Rejected are conceptual request path states, not stored successful reservation statuses). No terminal state transition is allowed twice.

## HW3-P1 — Project setup and thorough waterfall decomposition

```text
Initialize Lab02_Homework_3 with Vite React TypeScript, ESLint and Vitest. Create TASK_DECOMPOSITION.md with 8 stages: setup; deadline timer; typed inventory model; expiry locking; checkout and contention simulation; FlashVault UI; stress tests; AI failure audit. For each stage include detailed tasks, files, preconditions, dependencies, domain invariants, acceptance tests and Git messages. Explicitly explain client-only simulation scope. Add README and configure npm scripts. Do not create empty files matching *.test.ts; add tests in the matching stage. Verify npm run build/lint. Commit: chore: initialize HW3 flash sale project and decomposition.
```

## HW3-P2 — Anti-drift timer / 9 tests

```text
Implement src/anti-drift-timer.ts and src/anti-drift-timer.test.ts. Export createAntiDriftTimer(durationMs,onTick,dependencies), TimerSnapshot (remainingMs, elapsedMs, durationMs, deadline, status), cancel(), isRunning(), getSnapshot() and formatCountdown(ms) returning HH:MM:SS. Use absolute deadline = Date.now() + duration, remaining = max(0,deadline-now()). Schedule ticks via requestAnimationFrame; inject now/requestFrame/cancelFrame to support deterministic fake scheduler. Immediately emit initial tick. Handle zero-duration, non-finite/negative duration errors, cancellation, idempotent cleanup and delayed callbacks. Do not decrement remaining by 1000 per interval. Test nine cases: initial duration, deadline delta, late callbacks, zero clamp, RAF cancellation, idempotent cancel, zero duration, invalid durations, HH:MM:SS formatting. Build/lint/test. Commit: feat: implement deadline based anti drift timer.
```

## HW3-P3 — Typed inventory state machine / 12 tests

```text
Implement src/inventory-types.ts and src/inventory-engine.ts, plus src/inventory-engine.test.ts. ProductInput contains id/name/originalPrice/salePrice/initialStock. InventoryProduct additionally contains availableStock/reservedQuantity/soldQuantity/version. StockReservation has id/productId/buyerId/quantity/status/createdAt/expiresAt. InventoryResult is a discriminated union with success/data or failure/code/message. InventorySnapshot returns copied products, reservations and events; no leaking mutable internal references. InventoryEngine constructor validates stock nonnegative safe integer, prices nonnegative and unique IDs. Inject now/createId. reserve(productId,buyerId,quantity,durationMs) validates, checks available stock, then atomically (within one synchronous method) decrements available/increments reserved; cancel transitions reserved to cancelled and returns stock once. Maintain invariants and event logs. Test initialization, reserve, insufficient stock, invalid quantities, missing product, cancel, repeated cancel, 20 buyers competing for 5 units, mixed conservation, duplicate IDs, snapshots immutability, event log (12 cases). Build/lint/test, expect 9 + 12 only if verified. Commit: feat: implement typed inventory reservation state machine.
```

## HW3-P4 — Reservation expiry and monitor / 8 tests

```text
Extend src/inventory-engine.ts. Add expireReservations(): number which scans reserved entries and expires those for which now() >= expiresAt; release stock exactly once and increment version/log EXPIRED. Add isReservationActive(id), getRemainingLockMs(id), startExpiryMonitor(intervalMs), stopExpiryMonitor, dispose(). The interval is merely a scheduler; the authoritative truth is expiresAt, and reserve/cancel/checkout paths should re-evaluate expirations. Idempotently start/stop the monitor, cleanup intervals and avoid duplicate release. Add eight tests to inventory suite: active before expiry, expiry exactly at deadline, idempotent expiry, released stock reused, cancel after expiry rejected, cancelled lock never expired, multiple expirations preserve conservation, automatic monitor stops on dispose. Keep old 12 tests passing (target 20 inventory tests, 29 overall). Commit: feat: implement inventory reservation locking and expiration.
```

## HW3-P5 — Idempotent checkout and 20-buyer simulation / 10 tests

```text
Add commitReservation(reservationId) to InventoryEngine and RESERVATION_EXPIRED to error union. On checkout attempt, first expire stale reservations; require active RESERVED state; move quantity from reservedQuantity to soldQuantity without decrementing availableStock again; reject expired/cancelled/unknown. Implement CheckoutEngine in src/checkout-engine.ts with confirmed FlashSaleOrder and a Map keyed by reservationId; repeated checkout of the same committed reservation returns the same order. API checkout, getOrder, getOrders, getTotalRevenue, simulateBurst(productId,buyerCount,quantityPerBuyer). The burst coordinates Promise-based submissions into the same authoritative in-memory engine; explicitly avoid claiming true multi-thread or distributed atomicity. Add 10 unit tests: success, no double deduction, idempotency, expiry rejection, cancelled rejection, missing reservation, 20 buyers/5 stock => 5/15, 10 buyers/1 stock => 1/9, revenue from confirmed only, multiple commits preserve invariant. Verify 39 planned tests. Commit: feat: implement checkout and concurrent purchase simulation.
```

## HW3-P6 — FlashVault complete UI and browser testing

```text
Create src/product-data.ts with six illustrative tech products, synthetic VND prices and quantities; first product has stock 5. Implement full src/App.tsx, App.css, index.css, index.html with FlashVault branding, campaign hero, 10-minute deadline-based countdown, four inventory KPIs, 2-column responsive product cards with badges/emojis/discounts/prices/stock progress, Reserve Now, Buyer ID, Active Locks with 30-second remaining display, Checkout and Cancel, Traffic Simulator for 20 buyers, Checkout Summary revenue/confirmed orders/stock invariant, and chronological event log. Wire all actions to domain engines, never mutate snapshot copies. Avoid blind duplicate intervals in React StrictMode: make effect scheduling and cleanup safe under development replay. Run expiry monitor and a modest UI refresh cadence; expiration correctness comes from domain checks. Add accessible labels, functional disabled states and status announcements. Verify reserve/cancel/expire/checkout and 20-buyer burst manually, run build/lint/tests. UI should be original dark navy/orange-red and responsive. Commit: feat: build responsive flash sale dashboard.
```

## HW3-P7 — Stress and race-boundary tests / 10 tests

```text
Create src/flash-sale-stress.test.ts with deterministic injected clock and IDs; preserve the 39 earlier tests. Add 10 stress scenarios: 100 buyers competing for 5 units => 5 success 95 reject; repeated concurrent bursts still cannot oversell; 50 buyers last unit => 1 success; checkout at exact expiration fails; checkout 1 ms before expiry succeeds; 20 repeated checkouts produce one order; committed stock never released after expiry; cancelled stock is released only once; newly freed expired stock can be reserved by next buyer; mixed ten-unit flow (5 checkout, 2 cancel, 3 expire) preserves inventory invariant. Do not use fake parallel threads or imply network concurrency. Run build/lint/test and record actual total; 49/49 is target not a fact unless observed. Run browser checks and inspect console. Commit: test: verify timer inventory and checkout invariants.
```

## HW3-P8 — Thorough AI audit and submission evidence

```text
Write AI_FAILURE_AUDIT.md with executive summary, architecture, domain invariants, failure matrix, root causes, incorrect vs correct snippets, evidence, engineering limitations, actual test results, eight commit history, at least fifteen technical defense questions and a final verification checklist. Analyze six risk scenarios: countdown drift from decrementing setInterval, stock race/overselling from async read/update, double deduction on checkout, expiry-boundary checkout race, duplicate checkout/idempotency, timer/React cleanup leak. Mark each as Potential Risk, Controlled Reproduction, or Observed Defect—do not pretend tests of prevention prove that an earlier bug existed. Distinguish in-memory simulation from a production shared backend and distinguish Date.now() drift protection from system clock correction. Capture screenshots for Dashboard, Timer, Reserve, Checkout, Expiry, 20-buyer burst, 49-test output (when verified), Git log. Update TASK_DECOMPOSITION/README according to actual behavior. Verify build/lint/tests and git status; commit only documents/evidence: docs: finalize HW3 failure audit and verification.
```

### HW3 replayable domain examples

**Inventory conservation walk-through (initial 5):**

```text
Initialize: Available 5, Reserved 0, Sold 0
Reserve 2:  Available 3, Reserved 2, Sold 0
Checkout 2: Available 3, Reserved 0, Sold 2
```

**Expire 2 instead of checkout:**

```text
Reserve 2:  Available 3, Reserved 2, Sold 0
Expire 2:   Available 5, Reserved 0, Sold 0
```

**Simulation proof target:**

```text
Initial stock: 5
100 requests: 5 reserved, 95 rejected
20 requests: 5 reserved, 15 rejected
No negative stock; initial = available + reserved + sold
```

Note: These outputs require the matching fresh engine state, not one depleted by earlier button clicks.

---

# PART IV — RECREATION VALIDATION AND SUBMISSION PROMPTS

## V1 — Independent architecture review (copy to a second AI)

```text
Act as a skeptical senior engineer reviewing three independent Lab02 Vite/React/TypeScript projects. Compare the implemented files against PROMPT.md and PROJECT_RULES.md (if present), not against assumed scores. For each homework, produce a requirement-to-file-to-test traceability table and identify missing work, incorrect business invariants, TypeScript errors, accessibility issues, lifecycle bugs, improper cleanup, misleading claims, and regressions. Test claims must be backed by actual files or console output. Propose the smallest necessary changes, ordered by risk. Do not rewrite passing modules without a concrete reason. For every proposed fix specify test(s) to prevent regression.
```

## V2 — Browser end-to-end acceptance

```text
Prepare a reproducible human browser checklist for HW1, HW2 and HW3. HW1: sort/filter/paginate/keyboard/dialog, focus and screen-reader semantics, WCAG contrast and Lighthouse Accessibility/Best Practices (record real scores). HW2: real WAV and local MP3 decode/playback, queue FIFO, cancel, error recovery, all 3 visualizer modes, FFT bin counts, source cleanup, React StrictMode refresh, repeated Play/Stop and measured FPS/memory. HW3: timer deadline after tab throttling, reserve/cancel/expiry/checkout, 20-buyer burst, stock invariant, idempotent checkout and event log. For each scenario write preconditions, steps, expected result, actual result field, PASS/FAIL/NOT TESTED and screenshot filename. Do not fill actual results by assumption.
```

## V3 — Git integrity audit

```text
Inspect git status --short, git diff --stat and git log --oneline for the entire Lab02 repository. Verify the three homework subtrees are independent, each stage commit is meaningful, and Homework 3 has at least eight discrete Conventional Commits from genuine incremental development. Confirm node_modules, dist and caches are ignored. Do not rewrite published history or manufacture commits to meet the count. Report exact hashes, file paths and any missing stages. Only suggest further commit actions if real changes are pending.
```

## V4 — Professional English Results Report

```text
Create an English DOCX Results Report for Lab02, ordered waterfall style HW1 then HW2 then HW3. Use heading hierarchy, accessible tables, readable sans-serif font, sufficient contrast, logical reading order, and figure placeholders above short, objective figure descriptions. Do not embed screenshots unless requested. For every available screenshot use: [INSERT IMAGE HERE: exact_filename], descriptive figure caption, and one paragraph stating what the visible screenshot demonstrates. Never claim a hidden interaction, unmeasured FPS/memory, or passing score that the image does not show. Include a concise introduction, grouped results, limitations and final summary. Target an accessible document aligned with WCAG 2.0 Level AA principles; after real images are inserted, add meaningful alt text and run Microsoft Word's Accessibility Checker. A placeholder-only report cannot be conclusively certified WCAG conformant.
```

## V5 — Final release gate

```text
Before marking Lab02 complete, inspect HW1, HW2 and HW3 independently. Run npm install (if needed), npm run build, npm run lint, and npm run test wherever test cases exist. Test in the browser. Verify that all three TASK_DECOMPOSITION.md and AI_FAILURE_AUDIT.md documents match actual source and observed results. Confirm screenshots/evidence and Git history. Report a final matrix of requirements: VERIFIED PASS, FAIL, NOT TESTED, or OUT OF SCOPE. Do not change source purely to make the report look complete. Present outstanding blockers separately from optional improvements.
```

---

## Appendix A — Suggested commit message ledger

| Stage | HW1 | HW2 | HW3 |
|---|---|---|---|
| 1 | `chore: initialize Vite React TypeScript project and HW1 decomposition` | `chore: initialize SonicFlow Vite TypeScript and task decomposition` | `chore: initialize HW3 flash sale project and decomposition` |
| 2 | `feat: define typed enterprise asset grid contracts and data` | `feat: implement typed FIFO audio task controller` | `feat: implement deadline based anti drift timer` |
| 3 | `feat: build semantic enterprise asset grid and details dialog` | `feat: add abortable audio fetching and decoding` | `feat: implement typed inventory reservation state machine` |
| 4 | `feat: add accessible filtering sorting pagination and selection` | `feat: implement Web Audio playback engine with safe cleanup` | `feat: implement inventory reservation locking and expiration` |
| 5 | `feat: add keyboard grid navigation and screen reader support` | `feat: build RAF driven audio frequency visualizer` | `feat: implement checkout and concurrent purchase simulation` |
| 6 | `fix: refine WCAG keyboard focus contrast and responsive layout` | `feat: integrate SonicFlow audio queue workstation interface` | `feat: build responsive flash sale dashboard` |
| 7 | `test: audit accessible enterprise grid and browser best practices` | `test: verify audio lifecycle and fix browser fetch binding` | `test: verify timer inventory and checkout invariants` |
| 8 | `docs: finalize HW1 accessible grid audit and evidence` | `docs: complete HW2 engineering and failure mode audit` | `docs: finalize HW3 failure audit and verification` |

These are **recommended replay labels**, not a representation of observed Git history. Actual commit messages and SHAs must be extracted from the repository.

## Appendix B — Expected screenshots / evidence names

### HW1

- `01_Enterprise_Asset_Dashboard.png` — computed asset metrics and grid.
- `02_Grid_Sorting.png` — sort direction and rows.
- `03_Grid_Filtering.png` — filtering and count.
- `04_Grid_Pagination.png` — visible range and page controls.
- `05_Asset_Selection.png` — selection via keyboard and visible state.
- `06_Asset_Details_Dialog.png` — functional View dialog.
- `07_Lighthouse_Accessibility.png` — actual score, page/URL shown.
- `08_Lighthouse_BestPractices.png` — actual score and findings.

### HW2

- `01_SonicFlow_Dashboard.png`; `02_FIFO_Queue_Processing.png`; `03_FIFO_Completed.png`.
- `04_AbortController_Cancellation.png`; `05_Audio_Playback_Spectrum.png`.
- `06_FFT_256_512.png`; `07_Performance_FPS.png`; `08_Unit_Tests.png`.
- `09_Memory_Lifecycle.png`; `10_Git_Decomposition.png`.

### HW3

- `01_FlashVault_Dashboard.png`; `02_Zero_Drift_Timer.png`.
- `03_Inventory_Reservation.png`; `04_Checkout_Confirmed.png`.
- `05_Reservation_Expired.png`; `06_Concurrency_Burst.png`.
- `07_Unit_Tests.png`; `08_Git_Commit_History.png`.

Evidence filenames above are target names. Screenshot content must be captured from actual runs; names alone do not establish results.

## Appendix C — Common failure-recovery prompt

```text
Do not propose a broad rewrite. Here is the exact browser/TypeScript/Vitest error and the file/line where it occurs: [PASTE ERROR]. Diagnose from the actual call path. Explain the root cause in 3–5 technical sentences, identify the smallest safe patch, provide the complete changed function or file only, and add a regression test if relevant. Verify the patch against React StrictMode and production build. Do not disable linting, remove assertions, suppress exceptions, or misrepresent unrelated findings. After checks pass, propose a conventional `fix:` commit scoped to changed files.
```

---

**Final principle:** These prompts are a self-contained build specification. Recreate each result by implementing the stated requirements, following the stages and validating the behavior. An AI's confident summary does not substitute for working source, browser evidence, unit tests, or repository history.
