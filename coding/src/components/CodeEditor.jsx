import { useRef } from 'react';

function Highlight({ code, javascript }) {
  const expression = /(#.*$|\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+\b|\b(?:repeat|if|else|await|async|function|for|let|const|return|true|false)\b|\b[a-zA-Z_]\w*(?=\s*\())/gm;
  const chunks = [];
  let previous = 0;
  for (const match of code.matchAll(expression)) {
    chunks.push(code.slice(previous, match.index));
    const word = match[0];
    const kind = word.startsWith('#') || word.startsWith('//') ? 'comment' : /^["']/.test(word) ? 'string' : /^\d/.test(word) ? 'number' : /^(repeat|if|else|await|async|function|for|let|const|return|true|false)$/.test(word) ? 'keyword' : 'function';
    chunks.push(<span className={`syntax-${kind}`} key={match.index}>{word}</span>);
    previous = match.index + word.length;
  }
  chunks.push(code.slice(previous));
  if (!javascript) {
    // Command names get the same accent as the language's control words.
    return <>{chunks}</>;
  }
  return <>{chunks}</>;
}

export default function CodeEditor({ value, onChange, label = 'MonkeyScript editor', activeLine, javascript = false, readOnly = false, className = '' }) {
  const pre = useRef(null);
  const gutter = useRef(null);
  const area = useRef(null);
  const lines = Math.max(7, value.split('\n').length);
  function onKeyDown(event) {
    if (readOnly) return;
    const element = event.currentTarget;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    if (event.key === 'Tab') {
      event.preventDefault();
      onChange(value.slice(0, start) + '  ' + value.slice(end));
      requestAnimationFrame(() => { element.selectionStart = element.selectionEnd = start + 2; });
    } else if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      const currentLine = value.slice(0, start).split('\n').at(-1);
      const indentation = currentLine.match(/^\s*/)[0] + (currentLine.trimEnd().endsWith('{') ? '  ' : '');
      const insertion = '\n' + indentation;
      onChange(value.slice(0, start) + insertion + value.slice(end));
      requestAnimationFrame(() => { element.selectionStart = element.selectionEnd = start + insertion.length; });
    }
  }
  return <div className={`code-editor ${className}`}>
    <div className="line-gutter" ref={gutter} aria-hidden="true">{Array.from({ length: lines }, (_, i) => <div className={activeLine === i + 1 ? 'active-line-number' : ''} key={i}>{i + 1}</div>)}</div>
    <div className="code-input-wrap">
      {activeLine ? <div className="execution-line" style={{ top: `calc(15px + ${activeLine - 1} * var(--code-line-height, 28px) - ${area.current?.scrollTop || 0}px)` }} /> : null}
      <pre ref={pre} aria-hidden="true"><Highlight code={value + '\n'} javascript={javascript} /></pre>
      <textarea ref={area} aria-label={label} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoCapitalize="off" autoCorrect="off" readOnly={readOnly} onScroll={e => {
        if (pre.current) { pre.current.scrollTop = e.currentTarget.scrollTop; pre.current.scrollLeft = e.currentTarget.scrollLeft; }
        if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
      }} />
    </div>
  </div>;
}
