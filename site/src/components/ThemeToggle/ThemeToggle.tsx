'use client';

import { useSyncExternalStore } from 'react';
import {
  readTheme,
  subscribeTheme,
  toggleTheme,
  type FolioTheme,
} from '@/lib/theme';
import styles from './ThemeToggle.module.css';

function getServerSnapshot(): FolioTheme {
  return 'dark';
}

/**
 * Compact light/dark switch for the left nav. Dark (Velvet) is the default
 * look; light applies Linen Folio. No labels — the thumb position is the
 * only signal.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, getServerSnapshot);
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className={styles.toggle}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      onClick={toggleTheme}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
}
