# Exercise Prompt and Response Record

This document records the prompts and guidance exchanged while completing Lab 1 Exercises 1-3. User prompts are quoted from the conversation where available. Assistant responses are condensed for readability and are not a verbatim export of the full chat history.

## Exercise 1: Semantic Landmark Tree

### Prompt 1

> **STEP 2: Define landmark hierarchy contract (0 `<div>` elements).** ok theo yêu cầu trên thì file index trong ex1 đã làm đúng yêu cầu không nếu không thì sửa lại.

### Response

Reviewed `Exercise_1/index.html` against `TASK_DECOMPOSITION.md`. Confirmed it uses `header`, `nav`, `main`, and `section`, has no `<div>`, and the skip link target `#main-content` matches the main element ID. No code change was needed. Noted that Chrome DevTools landmark verification still needed to be performed by the student.

### Prompt 2

> chỉ tôi commit thay đổi file index html trong ex1 lên repo yêu cầu là; ** git commit -m 'feat(html): semantic landmark tree'

### Response

Provided commands to stage only `24521191_NguyenKhoiNguyen_Lab1_Ex/Exercise_1/index.html`, inspect staged paths, commit with `feat(html): semantic landmark tree`, and push `origin main` if desired.

### Prompt 3

> Nó có step 3 không? ** STEP 3: Implement accessible skip-link (`<a href="#main">Skip to Content</a>`).**

### Response

Explained that the existing page already has a working skip link to `#main-content`, as specified by the task decomposition. It does not literally use `#main`; changing to that target would require changing the corresponding main ID too.

## Exercise 2: Component Architecture and State Modeling

### Prompt 1

> Đây là requirement cho exercise 2 tôi cần bạn hướng dẫn tôi làm trước task token and request rồi commit chưa làm các task kia. Lưu ý phải follow: **Strict Acceptance Criteria Matrix**

### Response

Reviewed Exercise 2 and found its stylesheet empty and the HTML stylesheet path needed correction. Suggested beginning with CSS custom-property tokens and a small reset, using variables rather than hard-coded colors. Kept the work limited to Tokens & Reset and gave separate staging/commit guidance. The user later reported pushing this work.

### Prompt 2

> Tiếp theo là làm subtast 201-B rồi commit: **SUB-TASK T-02B: 2D Grid Layout -> git commit -m 'feat(css): responsive grid'**

### Response

Added a responsive two-column CSS Grid for the existing sections and a one-column mobile layout, using existing tokens. Validated CSS diagnostics and provided the requested separate commit message. No Git command was run by the assistant.

### Prompt 3

> ok đã kiểm tra xong Task 2_b tới task 2_C: **SUB-TASK T-02C: Theme Engine -> git commit -m 'feat(js): dark mode engine'**

### Response

Added an accessible theme toggle, dark/light token palettes, and JavaScript persistence with `localStorage` key `theme`; the toggle updates `aria-pressed`, its label, and icon. Later portfolio work added a native contact form with client-side validation feedback. The form explicitly reports that data has not been sent. Diagnostics and browser checks covered theme persistence and form validation.

### Prompt 4

> ok tiếp phần exercise có cần làm phần này chưa và làm như thế nào

### Response

Explained that the remaining Exercise 2 brief called for a portfolio with a hero portrait, skills matrix, project cards, and contact form. Recommended implementing semantic HTML first, then responsive CSS, then interaction and accessibility checks.

### Prompt 5

> ok bạn thay đổi nội dung theo yêu cầu của phần còn lại này. sau đó cho tôi check lại rồi mới để tôi commit

### Response

Replaced the placeholder Aviation B2B page with portfolio content: hero, skills grouped by category, three project cards, and a validated contact form. Added responsive styling, dark/light palettes, and client-side form status. Browser validation checked mobile width, theme keyboard interaction and persistence, form native validation, and selected color contrast pairs. The portrait is a clearly labeled Unsplash placeholder and should be replaced with the student's own portrait if required. The assistant did not commit or push these later portfolio changes.

## Exercise 3: Resilient Component Architecture

### Prompt 1

> ok đây là requirement cho ex3, cùng tôi làm từng task

### Response

Inspected Exercise 3, which was empty, and began with T-03A only. Created a four-state contract in `TASK_DECOMPOSITION.md` and added an accessible CSS shimmer loading skeleton. Checked responsive behavior, `aria-busy`, status announcement, decorative skeleton hiding, and reduced-motion behavior. The user later reported pushing T-03A.

### Prompt 2

> vậy cách lấy api đúng theo đề bài thì lấy ở đâu?

### Response

Searched the workspace and found no authoritative endpoint, API documentation, backend route, or configuration. Recommended checking the full assignment/LMS or asking the instructor, and warned against using an unrelated public API or claiming mock data is live.

### Prompt 3

> Thôi vậ dùng demo data đi vì đây là homework nên cho phép

### Response

Implemented T-03B using an explicitly labeled local demonstration fixture. Added four sample parts, validation before rendering, Flexbox metadata badges, and a responsive CSS Grid list. Tested Loading-to-Live Data transition, mobile overflow, and mutually exclusive display after correcting the hidden skeleton rule. The user later reported pushing T-03B.

### Prompt 4

> Ok tôi đã push rồi làm tiếp cái gì

### Response

Proceeded to T-03C: separate Empty and Error states, accessible Retry button, and request sequencing to prevent stale results from overwriting newer state. Added `?demo=empty` and `?demo=error` scenarios for report screenshots. Tested Empty, Error, Retry returning through Loading, mobile layout, and diagnostics. No T-03C commit or push was confirmed in the conversation.

### Prompt 5

> Hình như tôi không thấy retry như bạn nói:

### Response

Explained that the screenshot showed the Empty state, where Retry is intentionally not displayed. Retry appears only in Error, shown by opening the page with `?demo=error`.

## Status Notes

- Exercise 1 semantic structure and skip link were reviewed; Git commands and commit status were not independently verified by the assistant.
- Exercise 2 Tokens & Reset was pushed according to the user's report. The responsive grid/theme engine and later portfolio work were implemented, but the conversation does not confirm that every later Exercise 2 change was committed and pushed.
- Exercise 3 T-03A and T-03B were reported pushed by the user. T-03C was implemented and browser-checked, but no commit or push was confirmed.
- No Git command was run by the assistant.
