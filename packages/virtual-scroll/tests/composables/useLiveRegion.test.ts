import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import { useLiveRegion } from '../../src/composables/useLiveRegion';

const Harness = defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    const message = ref('');
    useLiveRegion(container, message);
    return { container, message };
  },
  render() {
    return h('div', { ref: 'container', class: 'host' });
  },
});

describe('useLiveRegion', () => {
  it('creates the region on the first announcement and updates it in place', async () => {
    const wrapper = mount(Harness);
    const host = wrapper.find('.host');

    // Nothing is announced (and nothing is added to the DOM) until there is text.
    expect(host.find('.virtual-scroll-live-region').exists()).toBe(false);

    (wrapper.vm as unknown as { message: string; }).message = 'Item 1 of 100';
    await nextTick();

    const region = host.find('.virtual-scroll-live-region');
    expect(region.exists()).toBe(true);
    expect(region.attributes('role')).toBe('status');
    expect(region.attributes('aria-live')).toBe('polite');
    expect(region.attributes('aria-atomic')).toBe('true');
    expect(region.attributes('style')).toContain('clip-path');
    expect(region.text()).toBe('Item 1 of 100');

    (wrapper.vm as unknown as { message: string; }).message = 'Item 2 of 100';
    await nextTick();

    // The same element is reused, so assistive technology sees one live region.
    expect(host.findAll('.virtual-scroll-live-region')).toHaveLength(1);
    expect(host.find('.virtual-scroll-live-region').text()).toBe('Item 2 of 100');
    wrapper.unmount();
  });

  it('removes the region when the component unmounts', async () => {
    const host = document.createElement('div');
    document.body.append(host);

    const wrapper = mount(Harness, { attachTo: host });
    (wrapper.vm as unknown as { message: string; }).message = 'Item 3 of 100';
    await nextTick();
    expect(host.querySelector('.virtual-scroll-live-region')).not.toBeNull();

    wrapper.unmount();
    expect(host.querySelector('.virtual-scroll-live-region')).toBeNull();
    host.remove();
  });
});
