const BASE_URL = import.meta.env.BASE_URL;

export function normalizeHref(href: string, addBase: boolean = true) {
  const url = addBase === true && href.startsWith(BASE_URL) === false ? `${ BASE_URL }/${ href }` : href;
  const split = url.split('/').filter((t) => t.length > 0);
  return `/${ split.join('/') }${ split.at(-1)?.includes('.') ? '' : '/' }`;
}

export function matchHref(href: string, urlPathname: string) {
  const normalizedHref = normalizeHref(href, false);
  return urlPathname === href
    || urlPathname === normalizedHref
    || (normalizedHref !== '/' && typeof urlPathname === 'string' && urlPathname.startsWith(normalizedHref) && /[^#\w\s-]/.test(urlPathname[ normalizedHref.length ]));
}

export function extractUrlPathname(href: string) {
  return normalizeHref(href.startsWith(BASE_URL) ? href.slice(BASE_URL.length) : href, false);
}
