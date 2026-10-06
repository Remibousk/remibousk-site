import styles from './VersionHistoryTile.module.css';

export default function VersionHistoryTile() {
  return (
    <div className={styles.wrapper}>
      <a
        id="version-history"
        className={styles.tile}
        href="https://version-history.remibousk.com/"
        aria-label="Version History — read the SUMM case study"
      >
        <div className={styles.copy}>
          <h3 className={styles.title}>Version History</h3>
          <p className={styles.description}>
            Helping users understand changes and safely restore their work.
          </p>
        </div>
        <div className={styles.productPreview} aria-hidden="true">
          <img
            src="/images/version-history-saved-backups.png"
            width={1152}
            height={666}
            decoding="async"
            loading="lazy"
            alt=""
          />
        </div>
      </a>
    </div>
  );
}
