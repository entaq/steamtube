import { useEffect, useState } from 'react';
import { ArrowRight, GitBranch, Pencil, Plus, Check, Expand, BookOpen, Code2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import Modal from './Modal';
import { validateCommands } from '../lib/language';

const API = [
  ['await monkey.move(steps)', 'Walk a number of stones along the path.'],
  ['await monkey.jump()', 'Skip one stone. Great for hopping over rocks.'],
  ['await monkey.say(message, voice)', 'Speak and show a message. Voice is optional: try "squeaky", "robot", "sleepy", or an installed voice name.'],
  ['await monkey.music("E4:2 R G4", 300)', 'Play notes with an optional beat length in milliseconds. Use C–B, # or b, and octaves 3–6. :2 holds for two beats; R is a rest.'],
  ['await monkey.clone()', 'Leave a monkey friend on your current stone.'],
  ['await monkey.reset()', 'Stop code and open the full-project reset confirmation. Download or cancel before starting over.'],
  ['await monkey.wait(500)', 'Wait for a number of milliseconds.'],
  ['await monkey.obstacle()', 'Ask if the next stone has a rock. Returns true or false.'],
  ['await monkey.path_clear()', 'Ask if you can walk onto the next stone.'],
  ['await monkey.banana_ahead()', 'Ask if the next stone holds the banana.'],
];

function CommandEditor({ definitions, selected, onSelect, onSave, onAdd, expanded = false }) {
  const command = definitions[selected] || definitions[0];
  const [draft, setDraft] = useState(command);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { setDraft(command); setError(''); }, [command]);
  const dirty = draft.name !== command.name || draft.params !== command.params || draft.body !== command.body;
  function update(patch) { setDraft(d => ({ ...d, ...patch })); setSaved(false); }
  function save() {
    try {
      const next = definitions.map((c, i) => i === selected ? draft : c);
      validateCommands(next);
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      new AsyncFunction('monkey', ...(draft.params ? [draft.params] : []), draft.body);
      onSave(selected, draft);
      setSaved(true);setError('');
    } catch (err) { setError(err.message); }
  }
  return <div className={`command-editor ${expanded ? 'expanded-command-editor' : ''}`}>
    <div className="command-editor-toolbar">
      <label className="sr-only" htmlFor={expanded ? 'command-expanded' : 'command-inline'}>Choose a command</label>
      <select id={expanded ? 'command-expanded' : 'command-inline'} value={selected} onChange={e => { setSaved(false);onSelect(Number(e.target.value)); }}>{definitions.map((c,i) => <option value={i} key={c.id || i}>{c.name}</option>)}</select>
      <span className="real-js-label"><span /> Real, editable JavaScript</span>
      {expanded ? <button className="button small" onClick={onAdd}><Plus size={14} /> New command</button> : null}
    </div>
    {expanded ? <div className="command-fields"><label>MonkeyScript word<input value={draft.name} onChange={e => update({ name: e.target.value })} aria-label="Command name" /></label><label>Arguments <span>(optional)</span><input value={draft.params} onChange={e => update({ params: e.target.value })} placeholder="steps = 1" aria-label="Command arguments" /></label></div> : null}
    <div className="function-frame"><div className="function-heading"><span>async function</span> {draft.name}({draft.params}) {'{'}</div>
      <CodeEditor value={draft.body} onChange={body => update({ body })} label={expanded ? 'Expanded command JavaScript' : 'Command JavaScript'} javascript />
      <div className="function-closing">{'}'}</div>
    </div>
    {error ? <p className="inline-error" role="alert">{error}</p> : null}
    <div className="command-save-row"><span>{saved ? 'Saved! Run your code to try it.' : dirty ? 'You have changes to try.' : 'Change the code. Make it yours.'}</span><button className="button primary small" onClick={save} disabled={!dirty}><Check size={14} />{saved ? 'Saved' : 'Save command'}</button></div>
  </div>;
}

export default function LanguageLab({ definitions, onSave, open, onClose, labTab, setLabTab }) {
  const [selected, setSelected] = useState(0);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('party');
  const [addError, setAddError] = useState('');
  useEffect(() => { if (selected >= definitions.length) setSelected(0); }, [selected, definitions.length]);
  function add() {
    const newCommand = { id: crypto.randomUUID(), name: name.trim(), params: '', body: '// Your new word can do more than one thing!\nawait monkey.clone();\nawait monkey.music("C4 E4 G4 C5");\nawait monkey.say("Party time!");', color: 'purple', description: 'My own command', mapping: 'my JavaScript' };
    try {
      validateCommands([...definitions, newCommand]);
      onSave(definitions.length, newCommand);setSelected(definitions.length);setLabTab('javascript');setAdding(false);setAddError('');
    } catch (err) { setAddError(err.message); }
  }
  function startAdding() { setName(definitions.some(c => c.name === 'party') ? 'dance' : 'party'); setAdding(true);setAddError(''); }
  const editorProps = { definitions, selected, onSelect: setSelected, onSave, onAdd: startAdding };
  return <>
    <section className="panel language-panel" id="language-lab" aria-label="Language Lab">
      <div className="panel-heading"><div><GitBranch size={22} className="accent" /><h2>Make it your language</h2></div><button className="button small" onClick={() => { setLabTab('javascript'); onClose('open'); }}><Pencil size={13} />Edit commands</button></div>
      {labTab === 'map' ? <div className="mapping-content"><p className="mapping-note"><span>⤵</span> Your words. JavaScript’s superpowers.</p>
        <div className="mapping-rows">{definitions.slice(0,3).map((command,i) => <button className="mapping-row" key={command.id || i} onClick={() => { setSelected(i);setLabTab('javascript'); }} aria-label={`Edit JavaScript for ${command.name}`}><code className={`command-token ${command.color}`}>{command.name}</code><ArrowRight size={17} /><code className="mapping-js">{command.mapping}</code><Pencil className="row-edit" size={13} /></button>)}</div>
        <div className="mapping-helper"><Code2 size={13}/><span>{definitions.length} commands, including music, christmas & reset. Click one to explore.</span></div>
      </div> : <CommandEditor {...editorProps} />}
      <div className="panel-tabs" role="tablist" aria-label="Language view"><button role="tab" aria-selected={labTab === 'map'} className={labTab === 'map' ? 'selected' : ''} onClick={() => setLabTab('map')}>Command map</button><button role="tab" aria-selected={labTab === 'javascript'} className={labTab === 'javascript' ? 'selected' : ''} onClick={() => setLabTab('javascript')}>JavaScript</button><button className="add-command" onClick={startAdding}>Add command <Plus size={15}/></button></div>
    </section>
    {open ? <Modal wide title="Your language starts here." onClose={() => onClose()}><p className="modal-intro">Every MonkeyScript word is powered by a JavaScript function. Change it, save it, then run your adventure. You’re the language inventor.</p><div className="lab-workspace"><div><CommandEditor {...editorProps} expanded /></div><aside className="api-reference"><h3><BookOpen size={17}/> Milo’s superpowers</h3><p>Use <code>await</code> so one action finishes before the next one begins.</p>{API.map(([signature, description]) => <div className="api-item" key={signature}><code>{signature}</code><p>{description}</p></div>)}</aside></div></Modal> : null}
    {adding ? <Modal title="Invent a new word" onClose={() => setAdding(false)}><p className="modal-intro">What if one word could clone Milo, play a tune, and start a party? Let’s make it happen.</p><label className="field-label">Your new command<input aria-label="New command name" autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') add(); }} /></label><div className="new-command-preview"><code><span className="syntax-keyword">await</span> monkey.clone();<br/><span className="syntax-keyword">await</span> monkey.music(<span className="syntax-string">"C4 E4 G4 C5"</span>);<br/><span className="syntax-keyword">await</span> monkey.say(<span className="syntax-string">"Party time!"</span>);</code></div><p className="fine-print">This is your starter JavaScript. You can change every line after creating it.</p>{addError ? <p className="inline-error" role="alert">{addError}</p> : null}<div className="modal-actions"><button className="button" onClick={() => setAdding(false)}>Cancel</button><button className="button primary" onClick={add}><Plus size={16}/>Create command</button></div></Modal> : null}
  </>;
}
