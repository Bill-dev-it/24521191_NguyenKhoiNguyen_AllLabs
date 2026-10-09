# LAB 02 — EXERCISE 1: TASK DECOMPOSITION

**Topic:** Modern React Architecture, Virtual DOM & State Machines  
**Exercise:** Building Mini-React VNode & Mounting Engine  
**Sprint:** In-Class Sprint 1 — 35 Minutes

## Objective

Implement a minimal Mini-React Virtual Node factory and DOM mounting engine from scratch, following the instructor's five specifications and the provided Checkpoint 1 verification test.

**Scope:** `createElement`, `createTextElement`, `renderToDOM`, semantic HTML output, XSS resistance, DOM audit, and two required Git commits.

---

## WBS 1 — Core Mini-React Implementation

**Source:** Bullet 1 — Implement `createElement`, `createTextElement`, and `renderToDOM` from scratch.

### 1.1 — Implement createElement

- [ ] 1.1.1 Create `mini-react.js` as an ES module.
- [ ] 1.1.2 Define and export `createElement`.
- [ ] 1.1.3 Accept `type`, `props`, and child arguments.
- [ ] 1.1.4 Construct a Virtual Node containing the element type, properties, and children.
- [ ] 1.1.5 Support `null` props as used in the supplied test.
- [ ] 1.1.6 Convert primitive text children into text VNodes.
- [ ] 1.1.7 Preserve nested child VNodes and their order.

**Verification:** Confirm the constructed VNode tree represents the structure defined in the instructor's test.

### 1.2 — Implement createTextElement

- [ ] 1.2.1 Define and export `createTextElement`.
- [ ] 1.2.2 Accept a primitive text value.
- [ ] 1.2.3 Construct a text VNode representation.
- [ ] 1.2.4 Store the text value without interpreting it as HTML markup.
- [ ] 1.2.5 Ensure text VNodes are compatible with the mounting engine.

**Verification:** Text children must remain text in the virtual representation.

### 1.3 — Implement renderToDOM

- [ ] 1.3.1 Define and export `renderToDOM`.
- [ ] 1.3.2 Accept a Virtual Node as input.
- [ ] 1.3.3 Create real elements using `document.createElement`.
- [ ] 1.3.4 Create real text nodes using `document.createTextNode`.
- [ ] 1.3.5 Apply VNode properties to the corresponding DOM elements.
- [ ] 1.3.6 Handle `className` as a DOM class.
- [ ] 1.3.7 Attach the `onClick` handler to the button.
- [ ] 1.3.8 Recursively render nested children.
- [ ] 1.3.9 Append rendered child nodes to the correct parent.
- [ ] 1.3.10 Return the completed DOM node for mounting.

**Verification:** `renderToDOM(vApp)` must return a mountable DOM node matching the original VNode hierarchy.

---

## WBS 2 — Semantic HTML Constraint

**Source:** Bullet 2 — Produce semantic tags (`<main>`, `<section>`, `<button>`); div-soup banned.

### 2.1 — Semantic Element Rendering

- [ ] 2.1.1 Verify `createElement` accepts `main` as an element type.
- [ ] 2.1.2 Verify `createElement` accepts `section` as an element type.
- [ ] 2.1.3 Verify `createElement` accepts `button` as an element type.
- [ ] 2.1.4 Ensure `renderToDOM` creates the actual requested HTML tag.

### 2.2 — Preserve Semantic Hierarchy

- [ ] 2.2.1 Preserve parent-child relationships from the VNode tree.
- [ ] 2.2.2 Preserve the specified nesting of semantic elements.
- [ ] 2.2.3 Verify elements are not replaced with generic containers.

### 2.3 — Zero Div-Soup Verification

- [ ] 2.3.1 Inspect the generated application DOM.
- [ ] 2.3.2 Confirm the renderer does not introduce `<div>` wrappers.
- [ ] 2.3.3 Confirm all output elements retain their specified tag names.

**Verification:** The output must respect the VNode tag types without introducing div-based wrappers.

---

## WBS 3 — Security Checkpoint: XSS Resistance

**Source:** Bullet 3 — Verify XSS resistance when passing `<script>alert(1)</script>` as a child.

### 3.1 — Safe Text Processing

- [ ] 3.1.1 Ensure string children are represented as text VNodes.
- [ ] 3.1.2 Render text children using text nodes rather than HTML parsing.
- [ ] 3.1.3 Preserve special characters as literal text.

### 3.2 — XSS Verification

- [ ] 3.2.1 Pass `<script>alert(1)</script>` as a child of a VNode.
- [ ] 3.2.2 Render the VNode into the DOM.
- [ ] 3.2.3 Confirm the payload appears as literal text.
- [ ] 3.2.4 Confirm no JavaScript alert is executed.
- [ ] 3.2.5 Confirm no executable `<script>` element is created from the string.

### 3.3 — Provided Test String

- [ ] 3.3.1 Render `<img onerror=alert(1)> Safe Text` from the supplied test.
- [ ] 3.3.2 Confirm it is displayed as text rather than interpreted as an image element.
- [ ] 3.3.3 Confirm the injected event handler does not execute.

**Verification:** Both XSS test strings must remain inert text.

---

## WBS 4 — Browser DevTools Audit

**Source:** Bullet 4 — Inspect the Elements panel and confirm that the actual DOM matches the VNode tree without orphan nodes.

### 4.1 — Inspect Rendered DOM

- [ ] 4.1.1 Open the page in the browser.
- [ ] 4.1.2 Open Developer Tools.
- [ ] 4.1.3 Navigate to the Elements panel.
- [ ] 4.1.4 Locate the mounted application root.

### 4.2 — Compare DOM and VNode Structure

- [ ] 4.2.1 Verify the `<main>` root element.
- [ ] 4.2.2 Verify the nested `<header>`, `<h1>`, and `<p>` elements.
- [ ] 4.2.3 Verify the `<button>` element.
- [ ] 4.2.4 Verify expected text content.
- [ ] 4.2.5 Verify `id`, `role`, and `className` mapping.
- [ ] 4.2.6 Verify that the button click executes the provided handler.

### 4.3 — Orphan Node Audit

- [ ] 4.3.1 Verify each rendered child appears under its expected parent.
- [ ] 4.3.2 Verify no unintended sibling or duplicate nodes are created by the renderer.
- [ ] 4.3.3 Confirm the rendered tree matches the VNode structure.

**Verification:** The browser's actual DOM must match the specified VNode tree.

---

## WBS 5 — Git Commit Requirements

**Source:** Bullet 5 — Two mandatory Git commits.

### 5.1 — Commit 1: VNode Factory

- [ ] 5.1.1 Complete `createElement`.
- [ ] 5.1.2 Complete `createTextElement`.
- [ ] 5.1.3 Verify the VNode factory.
- [ ] 5.1.4 Stage the relevant implementation file.
- [ ] 5.1.5 Create the required commit:

`feat(core): implement createElement factory`

### 5.2 — Commit 2: DOM Mounting

- [ ] 5.2.1 Complete `renderToDOM`.
- [ ] 5.2.2 Verify the DOM rendering behavior.
- [ ] 5.2.3 Stage the relevant implementation changes.
- [ ] 5.2.4 Create the required commit:

`feat(core): implement renderToDOM`

**Verification:** Git history must contain both required commits in the correct order.

---

## WBS 6 — Checkpoint 1 Verification Test Suite

**Source:** Instructor-provided `test-runner.js`.

### 6.1 — Prepare the Verification Environment

- [ ] 6.1.1 Create an HTML entry point containing `id="app"`.
- [ ] 6.1.2 Create `test-runner.js` using the instructor-provided test code.
- [ ] 6.1.3 Import `createElement` and `renderToDOM` from `./mini-react.js`.
- [ ] 6.1.4 Load the test script as a JavaScript module.

### 6.2 — Execute Provided Verification

- [ ] 6.2.1 Construct the `vApp` VNode tree exactly as specified.
- [ ] 6.2.2 Locate the application root using `document.getElementById('app')`.
- [ ] 6.2.3 Execute `renderToDOM(vApp)`.
- [ ] 6.2.4 Mount the returned DOM node using `root.replaceChildren(...)`.
- [ ] 6.2.5 Execute the provided `console.assert` statement.

### 6.3 — Validate Checkpoint Result

- [ ] 6.3.1 Confirm the `<button>` exists inside the mounted application.
- [ ] 6.3.2 Confirm no `Mount Failed` assertion is reported.
- [ ] 6.3.3 Confirm the browser console contains no relevant runtime errors.
- [ ] 6.3.4 Confirm the mounted DOM matches the test's intended structure.

**Verification:** The instructor's Checkpoint 1 test must pass without modifying its expected behavior.

---

## Implementation Order — Stage-Based Execution

The WBS above is organized by instructor requirements. Actual implementation must follow the dependency order below.

| Stage | Related WBS | Deliverable |
|---|---|---|
| Stage 1 — Setup | 6.1 | HTML entry point and test environment |
| Stage 2 — VNode Factory | 1.1, 1.2, 5.1 | `createElement`, `createTextElement`, Commit 1 |
| Stage 3 — DOM Mounting | 1.3, 5.2 | `renderToDOM`, Commit 2 |
| Stage 4 — Verification | 2, 3, 4, 6.2, 6.3 | Semantic, XSS, DevTools and Checkpoint 1 verification |

**Execution rule:** Complete one stage, verify its applicable acceptance criteria, and stop for approval before proceeding.

---

## Final Acceptance Checklist

- [ ] `createElement` implemented.
- [ ] `createTextElement` implemented.
- [ ] `renderToDOM` implemented.
- [ ] Semantic HTML constraints satisfied.
- [ ] Zero div-soup requirement satisfied.
- [ ] XSS resistance verified.
- [ ] DOM and VNode tree consistency verified in DevTools.
- [ ] No orphan nodes identified.
- [ ] Checkpoint 1 passed.
- [ ] Both mandatory Git commits completed.