'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import HeroParticles from '@/components/HeroParticles/HeroParticles';
import { preloadScenes } from '@/components/HeroParticles/particles';
import { HERO_SCENES, type HeroSceneId } from '@/components/HeroParticles/scenes';
import HeroTuner from '@/components/HeroTuner/HeroTuner';
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
 * The chips ("Product" / "Design" / "Discovery" / "Strategy" / "Build") are
 * self-contained SVG artwork (gradient, gloss, outlined text) referenced as
 * <img>.
 *
 * Interactions (exact values from the page's own generated module,
 * reference/mirror/.../RUqqse2zCrL-…DKx8smEm.mjs):
 * - Every chip has `whileHover: {scale: 1.05, y: -2}` with transition
 *   `{type:'spring', bounce:0.25, duration:0.45}` (variant `ca`).
 * - The "Discovery" chip uses variant `la`: the same scale/y plus
 *   `boxShadow: 0px 2px 4px 0px rgba(0,0,0,0.25)`. In the original its
 *   `onMouseEnter` also opened a 200px-wide GIF easter egg above the chip;
 *   that overlay is dropped here because the same clip now plays as the
 *   chip's particle scene (below).
 *
 * Addition (not in the original): chips that have a scene in HERO_SCENES
 * are toggle buttons. Clicking one sweeps a greyscale particle rendering of
 * its picture (or clip) into the empty space above the headline (see
 * HeroParticles); clicking it again, clicking another chip, or pressing
 * Escape sends it out.
 *
 * The homepage has NO appear/scroll-reveal animations in the original (the
 * mirror HTML contains no `data-framer-appear-id` on `/`), so nothing here
 * animates in on load.
 */

/** Framer transition `ca`/`la`: spring, bounce 0.25, duration 0.45s. */
const CHIP_SPRING = { type: 'spring', bounce: 0.25, duration: 0.45 } as const;

type Chip = {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  /** Framer variant `la`: adds a drop shadow to the hover lift. */
  hoverShadow?: boolean;
  /** Key into HERO_SCENES; chips without one are plain artwork for now. */
  scene?: HeroSceneId;
};

const CHIPS: Chip[] = [
  {
    // 245x95 intrinsic; 123px wide on desktop/tablet, 103px on phone.
    src: '/images/chip-product.svg',
    alt: 'Product',
    className: styles.chipProduct,
    width: 245,
    height: 95,
    scene: 'product',
  },
  {
    // 218x95 intrinsic; 109px / 92px.
    src: '/images/chip-design.svg',
    alt: 'Design',
    className: styles.chipDesign,
    width: 218,
    height: 95,
  },
  {
    // 289x95 intrinsic; 145px / 122px.
    src: '/images/chip-discovery.svg',
    alt: 'Discovery',
    className: styles.chipDiscovery,
    width: 289,
    height: 95,
    hoverShadow: true,
    scene: 'discovery',
  },
  {
    // 261x93 intrinsic; 131px / 110px.
    src: '/images/chip-strategy.svg',
    alt: 'Strategy',
    className: styles.chipStrategy,
    width: 261,
    height: 93,
    scene: 'strategy',
  },
  {
    // 180x86 intrinsic; 100px / 84px so displayed height matches the others.
    src: '/images/chip-build.svg',
    alt: 'Build',
    className: styles.chipBuild,
    width: 180,
    height: 86,
    scene: 'build',
  },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [activeScene, setActiveScene] = useState<HeroSceneId | null>(null);
  // Temporary tuning panel: shown in `next dev`, or anywhere with `?tune` in
  // the URL. Not rendered in the production export otherwise.
  const [tunerOpen, setTunerOpen] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || window.location.search.includes('tune')) {
      setTunerOpen(true);
    }
  }, []);

  // Warm the picture cache once the page has settled so the first click
  // never waits on the network.
  useEffect(() => {
    const id = window.setTimeout(() => preloadScenes(Object.values(HERO_SCENES)), 800);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!activeScene) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveScene(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeScene]);

  const chipHover = (shadow: boolean) =>
    reduceMotion
      ? undefined
      : {
          scale: 1.05,
          y: -2,
          ...(shadow ? { boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.25)' } : {}),
        };

  const toggleScene = (id: HeroSceneId) =>
    setActiveScene((current) => (current === id ? null : id));

  return (
    <section className={styles.section}>
      {tunerOpen && <HeroTuner onClose={() => setTunerOpen(false)} />}
      <div className={styles.card} id="home-hero">
        <div className={styles.stage}>
          <HeroParticles scene={activeScene ? HERO_SCENES[activeScene] : null} />
        </div>
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
                {CHIPS.map((chip) => {
                  const wrapClass = `${styles.chipWrap} ${chip.className}`;
                  const content = (
                    <motion.img
                      src={chip.src}
                      alt={chip.alt}
                      width={chip.width}
                      height={chip.height}
                      className={styles.chip}
                      whileHover={chipHover(Boolean(chip.hoverShadow))}
                      transition={CHIP_SPRING}
                    />
                  );

                  if (chip.scene) {
                    const scene = chip.scene;
                    return (
                      <button
                        key={chip.alt}
                        type="button"
                        className={`${wrapClass} ${styles.chipButton}`}
                        aria-pressed={activeScene === scene}
                        aria-label={`Show ${chip.alt}`}
                        onClick={() => toggleScene(scene)}
                      >
                        {content}
                      </button>
                    );
                  }
                  return (
                    <span key={chip.alt} className={wrapClass}>
                      {content}
                    </span>
                  );
                })}
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
