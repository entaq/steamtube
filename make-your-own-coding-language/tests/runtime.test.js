import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { parse, compile } from '../src/lib/language.js';
import { initialGame, applyAction, sense } from '../src/lib/game.js';
import { LEVELS, DEFAULT_COMMANDS } from '../src/lib/levels.js';

// A tiny transport adapter runs the real browser worker in Node. No interpreter mocks.
function runWorker(source, definitions, level = LEVELS[0]) {
  return new Promise((resolve,reject) => {
    const url = new URL('../src/lib/runtime.worker.js', import.meta.url).href;
    const worker = new Worker(`const { parentPort } = require('node:worker_threads');\nglobalThis.self = { postMessage: data => parentPort.postMessage(data) };\nimport(${JSON.stringify(url)}).then(() => { parentPort.on('message', data => self.onmessage({data}));parentPort.postMessage({type:'ready'}); });`, { eval: true });
    let game = initialGame();
    const actions = [];
    const timeout = setTimeout(() => { worker.terminate();reject(new Error('Worker test timed out')); }, 3000);
    function done(error) { clearTimeout(timeout);worker.terminate();error ? reject(error) : resolve({game,actions}); }
    worker.on('error', done);
    worker.on('message', data => {
      if (data.type === 'ready') worker.postMessage({ type:'run', js:compile(parse(source,definitions)), definitions });
      else if (data.type === 'tick') worker.postMessage({type:'reply',id:data.id});
      else if (data.type === 'sense') worker.postMessage({type:'reply',id:data.id,value:sense(game,level,data.name)});
      else if (data.type === 'action') {
        if (data.name==='reset') { actions.push({name:data.name,args:data.args});done();return; }
        try { game=applyAction(game,level,data.name,data.args);actions.push({name:data.name,args:data.args});worker.postMessage({type:'reply',id:data.id}); }
        catch(err) { worker.postMessage({type:'reply',id:data.id,error:err.message}); }
      } else if (data.type === 'done') done();
      else if (data.type === 'error') done(new Error(data.message));
    });
  });
}

for (const level of LEVELS) {
  test(`the real worker can solve ${level.title}`, async () => {
    const {game} = await runWorker(level.solution, DEFAULT_COMMANDS, level);
    assert.equal(game.won,true);
    assert.equal(game.position,level.path.length-1);
    if (level.title==='Checkpoint crew') assert.deepEqual(game.clones,[0,9,17]);
  });
}
test('editing JavaScript changes execution: expressions, multiple actions and default arguments work', async () => {
  const definitions = [{ name:'party',params:'message = "Hello, Milo!"',body:'await monkey.clone(); await monkey.music("C4 G4"); await monkey.say(message.toUpperCase());' }];
  const {game,actions}=await runWorker('party',definitions);
  assert.deepEqual(game.clones,[0]);
  assert.equal(game.speech,'HELLO, MILO!');
  assert.deepEqual(actions.map(a=>a.name),['clone','music','say']);
});
test('worker reports JavaScript runtime mistakes with their MonkeyScript line', async () => {
  await assert.rejects(runWorker('# comment\nmove 0',DEFAULT_COMMANDS),/Line 2.*whole number/);
});
test('worker reports JavaScript syntax errors with the command name', async () => {
  await assert.rejects(runWorker('oops',[{name:'oops',params:'',body:'await monkey.say('}]),/JavaScript for.*oops/);
});
test('a custom function can use sensors and JavaScript loops', async () => {
  const definitions = [{name:'explore',params:'',body:'for (let i=0; i<10; i++) { if (await monkey.obstacle()) { await monkey.jump(); } else { await monkey.move(1); } }'}];
  const {game}=await runWorker('explore',definitions);
  assert.equal(game.won,true);
});
test('say forwards an optional voice argument through the real worker', async () => {
  const {actions}=await runWorker('say "Hello!" "squeaky"',DEFAULT_COMMANDS);
  assert.deepEqual(actions,[{name:'say',args:['Hello!','squeaky']}]);
});
test('reset reaches the host and stops execution before later commands', async () => {
  const {actions}=await runWorker('move 1\nreset\nmove 1',DEFAULT_COMMANDS);
  assert.deepEqual(actions.map(a=>a.name),['move','reset']);
});
test('Christmas runs editable JavaScript with a tempo argument and the whole chorus', async () => {
  const {actions}=await runWorker('christmas 200',DEFAULT_COMMANDS);
  assert.equal(actions.length,8);
  assert.ok(actions.every(a=>a.name==='music' && a.args[1]===300));
  assert.equal(actions[0].args[0],'E4 E4 E4:2 E4 E4 E4:2');
  assert.equal(actions.at(-1).args[0],'G4 G4 F4 D4 C4:4');
  const changed=DEFAULT_COMMANDS.map(c=>c.name==='christmas'?{...c,body:'await monkey.music("C5:2 R G4", 400);'}:c);
  assert.deepEqual((await runWorker('christmas',changed)).actions,[{name:'music',args:['C5:2 R G4',400]}]);
  await assert.rejects(runWorker('christmas 0',DEFAULT_COMMANDS),/tempo|bpm/i);
});
