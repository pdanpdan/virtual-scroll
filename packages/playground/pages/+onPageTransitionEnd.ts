export function onPageTransitionEnd() {
  document.documentElement.classList.remove('page-is-transitioning', 'page-back-transition', 'page-forward-transition', 'page-vertical-transition');
}
