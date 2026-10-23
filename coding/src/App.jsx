import { useEffect, useRef, useState } from 'react';
import { Play, StepForward, RotateCcw, Square, Code2, FileCode2, Grid2X2, ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize, Lightbulb, Sparkles, Command, ArrowRight, Download, Upload, Check, X, Speech } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import GameBoard from './components/GameBoard';
import LanguageLab from './components/LanguageLab';
import Modal from './components/Modal';
import VoiceSettings from './components/VoiceSettings';
import { LEVELS } from './lib/levels';
import { useRunner } from './lib/useRunner';
import { loadProject, saveProject, downloadProject, normalizeProject, createStarterProject } from './lib/storage';
import { setSound } from './lib/audio';

function initialProject() {
  try { return normalizeProject(loadProject()); } catch { return null; }
}
const boot = initialProject();
const seed = createStarterProject().definitions;
function adaptStarter(source, definitions) {
  return source.replace(/^(\s*)([a-zA-Z_]\w*)/gm, (all, indentation, word) => {
    const command = definitions.find(c => c.id === word);
    return command ? indentation + command.name : all;
  });
}

export default function App() {
  const [definitions, setDefinitions] = useState(boot?.definitions || seed);
  const [levelIndex, setLevelIndex] = useState(Math.min(LEVELS.length - 1, Math.max(0, Number(boot?.levelIndex) || 0)));
  const [programs, setPrograms] = useState(boot?.programs && typeof boot.programs === 'object' ? boot.programs : {});
  const [completed, setCompleted] = useState(Array.isArray(boot?.completed) ? boot.completed.filter(n => Number.isInteger(n) && n >= 0 && n < LEVELS.length) : []);
  const [speed, setSpeed] = useState(1);
  const [sound, setSoundEnabled] = useState(true);
  const [voice, setVoice] = useState(boot?.voice || 'milo');
  const [modal, setModal] = useState(null);
  const [labTab, setLabTab] = useState('map');
  const [hint, setHint] = useState(false);
  const [projectMenu, setProjectMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [projectGeneration,setProjectGeneration] = useState(0);
  const importInput = useRef(null);
  const gamePanel = useRef(null);
  const level = LEVELS[levelIndex];
  const source = typeof programs[levelIndex] === 'string' ? programs[levelIndex] : adaptStarter(level.starter, definitions);
  const runner = useRunner({ level, source, definitions, speed, voice, onSpeechProblem: setNotice, onResetRequested: requestProjectReset, onWin: () => setCompleted(items => items.includes(levelIndex) ? items : [...items,levelIndex]) });
  const busy = ['running','stepping','paused'].includes(runner.status);
  const project = { definitions, programs, completed, levelIndex, voice };

  useEffect(() => { setSaved(saveProject(project)); }, [definitions, programs, completed, levelIndex, voice]);
  useEffect(() => { setSound(sound); }, [sound]);
  useEffect(() => {
    function key(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); setWinDismissed(false);runner.start(); }
      if (event.key === 'f' && !['TEXTAREA','INPUT','SELECT'].includes(document.activeElement?.tagName) && !modal) toggleFullscreen();
    }
    window.addEventListener('keydown', key);
    const fullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', fullscreenChange);
    return () => { window.removeEventListener('keydown',key);document.removeEventListener('fullscreenchange',fullscreenChange); };
  });
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  },[notice]);
  function updateSource(value) { runner.stop();setPrograms(items => ({ ...items, [levelIndex]: value })); }
  function changeLevel(index) {
    if (index < 0 || index >= LEVELS.length) return;
    runner.reset();setLevelIndex(index);setModal(null);setHint(false);setWinDismissed(false);
  }
  function requestProjectReset() {
    runner.stop();
    setProjectMenu(false);
    setModal('reset');
  }
  async function resetProject() {
    const fresh=createStarterProject();
    runner.reset();
    setDefinitions(fresh.definitions);setPrograms(fresh.programs);setCompleted(fresh.completed);
    setLevelIndex(fresh.levelIndex);setVoice(fresh.voice);setSpeed(1);setSoundEnabled(true);
    setHint(false);setWinDismissed(false);setLabTab('map');setProjectMenu(false);setModal(null);
    setProjectGeneration(generation=>generation+1);
    setNotice(`Fresh start! All ${LEVELS.length} levels and original commands are ready.`);
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* Reset works even if full screen cannot close. */ }
    }
  }
  function saveCommand(index, command) {
    runner.stop();
    const old = definitions[index];
    const next = [...definitions]; next[index] = { ...command, mapping: command.body.split('\n').map(line => line.trim()).find(line => line && !line.startsWith('//'))?.replace(/^await\s+/, '').replace(/;$/, '') || 'my JavaScript' };
    if (old && old.name !== command.name) {
      const replaceName = code => code.replace(new RegExp(`^(\\s*)${old.name}(?=\\s|$)`, 'gm'), `$1${command.name}`);
      setPrograms(items => {
        const updated = Object.fromEntries(Object.entries(items).map(([key,code]) => [key, typeof code === 'string' ? replaceName(code) : code]));
        updated[levelIndex] = replaceName(source);return updated;
      });
    }
    setDefinitions(next);
  }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen();else await gamePanel.current.requestFullscreen(); }
    catch { setNotice('Your browser does not support full screen here. The jungle is ready to play below.'); }
  }
  async function importProject(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const next = normalizeProject(JSON.parse(await file.text()));
      runner.reset();setDefinitions(next.definitions);setPrograms(next.programs);setCompleted(next.completed);setLevelIndex(next.levelIndex);setVoice(next.voice);setHint(false);setWinDismissed(false);setLabTab('map');setNotice('Project loaded. Your language is ready!');
    } catch (err) { setNotice(err.message); }
    event.target.value='';setProjectMenu(false);
  }
  function showLab() { setModal('lab');setLabTab('javascript'); }
  const isWon = runner.game.won && !winDismissed;
  return <>
    <header className="site-header"><div className="header-inner"><a href="#" className="brand" aria-label="MonkeyScript home" onClick={e => { e.preventDefault();setModal(null); }}><span className="brand-monkey">🐵</span><span>monkeyscript<span className="brand-dot">.</span></span></a>
      <nav aria-label="Main navigation"><button className={!modal || !['help','lab'].includes(modal) ? 'nav-active' : ''} onClick={() => setModal(null)}>Playground</button><button className={modal === 'help' ? 'nav-active' : ''} onClick={() => setModal('help')}>How to play</button><button className={modal === 'lab' ? 'nav-active' : ''} onClick={showLab}>Language Lab</button></nav>
      <div className="header-end"><span className="save-status"><i className={saved ? '' : 'unsaved'} />{saved ? 'Saved on this device' : 'Download to save your work'}</span><div className="project-menu-wrap"><button className="avatar" aria-label="Project options" aria-expanded={projectMenu} onClick={() => setProjectMenu(!projectMenu)}>M</button>{projectMenu ? <div className="project-menu"><strong>Your MonkeyScript project</strong><button onClick={() => { downloadProject(project);setProjectMenu(false); }}><Download size={16}/>Download project</button><button onClick={() => importInput.current.click()}><Upload size={16}/>Load project</button><button className="project-reset-action" onClick={requestProjectReset}><RotateCcw size={16}/>Reset project</button><small>Share a file with your brother.<br/>Your custom language comes along!</small></div> : null}</div></div>
      <input type="file" accept="application/json,.json" ref={importInput} hidden onChange={importProject}/>
    </div></header>
    <main className="app-shell"><section className="intro"><div><h1>Little code. Big adventures.<Sparkles className="heading-sparkle" size={28}/></h1><p>Invent your language. Help Milo find his bananas.</p></div><button className="button explore-button" onClick={() => setModal('levels')}><Grid2X2 size={17}/>Explore levels</button></section>
      <section className="level-ribbon" aria-label="Current level"><span className="level-number">{String(levelIndex+1).padStart(2,'0')}</span><h2>{level.title}</h2><span className="level-subtitle">{level.subtitle}</span><div className="level-progress"><span>Level {levelIndex+1} of {LEVELS.length}</span><div>{LEVELS.map((item,i) => <button key={item.title} aria-label={`Go to level ${i+1}: ${item.title}`} className={completed.includes(i) ? 'complete' : i===levelIndex ? 'current' : ''} onClick={() => changeLevel(i)}/>)}</div></div><div className="level-arrows"><button className="icon-button" disabled={levelIndex===0} aria-label="Previous level" onClick={() => changeLevel(levelIndex-1)}><ChevronLeft size={19}/></button><button className="icon-button" disabled={levelIndex===LEVELS.length-1} aria-label="Next level" onClick={() => changeLevel(levelIndex+1)}><ChevronRight size={19}/></button></div></section>
      <div className="playground-layout"><div className="coding-column"><section className="panel program-panel"><div className="panel-heading"><div><Code2 size={25} className="accent"/><h2>Your MonkeyScript</h2></div><span className="file-name"><FileCode2 size={14}/> main.monkey</span></div>
          <CodeEditor key={projectGeneration} value={source} onChange={updateSource} activeLine={runner.activeLine}/>
          <div className="run-toolbar"><button className="button primary run-button" id="run-code" onClick={() => { setWinDismissed(false);runner.start(); }}><Play size={17} fill="currentColor"/>{runner.status==='paused' ? 'Continue' : runner.status==='running' ? 'Running…' : 'Run code'}</button><button className="button step-button" onClick={() => { setWinDismissed(false);runner.start('step'); }} disabled={runner.status==='running' || runner.status==='stepping'}><StepForward size={18}/>Step</button><button className="icon-button reset-button" aria-label={busy ? 'Stop code' : 'Reset jungle'} onClick={() => { busy ? runner.stop() : runner.reset();setWinDismissed(false); }}>{busy ? <Square size={17}/> : <RotateCcw size={19}/>}</button><label className="speed-select"><span className="sr-only">Run speed</span><select aria-label="Run speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label></div>
          {runner.error ? <div className="run-message error-message" role="alert"><span>Let’s debug it.</span> {runner.error}</div> : runner.status==='finished' ? <div className="run-message">Code finished! Milo has a little farther to go. Add a few more commands.</div> : runner.status==='paused' ? <div className="run-message">Paused at line {runner.activeLine}. Press Step to run the next command.</div> : null}
        </section>
        <LanguageLab key={projectGeneration} definitions={definitions} onSave={saveCommand} open={modal==='lab'} onClose={action => action==='open' ? showLab() : setModal(null)} labTab={labTab} setLabTab={setLabTab}/>
      </div>
      <div className="game-column"><section className={`panel game-panel ${fullscreen ? 'is-fullscreen' : ''}`} ref={gamePanel}><div className="panel-heading"><div><span className="live-dot"/><h2>The jungle</h2></div><div className="game-tools"><button className="button voice-button" aria-label="Choose Milo's voice" onClick={()=>setModal('voice')}><Speech size={15}/>Voice</button><button className="icon-button" aria-label={sound ? 'Mute sound' : 'Enable sound'} onClick={() => setSoundEnabled(!sound)}>{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button><button className="icon-button" aria-label="Expand jungle" onClick={toggleFullscreen}><Maximize size={18}/></button></div></div>
          <div className="jungle-scene"><GameBoard key={projectGeneration} level={level} game={runner.game}/><div className="monkey-speech" aria-live="polite"><span>🐵</span>{runner.game.speech}</div>
            {isWon ? <div className="win-overlay"><button aria-label="Dismiss celebration" className="icon-button dismiss-win" onClick={() => setWinDismissed(true)}><X size={17}/></button><span className="win-banana">🍌</span><h2>Sweet success!</h2><p>A little code. One very happy monkey.</p><button className="button primary" onClick={() => levelIndex<LEVELS.length-1 ? changeLevel(levelIndex+1) : setModal('levels')}>{levelIndex<LEVELS.length-1 ? 'Next adventure' : 'Explore your adventures'}<ArrowRight size={16}/></button></div> : null}
          </div><div className="mission"><span className="banana-icon">🍌</span><div><h3>Mission: {levelIndex===0 ? 'banana run' : level.title.toLowerCase()}</h3><p>{level.mission}</p></div><button className={`button hint-button ${hint ? 'hint-active' : ''}`} onClick={() => setHint(!hint)}><Lightbulb size={17}/>Need a hint?</button></div>{hint ? <div className="hint-content"><Lightbulb size={18}/><div><strong>A little nudge</strong><p>{level.hint}</p></div></div> : null}
        </section><div className="inventor-banner"><Sparkles size={19}/><p><strong>Psst…</strong> you’re not just learning to code. You’re inventing a whole language.</p><Sparkles size={16}/></div>
      </div></div>
      <footer><span>Made for curious minds.<span className="footer-banana"> ✦</span></span><span className="keyboard-hint"><kbd><Command size={11}/> Enter</kbd> to run</span></footer>
    </main>
    {modal==='levels' ? <Modal title="A jungle full of possibilities." wide onClose={() => setModal(null)}><p className="modal-intro">Start small. Get curious. Every adventure adds a new superpower.</p><div className="level-grid">{LEVELS.map((item,i) => <button className={`level-card ${i===levelIndex ? 'level-card-active' : ''}`} key={item.title} onClick={() => changeLevel(i)}><div><span className="level-card-number">{String(i+1).padStart(2,'0')}</span>{completed.includes(i) ? <span className="completed-label"><Check size={14}/>Completed</span> : <span className="level-concept">{item.concept}</span>}</div><h3>{item.title}</h3><p>{item.subtitle}</p><span className="level-card-link">{i===levelIndex ? 'Keep exploring' : 'Let’s play'}<ArrowRight size={15}/></span></button>)}</div></Modal> : null}
    {modal==='help' ? <Modal title="Meet Milo. Make some magic." wide onClose={() => setModal(null)}><p className="modal-intro">Milo follows the stepping stones to the banana. You write the instructions. No programming experience required—just a little curiosity.</p><div className="help-layout"><div><h3>1. Tell Milo what to do</h3><p><code>move 3</code> walks three stones along the path. Turns happen automatically. <code>jump</code> skips the next stone and lands two stones ahead. <code>say "Hello!"</code> gives Milo a voice.</p><h3>2. Run, watch, tinker</h3><p>Press <strong>Run code</strong> to play, or <strong>Step</strong> to follow one instruction at a time. A rock in the way? Jump over it! Reset any time and try again.</p><h3>3. Invent the language</h3><p>Click a command in the map or open <strong>Language Lab</strong>. Edit the real JavaScript behind a word, rename it, or invent one. Add music, a monkey friend, or an entire celebration.</p><button className="button primary" onClick={showLab}>Open Language Lab<ArrowRight size={16}/></button></div><div className="help-code"><h3>Do a little more with less</h3><div><strong>Repeat a pattern</strong><pre>{'repeat 3 {\n  move 1\n  jump\n}'}</pre><strong>Let Milo make a decision</strong><pre>{'if obstacle {\n  jump\n} else {\n  move 1\n}'}</pre></div><p>Put blocks inside blocks. Try <code>path_clear</code> or <code>banana_ahead</code> as a condition. Comments start with <code>#</code>.</p></div></div></Modal> : null}
    {modal==='voice' ? <VoiceSettings voice={voice} onChange={setVoice} sound={sound} running={busy} onEnableSound={()=>setSoundEnabled(true)} onClose={()=>setModal(null)}/> : null}
    {modal==='reset' ? <Modal title="Start a fresh adventure?" onClose={()=>setModal(null)}><p className="modal-intro">This restores all {LEVELS.length} levels to their starter programs, clears completed levels and custom commands, and returns Milo to the start. Your voice, sound, and speed go back to their defaults.</p><div className="reset-backup"><Download size={20}/><div><strong>Keep your inventions</strong><p>Download your project first to keep your custom language and programs. You can load it again any time.</p><button className="button small" onClick={()=>downloadProject(project)}>Download my project<Download size={13}/></button></div></div><p className="fine-print">Your saved project on this device will be replaced by the starter project.</p><div className="modal-actions"><button className="button" onClick={()=>setModal(null)}>Keep my project</button><button className="button reset-confirm" onClick={resetProject}><RotateCcw size={15}/>Reset everything</button></div></Modal> : null}
    {notice ? <div className="toast" role="status">{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15}/></button></div> : null}
  </>;
}
