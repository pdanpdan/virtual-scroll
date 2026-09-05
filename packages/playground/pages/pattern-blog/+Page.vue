<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  content: string;
}

const TOTAL_POSTS = 400;
const BATCH_SIZE = 6;
const BASE_DATE = Date.UTC(2024, 0, 1);

const scrollContainer = ref<Window | null>(null);
const seed = ref('virtual-scroll-blog');
const posts = ref<BlogPost[]>([]);
const loading = ref(false);
// The feed is finite: the loading slot only exists while posts can still be fetched.
const hasMore = computed(() => posts.value.length < TOTAL_POSTS);

onMounted(() => {
  scrollContainer.value = window;
});

const palette = [ '0e7490', 'be123c', 'b45309', '4d7c0f', '6d28d9', '1d4ed8' ];

// Different aspect ratios per post, cycled deterministically.
const imageRatios: Array<[number, number]> = [
  [ 800, 420 ],
  [ 800, 560 ],
  [ 800, 360 ],
  [ 800, 500 ],
  [ 800, 600 ],
  [ 800, 480 ],
];

function postImage(id: number): { src: string; width: number; height: number; } {
  const color = palette[ id % palette.length ];
  const [ width, height ] = imageRatios[ id % imageRatios.length ];
  return {
    src: `https://placehold.co/${ width }x${ height }/${ color }/ffffff?text=Post+${ id + 1 }&font=roboto`,
    width,
    height,
  };
}

function postDate(id: number): string {
  // Deterministic date derived from the post id (same seed -> same dates)
  const offset = (id * 3 + (id * id) % 5) * 86_400_000;
  return new Date(BASE_DATE + offset).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function fetchPost(id: number): Promise<BlogPost> {
  // The article endpoint is seeded by its slug: same id + seed -> same post
  const slug = seed.value.trim().replace(/\s+/g, '-') || 'blog';
  const response = await fetch(`https://lorem-api.com/api/article/blog-post-${ slug }-${ id }?format=json`);
  const article = await response.json() as {
    title: string;
    subtitle: string;
    author?: { name?: string; };
    content: string;
    dateCreated?: string;
  };
  let date = postDate(id);
  if (article.dateCreated) {
    const created = new Date(article.dateCreated);
    if (!Number.isNaN(created.getTime())) {
      date = created.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
  const image = postImage(id);
  return {
    id,
    title: article.title,
    subtitle: article.subtitle,
    author: article.author?.name ?? 'Anonymous',
    date,
    image: image.src,
    imageWidth: image.width,
    imageHeight: image.height,
    content: article.content,
  };
}

async function loadMore() {
  if (loading.value || posts.value.length >= TOTAL_POSTS) {
    return;
  }
  loading.value = true;
  const start = posts.value.length;
  const batch = await Promise.all(
    Array.from({ length: Math.min(BATCH_SIZE, TOTAL_POSTS - start) }, (_, i) => fetchPost(start + i)),
  );
  posts.value = [ ...posts.value, ...batch ];
  loading.value = false;
}

function onSeedChange() {
  posts.value = [];
  loadMore();
}

const {
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer height="auto" :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-2">Blog Posts</span>
    </template>

    <template #description>
      A long-running blog feed rendered in the browser window with <strong>dynamic heights</strong> (ResizeObserver). Posts are generated live and seeded by slug from <code class="font-mono">lorem-api.com</code>, images come from <code class="font-mono">placehold.co</code>, and new posts load on demand when you scroll to the end.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with on-demand post loading
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Seed</span>
          <input
            v-model="seed"
            type="text"
            class="input input-bordered input-sm w-44 font-mono"
            @change="onSeedChange"
          />
        </label>

        <span class="text-xs opacity-60 font-mono">{{ posts.length }} / {{ TOTAL_POSTS }} posts</span>

        <button type="button" class="btn btn-sm btn-soft btn-primary" :disabled="loading" @click="loadMore">
          Load More
        </button>
        <button type="button" class="btn btn-sm btn-soft btn-error" @click="posts = []">Clear</button>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="posts"
      :item-size="0"
      :default-item-size="1000"
      :buffer-before="1"
      :buffer-after="1"
      :container="scrollContainer"
      :load-distance="1600"
      :loading="loading"
      aria-label="Blog posts feed"
      @scroll="onScroll"
      @load="loadMore"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Lorem Blog</h2>
          <p>Seeded by <code class="font-mono">{{ seed }}</code> - scroll to load more posts</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <article class="example-blog-post">
          <h3 class="example-blog-title">{{ item.title }}</h3>
          <p class="example-blog-meta">
            By <strong>{{ item.author }}</strong> · {{ item.date }}
          </p>
          <img
            :src="item.image"
            :width="item.imageWidth"
            :height="item.imageHeight"
            :alt="`Post ${ index + 1 } cover`"
            class="example-blog-image"
          />
          <p class="example-blog-intro">{{ item.subtitle }}</p>
          <div class="example-blog-content">{{ item.content }}</div>
        </article>
      </template>

      <template v-if="hasMore" #loading>
        <div class="example-blog-loading">
          <span class="loading loading-spinner loading-sm text-primary" />
          Fetching more posts…
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>End of Feed</h2>
          <p>{{ posts.length }} of {{ TOTAL_POSTS }} posts loaded</p>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A feed of long-form posts shapes the design around two facts: each post's rendered height is unknowable before its
          content renders (text wraps at the container width and a cover image has its own ratio), and such a list is usually
          your page's own content rather than a small fixed box. VirtualScroll lets you pick each axis independently: which
          element scrolls (<code>:container</code> - a bounded box, or the browser window), and how row sizes are known
          (arithmetic <code>item-size</code> for uniform rows, or per-row <code>ResizeObserver</code> measurement for variable
          ones). For posts, variable-height measured rows are the right model; a <code>default-item-size</code> estimate keeps
          scroll height and navigation sane until the first real measurements arrive. Fetching further content on demand - near
          the end of the list, or from a button - then appends to <code>items</code> and the engine re-ranges around the current
          scroll position.
        </p>

        <h3>1. Choose what scrolls, then give it the right data</h3>
        <p>
          By default <code>&lt;VirtualScroll&gt;</code> scrolls inside its own host element, which must then have a definite
          height (any explicit or flex/grid-allocated height, remembering <code>min-height: 0</code> so it can shrink). When the
          list <em>is</em> the page, the cleaner choice is native page scrolling: pass the window through <code>:container</code>
          and the engine sizes its viewport from the page and listens to window scroll, so no fixed-height host is needed.
          Because <code>window</code> only exists client-side, hold it in a <code>ref</code> assigned in <code>onMounted</code>
          (harmless under SSR, where it stays <code>null</code>). With a window container the library uses native scrolling and
          does not enable coordinate scaling or virtual scrollbars, which are aimed at element scrollers.
        </p>
        <p>
          The <code>items</code> array should hold the real post objects: the slot reads <code>item.title</code>,
          <code>item.content</code>, and so on, so each entry must carry its payload. (The data-less sparse-array pattern only
          fits rows whose content is derivable from the index - see the uniform list case below.)
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { computed, onMounted, ref } from 'vue';
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

// A bounded element scroller needs no :container; a page-wide feed passes the
// window, assigned on mount because window only exists client-side.
const scrollContainer = ref&lt;Window | null>(null);
onMounted(() => {
  scrollContainer.value = window;
});

const posts = ref&lt;BlogPost[]>([]); // appended in batches
const loading = ref(false);
const hasMore = computed(() => posts.value.length &lt; TOTAL_POSTS);

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  const batch = await fetchPosts(posts.value.length, BATCH_SIZE);
  posts.value = [ ...posts.value, ...batch ]; // appending keeps old indices stable
  loading.value = false;
}
&lt;/script>"
        />

        <h3>2. Reserve the cover-image box so late loads cannot shift layout</h3>
        <p>
          A cover image that has not loaded yet renders as zero height, so a row would first paint short and then jump when the
          image arrives - moving the very content the reader is looking at. That is a general image-list concern, not something
          virtualization can fix for you: give the <code>&lt;img&gt;</code> its intrinsic <code>width</code> and
          <code>height</code> attributes plus <code>inline-size: 100%; block-size: auto</code>. The browser then reserves the
          aspect-ratio box up front, so the row measures the same whether the image is pending or painted. The remaining height
          variance comes from wrapped prose, which only rendering can reveal - which is what dynamic measurement (next step)
          absorbs.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          line-numbers
          code=".feed {
  max-inline-size: 46rem; /* readable measure; the page itself keeps scrolling */
  margin-inline: auto;
}
.post {
  padding: 2.5rem 1.25rem;
  border-bottom: 1px solid rgb(0 0 0 / 0.1);
}
.cover {
  display: block;
  inline-size: 100%;
  block-size: auto; /* intrinsic w/h attrs reserve the aspect box up front */
  object-fit: cover;
  border-radius: 0.75rem;
}
.content {
  white-space: pre-line;
  line-height: 1.6;
}
.feed-loading {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}"
        />

        <h3>3. Match the sizing model to your content</h3>
        <p>
          If every row is the same height you can pass a numeric <code>item-size</code> and the engine resolves positions
          arithmetically in <em>O(1)</em> - and because uniform rows are fully described by their index, you may pass a sparse
          array (<code>new Array(n)</code>) and render from the slot's <code>index</code> alone. Variable-height content needs
          the other model: leave <code>item-size</code> unset or set it to <code>0</code>/<code>null</code> (all three select
          dynamic mode) and each mounted row is measured with <code>ResizeObserver</code>, updating the offset tree as rows
          settle. A measurement can only happen once a row is mounted, so pass <code>default-item-size</code> as an estimate
          (here <code>1000</code>) for the initial scroll height and for far-target navigation; measured values replace it
          locally and only the affected range re-flows. When rows are tall, remember <code>buffer-before</code> /
          <code>buffer-after</code> count <em>rows</em>, not pixels - the default <code>5</code> keeps five extra rows mounted on
          each side, which for ~1,000px posts is a lot of DOM; <code>1</code> is usually enough.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;template>
  &lt;VirtualScroll
    class=&quot;feed&quot;
    :items=&quot;posts&quot;
    :container=&quot;scrollContainer&quot;
    :item-size=&quot;0&quot;
    :default-item-size=&quot;1000&quot;
    :buffer-before=&quot;1&quot;
    :buffer-after=&quot;1&quot;
    :load-distance=&quot;1600&quot;
    :loading=&quot;loading&quot;
    @load=&quot;loadMore&quot;
  >
    &lt;template #item=&quot;{ item }&quot;>
      &lt;article class=&quot;post&quot;>
        &lt;h2>{{ item.title }}&lt;/h2>
        &lt;img
          :src=&quot;item.image&quot;
          :width=&quot;item.imageWidth&quot;
          :height=&quot;item.imageHeight&quot;
          :alt=&quot;item.title&quot;
          class=&quot;cover&quot;
        />
        &lt;div class=&quot;content&quot;>{{ item.content }}&lt;/div>
      &lt;/article>
    &lt;/template>

    &lt;template v-if=&quot;hasMore&quot; #loading>
      &lt;div class=&quot;feed-loading&quot;>Loading more posts…&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>4. Load the next batch as it is needed</h3>
        <p>
          <code>load-distance</code> (default <code>200</code>; raise it for tall rows) is how far from the end, in pixels, the
          <code>@load</code> event fires. Drive it from state: keep a <code>loading</code> flag that both reveals your
          <code>#loading</code> slot while a fetch is in flight and suppresses repeated <code>load</code> events (early-return
          while true). The <code>#loading</code> slot stays mounted and merely hidden via CSS while <code>loading</code> is
          false, so it reserves its space - keeping the total scrollable height and the far-end scroll target correct while a
          fetch runs. Only render it while a load is actually expected (<code>v-if=&quot;hasMore&quot;</code>), otherwise the
          reserved space lingers after the data runs out and you scroll past an empty stretch. Trigger the same handler
          from an explicit “Load more” button if you prefer paging over auto-load; the wiring is identical. Whatever the trigger,
          <em>append</em> the resolved batch to <code>items</code> so existing indices and offsets stay untouched.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>

<style scoped>
.example-blog-post {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2.5rem 1.25rem;
  border-bottom: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
}

.example-blog-title {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.25;
}

.example-blog-meta {
  margin-block: 0.5rem 1.25rem;
  font-size: 0.8125rem;
  opacity: 0.6;
}

.example-blog-image {
  display: block;
  inline-size: 100%;
  block-size: auto;
  object-fit: cover;
  border-radius: var(--radius-box, 1rem);
  margin-block-end: 1.25rem;
}

.example-blog-intro {
  font-size: 1.0625rem;
  font-weight: 600;
  margin-block-end: 0.75rem;
}

.example-blog-content {
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: pre-line;
  opacity: 0.85;
}

.example-blog-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  font-size: 0.8125rem;
  font-weight: 700;
}
</style>
