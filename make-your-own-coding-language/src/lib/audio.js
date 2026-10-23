import { speechPlayer } from './speech.js';
import { parseMelody } from './music.js';
let context;
let enabled = true;
const activeNotes=new Set();
export function stopNotes() {
  for (const oscillator of activeNotes) {
    try { oscillator.stop(); } catch { /* A note may have ended at the same instant. */ }
  }
  activeNotes.clear();
}
export function setSound(value) { enabled = value;if(!value) stopNotes();speechPlayer.setEnabled(value); }
export function unlockAudio() {
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') context.resume().catch(() => {});
  } catch { /* Browsers without audio still run every puzzle. */ }
}
export function playNotes(notes = 'C4 E4 G4 C5', beatMs = 180) {
  const melody = parseMelody(notes, beatMs);
  if (!enabled || !context) return melody.durationMs;
  const now = context.currentTime;
  melody.notes.forEach(({ frequency, startMs, durationMs }) => {
    if (frequency === null) return;
    const start = now + startMs / 1000;
    const duration = durationMs / 1000;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    activeNotes.add(oscillator);
    oscillator.onended=()=>{activeNotes.delete(oscillator);oscillator.disconnect();gain.disconnect();};
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.12, start + Math.min(0.015, duration * 0.15));
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.9);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  });
  return melody.durationMs;
}
