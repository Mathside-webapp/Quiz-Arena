# Install QuizArena

This is a Supabase-only live website. Configure your own Supabase project before using teacher or student features. No offline demonstration is included.

## 1. Create a separate Supabase project

Use a new project for QuizArena. Do not run the SQL in Mathside, EduCore, ClassCheck or Teacher Desk. Copy the project's HTTPS URL and **publishable key or legacy anon key** from its project settings. Never put a secret/service-role key in this website.

Open the Supabase SQL editor. Paste all of `supabase/setup.sql` and run it once. The script creates the quiz and roster tables, safe game-state table, player records, private answer snapshots/submissions, Row Level Security policies and checked RPC functions. It adds the game table to the existing Supabase Realtime publication. It is an initial schema, not a repeatable migration; do not run it twice over existing data.

Immediately after `supabase/setup.sql`, run `supabase/storage.sql` **once** in the same project's SQL Editor. This creates a public-read image bucket (`qa-question-images`) but restricts image uploads and deletions to authenticated teachers, each under their own user-ID folder. **Do not upload pupil identity records or private documents to this bucket.**

New question pictures are converted to JPEG and saved in Supabase Storage rather than as Base64 in your database. Existing inline Base64 images (if you imported old quizzes) are moved to Storage the next time those quizzes are successfully saved online. The app saves only the image URL in the quiz record. Each quiz supports up to 100 questions. Supabase Free Storage and database have separate limits, so keep monitoring usage.

## 2. Configure authentication

In Supabase Authentication settings:

1. Enable email/password authentication for teachers.
2. Enable **anonymous sign-ins** for game participants. Students do not need to register, remember a password or enter an email. The app creates an authenticated anonymous session in their browser.
3. Set the Site URL to your deployed website URL, including the repository path if using GitHub Pages.
4. Add that same URL to the allowed redirect URLs. For local testing also allow `http://localhost:8000`.
5. Use email confirmation according to your school setup. With confirmation enabled, teachers confirm the email before signing in. Configure email delivery if the default Supabase email limits are insufficient.

Anonymous sign-in creates Auth records, so monitor usage and clean up old guest accounts according to your school's retention policy. The supplied schema preserves historical players and their results when guest Auth records are deleted; older projects created with the previous schema may still have cascading deletes. Always back up and test retention changes before cleaning up users. PIN join attempts are throttled per authenticated identity; Supabase Auth rate limits also apply. This package does not include a CAPTCHA widget; if CAPTCHA is enabled in your project, integrate the provider's token into sign-in calls before using it. Public open registration is meant for a dedicated school deployment; restrict distribution/registration if only selected teachers should use the project.

## 3. Connect the website

Edit `js/config.js`:

```js
window.QUIZARENA_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-PUBLIC-PUBLISHABLE-OR-ANON-KEY'
};
```

Do not paste the example placeholders literally. The public key is safe to publish only with the included RLS policies and restricted RPC permissions in place. Do not disable those protections to resolve an error.

## 4. Publish with GitHub Pages

1. Create a repository for QuizArena.
2. Upload the **contents** of the `QuizArena` folder so `index.html` sits at the repository root. Include `assets`, `vendor`, `css` and `js`.
3. In repository Settings → Pages, choose deployment from your branch and the root folder (or use your usual Pages workflow).
4. Open the HTTPS Pages URL after deployment and finish the Supabase URL/redirect settings above.
5. Register a teacher, confirm the email when requested, then create a small quiz.
6. Host a Solo Battle; join from a separate browser/private window or another device as a student. Use two different browser sessions for teacher and student identities during testing.

You may omit `tests`, `design-references` and `docs` from the public repository if desired. Keep them in your working copy. No Node build is required; the browser dependencies and font files are included locally.

## 5. Add to Teacher Desk

Add a link or card inside Teacher Desk that opens your QuizArena URL:

```html
<a href="https://YOUR-USERNAME.github.io/YOUR-QUIZARENA-REPO/"
   target="_blank" rel="noopener">Open QuizArena</a>
```

Replace the example URL with your actual Pages URL. Do not add automatic redirects or reuse the Mathside Supabase config. QuizArena remains independent; opening Teacher Desk does not automatically open QuizArena.

## 6. Camera and projector

Paper Scan requires HTTPS and camera permission. On the teacher's phone, sign in with the same teacher account, open the existing game from Live Arena, then open Camera scanner. Keep the desktop/projector signed in to that teacher account and open Projector view. Supabase Realtime delivers host-state changes; a lightweight polling fallback refreshes response counts and reconnects when necessary.

The host must reveal the answer to show correctness on the projector. Before reveal, only response counts and scores from completed questions are visible there. If a question times out, scoring closes at the server deadline even if a student's screen is delayed. The host can still reveal, skip, repeat or end.

If camera permission is denied, enable it in browser settings or enter responses manually. Cameras work on localhost for local development, but a phone opening a computer's plain HTTP LAN address will usually be blocked: use your HTTPS deployed site instead.

## Troubleshooting

- **Awaiting setup:** fill in `js/config.js`, redeploy and refresh.
- **Anonymous sign-in disabled:** enable it in Supabase Auth.
- **Table/function missing:** run the complete setup SQL in the same project used in config.
- **Teacher sees no quizzes:** confirm the teacher account/project; RLS intentionally isolates teachers.
- **Student cannot join:** check PIN, lobby status, anonymous auth and join rate limit. Paper Scan students use cards instead of PIN joining.
- **No live updates:** check Internet and the Realtime publication; polling is a fallback, not offline mode.
- **Offline answer:** reconnect and retry before the deadline. Saved answers are restored on refresh. A new/private browser creates a different guest identity.
- **Password reset:** verify the deployed URL is allowlisted in Supabase Auth redirect settings.
- **Scan uncertain/missing:** improve lighting, reduce glare, move closer, hold the selected letter upright, and keep all corners visible. Never score an uncertain match automatically.

## Documentation sources

- Supabase anonymous sign-ins: https://supabase.com/docs/guides/auth/auth-anonymous
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase functions: https://supabase.com/docs/guides/database/functions
- js-aruco2: https://github.com/damianofalcioni/js-aruco2
