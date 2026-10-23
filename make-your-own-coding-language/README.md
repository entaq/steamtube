# MonkeyScript 🐵

**Little code. Big adventures.** A coding playground where you invent the language and help Milo find a banana.

## Start the app

```sh
npm install
npm run dev
```

Open the local address shown in the terminal (usually http://localhost:5173). Everything runs in your browser. There are no accounts or API keys. Fonts, jungle art, and sprites are included locally.

## Play

The top-left editor speaks MonkeyScript. The bottom-left panel shows how each word maps to **real JavaScript**. The jungle is on the right.

Milo follows the stepping-stone path automatically, including its turns. `move 1` walks to the next stone. `jump` skips one stone and lands two stones ahead. Rocks block walking and cannot be landed on. Reach the final stone to collect the banana.

```text
# Your first adventure
move 3
jump
move 6
say "Banana time!"
```

**Run code** starts from the beginning. **Step** runs one MonkeyScript statement at a time (so `move 3` walks three stones). **Continue** resumes a paused program. The square button stops running code; the circular arrow resets the jungle. Choose a speed, use hints, or explore all ten levels in any order. Press Cmd/Ctrl+Enter to run. Press F outside an editor to expand the jungle; Escape leaves full screen.

After the first six adventures, try **Nested vines** (nested loops), **Look before you leap** (safe sensor decisions), **Checkpoint crew** (loops, decisions, and clones), and **Jingle jungle** (a longer route and an editable song function). The later starters leave gaps for you to solve; hints explain the next step. Existing programs and progress stay saved when new levels arrive.

### Loops and decisions

Put one command on each line. Numbers and quoted strings are arguments. Both `#` and `//` start comments. Use braces for blocks:

```text
repeat 8 {
  if obstacle {
    jump
  } else {
    move 1
  }
}
```

Other conditions: `path_clear` and `banana_ahead`. Loops can nest, with counts from 1 to 100. Different levels need different counts!

### Give Milo a voice

Click **Voice** above the jungle to pick and preview a voice. `say` now speaks as well as showing a speech bubble:

```text
say "Hello! I’m Milo."
say "Banana time!" "squeaky"
say "Banana detected." "robot"
say "Five more minutes…" "sleepy"
```

The first line uses your voice-picker choice. An optional second argument selects a playful preset (`milo`, `squeaky`, `robot`, `sleepy`) or an installed voice by name, such as `say "Hello!" "Daniel"` when Daniel appears in your list. Playful presets change pitch and speed; the picker also lists actual browser/OS voices, including other languages. Voices marked **online** use the browser’s remote speech service. The default presets prefer an available local English voice.

Speech uses the browser’s built-in Web Speech API—no account, API key, or backend. The available voices vary by device and browser. The program waits for a spoken line to finish before running the next command. Stop, Reset, and Mute cancel speech immediately. If speech is unavailable, the bubble still works and the program continues. A voice saved on another device falls back gracefully if that voice is missing here.

Voice choices save with the project. Old, untouched `say` functions automatically gain the optional voice argument; custom JavaScript functions are preserved. To add the argument to your own custom function, set Arguments to `message, voice = "default"`, then pass `voice` into `await monkey.say(message, voice)`.

## Invent the language

1. Click a command in the map, or open **Language Lab**.
2. Choose a command and edit its JavaScript body.
3. Click **Save command** and run your MonkeyScript again.

For example, change the JavaScript behind `say`:

```js
// message is the argument from say "hello"
await monkey.clone();
await monkey.say(message.toUpperCase());
```

Now `say "hello"` creates a monkey friend and says `HELLO`! JavaScript expressions, variables, `for` loops, and `if` statements work here.

### Make a new word

Click **Add command** and invent `party`. Its starter function does this:

```js
await monkey.clone();
await monkey.music("C4 E4 G4 C5");
await monkey.say("Party time!");
```

Then write `party` in the MonkeyScript editor. Change its function however you like. Add arguments in the expanded Language Lab, such as `message = "Hello!"`. The editor shows the resulting function signature. Renaming a command updates its uses in saved programs.

### Milo’s JavaScript API

| JavaScript | What it does |
| --- | --- |
| `await monkey.move(steps)` | Walk 1–100 stones, one at a time |
| `await monkey.jump()` | Jump two stones forward |
| `await monkey.say(message, voice)` | Speak and change the bubble; voice is optional and defaults to your picker choice |
| `await monkey.music("E4:2 R G4", 300)` | Play notes and rests; the optional second argument is milliseconds per beat (default 180) |
| `await monkey.clone()` | Leave a monkey friend on the current stone (up to eight) |
| `await monkey.reset()` | Stop the program and ask to restore the whole project |
| `await monkey.wait(500)` | Pause for milliseconds, up to 3,000 |
| `await monkey.obstacle()` | Return whether the next stone contains a rock |
| `await monkey.path_clear()` | Return whether walking to the next stone is possible |
| `await monkey.banana_ahead()` | Return whether the next stone is the goal |

`await` means “finish this action before doing the next one.” Music supports notes C–B, optional `#` or `b`, and octaves 3–6. Add `:2` to hold for two beats or `:0.5` for half a beat. `R` is one beat of silence; `R:2` is two. Each phrase can contain up to 128 notes/rests, with durations from 0.25 to 8 beats and beat lengths from 60 to 1,000 milliseconds. Music waits for the whole phrase and keeps its tempo at every movement speed. Sound starts after a click, as browsers require. The speaker button mutes it; Stop and Reset cancel music immediately.

### Remix a Christmas song

The built-in **christmas** word plays the Jingle Bells chorus:

```text
christmas
christmas 160
```

The optional number is tempo in beats per minute (60–300; default 200). Choose **JavaScript** in the lower-left panel, then select **christmas**. Its real function contains an array of eight short phrases and a JavaScript `for` loop that plays each one. Change a phrase, add a rest, or write a new ending, save the command, then run it again. No cloud service is needed.

Here is the opening phrase using the music API directly:

```js
await monkey.music("E4 E4 E4:2 E4 E4 E4:2", 300);
```

Clones are friendly markers left behind along the route; they do not run separate programs. You can extend this behavior in the game rules.

### Start over

Write `reset` in MonkeyScript, or click the **M** project menu → **Reset project**. Both stop running code and open the same confirmation.

**Reset everything** returns to Level 1, restores all ten levels’ starter programs and the original command JavaScript (including christmas), removes custom commands, clears completed levels, and resets the monkey, clones, speech, music, voice, sound, speed, hints, and Language Lab view. The fresh project saves on this device.

Use **Download my project** first to keep an experiment, or **Keep my project** to cancel. A `reset` command ends its run when the confirmation opens, so commands after it will not execute. The circular arrow beside Step remains a quick jungle-only reset that keeps your programs and language.

## Explore the source together

The whole project is editable JavaScript. Start with these files:

| File | What to explore |
| --- | --- |
| `src/lib/levels.js` | Starter command JavaScript, level paths, obstacles, hints, and solutions. Add a level or change a starter function here. |
| `src/lib/language.js` | The language itself: reading lines, recognizing blocks, and translating MonkeyScript into JavaScript. |
| `src/lib/runtime.worker.js` | The `monkey` API and the code that runs your editable command functions. |
| `src/lib/game.js` | Walking, jumping, winning, sensors, and cloning rules. |
| `src/components/GameBoard.jsx` | Drawing and animating the jungle, characters, and objects. |
| `src/lib/audio.js` | Making music with the browser’s built-in synthesizer. |
| `src/lib/speech.js` | Speaking with the browser’s voices, changing pitch/speed presets, waiting, and cancelling. Add a new playful voice here. |
| `src/lib/useRunner.js` | Connecting the interpreter to animation, stepping, and stopping. |
| `src/components/LanguageLab.jsx` | The JavaScript editor and command-building interface. |
| `src/styles.css` | Colors, sizes, spacing, and responsive layouts. |

### How your language works

```text
MonkeyScript → parser → a little syntax tree → JavaScript → worker
                                                              ↓
Editable command functions → monkey API → game rules → jungle drawing
```

The MonkeyScript editor accepts only its simple grammar. The Language Lab intentionally accepts actual JavaScript. Its functions run in a disposable Web Worker so a forgotten infinite loop does not freeze the editor. The app stops a function that runs for five seconds without yielding an action. Nested programs also have an execution limit.

### A fun next project: add a dance

First, use existing actions to invent a `dance` command that plays three notes, clones Milo, and says something silly. Then try adding a completely new `monkey.dance()` API: expose it in `runtime.worker.js`, handle its action in `game.js`, and animate it in `GameBoard.jsx`. That teaches the difference between inventing a word and adding a new game ability.

## Save and share

Programs, command functions, renamed words, completed levels, and the selected level save on this device in browser storage. Click the **M** avatar to **Download project** as a JSON file or **Load project** on another device. A downloaded project includes the custom language, so a brother or friend can use the same words.

Keep a downloaded copy of experiments you care about. Loading a project replaces the project currently open in the playground.

## Check and build

```sh
npm test
npm run build
npm run preview
```

Tests cover language parsing, line-number errors, nesting, command validation, walking and jumping, sensors, editable JavaScript, music/cloning/speech action dispatch, all ten level solutions through the actual worker, full-song dispatch, note/rest timing, asynchronous voice loading, voice selection, completion, cancellation, muting, fallbacks, and saved-project upgrades.

Built with React, Vite, Lucide icons, Plus Jakarta Sans, and the Canvas and Web Audio browser APIs. Jungle and sprite art were generated specifically for this project with the built-in image-generation tool; see `docs/design-notes.md`.
