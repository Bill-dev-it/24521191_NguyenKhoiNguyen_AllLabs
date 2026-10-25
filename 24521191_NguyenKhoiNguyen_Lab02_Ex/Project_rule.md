# LAB 02 — PROJECT RULES

**Course:** Web Application Development  
**Lab:** 02 — Modern React Architecture, Virtual DOM & State Machines  
**Technology Foundation:** Semantic HTML, Modern CSS Layouts, Vanilla JavaScript & Agentic Workflow  
**Accessibility Standard:** WCAG 2.0 Level AA  
**Scope:** 3 In-Class Exercises + 3 Homework Assignments

---

## 1. Project Purpose and Technical Scope

Lab 02 explores the foundations of modern React architecture through Virtual DOM, functional components, reactive state, hooks, and event handling.

All implementation must follow the instructor's specific assignment requirements.

### 1.1 Core Technical Domains

- Virtual Node construction and DOM mounting.
- Pure functional components and unidirectional data flow.
- State storage, cursor indexing, and closure-based state setters.
- Deterministic hook call order.
- Browser event handling and delegation where required.
- Semantic HTML and accessible user interfaces.
- Modern CSS layouts when explicitly required.

### 1.2 Scope Restrictions

- Do not implement concepts from future exercises prematurely.
- Do not infer implementation requirements from lecture slides alone.
- Do not install React or other frameworks for assignments explicitly requiring Vanilla JavaScript.
- Do not introduce JSX compilation, routing, global state libraries, or other tooling without assignment authorization.
- Do not create unrelated components, animations, layouts, or features.
- Do not modify the instructor's original verification expectations.

**Rule:** Conceptual knowledge and implementation deliverables must be distinguished.

---

## 2. Source of Truth

Apply requirements in this order:

1. Instructor's explicit assignment specifications.
2. Instructor-provided test cases and deliverables.
3. WCAG 2.0 Level A and AA success criteria applicable to the resulting web interface.
4. Assignment-specific `Task_decomposition.md`.
5. General project engineering conventions.

If any requirements appear incompatible, stop and report the conflict instead of silently ignoring one.

WCAG requirements should be implemented with the smallest necessary change that preserves the assignment's functionality.

---

## 3. WCAG 2.0 Level AA Accessibility Policy

All relevant web content must be designed and verified against the four WCAG principles:

**Perceivable, Operable, Understandable, Robust (POUR).**

Level AA conformance includes applicable Level A and Level AA requirements.

### 3.1 Perceivable

- WCAG 1.1.1 (A): Provide text alternatives for meaningful non-text content.
- WCAG 1.3.1 (A): Preserve meaningful structure and relationships through semantic HTML.
- WCAG 1.3.2 (A): Preserve meaningful reading and content order.
- WCAG 1.3.3 (A): Do not convey instructions exclusively through sensory characteristics.
- WCAG 1.4.1 (A): Do not rely on color alone to communicate information.
- WCAG 1.4.3 (AA): Maintain text contrast of at least 4.5:1 for normal text and 3:1 for qualifying large text.
- WCAG 1.4.4 (AA): Support text resizing up to 200% without losing content or functionality.
- WCAG 1.4.5 (AA): Prefer real text over images of text where applicable.

### 3.2 Operable

- WCAG 2.1.1 (A): All interactive functionality must be keyboard-operable unless the criterion allows an exception.
- WCAG 2.1.2 (A): Do not create keyboard traps.
- WCAG 2.2.1 (A): Provide appropriate handling of time limits if present.
- WCAG 2.4.1 (A): Provide a mechanism to bypass repeated content blocks where applicable.
- WCAG 2.4.2 (A): Provide a descriptive page title.
- WCAG 2.4.3 (A): Preserve logical focus order.
- WCAG 2.4.4 (A): Provide understandable link purposes in context.
- WCAG 2.4.6 (AA): Use descriptive headings and labels.
- WCAG 2.4.7 (AA): Ensure keyboard focus is visible.

### 3.3 Understandable

- WCAG 3.1.1 (A): Declare the primary language of the page.
- WCAG 3.1.2 (AA): Identify language changes within content when applicable.
- WCAG 3.2.1 (A): Avoid unexpected context changes on focus.
- WCAG 3.2.2 (A): Avoid unexpected context changes on user input.
- WCAG 3.3.1 (A): Identify input errors when forms are present.
- WCAG 3.3.2 (A): Provide labels or instructions for user input.
- WCAG 3.3.3 (AA): Provide error correction suggestions when applicable.
- WCAG 3.3.4 (AA): Provide required safeguards for eligible legal, financial, or data-related submissions.

### 3.4 Robust

- WCAG 4.1.1 (A): Preserve valid markup, nesting, unique IDs, and correctly formed elements.
- WCAG 4.1.2 (A): Ensure user interface components expose accessible names, roles, and values.

### 3.5 Applicability Rule

Not every success criterion applies to every exercise.

Examples:

- No form means form-specific error handling may be not applicable.
- No images means image alternative requirements may be not applicable.
- No audio or video means media-specific criteria may be not applicable.
- No time limits means timing-related requirements may be not applicable.

A criterion must be recorded as `PASS`, `FAIL`, `NOT APPLICABLE`, or `NOT TESTED`.

Do not classify untested criteria as passed.

---

## 4. Semantic HTML and DOM Architecture

### 4.1 Semantic Structure

- Use semantic elements matching their intended purpose.
- Preserve logical heading hierarchy.
- Keep the DOM reading order consistent with the intended content order.
- Use native buttons for actions.
- Avoid unnecessary wrapper elements.
- Do not create duplicate or improperly nested primary landmarks.
- Use valid HTML attributes and unique IDs.

### 4.2 Virtual DOM Requirements

When implementing Mini-React:

- VNodes are JavaScript descriptions, not real DOM elements.
- `createElement` creates virtual element descriptions.
- `createTextElement` represents text children.
- `renderToDOM` converts VNodes into DOM nodes.
- Preserve the specified VNode hierarchy and child ordering.
- Do not add unrequested wrapper nodes.
- Map specified props and event handlers correctly.
- Use real DOM APIs instead of constructing markup through unsafe HTML strings.

### 4.3 Native Accessibility

Prefer built-in browser accessibility behavior.

- Native `<button>` elements must remain keyboard accessible.
- Do not replace a button with a generic clickable container.
- Do not override native semantic roles unnecessarily.
- Do not remove visible keyboard focus indicators.
- Do not add unnecessary ARIA attributes when native semantics already provide the required behavior.

---

## 5. JavaScript, State and Event Architecture

### 5.1 Implementation Rules

- Follow the assignment's specified language and module format.
- Keep functional responsibilities separated.
- Avoid unnecessary global state.
- Preserve deterministic execution where required.
- Avoid hidden DOM side effects in VNode factory functions.

### 5.2 State and Hook Rules

When an assignment requires reactive state:

- Maintain state outside the function component when specified.
- Preserve state across re-renders.
- Reset cursor indexing at the beginning of the required render pass.
- Bind state setters to their corresponding state slots.
- Use the specified value comparison for change detection.
- Do not call hooks conditionally or inside loops or nested functions.

Do not implement hooks in assignments that only require a VNode factory or DOM renderer.

### 5.3 Event Handling

- Use native browser event APIs when required.
- Keep the specified event behavior intact.
- Support keyboard activation of native controls.
- Use event delegation only when required by the assignment.
- Avoid duplicating event handlers or creating unintended listener behavior.

---

## 6. Security and Safe DOM Rendering

Treat dynamic input and text children as untrusted content.

- Use `document.createTextNode()` for text VNodes.
- Never use `innerHTML` to render untrusted text children.
- Do not execute text children as JavaScript.
- Do not use `eval()` or `new Function()`.
- Do not generate executable elements from text payloads.

For Exercise 1, the following inputs must remain inert text:

- `<script>alert(1)</script>`
- `<img onerror=alert(1)> Safe Text`

Security verification is distinct from accessibility verification.

Passing an XSS test does not by itself establish WCAG conformance.

---

## 7. Task Decomposition Standard

Each assignment must have an independent `Task_decomposition.md`.

### 7.1 Required Structure

1. Assignment identification and scope.
2. Requirement traceability matrix.
3. Hierarchical WBS.
4. Implementation dependencies and execution stages.
5. Acceptance criteria for each task.
6. Relevant WCAG 2.0 Level A/AA mappings.
7. Verification evidence and completion status.
8. Required Git commit checkpoints.

### 7.2 WBS Design Rules

Each instructor bullet must be mapped to one or more WBS tasks.

Use consistent hierarchical numbering:

- `1` — Requirement group
- `1.1` — Major task
- `1.1.1` — Actionable subtask

Subtasks must identify specific actions or verifiable outcomes.

Do not use broad statements such as "Implement accessibility" without decomposing them into relevant, testable criteria.

### 7.3 Documentation Accessibility

- Use one clear document title.
- Maintain logical heading levels.
- Use descriptive headings.
- Use real Markdown lists and task checkboxes.
- Never use spacing, indentation alone, or color as the sole means of communicating structure.
- Use meaningful link labels.
- Write concise and understandable task descriptions.
- Keep status labels readable without color dependence.
- Preserve readable code blocks with explicitly identified languages.
- Avoid decorative symbols that substitute for actual content.

These practices improve the accessibility of the Markdown source and its rendered representation, but full accessibility of the final document also depends on the Markdown renderer.

---

## 8. Agentic Development Workflow

The AI Agent must operate under user-controlled, stage-based execution.

### 8.1 Mandatory Workflow

1. Read `Project_rule.md`.
2. Read the current assignment and `Task_decomposition.md`.
3. Identify the current unfinished stage.
4. Identify the instructor requirements covered by that stage.
5. Identify applicable WCAG criteria.
6. Implement only the approved stage.
7. Run relevant functional and accessibility checks.
8. Report changed files, verification results, and remaining issues.
9. Stop and wait for user approval.

### 8.2 Agent Restrictions

The Agent must not:

- Complete an entire assignment in one unapproved operation.
- Implement tasks belonging to future stages.
- Add packages or tools without necessity.
- Change original verification tests merely to obtain a passing result.
- Automatically commit without permission.
- Claim WCAG Level AA conformance without sufficient evidence.
- Mark unverified tasks as complete.
- Add extra application features under the pretext of accessibility.

### 8.3 Reporting Format

At the end of each stage, report:

- Completed WBS items.
- Modified files.
- Functional test results.
- Accessibility results and applicable WCAG criteria.
- Unresolved requirements.
- Expected next stage.
- Required Git commit, if applicable.

---

## 9. Testing and Accessibility Verification

### 9.1 Functional Testing

- Verify required functions and outputs.
- Run the instructor's provided test suite.
- Inspect browser console assertions.
- Check the rendered DOM hierarchy.
- Confirm event behavior.

### 9.2 Accessibility Testing

Use appropriate checks from the following:

- Browser DevTools Elements panel.
- Keyboard-only navigation using Tab, Shift+Tab, Enter, and Space.
- Visible focus verification.
- Semantic HTML and accessible-name inspection.
- HTML validity and duplicate-ID checks.
- Contrast verification where styling is present.
- Text resize testing where applicable.
- Screen-reader or accessibility-tree inspection when needed.

Automated accessibility tools may assist with testing but do not replace manual verification or prove full WCAG compliance.

### 9.3 Evidence Rules

Each verification result must identify:

- What was tested.
- Expected behavior.
- Observed behavior.
- PASS, FAIL, NOT APPLICABLE, or NOT TESTED.

Do not record unperformed tests as successful.

---

## 10. Git and Version Control

- Use meaningful atomic commits.
- Preserve assignment-specific commit messages exactly.
- Commit only completed and verified implementation milestones.
- Keep unrelated files out of implementation commits.
- Do not rewrite existing commit history without user approval.
- Documentation updates may be committed separately.

### Exercise 1 Mandatory Commits

Commit 1:

`feat(core): implement createElement factory`

Commit 2:

`feat(core): implement renderToDOM`

These commits must remain distinct and appear in the correct order.

---

## 11. Definition of Done

An assignment can be marked complete only when:

- All explicitly required functions or features are implemented.
- Instructor-provided tests pass.
- Semantic and security constraints are verified.
- Relevant WCAG 2.0 Level A and AA criteria have been assessed.
- Required manual audits are completed.
- Git requirements are satisfied.
- Task decomposition reflects actual completion status.
- No unapproved scope expansion is present.

A working UI alone is not proof that the assignment or WCAG verification is complete.

---

## 12. Authoritative Reference

W3C — Web Content Accessibility Guidelines (WCAG) 2.0

https://www.w3.org/TR/WCAG20/

W3C — How to Meet WCAG 2 (Quick Reference)

https://www.w3.org/WAI/WCAG22/quickref/

For this project, use the WCAG 2.0 criteria rather than silently substituting WCAG 2.1 or WCAG 2.2 requirements.