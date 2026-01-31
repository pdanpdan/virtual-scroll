import type { PageContextClient } from 'vike/types';

export function onPageTransitionStart(pageContext: PageContextClient) {
  document.documentElement.classList.add('page-is-transitioning');

  const oldUrl = pageContext.previousPageContext?.urlPathname;
  const newUrl = pageContext.urlPathname;
  const isPrefix = oldUrl != null && oldUrl !== newUrl && oldUrl.startsWith(newUrl);

  if (pageContext.isBackwardNavigation || isPrefix) {
    document.documentElement.classList.add('page-back-transition');
    document.documentElement.classList.remove('page-forward-transition');
  } else {
    document.documentElement.classList.add('page-forward-transition');
    document.documentElement.classList.remove('page-back-transition');
  }
}
