import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.resolve(__dirname, '../pages');
const OUTPUT_FILE = path.resolve(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://pdanpdan.github.io/virtual-scroll';

function getPages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      const hasPage = fs.existsSync(path.join(fullPath, '+Page.vue'));

      if (hasPage) {
        const route = entry.name === 'index' ? '' : entry.name;
        pages.push(route ? `${ route }/` : '');
      }
    }
  }

  return pages;
}

const routes = getPages(PAGES_DIR);
const lastmod = new Date().toISOString().split('T')[ 0 ];

const urls = routes
  .map((route) => {
    let priority = 0.7;
    if (route === '') {
      priority = 1.0;
    } else if (route === 'docs/') {
      priority = 0.9;
    } else if (route.startsWith('vertical-') || route.startsWith('horizontal-') || route.startsWith('grid-')) {
      priority = 0.8;
    }

    return `  <url>
    <loc>${ BASE_URL }/${ route }</loc>
    <lastmod>${ lastmod }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${ priority }</priority>
  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ urls }
</urlset>`;

fs.writeFileSync(OUTPUT_FILE, sitemap);
console.log(`Sitemap generated with ${ routes.length } routes at ${ OUTPUT_FILE }`);
