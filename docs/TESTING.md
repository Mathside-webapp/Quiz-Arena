# Current Supabase-only revision — testing notes

- JavaScript syntax checks: PASS.
- `node tests/storage.cjs` (teacher image upload path, JPEG destination, URL replacement): PASS.
- Local headless browser screenshot attempt: timed out in the current container; not recorded as a pass.
- Previous SQL/PGlite, Browser mock tests, and paper-marker synthetic tests were performed on the original Supabase-only version, NOT on live Supabase.
- Live Supabase database, Authentication, Storage policies, real multiplayer, and camera hardware: NOT verified because no dashboard access is available.

# Verification and classroom acceptance

## Completed in this build

- JavaScript syntax checks for application modules.
- Local PGlite PostgreSQL-compatible execution of the full schema (excluding the extension declaration in the test environment).
- Permission checks: teacher-only quiz access and hosting, participant membership, unrelated users denied, private keys inaccessible, host-only control and card submissions.
- RPC behavior: PIN join/rejoin, one submission per student/question, correct and wrong scoring, timer state pause/resume, reveal, repeat reset, skip, finish, reports, team allocation and corrected paper answers.
- Chromium browser tests with a test-only API adapter: desktop/mobile views, search, editor/autosave, preview, game controls, student answers, results and downloadable PDFs. This adapter is only in `tests/browser.cjs`; the production site always uses Supabase.
- Every one of 100 custom marker codes detected in each of four rotations on canvas images (400 synthetic tests), including expected orientation-to-answer mapping.
- Desktop and mobile screenshots inspected; dashboard overflow checks at 320, 768 and 1440 px.
- Report Excel export and scanner/manual review layout checked.

## Required before regular classroom use

1. Configure the real Supabase project and confirm teacher signup, email confirmation, reset and login.
2. Use separate physical devices to test lobby joining, realtime transitions, simultaneous answers, reconnect and reports. Confirm a student cannot read another teacher's quiz or control a game.
3. Print cards using the actual printer and paper; verify all orientations and several simultaneous cards.
4. Test on Android Chrome and iPhone Safari in portrait and landscape.
5. Test classroom distances, lighting, small/large printing, glare, partial occlusion and camera angles. Confirm uncertain readings do not silently record responses.
6. Compare a manually recorded answer sheet with scan results. Check corrections, repeated questions and deadline behavior.
7. Load-test your intended class size and inspect Supabase usage. The app caps a digital game at 200 players, but this cap is not a tested concurrency guarantee.

No real printed-card camera test, physical mobile browser test, production Supabase test or concurrency/load test was performed here. Synthetic recognition is not proof of classroom reliability. The scanner is labeled for classroom trials accordingly.

## Reproduce developer tests

With Node 20+ installed, from the QuizArena folder:

```sh
npm install --no-save @electric-sql/pglite@0.5.10 playwright@1.51.1
npx playwright install chromium
node tests/database.cjs
node tests/browser.cjs
```

The browser script runs its own local HTTP server on port 8777 and captures temporary screenshots one folder above the app. It never contacts a real Supabase project. Test packages are not needed to deploy the website.
