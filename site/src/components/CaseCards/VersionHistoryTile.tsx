import styles from './VersionHistoryTile.module.css';

export default function VersionHistoryTile() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Featured case study</p>
      <a
        id="version-history"
        className={styles.tile}
        href="https://version-history.remibousk.com/"
        aria-label="Version History — read the SUMM case study"
      >
        <div className={styles.copy}>
          <h3 className={styles.title}>
            <span className={styles.versionWord}>
              <span>V</span>
              <span className={styles.ersion}>ersion</span>
            </span>
            <span>History</span>
          </h3>
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
            alt=""
          />
        </div>
      </a>
    </div>
  );
}
