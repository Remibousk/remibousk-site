import styles from './MobileWebTile.module.css';

export default function MobileWebTile() {
  return (
    <div className={styles.wrapper}>
      <a
        id="mobile-web"
        className={styles.tile}
        href="https://mobile-web.remibousk.com/"
        aria-label="Mobile web — read the SUMM case study"
      >
        <div className={styles.copy}>
          <h3 className={styles.title}>Mobile web</h3>
          <p className={styles.description}>
            Making a complex financial workflow seamless on mobile.
          </p>
        </div>
        <div className={styles.productPreview} aria-hidden="true">
          <img
            className={`${styles.phone} ${styles.phoneOnboarding}`}
            src="/images/mobile-web-onboarding.png"
            width={804}
            height={1662}
            decoding="async"
            alt=""
          />
          <img
            className={`${styles.phone} ${styles.phoneReports}`}
            src="/images/mobile-web-reports.png"
            width={804}
            height={1650}
            decoding="async"
            alt=""
          />
        </div>
      </a>
    </div>
  );
}
