/**
 * Homepage first screen — centred intro headline only.
 * (Logo-hover / preview experiments are parked; company marks live on work sections.)
 */
import styles from './LogoHoverHero.module.css';

export const HERO_HEADLINE = 'Remi is a product designer who loves building.';

export default function LogoHoverHero() {
  return (
    <section
      className={styles.section}
      aria-label="Introduction"
      id="home-hero"
    >
      <div className={styles.stage}>
        <h1 className={styles.headline}>{HERO_HEADLINE}</h1>
      </div>
    </section>
  );
}
