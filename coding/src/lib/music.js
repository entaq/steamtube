// Shared by the synthesizer and runner so playback and waiting use the same clock.
export function parseMelody(text = 'C4 E4 G4 C5', beatMs = 180) {
  if (!Number.isFinite(beatMs) || beatMs < 60 || beatMs > 1000) throw new Error('Music needs a beat length from 60 to 1,000 milliseconds.');
  const tokens = String(text).trim().split(/\s+/).filter(Boolean);
  if (tokens.length > 128) throw new Error('Keep each melody under 129 notes. Split a longer song into phrases.');
  const semitones = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  let durationMs = 0;
  const notes = tokens.map(token => {
    const match = token.match(/^(?:([A-G])(#|b)?([3-6])|(R))(?::(\d+(?:\.\d+)?))?$/i);
    if (!match) throw new Error(`Check the note “${token}”. Try C4, E4:2, or R for a rest.`);
    const beats = match[5] === undefined ? 1 : Number(match[5]);
    if (beats < 0.25 || beats > 8) throw new Error('A note can last from 0.25 to 8 beats.');
    const frequency = match[4] ? null : 440 * 2 ** ((semitones[match[1].toUpperCase()] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0) + (Number(match[3]) - 4) * 12) / 12);
    const note = { frequency, startMs: durationMs, durationMs: beats * beatMs };
    durationMs += note.durationMs;
    return note;
  });
  return { notes, durationMs };
}
