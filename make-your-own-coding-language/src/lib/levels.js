const path = [[1,5],[2,5],[3,5],[3,4],[4,4],[5,4],[5,3],[6,3],[7,3],[7,2],[8,2],[8,1]];
// Longer trails snake through the same jungle grid. Each point is one stone.
const advancedPath = [[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[8,4],[8,3],[7,3],[6,3],[5,3],[4,3],[3,3],[2,3],[1,3],[1,2],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1]];
export const LEVELS = [
  { title: 'Banana beginnings', subtitle: 'Your first steps into the jungle', concept: 'Commands', path, rocks: [4], mission: 'Move along the path. Jump over the rock. Find the banana!', starter: '# Let’s get that banana!\nmove 3\njump\nmove 6\nsay "Banana time!"', hint: 'Milo follows the stepping stones automatically. Move 3 stones, jump over the rock (2 stones), then move 6.', solution: 'move 3\njump\nmove 6\nsay "Banana time!"' },
  { title: 'Rock & roll', subtitle: 'A few hops, a lot of possibilities', concept: 'Sequencing', path: [[1,5],[2,5],[2,4],[3,4],[4,4],[4,3],[5,3],[6,3],[6,2],[7,2],[8,2],[8,1]], rocks: [2,6,9], mission: 'Three rocks. One banana. Plan your hops carefully.', starter: '# A rock is two stones away.\nmove 1\njump\n# What comes next?\n', hint: 'After the first jump, move 2, jump, move 1, jump, then move 1.', solution: 'move 1\njump\nmove 2\njump\nmove 1\njump\nmove 1' },
  { title: 'On repeat', subtitle: 'Less typing, more monkey business', concept: 'Loops', path: [[1,5],[2,5],[3,5],[3,4],[4,4],[5,4],[5,3],[6,3],[7,3],[7,2],[8,2],[8,1]], rocks: [2,5,8], mission: 'Spot the pattern. A repeat block can do the heavy lifting.', starter: '# A pattern is hiding in the path.\nrepeat 3 {\n  move 1\n  jump\n}\n# Just two more stones…\n', hint: 'Repeat move 1 and jump three times. Add move 2 after the closing brace.', solution: 'repeat 3 {\n  move 1\n  jump\n}\nmove 2' },
  { title: 'Think like a monkey', subtitle: 'Let your code make decisions', concept: 'Conditionals', path, rocks: [3,6,9], mission: 'Use if obstacle to decide when Milo should jump.', starter: '# Teach Milo to look ahead.\nrepeat 8 {\n  if obstacle {\n    jump\n  } else {\n    move 1\n  }\n}', hint: 'This program is ready to try! if obstacle looks one stone ahead. Eight actions cover eleven stones when three are jumps.', solution: 'repeat 8 {\n  if obstacle {\n    jump\n  } else {\n    move 1\n  }\n}' },
  { title: 'Jungle jam', subtitle: 'Make a little noise. Make a new command.', concept: 'Inventing', path, rocks: [4], mission: 'Build a music command in the Language Lab. Give Milo a soundtrack!', starter: '# music is a real JavaScript command!\nmusic "C4 E4 G4 C5"\nmove 3\njump\nmove 6', hint: 'Open Language Lab and select music. Try changing the notes or adding await monkey.say("Encore!") to its JavaScript.', solution: 'music "C4 E4 G4 C5"\nmove 3\njump\nmove 6' },
  { title: 'Monkey business', subtitle: 'Your language. Your rules. Your adventure.', concept: 'Remixing', path: [[1,5],[2,5],[3,5],[3,4],[4,4],[4,3],[5,3],[6,3],[6,2],[7,2],[8,2],[8,1]], rocks: [3,7], mission: 'Invite a monkey friend and invent your own victory celebration.', starter: '# Friends make adventures better.\nclone\nrepeat 9 {\n  if obstacle {\n    jump\n  } else {\n    move 1\n  }\n}\nsay "We did it!"\nmusic "C4 E4 G4 C5"', hint: 'Add your own command called party: await monkey.clone(); await monkey.music("C4 E4 G4 C5"); await monkey.say("Party time!");', solution: 'clone\nrepeat 9 {\n  if obstacle {\n    jump\n  } else {\n    move 1\n  }\n}\nsay "We did it!"' },
  {
    title: 'Nested vines', subtitle: 'A pattern inside a pattern', concept: 'Nested loops',
    path: advancedPath.slice(0,19), rocks: [2,5,8,11,14,17],
    mission: 'Six rocks on a longer trail. Try a repeat inside a repeat to hop past them all.',
    starter: '# Three groups. Two hops in each group.\nrepeat 3 {\n  repeat 2 {\n    move 1\n    # What comes after each move?\n  }\n}',
    hint: 'Put jump after move 1 inside the smaller repeat. The inner block runs twice, and the outer block repeats that whole pattern three times: six hops!',
    solution: 'repeat 3 {\n  repeat 2 {\n    move 1\n    jump\n  }\n}',
  },
  {
    title: 'Look before you leap', subtitle: 'Let sensors count the stones', concept: 'Safe decisions',
    path: advancedPath.slice(0,23), rocks: [1,4,6,10,13,16,20],
    mission: 'The rocks have no repeating pattern. Combine path_clear and obstacle so extra repeats stay safe at the goal.',
    starter: '# Walking is safe only when path_clear is true.\nrepeat 24 {\n  if path_clear {\n    move 1\n  } else {\n    # Only jump if a rock is ahead.\n  }\n}',
    hint: 'Inside else, add if obstacle { jump } on separate lines. At the banana both sensors are false, so extra repeats do nothing instead of jumping off the path.',
    solution: 'repeat 24 {\n  if path_clear {\n    move 1\n  } else {\n    if obstacle {\n      jump\n    }\n  }\n}',
  },
  {
    title: 'Checkpoint crew', subtitle: 'Three teams. One clever expedition.', concept: 'Combining blocks',
    path: advancedPath, rocks: [2,4,8,11,14,18],
    mission: 'Try leaving three monkey friends along the trail. Use nested loops and a decision inside your travel block.',
    starter: '# A friend stays behind before each group of actions.\nrepeat 3 {\n  clone\n  repeat 6 {\n    # Look for a rock, then jump or move.\n  }\n}',
    hint: 'Inside repeat 6, use if obstacle { jump } else { move 1 }, each on its own line. Three groups of six actions reach the banana, leaving friends on stones 0, 9, and 17.',
    solution: 'repeat 3 {\n  clone\n  repeat 6 {\n    if obstacle {\n      jump\n    } else {\n      move 1\n    }\n  }\n}',
  },
  {
    title: 'Jingle jungle', subtitle: 'A festive finale you can remix', concept: 'Custom functions',
    path: advancedPath, rocks: [1,5,8,12,15,19,22],
    mission: 'Reach the banana, then play Jingle Bells with christmas. Open its JavaScript to remix the notes and tempo!',
    starter: '# 24 stones to travel. Seven jumps save seven actions.\n# Fix the repeat count, then remix your celebration.\nrepeat 12 {\n  if obstacle {\n    jump\n  } else {\n    move 1\n  }\n}\nchristmas 200\nsay "Merry Christmas!" "squeaky"',
    hint: '24 stones minus 7 skipped stones means 17 actions. Change repeat 12 to repeat 17. christmas 200 plays at 200 beats per minute; try 160 for a slower song. Edit christmas in the Language Lab: :2 holds a note for two beats, and R is a rest.',
    solution: 'repeat 17 {\n  if obstacle {\n    jump\n  } else {\n    move 1\n  }\n}\nchristmas 200\nsay "Merry Christmas!" "squeaky"',
  },
];

// These are real JavaScript function bodies. The Language Lab edits these exact values.
export const DEFAULT_COMMANDS = [
  { name: 'move', params: 'steps = 1', body: '// Walk forward along the stepping stones.\nawait monkey.move(steps);', color: 'purple', description: 'Walk along the path', mapping: 'monkey.move(steps)' },
  { name: 'jump', params: '', body: '// Hop over the next stone and land on the one after it.\nawait monkey.jump();', color: 'orange', description: 'Hop over one stone', mapping: 'monkey.jump()' },
  { name: 'say', params: 'message, voice = "default"', body: '// Give Milo a voice! Try "squeaky", "robot", or "sleepy".\nawait monkey.say(message, voice);', color: 'green', description: 'Say something out loud', mapping: 'monkey.say(message, voice)' },
  { name: 'music', params: 'notes = "C4 E4 G4 C5"', body: '// Change these notes to compose your own tune.\n// Try: C4, D4, E4, F4, G4, A4, B4, C5\nawait monkey.music(notes);', color: 'purple', description: 'Play your own melody', mapping: 'monkey.music(notes)' },
  { name: 'clone', params: '', body: '// Leave a monkey friend on this stone.\nawait monkey.clone();', color: 'orange', description: 'Make a monkey friend', mapping: 'monkey.clone()' },
  { name: 'reset', params: '', body: '// Ask to restore the whole project to its starter settings.\n// You can download your work or cancel before anything is cleared.\nawait monkey.reset();', color: 'purple', description: 'Start the whole project over', mapping: 'monkey.reset()' },
  {
    name: 'christmas', params: 'bpm = 200', color: 'green',
    description: 'Play Jingle Bells at your own tempo', mapping: 'monkey.music(phrase, beat)',
    body: `// Jingle Bells! Change the notes to make your own song.
// :2 holds a note for two beats. :0.5 is half a beat. R is a rest.
const phrases = [
  "E4 E4 E4:2 E4 E4 E4:2",
  "E4 G4 C4 D4 E4:4",
  "F4 F4 F4 F4 F4 E4 E4 E4:0.5 E4:0.5",
  "E4 D4 D4 E4 D4:2 G4:2",
  "E4 E4 E4:2 E4 E4 E4:2",
  "E4 G4 C4 D4 E4:4",
  "F4 F4 F4 F4 F4 E4 E4 E4:0.5 E4:0.5",
  "G4 G4 F4 D4 C4:4",
];
if (!Number.isFinite(bpm) || bpm < 60 || bpm > 300) {
  throw new Error("Choose a tempo (bpm) from 60 to 300.");
}
const beat = 60000 / bpm;
for (const phrase of phrases) {
  await monkey.music(phrase, beat);
}`,
  },
];
