import type { ReactNode } from 'react';
import styles from './CaseStudy.module.css';

/**
 * Meta label/value block ("Role:" / "Lead Designer" ...). `wide` renders the
 * 418px value column used for What/Outcome/Overview. String values become a
 * single <p>; pass ReactNode children (e.g. multiple <p className={metaValue}>)
 * for multi-paragraph values.
 */
export function MetaGroup({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const value =
    typeof children === 'string' ? (
      <p className={styles.metaValue}>{children}</p>
    ) : (
      children
    );
  return (
    <div className={styles.metaGroup}>
      <h6 className={styles.metaLabel}>{label}</h6>
      <div className={wide ? styles.metaTextWide : undefined}>{value}</div>
    </div>
  );
}

/**
 * Case-study page header card: client eyebrow, big title, tag chip row
 * (single clipped row like the original; `tagsWrap` for /summ-design-system
 * which wraps), then the Role/When | What/Outcome meta grid.
 *
 * `left` / `right` are the two meta columns; `tightLeft` reproduces the
 * 10px column gap used on /ctc (others use 20px).
 */
export default function CaseHero({
  client,
  title,
  tags,
  tagsWrap = false,
  tightLeft = false,
  left,
  right,
}: {
  client: string;
  title: string;
  tags: string[];
  tagsWrap?: boolean;
  tightLeft?: boolean;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <div className={styles.heroTitles}>
        <h5 className={styles.eyebrow}>{client}</h5>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={tagsWrap ? styles.tagsWrap : styles.tags}>
        {tags.map((tag) => (
          <div key={tag} className={styles.tagChip}>
            <h4>{tag}</h4>
          </div>
        ))}
      </div>
      <div className={styles.metaRow}>
        <div
          className={
            tightLeft
              ? `${styles.metaLeft} ${styles.metaLeftTight}`
              : styles.metaLeft
          }
        >
          {left}
        </div>
        <div className={styles.metaRight}>{right}</div>
      </div>
    </header>
  );
}
