'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from './ExperienceTimeline.module.css';

/**
 * Verbatim from content/home.md (the "Exprience" typo is intentional — copy
 * exactly, per BUILD_SPEC). Order + text confirmed against
 * reference/mirror/home.html data-framer-name="Experience" block.
 *
 * The first four rows also open a media popover on mouse-enter — a Framer
 * `<Overlay placement="bottom" alignment="center" offsetY={10}>` whose
 * contents come straight from the page module
 * (reference/mirror/.../RUqqse2zCrL-…DKx8smEm.mjs):
 *   Crypto Tax Calculator -> video EcVKDMXlY2wsPwyDbiE3St0jw8.mp4 rendered
 *     445px wide, muted + looping, seeking to `startTime: 3`
 *   Siteminder            -> video D0E9BRHgnR3KlzVeJsBmbbppn1c.mp4, 627px
 *   👁️🐝Ⓜ️ IBM              -> image G9pb1THiFESi6YMzG6x6UPGdV0.jpg (1210x688),
 *     624px, `fit: 'fit'` (contain)
 *   Vivant                -> image phsLJguxgze0zFxEPYZuwZB03I.png
 *     (1679x1286), 508px, `fit: 'fill'` (cover)
 * Meld Studios and the two UTS rows have no popover in the original.
 */
type Media =
  | { kind: 'video'; src: string; width: number; startTime?: number }
  | {
      kind: 'image';
      src: string;
      width: number;
      intrinsicWidth: number;
      intrinsicHeight: number;
      fit: 'contain' | 'cover';
      alt: string;
    };

interface Entry {
  company: string;
  role: string;
  dates: string;
  media?: Media;
}

const ENTRIES: Entry[] = [
  {
    company: 'Crypto Tax Calculator',
    role: 'Lead (founding) Product Designer',
    dates: '2022 - Present',
    media: {
      kind: 'video',
      src: '/videos/EcVKDMXlY2wsPwyDbiE3St0jw8.mp4',
      width: 445,
      startTime: 3,
    },
  },
  {
    company: 'Siteminder',
    role: 'Senior Product Designer',
    dates: '2019 - 2022',
    media: {
      kind: 'video',
      src: '/videos/D0E9BRHgnR3KlzVeJsBmbbppn1c.mp4',
      width: 627,
    },
  },
  {
    company: '👁️🐝Ⓜ️ IBM',
    role: 'Senior Product Designer',
    dates: '2017 - 2019',
    media: {
      kind: 'image',
      src: '/images/G9pb1THiFESi6YMzG6x6UPGdV0.jpg',
      width: 624,
      intrinsicWidth: 1210,
      intrinsicHeight: 688,
      fit: 'contain',
      alt: 'IBM project work',
    },
  },
  {
    company: 'Vivant',
    role: 'User Experience Designer',
    dates: '2016 - 2017',
    media: {
      kind: 'image',
      src: '/images/phsLJguxgze0zFxEPYZuwZB03I.png',
      width: 508,
      intrinsicWidth: 1679,
      intrinsicHeight: 1286,
      fit: 'cover',
      alt: 'Vivant project work',
    },
  },
  { company: 'Meld Studios', role: 'Service Designer', dates: '2015' },
  {
    company: 'University of Technology, Sydney',
    role: 'Designing futures',
    dates: '2014 - 2015',
  },
  {
    company: 'University of Technology, Sydney',
    role: 'Student of Industrial Design',
    dates: '2010 - 2013',
  },
];

/** Framer transition `ua`: spring, bounce 0.2, duration 0.4s. */
const OVERLAY_SPRING = { type: 'spring', bounce: 0.2, duration: 0.4 } as const;

function RowMedia({ media }: { media: Media }) {
  if (media.kind === 'video') {
    return (
      <video
        style={{ width: media.width }}
        src={media.src}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onLoadedMetadata={(event) => {
          if (media.startTime) event.currentTarget.currentTime = media.startTime;
        }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{ width: media.width, objectFit: media.fit }}
      src={media.src}
      width={media.intrinsicWidth}
      height={media.intrinsicHeight}
      alt={media.alt}
    />
  );
}

/**
 * Experience section of the homepage — "Exprience" heading + a 7-row list of
 * company / role / dates, each row divided by a 1px hairline (except the
 * first).
 *
 * Measured from reference/mirror/home.html:
 * - Heading: h3, GT Walsheim Pro Bold 700, 28px/1.2, color var(--text-primary)
 *   (data-styles-preset="U3w7_RT90", token resolves to rgb(244,244,246)).
 * - Row: flex row wrap, gap 10px, padding 56px 8px, border-top 1px solid
 *   var(--bg-4) (rgb(35,31,45) = #231f2d) on every row but the first.
 * - Row hover (`.framer-Nzlfa.framer-v-1rq6ows.hover`): padding becomes
 *   `56px 8px 56px 16px`, and all three texts go from rgb(118,114,130) to
 *   rgb(223,222,227) on a `{type:'spring', bounce:0.2, duration:0.4}`
 *   transition.
 * - Row text: h4, GT Walsheim Pro Medium 500, ~19px/1.2, color
 *   var(--text-muted) (token resolves to rgb(118,114,130)).
 * - Role column: flex 1 0 0, max-width 450px. Title column: flex 1 0 0, no
 *   max-width. Dates column: flex none, white-space nowrap (never wraps).
 *
 * The homepage has no Framer appear effects, so rows do not animate in.
 */
export default function ExperienceTimeline() {
  const reduceMotion = useReducedMotion();
  const [openRow, setOpenRow] = useState<number | null>(null);

  return (
    <section id="experience" className={styles.section} aria-label="Experience">
      <h2 className={styles.heading}>Exprience</h2>

      <ol className={styles.rows}>
        {ENTRIES.map((entry, index) => (
          <li
            key={`${entry.company}-${entry.dates}`}
            className={styles.row}
            onMouseEnter={entry.media ? () => setOpenRow(index) : undefined}
            onMouseLeave={entry.media ? () => setOpenRow(null) : undefined}
          >
            <div className={styles.roleGroup}>
              <h3 className={styles.role}>{entry.company}</h3>
              <p className={styles.title}>{entry.role}</p>
            </div>
            <p className={styles.dates}>{entry.dates}</p>

            {entry.media && (
              <AnimatePresence>
                {openRow === index && (
                  <motion.div
                    className={styles.popover}
                    role="dialog"
                    aria-label={`${entry.company} preview`}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={OVERLAY_SPRING}
                  >
                    <RowMedia media={entry.media} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </li>
        ))}
      </ol>

      {/*
        "Lets talk" — present verbatim in content/home.md and in the original
        DOM (hidden on tablet/mobile), but the original gives its wrapper
        `height:0; overflow:clip`, so it never actually renders visibly at
        any breakpoint. Reproduced the same way for text-fidelity without
        inventing a visible placement the original doesn't have.
      */}
      <p className={styles.hiddenNote} aria-hidden="true">
        Lets talk
      </p>
    </section>
  );
}
