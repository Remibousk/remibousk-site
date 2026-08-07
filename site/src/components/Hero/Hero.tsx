'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from './Hero.module.css';

/**
 * Homepage hero — replica of the original's "Hero" frame
 * (reference/mirror/home.html, .framer-1m9wofv, id="home-hero").
 *
 * Layout facts measured from the mirror CSS:
 * - Outer section wrapper (.framer-1uexi1g): padding 4px (16px on <=809px),
 *   max-width 1200px.
 * - Card (.framer-1m9wofv): bg #1c1924 (--bg-1), 1px solid #251f2e border,
 *   radius 8px, height 98vh, flex column justify-end, padding 4px 4px 32px,
 *   box-shadow 0 2px 7px 1px rgba(0,0,0,0.25), overflow clip, z-index 1.
 * - Blurb inner column is 73% wide (100% on phone), gap 10px.
 *
 * Background: the original renders an animated blurred purple "smoke" via a
 * WebGL <canvas> (Framer module, .framer-pmaj64-container, absolute inset
 * 0 0 0 1px, z-index -1 — the JS module is not mirrored). Replicated here as
 * layered CSS gradients (colors sampled from reference/screenshots/
 * hero-*.png: flat #1c1924 top ~40%, plateau #2d2640 at the bottom, wavy
 * blurred boundary) with a very slow drift animation on the blob layers.
 *
 * The chips ("Product" / "Design" / "Discovery" / "Strategy") are the
 * original's own self-contained SVG artwork files (gradient, gloss, icon and
 * outlined text are all inside each SVG) referenced as <img> exactly like the
 * original does — see the framer-ackz54 row in the mirror.
 *
 * Interactions (exact values from the page's own generated module,
 * reference/mirror/.../RUqqse2zCrL-…DKx8smEm.mjs):
 * - Every chip has `whileHover: {scale: 1.05, y: -2}` with transition
 *   `{type:'spring', bounce:0.25, duration:0.45}` (variant `ca`).
 * - The "Discovery" chip uses variant `la`: the same scale/y plus
 *   `boxShadow: 0px 2px 4px 0px rgba(0,0,0,0.25)`, and its `onMouseEnter`
 *   opens an overlay (Framer `<Overlay placement="bottom" alignment="center"
 *   offsetX=0.25 offsetY=-202.5>`) containing the 589x436 GIF
 *   wlDO7zczytEqqYcuQ3Sd77YDY.gif rendered 200px wide — an easter egg.
 *   The overlay fades in (opacity 0 -> 1, spring bounce 0.2 duration 0.4)
 *   and out again.
 *
 * The homepage has NO appear/scroll-reveal animations in the original (the
 * mirror HTML contains no `data-framer-appear-id` on `/`), so nothing here
 * animates in on load.
 */

/** Framer transition `ca`/`la`: spring, bounce 0.25, duration 0.45s. */
const CHIP_SPRING = { type: 'spring', bounce: 0.25, duration: 0.45 } as const;
/** Framer transition `ua`, used by the overlay fade. */
const OVERLAY_SPRING = { type: 'spring', bounce: 0.2, duration: 0.4 } as const;

const CHIPS = [
  {
    // 317x95 intrinsic; 159px wide on desktop/tablet, 134px on phone.
    src: '/images/Z1HsPDK51LLSFpUf0NVn0RzKY.svg',
    alt: 'Product',
    className: styles.chipProduct,
    width: 317,
    height: 95,
  },
  {
    // 290x95 intrinsic; 145px / 122px.
    src: '/images/lzIe6kX0aUa5HVA3kVOHdWm9O4.svg',
    alt: 'Design',
    className: styles.chipDesign,
    width: 290,
    height: 95,
  },
  {
    // 351x95 intrinsic; 176px / 148px. Carries the GIF easter egg.
    src: '/images/loJUIF65sQ3jhXYsC3s3x9OwchQ.svg',
    alt: 'Discovery',
    className: styles.chipDiscovery,
    width: 351,
    height: 95,
    easterEgg: true,
  },
  {
    // 333x93 intrinsic; 167px / 140px.
    src: '/images/6ck8xwcUoFJP6SVsYfqCjZLeW4.svg',
    alt: 'Strategy',
    className: styles.chipStrategy,
    width: 333,
    height: 93,
  },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [eggOpen, setEggOpen] = useState(false);

  const chipHover = (easterEgg: boolean) =>
    reduceMotion
      ? undefined
      : {
          scale: 1.05,
          y: -2,
          ...(easterEgg
            ? { boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.25)' }
            : {}),
        };

  return (
    <section className={styles.section}>
      <div className={styles.card} id="home-hero">
        <div className={styles.blurb}>
          <div className={styles.inner}>
            <p className={styles.eyebrow}>
              {"Hi, i'm Remi, a product designer with passion"}
            </p>
            <h1 className={styles.title}>
              I help companies build incredible products
            </h1>
            <div className={styles.love}>
              <p className={styles.loveLabel}>In love with:</p>
              <div className={styles.chips}>
                {CHIPS.map((chip) => (
                  <span
                    key={chip.alt}
                    className={`${styles.chipWrap} ${chip.className}`}
                    onMouseEnter={chip.easterEgg ? () => setEggOpen(true) : undefined}
                    onMouseLeave={chip.easterEgg ? () => setEggOpen(false) : undefined}
                  >
                    <motion.img
                      src={chip.src}
                      alt={chip.alt}
                      width={chip.width}
                      height={chip.height}
                      className={styles.chip}
                      whileHover={chipHover(Boolean(chip.easterEgg))}
                      transition={CHIP_SPRING}
                    />
                    {chip.easterEgg && (
                      <AnimatePresence>
                        {eggOpen && (
                          <motion.span
                            className={styles.egg}
                            role="dialog"
                            aria-label="Discovery"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={OVERLAY_SPRING}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/images/wlDO7zczytEqqYcuQ3Sd77YDY.gif"
                              alt=""
                              width={589}
                              height={436}
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Stand-in for the original's animated WebGL gradient canvas. */}
        <div className={styles.bg} aria-hidden="true">
          <div className={styles.bgBase} />
          <div className={styles.bgBlobLeft} />
          <div className={styles.bgBlobRight} />
        </div>
      </div>
    </section>
  );
}
