export function initialGame() { return { position: 0, clones: [], speech: 'A little monkey. A big banana dream.', won: false, moves: 0, lastAction: null }; }

// Game rules stay separate from drawing, so new commands can reuse the same rules.
export function applyAction(state, level, action, args = []) {
  const next = { ...state, lastAction: action };
  if (action === 'move' || action === 'jump') {
    if (state.won) return next;
    const destination = state.position + (action === 'jump' ? 2 : 1);
    if (destination >= level.path.length) throw new Error('That jump goes off the path! Move one stone instead.');
    if (level.rocks.includes(destination)) throw new Error(action === 'jump' ? 'There is a rock where you would land. Try a different jump!' : 'A rock is in the way! Try jump to hop over it.');
    next.position = destination;
    next.moves++;
    next.won = destination === level.path.length - 1;
    if (next.won) next.speech = 'Banana time! You did it!';
  } else if (action === 'say') next.speech = String(args[0] ?? '').slice(0, 160);
  else if (action === 'clone') {
    if (state.clones.length >= 8) throw new Error('Eight monkey friends is a party! Reset to make more.');
    next.clones = [...state.clones, state.position];
    next.speech = 'A new friend joined the adventure!';
  } else if (!['music', 'wait'].includes(action)) throw new Error(`Unknown monkey action: ${action}`);
  return next;
}

export function sense(state, level, name) {
  const next = state.position + 1;
  if (name === 'obstacle') return level.rocks.includes(next);
  if (name === 'path_clear') return next < level.path.length && !level.rocks.includes(next);
  if (name === 'banana_ahead') return next === level.path.length - 1;
  return false;
}
