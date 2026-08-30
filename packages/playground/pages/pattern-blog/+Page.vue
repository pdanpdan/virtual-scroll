<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, onMounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
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
      :default-item-size="360"
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
          <p>Seeded by <code class="font-mono">{{ seed }}</code> — scroll to load more posts</p>
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
            loading="lazy"
            class="example-blog-image"
          />
          <p class="example-blog-intro">{{ item.subtitle }}</p>
          <div class="example-blog-content">{{ item.content }}</div>
        </article>
      </template>

      <template #loading>
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
