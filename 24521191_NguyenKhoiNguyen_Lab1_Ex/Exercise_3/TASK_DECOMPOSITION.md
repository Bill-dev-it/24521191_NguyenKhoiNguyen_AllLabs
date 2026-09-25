# Exercise 3: Resilient Component Architecture

## Component Contract

The component displays aviation parts availability records. Exactly one of the following four states is active at a time:

| State | Entry condition | User-facing behavior | Accessibility contract |
|---|---|---|---|
| Loading | Initial request starts, or Retry is activated | Show CSS skeleton placeholders; do not show stale result content as current | Container has `aria-busy="true"`; announce a concise loading status; decorative skeletons are hidden from assistive technology |
| Live data | Request succeeds with one or more valid records | Render metadata badges with Flexbox and records in a responsive CSS Grid list | Container has `aria-busy="false"`; expose a named results region and meaningful record headings |
| Empty | Request succeeds with zero valid records | Show a clear no-results message, not a blank list | Announce the empty result as a status; no retry control is required unless the product later supports changing filters |
| Error | Request fails or response cannot be used | Explain that data could not be loaded and provide Retry | Announce the error; Retry is a native button reachable and operable by keyboard |

## State Transitions

- Initial render -> Loading.
- Loading -> Live data when the request succeeds with at least one valid record.
- Loading -> Empty when the request succeeds with no valid records.
- Loading -> Error when the request fails or its payload is invalid.
- Error -> Loading when the user activates Retry.
- A newer request supersedes an older request so stale responses cannot replace the current state.

The implementation must keep the four states mutually exclusive. Do not request implementation of all four states in one AI prompt; implement and review one state at a time, following this decomposition.

## Task Decomposition

### T-03A: Loading Skeleton

- Build only the Loading presentation with a pure CSS shimmer skeleton.
- Use semantic markup and accessible loading status; keep decorative skeleton blocks hidden from assistive technology.
- No JavaScript data request, live data, empty state, or error/retry UI in this task.
- Commit: `feat(css): skeleton`.

### T-03B: Live Data State

- Add the successful non-empty state.
- Lay out metadata badges with Flexbox and the record list with CSS Grid.
- Keep state selection separate from presentation and reject invalid records.
- Commit this state independently before starting T-03C.

### T-03C: Empty and Error States

- Add the successful empty state and the request/parse error state.
- Implement accessible Retry, transitioning back to Loading.
- Ensure stale requests cannot overwrite a newer retry.
- Commit these states independently as the final state task.

## Data Source Decision

No API endpoint or authoritative data source was supplied with the Exercise 3 requirements. T-03A must therefore remain a presentation-only Loading skeleton. Before T-03B, select and document an approved endpoint or fixture strategy; do not claim mock/static records are live data.

## Acceptance Checklist

- The component has exactly four mutually exclusive states: Loading, Live data, Empty, and Error.
- T-03A uses a pure CSS shimmer; honor `prefers-reduced-motion` by disabling the shimmer animation.
- Live data uses Flexbox for metadata badges and CSS Grid for the record list.
- Empty and Error are distinct; Error provides a keyboard-operable Retry control.
- Loading and result/error announcements use appropriate accessible status semantics.
- Each state is reviewed and committed separately; never combine CSS and JS in one commit.
