import fs from 'node:fs';
import path from 'node:path';

import { parse, transform } from '@vue/compiler-dom';
import { getHighlighter } from 'shikiji';
import { createCssVariablesTheme } from 'shikiji/theme-css-variables';

let highlighterPromise: ReturnType<typeof getHighlighter> | null = null;

export async function highlight(code: string, lang: string) {
  if (!highlighterPromise) {
    highlighterPromise = getHighlighter({
      themes: [
        createCssVariablesTheme({
          name: 'css-variables',
          variablePrefix: '--shiki-',
          variableDefaults: {},
        }),
      ],
      langs: [ 'vue', 'bash', 'ts', 'js', 'python', 'cpp' ],
    });
  }

  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {
    lang,
    theme: 'css-variables',
  });
}

export function highlightPlugin() {
  const suffix = '.highlight.js';

  return {
    name: 'vite-plugin-highlight',
    enforce: 'pre' as const,

    async resolveId(id: string, importer: string) {
      if (id.includes('?highlight')) {
        const [ relativePart ] = id.split('?highlight');
        const resolvedPath = path.resolve(path.dirname(importer), relativePart);
        return resolvedPath + suffix;
      }
      return null;
    },

    async load(id: string) {
      if (id.endsWith(suffix)) {
        const filePath = id.slice(0, -suffix.length);
        const code = fs.readFileSync(filePath, 'utf-8');
        const lang = filePath.split('.').pop() || 'vue';
        const html = await highlight(code, lang);

        return `
          export const raw = ${ JSON.stringify(code) };
          export const html = ${ JSON.stringify(html) };
          export default { raw, html };
        `;
      }
      return null;
    },

    async transform(code: string, id: string) {
      if (id.endsWith(suffix)) {
        return null;
      }

      if (id.endsWith('.vue') && (code.includes('<CodeBlock') || code.includes('<code-block'))) {
        const ast = parse(code);
        const replacements: { start: number; end: number; raw: string; lang: string; }[] = [];

        transform(ast, {
          nodeTransforms: [
            (node) => {
              if (node.type !== 1 /* ELEMENT */) {
                return;
              }
              if (node.tag !== 'CodeBlock' && node.tag !== 'code-block') {
                return;
              }

              const codeProp = node.props.find((p) => p.name === 'code');
              // Only transform if it's a static string prop (not a binding)
              if (codeProp && codeProp.type === 6 /* ATTRIBUTE */ && codeProp.value) {
                const langProp = node.props.find((p) => p.name === 'lang');
                replacements.push({
                  start: codeProp.loc.start.offset,
                  end: codeProp.loc.end.offset,
                  raw: codeProp.value.content,
                  lang: (langProp && langProp.type === 6 && langProp.value?.content) || 'vue',
                });
              }
            },
          ],
        });

        if (replacements.length === 0) {
          return;
        }

        let newCode = code;
        for (const r of replacements.reverse()) {
          const highlightedHtml = await highlight(r.raw, r.lang);
          const safeValue = JSON.stringify(highlightedHtml.replaceAll('&#x3C;/</', '&amp;lt;/</')).replace(/"/g, '&quot;');
          const newAttr = `:code="${ safeValue }"`;
          newCode = newCode.slice(0, r.start) + newAttr + newCode.slice(r.end);
        }

        return { code: newCode, map: null };
      }
    },
  };
}
