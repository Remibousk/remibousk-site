'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from './ResultMedia.module.css';

/**
 * "Impact" card media on /mobileweb: an A/B test screenshot at 40% opacity
 * with a centred "View results" pill on top of it.
 *
 * Behaviour from the page's own module (reference/mirror/.../uVUnGqpi8…mjs):
 * - The thumbnail carries `whileHover: {opacity: 0.6}` on a
 *   `{type:'spring', bounce:0.2, duration:0.4}` transition (base opacity 0.4,
 *   radius 8px).
 * - "View results" is the CardButton component in Variant 2 (`zkreKWejS`);
 *   its `onTap` opens a lightbox — it is NOT a mailto link, which is what the
 *   rebuild previously had. Its hover variant swaps the inset shadow to
 *   `inset 0 -1px 0 0 rgb(65,56,87)` and lifts the label to rgb(244,244,246).
 * - The lightbox is a fixed rgba(0,0,0,0.8) backdrop (click to dismiss, plus
 *   `dismissWithEsc`) with the image at `left: 52%; top: 50%;
 *   transform: translate(-50%,-50%); width: 80%`.
 * - The two halves animate differently, and both directions are specified:
 *   the backdrop is a `{type:'tween', duration:0}` opacity swap (i.e. it just
 *   appears and disappears), while the image frame fades opacity 0 -> 1 on
 *   `{type:'spring', bounce:0.2, duration:0.4}` and back to 0 on exit.
 * - The lightbox image is a *different, higher-detail* asset than the
 *   thumbnail, and only the first of the two cards also opens it by tapping
 *   the thumbnail itself (the second card's thumbnail has no `onTap`).
 * - The first card's frame is `border: 2px solid #413857`; the second's is
 *   `border: 1px solid #2a2537` with `aspect-ratio: 1.19287` and
 *   `overflow: auto`, because its asset is a very tall screenshot.
 *
 * The overlay is portalled to `document.body`, as Framer does (its overlay
 * container resolves to `#template-overlay ?? #overlay ?? document.body`).
 * That matters here: the impact cards are wrapped in <Reveal>, whose
 * transform would otherwise become the containing block for the `position:
 * fixed` frame and size the 80%-wide image against the card, not the viewport.
 */
export interface LightboxMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Scrollable fixed-aspect frame with a 1px border (the second card). */
  scroll?: boolean;
}

export default function ResultMedia({
  src,
  alt,
  width,
  height,
  lightbox,
  thumbnailOpens = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  lightbox: LightboxMedia;
  thumbnailOpens?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const thumb = (
    <img
      className={styles.image}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
    />
  );

  return (
    <div className={styles.media} data-no-lightbox>
      <button type="button" className={styles.viewResults} onClick={() => setOpen(true)}>
        <h5>View results</h5>
      </button>

      {thumbnailOpens ? (
        <button
          type="button"
          className={styles.imageButton}
          onClick={() => setOpen(true)}
          aria-label={`Open full-size image: ${alt}`}
        >
          {thumb}
        </button>
      ) : (
        thumb
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              /* Backdrop: `{type:'tween', duration:0}` in the original, so it
                 has no visible fade in either direction. */
              <div
                className={styles.lightbox}
                role="dialog"
                aria-modal="true"
                aria-label={lightbox.alt}
                onClick={() => setOpen(false)}
              >
                <motion.div
                  className={styles.lightboxFrame}
                  data-scroll={lightbox.scroll || undefined}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                >
                  <img
                    className={styles.lightboxImage}
                    src={lightbox.src}
                    alt={lightbox.alt}
                    width={lightbox.width}
                    height={lightbox.height}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
