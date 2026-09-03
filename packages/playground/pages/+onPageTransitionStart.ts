import type { PageContextClient } from 'vike/types';

/** True for the root URL (the welcome page): urlPathname excludes the base path. */
function isRootUrl(url?: string) {
  return url != null && url.replace(/\/+$/, '') === '';
}

export function onPageTransitionStart(pageContext: PageContextClient) {
  document.documentElement.classList.add('page-is-transitioning');

  const oldUrl = pageContext.previousPageContext?.urlPathname;
  const newUrl = pageContext.urlPathname;
  const isPrefix = oldUrl != null && oldUrl !== newUrl && oldUrl.startsWith(newUrl);

  // Transitions touching the welcome page keep the horizontal slides;
  // everything else travels top-to-bottom.
  if (!isRootUrl(oldUrl) && !isRootUrl(newUrl)) {
    document.documentElement.classList.add('page-vertical-transition');
    document.documentElement.classList.remove('page-forward-transition', 'page-back-transition');
    return;
  }

  if (pageContext.isBackwardNavigation || isPrefix) {
    document.documentElement.classList.add('page-back-transition');
    document.documentElement.classList.remove('page-forward-transition', 'page-vertical-transition');
  } else {
    document.documentElement.classList.add('page-forward-transition');
    document.documentElement.classList.remove('page-back-transition', 'page-vertical-transition');
  }
}
