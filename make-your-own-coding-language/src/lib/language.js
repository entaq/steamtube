// MonkeyScript is deliberately small: one command per line, plus two kinds of blocks.
// This parser never runs JavaScript from the MonkeyScript editor.
const RESERVED = new Set(['repeat', 'if', 'else', '__proto__', 'constructor', 'prototype']);
export const SENSORS = ['obstacle', 'path_clear', 'banana_ahead'];

// A comma inside a quoted default ("Hello, Milo!") is part of the message.
function splitParameters(text) {
  if (!text.trim()) return [];
  const parameters = [];
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (quote) {
      if (text[i] === '\\') { i++; continue; }
      if (text[i] === quote) quote = null;
    } else if (text[i] === '"' || text[i] === "'") quote = text[i];
    else if (text[i] === ',') { parameters.push(text.slice(start, i).trim()); start = i + 1; }
  }
  parameters.push(text.slice(start).trim());
  return parameters;
}

export function validateCommands(commands) {
  const seen = new Set();
  for (const command of commands) {
    if (!/^[a-zA-Z][\w]*$/.test(command.name)) throw new Error('Use a word for your command name, like dance or super_jump.');
    if (RESERVED.has(command.name)) throw new Error(`${command.name} is a reserved word. Pick another name.`);
    if (seen.has(command.name)) throw new Error(`${command.name} is already a command.`);
    seen.add(command.name);
    const parameters = splitParameters(command.params);
    const names = new Set();
    let optional = false;
    for (const parameter of parameters) {
      const match = parameter.match(/^([a-zA-Z_]\w*)(?:\s*=\s*(-?\d+(?:\.\d+)?|true|false|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))?$/);
      if (!match || names.has(match[1]) || ['monkey', 'await', 'yield', 'arguments', 'eval'].includes(match[1])) throw new Error('Each parameter needs a name, like steps = 1 or message.');
      if (optional && match[2] === undefined) throw new Error('Put required parameters before parameters with defaults.');
      optional ||= match[2] !== undefined;
      names.add(match[1]);
    }
  }
}

function cleanLine(text) {
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    if (quote) {
      if (text[i] === '\\') { i++; continue; }
      if (text[i] === quote) quote = null;
    } else if (text[i] === '"' || text[i] === "'") quote = text[i];
    else if (text[i] === '#' || text.slice(i, i + 2) === '//') return text.slice(0, i).trim();
  }
  return text.trim();
}

function readArguments(text, fail) {
  const args = [];
  let rest = text.trim();
  while (rest) {
    let match;
    if ((match = rest.match(/^"(?:[^"\\]|\\.)*"/))) {
      try { args.push(JSON.parse(match[0])); } catch { fail('Check the quotes around your message.'); }
    } else if ((match = rest.match(/^'(?:[^'\\]|\\.)*'/))) {
      args.push(match[0].slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
    } else if ((match = rest.match(/^-?\d+(?:\.\d+)?(?=\s|,|$)/))) args.push(Number(match[0]));
    else if ((match = rest.match(/^(true|false)(?=\s|,|$)/))) args.push(match[0] === 'true');
    else fail('Use a number or a message in quotes, like move 3 or say "Hello!".');
    rest = rest.slice(match[0].length);
    if (rest && !/^[\s,]/.test(rest)) fail('Put a space between arguments.');
    rest = rest.replace(/^[\s,]+/, '');
  }
  return args;
}

export function parse(source, commands) {
  validateCommands(commands);
  if (source.length > 25000) throw new Error('That is a big adventure! Keep your program under 25,000 characters.');
  const vocabulary = new Map(commands.map(c => [c.name, c]));
  const lines = source.split('\n').flatMap((raw, i) => {
    const text = cleanLine(raw);
    if (/^}\s*else\s*{$/.test(text)) return [{ text: '}', line: i + 1 }, { text: 'else {', line: i + 1 }];
    return text ? [{ text, line: i + 1 }] : [];
  });
  let cursor = 0;
  function block(openingLine = null, depth = 0) {
    if (depth > 10) throw new Error(`Line ${openingLine}: Try fewer nested blocks (10 is plenty!).`);
    const nodes = [];
    while (cursor < lines.length) {
      const { text, line } = lines[cursor++];
      const fail = message => { throw new Error(`Line ${line}: ${message}`); };
      if (text === '}') {
        if (!openingLine) fail('This } needs a matching opening block.');
        return nodes;
      }
      let match;
      if ((match = text.match(/^repeat\s+(\d+)\s*{$/))) {
        const count = Number(match[1]);
        if (count < 1 || count > 100) fail('Choose a repeat count from 1 to 100.');
        nodes.push({ type: 'repeat', count, body: block(line, depth + 1), line });
      } else if ((match = text.match(/^if\s+(\w+)\s*{$/))) {
        if (!SENSORS.includes(match[1])) fail(`Try if obstacle, if path_clear, or if banana_ahead.`);
        const node = { type: 'if', condition: match[1], body: block(line, depth + 1), alternate: [], line };
        if (lines[cursor]?.text === 'else {') { cursor++; node.alternate = block(line, depth + 1); }
        nodes.push(node);
      } else {
        match = text.match(/^([a-zA-Z]\w*)(?:\s+(.*))?$/);
        if (!match || !vocabulary.has(match[1])) fail(`I don't know “${text.split(/\s/)[0]}”. Check the command map below.`);
        const command = vocabulary.get(match[1]);
        const args = readArguments(match[2] || '', fail);
        const params = splitParameters(command.params);
        const required = params.filter(p => !p.includes('=')).length;
        if (args.length < required || args.length > params.length) fail(`${command.name} needs ${required === params.length ? required : `${required}–${params.length}`} argument(s).`);
        nodes.push({ type: 'command', name: match[1], args, line });
      }
    }
    if (openingLine) throw new Error(`Line ${openingLine}: Add a closing } to finish this block.`);
    return nodes;
  }
  return block();
}

export function compile(nodes, depth = 0) {
  const indent = '  '.repeat(depth);
  return nodes.map(node => {
    const tick = `${indent}await tick(${node.line});\n`;
    if (node.type === 'command') return tick + `${indent}await commands[${JSON.stringify(node.name)}](${node.args.map(a => JSON.stringify(a)).join(', ')});`;
    if (node.type === 'repeat') return tick + `${indent}for (let i${depth} = 0; i${depth} < ${node.count}; i${depth}++) {\n${compile(node.body, depth + 1)}\n${indent}}`;
    return tick + `${indent}if (await monkey.${node.condition}()) {\n${compile(node.body, depth + 1)}\n${indent}}${node.alternate.length ? ` else {\n${compile(node.alternate, depth + 1)}\n${indent}}` : ''}`;
  }).join('\n');
}
