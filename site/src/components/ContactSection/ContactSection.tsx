'use client';

import { useEffect, useRef, useState } from 'react';
import CameraRoll from '../CameraRoll/CameraRoll';
import styles from './ContactSection.module.css';

const EMAIL = 'remi.bouskila@gmail.com';

/**
 * "remi." wordmark used in the closing section — the original's "Remi
 * Purprledot" component (framer-li6TY, 136x36), NOT the plain nav RemiLogo.
 * Differences that matter:
 *
 * - It is an anchor to `#home-hero` (a back-to-top link), not to `/`.
 * - Letters are #E0E0E0 but the two dots are #7C3AED (purple).
 * - It has four variants that differ only in dot colour, and its
 *   `onMouseEnter` chain walks them on a loop while the pointer is over it:
 *   Variant 1 purple #7C3AED -> (500ms) Variant 2 rgb(0,106,222) ->
 *   (500ms) Variant 3 rgb(233,90,12) -> (800ms) Variant 4 rgb(253,229,13) ->
 *   (500ms) back to Variant 1. Leaving resets to purple.
 *
 * Path data for the 195x51 artwork comes from the original's inline SVG.
 */
const DOT_CYCLE = [
  { color: '#7C3AED', hold: 500 },
  { color: 'rgb(0, 106, 222)', hold: 500 },
  { color: 'rgb(233, 90, 12)', hold: 800 },
  { color: 'rgb(253, 229, 13)', hold: 500 },
] as const;

function RemiPurpleDotLogo({ dotColor }: { dotColor: string }) {
  return (
    <svg
      className={styles.logo}
      viewBox="0 0 195 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="remi."
    >
      <path
        fill="#E0E0E0"
        d="M83.99 49.36h14.28V23.99c0-2.84 0-10.58 8.08-10.58 7.14 0 7.14 7.4 7.14 9.98v25.97h14.28V23.3c0-2.67 0-9.89 7.91-9.89 7.31 0 7.31 6.71 7.31 10.58v25.37h14.28V23.3c0-10.58-.69-13.76-5.16-18.49-3.87-4.04-9.2-4.82-12.55-4.82-7.31 0-12.21 3.87-15.14 8.51-3.78-7.05-9.54-8.51-13.76-8.51-8.94 0-12.04 4.73-13.16 6.71h-.17V1.63H84v47.73h-.01ZM43.57 20.21c.6-2.84 3.44-8.17 10.84-8.17s10.23 5.33 10.84 8.17H43.57ZM63.26 34.4c-1.98 2.49-4.3 4.47-8.69 4.47-5.59 0-10.32-3.35-11.18-9.03h35.78c.17-1.12.34-1.89.34-3.78C79.51 11.53 68.85 0 54.31 0S29.28 12.3 29.28 25.63c0 14.19 11.61 25.28 25.29 25.28 4.9 0 9.63-1.46 13.59-4.3 4.04-2.75 7.4-6.88 9.72-12.21H63.26ZM14.28.82H0v47.73h14.28V.82Z"
      />
      <path fill="#E0E0E0" d="M178.03 1.34h-14.28v47.73h14.28V1.34Z" />
      <path
        fill={dotColor}
        d="M23.58 14.78c3.99 0 7.23-3.24 7.23-7.23S27.57.32 23.58.32s-7.23 3.24-7.23 7.23 3.24 7.23 7.23 7.23Z"
      />
      <path
        fill={dotColor}
        d="M187.33 35.11c3.99 0 7.23 3.24 7.23 7.23s-3.24 7.23-7.23 7.23-7.23-3.24-7.23-7.23 3.24-7.23 7.23-7.23Z"
      />
    </svg>
  );
}

/** Drives the DOT_CYCLE chain while the wordmark is hovered. */
function useDotCycle() {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const advance = (from: number) => {
    timer.current = setTimeout(() => {
      const next = (from + 1) % DOT_CYCLE.length;
      setStep(next);
      advance(next);
    }, DOT_CYCLE[from].hold);
  };

  return {
    color: DOT_CYCLE[step].color,
    onMouseEnter: () => {
      clearTimeout(timer.current);
      advance(step);
    },
    onMouseLeave: () => {
      clearTimeout(timer.current);
      setStep(0);
    },
  };
}

/**
 * "copy email" button — copies remi.bouskila@gmail.com to the clipboard and
 * swaps its label to "Copied!" for ~2s. Reproduces the original's own DOM
 * trick exactly (reference/mirror/home.html, button aria-label="copy email"):
 * an absolutely-positioned hidden "copy email" ghost span fixes the button's
 * width so it doesn't reflow when the visible label swaps to the (shorter)
 * "Copied!" text, which is stacked in the same grid cell and cross-faded via
 * opacity.
 *
 * Deliberate fix #4 (BUILD_SPEC): email rendered directly, no Cloudflare
 * obfuscation.
 */
function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleClick = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback for browsers/contexts without navigator.clipboard.
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {
        // Nothing more we can do — the click still gives visible feedback.
      }
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" className={styles.copyButton} aria-label="copy email" onClick={handleClick}>
      <span aria-hidden="true" className={styles.copyGhost}>
        copy email
      </span>
      <span className={styles.copyStack}>
        <span className={styles.copyFace} data-visible={!copied}>
          copy email
        </span>
        <span className={styles.copyFace} data-visible={copied} aria-hidden={!copied}>
          Copied!
        </span>
      </span>
    </button>
  );
}

/**
 * Closing "Get in touch" section of the homepage: remi. wordmark, closing
 * blurb, a "Get in touch" mailto CTA, Linkedin + copy-email links, and the
 * Camera roll photo strip.
 *
 * Measured from reference/mirror/home.html:
 * - Outer band: bg var(--bg-1), border-top 1px solid var(--bg-3) — visually
 *   distinct from the page's var(--bg-0) body. Broken out of <main>'s
 *   200px nav gutter (see .footer) so the band is full-bleed like the
 *   original, where the fixed nav floats independently of document flow.
 * - Inner content: max-width 1300px, centered, flex row with a 32px gap
 *   (blurb column / Camera roll column, each flex 1 0 0) on desktop/tablet;
 *   column-reverse (Camera roll first) on mobile, matching the original's
 *   `order` swap at the 809px breakpoint.
 * - Blurb: h4, GT Walsheim Pro Medium 500, 24px/1.2 on tablet+desktop,
 *   15px/1.2 on phone (confirmed via live computed styles at 390/834/1440 —
 *   font-size does NOT scale linearly with the 19px guess from the mirror's
 *   unscoped preset rule), color var(--text-secondary), max-width 624px.
 * - Logo: 136px wide (not the 84px an eyeballed guess would give — confirmed
 *   via live getBoundingClientRect at all three breakpoints, same size
 *   everywhere).
 * - "Get in touch": mailto link styled as a soft rounded card (border-radius
 *   16px, subtle gradient + inset highlight, padding 18px), text GT Walsheim
 *   Pro Bold 700 28px at ALL breakpoints (no mobile shrink) — same shared
 *   style preset as the "Exprience" heading.
 * - Linkedin / copy email row: 13px GT Walsheim Pro Regular, color
 *   var(--text-muted), href copied verbatim from the mirror.
 */
export default function ContactSection() {
  const dot = useDotCycle();

  return (
    <section className={styles.footer} aria-label="Contact">
      <div className={styles.inner}>
        <div className={styles.column}>
          <a
            href="#home-hero"
            aria-label="remi. — back to top"
            className={styles.logoLink}
            onMouseEnter={dot.onMouseEnter}
            onMouseLeave={dot.onMouseLeave}
          >
            <RemiPurpleDotLogo dotColor={dot.color} />
          </a>

          <p className={styles.blurb}>
            Currently leading design at SUMM, building the best tool for crypto tax reporting and portfolio
            management. I love working on complex problems, simplifying experiences and crafting beautiful
            products.
          </p>

          <a href={`mailto:${EMAIL}`} className={styles.getInTouch}>
            Get in touch
          </a>

          <div className={styles.linksRow}>
            <a
              href="https://www.linkedin.com/in/remibousk/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.smallLink}
            >
              Linkedin
            </a>
            <CopyEmailButton />
          </div>
        </div>

        <CameraRoll />
      </div>
    </section>
  );
}
