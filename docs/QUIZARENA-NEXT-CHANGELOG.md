# QuizArena NEXT — cohesive website visual redesign

This release is based on `QuizArena-Anonymous-PIN-Join-Fix-FULL-WEBSITE.zip`.

## What's redesigned

- Teacher navigation, typography, buttons, fields, cards and focus states
- Overview hero, class statistics, quiz library and all four game-mode cards
- Quiz editor, side panel, forms and sticky save controls
- Live question/answer stage, question timer, progress strip, live leaderboard and host controls
- Waiting lobby, PIN display, player chips, mobile player view and results
- Reports, settings, tables, charts, modal dialogs and anonymous PIN joining
- Shared visual styling on the existing Tug of War arena
- Tablet/mobile breakpoints and reduced-motion accessibility

The redesigned theme retains QuizArena purple/teal as primary colors. No database migration is required for this **visual-only update**. Anonymous guest joins still require Supabase Authentication > Anonymous Sign-ins enabled and previously installed guest policies.

## GitHub installation

1. Back up your deployed QuizArena site.
2. Upload `index.html` to the site root.
3. Upload the new `css/quiz-arena-next.css` stylesheet in the `css` folder.
4. Deploy, then perform a hard refresh to load the new stylesheet.
5. Test Overview, My Quizzes, quiz builder, host lobby, student PIN join, live play, Tug of War, Reports, and Settings on mobile and desktop.

The added `docs/DESIGN-PREVIEW-NEXT.html` is an **offline static design sampler**, not a live Supabase game. It is safe to omit from GitHub. Its sample numbers and question are illustrative.

## Preservation and limits

- Original application JavaScript and Supabase SQL are unchanged.
- The math keyboard and Tug of War game mode remain included.
- Existing host-controlled anonymous guest access is preserved.
- Styling has been tested locally in Chromium with a static gallery at desktop and phone sizes. Actual multi-player/Supabase workflows require a live deployment check.
