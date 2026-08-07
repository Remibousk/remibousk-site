'use client';

import Carousel from '@/components/Carousel/Carousel';
import styles from './CameraRoll.module.css';

/**
 * The 8 photos in the original's "Camera roll" draggable strip
 * (reference/mirror/home.html, data-framer-name="Camera roll" card,
 * class "framer-1eg7l57"). Filenames/dimensions/order copied straight from
 * the mirror's <img> tags; all 8 files already exist in public/images (see
 * assets/raw/manifest.csv). Alt text written from looking at each image —
 * the original ships every <img> with an empty alt.
 */
const PHOTOS = [
  {
    src: '/images/VWRV7PRCL4CFbswqBQ7yJi0duA.jpeg',
    width: 2170,
    height: 1448,
    alt: "Remi wearing sunglasses and a flat cap, standing with two kids in front of a thatched-roof beach bar",
  },
  {
    src: '/images/nQv3RxXHQSNgjdu3ufOjrVgBIk.jpeg',
    width: 1024,
    height: 683,
    alt: 'A friend taking a photo with a compact camera under string lights at an outdoor event',
  },
  {
    src: '/images/l5UzQ5SrhAbtHHWg0ImghxSsM.jpeg',
    width: 1024,
    height: 683,
    alt: 'Friends smiling around an outdoor dinner table at night, lit by string lights',
  },
  {
    src: '/images/V3drw79ZHVUBCQpJR543IOC2Qg.png',
    width: 640,
    height: 640,
    alt: 'A dramatic low-angle photo of a brutalist high-rise tower against a bright sky',
  },
  {
    src: '/images/0SosBthboI3Wz9dyLQ4IBqQwN0U.jpg',
    width: 1024,
    height: 1365,
    alt: 'A brutalist concrete office building with cylindrical towers and a "Now Leasing" sign',
  },
  {
    src: '/images/WZqAz8scjXuhv66j8ZIoj3SHOU.jpeg',
    width: 1024,
    height: 1280,
    alt: 'A brutalist apartment building with a grid of balconies, photographed from below under a stormy sky',
  },
  {
    src: '/images/xsnsylPTXG0iZpnJsM8vCNOyaUY.jpg',
    width: 1024,
    height: 1135,
    alt: 'Rows of small potted plants lining balcony railings in a building atrium, seen from below',
  },
  {
    src: '/images/QSgERR7EdJDoIRfXjlNxUROlpo.jpg',
    width: 1024,
    height: 768,
    alt: 'A green tent pitched next to a 4WD parked among tall trees at a bush campsite',
  },
] as const;

/**
 * "Camera roll" card: a bordered, rounded panel containing a muted label and
 * a photo carousel.
 *
 * The original is a Framer Slideshow with `autoPlayControl: true` and
 * `intervalControl: 5` — it advances every 5 seconds, pausing while the
 * pointer is over it — plus `dragControl: true` (grab/grabbing cursor) and
 * `progressOptions.showProgressDots: true`. It has no arrow buttons
 * (`arrowOptions.showMouseControls: false`). Dot styling from the same props:
 * dotSize 4, dotsGap 12, dotsInset 10, dotsPadding 6, dotsRadius 200,
 * dotsFill rgb(255,255,255), dotsOpacity 0.5, dotsActiveOpacity 1,
 * dotsBackground rgba(0,0,0,0.2). borderRadius 8, gap 10.
 *
 * Measured from reference/mirror/home.html:
 * - Card: bg var(--bg-1) (#1c1924), border 1px solid var(--bg-3) (#201d2a),
 *   border-radius 8px, height 348px (desktop), flex column, gap 16px.
 * - Label "Camera roll": p, color var(--text-muted), Inter Regular 16px
 *   (confirmed via live computed styles — a different family/size than the
 *   GT Walsheim 13px "Linkedin" / "copy email" row in ContactSection).
 */
export default function CameraRoll() {
  return (
    <div className={styles.card}>
      <p className={styles.label}>Camera roll</p>
      <div className={styles.stripWrap}>
        <Carousel
          className={styles.carousel}
          frameClassName={styles.frame}
          ariaLabel="Camera roll photos"
          gap={10}
          borderRadius={8}
          autoPlaySeconds={5}
          dots
          dotsClassName={styles.dots}
          dotClassName={styles.dot}
          slideClassName={styles.slide}
          slides={PHOTOS.map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.src}
              src={photo.src}
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              className={styles.image}
              draggable={false}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        />
      </div>
    </div>
  );
}
