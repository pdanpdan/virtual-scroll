import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const changelogPath = path.resolve(__dirname, '../../../CHANGELOG.md');
const outputPath = path.resolve(__dirname, '../pages/changelog/changelog-data.ts');

// `# [1.2.3](compare-url) (2026-01-01)`, `## [1.2.3] - 2026-01-01`, `# 1.2.3 (2026-01-01)`.
const VERSION_HEADER = /^#{1,2}[ \t]+\[?v?(\d+\.\d+\.\d+)/;
const RELEASE_DATE = /(\d{4}-\d{2}-\d{2})/;
const SECTION_HEADING = /^###[ \t]+(\S.*)$/;
// Bullets only start at column 0; indented bullets belong to the item above them.
const BULLET = /^[*-][ \t]+(\S.*)$/;
const INDENTED = /^\s+(\S.*)$/;
const INDENTED_BULLET = /^[*-]\s+/;
const HASH_LINK = /\s*\(\[[\da-f]{7,40}\]\([^)]*\)\)\s*$/;
const CLOSES_REFERENCES = /,\s+closes\s+\S.*$/;
const CONVENTIONAL_HEADER = /^(feat|fix|perf|revert|refactor|build|ci|docs|style|test|chore)(?:\(([^()]*)\))?(!)?:[ \t]*(\S.*)$/;

// Section headings the angular preset writes, in the order the page renders them.
const SECTIONS = new Map([
  [ 'breaking changes', 'breaking' ],
  [ 'features', 'features' ],
  [ 'bug fixes', 'fixes' ],
  [ 'performance improvements', 'performance' ],
]);

const TYPE_GROUPS = new Map([
  [ 'feat', 'features' ],
  [ 'fix', 'fixes' ],
  [ 'perf', 'performance' ],
]);

const content = fs.readFileSync(changelogPath, 'utf8');

// A release block owns every line up to the next version header; the file preamble
// before the first header belongs to no block and is dropped.
const blocks = [];
for (const rawLine of content.split('\n')) {
  const line = rawLine.replace(/\r$/, '');
  const versionMatch = line.match(VERSION_HEADER);
  if (versionMatch) {
    blocks.push({
      version: versionMatch[ 1 ],
      date: line.match(RELEASE_DATE)?.[ 1 ] ?? '',
      lines: [],
    });
  } else {
    blocks.at(-1)?.lines.push(line);
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// The page renders items with `v-html`, so markdown is converted to the markup the
// template expects. Code spans are kept verbatim, their content is never styled.
function formatInline(text) {
  return escapeHtml(text)
    .split(/(`[^`]*`)/g)
    .map((part) => {
      if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
        return `<code>${ part.slice(1, -1) }</code>`;
      }

      return part
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
    })
    .join('');
}

function formatItem(rawLines, section, label) {
  const lines = rawLines
    .map((raw) => raw.replace(CLOSES_REFERENCES, '').replace(HASH_LINK, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  // Commits listed before the first section keep their conventional header
  // (`refactor(scope)!: subject`), the section bullets are already stripped by the writer.
  const [ head, ...rest ] = lines;
  const conventional = section === null ? head.match(CONVENTIONAL_HEADER) : null;
  const scope = conventional?.[ 2 ];
  const subject = conventional ? conventional[ 4 ] : head;
  const group = section
    ?? (conventional?.[ 3 ] ? 'breaking' : TYPE_GROUPS.get(conventional?.[ 1 ]) ?? 'features');
  const prefix = scope ? `<strong>${ escapeHtml(scope) }:</strong> ` : '';
  const heading = label ? `<strong>${ escapeHtml(label) }:</strong> ` : '';

  // Wrapped prose is joined into one line, nested bullets start their own line.
  const text = [ prefix + formatInline(subject), ...rest.map((line) => formatInline(line)) ].join('<br>');

  return { group, text: heading + text };
}

const versions = [];

for (const block of blocks) {
  const groups = { breaking: [], features: [], fixes: [], performance: [] };
  let section = null;
  let label = null;
  let open = null;
  let blank = false;

  const flush = () => {
    if (!open) {
      return;
    }

    const item = formatItem(open.lines, open.section, open.label);
    if (item) {
      groups[ item.group ].push(item.text);
    }

    open = null;
    blank = false;
  };

  for (const line of block.lines) {
    const heading = line.match(SECTION_HEADING);
    if (heading) {
      flush();
      const title = heading[ 1 ].trim();
      section = SECTIONS.get(title.toLowerCase()) ?? null;
      // A heading the page has no group for keeps its title on every item.
      label = section ? null : title;
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      flush();
      open = { section, label, lines: [ bullet[ 1 ] ] };
      continue;
    }

    if (!open) {
      continue;
    }

    if (!line.trim()) {
      blank = true;
      continue;
    }

    // Nested bullets, paragraphs and the lines a long entry wraps into belong to the item above.
    const indented = line.match(INDENTED);
    if (indented) {
      if (blank || INDENTED_BULLET.test(indented[ 1 ])) {
        open.lines.push(indented[ 1 ].replace(INDENTED_BULLET, ''));
      } else {
        open.lines[ open.lines.length - 1 ] += ` ${ indented[ 1 ] }`;
      }
    }

    blank = false;
  }

  flush();

  if (Object.values(groups).some((items) => items.length > 0)) {
    versions.push({ version: block.version, date: block.date, ...groups });
  }
}

function quote(value) {
  return `'${ value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") }'`;
}

function formatObject(obj, indent = '  ') {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    const items = obj.map((item) => `${ indent }  ${ quote(item) },`).join('\n');
    return `[\n${ items }\n${ indent }]`;
  }

  const entries = Object.entries(obj)
    .filter(([ _, value ]) => !Array.isArray(value) || value.length > 0)
    .map(([ key, value ]) => {
      const formattedValue = typeof value === 'string'
        ? quote(value)
        : formatObject(value, `${ indent }  `);
      return `${ indent }  ${ key }: ${ formattedValue },`;
    })
    .join('\n');

  return `{\n${ entries }\n${ indent }}`;
}

const formattedChangelog = `[\n${ versions.map((v) => `  ${ formatObject(v, '  ') },`).join('\n') }\n]`;

const tsContent = `// This file is auto-generated by scripts/sync-changelog.js
export interface ChangelogVersion {
  version: string;
  date: string;
  breaking?: string[];
  features?: string[];
  fixes?: string[];
  performance?: string[];
}

export const changelog: ChangelogVersion[] = ${ formattedChangelog };
`;

fs.writeFileSync(outputPath, tsContent);
console.log(`Changelog data synced to ${ outputPath }`);
