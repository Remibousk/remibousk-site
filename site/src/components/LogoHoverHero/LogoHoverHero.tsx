'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  HERO_HEADLINE,
  HERO_LOGOS,
  type HeroLogo,
  type HeroLogoId,
} from '@/content/heroLogos';
import styles from './LogoHoverHero.module.css';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ENTER_MS = 0.2;
const EXIT_MS = 0.12;
const GUTTER = 24;
const CARD_MAX = 400;

type PreviewMode = 'hover' | 'touch';

function usePreviewMode(): PreviewMode {
  const [mode, setMode] = useState<PreviewMode>('hover');
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 600px)');
    const noHover = window.matchMedia('(hover: none)');
    const sync = () => {
      setMode(narrow.matches || noHover.matches ? 'touch' : 'hover');
    };
    sync();
    narrow.addEventListener('change', sync);
    noHover.addEventListener('change', sync);
    return () => {
      narrow.removeEventListener('change', sync);
      noHover.removeEventListener('change', sync);
    };
  }, []);
  return mode;
}

function LogoMark({ logo }: { logo: HeroLogo }) {
  if ('wordmark' in logo) {
    return <span className={styles.logoWordmark}>{logo.label}</span>;
  }
  return (
    <>
      <Image
        className={styles.logoImg}
        src={logo.src}
        alt=""
        width={logo.logoWidth}
        height={logo.logoHeight}
      />
      {logo.wordAlongside ? (
        <span className={styles.logoWord}>{logo.wordAlongside}</span>
      ) : null}
    </>
  );
}

function PreviewMedia({
  logo,
  reduceMotion,
  active,
}: {
  logo: HeroLogo;
  reduceMotion: boolean;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    if (active) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, reduceMotion, logo.id]);

  if (reduceMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={styles.previewPoster}
        src={logo.poster}
        alt=""
        width={logo.width}
        height={logo.height}
      />
    );
  }

  return (
    <video
      key={logo.id}
      ref={videoRef}
      className={styles.previewVideo}
      src={logo.video}
      poster={logo.poster}
      width={logo.width}
      height={logo.height}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}

function PreviewBody({
  logo,
  reduceMotion,
  active,
}: {
  logo: HeroLogo;
  reduceMotion: boolean;
  active: boolean;
}) {
  return (
    <>
      <div
        className={styles.previewMedia}
        style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
      >
        <PreviewMedia
          logo={logo}
          reduceMotion={reduceMotion}
          active={active}
        />
      </div>
      <p className={styles.previewCaption}>{logo.caption}</p>
    </>
  );
}

/**
 * Homepage first screen — static headline + logo row with hover/focus preview.
 */
export default function LogoHoverHero() {
  const labelId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const mode = usePreviewMode();
  const [activeId, setActiveId] = useState<HeroLogoId | null>(null);
  const [cardPos, setCardPos] = useState<{ left: number; top: number } | null>(
    null,
  );
  const rowRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<Map<HeroLogoId, HTMLButtonElement>>(new Map());
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLogo =
    activeId === null
      ? null
      : (HERO_LOGOS.find((l) => l.id === activeId) ?? null);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const placeCard = useCallback((id: HeroLogoId) => {
    const btn = logoRefs.current.get(id);
    const row = rowRef.current;
    if (!btn || !row) return;
    const stage = row.closest(`.${styles.stage}`) as HTMLElement | null;
    if (!stage) return;
    const stageBox = stage.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    const cardW = Math.min(CARD_MAX, stageBox.width - GUTTER * 2);
    // Align card centre to logo centre, then clamp into stage gutters.
    let left = btnBox.left + btnBox.width / 2 - cardW / 2 - stageBox.left;
    left = Math.max(GUTTER, Math.min(left, stageBox.width - GUTTER - cardW));
    const top = rowBox.bottom - stageBox.top + 16;
    setCardPos({ left, top });
  }, []);

  const open = useCallback(
    (id: HeroLogoId) => {
      clearLeaveTimer();
      setActiveId(id);
      if (mode === 'hover') placeCard(id);
    },
    [mode, placeCard],
  );

  const close = useCallback(() => {
    clearLeaveTimer();
    setActiveId(null);
  }, []);

  const scheduleClose = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setActiveId(null), 80);
  }, []);

  // Reposition on resize while open (desktop).
  useEffect(() => {
    if (mode !== 'hover' || !activeId) return;
    const onResize = () => placeCard(activeId);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeId, mode, placeCard]);

  // Escape closes the preview and returns focus to the active logo.
  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const id = activeId;
      close();
      logoRefs.current.get(id)?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, close]);

  useEffect(
    () => () => {
      clearLeaveTimer();
    },
    [],
  );

  const onLogoClick = (id: HeroLogoId) => {
    if (mode === 'touch') {
      setActiveId((prev) => (prev === id ? null : id));
      return;
    }
    open(id);
  };

  const onLogoKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    id: HeroLogoId,
  ) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      logoRefs.current.get(id)?.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      // Focus already opens via onFocus in hover mode; touch toggles on click.
      if (mode === 'touch') {
        event.preventDefault();
        setActiveId((prev) => (prev === id ? null : id));
      }
    }
  };

  return (
    <section
      className={styles.section}
      aria-label="Featured work"
      id="home-hero"
    >
      <div className={styles.stage}>
        <div className={styles.main}>
          <h1 className={styles.headline}>{HERO_HEADLINE}</h1>

          <div
            ref={rowRef}
            className={styles.logoRow}
            role="group"
            aria-labelledby={labelId}
          >
            <span id={labelId} className="sr-only">
              Company logos — hover or focus for a preview
            </span>
            {HERO_LOGOS.map((logo) => {
              const dimmed = activeId !== null && activeId !== logo.id;
              return (
                <button
                  key={logo.id}
                  type="button"
                  className={styles.logoButton}
                  data-logo={logo.id}
                  data-dimmed={dimmed ? 'true' : 'false'}
                  data-active={activeId === logo.id ? 'true' : 'false'}
                  aria-label={`${logo.label} — ${logo.caption}`}
                  aria-expanded={activeId === logo.id}
                  aria-controls={
                    activeId === logo.id ? 'hero-logo-preview' : undefined
                  }
                  ref={(el) => {
                    if (el) logoRefs.current.set(logo.id, el);
                    else logoRefs.current.delete(logo.id);
                  }}
                  onMouseEnter={() => {
                    if (mode === 'hover') open(logo.id);
                  }}
                  onMouseLeave={() => {
                    if (mode === 'hover') scheduleClose();
                  }}
                  onFocus={() => {
                    if (mode === 'hover') open(logo.id);
                  }}
                  onBlur={() => {
                    if (mode === 'hover') scheduleClose();
                  }}
                  onClick={() => onLogoClick(logo.id)}
                  onKeyDown={(e) => onLogoKeyDown(e, logo.id)}
                >
                  <LogoMark logo={logo} />
                </button>
              );
            })}
          </div>

          {/* Touch / narrow: in-flow preview — one shell; swap media in place. */}
          <div className={styles.inlinePreview}>
            <AnimatePresence initial={false}>
              {mode === 'touch' && activeLogo ? (
                <motion.div
                  key="inline-preview"
                  id="hero-logo-preview"
                  className={styles.inlineCard}
                  role="region"
                  aria-label={activeLogo.caption}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: reduceMotion ? 0 : ENTER_MS,
                      ease: EASE_OUT,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: reduceMotion ? 0 : 8,
                    transition: {
                      duration: reduceMotion ? 0 : EXIT_MS,
                      ease: EASE_OUT,
                    },
                  }}
                >
                  <PreviewBody
                    logo={activeLogo}
                    reduceMotion={reduceMotion}
                    active
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop hover layer — one shell; move + swap without re-enter. */}
        <div
          className={styles.previewLayer}
          onMouseEnter={clearLeaveTimer}
          onMouseLeave={() => {
            if (mode === 'hover') scheduleClose();
          }}
        >
          <AnimatePresence>
            {mode === 'hover' && activeLogo && cardPos ? (
              <motion.div
                key="hover-preview"
                id="hero-logo-preview"
                className={styles.previewCard}
                role="region"
                aria-label={activeLogo.caption}
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  left: cardPos.left,
                  top: cardPos.top,
                  transition: {
                    duration: reduceMotion ? 0 : ENTER_MS,
                    ease: EASE_OUT,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: reduceMotion ? 0 : 8,
                  transition: {
                    duration: reduceMotion ? 0 : EXIT_MS,
                    ease: EASE_OUT,
                  },
                }}
              >
                <PreviewBody
                  logo={activeLogo}
                  reduceMotion={reduceMotion}
                  active
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
