import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 — Remi Bouskila',
};

/**
 * Simple on-brand 404: --bg-0 background (set globally on <body>),
 * GT Walsheim Pro Bold heading, link back home.
 */
export default function NotFound() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>404</h1>
      <p className={styles.blurb}>This page doesn&apos;t exist.</p>
      <a href="/" className={styles.homeLink}>
        Go back home
      </a>
    </main>
  );
}
