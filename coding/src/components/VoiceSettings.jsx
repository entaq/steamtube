import { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';
import Modal from './Modal';
import { speechPlayer, VOICE_STYLES } from '../lib/speech.js';

export default function VoiceSettings({ voice, onChange, sound, running, onEnableSound, onClose }) {
  const previewOwner=useRef(Symbol('voice preview'));
  const [voices,setVoices] = useState(()=>speechPlayer.listVoices());
  const [preview,setPreview] = useState('Hello! I’m Milo. Let’s find some bananas!');
  const [playing,setPlaying] = useState(false);
  const [message,setMessage] = useState('');
  useEffect(()=>speechPlayer.subscribeVoices(setVoices),[]);
  useEffect(()=>{const owner=previewOwner.current;return ()=>speechPlayer.stopFor(owner);},[]);
  const style=VOICE_STYLES.find(item=>item.id===voice);
  const installed=voices.find(item=>item.id===voice);
  const missing=!style && !installed;
  // Voice names can contain quotes. JSON quoting keeps the example valid MonkeyScript.
  const example=`say "Banana time!" ${JSON.stringify(style?.id || installed?.name || voice)}`;
  async function tryVoice() {
    setPlaying(true);setMessage('');
    const result=await speechPlayer.speak(preview,voice,'milo',previewOwner.current);
    setPlaying(false);
    if (result.status==='spoken') setMessage(result.usedFallback ? 'That voice is not on this device, so Milo used a default voice.' : 'That’s Milo! Try another voice, or use it in your code.');
    else if (result.status==='muted') setMessage('Sound is muted. Turn it on to hear Milo.');
    else if (['error','unsupported','timeout'].includes(result.status)) setMessage('This browser could not play that voice. Try another one, or open MonkeyScript in Chrome.');
  }
  function change(value) { speechPlayer.stopFor(previewOwner.current);setMessage('');onChange(value); }
  return <Modal title="Give Milo a voice." onClose={onClose}>
    <p className="modal-intro">A squeaky explorer? A sleepy banana fan? Pick a voice, then hear your code come to life.</p>
    <label className="field-label">Milo’s voice<select className="voice-select" aria-label="Milo's voice" value={voice} onChange={event=>change(event.target.value)} disabled={!speechPlayer.supported}>
      <optgroup label="Playful voices">{VOICE_STYLES.map(item=><option key={item.id} value={item.id}>{item.name} — {item.description}</option>)}</optgroup>
      {voices.length ? <optgroup label="Voices from your browser">{voices.map(item=><option value={item.id} key={item.id}>{item.name} · {item.lang}{item.local ? '' : ' · online'}</option>)}</optgroup> : null}
      {missing ? <option value={voice}>{voice} (not on this device)</option> : null}
    </select></label>
    <p className="voice-detail">{style ? 'Playful voices use different pitch and speed with an available browser voice.' : installed ? `${installed.name} speaks ${installed.lang}. ${installed.local ? 'This voice runs on your device.' : 'This browser voice uses an online service.'}` : 'This voice will fall back to the browser’s default on this device.'}</p>
    <label className="field-label voice-preview-label">Something to say<input aria-label="Voice preview message" value={preview} maxLength={160} onChange={event=>setPreview(event.target.value)} /></label>
    <div className="voice-preview-actions"><button className="button primary" disabled={!speechPlayer.supported || !preview.trim() || !sound || running} onClick={()=>playing ? speechPlayer.stopFor(previewOwner.current) : tryVoice()}>{playing ? <Square size={14}/> : <Play size={14} fill="currentColor"/>}{playing ? 'Stop preview' : 'Try voice'}</button>{!sound ? <button className="button" onClick={onEnableSound}><Volume2 size={15}/>Turn sound on</button> : null}<span aria-live="polite">{running ? 'You can preview a voice when your program is stopped.' : playing ? 'Milo is speaking…' : message}</span></div>
    <div className="voice-code-example"><strong>Let your code choose</strong><pre>{example}</pre><p>Leave out the voice to use your pick above. Try <code>"milo"</code>, <code>"squeaky"</code>, <code>"robot"</code>, <code>"sleepy"</code>, or a voice name from the list.</p></div>
    <p className="fine-print">Powered by your browser’s built-in speech. No API key needed. Available voices depend on your browser and device.</p>
    {!speechPlayer.supported ? <p className="inline-error" role="status">Speech is not available in this browser. Messages will still appear in Milo’s bubble. Open the app in Chrome to try spoken voices.</p> : null}
    <div className="modal-actions"><button className="button" onClick={onClose}>Back to the jungle<Volume2 size={15}/></button></div>
  </Modal>;
}
