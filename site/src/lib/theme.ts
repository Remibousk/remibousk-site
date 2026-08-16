export type FolioTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'folio-theme';
export const THEME_CHANGE_EVENT = 'folio-theme-change';

export function readTheme(): FolioTheme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark';
}

export function applyTheme(theme: FolioTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore quota / privacy-mode failures — the DOM value still holds.
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function toggleTheme() {
  applyTheme(readTheme() === 'light' ? 'dark' : 'light');
}

export function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}
