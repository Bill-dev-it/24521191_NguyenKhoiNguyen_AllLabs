# LAB 02 — PROJECT RULES

**Course:** Web Application Development  
**Lab:** 02 — Modern React Architecture, Virtual DOM & State Machines

**Technical foundation:** Semantic HTML, Modern CSS Layouts, Vanilla JavaScript & Agentic Workflow

## 1. Project Scope

Lab 02 consists of three in-class exercises and three homework assignments.

The core learning focus is understanding modern React architecture through foundational web technologies, including:

- Virtual DOM representation and DOM reconciliation concepts.
- Declarative UI construction and component-oriented thinking.
- JavaScript-based DOM creation, mounting, and updates.
- State machines and explicit UI state transitions.
- Semantic HTML structure and browser-native behavior.
- Modern CSS layouts where required by the assignment.

These concepts must be implemented only to the extent required by each exercise or homework specification.

**React concepts do not automatically authorize using the React library.** When an assignment requires a Mini-React or Vanilla JavaScript implementation, use native browser APIs rather than React, ReactDOM, or third-party Virtual DOM libraries.

## 2. Source of Truth and Scope Control

The instructor's assignment specifications are the authoritative source for implementation.

Apply requirements in this order:

1. Explicit assignment specifications and constraints.
2. Provided verification tests and expected behavior.
3. Assignment-specific task decomposition.
4. General project rules.

If any rules conflict with the assignment, follow the instructor's explicit requirements and report the conflict.

Do not assume that every assignment requires Virtual DOM, CSS, state machines, or React components.

Do not add features based solely on the Lab 02 title.

**Strict scope boundaries:**

- Do not implement features from later stages.
- Do not add optional features without explicit approval.
- Do not introduce unnecessary abstractions or architecture layers.
- Do not silently alter provided test cases.
- Do not introduce external packages unless explicitly required.

## 3. JavaScript and Mini-React Architecture

For assignments that require a custom Virtual DOM implementation:

- Use JavaScript ES modules.
- Maintain a clear distinction between virtual representations and real browser DOM nodes.
- `createElement` constructs virtual element descriptions and must not directly mount DOM nodes.
- `createTextElement` represents text content within the virtual structure.
- `renderToDOM` converts the virtual structure into real DOM nodes.
- Preserve parent-child relationships and element order.
- Use native DOM APIs for node creation and mounting.
- Implement property and event handling only as required by the current assignment.

Do not introduce JSX compilation, React dependencies, Fiber scheduling, diffing, reconciliation, or hooks unless specifically requested.

## 4. Semantic HTML Rules

Use semantic HTML elements as required by the assignment.

- Preserve the specified element hierarchy.
- Do not substitute semantic elements with generic containers.
- Use real DOM elements instead of HTML string templates when implementing a DOM renderer.
- Respect explicit restrictions such as the ban on div-based output.
- Keep HTML structure consistent with the provided verification test.

When an assignment prohibits `<div>` output, the generated application tree must not contain `<div>` elements.

## 5. Security and DOM Safety

Treat dynamic text content as untrusted data.

- Render text through `document.createTextNode()` or an equivalent safe native text API.
- Never insert arbitrary child strings through `innerHTML`.
- Do not execute strings as JavaScript.
- Do not use `eval()` or `new Function()`.
- Preserve the difference between text content and executable markup.

Security checkpoints must be verified using the instructor's required test inputs.

For Exercise 1, the string `<script>alert(1)</script>` must remain inert text and must not execute.

## 6. State Machine Rules

For assignments involving state machines:

- Define only the states explicitly required by the assignment.
- Identify permitted state transitions.
- Implement transitions using the specified events or actions.
- Keep state changes deterministic.
- Ensure the rendered UI reflects the current state.
- Validate transitions against assignment-specific tests.

Do not introduce global state libraries, Redux, XState, or additional state-management frameworks unless requested.

## 7. Styling and CSS Rules

For assignments requiring CSS:

- Follow the specified layout and visual requirements.
- Prefer native modern CSS features when appropriate.
- Preserve semantic HTML when styling.
- Keep styling concerns separate from JavaScript logic where required.
- Do not add animation, component libraries, CSS frameworks, or decorative effects unless specified.

Do not create unnecessary CSS files for assignments that do not require styling.

## 8. Agentic Workflow and Stage Execution

The AI Agent acts as an implementation assistant, not an autonomous project owner.

Every assignment must have its own `task_decomposition.md`.

**Mandatory execution protocol:**

1. Read the assignment requirements.
2. Read `PROJECT_RULES.md`.
3. Read the assignment's `task_decomposition.md`.
4. Identify the current unfinished stage.
5. Implement only that stage.
6. Verify its acceptance criteria.
7. Report the changed files and verification results.
8. Stop and wait for explicit user approval before moving to the next stage.

The Agent must not:

- One-shot the entire exercise or homework.
- Combine multiple stages without permission.
- Automatically implement upcoming stages.
- Generate unrelated files.
- Rewrite previously verified stages unnecessarily.
- Claim success without verification.
- Commit code without the required stage verification.

When requirements are ambiguous, ask for clarification rather than inventing behavior.

## 9. Testing and Browser DevTools

Verification must correspond directly to the instructor's requirements.

For Virtual DOM exercises, inspect:

- Virtual Node structure.
- Generated real DOM node types.
- Element properties and event handlers.
- Parent-child hierarchy.
- Semantic HTML elements.
- Safe text-node behavior.
- Console assertions and runtime errors.

Use the browser DevTools Elements panel whenever a live DOM audit is required.

Do not replace the instructor's verification test with a different test suite.

Additional manual checks may be used only to verify explicit assignment constraints.

## 10. Git and Commit Discipline

Maintain a meaningful Git history reflecting completed implementation milestones.

- Follow exact commit messages when specified by the instructor.
- Keep commits focused on their intended functionality.
- Verify a stage before committing.
- Do not merge required implementation commits.
- Do not commit unrelated experiments, generated dependencies, or temporary debugging files.
- Do not execute Git commit automatically without user approval.

For Exercise 1, the instructor requires:

**Commit 1:**
`feat(core): implement createElement factory`

**Commit 2:**
`feat(core): implement renderToDOM`

These are the required implementation commits and must remain distinct.

## 11. Completion Criteria

An assignment is complete only when:

- All explicit requirements are implemented.
- All specified constraints are satisfied.
- Provided verification tests pass.
- Required manual or DevTools audits are performed.
- Required Git commits exist.
- The task decomposition reflects verified completion.
- No out-of-scope implementation has been introduced.

Do not proceed to the next assignment until the current assignment has been reviewed and accepted.