import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, compile, validateCommands } from '../src/lib/language.js';

const commands = [
  { name: 'move', params: 'steps = 1', body: 'await monkey.move(steps);' },
  { name: 'jump', params: '', body: 'await monkey.jump();' },
  { name: 'say', params: 'message', body: 'await monkey.say(message);' },
];

test('parses quoted strings containing comment markers and escaped quotes', () => {
  assert.deepEqual(parse('say "hi # jungle \\"friend\\"" # comment', commands)[0].args, ['hi # jungle "friend"']);
});
test('uses the actual renamed command vocabulary', () => {
  const renamed = [{ ...commands[0], name: 'scoot' }];
  assert.equal(parse('scoot 4', renamed)[0].name, 'scoot');
  assert.throws(() => parse('move 4', renamed), /Line 1.*move/);
});
test('compiles nested repeats and conditions to working JavaScript', async () => {
  const source = 'repeat 3 {\n if obstacle {\n  jump\n } else {\n  move 1\n }\n}';
  const js = compile(parse(source, commands));
  const positions = [];
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  await new AsyncFunction('commands', 'monkey', 'tick', js)(
    { move: async (n) => positions.push(n), jump: async () => positions.push(2) },
    { obstacle: async () => positions.length === 1 },
    async () => {},
  );
  assert.deepEqual(positions, [1, 2, 1]);
});
test('rejects JavaScript injection in DSL arguments', () => {
  assert.throws(() => parse('move alert(1)', commands), /Line 1/);
});
test('reports missing braces with the opening line', () => {
  assert.throws(() => parse('repeat 3 {\nmove 1', commands), /Line 1.*\}/);
});
test('bounds loop counts and nesting before execution', () => {
  assert.throws(() => parse('repeat 100000 {\nmove\n}', commands), /100/);
  assert.throws(() => parse('repeat -1 {\nmove\n}', commands), /repeat/);
});
test('validates command parameters and reserved words', () => {
  assert.throws(() => validateCommands([{ name: 'repeat', params: '', body: '' }]), /reserved/);
  assert.throws(() => validateCommands([{ name: 'go', params: 'n); fetch(', body: '' }]), /parameter/);
  assert.throws(() => validateCommands([...commands, commands[0]]), /already/);
});
test('preserves source line numbers across blank lines and comments', () => {
  assert.equal(parse('# hello\n\nmove 2', commands)[0].line, 3);
});
test('handles quoted commas in default arguments without splitting the string', () => {
  const vocabulary=[{name:'say',params:'message = "Hello, Milo!"',body:'await monkey.say(message);'}];
  assert.equal(parse('say',vocabulary)[0].args.length,0);
  assert.deepEqual(parse('say "Hi"',vocabulary)[0].args,['Hi']);
});
