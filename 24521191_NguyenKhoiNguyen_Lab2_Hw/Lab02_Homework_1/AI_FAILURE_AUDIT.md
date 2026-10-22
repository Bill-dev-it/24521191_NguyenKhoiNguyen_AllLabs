# AI Failure Mode Audit: Security, Accessibility & Engineering Verification

**Document:** `AI_FAILURE_AUDIT.md`  
**Project:** Enterprise IT Asset Management Data Grid  
**Assignment:** Homework 01 – Production Enterprise Data-Grid (WCAG 2.2 AA)  
**Technology:** React 19, TypeScript, Vite  
**Workspace:** `Lab02_Homework_1`  
**Compliance Baseline:** WCAG 2.2 Level AA, W3C ARIA Authoring Practices Grid Pattern  
**Lighthouse Target:** Accessibility 100/100 and Best Practices 100/100

---

## 1. Executive Summary

Homework 01 implements a reusable, accessible enterprise DataGrid for IT asset inventory management.

The application supports data filtering, column sorting, pagination, keyboard navigation, row selection, and an interactive asset details dialog.

The development process followed seven incremental stages, with separate Git commits documenting architectural and functional changes.

AI-assisted development introduced several engineering considerations requiring explicit review, particularly DOM security, keyboard focus coordination, semantic HTML, and browser security policies.

This report distinguishes between potential AI-generated implementation defects, preventive engineering decisions, and issues directly observed during testing.

### 1.1 Audit Objectives

1. Identify security risks when rendering dynamic asset records.
2. Evaluate keyboard navigation and focus coordination.
3. Verify semantic HTML and ARIA Grid implementation.
4. Investigate browser CSP issues affecting Lighthouse.
5. Document implemented safeguards and testing procedures.
6. Prepare technical explanations for classroom evaluation.

### 1.2 Verified Results

| Verification | Result | Status |
|---|---|---|
| Lighthouse Accessibility | 100/100 | PASS |
| Lighthouse Best Practices | 100/100 | PASS |
| Production Build | Successfully completed during development | PASS |
| TypeScript Contracts | Implemented | PASS |
| Semantic DataGrid | Implemented | PASS |
| Keyboard Interaction | Implemented; complete manual audit pending | PARTIAL |
| Screen Reader Testing | Not yet documented | PENDING |
| Full WCAG 2.2 AA Conformance | Not established by Lighthouse alone | PENDING |

**Verified audit environment:**
- Browser: Google Chrome Guest Profile
- Application URL: `http://localhost:4173/`
- Environment: Vite Production Preview
- Audit mode: Lighthouse Navigation
- Device profile: Desktop
- Audit date: October 22, 2026

Both required Lighthouse categories achieved 100/100 in the Guest Profile environment.

---

## 2. AI Failure Mode Audit Matrix

| ID | Failure Mode | Affected Module | Technical Risk | Mitigation |
|---|---|---|---|---|
| FM-01 | Unsafe HTML Rendering / XSS | `DataGrid.tsx` | Execution of injected HTML or JavaScript | React JSX text rendering |
| FM-02 | Roving Tabindex Desynchronization | `DataGrid.tsx` | Incorrect keyboard focus after data changes | Bounded 2D focus coordinates |
| FM-03 | Non-Semantic Grid Structure | `DataGrid.tsx` | Screen-reader navigation failure | Native HTML table with ARIA roles |
| FM-04 | Content Security Policy / Browser Environment | `index.html`, browser environment | CSP violations, blocked execution, reduced Lighthouse score | Root-cause inspection and environment isolation |
| FM-05 | Incorrect Data Operation Order | `DataGrid.tsx` | Inconsistent filtering and sorting across pages | Filter → Sort → Paginate |

**Classification note:**

FM-01, FM-02, FM-03 and FM-05 describe implementation risks reviewed or mitigated during development. They should not be interpreted as confirmed incidents in the committed project without supporting reproduction evidence.

FM-04 corresponds to an issue actually observed during the Lighthouse audit.

---

## 3. Failure Mode 01: Unsafe HTML Rendering and Cross-Site Scripting

### 3.1 Defect Description

A common security weakness in AI-generated table components is the direct insertion of dynamic records into the DOM using `innerHTML`.

For example, an unsafe implementation might use:

```typescript
cellElement.innerHTML = String(
  item[column.accessorKey]
);
```

This approach interprets dynamic content as HTML instead of plain text.

If external asset metadata contains malicious markup, the browser could create executable elements or event handlers.

**Security classification:** CWE-79 – Improper Neutralization of Input During Web Page Generation.

**Potential consequences:**
- Cross-Site Scripting (XSS)
- Unauthorized script execution
- Exposure of sensitive application data
- Untrusted modification of the rendered interface

### 3.2 Example Attack Scenario

Assume an external inventory source contains an asset record with a malicious device name:

```typescript
const suspiciousAsset = {
  id: "IT999",
  device:
    '<img src=x onerror="alert(\'XSS-DEMO\')">',
  category: "Laptop",
  department: "IT Security",
  status: "Active"
};
```

If this string is assigned through `innerHTML`, the browser may parse it as an HTML image element and execute the error handler.

This is a controlled illustrative test case, not evidence that an actual attack occurred against this application.

### 3.3 Diagnostic Methodology

The following static inspection can be performed in the HW1 project directory:

```powershell
Get-ChildItem src -Recurse -File |
Select-String -Pattern 'innerHTML|dangerouslySetInnerHTML|insertAdjacentHTML|eval\('
```

Review the returned matches and confirm whether untrusted data reaches unsafe DOM operations.

For dynamic verification:

1. Insert a synthetic asset record containing HTML-like text.
2. Open the application in an isolated local environment.
3. Inspect the corresponding cell in Chrome DevTools.
4. Confirm that the string remains text rather than being parsed as an HTML element.
5. Verify that no unexpected JavaScript executes.

### 3.4 Implemented Engineering Safeguard

The DataGrid uses React JSX interpolation instead of raw HTML insertion.

Code from `src/DataGrid.tsx`:

```tsx
<td
  key={String(column.accessorKey)}
  role="gridcell"
  data-cell={`${rowIndex}-${colIndex}`}
  tabIndex={isFocused ? 0 : -1}
  onFocus={() =>
    setFocusedCell({
      row: rowIndex,
      col: colIndex,
    })
  }
>
  {String(
    item[column.accessorKey] ?? ""
  )}
</td>
```

React renders the string as text instead of interpreting it as HTML markup.

This protects the cell-rendering path against HTML injection when displaying untrusted string values.

### 3.5 Verification Assessment

**Implementation status:** Safeguard present.

The current component does not intentionally use `innerHTML` or `dangerouslySetInnerHTML` for ordinary asset cell rendering.

**Remaining verification:** Execute and document the synthetic payload test if required for the final security demonstration.

**Engineering lesson:** Dynamic database content should be treated as untrusted. Avoid raw HTML insertion unless an explicit and carefully reviewed sanitization process is necessary.

---

## 4. Failure Mode 02: Roving Tabindex and Keyboard Focus Desynchronization

### 4.1 Defect Description

An interactive ARIA Grid must provide predictable keyboard navigation.

A naive implementation may assign `tabIndex={0}` to every table cell:

```tsx
<td tabIndex={0}>
  {value}
</td>
```

This makes every cell a separate Tab stop.

For a DataGrid with five columns and five visible rows, the user may be forced to navigate through 25 cells individually.

Another problem occurs when a component stores the position of the focused cell but does not update that position after filtering or changing pages.

This can cause focus to target a cell that no longer exists.

### 4.2 Root Cause

Keyboard navigation requires synchronization between:

- Current row index
- Current column index
- Visible dataset
- Pagination state
- Filtered results
- DOM focus position

If any of these values become inconsistent, navigation may fail or become unpredictable.

### 4.3 Implemented Focus State

The IT Asset DataGrid maintains a two-dimensional coordinate:

```typescript
interface CellPosition {
  row: number;
  col: number;
}

const [focusedCell, setFocusedCell] =
  useState<CellPosition>({
    row: 0,
    col: 0,
  });
```

This state identifies the active keyboard-navigation cell.

### 4.4 Boundary Enforcement

The component calculates bounded focus coordinates:

```typescript
const safeFocusedCell: CellPosition = {
  row: Math.min(
    focusedCell.row,
    Math.max(visibleData.length - 1, 0)
  ),
  col: Math.min(
    focusedCell.col,
    Math.max(columnCount - 1, 0)
  ),
};
```

Navigation also clamps requested positions to the current visible row and column boundaries.

This reduces the risk of referencing nonexistent cells after the visible dataset changes.

### 4.5 Roving Tabindex Implementation

```tsx
<td
  role="gridcell"
  data-cell={`${rowIndex}-${colIndex}`}
  tabIndex={isFocused ? 0 : -1}
  onFocus={() =>
    setFocusedCell({
      row: rowIndex,
      col: colIndex,
    })
  }
  onKeyDown={(event) =>
    handleCellKeyDown(
      event,
      rowIndex,
      colIndex,
      item
    )
  }
>
  {String(item[column.accessorKey] ?? "")}
</td>
```

The intended behavior is:

- Active data cell: `tabIndex={0}`
- Other data cells: `tabIndex={-1}`
- Arrow keys move focus between data cells.
- Tab moves through the page's normal focus sequence.

The implementation also contains separately focusable sorting buttons and View buttons. These must be included when assessing the complete Grid Pattern's keyboard behavior.

### 4.6 Keyboard Navigation

The implementation processes keyboard events using:

```typescript
switch (event.key) {
  case "ArrowRight":
    event.preventDefault();
    moveFocus(rowIndex, colIndex + 1);
    break;

  case "ArrowLeft":
    event.preventDefault();
    moveFocus(rowIndex, colIndex - 1);
    break;

  case "ArrowDown":
    event.preventDefault();
    moveFocus(rowIndex + 1, colIndex);
    break;

  case "ArrowUp":
    event.preventDefault();
    moveFocus(rowIndex - 1, colIndex);
    break;

  case "Enter":
    event.preventDefault();
    onRowSelect?.(item);
    break;

  case " ":
    event.preventDefault();
    // Toggle row selection.
    break;
}
```

### 4.7 Interaction Test Procedure

| Test | Expected Behavior |
|---|---|
| Arrow Right | Focus next data cell |
| Arrow Left | Focus previous data cell |
| Arrow Down | Focus corresponding cell in next row |
| Arrow Up | Focus corresponding cell in previous row |
| Enter | Open asset details |
| Space | Toggle selected row |
| Search | Reset coordinate to first available cell |
| Pagination | Reset coordinate for the new page |

A complete manual audit should also check whether focus remains usable when changing pages, filtering to zero records, or opening and closing a dialog.

### 4.8 Verification Assessment

**Implementation status:** Keyboard handlers and bounded coordinates implemented.

**Limitation:** Automated Lighthouse results do not verify the complete W3C APG Grid keyboard interaction pattern.

In particular, sorting buttons, View buttons, empty-grid behavior and focus restoration require manual verification.

**Engineering lesson:** Keyboard accessibility depends on DOM focus behavior, not only state variables and ARIA attributes.

---

## 5. Failure Mode 03: Non-Semantic Grid Architecture and Missing ARIA

### 5.1 Defect Description

Generative AI may construct a visually correct table using only generic `div` elements.

Example of an undesirable implementation:

```tsx
<div className="table">
  <div className="row">
    <div className="cell">
      IT001
    </div>
    <div className="cell">
      Dell Latitude 7440
    </div>
  </div>
</div>
```

Although CSS can make this structure look like a table, it does not automatically provide the intrinsic table relationships exposed by native HTML elements.

Potential problems include:

- Missing row and column semantics
- Missing relationships between headers and cells
- Limited assistive technology navigation
- Missing sort-state announcements
- Incomplete accessible interaction behavior

### 5.2 Architectural Decision

The HW1 implementation uses native HTML table elements as the structural foundation.

```tsx
<table
  ref={tableRef}
  role="grid"
  className="asset-table"
  aria-label={ariaLabel}
  aria-describedby={instructionsId}
  aria-multiselectable="false"
  aria-colcount={
    columnCount + (onRowSelect ? 1 : 0)
  }
  aria-rowcount={sortedData.length + 1}
>
  <thead>
    <tr role="row" aria-rowindex={1}>
      {/* Column headers */}
    </tr>
  </thead>

  <tbody>
    {/* Data rows and cells */}
  </tbody>
</table>
```

### 5.3 Semantic Elements

| Element | Purpose |
|---|---|
| `table` | Native tabular structure |
| `thead` | Column header group |
| `tbody` | Data row group |
| `tr` | Table row |
| `th scope="col"` | Column heading |
| `td` | Data cell |
| `button` | Native interactive action |

This avoids replacing the entire table architecture with generic layout containers.

### 5.4 ARIA Implementation

The component includes:

```text
role="grid"
role="row"
role="columnheader"
role="gridcell"

aria-label
aria-describedby
aria-rowcount
aria-colcount
aria-rowindex
aria-selected
aria-sort
aria-live
```

These attributes describe grid structure, selection, sorting, and dynamic state.

ARIA must supplement correct native semantics and behavior; adding roles alone does not guarantee accessibility.

### 5.5 Sort State Communication

Sortable column headers expose the current ordering:

```tsx
<th
  scope="col"
  role="columnheader"
  aria-sort={
    column.sortable
      ? getAriaSort(column.accessorKey)
      : undefined
  }
>
```

Possible values:

- `ascending`
- `descending`
- `none`

The sort button provides the interaction, while `aria-sort` exposes the current state to assistive technology.

### 5.6 Screen Reader Announcements

The DataGrid uses a visually hidden status region:

```tsx
<p
  className="sr-only"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {announcement}
</p>
```

This is used for messages such as:

```text
Page 2 of 3
Row selected
Row deselected
Asset details opened
```

The component also provides a keyboard instruction description through `aria-describedby`.

### 5.7 Verification Assessment

**Observed result:** Lighthouse Accessibility 100/100.

**Structural result:** Native HTML table and ARIA attributes are implemented.

**Remaining verification:** Use NVDA or another screen reader to confirm that actual announcements, row relationships, selection states and sort states are understandable.

**Engineering lesson:** Accessible architecture requires semantic markup, keyboard behavior and meaningful state communication together.

---

## 6. Failure Mode 04: CSP Restriction and Lighthouse Best Practices Regression

### 6.1 Observed Issue

During the final Lighthouse verification, the first audit returned:

| Category | Score |
|---|---|
| Accessibility | 100/100 |
| Best Practices | 96/100 |

The Lighthouse report displayed:

```text
Issues were logged in the Issues panel
in Chrome DevTools.
```

The reported issue category was:

```text
Content security policy
```

### 6.2 Diagnostic Investigation

The application was rebuilt and tested using Vite Production Preview:

```powershell
npm run build
npm run preview
```

Audit URL:

```text
http://localhost:4173/
```

Best Practices remained at 96/100 in the original Chrome profile.

The Chrome DevTools Issues panel showed:

```text
Content Security Policy of your site
blocks the use of 'eval' in JavaScript
```

Additional issue details:

```text
Affected resources: 1 directive
Directive: script-src
Status: Blocked
```

The panel did not identify a clear JavaScript source location.

### 6.3 Root Cause Analysis

A CSP violation indicates that JavaScript attempted a behavior disallowed by the active security policy.

The violation involved string evaluation, commonly associated with `eval()` or equivalent mechanisms.

Possible sources include:

- Application code
- Third-party dependencies
- Browser extensions
- Scripts injected into the browsing environment

The report did not establish which script triggered the violation.

Therefore, attributing the issue directly to application source code would be unsupported.

### 6.4 Environment Isolation Test

To determine whether the browser environment contributed to the problem, the same production application was opened using **Chrome Guest Profile**.

This profile provides a separate browsing environment without the user's usual extension configuration.

The Lighthouse audit was repeated at:

```text
http://localhost:4173/
```

### 6.5 Verified Result

| Environment | Accessibility | Best Practices |
|---|---:|---:|
| Original Chrome Profile | 100 | 96 |
| Chrome Guest Profile | 100 | 100 |

The CSP-related audit penalty was absent in the Guest Profile.

This supports the conclusion that the original browser profile or its configuration contributed to the issue.

However, the exact source script was not isolated, so a particular extension cannot be identified conclusively.

### 6.6 Security Decision

The application should not enable:

```text
'unsafe-eval'
```

solely to improve its Lighthouse score.

Allowing unrestricted JavaScript string evaluation can weaken protections against certain injection attacks.

A strict CSP should be preserved where practical and configured for the actual deployment environment.

During investigation, a restrictive CSP meta tag also caused the application's styling to be blocked. The change was reverted to restore the interface.

Production CSP configuration should therefore be tested against all required resources, including stylesheets, scripts, fonts and API connections.

### 6.7 Engineering Lesson

Lighthouse findings must be investigated using the actual DevTools issue details.

A browser-related audit problem should not automatically be classified as a source-code defect.

Environment isolation is an effective diagnostic strategy before modifying security-sensitive code.

**Final verified scores:**

- Accessibility: **100/100**
- Best Practices: **100/100**

---

## 7. Failure Mode 05: Incorrect Filtering, Sorting and Pagination Order

### 7.1 Defect Description

An incorrectly implemented grid may paginate before filtering or sorting.

Incorrect processing order:

```text
Dataset
   ↓
Pagination
   ↓
Filtering
   ↓
Sorting
```

If sorting is applied only to the current page, the result is not globally sorted.

For example, an asset that should appear on the first page after sorting may remain on another page.

### 7.2 Implemented Processing Pipeline

The HW1 component uses:

```text
Original Dataset
       ↓
Keyword Filtering
       ↓
Column Sorting
       ↓
Pagination
       ↓
Visible Data Rows
```

### 7.3 Filtering

The application uses case-insensitive keyword search.

```typescript
const filteredData = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return data;

  return data.filter((item) =>
    columns.some((column) =>
      String(item[column.accessorKey] ?? "")
        .toLowerCase()
        .includes(query)
    )
  );
}, [data, columns, searchQuery]);
```

Search applies across the configured asset columns.

### 7.4 Sorting

Sorting is performed on the entire filtered dataset.

```typescript
return [...filteredData].sort((a, b) => {
  const result = String(a[key] ?? "")
    .localeCompare(
      String(b[key] ?? ""),
      undefined,
      {
        numeric: true,
        sensitivity: "base"
      }
    );

  return sort.direction === "asc"
    ? result
    : -result;
});
```

The comparator supports textual values and numeric-aware string comparison.

### 7.5 Pagination

The application uses a page size of five records.

```typescript
const PAGE_SIZE = 5;

const totalPages = Math.max(
  1,
  Math.ceil(sortedData.length / PAGE_SIZE)
);

const startIndex = (safePage - 1) * PAGE_SIZE;

const visibleData = sortedData.slice(
  startIndex,
  startIndex + PAGE_SIZE
);
```

For the 12-record dataset:

```text
Page 1: Records 1–5
Page 2: Records 6–10
Page 3: Records 11–12
```

### 7.6 Recommended Verification Tests

| Scenario | Expected Result |
|---|---|
| Search `Dell` | Matching Dell assets |
| Search nonexistent text | Empty-state message |
| Sort by Device Name | Full filtered dataset sorted |
| Change sort direction | Ascending/descending toggle |
| Navigate to final page | Remaining records shown |
| Apply new search from page 3 | Pagination resets to page 1 |

**Implementation status:** Filtering, sorting and pagination pipeline present.

**Verification status:** Tests should be performed and recorded before declaring all scenarios passed.

---

## 8. Git Decomposition and Architectural Defense

### 8.1 Git Development History

The project follows seven implementation stages.

| Stage | Commit Message | Technical Purpose |
|---|---|---|
| 1 | `chore: initialize Vite React TypeScript project and HW1 decomposition` | Initialize project and define tasks |
| 2 | `feat: define generic DataGrid contracts and IT asset dataset` | TypeScript interfaces and sample records |
| 3 | `feat: implement semantic IT asset grid and dashboard` | Native table and initial dashboard |
| 4 | `feat: implement asset filtering sorting and pagination` | Data operations and controls |
| 5 | `feat: implement ARIA grid keyboard navigation and row selection` | Keyboard interaction and ARIA |
| 6 | `feat: add accessible asset details dialog and responsive dashboard` | Native dialog and responsive design |
| 7 | `docs: finalize HW1 accessibility audit with Lighthouse 100 scores` | Final testing documentation |

Stage 7 is the intended final commit message and should only be marked complete after the commit exists.

Actual commit identifiers should be obtained from Git rather than copied from another repository.

Verification command:

```powershell
git log --oneline -8
```

### 8.2 Why Task Decomposition Matters

Task decomposition separates implementation responsibilities into independently reviewable units.

Advantages:

1. Each stage has a clearly defined technical objective.
2. Git history shows incremental development.
3. Problems can be traced to specific changes.
4. Testing is easier because each stage has defined acceptance criteria.
5. Individual decisions can be explained during classroom evaluation.

This is preferable to submitting a single large commit containing the entire application.

---

## 9. Technical Defense Questions and Answers

### Q1. Why did you use generic TypeScript interfaces?

**Answer:**

The DataGrid is designed as a reusable component rather than a table dedicated to IT assets.

`ColumnDef<T>` defines columns using keys belonging to the provided data type.

`DataGridProps<T>` defines the dataset, column configuration, accessible name and optional row action.

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

The `keyof T` constraint allows TypeScript to reject invalid column property names during type checking.

### Q2. Why use native HTML table elements instead of div-based layouts?

**Answer:**

Native table elements provide meaningful row, column and header relationships.

They also support established browser accessibility behavior.

The project extends native table semantics with ARIA Grid roles because the component is interactive, rather than merely displaying static information.

### Q3. What is roving tabindex?

**Answer:**

Roving tabindex is a keyboard focus management technique for composite interactive components.

The currently active data cell has `tabIndex={0}`, while other navigable data cells use `tabIndex={-1}`.

Arrow keys update the active coordinate and programmatically move focus.

This reduces the need to navigate individual data cells using repeated Tab keypresses.

The current implementation requires further manual testing to validate its full interaction with sorting and row-action buttons.

### Q4. How does the DataGrid prevent XSS?

**Answer:**

Dynamic cell content is rendered through React JSX text interpolation.

The project avoids inserting untrusted asset values through raw HTML APIs.

React treats ordinary interpolated strings as text rather than executable HTML.

This mitigates HTML injection within the DataGrid's text-rendering path.

### Q5. Why is the processing order Filtering → Sorting → Pagination?

**Answer:**

Filtering first determines the relevant records.

Sorting then orders the entire filtered result.

Pagination finally selects the records shown on the current page.

This preserves correct global sorting and prevents inconsistent results between pages.

### Q6. How does the application support keyboard interaction?

**Answer:**

The DataGrid handles Arrow keys for two-dimensional cell navigation, Enter to open details, and Space to toggle row selection.

Focus coordinates are bounded to the currently visible dataset.

The selected row is exposed with `aria-selected`, and live-region messages communicate supported state changes.

### Q7. Why use the native dialog element?

**Answer:**

The native `<dialog>` element provides built-in modal behavior when opened with `showModal()`.

It supports Escape dismissal, focus containment and browser-managed focus restoration behavior.

The application additionally provides an accessible title, description and explicit close controls.

### Q8. Why did Lighthouse initially show 96 for Best Practices?

**Answer:**

The original Chrome profile produced a CSP issue reporting blocked JavaScript string evaluation.

The same production application was then tested in Chrome Guest Profile.

The issue was absent and Best Practices reached 100/100.

This indicated that the browser environment influenced the initial audit.

The exact source of the blocked evaluation was not conclusively identified.

### Q9. Does Lighthouse 100 mean the project is fully WCAG 2.2 AA compliant?

**Answer:**

No.

Lighthouse checks selected accessibility requirements automatically.

Full WCAG 2.2 AA conformance also requires manual evaluation, including keyboard behavior, screen-reader interaction, focus order, visual focus indicators, responsive behavior and other applicable success criteria.

The project achieved its two Lighthouse targets, but those scores alone do not certify complete WCAG conformance.

### Q10. Why did you divide HW1 into seven Git commits?

**Answer:**

The decomposition follows the application's technical dependencies.

Project setup is completed before data contracts, followed by rendering, data operations, accessibility, responsive interface work and final verification.

Each commit corresponds to a distinct engineering milestone.

This allows the implementation process to be reviewed and helps identify regressions.

---

## 10. Final Verification Checklist

### 10.1 Automated Verification

- [x] Vite project successfully initialized
- [x] TypeScript production build succeeded during development
- [x] Generic DataGrid contracts implemented
- [x] Lighthouse Accessibility: 100/100
- [x] Lighthouse Best Practices: 100/100
- [x] Final Lighthouse audit performed using Chrome Guest Profile
- [x] Production Preview used for final Lighthouse verification

### 10.2 Implementation Review

- [x] Native HTML table elements
- [x] Sorting functionality implemented
- [x] Filtering functionality implemented
- [x] Pagination functionality implemented
- [x] Arrow-key navigation handlers implemented
- [x] Enter and Space handlers implemented
- [x] ARIA grid roles and attributes implemented
- [x] Accessible native dialog implemented
- [x] Responsive CSS implemented
- [x] Reduced-motion and forced-colors CSS included

### 10.3 Manual Verification

- [ ] Full keyboard-only walkthrough documented
- [ ] NVDA screen reader test documented
- [ ] Focus restoration verified in all dialog-close scenarios
- [ ] Screen-reader sort-state announcements verified
- [ ] Filtering and pagination edge cases documented
- [ ] XSS test payload verified as inert text
- [ ] Color contrast checked independently
- [ ] Full WCAG 2.2 AA checklist completed

These items should be checked only after performing the corresponding tests.

---

## 11. Conclusion & Engineering Declaration

Homework 01 demonstrates an incremental implementation of a reusable React and TypeScript DataGrid using semantic HTML, ARIA attributes, keyboard interaction and accessible UI controls.

The project specifically addresses five engineering concerns:

1. Unsafe dynamic HTML rendering
2. Keyboard focus synchronization
3. Semantic grid structure
4. Browser security policy diagnostics
5. Correct filtering, sorting and pagination order

The final Lighthouse audit confirmed:

**Accessibility: 100/100**

**Best Practices: 100/100**

The initial Best Practices regression was investigated through Chrome DevTools and browser environment isolation.

The implementation follows a seven-stage decomposition strategy, supported by incremental Git commits and an explicit audit process.

**Final status:** Lighthouse performance targets achieved. Full WCAG 2.2 AA conformance remains subject to completion of the documented manual accessibility tests.

---

**End of AI Failure Mode Audit**