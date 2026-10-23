import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMelody } from '../src/lib/music.js';

test('held notes, fractional beats, and rests keep their full musical timing', () => {
  const melody=parseMelody('A4:2 R:0.5 C5',300);
  assert.equal(melody.durationMs,1050);
  assert.deepEqual(melody.notes.map(({startMs,durationMs,frequency})=>[startMs,durationMs,frequency===null]),[[0,600,false],[600,150,true],[750,300,false]]);
  assert.equal(melody.notes[0].frequency,440);
  assert.ok(Math.abs(parseMelody('A#4 Bb4').notes[0].frequency-parseMelody('Bb4').notes[0].frequency)<0.001);
});
test('melodies longer than the old 24-note cap play to the end', () => {
  const melody=parseMelody(Array(32).fill('C4').join(' '));
  assert.equal(melody.notes.length,32);
  assert.equal(melody.durationMs,5760);
  assert.throws(()=>parseMelody('H4'),/note/i);
  assert.throws(()=>parseMelody('C4:0'),/beat/i);
  assert.throws(()=>parseMelody('C4',0),/tempo|beat/i);
});
