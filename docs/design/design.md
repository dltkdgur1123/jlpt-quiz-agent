# JLPT Quiz Hermes-side Design.md

This file is Hermes's internal UI working contract for the JLPT mock exam platform. The website does not need to expose or market a formal design system. Hermes uses this document to keep future homepage, dashboard, exam, login, and result UI work consistent.

## Source learning

Applied from the learning-room video on Figma skills, Design.md, design tokens, Figma variables, foundation docs, and component-by-component generation.

## Product tone

Primary direction:

> Practical mock-exam platform + clean learning dashboard.

Screen-specific roles:

- Home: Figma-style learning SaaS entry page, but focused on mock-exam start.
- Dashboard: learning progress and attempt history.
- Mock exam: focused exam-portal/document experience.
- Result/review: report-card style feedback and next study action.
- Login: simple auth task page, no marketing clutter.

## Forbidden style drift

Avoid:

- generic AI SaaS gloss
- excessive gradients/glassmorphism
- heavy soft shadows
- random new card styles per page
- official JLPT affiliation look
- pass/fail certainty or official score prediction wording
- adding dashboard stat-card patterns into Home unless the reference screen actually has them

## Token ladder

Use a three-layer mental model.

### 1. Primitive tokens

Raw values only:

- colors: ink, muted, primary, neutral, feedback
- spacing: 4, 8, 12, 16, 20, 24, 32, 48, 64
- radius: 10, 12, 14, 18, 20, 22, 28, pill
- typography: Pretendard via `--font-sans`; body, nav, page title, exam prompt, helper, caption
- shadows: mostly none; subtle only when needed

### 2. Semantic tokens

Meaningful usage aliases:

- page background
- surface
- surface muted
- text primary
- text muted
- border default
- border strong
- brand primary
- brand soft
- success/danger/warning

### 3. Component tokens

Component-specific aliases:

- header height
- shell max width
- button height/radius
- card radius/padding
- exam paper width
- exam side nav width
- choice min height/radius

## Component inventory

Start with this small set. Do not generate a huge component library at once.

1. Site header
2. Primary/secondary button
3. Home hero
4. Level card
5. Continue/score panel
6. Dashboard stat card
7. Mock exam start card
8. Question card
9. Choice button
10. Question navigator
11. Result card
12. Login/auth controls

## Component-by-component rule

When adding or polishing UI:

1. Pick one screen and one component group.
2. Check the current CSS variables and class names.
3. Add/reuse semantic/component tokens first.
4. Implement the smallest visual change.
5. Verify desktop and mobile layout.
6. Only then continue to the next component.

Do not ask AI to generate the full design system in one request.

## Figma/reference rule

When Figma screenshots or API data are available:

1. Identify the screen role first: Home, Dashboard, Mock Exam, Result, Login.
2. Follow that screen's information architecture exactly.
3. Extract spacing, radius, fills, strokes, typography, and component roles.
4. Map those values to tokens.
5. Implement from tokens/components, not from one-off raw values.

## Current CSS mapping

The current implementation uses `src/app/globals.css` as the source of styling truth. Use CSS custom properties there as the lightweight variable system.

Important existing class families:

- `home-*`: Home screen
- `figma-*`: Dashboard/Figma-aligned shared shell
- `mock-exam-*`: Exam-taking flow
- `choice-*`: Answer controls
- `auth-*`: Login/auth state

## Verification checklist

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser visual check:
  - Home desktop and mobile
  - Dashboard desktop
  - Mock exam start and in-progress state
  - Result/review state
  - Login signed-out/signed-in states when available

## Portfolio note

This is useful portfolio evidence as:

> Applied a lecture-derived Design.md/token-variable workflow to an AI-agent-built JLPT mock-exam platform, converting visual work from ad-hoc styling into Hermes-side token/component rules.
