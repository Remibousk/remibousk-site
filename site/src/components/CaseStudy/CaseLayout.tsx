import type { ReactNode } from 'react';
import CaseNav from './CaseNav';
import styles from './CaseStudy.module.css';

/**
 * Page scaffold shared by all four case-study pages: centered flex row with
 * the sticky CaseNav on the left and the main content column (max 1200px,
 * 200px section gap; /ctc uses a tighter 16px gap and a 1056px cap) on the
 * right. Collapses to a single column below 810px.
 *
 * The wrapper carries id="case-top" as the "Back to top" scroll target.
 */
export default function CaseLayout({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'ctc';
}) {
  return (
    <div className={styles.page} id="case-top">
      <div className={styles.row}>
        <CaseNav />
        <main className={variant === 'ctc' ? styles.mainCtc : styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
