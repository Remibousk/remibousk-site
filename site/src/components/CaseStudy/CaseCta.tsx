import styles from './CaseStudy.module.css';

/**
 * Up-arrow icon next to "Back to top". The original renders it as an
 * SVG mask (framer-CulHx) rotated 15deg; path copied verbatim.
 */
function ArrowUpIcon() {
  return (
    <svg
      className={styles.backToTopIcon}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 0 8 L 1.41 9.41 L 7 3.83 L 7 16 L 9 16 L 9 3.83 L 14.58 9.42 L 16 8 L 8 0 Z"
        fill="currentColor"
        transform="translate(4 4)"
      />
    </svg>
  );
}

/**
 * Closing CTA panel shared by case-study pages:
 * "Interested in getting into the detaills?" (typo
 * intentional), a "Get in touch" mailto button and a "Back to top" link
 * that scrolls to the top of the page (#case-top on CaseLayout).
 */
export default function CaseCta() {
  return (
    <section className={styles.cta}>
      <div className={`${styles.ctaRow} ${styles.ctaHeadingRow}`}>
        <h3 className={styles.sectionHeading}>
          Interested in getting into the detaills?
        </h3>
        <div className={styles.ctaSpacer} aria-hidden="true" />
      </div>
      <div className={`${styles.ctaRow} ${styles.ctaLinksRow}`}>
        <a className={styles.ctaButton} href="mailto:remi.bouskila@gmail.com">
          <h3>Get in touch</h3>
        </a>
        <a className={styles.backToTop} href="#case-top">
          <h5>Back to top</h5>
          <ArrowUpIcon />
        </a>
      </div>
    </section>
  );
}
