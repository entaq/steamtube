Original prompt: Build a fun two-panel MonkeyScript web app for a computer-savvy 10-year-old: simplified DSL editor above editable JavaScript command mappings on the left, monkey-to-banana obstacle game on the right. Include loops and conditionals. The underlying command JavaScript must be visible and editable so the child can extend the language with music and cloned monkeys.

Design: white/lavender coding lab, generated pixel jungle and sprite atlas, six progressive levels, genuine editable command functions, browser-local persistence. React/Vite, no backend.

Implementation complete. Editable JavaScript executes in a disposable worker, with action messages to the game and a watchdog to stop runaway code. Commands expose move, jump, say, music, clone, and wait APIs.

## Verification — 2026-10-22

- `npm test`: 30/30 passing. Includes the real runtime worker solving all six levels; default arguments with quoted commas; renamed vocabulary; nested loops and conditions; error line numbers; movement/collision/sensors/cloning; actual edited JavaScript; import validation and preservation of large unfinished experiments.
- `npm run build`: successful production bundle.
- In-app browser, using real UI controls: first-level win; blocked walking error; Step pauses and Continue resumes; conditional level win; speed selection; hints; music action; new party command; changing say to clone Milo and uppercase text; local persistence after reload; project download with JavaScript bodies preserved; project import restoring starter functions.
- Runaway loop: saved an infinite loop as a command body and ran it. The five-second watchdog terminated it, the UI remained responsive, and a useful error appeared. Restored the starter function afterward.
- Browser console: no warnings or errors at final check.
- Responsive checks: normal browser viewport, 1536×1024 concept viewport, and 390×844 mobile. No horizontal overflow on mobile. All main desktop panels and footer visible. Temporary viewport override reset afterward.
- Screenshots: `docs/desktop-preview.jpg`, `docs/language-lab-preview.jpg`, `docs/mobile-preview.jpg`. Both concept and latest desktop render inspected using view_image. Mobile full-page view inspected too.
- Independent code review: fixed imported display metadata that could crash rendering, quoted commas in default parameters, and persistence size limits that could otherwise discard unfinished experiments. Added regression tests.
- Playground tab retained as a deliverable at http://localhost:5173, first level selected, original command functions restored, source starter restored, jungle reset, playback at 1×. Local preview server remains running.

## Next experiments for the child

No required work remains. Optional: invent a dance command from existing actions, add a new game API/animation, add puzzle levels, or let cloned monkeys run separate programs. See README.md for the source-file map and a worked example.

## Spoken say commands — 2026-10-22

User requested real text-to-speech with selectable voices and an optional voice parameter.

- Added the browser Web Speech API with installed voice selection and Milo, Squeaky, Robot, and Sleepy pitch/rate presets. The Voice button above the jungle opens a picker, editable preview, and a valid MonkeyScript example. Remote browser voices are labeled online; presets prefer local English voices.
- `say "Hello"` uses the saved picker choice. `say "Hello" "squeaky"` or an installed voice name chooses per line. `monkey.say(message, voice)` remains real editable JavaScript.
- Runner waits for speech completion; Stop/Reset/Mute cancel promptly. Unsupported/failed/missing voices keep the bubble and allow progress. Empty initial voice lists wait briefly for voiceschanged. Preview cancellation is scoped so opening/closing settings never interrupts program speech.
- Original untouched saved say functions upgrade automatically; custom bodies stay unchanged. Voice choice persists with local/project saves.
- Added speech transport, cancellation, readiness, migration, and real worker voice-argument tests. Full suite: 44/44 passing. Production build successful.
- Browser verification: in-app preview completed; multi-voice program finished speech before walking; muted say still walked; stopping a long speech did not execute its following move; opening/closing Voice during a long say kept the line running on stone 0. Native Chrome Daniel preview completed, and a Daniel/Robot program reached its next stone; Chrome console had no errors/warnings.
- Independent review found and helped resolve preview ownership and asynchronously loaded voice choice edge cases, with regression tests.
- Final voice-picker responsive check: desktop 1280×900 and mobile 390×844; mobile dialog 356px wide with no horizontal page overflow. Preview completed again after final fixes; in-app browser console clean. Temporary screenshots saved outside the repo at /tmp/monkeyscript-voices-desktop.jpg and /tmp/monkeyscript-voices-mobile.jpg. Temporary viewport override reset; extra Chrome QA tab closed. Original starter source restored; in-app Voice picker retained as the deliverable.

## Full project reset — 2026-10-22

User requested a reset command that restores everything to the original levels.

- Added `reset` / `await monkey.reset()` and Project options (M) → Reset project. Both stop execution and open a confirmation with Download my project, Keep my project, and Reset everything.
- Confirmed reset returns to Level 1, clears all saved programs/completion/custom commands, restores canonical JavaScript definitions and default voice/sound/speed, clears monkey/clones/speech/hints/errors/active lines, and resets editor/lab/canvas UI. Fresh defaults persist through normal project autosave.
- Existing playgrounds gain the new built-in command without replacing a user's custom reset word. Default factory makes independent objects on each reset.
- Music now tracks active/scheduled oscillators, allowing Stop/Reset/Mute to cancel all notes immediately. Natural worker completion leaves the final melody and victory fanfare to finish; review caught and resolved the distinction.
- Unit/worker suite: 49/49 passing. Production build successful.
- Destructive UI behavior tested only in a separate disposable origin at http://127.0.0.1:55137/. Created a completed level, edited Level 6, renamed and changed move, added party, created a clone, changed voice/speed/mute, and opened hints. Keep my project preserved those changes. Reset everything restored originals, including untouched starter code in Level 6, and a reload retained the fresh project. Runtime `clone; reset; move 1` opened confirmation with Milo still on stone 0 and one clone, proving later commands did not run.
- Reset confirmation verified at 1280×900 desktop and 390×844 mobile; mobile reset returned to Level 1, with no horizontal overflow or console warnings/errors. Temporary screenshots: /tmp/monkeyscript-reset-desktop.jpg and /tmp/monkeyscript-reset-mobile.jpg. Closed QA tab and reset the temporary viewport override.
- Reloaded the main http://localhost:5173/ preview and confirmed its current program was preserved exactly. Existing custom project remains intact. Left Project options open with Reset project visible; no full reset was performed on the user's main project.

## Advanced adventures and Christmas command — 2026-10-22

User requested more advanced levels and a custom Christmas song function.

- Added Levels 7–10: Nested vines (nested repeats), Look before you leap (path_clear + obstacle with safe extra repeats), Checkpoint crew (nested loops + decisions + three clones), and Jingle jungle (longer route + song remix). Trails have 19–25 stones. Starter programs leave a puzzle to solve; hints explain the steps. All four solutions run through the actual worker; Checkpoint crew leaves friends at stones 0, 9, and 17.
- Added real, editable `christmas(bpm = 200)` JavaScript: eight Jingle Bells chorus phrases, tempo validation (60–300 bpm), and a for loop using the existing monkey.music API. `christmas 160` slows it down. Existing full playgrounds gain the command without changing custom/renamed functions or invented christmas commands.
- Added shared music parsing with held/fractional notes (`E4:2`, `E4:0.5`), rests (`R`, `R:2`), up to 128 notes per phrase, and an optional milliseconds-per-beat argument to monkey.music. Synthesizer and runner use the same duration. Music keeps its own tempo regardless of movement speed and waits for the full phrase; Stop/Reset/Mute still cancel active/future notes. Short note envelopes stay within note boundaries.
- Replaced six-level assumptions in navigation, wins, reset copy, initial state, imports, and completion/program storage with LEVELS.length. Advanced saved programs and progress now round-trip. Existing programs and custom command bodies are preserved.
- Browser validation used a separate preview at http://127.0.0.1:55137/ to keep the main project intact. Solved all four new puzzles through UI at 4×, verified the nested sensor loop finishes safely, three clones remain, and the full Christmas finale reaches its final spoken Merry Christmas. At 8 seconds the full song was still playing at 4× movement speed, as intended. Rewrote Christmas JavaScript with a held note and rest, saved, and verified its following jump waited for playback. Restored the song, stopped it mid-run, and verified the later jump did not run. The initial test used move 1 on a rock and correctly reported collision; changed the test to jump and confirmed success.
- Reload preserved Level 10, its edited program, and completed badges for all four new levels. Console warnings/errors: none. Mobile 390×844: the ten-card picker scrolls to the last adventures, selection works, dialog width 356px, page width 390px with no horizontal overflow. Desktop default viewport also inspected. Temporary viewport reset afterward; QA tab closed.
- Main localhost:5173 project reloaded and its preexisting program compared equal. Left Level 10 selected with its original unsolved starter and christmas JavaScript visible. All original saved programs/functions are retained. Screenshot evidence outside repository: /tmp/monkeyscript-advanced-desktop.png and /tmp/monkeyscript-advanced-mobile.png. Browser QA uses cua_repl because the current browser-control rules require it; the standalone Playwright client was not used.
- No required work remains after final unit/worker and production-build verification. Optional: invent another song by copying the christmas recipe, or add new path/rock patterns in levels.js.
- Final verification after all changes: npm test 58/58 passing; npm run build successful. Isolated QA server stopped; original localhost:5173 preview kept running.


## Static deployment under SteamTube /coding/ — 2026-10-22

User moved the source to /Users/arun.nagarajan/dev/steamtube/coding and reported a blank static-hosted app.

- Confirmed live https://steamtube.fun/coding returns unbuilt index.html referencing /src/main.jsx; that script URL returns 404. Live response headers identify Vercel. The parent SteamTube repo had no build script/configuration and published raw sources.
- Reproduced the second issue with an actual production build mounted at /coding/ on a plain Python static server: JS/CSS/fonts loaded, but /assets/jungle.png and /assets/sprites.png returned 404 and the canvas showed no sprites/background. Baseline screenshot: /tmp/monkeyscript-static-before.png.
- Set coding/vite.config.js base to /coding/. GameBoard now loads both public images through import.meta.env.BASE_URL, also supporting --base=/ when hosting this app alone.
- Added parent package.json build/test scripts, scripts/build-site.mjs, and vercel.json. Root npm run build installs the app's locked dev dependencies, runs Vite, then generates parent dist/: all 11 existing standalone HTML games stay at their original paths and the compiled app goes in dist/coding/. Vercel uses framework null, buildCommand npm run build, outputDirectory dist. Keep Vercel Root Directory at the SteamTube repo root. Generated parent dist/ is ignored; app source index remains the normal Vite build entry point.
- Updated parent/app READMEs with build, deployment, standalone-base override, and plain static preview instructions.
- Final verification: root npm run build succeeded, npm test passed 58/58, git diff --check passed. All 11 copied game pages are byte-identical to their source files. HTTP checks returned 200 for both /coding forms, both PNGs, the compiled app JS and worker, and all 11 root games. Source/node_modules are absent from the generated site.
- Browser at http://127.0.0.1:55139/coding/ uses only Python http.server, with no Vite dev server. After reload, jungle, monkey, banana and rocks rendered; running the unedited first-level program at 4x reached stone 11 and Sweet success. Console warnings/errors: none. Final screenshot /tmp/monkeyscript-static-working.png.
- Static preview server retained as session 71843, serving /Users/arun.nagarajan/dev/steamtube/dist on port 55139. Its browser tab is the deliverable. The temporary baseline server was stopped. Existing localhost:5173 tab was not edited.
- No commit, push or remote deployment was performed. Source/configuration changes are ready for the user's next commit and Vercel deployment; live steamtube.fun is still the previous deployment until then.
