
# Task Decomposition

## Exercise 1: Semantic DOM Architecture & A11y Contract

### T-01: Semantic Landmark Tree

**Objective:** Build an accessible HTML page using semantic landmarks without using any div elements.

| WBS ID | Task | Description |
|---|---|---|
| T-01A | Define Landmark Hierarchy | Create the semantic HTML structure using header, nav, main, and section without any div elements. |
| T-01B | Implement Skip Link | Add an accessible "Skip to Content" link pointing to #main-content. |
| T-01C | Verify Accessibility | Use Chrome DevTools to verify the landmark tree and check that the skip link works. |
| T-01D | Atomic Commit | Commit the completed semantic HTML milestone separately from CSS. |

**Acceptance Criteria:**
- No div elements are used.
- The page contains header, nav, main, and section landmarks.
- The main element has id="main-content".
- The skip link navigates to the main content.
- The landmark tree is verified using Chrome DevTools.
- HTML and CSS changes are not combined in the same commit.

## Project: Aviation B2B E-Commerce Platform

The Lab exercises are implemented as incremental parts of our existing Aviation B2B E-Commerce Platform rather than as separate, unrelated websites.

Our project is a B2B marketplace connecting aviation parts suppliers with organizations that need aircraft engine components. It also includes a Remaining Useful Life (RUL) prediction service to support maintenance planning and parts recommendations.

The project follows an existing Work Breakdown Structure managed through GitHub Projects. This document reuses that planning structure and records the incremental work completed during the Website Development labs.