#!/usr/bin/env node
// Canonical formatter for the plain code blocks in the playground "how to"
// implementation guides.
//
// Usage (from anywhere in the repo):
//   node packages/playground/scripts/format-guide-blocks.mjs            # dry run
//   node packages/playground/scripts/format-guide-blocks.mjs --write    # apply
//   node packages/playground/scripts/format-guide-blocks.mjs <files…>   # target files
//   node packages/playground/scripts/format-guide-blocks.mjs --comment-tags [--write]
//                                                              # escape raw <tag> inside // and /* */ comments
//   node packages/playground/scripts/format-guide-blocks.mjs --class '*'
//
// What it does
//   Every <CodeBlock class="guide-code-block" lang="vue" code="…"> static
//   code attribute on the example pages is rewritten with canonical layout:
//
//   * markup tags with up to 3 attributes stay on ONE line; tags with more
//     attributes get one attribute per line and `>`/`/>` on its own line.
//   * multi-line attribute values keep their interior alignment.
//   * children/close tags are re-indented from element depth; authored
//     single-line inline runs (text + inline elements) stay on one line.
//   * CSS rules get exactly one declaration per line; comments keep their
//     position (glued after a declaration's `;` or after `}` when authored
//     there, otherwise on their own line).
//   * TS/JS snippets are only trailing-whitespace trimmed.
//
// Why entity handling matters
//   The static `code="…"` attribute is read by the vite highlight plugin
//   (lib/highlight.ts), which entity-decodes it once and feeds the result to
//   shiki. To keep the displayed text identical, the new content is
//   re-encoded with the same scheme: & -> &amp;, < -> &lt;, " -> &quot;,
//   NBSP -> &nbsp;. Blank source lines are preserved as empty lines and
//   render at full height (CodeBlock reserves empty `.line` rows).
//
// Integrity guard
//   Each rewritten block must be identical to the source modulo whitespace
//   (stripWs equality); otherwise the block is reported and left untouched.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const playgroundRoot = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);
const { parse, transform } = require('@vue/compiler-dom');

const DEFAULT_CLASS = 'guide-code-block';

function encodeAttr(plain) {
  let out = '';
  for (const ch of plain) {
    if (ch === '&') {
      out += '&amp;';
    } else if (ch === '<') {
      out += '&lt;';
    } else if (ch === '"') {
      out += '&quot;';
    } else if (ch === '\u00A0') {
      out += '&nbsp;';
    } else { out += ch; }
  }
  return out;
}

const stripWs = (s) => s.replace(/\s+/g, '');
// Fix swallowed code tags inside `//` line comments and `/* */` block comments.
// A raw `<tag>` inside such a comment is parsed as real markup once the
// pipeline's double decode runs, so the browser hides it (e.g. `// one
// virtualized <tr>.` renders as `// one virtualized .`). Turning the `<` into
// the literal text `&lt;` keeps it visible. Only `<` that starts a tag-like
// sequence is converted; template `<!-- -->` comments are already escaped.
function escapeCommentTags(src) {
  const out = [];
  let mode = 'code'; // 'code' | 'line' | 'block' | 'string'
  let q = '';
  let i = 0;
  const n = src.length;
  const tagStart = (c) => /[a-z/!?]/i.test(c);
  while (i < n) {
    const c = src[ i ];
    if (mode === 'code') {
      if (c === '/' && src[ i + 1 ] === '/') {
        mode = 'line';
        out.push('//');
        i += 2;
      } else if (c === '/' && src[ i + 1 ] === '*') {
        mode = 'block';
        out.push('/*');
        i += 2;
      } else if (c === '"' || c === "'" || c === '`') {
        mode = 'string';
        q = c;
        out.push(c);
        i++;
      } else {
        out.push(c);
        i++;
      }
    } else if (mode === 'line') {
      if (c === '\n') {
        mode = 'code';
        out.push(c);
      } else if (c === '<' && tagStart(src[ i + 1 ] ?? '')) {
        out.push('&lt;');
      } else {
        out.push(c);
      }
      i++;
    } else if (mode === 'block') {
      if (c === '*' && src[ i + 1 ] === '/') {
        mode = 'code';
        out.push('*/');
        i += 2;
      } else if (c === '<' && tagStart(src[ i + 1 ] ?? '')) {
        out.push('&lt;');
        i++;
      } else {
        out.push(c);
        i++;
      }
    } else if (mode === 'string') {
      if (c === '\\') {
        out.push(c, src[ i + 1 ] ?? '');
        i += 2;
      } else if (c === q) {
        mode = 'code';
        out.push(c);
        i++;
      } else if (q === '`' && c === '$' && src[ i + 1 ] === '{') {
        // ${ } interpolation is real code (may itself contain comments); keep
        // it simple here - guide snippets don't nest comments inside these.
        out.push(c, '{');
        i += 2;
        mode = 'code';
      } else {
        out.push(c);
        i++;
      }
    }
  }
  return out.join('');
}

function formatCss(css) {
  const lineOf = lineIndex(css);
  const n = css.length;
  const out = [];
  const pushBlankIf = (hadBlank) => {
    if (hadBlank) {
      out.push('');
    }
  };

  let i = 0;
  while (i < n) {
    let newlines = 0;
    while (i < n && /[ \t\r\n]/.test(css[ i ])) {
      if (css[ i ] === '\n') {
        newlines++;
      }
      i++;
    }
    const hadBlank = newlines >= 2;
    if (i >= n) {
      break;
    }

    if (css.startsWith('/*', i)) {
      const e = css.indexOf('*/', i + 2);
      pushBlankIf(hadBlank);
      for (const l of css.slice(i, e + 2).split('\n')) {
        out.push(l.replace(/[ \t]+$/, ''));
      }
      i = e + 2;
      continue;
    }

    // rule header up to '{'
    const headerStart = i;
    let brace = -1;
    let k = i;
    while (k < n) {
      if (css.startsWith('/*', k)) {
        k = css.indexOf('*/', k + 2) + 2;
        continue;
      }
      if (css[ k ] === '{') {
        brace = k;
        break;
      }
      k++;
    }
    if (brace === -1) {
      out.push(css.slice(headerStart).trim());
      break;
    }

    let depth = 0;
    let close = -1;
    let p = brace;
    while (p < n) {
      if (css.startsWith('/*', p)) {
        p = css.indexOf('*/', p + 2) + 2;
        continue;
      }
      if (css[ p ] === '{') {
        depth++;
      } else if (css[ p ] === '}') {
        depth--;
        if (depth === 0) {
          close = p;
          break;
        }
      }
      p++;
    }
    if (close === -1) {
      out.push(css.slice(headerStart).trim());
      break;
    }
    const closeLine = lineOf(close);
    pushBlankIf(hadBlank);

    // header lines
    const headerLines = css.slice(headerStart, brace).split('\n').map((l) => l.replace(/[ \t]+/g, ' ').replace(/^ /, '').replace(/[ \t]+$/, ''));
    const hh = headerLines.filter((l, idx) => (idx === 0 ? true : l.trim() !== ''));
    for (let li = 0; li < hh.length; li++) {
      const line = hh[ li ].trimEnd();
      if (li === hh.length - 1) {
        out.push(line.endsWith('{') ? line : `${ line } {`);
      } else { out.push(line); }
    }

    // body items
    const bodyItems = lexBody(css.slice(brace + 1, close), brace + 1, lineOf);
    for (const it of bodyItems) {
      if (it.type === 'comment') {
        for (const l of it.text.split('\n')) {
          out.push(`  ${ l.replace(/[ \t]+$/, '') }`);
        }
        continue;
      }
      const declLines = it.text.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim());
      for (let di = 0; di < declLines.length; di++) {
        const t = declLines[ di ];
        if (!t) {
          continue;
        }
        let line = (di === 0 ? '  ' : '    ') + t;
        if (di === declLines.length - 1) {
          line += ';';
        }
        out.push(line);
      }
      if (it.glued) {
        out[ out.length - 1 ] += ` ${ it.glued }`;
      }
    }

    // close + glued comment
    let after = close + 1;
    let s = after;
    while (s < n && css[ s ] === ' ') {
      s++;
    }
    let glued = '';
    if (s < n && css.startsWith('/*', s) && lineOf(s) === closeLine) {
      const e = css.indexOf('*/', s + 2);
      glued = ` ${ css.slice(s, e + 2) }`;
      after = e + 2;
    }
    out.push(`}${ glued }`);
    i = after;
  }

  const res = [];
  let prevBlank = false;
  for (const l of out) {
    if (l === '') {
      if (!prevBlank) {
        res.push('');
      }
      prevBlank = true;
    } else {
      res.push(l);
      prevBlank = false;
    }
  }
  while (res.length && res[ res.length - 1 ] === '') {
    res.pop();
  }
  return res.join('\n');
}

function lexBody(body, base, lineOf) {
  const items = [];
  const n = body.length;
  let declStart = -1;
  let declBuf = '';
  const flush = () => {
    if (declBuf.trim() !== '') {
      items.push({ type: 'decl', text: declBuf.replace(/\s+$/g, '') });
    }
    declStart = -1;
    declBuf = '';
  };

  let i = 0;
  while (i < n) {
    const abs = base + i;
    const c = body[ i ];
    if (c === ';') {
      flush();
      i++;
      // skip spaces; check same-line comment glue
      let j = i;
      while (j < n && body[ j ] === ' ') {
        j++;
      }
      if (j < n && body.startsWith('/*', j) && lineOf(base + j) === lineOf(abs)) {
        const e = body.indexOf('*/', j + 2);
        const comment = body.slice(j, e + 2);
        // attach to the just-flushed decl (last decl item)
        const last = items[ items.length - 1 ];
        if (last && last.type === 'decl') {
          last.glued = comment;
        } else { items.push({ type: 'comment', text: comment }); }
        i = e + 2;
        // any further same-line comments would be unusual; loop continues
        continue;
      }
      continue;
    }
    if (body.startsWith('/*', i)) {
      const e = body.indexOf('*/', i + 2);
      if (declBuf.trim() !== '') {
        // comment inside a declaration value - keep inline
        declBuf += ` ${ body.slice(i, e + 2).replace(/\s+/g, ' ').trim() } `;
      } else {
        flush();
        items.push({ type: 'comment', text: body.slice(i, e + 2) });
      }
      i = e + 2;
      continue;
    }
    if (c === '\n') {
      if (declBuf.trim() !== '') {
        declBuf += '\n';
      }
      i++;
      continue;
    }
    if (c === ' ' || c === '\t') {
      // single space separator within decl (collapse later)
      if (declBuf.trim() !== '' && !declBuf.endsWith('\n') && !declBuf.endsWith(' ')) {
        declBuf += ' ';
      }
      i++;
      continue;
    }
    if (declStart === -1) {
      declStart = abs;
    }
    // ensure no leading space
    if (declBuf.endsWith(' ') && declBuf.trim() === '') {
      declBuf = '';
    }
    declBuf += c;
    i++;
  }
  flush();
  return items;
}

const VOID = new Set([ 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr' ]);

const nameRe = /^[a-z][\w.:-]*/i;

function normInlineWs(s) {
  return s.replace(/[ \t\r\n]+/g, ' ');
}

function lineIndex(src) {
  const offs = [ 0 ];
  for (let i = 0; i < src.length; i++) {
    if (src[ i ] === '\n') {
      offs.push(i + 1);
    }
  }
  return (idx) => {
    let lo = 0;
    let hi = offs.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (offs[ mid ] <= idx) {
        lo = mid + 1;
      } else { hi = mid; }
    }
    return lo; // 1-based
  };
}

// ---------------- lexer ----------------
// Literal comments (`&lt;!-- ... -->`) are code TEXT, but their bodies may
// contain raw `<tag>` markup characters that must not be parsed as tags.
// Protect those ranges before lexing.
function literalCommentRegions(text) {
  const regions = [];
  const re = /^[ \t]*&lt;!--/gm;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const start = m.index;
    const close = text.indexOf('-->', start);
    if (close === -1) {
      continue;
    }
    regions.push([ start, close + 3 ]);
  }
  return regions;
}

function lexMarkup(text, L) {
  const toks = [];
  const n = text.length;
  const regions = literalCommentRegions(text);
  let regIdx = 0;
  let i = 0;
  while (i < n) {
    // skip a protected literal-comment region wholesale
    if (regIdx < regions.length && regions[ regIdx ][ 1 ] <= i) {
      regIdx++;
    }
    if (regIdx < regions.length && i >= regions[ regIdx ][ 0 ] && i < regions[ regIdx ][ 1 ]) {
      const end = regions[ regIdx ][ 1 ];
      toks.push({ type: 'text', text: text.slice(i, end), start: i, end, line: L(i) });
      i = end;
      continue;
    }
    const c = text[ i ];
    if (c === '<') {
      if (text.startsWith('<!--', i)) {
        const e = text.indexOf('-->', i + 4);
        const end = e === -1 ? n : e + 3;
        toks.push({ type: 'text', text: text.slice(i, end), start: i, end, line: L(i) });
        i = end;
        continue;
      }
      if (text.startsWith('</', i)) {
        const nm = text.slice(i + 2).match(nameRe);
        if (nm) {
          let j = i + 2 + nm[ 0 ].length;
          while (j < n && text[ j ] !== '>') {
            j++;
          }
          const end = Math.min(j + 1, n);
          toks.push({ type: 'close', name: nm[ 0 ], start: i, end, line: L(i) });
          i = end;
          continue;
        }
      }
      const open = lexOpenTag(text, i, L);
      if (open) {
        toks.push(open);
        i = open.end;
        continue;
      }
      toks.push({ type: 'text', text: '<', start: i, end: i + 1, line: L(i) });
      i++;
      continue;
    }
    if (c === '{' && text.startsWith('{{', i)) {
      let j = text.indexOf('}}', i + 2);
      if (j === -1) {
        j = n;
      } else { j += 2; }
      toks.push({ type: 'text', text: text.slice(i, j), start: i, end: j, line: L(i) });
      i = j;
      continue;
    }
    let j = i;
    while (j < n && text[ j ] !== '<' && !(text[ j ] === '{' && text.startsWith('{{', j))
      && !(regIdx < regions.length && j === regions[ regIdx ][ 0 ])) {
      j++;
    }
    if (j > i) {
      toks.push({ type: 'text', text: text.slice(i, j), start: i, end: j, line: L(i) });
    }
    i = j;
  }
  return toks;
}

function lexOpenTag(text, start, L) {
  const n = text.length;
  let i = start + 1;
  const nm = text.slice(i).match(nameRe);
  if (!nm) {
    return null;
  }
  const name = nm[ 0 ];
  i += name.length;
  const attrs = [];
  let selfClose = false;
  let j;
  while (i < n) {
    while (i < n && /[ \t\r\n]/.test(text[ i ])) {
      i++;
    }
    if (i >= n) {
      break;
    }
    const ch = text[ i ];
    if (ch === '>') {
      i++;
      return { type: 'open', name, attrs, selfClose, voidTag: VOID.has(name), start, end: i, line: L(start) };
    }
    if (ch === '/' && text[ i + 1 ] === '>') {
      selfClose = true;
      i += 2;
      return { type: 'open', name, attrs, selfClose, voidTag: VOID.has(name), start, end: i, line: L(start) };
    }
    j = i;
    while (j < n && !/[\s=/>]/.test(text[ j ])) {
      j++;
    }
    const aName = text.slice(i, j);
    i = j;
    while (i < n && /[ \t\r\n]/.test(text[ i ])) {
      i++;
    }
    let value = null;
    if (i < n && text[ i ] === '=') {
      i++;
      while (i < n && /[ \t\r\n]/.test(text[ i ])) {
        i++;
      }
      const q = text[ i ];
      if (q === '"' || q === "'") {
        const close = text.indexOf(q, i + 1);
        const inner = text.slice(i + 1, close === -1 ? n : close);
        value = { quote: q, inner };
        i = (close === -1 ? n : close) + 1;
      } else {
        let k = i;
        while (k < n && !/[\s>]/.test(text[ k ])) {
          k++;
        }
        value = { quote: null, inner: text.slice(i, k) };
        i = k;
      }
    }
    attrs.push({ name: aName, value });
  }
  return null; // unterminated tag
}

// ---------------- tree ----------------
function buildTree(toks) {
  const root = { type: 'fragment', children: [] };
  const stack = [ root ];
  for (const t of toks) {
    if (t.type === 'open') {
      const node = {
        type: 'elem',
        name: t.name,
        attrs: t.attrs,
        selfClose: t.selfClose,
        voidTag: t.voidTag,
        children: [],
        start: t.start,
        end: t.end,
        line: t.line,
      };
      stack[ stack.length - 1 ].children.push(node);
      if (!t.selfClose && !t.voidTag) {
        stack.push(node);
      }
    } else if (t.type === 'close') {
      for (let s = stack.length - 1; s >= 1; s--) {
        if (stack[ s ].name === t.name) {
          stack[ s ].end = t.end;
          stack[ s ].endLine = t.line;
          stack.length = s;
          break;
        }
      }
    } else {
      stack[ stack.length - 1 ].children.push({ type: 'text', text: t.text, line: t.line, start: t.start, end: t.end });
    }
  }
  // merge adjacent text children (content + interpolation pieces belong
  // together); whitespace-only tokens between elements stay separate so the
  // writer can count blank lines between block children.
  (function mergeText(nodes) {
    for (const nd of nodes) {
      if (!nd.children) {
        continue;
      }
      const merged = [];
      for (const c of nd.children) {
        const last = merged[ merged.length - 1 ];
        if (c.type === 'text' && last && last.type === 'text') {
          last.text += c.text;
          last.end = c.end;
        } else {
          merged.push(c);
        }
      }
      nd.children = merged;
      mergeText(nd.children);
    }
  })([ root ]);
  return root;
}

// ---------------- writer ----------------
function formatMarkup(text) {
  const L = lineIndex(text);
  const toks = lexMarkup(text, L);
  const tree = buildTree(toks);

  // annotate endLine for elems left open (EOF) or self-closing
  (function annotate(nodes) {
    for (const nd of nodes) {
      if (nd.type === 'elem') {
        if (nd.endLine === undefined) {
          nd.endLine = L(Math.max(nd.start, nd.end - 1));
        }
        if (nd.children.length) {
          annotate(nd.children);
        }
      }
    }
  })(tree.children);

  const out = [];

  // ---- attr helpers ----
  const attrML = (a) => !!a.value && a.value.inner.includes('\n');

  // value may contain characters needing HTML escaping for display? NO: attr
  // content is code text; single quotes/`>` fine as-is. Only the SOURCE attr
  // gets escaped later by encodeAttr.
  const renderAttrSingle = (a) => (a.value ? `${ a.name }="${ a.value.inner }"` : a.name);

  // opening-tag "first line" when tag is inline-capable
  function openTagOneLine(node) {
    const parts = node.attrs.map(renderAttrSingle);
    const close = node.selfClose || node.voidTag ? ' />' : '>';
    return `<${ node.name }${ parts.length ? ` ${ parts.join(' ') }` : '' }${ close }`;
  }

  // Emit opening-tag lines for a block element; returns nothing (pushes lines)
  function emitOpenLines(node, depth) {
    const ind = '  '.repeat(depth);
    const ind1 = '  '.repeat(depth + 1);
    const ind2 = '  '.repeat(depth + 2);
    const closes = node.selfClose || node.voidTag;
    if (node.attrs.length <= 3 && !node.attrs.some(attrML)) {
      out.push(ind + openTagOneLine(node));
      return;
    }
    out.push(`${ ind }<${ node.name }`);
    for (const a of node.attrs) {
      if (!attrML(a)) {
        out.push(ind1 + renderAttrSingle(a));
        continue;
      }
      // multi-line value: split inner on newlines
      const inner = a.value.inner;
      const lines = inner.split('\n');
      const leadWs = (l) => (l.match(/^[ \t]*/) || [ '' ])[ 0 ].length;
      const first = lines[ 0 ];
      const last = lines[ lines.length - 1 ];
      const mid = lines.slice(1, -1);
      const baseWs = mid.length ? leadWs(mid[ 0 ]) : leadWs(first) + 2;
      // name line: name=" + first (usually '{')
      out.push(`${ ind1 }${ a.name }="${ first.trimEnd() }`);
      for (const ml of mid) {
        out.push(ind2 + ' '.repeat(Math.max(0, leadWs(ml) - baseWs)) + ml.trim().replace(/[ \t]+$/, ''));
      }
      // closing: last + '"'
      const closeExtra = mid.length ? Math.max(0, leadWs(last) - baseWs) : 0;
      out.push(`${ ind1 + ' '.repeat(closeExtra) + last.trim() }"`);
    }
    out.push(ind + (closes ? '/>' : '>'));
  }

  // can a node render fully inline?
  function canInline(node) {
    if (node.attrs.length > 3 || node.attrs.some(attrML)) {
      return false;
    }
    const span = text.slice(node.start, node.end);
    if (span.includes('\n')) {
      return false;
    }
    for (const c of node.children) {
      if (c.type === 'elem') {
        if (!canInline(c)) {
          return false;
        }
      }
    }
    return true;
  }

  // inline chain as one string for output; returns {str} or null if not possible
  function inlineRender(node) {
    if (!canInline(node)) {
      return null;
    }
    let body = '';
    for (const c of node.children) {
      if (c.type === 'text') {
        body += normInlineWs(c.text);
      } else {
        const r = inlineRender(c);
        if (r === null) {
          return null;
        }
        body += r;
      }
    }
    const attrTxt = node.attrs.map(renderAttrSingle).join(' ');
    const close = node.selfClose || node.voidTag ? ' />' : '>';
    const open = `<${ node.name }${ attrTxt ? ` ${ attrTxt }` : '' }${ close }`;
    if (node.selfClose || node.voidTag) {
      return open;
    }
    // normalize trailing/leading whitespace of the whole body and collapse
    body = body.replace(/[ \t\r\n]+/g, ' ').replace(/^ | $/g, '');
    return `${ open + (body || '') }</${ node.name }>`;
  }

  // ---- node emission ----
  // Joining rules: a child can be appended to the previous output line when
  // no blank/newline separates it from the previous sibling AND the previous
  // sibling did not itself end with a newline. Text children that contain
  // internal newlines (multi-line comment literals etc.) always start lines.
  function emitNode(node, depth, join, sep) {
    const ind = '  '.repeat(depth);
    if (node.type === 'text') {
      emitText(node, depth, join, sep);
      return;
    }
    const inlineRenderable = (node.selfClose || node.voidTag || canInline(node));
    if (inlineRenderable && !(node.attrs.length > 3 || node.attrs.some(attrML))) {
      const r = node.selfClose || node.voidTag ? openTagOneLine(node) : inlineRender(node);
      if (join && out.length && out[ out.length - 1 ] !== '') {
        out[ out.length - 1 ] += sep + r;
      } else { out.push(ind + r); }
      return;
    }
    emitOpenLines(node, depth);
    if (!node.selfClose && !node.voidTag) {
      emitChildren(node.children, depth + 1);
      out.push(`${ ind }</${ node.name }>`);
    }
  }

  function emitText(node, depth, join, sep) {
    const ind = '  '.repeat(depth);
    const t = node.text;
    if (t.trim() === '') {
      if (t.includes('\u00A0')) {
        for (const l of t.split('\n')) {
          out.push(l.replace(/[ \t\r\n]/g, ''));
        }
      }
      return;
    }
    const lines = t.split('\n');
    const leadWs = (l) => (l.match(/^[ \t]*/) || [ '' ])[ 0 ].length;
    const firstContent = lines.findIndex((l) => l.trim() !== '');
    if (firstContent === -1) {
      return;
    }
    const baseIndent = leadWs(lines[ firstContent ]);
    const contentLineCount = lines.filter((l) => l.trim() !== '').length;
    if (contentLineCount === 1 && join && out.length && out[ out.length - 1 ] !== '') {
      const content = lines[ firstContent ].trim().replace(/[ \t]+/g, ' ');
      out[ out.length - 1 ] += sep + content;
      return;
    }
    // leading whitespace-only lines translate to blank lines (minus one for
    // the line break that carries the content)
    if (firstContent > 0) {
      const blanks = firstContent - 1;
      for (let b = 0; b < Math.min(blanks, 2); b++) {
        out.push('');
      }
    }
    lines.forEach((l, idx) => {
      if (l.trim() === '') {
        if (idx > firstContent && idx < lines.length - 1) {
          out.push('');
        }
        return;
      }
      if (idx === firstContent) {
        out.push(ind + l.trimStart().replace(/[ \t]+$/, ''));
      } else {
        const extra = Math.max(0, leadWs(l) - baseIndent);
        out.push(ind + ' '.repeat(extra) + l.trimStart().replace(/[ \t]+$/, ''));
      }
    });
  }

  function emitChildren(children, depth) {
    const items = children.map((c) => ({ c, blanks: 0 }));
    for (let i = 0; i < items.length; i++) {
      const c = items[ i ].c;
      if (c.type === 'text' && c.text.trim() === '' && !c.text.includes('\u00A0')) {
        const nl = (c.text.match(/\n/g) || []).length;
        if (nl > 1) {
          for (let k = i + 1; k < items.length; k++) {
            const kc = items[ k ].c;
            if (!(kc.type === 'text' && kc.text.trim() === '' && !kc.text.includes('\u00A0'))) {
              items[ k ].blanks = (items[ k ].blanks ?? 0) + nl - 1;
              break;
            }
          }
        }
      }
    }

    let pendingGap = '';
    let prevRaw = null; // raw text of the last emitted token ('' for elements)
    for (let i = 0; i < items.length; i++) {
      const { c } = items[ i ];
      const blanks = items[ i ].blanks;
      if (c.type === 'text' && c.text.trim() === '' && !c.text.includes('\u00A0')) {
        pendingGap += c.text;
        continue;
      }
      const gapBreaks = blanks > 0 || pendingGap.includes('\n')
        || (prevRaw !== null && /\n[ \t]*$/.test(prevRaw));
      const sep = /[ \t]/.test(pendingGap)
        || (prevRaw !== null && /[ \t]+$/.test(prevRaw) && !/\n[ \t]*$/.test(prevRaw))
        ? ' '
        : '';
      if (blanks > 0) {
        for (let b = 0; b < Math.min(blanks, 2); b++) {
          out.push('');
        }
      }
      if (c.type === 'text' && c.text.trim() === '') {
        // NBSP spacer: standalone visible blank line
        if (c.text.includes('\u00A0')) {
          for (const l of c.text.split('\n')) {
            out.push(l.replace(/[ \t\r\n]/g, ''));
          }
          prevRaw = '\n';
        }
        pendingGap = '';
        continue;
      }
      const join = !gapBreaks && out.length > 0 && out[ out.length - 1 ] !== '';
      const startsNewLine = c.type === 'text' && /^\n/.test(c.text);
      emitNode(c, depth, join && !startsNewLine, sep);
      prevRaw = c.type === 'text' ? c.text : '';
      pendingGap = '';
    }
  }

  emitChildren(tree.children, 0);
  return out.join('\n');
}

// ---------------- full vue-sample formatting ----------------
// Handles: free TS prelude, <script>/<style> raw regions (style bodies run
// through the css formatter), markup regions (templates & fragments).
function formatVueBlock(p1, formatCssFn) {
  const lines = p1.split('\n');
  const out = [];
  // classify regions
  const isCloseScript = (t) => /^<\/script\s*>/.test(t);
  const isCloseStyle = (t) => /^<\/style\s*>/.test(t);
  const isOpenScript = (t) => /^<script\b/.test(t);
  const isOpenStyle = (t) => /^<style\b/.test(t);
  const blankish = (l) => l.trim() === '' || /^[\u00A0 ]+$/.test(l);

  let i = 0;
  const n = lines.length;
  let prelude = [];
  let markup = [];
  let styleBody = null;

  const flushMarkup = () => {
    if (markup.length) {
      const txt = markup.join('\n').replace(/^\n+|\n+$/g, '');
      if (txt.trim() !== '') {
        out.push(...formatMarkup(txt).split('\n'));
      }
      markup = [];
    }
  };
  const flushPrelude = () => {
    if (prelude.length) {
      out.push(...prelude);
      prelude = [];
    }
  };
  const flushStyle = () => {
    if (styleBody !== null) {
      const body = styleBody.join('\n');
      const fmt = formatCssFn ? formatCssFn(body) : body;
      if (fmt.trim() !== '') {
        out.push(...fmt.split('\n'));
      }
      styleBody = null;
    }
  };

  while (i < n) {
    const line = lines[ i ];
    const t = line.trimStart();
    if (isOpenScript(t) || isOpenStyle(t) || /^<template\b/.test(t) || /^<\/?[a-z]/i.test(t)) {
      // section or markup start (only when we're not inside raw regions)
      if (isOpenScript(t)) {
        flushPrelude();
        flushMarkup();
        out.push(line);
        i++;
        while (i < n && !isCloseScript(lines[ i ].trimStart())) {
          out.push(lines[ i ]);
          i++;
        }
        if (i < n) {
          out.push(lines[ i ]);
          i++;
        }
        // blank lines between sections
        while (i < n && blankish(lines[ i ])) {
          out.push(lines[ i ]);
          i++;
        }
        continue;
      }
      if (isOpenStyle(t)) {
        flushPrelude();
        flushMarkup();
        out.push(line);
        i++;
        styleBody = [];
        while (i < n && !isCloseStyle(lines[ i ].trimStart())) {
          styleBody.push(lines[ i ]);
          i++;
        }
        flushStyle();
        if (i < n) {
          out.push(lines[ i ]);
          i++;
        }
        while (i < n && blankish(lines[ i ])) {
          out.push(lines[ i ]);
          i++;
        }
        continue;
      }
      // markup (template or fragment element)
      flushPrelude();
      const start = i;
      markup = []; // reset so flushMarkup only takes this segment
      while (i < n) {
        const t2 = lines[ i ].trimStart();
        if (isOpenScript(t2) || isOpenStyle(t2)) {
          break;
        }
        if (i > start && (blankish(lines[ i ]) === false) && (isOpenScript(t2) || isOpenStyle(t2))) {
          break;
        }
        // A blank line followed by a script/style open ends the markup; blank
        // lines INSIDE markup are kept (trimmed at flush) - we must be careful:
        // blank lines that separate markup from a following <script> must not
        // be swallowed into the markup region. Lookahead approach:
        if (blankish(lines[ i ])) {
          // peek ahead: skip blanks to see if next non-blank opens script/style
          let k = i;
          while (k < n && blankish(lines[ k ])) {
            k++;
          }
          if (k < n && (isOpenScript(lines[ k ].trimStart()) || isOpenStyle(lines[ k ].trimStart()))) {
            break; // leave blanks + section for outer handling
          }
          markup.push(lines[ i ]);
          i++;
          continue;
        }
        markup.push(lines[ i ]);
        i++;
      }
      flushMarkup();
      continue;
    }
    if (/^<\/template\s*>/.test(t) || /^<\/[a-z]/i.test(t)) {
      // stray closing tag without open in markup (shouldn't happen); treat as markup
      if (prelude.length) {
        flushPrelude();
      }
      markup.push(line);
      i++;
      continue;
    }
    // code/blank in prelude
    prelude.push(line);
    i++;
  }
  flushPrelude();
  flushMarkup();
  flushStyle();
  return out.join('\n');
}

function formatVue(p1, formatCssFn) {
  return formatVueBlock(p1, formatCssFn);
}

// ---------- block discovery & application ----------
function findBlocks(code, wantedClass) {
  const ast = parse(code);
  const blocks = [];
  transform(ast, {
    nodeTransforms: [ (node) => {
      if (node.type !== 1 || node.tag !== 'CodeBlock') {
        return;
      }
      const cls = node.props.find((p) => p.name === 'class' && p.type === 6);
      if (wantedClass !== '*' && (!cls || !cls.value?.content.includes(wantedClass))) {
        return;
      }
      const cp = node.props.find((p) => p.name === 'code' && p.type === 6 && p.value);
      if (!cp) {
        return;
      }
      const lang = node.props.find((p) => p.name === 'lang' && p.type === 6)?.value?.content ?? 'vue';
      blocks.push({ lang, content: cp.value.content, start: cp.loc.start.offset, end: cp.loc.end.offset });
    } ],
  });
  return blocks;
}

function formatBlock(lang, content) {
  if (lang === 'vue') {
    return formatVue(content, formatCss);
  }
  if (lang === 'css') {
    return formatCss(content);
  }
  return content.split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n');
}

function transformFile(code, wantedClass = DEFAULT_CLASS) {
  const blocks = findBlocks(code, wantedClass);
  const edits = [];
  const errors = [];
  for (const b of blocks) {
    const formatted = formatBlock(b.lang, b.content);
    if (formatted === b.content) {
      continue;
    }
    if (stripWs(formatted) !== stripWs(b.content)) {
      errors.push({ lang: b.lang, reason: 'non-whitespace content drift' });
      continue;
    }
    edits.push({ start: b.start, end: b.end, text: `code="${ encodeAttr(formatted) }"` });
  }
  edits.sort((a, b) => b.start - a.start);
  let out = code;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return { code: out, edits, errors };
}

// Rewrite each guide block's code attribute so raw `<tag>` mentions inside
// `//` / `/* */` comments become the literal text `&lt;` (visible again).
// Returns a copy of `code` with the edits applied.
function transformCommentTags(code, wantedClass = DEFAULT_CLASS) {
  const blocks = findBlocks(code, wantedClass);
  const edits = [];
  for (const b of blocks) {
    if (b.lang === 'vue' || b.lang === 'css' || b.lang === 'ts' || b.lang === 'js') {
      const fixed = escapeCommentTags(b.content);
      if (fixed !== b.content) {
        edits.push({ start: b.start, end: b.end, text: `code="${ encodeAttr(fixed) }"` });
      }
    }
  }
  edits.sort((a, b2) => b2.start - a.start);
  let out = code;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return { code: out, edits, errors: [] };
}

function defaultTargets() {
  const pages = path.join(playgroundRoot, 'pages');
  return fs.readdirSync(pages)
    .filter((d) => /^(?:essential|feature|pattern)-/.test(d))
    .map((d) => path.join(pages, d, '+Page.vue'))
    .sort();
}

function main() {
  const argv = process.argv.slice(2);
  const write = argv.includes('--write');
  const commentTags = argv.includes('--comment-tags');
  const wantedClass = (() => {
    const i = argv.indexOf('--class');
    if (i !== -1 && argv[ i + 1 ]) {
      return argv[ i + 1 ];
    }
    return DEFAULT_CLASS;
  })();
  const explicit = argv.filter((a) => !a.startsWith('--') && a !== '--write');
  const targets = explicit.length
    ? explicit.map((f) => path.resolve(process.cwd(), f))
    : defaultTargets();

  const transformFn = commentTags ? transformCommentTags : transformFile;
  const what = commentTags ? 'comment tag(s) escaped' : 'block(s) reformatted';

  let touched = 0;
  let blocks = 0;
  for (const file of targets) {
    const code = fs.readFileSync(file, 'utf8');
    const { code: next, edits, errors } = transformFn(code, wantedClass);
    for (const e of errors) {
      console.error(`!! ${ path.relative(process.cwd(), file) } ${ e.reason } (${ e.lang })`);
    }
    if (!edits.length) {
      continue;
    }
    console.log(`${ path.relative(process.cwd(), file) }: ${ edits.length } ${ what }`);
    if (write) {
      fs.writeFileSync(file, next);
    }
    touched++;
    blocks += edits.length;
  }
  console.log(`\n${ touched } file(s) touched, ${ blocks } ${ what }. ${ write ? '(written)' : '(dry run)' }`);
}

if (process.argv[ 1 ] && import.meta.url === pathToFileURL(process.argv[ 1 ]).href) {
  main();
}
