// Editable JavaScript runs here, off the UI thread. A runaway loop can be stopped.
import { validateCommands } from './language.js';
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let requestId = 0;
const pending = new Map();
function request(type, payload) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    self.postMessage({ type, id, ...payload });
  });
}

self.onmessage = async ({ data }) => {
  if (data.type === 'reply') {
    const task = pending.get(data.id);
    if (!task) return;
    pending.delete(data.id);
    data.error ? task.reject(new Error(data.error)) : task.resolve(data.value);
    return;
  }
  if (data.type !== 'run') return;
  let currentLine = 1;
  let operations = 0;
  const tick = async line => {
    currentLine = line;
    if (++operations > 2000) throw new Error('That is a lot of steps! Try a smaller repeat count.');
    await request('tick', { line });
  };
  const action = (name, args = []) => request('action', { name, args, line: currentLine });
  const monkey = Object.freeze({
    async move(steps = 1) {
      if (!Number.isInteger(steps) || steps < 1 || steps > 100) throw new Error('move needs a whole number from 1 to 100.');
      for (let i = 0; i < steps; i++) await action('move');
    },
    jump: () => action('jump'),
    say: (message, voice = 'default') => action('say', [String(message).slice(0,160),String(voice)]),
    clone: () => action('clone'),
    reset: () => action('reset'),
    music: (notes = 'C4 E4 G4 C5', beatMs = 180) => action('music', [String(notes), beatMs]),
    wait: (ms = 500) => action('wait', [Math.min(3000, Math.max(0, Number(ms) || 0))]),
    obstacle: () => request('sense', { name: 'obstacle' }),
    path_clear: () => request('sense', { name: 'path_clear' }),
    banana_ahead: () => request('sense', { name: 'banana_ahead' }),
  });
  try {
    validateCommands(data.definitions);
    const commands = Object.create(null);
    for (const definition of data.definitions) {
      try {
        const fn = new AsyncFunction('monkey', ...(definition.params ? [definition.params] : []), definition.body);
        commands[definition.name] = (...args) => fn(monkey, ...args);
      } catch (error) { throw new Error(`Check the JavaScript for “${definition.name}”: ${error.message}`); }
    }
    await new AsyncFunction('commands', 'monkey', 'tick', data.js)(commands, monkey, tick);
    self.postMessage({ type: 'done' });
  } catch (error) { self.postMessage({ type: 'error', message: `Line ${currentLine}: ${error.message}` }); }
};
