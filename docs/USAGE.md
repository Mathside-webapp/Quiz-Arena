# Teacher quick guide

## Prepare a quiz

Open My Quizzes → Create Quiz. Enter a title, subject, grade/category and questions. Set each question's type, correct answer, time (5–600 seconds) and points (1–10,000). Put LaTeX between dollar signs, e.g. `$x^2 + 2x + 1$`. Identification answers ignore capitalization and spaces at the ends, but do not perform symbolic algebra equivalence.

Reference pictures are optional. JPG, PNG and WebP images are resized to JPEG. Excel import supports `Type`, `Question`, `A`, `B`, `C`, `D`, `Answer`, `Seconds`, `Points`; download the template in the builder. `Answer` is the full option text, not its letter. Import appends questions, replacing an untouched blank first question. The total cannot exceed 100. Pictures are attached in the builder after import.

Drafts are saved to this browser immediately; once a title is entered, changes also autosave online after a short delay. Check the save message before closing the tab. If saving fails, stay in the same browser and reopen the quiz to recover the local draft. Preview validates complete questions and lets you answer them before hosting. Archiving hides a quiz from hosting; deleting a quiz preserves existing game snapshots and reports.

## Host games

Choose a quiz and mode. The lobby shows a six-digit PIN; copy its invitation link. Students enter the PIN and a nickname without email registration. Start only when the class is ready.

- Solo Battle: students answer individually.
- Team Showdown: joiners are assigned to teams round-robin (2–8 teams). Every student answers on their own device; team points are summed. This is a team scoring format, not a shared-answer voting interface.
- Paper Scan Arena: select a class roster and use reusable cards. Identification questions cannot be hosted in this mode.

Correct answers earn the configured points. Scores are calculated on the server, not trusted from student devices. Total response time breaks equal-score ties; there is no speed bonus. Rankings show completed/revealed questions so other students cannot infer a hidden current answer from score changes. Students receive feedback for their own saved answer.

Pause freezes the remaining time. Resume continues it. Close & reveal shows the answer. Next advances from reveal. Skip advances while retaining submitted answers. Repeat clears this question's responses and points and restarts it, with confirmation. End finalizes the game. Finished games cannot restart; host a fresh game from the quiz. Expired answers are rejected by the server, regardless of client clock.

Projector view is a separate view for the signed-in teacher. It follows the game, uses large question text and hides host controls. To open it on another computer, sign in as the same teacher and open that game's projector view.

## Paper Scan

Settings → Add class: enter `card number, student name` per line or import the roster template. Use unique card numbers 1–100. Generate the card PDF in A4 or Letter, compact (four per page) or large (one per page). Print at actual size without clipping. Keep the white area around the black marker and all four letter labels.

A is printed at the top, B at the right, C at the bottom and D at the left. Rotate the card so the intended answer letter is at the top. True/false questions use A=True, B=False. Cards are original QuizArena markers, not Plickers cards, and can be reused across quizzes.

Start the question, then the camera. The scanner requires four consistent detections over at least 450 ms, exact code matching, adequate marker size and a near-upright answer orientation before saving. Missing/uncertain readings remain unscored. The camera stops when the game moves to a new question or another state; tap Start camera again when ready. Pause camera stops the device stream; Pause game stops the timer.

A stable later scan can replace a previous answer while that question is open. Manual corrections use each student's dropdown. Corrections are rejected after the server deadline. If you need to recollect answers, repeat the question; this clears its earlier responses. Confirm saved/missing counts before reveal.

## Reports

Reports retain game snapshots, individual submissions, scores, teams, accuracy and per-question analysis. Missing responses count as incorrect in class accuracy. Export Excel includes Leaderboard, Teams, Questions and Responses worksheets, with readable column widths and filters. Student View my answers shows only that student's responses after the game has finished.

Settings includes optional sounds, confetti and class response charts. These preferences are browser-specific. Reduced-motion preferences suppress confetti.


## Improved live display
Use Full screen on a live question to expand the classroom display; press Esc to exit. The projector button opens a separate display with the question, answers, response progress and leaderboard, while the host keeps the game controls. A red countdown indicates five seconds or less. Pause and reveal have distinct question headings.
