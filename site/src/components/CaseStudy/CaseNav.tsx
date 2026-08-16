import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import styles from './CaseStudy.module.css';

/**
 * "remi." wordmark used on case-study pages ("Remi Purprledot" in the
 * original): 195x51 viewBox, letters #E0E0E0 with two #7C3AED purple dots.
 * Exact path data copied from the svg-templates block in
 * reference/mirror/ctc.html (symbol #svg1495752116_1220).
 */
function RemiPurpleDotLogo() {
  return (
    <svg viewBox="0 0 195 51" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="remi.">
      <path
        d="M83.99 49.36h14.28V23.99c0-2.84 0-10.58 8.08-10.58 7.14 0 7.14 7.4 7.14 9.98v25.97h14.28V23.3c0-2.67 0-9.89 7.91-9.89 7.31 0 7.31 6.71 7.31 10.58v25.37h14.28V23.3c0-10.58-.69-13.76-5.16-18.49-3.87-4.04-9.2-4.82-12.55-4.82-7.31 0-12.21 3.87-15.14 8.51-3.78-7.05-9.54-8.51-13.76-8.51-8.94 0-12.04 4.73-13.16 6.71h-.17V1.63H84v47.73h-.01ZM43.57 20.21c.6-2.84 3.44-8.17 10.84-8.17s10.23 5.33 10.84 8.17H43.57ZM63.26 34.4c-1.98 2.49-4.3 4.47-8.69 4.47-5.59 0-10.32-3.35-11.18-9.03h35.78c.17-1.12.34-1.89.34-3.78C79.51 11.53 68.85 0 54.31 0S29.28 12.3 29.28 25.63c0 14.19 11.61 25.28 25.29 25.28 4.9 0 9.63-1.46 13.59-4.3 4.04-2.75 7.4-6.88 9.72-12.21H63.26ZM14.28.82H0v47.73h14.28V.82Z"
        fill="currentColor"
      />
      <path
        d="M23.58 14.78c3.99 0 7.23-3.24 7.23-7.23S27.57.32 23.58.32s-7.23 3.24-7.23 7.23 3.24 7.23 7.23 7.23Z"
        fill="#7C3AED"
      />
      <path d="M178.03 1.34h-14.28v47.73h14.28V1.34Z" fill="currentColor" />
      <path
        d="M187.33 35.11c3.99 0 7.23 3.24 7.23 7.23s-3.24 7.23-7.23 7.23-7.23-3.24-7.23-7.23 3.24-7.23 7.23-7.23Z"
        fill="#7C3AED"
      />
    </svg>
  );
}

/** Tabler chevron-left, exact copy of symbol #svg139064711_302 in the mirror. */
function ChevronLeftIcon() {
  return (
    <svg
      className={styles.backIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

/**
 * Sticky top-left nav card shown on every case-study page: purple-dot
 * "remi." logo linking home, a hairline divider, and a "Go back" link.
 * (The homepage's full sidebar nav does not appear on case pages.)
 */
export default function CaseNav() {
  return (
    <nav className={styles.navSticky} aria-label="Case study navigation">
      <div className={styles.navOuter}>
        <div className={styles.navCard}>
          <a href="/" className={styles.navLogo} aria-label="remi. — home">
            <RemiPurpleDotLogo />
          </a>
          <div className={styles.navDivider} />
          <a href="/" className={styles.backLink}>
            <ChevronLeftIcon />
            <span>Go back</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
