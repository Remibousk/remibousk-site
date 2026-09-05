'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './CaseStudiesAccordion.module.css';

/**
 * Collapsed-by-default disclosure around a case-study card grid.
 * The trigger keeps the existing "Case studies" heading type; the cards
 * inside are unchanged and only shown once opened.
 */
export default function CaseStudiesAccordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headingId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videos = panelRef.current?.querySelectorAll('video');
    if (!videos?.length) return;
    if (open) {
      videos.forEach((video) => {
        video.play().catch(() => {});
      });
    } else {
      videos.forEach((video) => video.pause());
    }
  }, [open]);

  return (
    <div className={styles.root}>
      <h3 id={headingId} className={styles.heading}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          Case studies
          <svg
            className={styles.chevron}
            data-open={open || undefined}
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M6 4 L10 8 L6 12"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div
        id={panelId}
        ref={panelRef}
        className={styles.panel}
        data-open={open || undefined}
        role="region"
        aria-labelledby={headingId}
        inert={!open}
      >
        <div className={styles.panelInner}>
          <div className={styles.panelBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}
