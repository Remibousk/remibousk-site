import Image from 'next/image';
import styles from './IbmSection.module.css';

/**
 * IBM homepage tile: "IBM / Senior product designer" heading plus a
 * bordered tile containing a single static photo (two tablets floating
 * over a night city skyline).
 *
 * Per reference/mirror/home.html this is two stacked images, not one:
 *  - GfK2zw3GyOZKJzxnmiYKSelq7C8.jpeg (2688x1792) — a full-bleed
 *    object-fit:cover background layer of the same photo, filling the
 *    tile's padded box edge-to-edge.
 *  - 9rn1IHwwCyD8QpLGA1imMjURhw.png (5233x3320, aspect ~1.576) — the sharp
 *    foreground image. On real desktop (Framer's own >=1423px breakpoint)
 *    it's object-fit:cover (fills the tile, background invisible). On
 *    tablet/mobile it's object-fit:contain in a fixed-aspect box, so the
 *    jpeg shows through as letterbox strips (confirmed in
 *    reference/screenshots/home-tablet.png and home-mobile.png).
 *  Reproduced here at our own 809/810 + 1199/1200 breakpoints instead of
 *  Framer's 1423px one — identical result at the 3 tested widths
 *  (390/834/1440).
 *
 * No carousel/marquee here — unlike SiteMinder, this section is just a
 * single static image. No entrance animation either: the original homepage
 * carries no Framer appear effects.
 */
export default function IbmSection() {
  return (
    <section className={styles.section} aria-label="IBM — Senior product designer">
      <div className={styles.header}>
        <h2 className={styles.title}>IBM</h2>
        <p className={styles.role}>Senior product designer</p>
      </div>

      <div className={styles.tile}>
        <Image
          src="/images/GfK2zw3GyOZKJzxnmiYKSelq7C8.jpeg"
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1200px) 1200px, 100vw"
          className={styles.tileBg}
        />
        <div className={styles.fgWrap}>
          <Image
            src="/images/9rn1IHwwCyD8QpLGA1imMjURhw.png"
            alt="Two tablets displaying banking app dashboards, floating over a night city skyline"
            width={5233}
            height={3320}
            sizes="(min-width: 1200px) 1200px, 100vw"
            className={styles.fgImg}
          />
        </div>
      </div>
    </section>
  );
}
