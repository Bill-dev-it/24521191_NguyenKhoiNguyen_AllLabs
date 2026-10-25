# WEB APPLICATION DEVELOPMENT — MASTER PROJECT RULES

> **Scope:** Lab03 and all subsequent Exercises, Homeworks, and Projects.
> **Version:** 2.0
> **Architecture:** Mobile-First, Scalable, Accessible, Component-Based.
> **Purpose:** Establish consistent engineering standards across all future labs.
> **Principle:** One master rule file. No lab-specific rule duplication.

---

## 1. PROJECT GOVERNANCE

### 1.1 Single Source of Truth

- Maintain one authoritative PROJECT_RULES.md at the shared workspace root.
- Every future lab inherits these rules automatically.
- Do not create separate permanent project rules for each lab.
- Do not append new master rules merely because a new lab begins.
- Update existing sections only when a genuine course-wide engineering standard changes.
- Assignment-specific requirements belong in TASK_DECOMPOSITION.md.

### 1.2 Requirement Priority

Follow this order:

1. Instructor requirements, assignment slides, and grading rubric.
2. Explicit compatibility and inheritance constraints.
3. Master PROJECT_RULES.md.
4. Assignment TASK_DECOMPOSITION.md.
5. Framework conventions and AI suggestions.

Never silently override instructor requirements.

### 1.3 Rule Interpretation

- MUST: Mandatory requirement.
- SHOULD: Recommended engineering practice.
- MAY: Optional implementation technique.
- Course-specific exceptions must be documented.
- Do not mark unverified tasks as completed.

---

## 2. CROSS-LAB INHERITANCE & CONTINUITY

### 2.1 Inheritance Policy

Each new lab MUST review relevant work from previous labs before implementing overlapping functionality.

Required process:

Review Previous Lab
→ Identify Reusable Assets
→ Analyze New Requirements
→ Reuse / Refactor / Replace / Extend
→ Implement
→ Test
→ Document

### 2.2 Preservation

- Preserve completed work in previous labs.
- Never overwrite older assignments merely to implement new requirements.
- Avoid copying entire projects unnecessarily.
- Prefer controlled refactoring or extraction of reusable components.
- Maintain compatibility with the current assignment's framework and dependencies.

### 2.3 Inheritance Matrix

Every applicable assignment MUST document:

| Legacy Source | Original Function | Target Component | Decision | Reason | Verification |
|---|---|---|---|---|---|

Decisions:

- REUSE: Reuse existing functionality.
- REFACTOR: Preserve behavior while improving implementation.
- REPLACE: Replace incompatible functionality.
- NEW: Implement previously unavailable functionality.

Never claim source-code inheritance without inspecting the actual source.

---

## 3. MOBILE-FIRST DEVELOPMENT

### 3.1 Core Policy

ALL UI development MUST follow Mobile-First Design.

Implementation direction:

Small Mobile
→ Large Mobile
→ Tablet
→ Desktop

Never design Desktop first and shrink the interface afterward.

### 3.2 Mobile Baseline

- Start with the smallest supported viewport.
- Default verification widths: 320px and 375px.
- Base CSS MUST implement the mobile layout.
- Use min-width media queries to progressively enhance larger layouts.
- Avoid desktop-first max-width breakpoint architecture.
- Do not hide required content merely to make it fit on mobile.

### 3.3 Responsive Layout

- Prefer CSS Flexbox and Grid.
- Use fluid dimensions.
- Prefer percentages, min(), max(), and clamp() where appropriate.
- Avoid unnecessary fixed widths and absolute positioning.
- Support variable content lengths.
- Prevent horizontal overflow.
- Maintain readable text and sufficient interactive spacing.
- Preserve semantic structure across all viewport sizes.

### 3.4 Breakpoint Strategy

Use content-driven breakpoints.

Suggested verification targets:

- 320px: Small mobile
- 375px: Standard mobile
- 768px: Tablet
- 1024px: Desktop
- 1440px: Large desktop

Breakpoint values are guidelines, not mandatory implementation boundaries.

### 3.5 Progressive Enhancement

- Ensure core content and actions work on mobile.
- Add layout complexity only when space allows.
- Do not duplicate UI logic for mobile and desktop unnecessarily.
- Preserve accessibility and functionality across devices.
- Prefer enhancement over separate device-specific implementations.

---

## 4. SCALABLE WEB ARCHITECTURE

### 4.1 Architectural Scalability

Applications MUST be designed for maintainability and future extension.

- Prefer reusable components with clear responsibilities.
- Keep component APIs explicit.
- Reduce unnecessary coupling between modules.
- Separate UI, state, domain logic, and data when appropriate.
- Avoid monolithic components.
- Avoid premature abstractions without a real reuse case.

### 4.2 UI Scalability

- Components must tolerate dynamic content.
- Layouts must support varying text lengths.
- Support changing list sizes and data structures.
- Use reusable design tokens.
- Avoid device-specific hardcoded presentation logic.

### 4.3 Performance Scalability

- Avoid unnecessary component re-renders.
- Clean up subscriptions and asynchronous resources.
- Use lazy loading when appropriate.
- Keep images and assets optimized.
- Validate performance claims using actual measurements.
- Do not introduce unnecessary dependencies.

### 4.4 Extensibility

New features SHOULD integrate without major rewrites to existing components.

Reuse established interfaces where possible.

Document breaking architectural changes.

---

## 5. TASK DECOMPOSITION & ENGINEERING WORKFLOW

### 5.1 Mandatory WBS

Each Exercise and Homework MUST contain TASK_DECOMPOSITION.md.

Use a detailed hierarchy:

- Level 1: Assignment
- Level 2: Stage
- Level 3: Task
- Level 4: Subtask
- Level 5: Sub-subtask

Subtasks must be independently understandable and verifiable.

### 5.2 Required Stage Information

Each stage SHOULD define:

- Objective
- Dependencies
- Inheritance sources
- Expected deliverables
- Implementation steps
- Acceptance criteria
- Verification procedure
- Commit checkpoint

### 5.3 Development Workflow

Requirements Analysis
→ Legacy Review
→ Architecture Planning
→ WBS
→ Mobile-First Implementation
→ Testing
→ Refinement
→ Evidence
→ Commit
→ Documentation

### 5.4 Incremental Development

- Work through small checkpoints.
- Explain the purpose of changes before implementing them.
- Avoid generating entire applications in one step unless explicitly requested.
- Verify each meaningful implementation checkpoint.
- Commit coherent and completed changes.
- Preserve the ability to explain the implementation independently.

### 5.5 Stage Completion

A stage is complete only when:

1. Its required functionality is implemented.
2. Relevant tests and checks have been executed.
3. The implementation satisfies its acceptance criteria.
4. Any discovered defects are addressed or documented.
5. The WBS accurately reflects progress.

---

## 6. REACT & COMPONENT ENGINEERING

### 6.1 Version Compatibility

Follow the framework version specified by the assignment.

Lab03 uses React 19.

Future assignments may introduce different framework requirements without changing this policy.

### 6.2 Component Design

- Prefer functional components.
- Use descriptive component names.
- Define clear props and defaults.
- Use stable list keys.
- Avoid unnecessary DOM wrappers.
- Separate reusable components when justified.
- Maintain predictable data flow.

### 6.3 Hooks & State

- Follow the Rules of Hooks.
- Never invoke Hooks conditionally.
- Keep state close to its appropriate owner.
- Avoid duplicated derived state.
- Synchronize external resources through properly managed effects.
- Release timers, event listeners, subscriptions, animation frames, and other resources.
- Preserve correct behavior in React StrictMode.

### 6.4 Component Reuse

Reuse should preserve correctness rather than blindly preserve legacy code.

Refactor older implementations when new assignment requirements demand stronger semantics, accessibility, or architecture.

---

## 7. SEMANTIC HTML & ACCESSIBILITY

### 7.1 Semantic-First

Use semantic HTML whenever possible.

Prefer:

- main
- article
- section
- header
- nav
- heading elements
- ul / ol / li
- dl / dt / dd
- button
- form / label / input
- table elements

Avoid generic containers when an appropriate semantic element exists.

Zero-div constraints become mandatory when explicitly specified by the assignment.

### 7.2 Accessibility

- Preserve logical heading hierarchy.
- Provide accessible names for controls.
- Use appropriate alt text for meaningful images.
- Maintain keyboard accessibility.
- Provide visible focus indicators.
- Use ARIA only when needed.
- Do not rely exclusively on color.
- Maintain readable contrast.
- Support zoom and content resizing.

### 7.3 Responsive Accessibility

Mobile-first implementation MUST preserve usability for touch, keyboard, and assistive technology users.

Accessibility is a requirement throughout development, not a final-stage decoration.

---

## 8. CSS ARCHITECTURE & DESIGN SYSTEM

### 8.1 Styling Strategy

- Use CSS Modules when required by the assignment.
- Prefer scoped styling for reusable components.
- Keep global CSS focused on reset, typography, and page-level foundations.
- Avoid unnecessary inline styles.
- Avoid overly specific selectors.
- Prefer consistent naming conventions.

### 8.2 Design Tokens

Centralize reusable properties where appropriate:

- Colors
- Spacing
- Typography
- Borders
- Radius
- Shadows
- Layout constraints

Use CSS Custom Properties.

### 8.3 Mobile-First CSS Contract

Default styles MUST target mobile layouts.

Use progressive breakpoints:

@media (min-width: 768px) { ... }

@media (min-width: 1024px) { ... }

Do not start from a desktop layout and depend on max-width overrides to make it mobile-compatible.

Exceptions must be technically justified.

### 8.4 Responsive Validation

Verify:

- No unexpected horizontal scrolling.
- Readable typography.
- Stable content wrapping.
- Correct element alignment.
- Usable control sizes.
- Consistent layout across supported widths.

---

## 9. SECURITY & RESOURCE MANAGEMENT

### 9.1 Frontend Security

- Prefer HTTPS resources.
- Never commit credentials, API keys, or secrets.
- Avoid unsafe HTML injection.
- Do not execute untrusted content.
- Validate data at appropriate boundaries.
- Respect browser and server security restrictions.
- Handle external resource failures gracefully.

### 9.2 Resource Lifecycle

- Clean up event listeners.
- Cancel unnecessary asynchronous requests.
- Release Web Audio resources appropriately.
- Cancel animation frames and timers.
- Avoid resource leaks during component mounting and unmounting.
- Handle development StrictMode safely.

### 9.3 Correctness Claims

Do not claim production-level security, concurrency correctness, or scalability without appropriate evidence.

---

## 10. TESTING & QUALITY ASSURANCE

### 10.1 Verification Layers

Apply the relevant checks:

1. Source review
2. Build verification
3. Lint verification
4. Unit tests
5. Integration tests
6. Browser functionality
7. Responsive testing
8. Accessibility inspection
9. Performance testing when required

### 10.2 Responsive Test Matrix

Minimum UI review:

| Viewport | Validation |
|---|---|
| 320px | Small mobile usability |
| 375px | Mobile assignment baseline |
| 768px | Tablet adaptation |
| 1024px | Desktop layout |
| 1440px | Large-screen behavior |

Use the exact viewport required by the instructor even if it differs from these defaults.

### 10.3 Test Integrity

- Never fabricate results.
- Do not weaken assertions merely to pass tests.
- A test suite with zero tests is not evidence of successful testing.
- Record failures and investigate root causes.
- Mark untested features as Not Verified.

### 10.4 Evidence

Preserve actual screenshots and terminal results.

Evidence should show:

- Implemented UI
- Relevant viewport
- Verification results
- Browser behavior
- Required Git history

---

## 11. GIT & VERSION CONTROL

### 11.1 Atomic Commit Policy

Each commit SHOULD represent one coherent, verifiable change.

Commit messages MUST be descriptive and precise.

Avoid vague messages such as:

- update files
- fix bugs
- improve code
- finish stage
- final changes

Prefer:

- feat(ex1): add semantic article and accessible profile heading
- feat(ex1): implement metadata definition list with stable Fragment keys
- feat(ex1): add reusable SkillBadge with semantic list items
- style(ex1): establish mobile-first CSS Module design tokens
- style(ex1): extend profile layout for tablet and desktop

### 11.2 Assignment Commit Constraints

Instructor-specified commit counts take priority.

If exactly two commits are required:

- Divide implementation into multiple checkpoints.
- Keep checkpoints logically separate.
- Combine changes into the required two coherent commits.

Do not violate the grading rubric simply to increase commit frequency.

### 11.3 Commit Validation

Before committing:

1. Run relevant verification.
2. Check git status.
3. Review intended changes.
4. Stage only relevant files.
5. Use a clear commit title.
6. Confirm the commit exists.

### 11.4 Repository Hygiene

Do not commit:

- node_modules
- dist
- environment secrets
- temporary build outputs
- unnecessary binary artifacts

Preserve meaningful source and documentation.

---

## 12. AI-ASSISTED DEVELOPMENT & FAILURE AUDIT

### 12.1 Engineering Responsibility

AI-generated output must be reviewed and verified.

The developer must understand how the implementation works.

Never treat generated code as automatically correct.

### 12.2 Exercise Policy

Exercises do not automatically require AI_FAILURE_AUDIT.md unless the instructor explicitly requires it.

Follow the specified exercise commit requirements.

### 12.3 Homework Audit Policy

When the instructor requires AI auditing for Homework:

- Document at least three genuinely observed AI-generated coding defects per homework, subject to the instructor's rubric.
- Record actual reproduction conditions.
- Explain root causes.
- Show before-and-after corrections.
- Verify each correction.
- Record descriptive fix commits and actual commit hashes.
- Preserve relevant evidence.

Never invent defects to satisfy a numerical requirement.

If fewer confirmed errors were found, report that accurately.

### 12.4 Failure Documentation

For every confirmed issue, record:

- Issue ID
- Failure description
- Affected component or module
- Reproduction procedure
- Expected result
- Actual result
- Root cause
- Original implementation
- Corrected implementation
- Verification evidence
- Fix commit
- Engineering lesson

---

## 13. DOCUMENTATION & DELIVERABLES

### 13.1 Required Documentation

Each assignment SHOULD include:

- TASK_DECOMPOSITION.md
- README.md
- Source code
- Tests when required
- Evidence screenshots when required
- Technical report when required
- AI_FAILURE_AUDIT.md only when applicable

### 13.2 Report Writing

Reports must use concise technical language.

Recommended structure:

1. Objective
2. Architecture / Implementation
3. Results
4. Verification
5. Limitations
6. Conclusion

Do not present unverified achievements as completed results.

### 13.3 Progress Tracking

Use:

- [ ] Not started / not verified
- [x] Implemented and verified
- BLOCKED: Cannot proceed due to a documented dependency

Keep documentation synchronized with actual work.

---

## 14. FUTURE LABS & CHANGE MANAGEMENT

### 14.1 Permanent Applicability

This master file applies automatically to all future labs.

New assignment-specific requirements belong in that assignment's TASK_DECOMPOSITION.md.

Do not expand the master rule file every time a new Lab is introduced.

### 14.2 Change Control

Modify master rules only when a lasting engineering policy changes.

When updating:

1. Identify the existing affected rule.
2. Replace or revise that rule instead of duplicating it.
3. Check consistency across other sections.
4. Document the change in Git.
5. Preserve previous work and legitimate exceptions.

### 14.3 Engineering Direction

All future labs follow:

Requirements
→ Inheritance
→ Planning
→ Mobile-First Architecture
→ Incremental Implementation
→ Verification
→ Responsive Enhancement
→ Documentation
→ Version Control

---

## 15. FINAL ENGINEERING PRINCIPLES

1. Mobile-first by default.
2. Scalable architecture over one-off solutions.
3. Reuse previous work when appropriate.
4. Refactor rather than blindly copy.
5. Follow assignment requirements precisely.
6. Implement incrementally.
7. Understand code before committing.
8. Keep Git history descriptive and truthful.
9. Verify functionality before claiming success.
10. Maintain one consistent engineering standard across future labs.

**Master Principle:**
Build for the smallest supported screen first, extend deliberately, reuse responsibly, and verify every meaningful change.
