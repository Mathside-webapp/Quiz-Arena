# QuizArena

A standalone HTML, CSS and JavaScript classroom quiz website built from your QuizArena prompt and design references. Open **START-HERE.html** for Supabase installation instructions. The website requires a connected Supabase project for login and games. No build process is needed.

## Included

- Light theme with local Nunito fonts, purple/teal/coral/yellow palette, responsive cards, waves, original trophy/book illustration, timer rings and colored answer tiles.
- Welcome/join screen; teacher registration, email sign-in, password reset; five-part teacher navigation.
- Quiz library with search, subject filtering, categories/grades, editing, duplicate, archive, restore and delete.
- Multiple choice, true/false, identification, question pictures and LaTeX math; time limits and points; reorder/remove questions; local draft recovery and automatic online saving once a title is entered.
- Excel question import/template and interactive quiz preview.
- Solo Battle, Team Showdown and Paper Scan Arena; PIN lobby, pause/resume, repeat, skip, reveal, end, projector view, scores and rankings.
- Guest students join without typing an email or password. A private anonymous Supabase session keeps their identity across refresh/reconnect in the same browser.
- Original 100-card marker dictionary, compact/large A4/Letter PDF export, Excel roster import, exact multi-marker recognition, orientation detection, stable-frame checks and manual corrections.
- Per-student results, team scores, correct/incorrect responses, percentages, per-question analysis, Excel exports and saved game history.
- Optional sound, confetti and response charts; reduced-motion support.
- Supabase schema, Row Level Security and server-side RPCs. No Edge Function deployment is needed for this architecture.

## Important status

This is a configurable SUPABASE-ONLY website package, not a deployed service. `js/config.js` intentionally contains no project credentials. A separate Supabase project and setup are required before authentication or games work. This edition contains the live Supabase application only. All quizzes, accounts and games use your connected Supabase project.

The original Supabase-only engine was previously tested using local PGlite and a Chromium test-only adapter. For this revision, JavaScript syntax and the new image-upload adapter were checked locally; the live cloud services and full browser flows have not been retested. Desktop/mobile screenshots were inspected. All 100 cards passed four synthetic rotation tests (400 checks), and PDF export was exercised. **Real Supabase multi-device sessions and printed-card camera recognition on Android Chrome/iPhone Safari remain unverified. Paper Scan is a classroom-trial feature, not production-certified scanning.** See `docs/TESTING.md`.

The design is a responsive reconstruction of raster mockups, not a pixel-perfect export from an editable design file. Fonts use locally bundled Nunito; the trophy/books are original SVG artwork. Laptop/phone mockup frames are presentation devices, not part of the website. The exact five-item navigation in the prompt takes precedence over the alternate sidebar labels shown in one desktop image. Class management is in Settings. All source reference images are in `design-references/`.

Optional PWA installation was not added. Reliable connectivity is required for live answers; reconnection restores saved state, but offline answers are not silently queued or credited after a deadline.

## Files

- `index.html`, `css/app.css`, `js/`: website; no bundler required.
- `assets/`, `vendor/`: local visuals, fonts, browser libraries and licenses.
- `supabase/setup.sql`: run once in a new Supabase project's SQL editor.
- `supabase/storage.sql`: run next to create the quiz-image bucket and upload protections.
- `START-HERE.html`, `docs/`: installation, usage, design coverage and testing.
- `tests/`: separate developer tests; not imported by the website.

To preview locally, run `python -m http.server 8000` in this folder, then visit `http://localhost:8000`. Opening `index.html` directly as a `file://` URL will not load JavaScript modules correctly.
