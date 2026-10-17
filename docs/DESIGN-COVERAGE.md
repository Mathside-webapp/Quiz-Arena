# Design and prompt coverage

Source references are included in `design-references/`. Raster mockups were used as visual guides; there is no editable font/style specification from which to extract exact measurements. Nunito was selected for its rounded educational appearance, with local 400/700/900 weights. Styles centralize the palette and responsive rules in `css/app.css`.

| Reference / requirement | Implementation |
| --- | --- |
| Purple brand, teal/coral/yellow accents, cloud background | CSS variables, gradients and original wave backdrop |
| Friendly trophy, books, leaves and stars | Original SVG illustration, reused on welcome, dashboard, lobby, leaderboard and results |
| Typography, rounded cards, soft shadows and spacing | Shared button/field/card system; desktop headings 36 px, mobile 28 px; consistent 12–24 px gaps |
| Welcome / PIN join / teacher sign-in | `#welcome`, guest nickname/PIN form and email/password dialog |
| Teacher dashboard | `#overview`, hero actions, real counts, three mode cards and recent quizzes |
| Quiz library and builder | `#quizzes`, `#editor`, search/filter/archive and all requested question types |
| Solo waiting lobby | PIN, live member count, name chips, invite, start and projector link |
| Live host quiz | Colored A/B/C/D tiles, LaTeX, ring timer, progress, response count and leaderboard |
| Team Showdown | Balanced automatic assignments, team scores, team leaderboard and per-student answers |
| Phone student play | Stacked answer tiles, timer, progress, saved-answer feedback, points and standings |
| Paper Scan camera | Camera view, stable-marker overlay, saved/uncertain/missing counts, response review/manual correction |
| Paper Scan projector | Large question/options, response counter, reveal controlled by host |
| Mobile results | Trophy, accuracy, position, score, leaderboard, answer review and play again |
| Teacher reports | Individual/team scores, accuracy, question charts and Excel export |
| Rosters/cards | Settings, roster Excel import and 100 original answer cards; A4/Letter and compact/large PDFs |
| Five-item navigation from prompt | Overview, My Quizzes, Live Arena, Reports, Settings; collapses to mobile menu |
| Confirmation/error/loading feedback | Destructive confirmations, busy buttons, notifications and reconnect indicator |
| Optional PWA | Not included; it was optional in the prompt. Live games require connectivity. |

The physical laptop and phone frames in the reference images are not embedded in the website. The original artwork and responsive measurements recreate the visual direction rather than claiming an exact pixel copy. Camera device testing remains a separate acceptance gate.


## Illustrated refresh
Applied the approved clay illustration direction to the dashboard, welcome screen, lobby and results. Includes seven transparent PNGs, pastel game-mode cards, subject thumbnails, local Nunito fonts, larger touch targets, and responsive desktop/mobile layouts. The dashboard shows the latest three quizzes; View all opens the full library. See ILLUSTRATION-ASSETS.md for asset names and prompts.


Widescreen side decorations: curved lavender and teal backgrounds, calculator/book/atom illustrations, stars and math symbols frame the dashboard and live arena. Rails stay outside the content, ignore pointer events, and are hidden below 1440px. Dashboard visually verified at 1880px; mobile verified at 390px without overflow.
