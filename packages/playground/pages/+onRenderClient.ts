import type { PageContextClient } from 'vike/types';

import { onRenderClient as onRenderClientVikeVue } from 'vike-vue/__internal/integration/onRenderClient';

/** True for the root URL (the welcome page): urlPathname excludes the base path. */
function isRootUrl(url?: string) {
  return url != null && url.replace(/\/+$/, '') === '';
}

export async function onRenderClient(pageContext: PageContextClient) {
  if (!document.startViewTransition || pageContext.isHydration) {
    await onRenderClientVikeVue(pageContext);
    return;
  }

  const oldUrl = pageContext.previousPageContext?.urlPathname;
  const newUrl = pageContext.urlPathname;
  const isPrefix = oldUrl != null && oldUrl !== newUrl && oldUrl.startsWith(newUrl);

  // Transitions touching the welcome page keep the horizontal slides;
  // everything else travels top-to-bottom.
  let type: 'forward' | 'back' | 'vertical';
  if (!isRootUrl(oldUrl) && !isRootUrl(newUrl)) {
    type = 'vertical';
  } else {
    type = (pageContext.isBackwardNavigation || isPrefix) ? 'back' : 'forward';
  }

  const transition = document.startViewTransition({
    update: async () => {
      // The incoming page must start at the top: reset the scroll position
      // instantly (never smooth) while the old snapshot is still frozen, so
      // neither the user nor the new snapshot sees a mid-page position.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      await onRenderClientVikeVue(pageContext);
    },
    types: [ type ],
  });

  await transition.finished;
}
