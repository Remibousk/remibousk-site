'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';
import {
  DEFAULT_HEADLINE,
  ERAS,
  LOGO_STRIP,
  MAX_COMPACT_WIDGETS,
  MAX_DESKTOP_WIDGETS,
  MAX_MOBILE_WIDGETS,
  SIDE_WIDGETS,
  type Era,
  type EraMedia,
  type SideWidget,
} from '@/content/eras';
import styles from './TimelineHero.module.css';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HEADLINE_OUT = 0.16;
const HEADLINE_IN = 0.24;
const LOGO_MS = 0.2;
const CARD_MS = 0.22;
const CARD_DELAY = 0.06;
const WIDGET_DWELL_MS = 120;
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 26 };

type WidgetModel = {
  id: string;
  title: string;
  meta: string;
  oneLiner: string;
  href?: string;
  media: EraMedia;
};

type Slot = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

/**
 * Corner slots — ≥32px clear of the remi. nav card (≈160×240 at ~40,4),
 * and clear of headline / logos / active card / pill.
 */
const SLOTS_WIDE: Slot[] = [
  // Below the nav card (nav bottom ~244 + 32px safe = 276)
  { top: '276px', left: '40px', right: 'auto', bottom: 'auto' },
  { top: '72px', left: 'auto', right: '40px', bottom: 'auto' },
  { top: 'auto', left: '40px', right: 'auto', bottom: '120px' },
  { top: 'auto', left: 'auto', right: '48px', bottom: '140px' },
];

/** ≤1280: drop top-left (near nav) — three widgets only. */
const SLOTS_COMPACT: Slot[] = [
  { top: '72px', left: 'auto', right: '28px', bottom: 'auto' },
  { top: 'auto', left: '28px', right: 'auto', bottom: '120px' },
  { top: 'auto', left: 'auto', right: '36px', bottom: '140px' },
];

function UndoIcon() {
  return (
    <svg
      className={styles.resetIcon}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.2 4.2A4.8 4.8 0 1 1 2.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.2 1.6v2.8H6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MediaBlock({
  media,
  className,
  sizes,
  reduceMotion,
  eager,
  allowVideo = true,
  imageClassName,
}: {
  media: EraMedia;
  className: string;
  sizes: string;
  reduceMotion: boolean;
  eager?: boolean;
  /** When false, video media never mounts (no network load). */
  allowVideo?: boolean;
  imageClassName?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || media.kind !== 'video') return;
    if (reduceMotion) {
      el.pause();
      return;
    }
    const play = () => {
      el.play().catch(() => {});
    };
    if (el.readyState >= 2) play();
    else el.addEventListener('loadeddata', play, { once: true });
    return () => el.pause();
  }, [media, reduceMotion]);

  if (media.kind === 'video') {
    if (!allowVideo) return null;
    return (
      <div className={className}>
        <video
          ref={videoRef}
          className={styles.mediaVideo}
          src={media.src}
          poster={media.poster}
          width={media.width}
          height={media.height}
          muted
          loop
          playsInline
          autoPlay={!reduceMotion}
          preload="none"
          aria-label={media.alt}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        className={imageClassName}
        src={media.src}
        alt={media.alt}
        width={256}
        height={160}
        sizes={sizes}
        priority={eager}
      />
    </div>
  );
}

function EraCard({
  era,
  reduceMotion,
}: {
  era: Era;
  reduceMotion: boolean;
}) {
  const tightCrop = era.id === 'now-2026';
  const body = (
    <>
      <MediaBlock
        media={era.card.media}
        className={styles.cardThumb}
        imageClassName={tightCrop ? styles.cardThumbTight : undefined}
        sizes="(max-width: 600px) 100vw, 128px"
        reduceMotion={reduceMotion}
        allowVideo={false}
        eager
      />
      <div className={styles.cardText}>
        <p className={styles.cardMeta}>{era.card.meta}</p>
        <h3 className={styles.cardTitle}>{era.card.title}</h3>
        <p className={styles.cardOneLiner}>{era.card.oneLiner}</p>
      </div>
    </>
  );

  if (!era.card.href) {
    return <div className={styles.card}>{body}</div>;
  }

  const external = era.card.href.startsWith('http');
  if (external) {
    return (
      <a
        className={styles.card}
        href={era.card.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
      </a>
    );
  }

  return (
    <Link className={styles.card} href={era.card.href}>
      {body}
    </Link>
  );
}

function SettledWidget({
  widget,
  slot,
  tilt,
  reduceMotion,
}: {
  widget: WidgetModel;
  slot: Slot;
  tilt: number;
  reduceMotion: boolean;
}) {
  const inner = (
    <>
      <MediaBlock
        media={widget.media}
        className={styles.widgetMedia}
        sizes="180px"
        reduceMotion={reduceMotion}
        allowVideo
      />
      <div className={styles.widgetText}>
        <p className={styles.widgetMeta}>{widget.meta}</p>
        <p className={styles.widgetTitle}>{widget.title}</p>
      </div>
    </>
  );

  const content = widget.href ? (
    widget.href.startsWith('http') ? (
      <a
        className={styles.widgetInner}
        href={widget.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    ) : (
      <Link className={styles.widgetInner} href={widget.href}>
        {inner}
      </Link>
    )
  ) : (
    <div className={styles.widgetInner}>{inner}</div>
  );

  return (
    <motion.div
      layout
      className={styles.widget}
      style={{ ...slot }}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.92, y: 12, rotate: 0 }
      }
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, y: 0, rotate: tilt }
      }
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -8, scale: 0.96, rotate: 0 }
      }
      transition={
        reduceMotion
          ? { duration: 0.16 }
          : { ...SPRING, opacity: { duration: 0.2 } }
      }
    >
      {content}
    </motion.div>
  );
}

function collectWidgets(committed: number | null): WidgetModel[] {
  if (committed === null) return [];

  const fromEras: WidgetModel[] = [];
  for (let i = 0; i < committed; i++) {
    const era = ERAS[i];
    if (!era.leavesWidget) continue;
    fromEras.push({
      id: era.id,
      title: era.card.title,
      meta: era.card.meta,
      oneLiner: era.card.oneLiner,
      href: era.card.href,
      media: era.card.media,
    });
  }

  const fromSide: WidgetModel[] = SIDE_WIDGETS.filter(
    (w: SideWidget) => committed >= w.appearFromIndex,
  ).map((w) => ({
    id: w.id,
    title: w.title,
    meta: w.meta,
    oneLiner: w.oneLiner,
    href: w.href,
    media: w.media,
  }));

  // Prefer most recent career widgets, then side projects — cap applied by caller.
  return [...fromEras, ...fromSide];
}

/**
 * Homepage first screen — timeline scrubber + widgets + motion (PR 3).
 */
export default function TimelineHero() {
  const labelId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState<number | null>(null);
  const [committed, setCommitted] = useState<number | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingKeyboardFocus = useRef(false);

  const selected = index === null ? null : ERAS[index];
  const headline = selected?.headline ?? DEFAULT_HEADLINE;

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 600px)');
    const compactMq = window.matchMedia('(max-width: 1280px)');
    const sync = () => {
      setIsNarrow(mobileMq.matches);
      setIsCompact(compactMq.matches);
    };
    sync();
    mobileMq.addEventListener('change', sync);
    compactMq.addEventListener('change', sync);
    return () => {
      mobileMq.removeEventListener('change', sync);
      compactMq.removeEventListener('change', sync);
    };
  }, []);

  const commitIndex = useCallback((next: number | null, immediate: boolean) => {
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
    if (immediate || next === null) {
      setCommitted(next);
      return;
    }
    dwellTimer.current = setTimeout(() => {
      setCommitted(next);
      dwellTimer.current = null;
    }, WIDGET_DWELL_MS);
  }, []);

  const selectIndex = useCallback(
    (next: number | null, opts?: { immediateWidgets?: boolean }) => {
      setIndex(next);
      const immediate =
        opts?.immediateWidgets ?? !dragging.current;
      commitIndex(next, immediate);
    },
    [commitIndex],
  );

  const reset = useCallback(() => {
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    setIndex(null);
    setCommitted(null);
  }, []);

  const moveBy = useCallback(
    (delta: number) => {
      setIndex((prev) => {
        const next =
          prev === null
            ? delta > 0
              ? 0
              : ERAS.length - 1
            : Math.min(ERAS.length - 1, Math.max(0, prev + delta));
        commitIndex(next, true);
        return next;
      });
    },
    [commitIndex],
  );

  const indexFromClientX = useCallback((clientX: number) => {
    const root = groupRef.current;
    if (!root) return null;
    const stops = [...root.querySelectorAll<HTMLElement>('[data-era-index]')];
    if (!stops.length) return null;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    stops.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const d = Math.abs(cx - clientX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        pendingKeyboardFocus.current = true;
        moveBy(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        pendingKeyboardFocus.current = true;
        moveBy(-1);
        break;
      case 'Home':
        event.preventDefault();
        pendingKeyboardFocus.current = true;
        selectIndex(0, { immediateWidgets: true });
        break;
      case 'End':
        event.preventDefault();
        pendingKeyboardFocus.current = true;
        selectIndex(ERAS.length - 1, { immediateWidgets: true });
        break;
      case 'Escape':
        event.preventDefault();
        reset();
        break;
      default:
        break;
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest(`.${styles.reset}`)) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = indexFromClientX(event.clientX);
    if (next !== null) selectIndex(next, { immediateWidgets: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const next = indexFromClientX(event.clientX);
    if (next !== null) selectIndex(next, { immediateWidgets: false });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    // Snap / commit widgets on release
    commitIndex(index, true);
  };

  useEffect(() => {
    if (index === null || !pendingKeyboardFocus.current) return;
    pendingKeyboardFocus.current = false;
    const root = groupRef.current;
    const el = root?.querySelector<HTMLElement>(
      `[data-era-index="${index}"]`,
    );
    el?.focus();
  }, [index]);

  useEffect(
    () => () => {
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
    },
    [],
  );

  // Mobile: zero widgets — no RemOS / Symbol Morph video elements mount.
  const maxWidgets = isNarrow
    ? MAX_MOBILE_WIDGETS
    : isCompact
      ? MAX_COMPACT_WIDGETS
      : MAX_DESKTOP_WIDGETS;
  const slots = isCompact ? SLOTS_COMPACT : SLOTS_WIDE;
  const allWidgets = isNarrow ? [] : collectWidgets(committed);
  const visibleWidgets = allWidgets.slice(-maxWidgets);

  return (
    <section
      className={styles.section}
      aria-label="Career timeline"
      id="home-hero"
    >
      <div className={styles.stage}>
        <div
          className={styles.widgetLayer}
          aria-hidden={visibleWidgets.length === 0}
        >
          <AnimatePresence initial={false}>
            {visibleWidgets.map((w, i) => (
              <SettledWidget
                key={w.id}
                widget={w}
                slot={slots[i % slots.length]}
                tilt={i % 2 === 0 ? -2 : 2}
                reduceMotion={reduceMotion}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className={styles.main}>
          <h1 className={styles.headline} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={headline}
                className={styles.headlineText}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: reduceMotion ? 0 : HEADLINE_IN,
                    ease: EASE_OUT,
                  },
                }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: reduceMotion ? 0 : HEADLINE_OUT,
                    ease: EASE_OUT,
                  },
                }}
              >
                {headline}
              </motion.span>
            </AnimatePresence>
          </h1>

          <div className={styles.logos} aria-label="Companies">
            {LOGO_STRIP.map((logo) => {
              const dimmed =
                selected !== null && selected.logoId !== logo.id;
              return (
                <motion.span
                  key={logo.id}
                  className={styles.logoItem}
                  data-logo={logo.id}
                  animate={{ opacity: dimmed ? 0.38 : 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : LOGO_MS,
                    ease: EASE_OUT,
                  }}
                >
                  {'wordmark' in logo ? (
                    <span className={styles.logoWordmark}>{logo.label}</span>
                  ) : (
                    <>
                      <Image
                        className={styles.logoImg}
                        src={logo.src}
                        alt=""
                        width={logo.width}
                        height={logo.height}
                      />
                      {logo.id === 'siteminder' ? (
                        <span className={styles.logoWord}>{logo.label}</span>
                      ) : null}
                    </>
                  )}
                </motion.span>
              );
            })}
          </div>

          <div className={styles.cardSlot}>
            <AnimatePresence mode="wait" initial={false}>
              {selected ? (
                <motion.div
                  key={selected.id}
                  className={styles.cardMotion}
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 8 }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: reduceMotion ? 0 : CARD_MS,
                      delay: reduceMotion ? 0 : CARD_DELAY,
                      ease: EASE_OUT,
                    },
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0, transition: { duration: 0 } }
                      : {
                          opacity: 0,
                          y: -8,
                          transition: { duration: 0.2, ease: EASE_OUT },
                        }
                  }
                >
                  <EraCard era={selected} reduceMotion={reduceMotion} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

        </div>

        <div className={styles.scrubberDock}>
          <div
            ref={groupRef}
            className={styles.scrubber}
            role="radiogroup"
            aria-labelledby={labelId}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span id={labelId} className="sr-only">
              Career timeline years
            </span>
            {ERAS.map((era, i) => {
              const checked = index === i;
              return (
                <button
                  key={era.id}
                  type="button"
                  role="radio"
                  className={styles.stop}
                  data-era-index={i}
                  aria-checked={checked}
                  aria-label={`${era.company}, ${era.yearLabel}`}
                  tabIndex={
                    checked || (index === null && i === 0) ? 0 : -1
                  }
                  onClick={() =>
                    selectIndex(i, { immediateWidgets: true })
                  }
                >
                  <span className={styles.stopFull}>{era.yearLabel}</span>
                  <span className={styles.stopShort} aria-hidden="true">
                    {era.yearLabelShort}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className={styles.reset}
              aria-label="Reset timeline to default headline"
              disabled={index === null}
              onClick={reset}
            >
              <UndoIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
