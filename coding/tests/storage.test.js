import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProject, createStarterProject } from '../src/lib/storage.js';
import { DEFAULT_COMMANDS, LEVELS } from '../src/lib/levels.js';
const project = {version:1,definitions:[{name:'go',params:'',body:'await monkey.move();'}],programs:{0:'go'},completed:[0],levelIndex:0};
test('rejects fractional level indexes before they can crash the level view', () => {
  assert.throws(() => normalizeProject({...project,levelIndex:1.5}),/level/i);
});
test('rejects malformed saved programs instead of allowing an editor crash', () => {
  assert.throws(() => normalizeProject({...project,programs:{0:{bad:true}}}),/program/i);
});
test('preserves actual command JavaScript and programs when importing', () => {
  const imported=normalizeProject(project);
  assert.equal(imported.definitions[0].body,'await monkey.move();');
  assert.equal(imported.programs[0],'go');
  assert.deepEqual(imported.completed,[0]);
});
test('rejects an unrelated JSON file with a useful error', () => {
  assert.throws(() => normalizeProject({hello:'world'}),/MonkeyScript project/);
});
test('preserves large in-progress experiments even when they exceed execution limits', () => {
  const large = {...project,definitions:Array.from({length:51},(_,i)=>({name:`word${i}`,params:'',body:'// '+ 'a'.repeat(20001)})),programs:{0:'# '+ 'a'.repeat(25001)}};
  const loaded=normalizeProject(large);
  assert.equal(loaded.definitions.length,51);
  assert.equal(loaded.definitions[0].body.length,20004);
  assert.equal(loaded.programs[0].length,25003);
});
test('normalizes imported display metadata so it can never crash React rendering', () => {
  const loaded=normalizeProject({...project,definitions:[{...project.definitions[0],mapping:{text:'bad'},color:{bad:true}}]});
  assert.equal(typeof loaded.definitions[0].mapping,'string');
  assert.equal(loaded.definitions[0].mapping,'monkey.move()');
  assert.equal(loaded.definitions[0].color,'purple');
});
test('upgrades an untouched old say command while preserving a custom function', () => {
  const original={id:'say',name:'say',params:'message',body:'// Give Milo something to say!\nawait monkey.say(message);'};
  const migrated=normalizeProject({...project,definitions:[original],voice:'squeaky'});
  assert.equal(migrated.voice,'squeaky');
  assert.match(migrated.definitions[0].params,/voice/);
  const custom={...original,body:'await monkey.clone(); await monkey.say(message.toUpperCase());'};
  assert.equal(normalizeProject({...project,definitions:[custom]}).definitions[0].body,custom.body);
});
test('a full reset restores the language, all starter programs, progress, level, and voice', () => {
  const fresh=createStarterProject();
  assert.equal(fresh.levelIndex,0);
  assert.equal(fresh.voice,'milo');
  assert.deepEqual(fresh.programs,{});
  assert.deepEqual(fresh.completed,[]);
  assert.deepEqual(fresh.definitions.map(c=>c.name),DEFAULT_COMMANDS.map(c=>c.name));
  assert.ok(fresh.definitions.some(c=>c.name==='reset'));
  assert.deepEqual(normalizeProject(fresh),fresh);
});
test('reset starts with independent copies even after earlier experiments modified everything', () => {
  const old=createStarterProject();
  old.definitions[0].name='scoot';old.definitions[0].body='await monkey.jump();';
  old.programs[0]='music "C4"';old.programs[5]='say "Changed"';
  old.completed.push(0,1,2);old.voice='squeaky';old.levelIndex=5;
  const fresh=createStarterProject();
  assert.equal(fresh.definitions[0].name,'move');
  assert.match(fresh.definitions[0].body,/monkey\.move\(steps\)/);
  assert.deepEqual(fresh.programs,{});
  assert.deepEqual(fresh.completed,[]);
  assert.equal(fresh.levelIndex,0);
  assert.equal(fresh.voice,'milo');
});
test('older playgrounds gain reset without replacing an invented reset command', () => {
  const legacy=createStarterProject();legacy.definitions=legacy.definitions.filter(c=>c.name!=='reset');
  assert.equal(normalizeProject(legacy).definitions.filter(c=>c.name==='reset').length,1);
  const custom={id:'custom-reset',name:'reset',params:'',body:'await monkey.say("My own reset!");'};
  legacy.definitions.push(custom);
  const migrated=normalizeProject(legacy);
  assert.equal(migrated.definitions.filter(c=>c.name==='reset').length,1);
  assert.equal(migrated.definitions.find(c=>c.name==='reset').body,custom.body);
});
test('advanced-level programs and progress survive exporting and reloading', () => {
  const adventure={...project,levelIndex:9,programs:{0:'go',6:'repeat 3 {\n  go\n}',9:'christmas 180'},completed:[0,6,9,10,-1]};
  const loaded=normalizeProject(JSON.parse(JSON.stringify(adventure)));
  assert.equal(loaded.levelIndex,9);
  assert.equal(loaded.programs[9],'christmas 180');
  assert.deepEqual(loaded.completed,[0,6,9]);
  assert.throws(()=>normalizeProject({...adventure,levelIndex:LEVELS.length}),/level/i);
  assert.throws(()=>normalizeProject({...adventure,programs:{10:'go'}}),/program/i);
  assert.throws(()=>normalizeProject({...adventure,programs:{'01':'go'}}),/program/i);
});
test('existing languages gain the Christmas recipe without changing inventions or renamed words', () => {
  const legacy=createStarterProject();
  legacy.definitions=legacy.definitions.filter(c=>c.id!=='christmas');
  legacy.definitions[0]={...legacy.definitions[0],name:'scoot',body:'await monkey.move(2);'};
  legacy.programs[5]='scoot';legacy.completed=[5];
  const upgraded=normalizeProject(legacy);
  assert.ok(upgraded.definitions.some(c=>c.name==='christmas'));
  assert.equal(upgraded.definitions[0].body,'await monkey.move(2);');
  assert.equal(upgraded.programs[5],'scoot');
  assert.deepEqual(upgraded.completed,[5]);
  const custom={id:'invented',name:'christmas',params:'',body:'await monkey.say("My song");'};
  legacy.definitions.push(custom);
  assert.equal(normalizeProject(legacy).definitions.find(c=>c.name==='christmas').body,custom.body);
});
