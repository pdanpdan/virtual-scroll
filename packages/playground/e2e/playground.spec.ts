import type { ConsoleMessage, Page, TestInfo } from '@playwright/test';
import type { Buffer } from 'node:buffer';
import type { ChildProcess } from 'node:child_process';

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { BASE_URL, PORT } from './env';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = path.join(ROOT_DIR, 'pages');

// Lines mentioning a problem in the dev server output (vite/vike error reporting).
const SERVER_PROBLEM_RE = /\b(?:error|warn(?:ing)?|exception|fail(?:ed|ure)?)\b/i;

// Chrome fires this when a ResizeObserver callback causes layout changes while
// dynamic item sizes settle - transient and harmless, not a code error.
const KNOWN_BENIGN_PROBLEM = 'ResizeObserver loop completed with undelivered notifications';

let serverProcess: ChildProcess | undefined;
let serverOutput: string[] = [];
let appBase = '/';

function assertPortFree(port: number): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const socket = net.connect(port, '127.0.0.1');
  socket.once('connect', () => {
    socket.destroy();
    reject(new Error(`port ${ port } is already in use - stop the other server or set PLAYGROUND_E2E_PORT to a free port`));
  });
  socket.once('error', () => resolve());
  return promise;
}

function generateChangelogData(): void {
  // changelog-data.ts is generated from CHANGELOG.md and gitignored - absent in fresh checkouts
  const result = spawnSync(process.execPath, [ 'scripts/sync-changelog.js' ], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`sync-changelog.js failed (exit ${ result.status }):\n${ result.stdout }${ result.stderr }`);
  }
}

function startDevServer(): Promise<void> {
  serverOutput = [];
  // keep output plain and deterministic: NO_COLOR + FORCE_COLOR together make node print a warning
  const env = { ...process.env };
  delete env.FORCE_COLOR;
  delete env.NO_COLOR;
  const bin = path.join(ROOT_DIR, 'node_modules', '.bin', process.platform === 'win32' ? 'vike.cmd' : 'vike');
  serverProcess = spawn(bin, [ 'dev', '--host', '127.0.0.1', '--port', String(PORT) ], {
    cwd: ROOT_DIR,
    env,
    stdio: [ 'ignore', 'pipe', 'pipe' ],
    shell: process.platform === 'win32',
  });
  serverProcess.stdout?.on('data', (chunk: Buffer) => {
    serverOutput.push(...String(chunk).split(/\r?\n/));
  });
  serverProcess.stderr?.on('data', (chunk: Buffer) => {
    serverOutput.push(...String(chunk).split(/\r?\n/));
  });

  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const deadline = Date.now() + 120_000;
  const checkReady = async () => {
    if (serverProcess?.exitCode !== null) {
      reject(new Error(`dev server exited early (code ${ serverProcess?.exitCode || 'n/a' }):\n${ serverOutput.join('\n') }`));
      return;
    }
    try {
      const response = await fetch(`${ BASE_URL }/`);
      if (response.ok) {
        resolve();
        return;
      }
    } catch {
      // not up yet - keep polling
    }
    if (Date.now() > deadline) {
      reject(new Error(`dev server did not become ready in time:\n${ serverOutput.join('\n') }`));
      return;
    }
    setTimeout(checkReady, 250);
  };
  checkReady();
  return promise;
}

function stopDevServer(): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  if (!serverProcess || serverProcess.exitCode !== null) {
    resolve();
    return promise;
  }
  serverProcess.once('exit', () => resolve());
  serverProcess.kill('SIGTERM');
  setTimeout(() => serverProcess?.kill('SIGKILL'), 5000).unref();
  return promise;
}

function getRoutes(): string[] {
  // vike serves routes with a trailing slash (trailingSlash: true), matching the app's own normalizeHref
  return fs.readdirSync(PAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(PAGES_DIR, entry.name, '+Page.vue')))
    .map((entry) => (entry.name === 'index' ? '/' : `/${ entry.name }/`))
    .sort();
}

function resolveRoute(route: string): string {
  return route === '/' ? appBase : `${ appBase }${ route.slice(1) }`;
}

// The playground is served under its GitHub Pages base (e.g. /virtual-scroll/),
// even in dev - the root request redirects there.
async function discoverAppBase(): Promise<void> {
  const response = await fetch(`${ BASE_URL }/`, { redirect: 'manual' });
  const location = response.headers.get('location');
  if (location) {
    const pathname = new URL(location, BASE_URL).pathname;
    appBase = pathname.endsWith('/') ? pathname : `${ pathname }/`;
  }
}

function captureConsoleProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      const location = message.location();
      problems.push(`[${ message.type() }] ${ message.text() }${ location.url ? ` (${ location.url })` : '' }`);
    }
  });
  page.on('pageerror', (error: Error) => {
    problems.push(`[pageerror] ${ error.message }`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      problems.push(`[http ${ response.status() }] ${ response.url() }`);
    }
  });
  return problems;
}

function serverProblemsSince(snapshot: number): string[] {
  return serverOutput.slice(snapshot).filter((line) => SERVER_PROBLEM_RE.test(line));
}

async function attachServerOutput(testInfo: TestInfo): Promise<void> {
  await testInfo.attach('dev server output', {
    body: serverOutput.join('\n'),
    contentType: 'text/plain',
  });
}

test.beforeAll(async () => {
  await assertPortFree(PORT);
  generateChangelogData();
  await startDevServer();
  await discoverAppBase();
});

test.afterAll(async () => {
  await stopDevServer();
});

for (const route of getRoutes()) {
  test(`no console or server problems on ${ route }`, async ({ page }, testInfo) => {
    const consoleProblems = captureConsoleProblems(page).filter((p) => !p.includes(KNOWN_BENIGN_PROBLEM));
    const logSnapshot = serverOutput.length;

    await page.goto(resolveRoute(route), { waitUntil: 'networkidle' });
    // let client-side code settle and surface hydration/dev warnings
    await page.waitForTimeout(300);

    const serverProblems = serverProblemsSince(logSnapshot).filter((p) => !p.includes(KNOWN_BENIGN_PROBLEM));
    if (consoleProblems.length > 0 || serverProblems.length > 0) {
      await attachServerOutput(testInfo);
    }

    expect(consoleProblems, `browser console problems on ${ route }`).toEqual([]);
    expect(serverProblems, `server output problems on ${ route }`).toEqual([]);
  });
}
