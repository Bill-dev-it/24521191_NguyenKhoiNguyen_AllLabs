# Lab 02 — Exercise 1: Task Decomposition

**Exercise:** Building Mini-React VNode & Mounting Engine  
**Sprint:** In-Class Sprint 1 — 35 Minutes  
**Accessibility Target:** WCAG 2.0 Level AA  
**Implementation Status:** Completed

## 1. Core Mini-React Implementation

**Instructor Requirement 1:** Implement `createElement`, `createTextElement`, and `renderToDOM` from scratch.

### 1.1 createElement

- [x] Create and export `createElement`.
- [x] Accept element type, props, and children.
- [x] Support null properties.
- [x] Generate the correct Virtual Node structure.
- [x] Convert primitive string children into text VNodes.
- [x] Preserve nested VNodes and child ordering.

### 1.2 createTextElement

- [x] Implement and export `createTextElement`.
- [x] Represent textual content using `TEXT_ELEMENT`.
- [x] Store the original text in `props.nodeValue`.
- [x] Ensure compatibility with the DOM renderer.

### 1.3 renderToDOM

- [x] Implement and export `renderToDOM`.
- [x] Convert element VNodes into native DOM elements.
- [x] Convert text VNodes into DOM text nodes.
- [x] Apply required properties: `id`, `role`, and `className`.
- [x] Attach the button click event listener.
- [x] Render children recursively.
- [x] Return the completed DOM node.

**Result:** PASS — All three required functions implemented.

## 2. Semantic HTML Constraint

**Instructor Requirement 2:** Render semantic HTML elements and prevent div-soup.

- [x] Render `<main>` correctly.
- [x] Render `<section>` correctly.
- [x] Render native `<button>` correctly.
- [x] Preserve the required `header`, `h1`, and `p` hierarchy.
- [x] Preserve VNode parent-child relationships.
- [x] Verify no unnecessary `<div>` wrappers are created.
- [x] Use `section#app` as the mount container.
- [x] Confirm the generated application has one primary `main` landmark.

**WCAG Mapping:** 1.3.1, 1.3.2, 4.1.1, 4.1.2.

**Result:** PASS — Semantic structure verified with Chrome DevTools.

## 3. XSS Resistance

**Instructor Requirement 3:** Verify XSS resistance for `<script>alert(1)</script>`.

- [x] Use text VNodes for string children.
- [x] Render text using `document.createTextNode()`.
- [x] Verify the supplied `<img onerror=alert(1)> Safe Text` payload.
- [x] Verify the `<script>alert(1)</script>` payload.
- [x] Confirm malicious strings remain literal text.
- [x] Confirm no executable elements are created from the tested strings.
- [x] Confirm the tested payloads do not execute.

**Result:** PASS — Tested with Chrome DevTools Snippets.

## 4. DevTools DOM Audit

**Instructor Requirement 4:** Confirm DOM and VNode consistency without orphan nodes.

- [x] Open the application in Chrome.
- [x] Inspect the Elements panel.
- [x] Verify `main#root-view`.
- [x] Verify `header.hero`, `h1`, `p`, and `button`.
- [x] Verify expected element properties.
- [x] Verify parent-child relationships.
- [x] Verify the renderer adds no unnecessary nodes.
- [x] Verify the button click outputs `Ping`.

**Result:** PASS — Rendered application DOM matches the expected VNode hierarchy.

## 5. Git Requirements

**Instructor Requirement 5:** Create two separate implementation commits.

- [x] Complete and commit the VNode factory.

Commit: `8a22995`  
Message: `feat(core): implement createElement factory`

- [x] Complete and commit the DOM mounting engine.

Commit: `8afdf0b`  
Message: `feat(core): implement renderToDOM`

**Result:** PASS — Both commits verified in Git history.

## 6. Checkpoint 1 Verification

- [x] Prepare `index.html`.
- [x] Prepare `mini_react.js`.
- [x] Prepare `test_runner.js`.
- [x] Construct `vApp` using the provided test.
- [x] Locate the application mount point.
- [x] Mount using `replaceChildren(renderToDOM(vApp))`.
- [x] Confirm the button exists.
- [x] Confirm the `Mount Failed` assertion does not trigger.
- [x] Verify the expected visible output.

**Result:** PASS — Checkpoint 1 successfully executed.

## 7. WCAG 2.0 Level AA — Relevant Accessibility Checks

### 7.1 Perceivable

- [x] Verify semantic heading and content structure (1.3.1).
- [x] Verify meaningful reading order (1.3.2).
- [x] Check displayed text contrast (1.4.3).
- [x] Check content usability at 200% zoom (1.4.4).

### 7.2 Operable

- [x] Verify keyboard focus using Tab (2.1.1).
- [x] Verify Enter and Space button activation (2.1.1).
- [x] Verify no keyboard trap during tested navigation (2.1.2).
- [x] Verify logical focus order (2.4.3).
- [x] Verify visible focus indication (2.4.7).

### 7.3 Understandable

- [x] Confirm the document language is declared (3.1.1).
- [x] Confirm a descriptive page title exists (2.4.2).
- [x] Verify focusing the button does not unexpectedly change context (3.2.1).

### 7.4 Robust

- [x] Inspect valid nesting and element hierarchy (4.1.1).
- [x] Verify unique application IDs (4.1.1).
- [x] Verify the native button has an accessible name and role (4.1.2).
- [x] Verify one generated primary main landmark.

**Result:** Reported accessibility checks completed.

**Conformance Note:** These are exercise-level accessibility checks. They are not a formal audit of every applicable WCAG 2.0 Level A and AA success criterion.

## 8. Final Exercise Status

| Requirement | Result |
|---|---|
| Core Mini-React functions | PASS |
| Semantic HTML and zero div-soup | PASS |
| XSS resistance | PASS |
| DOM and VNode audit | PASS |
| Mandatory Git commits | PASS |
| Checkpoint 1 | PASS |
| Exercise-level accessibility checks | PASS |

**Final Status:** Exercise 1 implementation and required checks completed.

**Reference:** https://www.w3.org/TR/WCAG20/