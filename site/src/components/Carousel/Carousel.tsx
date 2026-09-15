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
 *   The gap is read back from the track's computed style on every measure,
 *   so a consumer may either pass the `gap` prop (inline px) or set a
 *   responsive `gap` in its own `trackClassName` and omit the prop.
 * - `clip` (default true) is the frame's `overflow: hidden`. The SiteMinder
 *   tile turns it off so outgoing slides glide across the tile's padding and
 *   are cut by the tile's own edge instead of the frame's.
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
 * - Optional progress dots (`progressOptions.showProgressDots`), either in
 *   their own row (the original's layout) or inline between the two arrows.
 * - A manual arrow/dot click restarts the autoplay countdown so an automatic
 *   advance never lands right on top of a click.
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
  gap,
  borderRadius = 10,
  clip = true,
  autoPlaySeconds,
  arrows = false,
  dots = false,
  dotsPlacement = 'below',
  className,
  frameClassName,
  trackClassName,
  slideClassName,
  arrowsClassName,
  arrowClassName,
  dotsClassName,
  dotClassName,
}: {
  slides: ReactNode[];
  ariaLabel: string;
  /** Slide gap in px, set inline. Omit to control it from `trackClassName`. */
  gap?: number;
  borderRadius?: number;
  /** Clip slides at the frame's edge (`overflow: hidden`). */
  clip?: boolean;
  /** Seconds between automatic advances; omit for a manual-only carousel. */
  autoPlaySeconds?: number;
  /** Render the prev/next buttons (`arrowOptions.showMouseControls`). */
  arrows?: boolean;
  /** Render the pagination dots (`progressOptions.showProgressDots`). */
  dots?: boolean;
  /**
   * Where the dots sit: their own absolutely-positioned row (`below`), or
   * inline between the prev/next buttons (`between-arrows`, needs `arrows`).
   */
  dotsPlacement?: 'below' | 'between-arrows';
  className?: string;
  frameClassName?: string;
  trackClassName?: string;
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
  const trackRef = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const [step, setStep] = useState(0);
  /** The gap actually in effect, measured from the track (prop or CSS). */
  const [gapPx, setGapPx] = useState(gap ?? 0);
  /** Absolute index into the tripled list; starts in the middle copy. */
  const indexRef = useRef(count);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** `playOffscreen: false` — autoplay only runs while the carousel is in view. */
  const [inView, setInView] = useState(false);
  /** Bumped on every manual arrow/dot click so the autoplay interval restarts. */
  const [autoplayEpoch, setAutoplayEpoch] = useState(0);
  const restartAutoplay = useCallback(() => setAutoplayEpoch((n) => n + 1), []);

  /* Measure the frame so paging can work in px (one slide fills the frame).
     The gap is measured too, so a CSS-driven gap that changes at a
     breakpoint is picked up on the same resize. */
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const track = trackRef.current;
      const measuredGap = track
        ? parseFloat(getComputedStyle(track).columnGap) || 0
        : (gap ?? 0);
      const next = frame.clientWidth + measuredGap;
      setGapPx(measuredGap);
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
     (see the `effectsHover` note above). `autoplayEpoch` is only here so a
     manual click tears the interval down and starts a fresh countdown. */
  useEffect(() => {
    if (!autoPlaySeconds || dragging || !inView || step === 0) return;
    const id = setInterval(() => page(1), autoPlaySeconds * 1000);
    return () => clearInterval(id);
  }, [autoPlaySeconds, autoplayEpoch, dragging, inView, page, step]);

  const tripled = [...slides, ...slides, ...slides];
  const inlineDots = dots && arrows && dotsPlacement === 'between-arrows';

  const renderArrow = (label: 'Previous' | 'Next', delta: -1 | 1, icon: string) => (
    <motion.button
      key={label}
      type="button"
      aria-label={label}
      className={`${styles.arrow}${arrowClassName ? ` ${arrowClassName}` : ''}`}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onClick={() => {
        page(delta);
        restartAutoplay();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={40} height={40} />
    </motion.button>
  );

  const dotsRow = dots ? (
    <div
      className={`${styles.dots}${inlineDots ? ` ${styles.dotsInline}` : ''}${
        dotsClassName ? ` ${dotsClassName}` : ''
      }`}
    >
      {slides.map((_slide, i) => (
        <button
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          type="button"
          className={`${styles.dot}${dotClassName ? ` ${dotClassName}` : ''}`}
          aria-label={`Go to slide ${i + 1} of ${count}`}
          aria-current={i === active ? 'true' : undefined}
          data-active={i === active || undefined}
          onClick={() => {
            goTo(i);
            restartAutoplay();
          }}
        />
      ))}
    </div>
  ) : null;

  return (
    <div
      className={`${styles.carousel}${className ? ` ${className}` : ''}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className={`${styles.frame}${clip ? '' : ` ${styles.frameOpen}`}${
          frameClassName ? ` ${frameClassName}` : ''
        }`}
        ref={frameRef}
      >
        <motion.ul
          ref={trackRef}
          className={`${styles.track}${trackClassName ? ` ${trackClassName}` : ''}`}
          style={{
            x,
            ...(gap !== undefined ? { gap: `${gap}px` } : null),
            cursor: dragging ? 'grabbing' : 'grab',
          }}
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
            const item = Math.max(1, step - gapPx);
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
          {renderArrow('Previous', -1, '/images/6tTbkXggWgQCAJ4DO2QEdXXmgM.svg')}
          {inlineDots && dotsRow}
          {renderArrow('Next', 1, '/images/11KSGbIZoRSg4pjdnUoif6MKHI.svg')}
        </div>
      )}

      {!inlineDots && dotsRow}
    </div>
  );
}
