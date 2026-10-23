import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, initialGame, sense } from '../src/lib/game.js';
const level = { path: [[0,0],[1,0],[2,0],[3,0],[4,0]], rocks: [2] };
test('walking stops before a rock and gives a useful error', () => {
  assert.throws(() => applyAction({ ...initialGame(), position: 1 }, level, 'move', [1]), /rock/);
});
test('jump skips one stone and can land on the banana', () => {
  const jumped = applyAction({ ...initialGame(), position: 1 }, level, 'jump', []);
  assert.equal(jumped.position, 3);
  assert.equal(applyAction(jumped, level, 'move', [1]).won, true);
});
test('jump cannot land on a rock or off the path', () => {
  assert.throws(() => applyAction(initialGame(), level, 'jump', []), /rock/);
  assert.throws(() => applyAction({ ...initialGame(), position: 3 }, level, 'jump', []), /path/);
});
test('sensors reflect actual game state', () => {
  const state = { ...initialGame(), position: 1 };
  assert.equal(sense(state, level, 'obstacle'), true);
  assert.equal(sense(state, level, 'path_clear'), false);
  assert.equal(sense({ ...state, position: 3 }, level, 'banana_ahead'), true);
});
test('clone creates a friend at the current position and speech is visible', () => {
  const state = applyAction(initialGame(), level, 'clone', []);
  assert.deepEqual(state.clones, [0]);
  assert.equal(applyAction(state, level, 'say', ['Hello!']).speech, 'Hello!');
});
