# JLPT Quiz Redesign v1 Plan

## Goal

Redesign the JLPT Quiz mock-exam platform from the ground up visually while preserving all current product functionality.

The redesign must support this primary user journey:

1. Visitor signs up or logs in.
2. User selects their JLPT level.
3. User starts a mock exam.
4. User completes the exam on mobile or desktop.
5. User reviews result and learning history.

## Preserve current functionality

- Home: mock exam start, level cards, learning-history link, Shorts bridge
- Login: Google, Kakao, Naver, Email login
- Header: Home, Mock Exam, Learning History, signed-in profile menu
- Mock Exam: start screen, 50-question flow, progress, question navigator, submit warning, result
- Dashboard: learning history and attempt data
- Result/Review: section result, wrong/blank review, feedback loop
- Settings: account/settings entry point

## Design direction

### Core feeling

Clean, premium, calm, and immediately usable.

The product should feel like:

> Apple-like minimal learning product + modern paper exam experience.

### Visual keywords

- simple
- premium
- calm
- trustworthy
- focused
- spacious
- modern exam paper
- mobile-ready

### Avoid

- AI-generated generic card-heavy SaaS look
- visual clutter
- heavy gradients or glassmorphism
- hard public-institution/government look
- childish education-app styling
- official JLPT affiliation or official scoring implication

## Information architecture

### 1. Home / Start

Primary job: guide the user to sign up or log in, choose a level, and start a mock exam.

Priority order:

1. Account/login state
2. Level selection
3. Start mock exam CTA
4. Recent/continue learning
5. Shorts/content bridge as a light secondary element only if it does not create card-section clutter

Design notes:

- Do **not** use a card-section-heavy homepage.
- Avoid multiple boxed sections stacked like generic SaaS cards.
- Home should feel like one calm premium entry surface, not a dashboard grid.
- Use the good parts of the Result concept: spacious report-like composition, restrained typography, white premium surface, subtle dividers, and calm hierarchy.
- Level selection can be a refined segmented control, horizontal selector, or integrated exam-start panel rather than many separate cards.
- Hero should not feel like a marketing landing page first.
- It should feel like an exam preparation cockpit.
- Login/sign-up can be visible but not aggressive.
- Level selection should be obvious and calm.

### 2. Login / Account

Primary job: authenticate quickly.

Design notes:

- Centered, minimal, auth-only.
- Apple-like spacing and quiet surface.
- No marketing explanation block.
- Providers should have equal weight and consistent dimensions.
- Signed-in state should show profile identity and account actions.

### 3. Mock Exam

Primary job: let users answer comfortably on desktop and mobile.

Design notes:

- Modern paper-exam aesthetic.
- Not a full old-school paper scan.
- Use clear white paper surface, black/neutral text, subtle section dividers.
- Right-side navigator on desktop, compact bottom/top navigator on mobile.
- Progress and time should be visible but quiet.
- Question choices should be large and touch-friendly.

### 4. Result / Dashboard

Primary job: show performance and next action.

Design notes:

- Report-card feel, not generic analytics dashboard.
- Section result first.
- Wrong/blank review and next study action second.
- Keep perceived score wording safe; no official pass/fail prediction.

## Token direction

### Color

- Page background: warm off-white or very light cool gray
- Paper surface: pure white
- Primary text: near-black
- Muted text: neutral gray
- Accent: restrained blue or graphite/indigo
- Success/warning/danger: low-saturation, readable

### Typography

- Font family: Pretendard only, via `--font-sans`
- Korean/Japanese readability first
- Large calm headings
- Strong but not decorative navigation
- Exam text should be high contrast and comfortable
- Do not mix serif, Geist, Inter, Arial, or page-specific typefaces unless explicitly approved

### Shape

- Softer Apple-like radii for app surfaces
- Exam paper itself can be slightly sharper and flatter
- Avoid overly bubbly education-app cards

### Shadow

- Minimal shadows
- Prefer borders, whitespace, and hierarchy
- Elevated surfaces only where needed

## Component inventory

1. Shared site header
2. Profile trigger/dropdown
3. Level selector card
4. Primary start CTA
5. Exam paper container
6. Problem section header
7. Choice row
8. Progress/time strip
9. Question navigator
10. Submit confirmation
11. Result summary card
12. Weakness/review list
13. Mobile exam controls

## First concept image set

Generate 4 initial concept screens:

1. Home / Level selection start screen
2. Login / Account screen
3. Mock Exam desktop screen
4. Result / Learning dashboard screen

Mobile-specific screens should be explored in v2 after the visual direction is selected.

## Implementation principle

Do not rebuild product logic. Replace visual system and component styling while preserving routes, auth flow, exam behavior, attempt saving, results, dashboard, and tests.
