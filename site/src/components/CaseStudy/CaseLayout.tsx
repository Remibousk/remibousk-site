import type { ReactNode } from 'react';
import CaseNav from './CaseNav';
import ImageLightbox from './ImageLightbox';
import styles from './CaseStudy.module.css';

/**
 * Page scaffold shared by case-study pages: centered flex row with
 * the sticky CaseNav on the left and the main content column (max 1200px,
 * 200px section gap; /ctc uses a tighter 16px gap and a 1056px cap;
 * `tight` uses 80px for /siteminder-pay) on the
 * right. Collapses to a single column below 810px.
 *
 * The wrapper carries id="case-top" as the "Back to top" scroll target.
 */
export default function CaseLayout({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'ctc' | 'tight';
}) {
  const mainClass =
    variant === 'ctc'
      ? styles.mainCtc
      : variant === 'tight'
        ? styles.mainTight
        : styles.main;
  return (
    <div className={styles.page} id="case-top">
      <ImageLightbox />
      <div className={styles.row}>
        <CaseNav />
        <main className={mainClass}>{children}</main>
      </div>
    </div>
  );
}
