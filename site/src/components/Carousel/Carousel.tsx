'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import styles from './Carousel.module.css';

/**
 * Faithful re-implementation of the Framer "Slideshow" code component the
 * original uses twice on the homepage (the SiteMinder product-screenshot tile
 * and the "Camera roll" photo strip). Behaviour and defaults taken from the
 * component's own props in the page module
 * (reference/mirror/.../RUqqse2zCrL-…DKx8smEm.mjs):
 *
 * - `itemAmount: 1`, `infinity: true`, `direction: 'left'`, `gap` in px.
 * - `transitionControl` (both instances use the default):
 *   `{type: 'spring', stiffness: 200, damping: 40}`.
 * - `dragControl: true` on both — the track is draggable, cursor `grab` /
 *   `grabbing`. Drag-end paging mirrors the original's own handler:
 *   a fling past ±200px/s pages `round(|offset| / slide)` slides (min 1) in
 *   the fling's direction; otherwise a drag past half a slide pages that same
 *   slide count. Both instances can therefore skip several slides in one
 *   throw, which a fixed one-slide step cannot do.
 * - `autoPlayControl` + `intervalControl` (seconds). Autoplay does NOT pause
 *   on hover: the original gates that on `effectsHover`, and both instances
 *   set `effectsHover: true`, so its `onMouseEnter: () => {X(!0), P || Ue(!1)}`
 *   short-circuits and never stops playback. It DOES pause while dragging
 *   (its autoplay loop bails on the drag flag) and while the carousel is
 *   offscreen (`playOffscreen: false` gates the loop on `(F || lt)`, where
 *   `lt` is an in-view check).
 * - Prev/next arrow buttons (`arrowOptions.showMouseControls`) with
 *   `whileTap: {scale: 0.9}` on a `{duration: 0.15}` tween, using the
 *   original's own arrow SVGs.
 * - Optional progress dots (`progressOptions.showProgressDots`).
 *
 * Infinite paging uses the same trick as the original's DOM, which renders
 * the slide set three times: the middle copy is the live one, and once a
 * transition settles outside it the index is rebased by ±slides.length with
 * the offset applied instantly, so the loop is seamless in both directions.
 */

const PAGE_TRANSITION = { type: 'spring', stiffness: 200, damping: 40 } as const;

export default function Carousel({
  slides,
  ariaLabel,
  gap = 10,
  borderRadius = 10,
  autoPlaySeconds,
  arrows = false,
  dots = false,
  className,
  frameClassName,
  slideClassName,
  arrowsClassName,
  arrowClassName,
  dotsClassName,
  dotClassName,
}: {
  slides: ReactNode[];
  ariaLabel: string;
  gap?: number;
  borderRadius?: number;
  /** Seconds between automatic advances; omit for a manual-only carousel. */
  autoPlaySeconds?: number;
  /** Render the prev/next buttons (`arrowOptions.showMouseControls`). */
  arrows?: boolean;
  /** Render the pagination dots (`progressOptions.showProgressDots`). */
  dots?: boolean;
  className?: string;
  frameClassName?: string;
  slideClassName?: string;
  /**
   * Arrow/dot geometry lives in the consumer's CSS module (the two instances
   * differ, and the original's phone breakpoint changes arrow size + offset),
   * so it can't be inline style here.
   */
  arrowsClassName?: string;
  arrowClassName?: string;
  dotsClassName?: string;
  dotClassName?: string;
}) {
  const count = slides.length;
  const reduceMotion = useReducedMotion();

  const frameRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [step, setStep] = useState(0);
  /** Absolute index into the tripled list; starts in the middle copy. */
  const indexRef = useRef(count);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** `playOffscreen: false` — autoplay only runs while the carousel is in view. */
  const [inView, setInView] = useState(false);

  /* Measure the frame so paging can work in px (one slide fills the frame). */
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const next = frame.clientWidth + gap;
      setStep(next);
      x.set(-indexRef.current * next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [gap, x]);

  /**
   * Page by `delta` slides. Rebases the absolute index back into the middle
   * copy once the animation settles so the loop never runs out of slides.
   */
  const page = useCallback(
    (delta: number, animated = true) => {
      if (step === 0) return;
      const next = indexRef.current + delta;
      indexRef.current = next;
      setActive(((next % count) + count) % count);

      const settle = () => {
        const rebased = count + (((indexRef.current % count) + count) % count);
        if (rebased !== indexRef.current) {
          indexRef.current = rebased;
          x.set(-rebased * step);
        }
      };

      if (!animated || reduceMotion) {
        x.set(-next * step);
        settle();
        return;
      }
      animate(x, -next * step, { ...PAGE_TRANSITION, onComplete: settle });
    },
    [count, reduceMotion, step, x],
  );

  const goTo = useCallback(
    (target: number) => {
      const current = ((indexRef.current % count) + count) % count;
      let delta = target - current;
      // Take the shorter way round.
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;
      page(delta);
    },
    [count, page],
  );

  /* `playOffscreen: false` — the original's autoplay loop is gated on an
     in-view check, so a carousel scrolled out of view stops advancing. */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !autoPlaySeconds) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [autoPlaySeconds]);

  /* Autoplay — paused while dragging and while offscreen, but NOT on hover
     (see the `effectsHover` note above). */
  useEffect(() => {
    if (!autoPlaySeconds || dragging || !inView || step === 0) return;
    const id = setInterval(() => page(1), autoPlaySeconds * 1000);
    return () => clearInterval(id);
  }, [autoPlaySeconds, dragging, inView, page, step]);

  const tripled = [...slides, ...slides, ...slides];

  return (
    <div
      className={`${styles.carousel}${className ? ` ${className}` : ''}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className={`${styles.frame}${frameClassName ? ` ${frameClassName}` : ''}`}
        ref={frameRef}
      >
        <motion.ul
          className={styles.track}
          style={{ x, gap: `${gap}px`, cursor: dragging ? 'grabbing' : 'grab' }}
          drag="x"
          // No dragConstraints: the track follows the pointer 1:1 and
          // onDragEnd always animates back to the correct slide offset.
          dragMomentum={false}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_event, info) => {
            setDragging(false);
            // Mirrors the original's own drag-end handler:
            //   a = offset < -item/2, o = offset > item/2
            //   s = round(|offset| / item), c = s === 0 ? 1 : s
            //   velocity > 200 -> page(-c); < -200 -> page(c);
            //   else a && page(s); o && page(-s)
            // `step` includes the gap, `item` doesn't — subtract it back out
            // so the slide count matches at the same drag distance.
            const item = Math.max(1, step - gap);
            const { x: offset } = info.offset;
            const { x: velocity } = info.velocity;
            const slides = Math.round(Math.abs(offset) / item);
            const flung = slides === 0 ? 1 : slides;

            if (velocity > 200) page(-flung);
            else if (velocity < -200) page(flung);
            else if (offset < -item / 2) page(slides);
            else if (offset > item / 2) page(-slides);
            else page(0);
          }}
        >
          {tripled.map((slide, i) => (
            <li
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={`${styles.slide}${slideClassName ? ` ${slideClassName}` : ''}`}
              style={{ borderRadius }}
              aria-hidden={i < count || i >= count * 2 ? true : undefined}
            >
              {slide}
            </li>
          ))}
        </motion.ul>
      </div>

      {arrows && (
        <div className={`${styles.arrows}${arrowsClassName ? ` ${arrowsClassName}` : ''}`}>
          {(
            [
              ['Previous', -1, '/images/6tTbkXggWgQCAJ4DO2QEdXXmgM.svg'],
              ['Next', 1, '/images/11KSGbIZoRSg4pjdnUoif6MKHI.svg'],
            ] as const
          ).map(([label, delta, icon]) => (
            <motion.button
              key={label}
              type="button"
              aria-label={label}
              className={`${styles.arrow}${arrowClassName ? ` ${arrowClassName}` : ''}`}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={() => page(delta)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" width={40} height={40} />
            </motion.button>
          ))}
        </div>
      )}

      {dots && (
        <div className={`${styles.dots}${dotsClassName ? ` ${dotsClassName}` : ''}`}>
          {slides.map((_slide, i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              type="button"
              className={`${styles.dot}${dotClassName ? ` ${dotClassName}` : ''}`}
              aria-label={`Go to slide ${i + 1} of ${count}`}
              aria-current={i === active ? 'true' : undefined}
              data-active={i === active || undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
