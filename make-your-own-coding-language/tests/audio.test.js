import test from 'node:test';
import assert from 'node:assert/strict';
import {unlockAudio,playNotes,stopNotes,setSound} from '../src/lib/audio.js';

test('stopping or muting cancels every scheduled note, including future notes', t=>{
  const previousWindow=globalThis.window;
  const oscillators=[];
  class BrowserAudioContext {
    currentTime=0;state='running';destination={};
    createOscillator() {
      const oscillator={frequency:{value:0},connect(){return this;},disconnect(){},start(){},stop(when){if(when===undefined){this.stopped=true;this.onended?.();}}};
      oscillators.push(oscillator);return oscillator;
    }
    createGain() {return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},disconnect(){}};}
  }
  globalThis.window={AudioContext:BrowserAudioContext};
  t.after(()=>{setSound(true);globalThis.window=previousWindow;});
  unlockAudio();playNotes('C4 E4 G4');
  assert.equal(oscillators.length,3);
  assert.equal(oscillators.filter(note=>note.stopped).length,0);
  stopNotes();
  assert.equal(oscillators.filter(note=>note.stopped).length,3);
  playNotes('C5');setSound(false);
  assert.equal(oscillators.filter(note=>note.stopped).length,4);
  playNotes('G4');assert.equal(oscillators.length,4);
});
