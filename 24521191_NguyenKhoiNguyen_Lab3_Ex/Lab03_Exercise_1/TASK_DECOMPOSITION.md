# LAB03 — EXERCISE 1: TASK DECOMPOSITION

**Project:** Semantic Engineer & Pro-Gamer Profile Card  
**Framework:** React 19 (JSX)  
**Architecture:** Component-Based React Application  
**Development Method:** WBS-Based Incremental Development  
**Git Strategy:** 2 Atomic Conventional Commits  
**Primary Constraint:** Zero `<div>` elements inside `DeveloperCard.jsx`

---

## 1. Project Objective

Implement a reusable, semantic, accessible and responsive Developer Profile Card in React 19.

The exercise extends concepts from previous Lab02 exercises (Ex 0.2, 0.3, 4.1, 4.4 and 4.5), integrating component composition, profile data, semantic HTML and scoped styling.

### 1.1 Expected Deliverables

- `DeveloperCard.jsx`
- `SkillBadge.jsx`
- `DeveloperCard.module.css`
- `App.jsx`
- `TASK_DECOMPOSITION.md`
- Verification screenshots
- Exactly two atomic Git commits

---

## 2. Work Breakdown Structure

### 2.1 Stage 1 — Project Preparation & Requirements Analysis

#### 2.1.1 Development Environment

- [ ] **2.1.1.1** Open `Lab03_Exercise_1` in VS Code.
- [ ] **2.1.1.2** Verify the project uses React 19.
- [ ] **2.1.1.3** Verify `react-dom` is compatible with React 19.
- [ ] **2.1.1.4** Verify Vite configuration.
- [ ] **2.1.1.5** Install missing dependencies using `npm install`.
- [ ] **2.1.1.6** Run the development server.
- [ ] **2.1.1.7** Confirm the application loads in the browser.

#### 2.1.2 Legacy Exercise Review

- [ ] **2.1.2.1** Review the earlier developer profile implementation.
- [ ] **2.1.2.2** Identify reusable profile properties.
- [ ] **2.1.2.3** Identify reusable skill data structures.
- [ ] **2.1.2.4** Identify previous inline CSS patterns.
- [ ] **2.1.2.5** Identify non-semantic HTML containers.
- [ ] **2.1.2.6** Identify insecure image sources.
- [ ] **2.1.2.7** Determine what must be refactored for Lab03.

#### 2.1.3 Requirements Decomposition

- [ ] **2.1.3.1** Extract functional requirements from Exercise 1.
- [ ] **2.1.3.2** Extract semantic HTML requirements.
- [ ] **2.1.3.3** Extract React component requirements.
- [ ] **2.1.3.4** Extract CSS Module requirements.
- [ ] **2.1.3.5** Extract 375px responsive requirements.
- [ ] **2.1.3.6** Extract image security requirements.
- [ ] **2.1.3.7** Extract Git commit constraints.
- [ ] **2.1.3.8** Define test and evidence requirements.

#### 2.1.4 Project Structure

- [ ] **2.1.4.1** Create `src/components/` if missing.
- [ ] **2.1.4.2** Prepare `DeveloperCard.jsx`.
- [ ] **2.1.4.3** Prepare `SkillBadge.jsx`.
- [ ] **2.1.4.4** Prepare `DeveloperCard.module.css`.
- [ ] **2.1.4.5** Identify the React entry point.
- [ ] **2.1.4.6** Prepare `TASK_DECOMPOSITION.md`.
- [ ] **2.1.4.7** Check `.gitignore` excludes dependencies and build outputs.

**Stage 1 Deliverable:** Prepared React 19 environment and documented implementation requirements.

---

### 2.2 Stage 2 — Semantic Component Development

#### 2.2.1 DeveloperCard Component Contract

- [ ] **2.2.1.1** Export `DeveloperCard` as a named function.
- [ ] **2.2.1.2** Implement ES6 default function parameters.
- [ ] **2.2.1.3** Define `fullName` property.
- [ ] **2.2.1.4** Define `role` property.
- [ ] **2.2.1.5** Define `avatarUrl` property.
- [ ] **2.2.1.6** Define `metrics` property.
- [ ] **2.2.1.7** Define `skills` property.
- [ ] **2.2.1.8** Validate default rendering when optional props are omitted.

#### 2.2.2 Semantic Card Structure

- [ ] **2.2.2.1** Use `<article>` as the outer card container.
- [ ] **2.2.2.2** Add a unique accessible heading ID.
- [ ] **2.2.2.3** Connect `<article>` to its heading using `aria-labelledby`.
- [ ] **2.2.2.4** Create a semantic `<header>`.
- [ ] **2.2.2.5** Use `<hgroup>` for the name and role.
- [ ] **2.2.2.6** Render the developer's name using `<h2>`.
- [ ] **2.2.2.7** Render the developer's professional role.
- [ ] **2.2.2.8** Verify the resulting heading hierarchy.

#### 2.2.3 Avatar Image

- [ ] **2.2.3.1** Use an HTTPS avatar URL.
- [ ] **2.2.3.2** Remove any insecure HTTP image reference.
- [ ] **2.2.3.3** Add explicit `width="64"`.
- [ ] **2.2.3.4** Add explicit `height="64"`.
- [ ] **2.2.3.5** Provide appropriate image alternative text.
- [ ] **2.2.3.6** Implement an image-loading error handler.
- [ ] **2.2.3.7** Derive fallback initials from `fullName`.
- [ ] **2.2.3.8** Display initials when the image cannot load.
- [ ] **2.2.3.9** Verify the fallback does not create duplicate accessible names.

#### 2.2.4 Developer Metadata

- [ ] **2.2.4.1** Create a metadata object.
- [ ] **2.2.4.2** Use `<dl>` as the metadata container.
- [ ] **2.2.4.3** Use `<dt>` for each metadata label.
- [ ] **2.2.4.4** Use `<dd>` for each metadata value.
- [ ] **2.2.4.5** Iterate through metadata using `Object.entries()`.
- [ ] **2.2.4.6** Wrap each definition pair in `<Fragment>`.
- [ ] **2.2.4.7** Assign stable `key` values to Fragments.
- [ ] **2.2.4.8** Verify labels and values appear in the correct order.

#### 2.2.5 SkillBadge Component

- [ ] **2.2.5.1** Create a reusable `SkillBadge` component.
- [ ] **2.2.5.2** Define skill name property.
- [ ] **2.2.5.3** Define skill level/tier property.
- [ ] **2.2.5.4** Render a semantic `<li>` element.
- [ ] **2.2.5.5** Display skill name and tier.
- [ ] **2.2.5.6** Avoid unnecessary nested wrapper elements.
- [ ] **2.2.5.7** Export the component for reuse.

#### 2.2.6 Skill List Integration

- [ ] **2.2.6.1** Add `<ul>` as the skills container.
- [ ] **2.2.6.2** Provide an accessible skills label.
- [ ] **2.2.6.3** Map the skills array to `SkillBadge`.
- [ ] **2.2.6.4** Assign a stable key based on the skill ID.
- [ ] **2.2.6.5** Avoid array index keys.
- [ ] **2.2.6.6** Test multiple skill entries.
- [ ] **2.2.6.7** Verify list semantics in DevTools.

#### 2.2.7 Zero Div-Soup Enforcement

- [ ] **2.2.7.1** Search `DeveloperCard.jsx` for opening `<div>` tags.
- [ ] **2.2.7.2** Replace unnecessary generic containers with semantic elements.
- [ ] **2.2.7.3** Verify all JSX elements are correctly nested.
- [ ] **2.2.7.4** Verify React Fragments do not create DOM wrappers.
- [ ] **2.2.7.5** Run the zero-div verification command.
- [ ] **2.2.7.6** Confirm zero matches.

#### 2.2.8 Application Integration

- [ ] **2.2.8.1** Import `DeveloperCard` into `App.jsx`.
- [ ] **2.2.8.2** Supply engineer profile information.
- [ ] **2.2.8.3** Supply pro-gamer-related profile information.
- [ ] **2.2.8.4** Provide metadata and skills.
- [ ] **2.2.8.5** Render the component.
- [ ] **2.2.8.6** Verify the component does not throw runtime errors.

**Stage 2 Deliverable:** Functional semantic DeveloperCard with reusable SkillBadge.

**Commit 1:**

`feat(ex1): implement semantic DeveloperCard and SkillBadge`

---

### 2.3 Stage 3 — Scoped Styling & Responsive Design

#### 2.3.1 CSS Module Foundation

- [ ] **2.3.1.1** Create `DeveloperCard.module.css`.
- [ ] **2.3.1.2** Import the CSS Module into `DeveloperCard.jsx`.
- [ ] **2.3.1.3** Define `.card` style.
- [ ] **2.3.1.4** Define `.header` style.
- [ ] **2.3.1.5** Define `.avatar` style.
- [ ] **2.3.1.6** Define `.metrics` style.
- [ ] **2.3.1.7** Define `.skills` style.
- [ ] **2.3.1.8** Apply styles using `className={styles...}`.
- [ ] **2.3.1.9** Verify CSS Module class names are scoped.

#### 2.3.2 CSS Custom Properties

- [ ] **2.3.2.1** Define primary background variable.
- [ ] **2.3.2.2** Define card surface variable.
- [ ] **2.3.2.3** Define primary text variable.
- [ ] **2.3.2.4** Define accent color variable.
- [ ] **2.3.2.5** Define border color variable.
- [ ] **2.3.2.6** Define border-radius variable.
- [ ] **2.3.2.7** Define spacing variables.
- [ ] **2.3.2.8** Replace hardcoded repeated style values with variables.

#### 2.3.3 Desktop Layout

- [ ] **2.3.3.1** Set the card maximum width.
- [ ] **2.3.3.2** Configure card padding.
- [ ] **2.3.3.3** Align avatar and profile heading.
- [ ] **2.3.3.4** Configure metadata grid layout.
- [ ] **2.3.3.5** Configure skill badge wrapping.
- [ ] **2.3.3.6** Apply consistent typography.
- [ ] **2.3.3.7** Verify long text wraps correctly.

#### 2.3.4 Responsive 375px Contract

- [ ] **2.3.4.1** Add responsive media query for small screens.
- [ ] **2.3.4.2** Adjust card padding at 375px.
- [ ] **2.3.4.3** Reflow profile header content.
- [ ] **2.3.4.4** Reduce oversized text where needed.
- [ ] **2.3.4.5** Allow metadata to wrap.
- [ ] **2.3.4.6** Allow skill badges to wrap.
- [ ] **2.3.4.7** Prevent fixed-width elements from overflowing.
- [ ] **2.3.4.8** Verify no horizontal scrolling.

#### 2.3.5 Visual Accessibility

- [ ] **2.3.5.1** Verify readable foreground/background contrast.
- [ ] **2.3.5.2** Use sufficient spacing between text elements.
- [ ] **2.3.5.3** Keep text readable at 200% browser zoom.
- [ ] **2.3.5.4** Avoid conveying skill tier by color alone.
- [ ] **2.3.5.5** Preserve native list and heading semantics.
- [ ] **2.3.5.6** Verify no content is clipped at narrow widths.

**Stage 3 Deliverable:** Scoped CSS Module with responsive 375px layout.

---

### 2.4 Stage 4 — Verification & Quality Assurance

#### 2.4.1 React and Build Verification

- [ ] **2.4.1.1** Run `npm run build`.
- [ ] **2.4.1.2** Verify no JSX syntax errors.
- [ ] **2.4.1.3** Verify all imported modules resolve.
- [ ] **2.4.1.4** Inspect browser Console.
- [ ] **2.4.1.5** Verify no missing key warnings.

#### 2.4.2 Semantic HTML Audit

- [ ] **2.4.2.1** Inspect the rendered `<article>`.
- [ ] **2.4.2.2** Verify the `<header>` element.
- [ ] **2.4.2.3** Verify `<hgroup>` and `<h2>`.
- [ ] **2.4.2.4** Verify description list structure.
- [ ] **2.4.2.5** Verify the skills list.
- [ ] **2.4.2.6** Verify `aria-labelledby` resolves to the heading.
- [ ] **2.4.2.7** Confirm no div elements inside DeveloperCard.

#### 2.4.3 Media Security Audit

- [ ] **2.4.3.1** Search for insecure `http://` avatar URLs.
- [ ] **2.4.3.2** Confirm avatar is loaded using HTTPS.
- [ ] **2.4.3.3** Confirm image dimensions are explicit.
- [ ] **2.4.3.4** Simulate image loading failure.
- [ ] **2.4.3.5** Verify fallback initials are displayed.
- [ ] **2.4.3.6** Inspect browser Console for image errors.

#### 2.4.4 Responsive Audit

- [ ] **2.4.4.1** Open Chrome DevTools.
- [ ] **2.4.4.2** Enable Device Toolbar.
- [ ] **2.4.4.3** Set viewport width to 375px.
- [ ] **2.4.4.4** Inspect card content.
- [ ] **2.4.4.5** Verify skill badges wrap correctly.
- [ ] **2.4.4.6** Verify metadata remains readable.
- [ ] **2.4.4.7** Check for horizontal overflow.
- [ ] **2.4.4.8** Capture responsive screenshot.

#### 2.4.5 Accessibility Tree Audit

- [ ] **2.4.5.1** Open Chrome DevTools Elements.
- [ ] **2.4.5.2** Inspect DeveloperCard in the Accessibility panel.
- [ ] **2.4.5.3** Verify article accessible name.
- [ ] **2.4.5.4** Verify heading structure.
- [ ] **2.4.5.5** Verify definition list semantics.
- [ ] **2.4.5.6** Verify skill list semantics.
- [ ] **2.4.5.7** Confirm that image fallback conveys the intended information.

#### 2.4.6 Git Verification

- [ ] **2.4.6.1** Review current file changes.
- [ ] **2.4.6.2** Stage only Exercise 1 styling-related files.
- [ ] **2.4.6.3** Create the second atomic commit.
- [ ] **2.4.6.4** Verify the two exercise commits in Git history.
- [ ] **2.4.6.5** Verify no generated build output was committed.
- [ ] **2.4.6.6** Confirm working tree status.

**Commit 2:**

`style(ex1): add responsive 375px CSS module`

---

## 3. Verification Commands

### 3.1 React Version

```powershell
npm ls react react-dom
```

Expected: React 19.x.

### 3.2 Build

```powershell
npm run build
```

Expected: successful production build.

### 3.3 Zero Div-Soup

From the Exercise 1 project root:

```powershell
Select-String -Path "src/components/DeveloperCard.jsx" -Pattern '<div\b'
```

Expected: no matches.

### 3.4 HTTP Media Origin Check

```powershell
Select-String -Path "src/components/DeveloperCard.jsx" -Pattern 'http://'
```

Expected: no insecure avatar origins.

### 3.5 Git History

```powershell
git log --oneline -5
```

Verify both exercise commits.

---

## 4. Evidence and Screenshots

| Evidence ID | Screenshot | Purpose |
|---|---|---|
| EV-01 | DeveloperCard Desktop | Verify final profile UI |
| EV-02 | Semantic DOM | Verify article, header, dl and ul |
| EV-03 | Responsive 375px | Verify responsive contract |
| EV-04 | Zero Div Check | Verify zero div elements |
| EV-05 | HTTPS Avatar & Fallback | Verify image security and fallback |
| EV-06 | Git History | Verify two atomic commits |

---

## 5. Final Acceptance Criteria

- [ ] React 19 is installed.
- [ ] DeveloperCard is reusable.
- [ ] SkillBadge is reusable.
- [ ] Semantic article structure is correct.
- [ ] No div tags appear in DeveloperCard.jsx.
- [ ] Metadata uses dl, dt and dd.
- [ ] Skills use ul and li.
- [ ] Stable React keys are used.
- [ ] Avatar is HTTPS-only.
- [ ] Avatar has explicit dimensions.
- [ ] Fallback initials work.
- [ ] CSS Modules are used.
- [ ] CSS custom properties are used.
- [ ] Layout works at 375px.
- [ ] No horizontal scrolling occurs.
- [ ] Build succeeds.
- [ ] Two atomic Git commits exist.
- [ ] Evidence screenshots are captured.

---

## 6. Completion Definition

Exercise 1 is considered complete when the semantic React components, scoped CSS styling, responsive layout and verification requirements pass, and the repository contains exactly two relevant atomic commits.

**End of Task Decomposition — Lab03 Exercise 1**