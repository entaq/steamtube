import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechPlayer } from '../src/lib/speech.js';

// Speech synthesis belongs to the browser/OS. This transport stand-in lets the
// real player exercise completion, cancellation, voice selection, and failures.
function platform() {
  const voices = [
    {name:'Samantha',voiceURI:'voice:samantha',lang:'en-US',localService:true,default:true},
    {name:'Daniel',voiceURI:'voice:daniel',lang:'en-GB',localService:true,default:false},
  ];
  const listeners = new Map();
  const calls = [];
  let cancelled = 0;
  class Utterance { constructor(text) { this.text=text; } }
  const synthesis = {
    getVoices:()=>voices,
    speak:utterance=>calls.push(utterance),
    cancel:()=>cancelled++,
    addEventListener:(event,listener)=>listeners.set(event,listener),
    removeEventListener:(event)=>listeners.delete(event),
  };
  const timers = new Map();let id=0;
  const clock={setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout(key){timers.delete(key);}};
  return {synthesis,Utterance,clock,voices,calls,listeners,timers,get cancelled(){return cancelled;}};
}

test('say selects a real voice by name and waits for the utterance to finish', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  let finished=false;
  const task=player.speak('Hello Milo','Daniel').then(result=>{finished=true;return result;});
  await Promise.resolve();
  assert.equal(api.calls[0]?.text,'Hello Milo');
  assert.equal(api.calls[0]?.voice,api.voices[1]);
  assert.equal(finished,false);
  api.calls[0].onend();
  assert.equal((await task).status,'spoken');
  assert.equal(api.timers.size,0);
});
test('a fun voice changes pitch and rate and default uses the chosen voice', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const task=player.speak('Banana time!','default','squeaky');
  assert.ok(api.calls[0]?.pitch>1);
  assert.ok(api.calls[0]?.rate>1);
  api.calls[0].onend();await task;
});
test('stop cancels speech and releases an awaiting program', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const task=player.speak('Still talking');
  player.stop();
  assert.equal((await task).status,'cancelled');
  assert.equal(api.cancelled,1);
  assert.equal(api.timers.size,0);
});
test('muting cancels the current line and prevents subsequent speech', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const current=player.speak('Hello');player.setEnabled(false);
  assert.equal((await current).status,'muted');
  assert.equal((await player.speak('Silent')).status,'muted');
  assert.equal(api.calls.length,1);
});
test('unsupported speech leaves the program able to continue', async () => {
  const player=createSpeechPlayer({synthesis:null,Utterance:null});
  assert.equal((await player.speak('Hello')).status,'unsupported');
});
test('an unavailable imported voice falls back to a usable local voice', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const task=player.speak('Hello','A voice on another computer');
  assert.equal(api.calls[0]?.voice,api.voices[0]);
  api.calls[0].onend();
  assert.equal((await task).usedFallback,true);
});
test('voice loading updates subscribers and unsubscribe removes the listener', () => {
  const api=platform();const player=createSpeechPlayer(api);const snapshots=[];
  const unsubscribe=player.subscribeVoices(voices=>snapshots.push(voices));
  api.voices.push({name:'Alex',voiceURI:'voice:alex',lang:'en-US',localService:true});
  api.listeners.get('voiceschanged')();
  assert.equal(snapshots.at(-1).length,3);
  unsubscribe();assert.equal(api.listeners.size,0);
});
test('speech errors and a missing end event cannot hang the program', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const first=player.speak('Hello');api.calls[0].onerror({error:'not-allowed'});
  assert.equal((await first).status,'error');
  const second=player.speak('Hello again');
  [...api.timers.values()][0]();
  assert.equal((await second).status,'timeout');
  assert.equal(api.cancelled,1);
});
test('starting another line cancels and resolves the previous line', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const first=player.speak('First');const second=player.speak('Second');
  assert.equal((await first).status,'cancelled');
  api.calls[1].onend();assert.equal((await second).status,'spoken');
});
test('closing a voice preview never cancels speech owned by a running program', async () => {
  const api=platform();const player=createSpeechPlayer(api);
  const task=player.speak('A long program line','default','milo','program');
  player.stopFor('preview');
  assert.equal(api.cancelled,0);
  api.calls[0].onend();assert.equal((await task).status,'spoken');
  const preview=player.speak('Preview','milo','milo','preview');player.stopFor('preview');
  assert.equal((await preview).status,'cancelled');
});
test('first playback waits for asynchronously loaded voices before resolving a saved choice', async () => {
  const api=platform();api.voices.length=0;const player=createSpeechPlayer(api);
  const task=player.speak('Hello','Daniel');
  assert.equal(api.calls.length,0);
  const daniel={name:'Daniel',voiceURI:'voice:daniel',lang:'en-GB',localService:true};
  api.voices.push(daniel);api.listeners.get('voiceschanged')();
  assert.equal(api.calls[0]?.voice,daniel);
  api.calls[0].onend();assert.equal((await task).usedFallback,false);
});
test('stopping while voices are loading releases the program and ignores late arrivals', async () => {
  const api=platform();api.voices.length=0;const player=createSpeechPlayer(api);
  const task=player.speak('Hello','Daniel');
  player.stop();
  assert.equal((await task).status,'cancelled');
  assert.equal(api.calls.length,0);
  assert.equal(api.listeners.size,0);
  assert.equal(api.timers.size,0);
});
