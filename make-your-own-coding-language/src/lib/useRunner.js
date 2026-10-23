import { useEffect, useRef, useState } from 'react';
import { parse, compile } from './language.js';
import { initialGame, applyAction, sense } from './game.js';
import { unlockAudio, playNotes, stopNotes } from './audio.js';
import { speechPlayer } from './speech.js';

export function useRunner({ level, source, definitions, speed, voice, onWin, onSpeechProblem, onResetRequested }) {
  const [game, setGame] = useState(initialGame);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [activeLine, setActiveLine] = useState(null);
  const state = useRef(initialGame());
  const session = useRef(null);
  const options = useRef({ level, speed, voice, onWin, onSpeechProblem, onResetRequested });
  options.current = { level, speed, voice, onWin, onSpeechProblem, onResetRequested };

  function closeSession() {
    if (session.current) {
      session.current.worker.terminate();
      clearTimeout(session.current.watchdog);
      clearTimeout(session.current.timer);
      session.current = null;
    }
    setStatus('idle');
    setActiveLine(null);
  }
  function stop() {
    stopNotes();
    speechPlayer.stop();
    closeSession();
  }
  function reset() {
    stop();
    const next = initialGame();
    state.current = next;
    setGame(next);
    setError('');
  }
  useEffect(() => () => {
    stopNotes();
    speechPlayer.stop();
    session.current?.worker.terminate();
    clearTimeout(session.current?.watchdog);
    clearTimeout(session.current?.timer);
  }, []);

  function start(mode = 'run') {
    unlockAudio();
    if (session.current) {
      const running = session.current;
      running.mode = mode;
      running.credits = mode === 'step' ? 1 : Infinity;
      setStatus(mode === 'step' ? 'stepping' : 'running');
      if (running.queuedTick) {
        const tick = running.queuedTick;
        running.queuedTick = null;
        running.allowTick(tick);
      }
      return;
    }
    reset();
    let js;
    try {
      const nodes = parse(source, definitions);
      if (!nodes.length) throw new Error('Your adventure starts with a command. Try move 1!');
      js = compile(nodes);
    } catch (err) { setError(err.message); setStatus('error'); return; }
    const worker = new Worker(new URL('./runtime.worker.js', import.meta.url), { type: 'module' });
    const running = { worker, mode, credits: mode === 'step' ? 1 : Infinity, queuedTick: null, watchdog: null, timer: null };
    session.current = running;
    setStatus(mode === 'step' ? 'stepping' : 'running');
    const isCurrent = () => session.current === running;
    const fail = message => {
      if (!isCurrent()) return;
      stop();
      setError(message);
      setStatus('error');
    };
    const arm = () => {
      clearTimeout(running.watchdog);
      running.watchdog = setTimeout(() => fail('Your JavaScript ran for too long. Check for a loop that never ends, then try again.'), 5000);
    };
    const reply = (id, value, error) => {
      if (!isCurrent()) return;
      worker.postMessage({ type: 'reply', id, value, error });
      arm();
    };
    running.allowTick = data => {
      setActiveLine(data.line);
      if (running.credits <= 0) {
        running.queuedTick = data;
        clearTimeout(running.watchdog);
        setStatus('paused');
      } else {
        running.credits--;
        reply(data.id);
      }
    };
    worker.onmessage = async ({ data }) => {
      if (!isCurrent()) return;
      clearTimeout(running.watchdog);
      if (data.type === 'tick') running.allowTick(data);
      else if (data.type === 'sense') reply(data.id, sense(state.current, options.current.level, data.name));
      else if (data.type === 'action') {
        if (data.name === 'reset') {
          stop();
          options.current.onResetRequested?.();
          return;
        }
        try {
          const previous = state.current;
          const next = applyAction(previous, options.current.level, data.name, data.args);
          state.current = next;
          setGame(next);
          if (data.name === 'say') {
            const result = await speechPlayer.speak(next.speech,data.args[1],options.current.voice);
            if (!isCurrent()) return;
            if (['unsupported','error','timeout'].includes(result.status)) options.current.onSpeechProblem?.('This browser could not play the voice. Milo’s message is still in the bubble. Try a different voice or open the app in Chrome.');
            else if (result.usedFallback) options.current.onSpeechProblem?.('That voice is not available on this device, so Milo used a default voice.');
            reply(data.id);
            return;
          }
          const musicDuration = data.name === 'music' ? playNotes(data.args[0], data.args[1]) : 0;
          if (!previous.won && next.won) {
            playNotes('C4 E4 G4 C5', 130);
            options.current.onWin();
          }
          // Music keeps its own tempo, even when movement runs at 4× speed.
          const delay = data.name === 'music' ? musicDuration : (data.name === 'wait' ? data.args[0] : 380) / options.current.speed;
          running.timer = setTimeout(() => reply(data.id, data.name === 'clone' ? next.clones.length : undefined), delay);
        } catch (err) { reply(data.id, undefined, err.message); }
      } else if (data.type === 'done') {
        const won = state.current.won;
        // Let the last melody/victory notes finish after normal code completion.
        closeSession();
        setStatus(won ? 'won' : 'finished');
      } else if (data.type === 'error') fail(data.message);
    };
    worker.onerror = event => { event.preventDefault(); fail(`Something in the JavaScript needs a look: ${event.message}`); };
    worker.postMessage({ type: 'run', js, definitions });
    arm();
  }

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      coordinates: 'grid origin top-left, x right, y down; movement follows ordered path',
      status, level: level.title, position: game.position, player: level.path[game.position],
      path: level.path, rocks: level.rocks, banana: level.path.at(-1), clones: game.clones,
      speech: game.speech, won: game.won, activeLine, error,
    });
    window.advanceTime = ms => new Promise(resolve => setTimeout(resolve, Math.min(ms, 500)));
    return () => { delete window.render_game_to_text; delete window.advanceTime; };
  }, [game, status, level, activeLine, error]);
  return { game, status, error, activeLine, start, stop, reset };
}
