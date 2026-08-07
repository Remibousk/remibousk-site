import styles from './LogoRow.module.css';

/**
 * Intro statement section that follows the hero — replica of the original's
 * .framer-1f01agq frame (reference/mirror/home.html), which carries
 * id="work" (the sidebar "Work" link's anchor target).
 *
 * Note: despite this component's assigned name, the original section contains
 * no logo imagery — it is a single centered statement (GT Walsheim Pro Bold
 * 28px/1.2, #fff, max-width 530px). The company names (SUMM, IBM, ...) appear
 * later as portfolio headings owned by other components. Verified against the
 * mirror HTML (no <img> tags near the paragraph) and
 * reference/screenshots/home-{desktop,tablet,mobile}.png.
 *
 * No entrance animation — the original homepage has no appear effects.
 */
export default function LogoRow() {
  return (
    <section className={styles.section} id="work">
      <h3 className={styles.statement}>
        {/* Verbatim from content/home.md — do not re-wrap or "fix". */}
        {"For just about a decade, I've been leading design for founders, and global companies on new ventures, strategy and company defining experiences."}
      </h3>
    </section>
  );
}
