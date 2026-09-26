# Homework 1: Production Portfolio

## Goal

Build a responsive, accessible portfolio site and complete each mandatory milestone as a separate reviewable commit. Do not combine all homework work into one commit.

## Milestones

### M1: WCAG 2.2 AA Audit

- Establish semantic landmarks (`header`, labeled `nav`, one `main`, sections, and `footer`) and a working skip link.
- Define foreground/background design tokens and verify normal text contrast is at least 4.5:1; verify large text and non-text controls as well.
- Keep heading order, link purpose, and accessible names coherent.
- Record manual audit checks and any residual limitations here.
- Commit: `fix(a11y): contrast & landmarks`.

M1 implementation notes:

- Added one labeled primary navigation landmark, one `main#main-content`, section headings, a footer, and a working skip link.
- Added dark palette design tokens and visible `:focus-visible` styling.
- Browser contrast audit of all rendered text nodes in the current page state: all checked pairs passed their size-appropriate WCAG AA thresholds. The lowest normal-text pair was muted project-card copy at 7.63:1; measured body text was 16.67:1, hero muted copy 10.73:1, accent links 13.32:1, primary button text/background 12.41:1, tag text/background 16.67:1, and skip-link text/background 11.88:1. Hover/focus color contrast still requires additional manual review.
- Browser checks: one `main`, valid skip target, logical heading outline, portrait image loaded, and no horizontal overflow at 375px.
- Added `tabindex="-1"` to `main#main-content`; activating the skip link with Enter now moves focus to main and retains a visible focus outline.
- There are no dialogs, drawers, or custom keyboard loops in M1, so no focus trap is present in the current implementation. Full sequential Tab/Shift+Tab interaction testing is reserved for M2.
- This is a documented browser audit, not a formal third-party accessibility certification. CSP and Lighthouse are reserved for M3 and M4.

### M2: Focus Trap Prevention

- Ensure all interactive elements have visible keyboard focus and logical DOM/tab order.
- Do not create a modal, drawer, or custom keyboard loop unless a real workflow requires one.
- Verify focus is never trapped; test Tab, Shift+Tab, Enter, and Escape where applicable.
- Commit: `fix(a11y): keyboard trap prevention`.

M2 verification notes:

- No modal, drawer, dialog, or custom focus loop exists in this milestone, so there is no UI-created focus trap and no Escape-dismiss behavior to test.
- Browser keyboard traversal reached the skip link, brand link, main navigation, hero action, all three project links, contact link, footer brand, and GitHub link in DOM order; Tab continued through the browser's normal sequence and Shift+Tab reversed direction.
- All 12 observed keyboard stops displayed the shared 2.5px `:focus-visible` outline. The skip-link Enter behavior and focus handoff to `main#main-content` were also verified under M1.
- No code change was needed for M2; this milestone records keyboard verification only. This was a browser interaction check, not assistive-technology certification.

### M3: Strict Content Security Policy

- Add a restrictive CSP that supports the portfolio while avoiding inline scripts, inline event handlers, `eval`, and unnecessary third-party origins.
- Keep scripts and styles in external files; use nonces/hashes only if a documented requirement makes inline code unavoidable.
- Verify the browser console reports no CSP violations.
- Commit: `security(csp): enforce strict policy`.

### M4: Lighthouse 100 and Asset Optimization

- Audit a production build and record the Lighthouse run conditions/results.
- Optimize and self-host required visual assets; provide intrinsic dimensions and responsive loading behavior.
- Address performance, accessibility, best-practices, and SEO findings without weakening CSP or accessibility.
- Commit: `perf: optimize assets`.

## Shared Acceptance Criteria

- Responsive layout with no horizontal overflow at 375px.
- Semantic HTML, accessible labels, visible focus, and WCAG 2.2 AA contrast.
- No inline event handlers; CSP is restrictive and produces no violations.
- Keep changes limited to the active milestone and validate it before committing.
- Homework requires at least four distinct commits, one for each milestone.

## Progress

- M1 implementation: complete; awaiting student review and commit.
- M2 implementation: no UI change required; browser keyboard audit complete, awaiting student review and commit.
- M3 and M4: not started.
