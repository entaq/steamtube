// These are pitch/speed presets layered on top of the browser's real voices.
// Invent another preset here, or pass an installed voice's name from your code.
export const VOICE_STYLES = [
  {id:'milo',name:'Milo',description:'A friendly jungle explorer',pitch:1.1,rate:1},
  {id:'squeaky',name:'Squeaky',description:'Tiny monkey. Big excitement.',pitch:1.7,rate:1.15},
  {id:'robot',name:'Robot',description:'Slow and low, beep boop',pitch:0.65,rate:0.85},
  {id:'sleepy',name:'Sleepy',description:'Five more minutes…',pitch:0.8,rate:0.7},
];

export function createSpeechPlayer({
  synthesis = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
  clock = globalThis,
} = {}) {
  const supported = Boolean(synthesis && Utterance);
  let enabled = true;
  let active = null;
  function availableVoices() {
    try { return Array.from(synthesis?.getVoices() || []); }
    catch { return []; }
  }
  function listVoices() {
    return availableVoices().map(voice => ({
      id:voice.voiceURI || voice.name, name:voice.name, lang:voice.lang,
      local:voice.localService !== false,
    })).sort((a,b) => Number(/^en/i.test(b.lang))-Number(/^en/i.test(a.lang)) || Number(b.local)-Number(a.local) || a.name.localeCompare(b.name));
  }
  function stop(status = 'cancelled') {
    if (!active) return;
    // Resolve before cancel(), since browsers differ on whether cancel fires an event.
    active.finish(status);
    try { synthesis.cancel(); } catch { /* A failed voice must not block the program. */ }
  }
  function speak(message, requestedVoice = 'default', preferredVoice = 'milo', owner = null) {
    stop();
    if (!enabled) return Promise.resolve({status:'muted'});
    if (!supported) return Promise.resolve({status:'unsupported'});
    const text = String(message ?? '').slice(0,160);
    if (!text.trim()) return Promise.resolve({status:'empty'});
    const requested = String(requestedVoice || 'default');
    const choice = requested.toLowerCase() === 'default' ? String(preferredVoice || 'milo') : requested;
    return new Promise(resolve => {
      let utterance;
      let timer;
      let voiceListener;
      let settled = false;
      let usedFallback = false;
      function clearReadiness() {
        clock.clearTimeout(timer);
        if (voiceListener) synthesis.removeEventListener?.('voiceschanged',voiceListener);
        voiceListener=null;
      }
      const finish = (status,error) => {
        if (settled) return;
        settled = true;
        clearReadiness();
        if (utterance) utterance.onend = utterance.onerror = null;
        if (active?.finish === finish) active = null;
        resolve({status,usedFallback,error});
      };
      active = {finish,owner};
      function begin(voices) {
        if (settled) return;
        clearReadiness();
        const style = VOICE_STYLES.find(item => item.id === choice.toLowerCase());
        const selected = voices.find(voice => voice.voiceURI === choice || voice.name.toLowerCase() === choice.toLowerCase());
        const defaultVoice = voices.find(voice => voice.localService !== false && /^en/i.test(voice.lang) && voice.default)
          || voices.find(voice => voice.localService !== false && /^en/i.test(voice.lang))
          || voices.find(voice => voice.default) || voices[0];
        usedFallback = !style && !selected;
        try {
          utterance = new Utterance(text);
          utterance.voice = selected || defaultVoice || null;
          if (utterance.voice) utterance.lang = utterance.voice.lang;
          utterance.pitch = style?.pitch ?? 1;
          utterance.rate = style?.rate ?? 1;
          // Retain the utterance until completion so engines do not lose callbacks.
          active.utterance = utterance;
          utterance.onend = () => finish('spoken');
          utterance.onerror = event => finish('error',event.error);
          // An OS voice may fail without an end/error event. Always release the runner.
          timer = clock.setTimeout(() => stop('timeout'), Math.min(45000,Math.max(10000,text.length*150/utterance.rate+3000)));
          synthesis.speak(utterance);
        } catch (error) { finish('error',error.message); }
      }
      const voices = availableVoices();
      if (voices.length) begin(voices);
      else {
        // Chrome can populate voices asynchronously on the first page visit.
        voiceListener=()=>{const loaded=availableVoices();if(loaded.length) begin(loaded);};
        synthesis.addEventListener?.('voiceschanged',voiceListener);
        timer=clock.setTimeout(()=>begin(availableVoices()),1200);
        voiceListener();
      }
    });
  }
  return {
    supported,
    speak,
    stop,
    stopFor(owner) { if (active?.owner === owner) stop(); },
    setEnabled(value) { enabled=Boolean(value);if (!enabled) stop('muted'); },
    listVoices,
    subscribeVoices(listener) {
      const update=()=>listener(listVoices());
      synthesis?.addEventListener('voiceschanged',update);
      update();
      return ()=>synthesis?.removeEventListener('voiceschanged',update);
    },
  };
}

export const speechPlayer = createSpeechPlayer();
