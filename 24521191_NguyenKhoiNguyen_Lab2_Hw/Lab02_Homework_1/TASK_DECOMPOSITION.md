# HW1 – Task Decomposition

**Project:** IT Asset Management Data Grid  
**Technology:** React, TypeScript, Vite  
**Accessibility Target:** WCAG 2.2 Level AA

## Stage 1 – Project Initialization
- Initialize React + TypeScript project using Vite.
- Configure the project structure.
- Define requirements and task decomposition.

## Stage 2 – Data Contracts
- Define generic `ColumnDef<T>` interface.
- Define generic `DataGridProps<T>` interface.
- Prepare sample IT asset records.

## Stage 3 – Semantic Data Grid
- Create a reusable DataGrid component.
- Render data with native HTML table elements.
- Configure accessible column headers and row structure.

## Stage 4 – Data Operations
- Implement column sorting.
- Implement text filtering.
- Implement pagination and page navigation.

## Stage 5 – Accessibility
- Implement ARIA grid semantics.
- Implement roving tabindex.
- Support Arrow keys for cell navigation.
- Support Enter for row activation.
- Support Space for row selection.
- Provide accessible labels and live announcements.

## Stage 6 – UI and Responsive Design
- Apply responsive table styling.
- Ensure sufficient color contrast.
- Add visible keyboard focus indicators.
- Support reduced-motion preferences.

## Stage 7 – Testing and Verification
- Run TypeScript production build.
- Test all grid interactions.
- Verify keyboard-only operation.
- Run Lighthouse Accessibility and Best Practices audits.
- Fix identified issues and document actual results.

## Completion Criteria
- Filtering, sorting, and pagination operate correctly.
- Keyboard navigation works without a mouse.
- Semantic HTML and ARIA attributes are verified.
- No unsafe HTML injection is used.
- Lighthouse target: 100/100 Accessibility and Best Practices.