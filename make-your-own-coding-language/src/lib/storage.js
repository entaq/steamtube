import { validateCommands } from './language.js';
import { DEFAULT_COMMANDS, LEVELS } from './levels.js';
const KEY = 'monkeyscript-project-v1';
export function createStarterProject() {
  return {
    version:1,
    definitions:DEFAULT_COMMANDS.map(command=>({...command,id:command.name})),
    programs:{},completed:[],levelIndex:0,voice:'milo',
  };
}
function upgradeSpeechCommand(command) {
  const isOriginalSay = (command.id === 'say' || (!command.id && command.name === 'say'))
    && command.params === 'message'
    && command.body === '// Give Milo something to say!\nawait monkey.say(message);';
  if (!isOriginalSay) return command;
  const current = DEFAULT_COMMANDS.find(c => c.name === 'say');
  return {...command,params:current.params,body:current.body,mapping:current.mapping};
}
export function normalizeProject(saved) {
  // Saving an unfinished experiment must never discard it just because it cannot run yet.
  // Execution limits belong to the parser/runtime, not to project storage.
  if (!saved || saved.version !== 1 || !Array.isArray(saved.definitions) || saved.definitions.length < 1 || !saved.definitions.every(c => c && typeof c.name === 'string' && typeof c.params === 'string' && typeof c.body === 'string')) throw new Error('Choose a MonkeyScript project file with valid command definitions.');
  validateCommands(saved.definitions);
  const levelIndex = saved.levelIndex ?? 0;
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= LEVELS.length) throw new Error(`This project needs a valid level number from 0 to ${LEVELS.length - 1}.`);
  const programs = saved.programs ?? {};
  if (!programs || typeof programs !== 'object' || Array.isArray(programs) || !Object.entries(programs).every(([key,value]) => /^(0|[1-9]\d*)$/.test(key) && Number(key) < LEVELS.length && typeof value === 'string')) throw new Error('This project has an invalid saved program. Each program should be MonkeyScript text.');
  const definitions=saved.definitions.map(upgradeSpeechCommand);
  const isLegacyPlayground=['move','jump','say','music','clone'].every(name=>definitions.some(c=>(c.id || c.name)===name));
  for (const name of ['reset','christmas']) {
    if (isLegacyPlayground && !definitions.some(c=>c.id===name || c.name===name)) {
      definitions.push({...DEFAULT_COMMANDS.find(c=>c.name===name),id:name});
    }
  }
  return {
    version: 1,
    definitions: definitions.map(c => ({
      ...c,
      id: typeof c.id === 'string' ? c.id : c.name,
      color: ['purple','orange','green'].includes(c.color) ? c.color : 'purple',
      mapping: typeof c.mapping === 'string' ? c.mapping : c.body.split('\n').map(line => line.trim()).find(line => line && !line.startsWith('//'))?.replace(/^await\s+/, '').replace(/;$/, '') || 'my JavaScript',
    })),
    programs,
    completed: Array.isArray(saved.completed) ? saved.completed.filter(n => Number.isInteger(n) && n >= 0 && n < LEVELS.length) : [],
    levelIndex,
    voice: typeof saved.voice === 'string' ? saved.voice : 'milo',
  };
}
export function loadProject() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved || saved.version !== 1) return null;
    return saved;
  } catch { return null; }
}
export function saveProject(project) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...project, version: 1 })); return true; }
  catch { return false; }
}
export function downloadProject(project) {
  const blob = new Blob([JSON.stringify({ ...project, version: 1 }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'my-monkeyscript-project.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
