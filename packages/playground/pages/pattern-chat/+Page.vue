<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { createSeededRandom } from '#/lib/random';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

interface Message {
  id: number;
  text: string;
  isMe: boolean;
  time: string;
}

const items = ref<Message[]>([]);

const {
  virtualScrollRef,
  scrollDetails,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
const isLoading = ref(false);
const isAtBottom = ref(true);
const hasNewMessages = ref(false);
// History is finite: past this limit there is nothing to load, so the
// loading indicator must not appear. Counts only the prepended history -
// items.length also grows from new messages at the bottom.
const HISTORY_LIMIT = 500;
const historyLoaded = ref(0);
const hasMoreHistory = computed(() => historyLoaded.value < HISTORY_LIMIT);
const virtualScrollbar = ref(true);

const ssrRange = computed(() => ({
  start: Math.max(0, items.value.length - 10),
  end: items.value.length,
}));
const initialScrollIndex = computed(() => items.value.length - 1);

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const random = createSeededRandom(12345);
let timeMock = (new Date('2026-01-10T21:12:23Z')).valueOf();

function getTimeMock() {
  timeMock += Math.floor(random() * 100000) + 3;
  return new Date(timeMock).toLocaleTimeString('en-US', {
    timeZone: 'Europe/Bucharest',
  });
}

function generateMessage(id: number, sentByMe?: boolean): Message {
  const isMe = sentByMe ?? random() > 0.5;
  const length = Math.floor(random() * 100) + 10;
  return {
    id,
    text: LOREM.slice(0, length),
    isMe,
    time: getTimeMock(),
  };
}

function loadMessages(count: number, prepend = false) {
  const newItems = [];
  const startId = prepend ? (items.value[ 0 ]?.id || 0) - count : (items.value.at(-1)?.id || 0) + 1;

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    newItems.push(generateMessage(id));
  }

  if (prepend) {
    items.value = [ ...newItems, ...items.value ];
  } else {
    items.value = [ ...items.value, ...newItems ];
  }
}

// Initial load
loadMessages(50);

// Auto-generate messages
let generateMessagesTimer: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
  const fn = () => {
    addMessage(LOREM.slice(0, Math.floor(random() * 100) + 10), false);

    generateMessagesTimer = setTimeout(fn, 5000 + Math.random() * 20000);
  };

  generateMessagesTimer = setTimeout(fn, 5000 + Math.random() * 20000);
});

onUnmounted(() => {
  if (generateMessagesTimer != null) {
    clearTimeout(generateMessagesTimer);
    generateMessagesTimer = null;
  }
});

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;

  const bottomThreshold = 20;
  const remaining = details.totalSize.height - (details.scrollOffset.y + details.viewportSize.height);
  isAtBottom.value = remaining < bottomThreshold;

  if (isAtBottom.value) {
    hasNewMessages.value = false;
  }

  // Infinite scroll upwards (history)
  if (details.scrollOffset.y < 100 && !isLoading.value && !details.isProgrammaticScroll && items.value.length > 0 && hasMoreHistory.value) {
    isLoading.value = true;
    setTimeout(() => {
      const count = Math.min(20, HISTORY_LIMIT - historyLoaded.value);
      historyLoaded.value += count;
      loadMessages(count, true);

      // Wait for VirtualScroll to restores scroll
      // Additional small delay to ensure all measurements and corrections are done
      setTimeout(() => {
        isLoading.value = false;
      }, 50);
    }, 500);
  }
}

const newMessage = ref('');

function addMessage(text: string, isMe: boolean) {
  const id = (items.value.at(-1)?.id || 0) + 1;
  const wasAtBottom = isAtBottom.value;

  items.value = [
    ...items.value,
    {
      id,
      text,
      isMe,
      time: (new Date()).toLocaleTimeString('en-US', {
        timeZone: 'Europe/Bucharest',
      }),
    },
  ];

  if (wasAtBottom || isMe) {
    nextTick(() => {
      virtualScrollRef.value?.scrollToIndex(items.value.length - 1, 0, { align: 'end', behavior: 'smooth' });
    });
  } else if (!isMe) {
    hasNewMessages.value = true;
  }
}

function sendMessage() {
  if (!newMessage.value.trim()) {
    return;
  }

  const text = newMessage.value;
  newMessage.value = '';
  addMessage(text, true);

  // Response with random delay
  const delay = 500 + Math.random() * 2000;
  setTimeout(() => {
    addMessage(`Response to: "${ text.slice(0, 20) }..."`, false);
  }, delay);
}

function scrollToBottom() {
  virtualScrollRef.value?.scrollToIndex(items.value.length - 1, 0, { align: 'end', behavior: 'smooth' });
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-1">Chat Interface</span>
    </template>

    <template #description>
      A chat interface demonstration with {{ items.length.toLocaleString() }} messages. Features <strong>dynamic item heights</strong>, <strong>initial scroll to bottom</strong>, <strong>scroll restoration</strong> when loading history (scrolling up), <strong>smooth scrolling</strong> for new messages, and <strong>sticky footer</strong> for the input block.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Chat with history loading and auto-scroll
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>
      </div>
    </template>

    <div class="example-container flex flex-col overflow-auto">
      <div v-if="isLoading" class="absolute top-2 inset-x-0 flex justify-center z-10">
        <span class="loading loading-spinner loading-sm text-primary" />
      </div>

      <div
        v-if="hasNewMessages && !isAtBottom"
        class="absolute bottom-20 inset-x-0 flex justify-center z-10 px-4"
      >
        <button
          class="btn btn-primary btn-sm @4xl:btn-md shadow-strong shadow-primary/40 gap-2 rounded-full border-2 border-white/10"
          @click="scrollToBottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="size-4 mt-1 animate-bounce"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
          </svg>
          <span class="font-black text-xs small-caps tracking-tight">New messages</span>
        </button>
      </div>

      <VirtualScroll
        ref="virtualScrollRef"
        class="flex-1"
        :debug="debugMode"
        :items="items"
        restore-scroll-on-prepend
        :default-item-size="65"
        :ssr-range="ssrRange"
        :initial-scroll-index="initialScrollIndex"
        initial-scroll-align="end"
        :scroll-padding-start="10"
        :scroll-padding-end="10"
        :gap="12"
        sticky-footer
        :virtual-scrollbar="virtualScrollbar"
        aria-label="Chat messages"
        @scroll="onScroll"
      >
        <template #item="{ item }">
          <div class="chat px-4" :class="item.isMe ? 'chat-end' : 'chat-start'">
            <div class="chat-bubble text-sm shadow-sm" :class="item.isMe ? 'chat-bubble-primary' : ''">
              {{ item.text }}
            </div>
            <div class="chat-footer opacity-60 mt-1">{{ item.time }}</div>
          </div>
        </template>

        <template #footer>
          <div class="p-3 @4xl:p-4 bg-base-200 border-t border-base-300 flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="input input-bordered input-sm @4xl:input-md w-full"
              aria-label="Message"
              @keydown.enter="sendMessage"
            />
            <button class="btn btn-primary btn-sm @4xl:btn-md px-6" @click="sendMessage">Send</button>
          </div>
        </template>
      </VirtualScroll>
    </div>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A chat is a vertical list that grows at the bottom with rows of uneven height - one of the harder cases for a
          virtualized list to auto-scroll well. Two behaviors matter: a newly appended message scrolls into view so
          the list &quot;sticks&quot; to the newest message, and when the user has scrolled up to read history the viewport is
          never yanked away from them. The mechanism is a single <code>@scroll</code> handler that derives &quot;am I at the
          bottom?&quot; from the emitted <code>ScrollDetails</code>, plus a programmatic end-anchored
          <code>scrollToIndex()</code> after each append; loading older messages relies on the engine's prepend restoration so
          the line being read stays put. The main tradeoff: because bubbles have measured (dynamic) heights, rows must mount and
          be measured, and an end-anchored scroll keeps re-clamping until those measurements settle.
        </p>

        <h3>1. Size the host and choose a sizing mode</h3>
        <p>
          <code>VirtualScroll</code> renders its own scrollable host, and virtualization needs a known viewport: if the host is
          not height-constrained it grows with its content and never scrolls. Give it a definite height, or flex/grid space with
          <code>min-height: 0</code> so the box can shrink below its content and actually scroll.
        </p>
        <p>
          Fixed-height or variable-height rows is the first sizing decision. If every row has the same height, pass a numeric
          <code>item-size</code> and the engine derives the whole layout arithmetically with no DOM measurement. Chat bubbles wrap
          to different heights, so instead leave <code>item-size</code> unset: that puts the list in dynamic mode, where each
          mounted row is measured with a <code>ResizeObserver</code> and its measured size drives layout. Dynamic rows need
          <strong>real data</strong> - <code>items</code> is an array of message objects read from the <code>#item</code> slot's
          <code>item</code> prop, because there is no height oracle an index-only array could fall back on. While a row is
          unmeasured the engine lays it out at <code>default-item-size</code> (default <code>40</code>); set it near the average
          rendered row so the scrollbar, total height, and far <code>scrollToIndex</code> targets stay accurate until the
          measurements arrive. Keep each bubble sized to its content.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { ref } from 'vue';

const chatScroll = ref();
const messages = ref([{ id: 1, text: 'Hello', isMe: true }]);
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    ref=&quot;chatScroll&quot;
    class=&quot;chat-list&quot;
    :items=&quot;messages&quot;
    :default-item-size=&quot;64&quot;
    @scroll=&quot;onScroll&quot;
  >
    &lt;template #item=&quot;{ item }&quot;>
      &lt;div class=&quot;chat&quot; :class=&quot;item.isMe ? 'chat--me' : 'chat--other'&quot;>{{ item.text }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
/* The scroll host needs a definite height; min-h-0 lets it shrink inside a
   column flex parent so the list can actually scroll. */
.chat-list {
  height: 480px;
}
.chat {
  padding: 8px 12px;
  margin-block: 4px;
  border-radius: 12px;
}
.chat--me {
  text-align: right;
}
&lt;/style>"
        />

        <h3>2. Open at the newest message</h3>
        <p>
          To start showing the tail rather than the empty top, point <code>initial-scroll-index</code> at the last row and pair
          it with <code>initial-scroll-align="end"</code> so that row is pinned to the bottom edge on mount. Pin the
          <em>last</em> index rather than guessing a pixel offset: the engine re-clamps an end-anchored target while dynamic
          measurements settle, so even on variable-height rows the first frame corrects itself flush against the real end.
        </p>

        <h3>3. Stick to the bottom only while the user is there</h3>
        <p>
          Two intents are in tension: when the user is at the newest message an incoming append should scroll the list down to
          reveal it, but when the user has scrolled up to read history the same append must <em>not</em> move the viewport.
          Resolve this in one <code>@scroll</code> handler that keeps a reactive &quot;at the bottom?&quot; flag.
        </p>
        <p>
          The geometry is plain arithmetic over <code>ScrollDetails</code>: <code>totalSize.height</code> is the full content
          height, <code>scrollOffset.y</code> is where the viewport top sits, and adding <code>viewportSize.height</code> locates
          the viewport bottom - so <code>totalSize.height − (scrollOffset.y + viewportSize.height)</code> is the distance
          remaining to the content end (virtual units, which equal rendered pixels once rows are measured). Compare it to a
          small threshold of a few tens of pixels that absorbs rounding and the scrollbar, so &quot;at the bottom&quot; is
          forgiving.
        </p>
        <p>
          Read that flag <em>before</em> mutating <code>items</code>. If the user was at the bottom - or the append is their own
          action, which should always be revealed - scroll after the new row mounts: call <code>scrollToIndex(items.length − 1,
            0, { align: 'end', behavior: 'smooth' })</code> inside <code>nextTick</code>. End alignment is the right target even
          though the new row's height is not measured yet, because an end-anchored scroll keeps re-clamping until the settling
          measurements define the true end. If the user was <em>not</em> at the bottom and the row is incoming, leave the
          viewport untouched and surface a &quot;jump to newest&quot; affordance instead - never steal the reader's position.
        </p>
        <p>
          Choose the scroll <code>behavior</code> to match the traffic: <code>'smooth'</code> animates a gentle follow but can
          look laggy when several rows land in a burst, while <code>'auto'</code> snaps instantly and stays responsive under
          load.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="import type { ScrollDetails } from '@pdanpdan/virtual-scroll';

import { nextTick, ref } from 'vue';

const isAtBottom = ref(true);
const hasNewMessages = ref(false);

// Distance from the bottom edge of the viewport to the content end, in virtual
// units (VU). With dynamic heights one VU equals one rendered pixel, so the
// math is the same as on a plain scroll container.
function onScroll(d: ScrollDetails) {
  const remaining =
    d.totalSize.height - (d.scrollOffset.y + d.viewportSize.height);
  isAtBottom.value = remaining &lt; 20; // within 20px of the newest message
  if (isAtBottom.value) hasNewMessages.value = false;
}

function append(msg: { id: number; text: string; isMe: boolean }) {
  const wasAtBottom = isAtBottom.value; // read BEFORE mutating the list
  messages.value = [...messages.value, msg];

  if (wasAtBottom || msg.isMe) {
    // Let the new row mount, then pin the last message to the bottom edge.
    // align: 'end' keeps re-clamping while dynamic measurements settle, so the
    // first jump lands flush even though the row's real height is unknown yet.
    nextTick(() => {
      chatScroll.value?.scrollToIndex(messages.value.length - 1, 0, {
        align: 'end',
        behavior: 'smooth',
      });
    });
  } else {
    // The user scrolled up to read history: never yank the viewport. Surface a
    // &quot;New messages&quot; button (hasNewMessages) that jumps on click instead.
    hasNewMessages.value = true;
  }
}"
        />

        <h3>4. Prepend history without losing your place</h3>
        <p>
          Loading older messages prepends to the top of the list, which otherwise lets the browser's scroll anchor drift and
          yanks the user away from the line they were reading. The <code>restore-scroll-on-prepend</code> prop (default
          <code>false</code>) makes the engine hold the first visible row at the same screen offset across the prepend - add it
          whenever your list can grow at the start (paged-up history, infinite scroll upward).
        </p>
        <p>
          Trigger the load from the same <code>@scroll</code> handler, guarded so it cannot fire redundantly: only when the
          viewport is near the top (<code>scrollOffset.y</code> below a small threshold), the scroll was user-driven (the
          <code>isProgrammaticScroll</code> flag in <code>ScrollDetails</code> is <code>false</code>), no load is already running,
          and more history remains. Unshift the older batch and replace <code>items</code> wholesale (a fresh array) so the
          engine re-initializes against the new length while the restoration prop keeps the anchor stable.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="import { ref } from 'vue';

const hasMoreHistory = ref(true);
const isLoading = ref(false);

// Called from the scroll handler while the user is near the top (&lt; 100px),
// not mid-programmatic scroll, and not already loading.
function loadOlder() {
  if (isLoading.value || !hasMoreHistory.value) return;
  isLoading.value = true;

  // Simulated fetch: the new batch is PREPENDED (older messages go first).
  setTimeout(() => {
    const older = Array.from({ length: 20 }, (_, i) => ({
      id: messages.value[0].id - 20 + i,
      text: `older #${i}`,
      isMe: false,
    }));
    messages.value = [...older, ...messages.value];
    hasMoreHistory.value = messages.value.length &lt; 10_000;
    isLoading.value = false;
  }, 500);
}"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
