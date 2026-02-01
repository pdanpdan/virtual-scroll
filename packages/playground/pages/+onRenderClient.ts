import type { PageContextClient } from 'vike/types';

import { onRenderClient as onRenderClientVikeVue } from 'vike-vue/__internal/integration/onRenderClient';

export async function onRenderClient(pageContext: PageContextClient) {
  if (!document.startViewTransition || pageContext.isHydration) {
    await onRenderClientVikeVue(pageContext);
    return;
  }

  const oldUrl = pageContext.previousPageContext?.urlPathname;
  const newUrl = pageContext.urlPathname;

  const isPrefix = oldUrl != null && oldUrl !== newUrl && oldUrl.startsWith(newUrl);

  const type = (pageContext.isBackwardNavigation || isPrefix) ? 'back' : 'forward';

  const transition = document.startViewTransition({
    update: async () => {
      await onRenderClientVikeVue(pageContext);
    },
    types: [ type ],
  });

  await transition.finished;
}
