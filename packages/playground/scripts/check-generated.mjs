import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Generates the configurator's SFC output for a matrix of configurations and
 * leaves the files in `tmp-generated/`, which `vue-tsc --noEmit` then compiles
 * as part of `test:types`.
 *
 * The generator emits user-facing code, so a change to the library's API that the
 * generator does not follow - or a generator bug - shows up as a type error here
 * instead of in somebody's editor.
 *
 * The same matrix also feeds the CodePen/standalone output, whose templates are
 * checked against the scope each artifact really has (see `checkTemplateScope`):
 * a pen template may only read what `setup()` returns, while an SFC template
 * reads the top-level bindings of its script.
 */
import { build } from 'vite';

const pkgRoot = resolve(import.meta.dirname, '..');
const bundleDir = resolve(pkgRoot, 'node_modules/.tmp/generator');
const targetDir = resolve(pkgRoot, 'tmp-generated');

await build({
  configFile: false,
  root: pkgRoot,
  logLevel: 'silent',
  build: {
    outDir: bundleDir,
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: {
        generate: resolve(pkgRoot, 'lib/configurator/generate.ts'),
        state: resolve(pkgRoot, 'lib/configurator/state.ts'),
      },
      formats: [ 'es' ],
      fileName: (_format, name) => `${ name }.mjs`,
    },
  },
});

const { generateSfc, generateCodePenForState, generateCodePenTypeScript } = await import(`${ bundleDir }/generate.mjs`);
const { defaultState } = await import(`${ bundleDir }/state.mjs`);

const base = (overrides) => Object.assign(structuredClone(defaultState), overrides);

/** One entry per output shape the generator can produce. */
const cases = {
  'list-default': [ base(), 'component' ],
  'list-sticky-sections': [ base({ stickySections: true, stickyHeader: true, itemsPerSection: 10 }), 'component' ],
  'list-item-model': [ base({ keyboardActivation: 'item', snapshots: true, infiniteScroll: true }), 'component' ],
  'list-item-model-auto': [ base({ ariaRole: 'listbox', snapshots: true }), 'component' ],
  'list-viewport-keyboard': [ base({ keyboardActivation: 'viewport', snapshots: true }), 'component' ],
  'list-window-infinite': [ base({ containerMode: 'window', infiniteScroll: true, infiniteFlingVelocity: 3, infinitePreload: 200 }), 'component' ],
  'grid-item-model': [ base({ direction: 'both', keyboardActivation: 'item', snapshots: true }), 'component' ],
  'grid-dynamic-columns': [ base({ direction: 'both', columnWidthMode: 'dynamic', itemSizeMode: 'function', snap: true, snapMode: 'center' }), 'component' ],
  'table-item-model': [ base({ renderer: 'table', keyboardActivation: 'item', infiniteScroll: true }), 'component' ],
  'table-features': [ base({ renderer: 'table', rtl: true, snap: true, snapMode: 'center', snapshots: true, snapshotStorage: 'local', initialScroll: true, initialScrollIndex: 20, initialScrollAlign: 'center', restoreOnPrepend: true, stickyHeader: true, stickyFooter: true, ariaRole: 'grid' }), 'component' ],
  'list-local-storage': [ base({ snapshots: true, snapshotStorage: 'local' }), 'component' ],
  'table-default': [ base({ renderer: 'table' }), 'component' ],
  'masonry-default': [ base({ renderer: 'masonry' }), 'component' ],
  'masonry-aria': [ base({ renderer: 'masonry', ariaRole: 'list', gap: 16 }), 'component' ],
  'independent-scrollbars': [ base({ scrollbarStyle: 'independent', direction: 'both', rtl: true }), 'component' ],
  'composable-default': [ base(), 'composable' ],
  'composable-item-model': [ base({ keyboardActivation: 'item', snapshots: true, infiniteScroll: true, infiniteFlingVelocity: 3, infinitePreload: 150 }), 'composable' ],
  'composable-role-auto': [ base({ ariaRole: 'menu', snapshots: true }), 'composable' ],
  'composable-rtl-dynamic': [ base({ rtl: true, itemSizeMode: 'dynamic', stickySections: true, restoreOnPrepend: true, scrollbarStyle: 'custom' }), 'composable' ],
  'composable-window': [ base({ containerMode: 'window', restoreOnPrepend: true }), 'composable' ],
};

// ---------------------------------------------------------------------------
// template scope
// ---------------------------------------------------------------------------

/**
 * Names a template expression may always read: ECMAScript built-ins plus globals
 * a generated pen legitimately uses. Anything else has to come from the scope the
 * template has - the script bindings of an SFC, or the object `setup()` returns.
 */
const TEMPLATE_GLOBALS = new Set([
  'Array',
  'Boolean',
  'Date',
  'Infinity',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'Number',
  'Object',
  'Promise',
  'Set',
  'String',
  'Vue',
  'console',
  'document',
  'parseFloat',
  'parseInt',
  'undefined',
  'window',
  '$event',
]);

const reKeywords = new Set([
  'async',
  'await',
  'const',
  'else',
  'false',
  'function',
  'if',
  'in',
  'instanceof',
  'let',
  'new',
  'null',
  'of',
  'return',
  'this',
  'true',
  'typeof',
  'var',
  'void',
  'delete',
]);

/** Code outside string literals, keeping the expressions inside template literals. */
function codeOf(expression) {
  let out = '';
  let i = 0;
  const skipQuoted = (quote) => {
    i++;
    while (i < expression.length && expression[ i ] !== quote) {
      i += expression[ i ] === '\\' ? 2 : 1;
    }
    i++;
  };
  while (i < expression.length) {
    const char = expression[ i ];
    if (char === '\'' || char === '"') {
      skipQuoted(char);
      out += ' ';
      continue;
    }
    if (char === '`') {
      i++;
      while (i < expression.length && expression[ i ] !== '`') {
        if (expression[ i ] === '\\') {
          i += 2;
          continue;
        }
        if (expression[ i ] === '$' && expression[ i + 1 ] === '{') {
          let depth = 1;
          let j = i + 2;
          while (j < expression.length && depth > 0) {
            if (expression[ j ] === '{') {
              depth++;
            } else if (expression[ j ] === '}') {
              depth--;
            }
            j++;
          }
          out += ` ${ codeOf(expression.slice(i + 2, j - 1)) } `;
          i = j;
          continue;
        }
        i++;
      }
      i++;
      continue;
    }
    out += char;
    i++;
  }
  return out;
}

/** Identifiers a chunk of code reads: roots of member access, calls and references. */
function readNames(code) {
  const names = new Set();
  const cleaned = codeOf(code)
    // object-literal keys are not reads
    .replace(/([{,]\s*)[A-Z_$][\w$]*\s*:/gi, '$1')
    // property names are not reads
    .replace(/\.\s*[A-Z_$][\w$]*/gi, '');
  for (const m of cleaned.matchAll(/(?:^|[^.\w$])([A-Z_$][\w$]*)/gi)) {
    if (!reKeywords.has(m[ 1 ]) && !TEMPLATE_GLOBALS.has(m[ 1 ])) {
      names.add(m[ 1 ]);
    }
  }
  return names;
}

/** Names a template introduces itself: `v-for` targets and slot props. */
function localNames(template) {
  const locals = new Set();
  const add = (chunk) => {
    for (const name of chunk.split(',')) {
      const cleaned = name.trim().split(':').pop().replace(/=.*$/, '').trim();
      if (/^[A-Z_$][\w$]*$/i.test(cleaned)) {
        locals.add(cleaned);
      }
    }
  };
  for (const m of template.matchAll(/v-for\s*=\s*"([^"]*)"/g)) {
    add((m[ 1 ].split(/\s+(?:in|of)\s+/)[ 0 ] ?? '').replace(/^\(|\)$/g, ''));
  }
  for (const m of template.matchAll(/#[A-Z-]+\s*=\s*"\{([^}]*)\}"/gi)) {
    add(m[ 1 ]);
  }
  return locals;
}

/** Every name a template reads, with the construct that read it. */
function templateReads(template) {
  const reads = new Map();
  const record = (what, expression) => {
    for (const name of readNames(expression)) {
      if (!reads.has(name)) {
        reads.set(name, what);
      }
    }
  };
  for (const m of template.matchAll(/@[a-z.-]+(?:\.\w+)*\s*=\s*"([^"]*)"/gi)) {
    record('handler', m[ 1 ]);
  }
  for (const m of template.matchAll(/\bv-(?:if|else-if|show|model(?:\.[\w.]+)?)\s*=\s*"([^"]*)"/g)) {
    record('directive', m[ 1 ]);
  }
  for (const m of template.matchAll(/(?<![\w-]):[\w.-]+\s*=\s*"([^"]*)"/g)) {
    record('binding', m[ 1 ]);
  }
  for (const m of template.matchAll(/\{\{(.*?)\}\}/gs)) {
    record('interpolation', m[ 1 ]);
  }
  for (const m of template.matchAll(/\sref\s*=\s*"([A-Za-z_$][\w$]*)"/g)) {
    reads.set(m[ 1 ], 'ref');
  }
  return reads;
}

/** Top-level bindings of a `<script setup>` block. */
function scriptBindings(script) {
  const names = new Set();
  for (const m of script.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[ 1 ]);
  }
  for (const m of script.matchAll(/\b(?:const|let|var)\s*\{([^}]*)\}/g)) {
    for (const part of m[ 1 ].split(',')) {
      const name = part.trim().split(':').pop().replace(/=.*$/, '').trim();
      if (/^[A-Z_$][\w$]*$/i.test(name)) {
        names.add(name);
      }
    }
  }
  for (const m of script.matchAll(/\b(?:const|let|var)\s*\[([^\]]*)\]/g)) {
    for (const part of m[ 1 ].split(',')) {
      const name = part.trim();
      if (/^[A-Z_$][\w$]*$/i.test(name)) {
        names.add(name);
      }
    }
  }
  // Imported names, read line by line: an import clause is far easier to split
  // by hand than to match without ambiguity.
  for (const line of script.split('\n')) {
    if (!line.trimStart().startsWith('import ')) {
      continue;
    }
    const clause = line.replace(/^\s*import\s+(?:type\s+)?/, '').split(' from ')[ 0 ] ?? '';
    const defaultName = clause.replace(/\{[^}]*\}/, '').replace(/[*\s,]/g, '');
    if (/^[a-z_$][\w$]*$/i.test(defaultName)) {
      names.add(defaultName);
    }
    for (const part of (/\{([^}]*)\}/.exec(clause)?.[ 1 ] ?? '').split(',')) {
      const cleaned = part.trim().replace(/^type\s+/, '');
      const alias = cleaned.match(/\bas\s+([a-z_$][\w$]*)$/i);
      const name = alias ? alias[ 1 ] : cleaned.split(':').pop().trim();
      if (/^[a-z_$][\w$]*$/i.test(name)) {
        names.add(name);
      }
    }
  }
  return names;
}

/** Bindings an Options-API pen template can read: whatever `setup()` hands back. */
function penBindings(js) {
  const names = new Set();
  const collect = (chunk) => {
    for (const part of chunk.split(',')) {
      const name = part.trim().split(':').pop().replace(/=.*$/, '').trim();
      if (/^[A-Z_$][\w$]*$/i.test(name)) {
        names.add(name);
      }
    }
  };
  for (const m of js.matchAll(/return\s*\{([^}]*)\}/g)) {
    collect(m[ 1 ]);
  }
  for (const m of js.matchAll(/(?:const|let|var)\s+\w+\s*=\s*\{([^}]*)\}/g)) {
    collect(m[ 1 ]);
  }
  for (const m of js.matchAll(/Object\.assign\(\w+\s*,\s*\{([^}]*)\}/g)) {
    collect(m[ 1 ]);
  }
  return names;
}

const problems = [];
function checkTemplateScope(label, template, available) {
  const known = new Set([ ...available, ...localNames(template) ]);
  for (const [ name, what ] of templateReads(template)) {
    if (!known.has(name)) {
      problems.push(`${ label }: template ${ what } reads \`${ name }\`, which the ${ label.includes('pen:') ? 'pen setup scope' : 'script' } does not declare`);
    }
  }
}

// ---------------------------------------------------------------------------
// generation
// ---------------------------------------------------------------------------

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

for (const [ name, [ state, mode ] ] of Object.entries(cases)) {
  const sfc = generateSfc(state, mode);
  writeFileSync(resolve(targetDir, `${ name }.vue`), sfc);

  const script = sfc.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[ 1 ] ?? '';
  const template = sfc.match(/<template>([\s\S]*?)<\/template>/)?.[ 1 ] ?? '';
  checkTemplateScope(`sfc:${ name }`, template, scriptBindings(script));

  for (const [ variant, pen ] of [ [ 'pen', generateCodePenForState(state) ], [ 'ts-pen', generateCodePenTypeScript(state) ] ]) {
    checkTemplateScope(`${ variant }:${ name }`, pen.html, penBindings(pen.js));
  }
}

if (problems.length > 0) {
  throw new Error(`generated templates reference names their scope does not provide:\n  ${ problems.join('\n  ') }`);
}

console.log(`generated ${ Object.keys(cases).length } configurations into tmp-generated/ (templates checked against their scope)`);
