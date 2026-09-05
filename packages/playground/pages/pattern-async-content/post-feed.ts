import { reactive } from 'vue';

// Module-scoped simulated backend: fetched posts are cached by id and shared
// across row mounts, so scrolling a row back into view is instant. Rows are
// recycled by virtualization - state must live here (the model), never in the
// row DOM.

export interface Post {
  author: string;
  title: string;
  excerpt: string;
  hue: number;
  initials: string;
  minutesAgo: number;
}

const AUTHORS = [ 'Ada Chen', 'Miro Petrov', 'Lena Fischer', 'Omar Haddad', 'Ines Silva', 'Tomas Novak', 'Yuki Tanaka', 'Amara Diallo', 'Jonas Weber', 'Freya Lindqvist' ];
const VERBS = [ 'Shipping', 'Reconsidering', 'Debugging', 'Automating', 'Benchmarking', 'Migrating', 'Profiling', 'Refactoring', 'Hardening', 'Releasing' ];
const NOUNS = [ 'the virtual list', 'our scroll engine', 'the query path', 'deferred renders', 'memory pressure', 'the Fenwick tree', 'hydration', 'frame budgets', 'the prefetch window', 'overscan tuning' ];
const SUFFIXES = [ 'without breaking a sweat', 'at 60fps', 'under load', 'at 10M rows', 'in production', 'on low-end devices', 'with zero jank', 'over the weekend', 'in one afternoon', 'before the demo' ];
const CLAUSES = [
  'The measurements came back and the fix was smaller than expected.',
  'We pinned the regression to a single reflow and removed it entirely.',
  'The team kept the DOM count flat while the dataset grew tenfold.',
  'A bounded cache turned the worst case into a constant-time lookup.',
  'Hydration now completes before the first paint on slow devices.',
  'The scrollbar stays in sync even during 120Hz trackpad bursts.',
  'Prepended history no longer yanks the viewport around.',
  'We reserved image space up front, so late loads never shift the row.',
];

function hash(i: number, salt: number): number {
  let x = Math.imul(i + Math.imul(salt + 1, 0x9E3779B9), 2654435761);
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  return x >>> 0;
}

const pick = (list: string[], i: number, salt: number) => list[ hash(i, salt) % list.length ]!;

function buildPost(id: number): Post {
  const author = pick(AUTHORS, id, 3);
  const title = `${ pick(VERBS, id, 5) } ${ pick(NOUNS, id, 7) } ${ pick(SUFFIXES, id, 11) }`;
  const sentenceCount = 2 + (hash(id, 13) % 3);
  const excerpt = Array.from({ length: sentenceCount }, (_, k) => pick(CLAUSES, id, 17 + k)).join(' ');
  return {
    author,
    title,
    excerpt,
    hue: hash(id, 23) % 360,
    initials: author.split(' ').map((part) => part[ 0 ]).join(''),
    minutesAgo: hash(id, 29) % 240 + 1,
  };
}

const posts = new Map<number, Post>();
const inFlight = new Map<number, Promise<Post>>();

/** Reactive bookkeeping for the status line. */
export const feedStats = reactive({
  cached: 0,
  fetched: 0,
});

export function clearPostsCache() {
  posts.clear();
  inFlight.clear();
  feedStats.cached = 0;
}

export function loadPost(id: number, latencyMin: number, latencyMax: number): Promise<Post> {
  const cached = posts.get(id);
  if (cached) {
    return Promise.resolve(cached);
  }
  let pending = inFlight.get(id);
  if (!pending) {
    pending = new Promise<Post>((resolve) => {
      const delay = latencyMin + (hash(id, 37) % Math.max(1, latencyMax - latencyMin));
      setTimeout(() => {
        const post = buildPost(id);
        posts.set(id, post);
        feedStats.cached = posts.size;
        feedStats.fetched++;
        resolve(post);
      }, delay);
    });
    inFlight.set(id, pending);
    pending.finally(() => {
      inFlight.delete(id);
    });
  }
  return pending;
}
