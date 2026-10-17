# QuizArena — Supabase-only setup

**Status:** Code is prepared and tested locally. Your Supabase project is NOT connected or deployed from this chat. Keep QuizArena in a DIFFERENT project from Mathside.

## 1. Database (new, dedicated project only)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and open the project intended for QuizArena.
2. SQL Editor → New query → paste `supabase/setup.sql` and run **once**. This creates quizzes, rosters, games, players, secure scoring and report functions with RLS. **Do not run it in a project containing an existing installation of these tables.**
3. SQL Editor → New query → paste `supabase/storage.sql` and run **once**. This creates the `qa-question-images` public-read bucket with teacher-only upload/delete policies. The bucket is public for quiz pictures, not private pupil documents.
4. Supabase Authentication → Providers: enable Email for teachers and Anonymous Sign-Ins for student guests. Set Site URL and redirect allowlist to your HTTPS deployment address (for local testing add `http://localhost:8000`). Consider Turnstile protection against anonymous-sign-in abuse.

## 2. Connect the website

1. Dashboard → Connect / API Keys: copy the **Project URL** and **publishable** key (`sb_publishable_...`) for this QuizArena project.
2. Edit `js/config.js` in your local copy:

```js
window.QUIZARENA_CONFIG = {
  supabaseUrl: 'https://YOUR-QUIZARENA-PROJECT.supabase.co',
  supabaseAnonKey: 'sb_publishable_YOUR_PUBLIC_KEY'
};
```

3. NEVER paste `sb_secret_...`, `service_role`, a password, or a database connection string into JavaScript, a website ZIP, a public repository, or a chat message.
4. Publish the **contents** of the QuizArena directory to HTTPS hosting, with `index.html` at the website root (e.g. GitHub Pages). No build tool required.

## 3. Verify before using students' real data

1. Register/sign in as a teacher; create a multiple-choice quiz with a JPEG or PNG picture, and confirm it appears in the library after reload.
2. In Supabase Storage, verify the picture is in `qa-question-images/<teacher-user-id>/...jpg` (instead of Base64 inside `qa_quizzes.questions`).
3. From a different browser/device, join Solo Battle using the game PIN. Test scoring, reveal, pause/resume, scoreboard, and completed report.
4. Test Team Showdown and Paper Scan with a small class; validate physical printed cards and phone camera manually before production.
5. Sign in as a DIFFERENT teacher and confirm quizzes/rosters owned by the first teacher cannot be read or edited.
6. Test a fresh private student browser session; monitor Auth anonymous-sign-in limits and Realtime/database request usage.
7. Before any deletion or schema migration, back up quiz and report data. Deleting games or teacher accounts could delete related results.

## 4. Storage and usage notes

- PostgreSQL stores quizzes, students, live games, answers, reports and the URL of each quiz image.
- Supabase Storage stores quiz image files (bucket is public-read; filenames are random). Do not upload confidential student data.
- QuizArena deliberately **does not** use Turso, MongoDB or an Edge Function. No private API keys are needed on the website.
- Anonymous student sign-ins consume Auth rows, and live games still generate database and Realtime usage. Monitor the Supabase dashboard.
- Question picture replacements may leave unused objects in Storage; periodically review and remove unused files after verifying they are not referenced.

## Troubleshooting

- **Awaiting setup:** `js/config.js` needs a valid project URL and public key; redeploy and refresh.
- **Schema/rpc missing:** run the two SQL files against the SAME QuizArena Supabase project.
- **Images fail to upload:** check `supabase/storage.sql` ran, teacher is signed in (not anonymously), compressed JPEG under 500 KB, and Storage quota.
- **Students cannot join:** enable Anonymous Sign-Ins, ensure the PIN is active and the game is still in Lobby; Auth rate limits may apply.
- **Realtime issues:** verify the realtime publication and connectivity; refresh to recover if websocket updates fail.
- **Teacher account email confirmation problems:** inspect Authentication settings, SMTP/email limits, redirect URLs, and email inbox.

This package was checked locally. Deployment and real multi-device testing require access to your Supabase project and hosting service.
