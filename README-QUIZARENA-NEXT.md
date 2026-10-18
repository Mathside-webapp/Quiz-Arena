# QuizArena NEXT — Website-wide visual redesign

## Updated files
- `index.html` — links the new visual theme after the original stylesheets.
- `css/quiz-arena-next.css` — global styling for teacher and player screens.

## New, optional files
- `docs/DESIGN-PREVIEW-NEXT.html` — static sample with Dashboard, Live Arena, Builder, and Join PIN views. It is not a Supabase game.
- `docs/QUIZARENA-NEXT-CHANGELOG.md` — detailed coverage and deployment notes.

## Install to GitHub Pages
1. Back up the current QuizArena repo.
2. Upload `index.html` to the repo root.
3. Upload the new file `css/quiz-arena-next.css` to the `css` directory.
4. (Optional) Upload the `docs` preview and changelog.
5. After GitHub Pages redeploys, hard refresh your browser.
6. Verify the guest PIN join, teacher's quiz creation, live sessions, Tug of War, reports, and mobile displays on your deployed site.

This is a presentation-only update; your JavaScript and Supabase code are unchanged. No extra SQL is required. Anonymous sign-ins must still be enabled in Supabase Authentication for guests.

## Testing
- Parsed stylesheet: no CSS syntax errors.
- Existing JS files unchanged: audited against source ZIP.
- Existing ZIP entries and paths preserved.
- Static browser preview could not run in this execution environment because Chromium denied both file:// and localhost loads (ERR_BLOCKED_BY_ADMINISTRATOR).
- Live multiplayer, scoring, and Supabase have not been tested.
