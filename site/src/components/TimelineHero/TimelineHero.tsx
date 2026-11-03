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
  DEFAULT_HEADLINE,
  ERAS,
  LOGO_STRIP,
  type Era,
} from '@/content/eras';
import styles from './TimelineHero.module.css';

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

function EraCard({ era }: { era: Era }) {
  const body = (
    <>
      <div className={styles.cardThumb}>
        <Image
          src={era.card.image}
          alt={era.card.alt}
          width={256}
          height={160}
          sizes="(max-width: 600px) 100vw, 128px"
        />
      </div>
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

/**
 * Homepage first screen — timeline scrubber hero (PR 2).
 * Discrete era stops; selected stop is ink-on-surface (never soft).
 */
export default function TimelineHero() {
  const labelId = useId();
  const [index, setIndex] = useState<number | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const selected = index === null ? null : ERAS[index];
  const headline = selected?.headline ?? DEFAULT_HEADLINE;

  const selectIndex = useCallback((next: number | null) => {
    setIndex(next);
  }, []);

  const reset = useCallback(() => selectIndex(null), [selectIndex]);

  const moveBy = useCallback(
    (delta: number) => {
      setIndex((prev) => {
        if (prev === null) return delta > 0 ? 0 : ERAS.length - 1;
        return Math.min(ERAS.length - 1, Math.max(0, prev + delta));
      });
    },
    [],
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
        moveBy(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveBy(-1);
        break;
      case 'Home':
        event.preventDefault();
        selectIndex(0);
        break;
      case 'End':
        event.preventDefault();
        selectIndex(ERAS.length - 1);
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
    if (next !== null) selectIndex(next);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const next = indexFromClientX(event.clientX);
    if (next !== null) selectIndex(next);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  useEffect(() => {
    // Keep focus on the checked radio after keyboard moves.
    if (index === null) return;
    const root = groupRef.current;
    const el = root?.querySelector<HTMLElement>(
      `[data-era-index="${index}"]`,
    );
    el?.focus();
  }, [index]);

  return (
    <section
      className={styles.section}
      aria-label="Career timeline"
      id="home-hero"
    >
      <div className={styles.stage}>
        <div className={styles.main}>
          <h1 className={styles.headline} aria-live="polite">
            {headline}
          </h1>

          <div className={styles.logos} aria-label="Companies">
            {LOGO_STRIP.map((logo) => {
              const dimmed =
                selected !== null && selected.logoId !== logo.id;
              return (
                <span
                  key={logo.id}
                  className={styles.logoItem}
                  data-dimmed={dimmed ? 'true' : 'false'}
                >
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
                </span>
              );
            })}
          </div>

          {selected ? <EraCard era={selected} /> : null}
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
                  onClick={() => selectIndex(i)}
                >
                  {era.yearLabel}
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
