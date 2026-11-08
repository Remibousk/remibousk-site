'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from 'react';
import { usePathname } from 'next/navigation';
import styles from './SidebarNav.module.css';

/**
 * "remi." wordmark. Exact inline SVG path data copied from the original
 * (reference/mirror/home.html, data-framer-name="RemiLogo"), viewBox 0 0 105 28,
 * fill rgb(224, 224, 224). Not a separate asset file — the original also
 * inlines it directly rather than referencing a file in public/images.
 */
function RemiLogo() {
  return (
    <svg
      className={styles.logo}
      viewBox="0 0 105 28"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="remi."
    >
      <path
        fill="currentColor"
        d="M 45.225 27.1 L 52.915 27.1 L 52.915 13.171 C 52.915 11.612 52.915 7.362 57.265 7.362 C 61.11 7.362 61.11 11.425 61.11 12.842 L 61.11 27.1 L 68.799 27.1 L 68.799 12.792 C 68.799 11.326 68.799 7.362 73.058 7.362 C 76.995 7.362 76.995 11.046 76.995 13.171 L 76.995 27.1 L 84.684 27.1 L 84.684 12.792 C 84.684 6.984 84.312 5.238 81.905 2.641 C 79.822 0.423 76.952 -0.005 75.148 -0.005 C 71.212 -0.005 68.573 2.119 66.995 4.667 C 64.96 0.796 61.858 -0.005 59.586 -0.005 C 54.772 -0.005 53.103 2.591 52.5 3.678 L 52.408 3.678 L 52.408 0.895 L 45.231 0.895 L 45.231 27.1 Z M 23.461 11.096 C 23.784 9.536 25.313 6.61 29.298 6.61 C 33.282 6.61 34.806 9.536 35.135 11.096 L 23.466 11.096 Z M 34.063 18.886 C 32.997 20.253 31.748 21.34 29.384 21.34 C 26.374 21.34 23.827 19.501 23.364 16.383 L 42.63 16.383 C 42.722 15.768 42.813 15.345 42.813 14.307 C 42.813 6.33 37.073 0 29.244 0 C 21.415 0 15.766 6.753 15.766 14.071 C 15.766 21.862 22.018 27.951 29.384 27.951 C 32.022 27.951 34.569 27.149 36.702 25.59 C 38.877 24.08 40.686 21.813 41.935 18.886 Z M 0 0.45 L 7.689 0.45 L 7.689 26.655 L 0 26.655 Z M 12.697 8.115 C 14.845 8.115 16.59 6.336 16.59 4.145 C 16.59 1.955 14.845 0.176 12.697 0.176 C 10.548 0.176 8.804 1.955 8.804 4.145 C 8.804 6.336 10.548 8.115 12.697 8.115 M 88.173 0.736 L 95.862 0.736 L 95.862 26.94 L 88.173 26.94 Z M 100.87 19.276 C 103.018 19.276 104.763 21.055 104.763 23.245 C 104.763 25.436 103.018 27.215 100.87 27.215 C 98.722 27.215 96.977 25.436 96.977 23.245 C 96.977 21.055 98.722 19.276 100.87 19.276"
      />
    </svg>
  );
}

/**
 * Hamburger icon used for the mobile top bar. Exact geometry copied from the
 * original (symbol #1171430842 in reference/mirror/home.html): three 14.5px
 * horizontal strokes in a 24x24 viewBox, 1.5px stroke width, round caps.
 */
function HamburgerIcon() {
  return (
    <svg
      className={styles.hamburgerIcon}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 0 0 L 14.5 0"
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        stroke="currentColor"
        transform="translate(4.75 5.75)"
      />
      <path
        d="M 0 0 L 14.5 0"
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        stroke="currentColor"
        transform="translate(4.75 12)"
      />
      <path
        d="M 0 0 L 14.5 0"
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        stroke="currentColor"
        transform="translate(4.75 18.25)"
      />
    </svg>
  );
}

/**
 * Builds an href that scrolls to a same-page anchor on the homepage, or
 * navigates back to the homepage anchor from any other route (per
 * BUILD_SPEC: "Nav links scroll to #work / #experience on the homepage;
 * when on a case-study page they navigate to /#work etc.").
 */
function useAnchorHref(isHome: boolean) {
  return (id: string) => (isHome ? `#${id}` : `/#${id}`);
}

const SECTION_IDS = ['work', 'side-projects', 'experience'] as const;
type SectionId = (typeof SECTION_IDS)[number];

/** Scroll distance (px) over which the desktop card fades 0 → 1. */
const FADE_RANGE = 130;

/**
 * Homepage section anchors. Each link maps to an id; the active item is
 * the last section whose top has crossed the spy line (70% from the top
 * of the viewport). #work is only the intro statement, so Work stays
 * active through the following case-study block until Side Projects takes
 * over — we do not require the section's bottom to still be on screen.
 */
function NavLinks({
  isHome,
  activeId,
  onNavigate,
}: {
  isHome: boolean;
  activeId: SectionId | null;
  onNavigate?: () => void;
}) {
  const anchorHref = useAnchorHref(isHome);

  return (
    <>
      <a
        href={anchorHref('work')}
        className={styles.navLink}
        data-inview={activeId === 'work' || undefined}
        aria-current={activeId === 'work' ? 'true' : undefined}
        onClick={onNavigate}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.navLabel}>Work</span>
      </a>
      <a
        href={anchorHref('side-projects')}
        className={styles.navLink}
        data-inview={activeId === 'side-projects' || undefined}
        aria-current={activeId === 'side-projects' ? 'true' : undefined}
        onClick={onNavigate}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.navLabel}>Side Projects</span>
      </a>
      <a
        href={anchorHref('experience')}
        className={styles.navLink}
        data-inview={activeId === 'experience' || undefined}
        aria-current={activeId === 'experience' ? 'true' : undefined}
        onClick={onNavigate}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.navLabel}>Experience</span>
      </a>
    </>
  );
}

function SmallLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className={styles.smallLinks}>
      <a
        href="https://www.linkedin.com/in/remibousk/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.smallLink}
        onClick={onNavigate}
      >
        LinkedIn
      </a>
      <a
        href="mailto:remi.bouskila@gmail.com"
        className={styles.smallLink}
        onClick={onNavigate}
      >
        Email
      </a>
      {/* Resume href is a Google Drive share link — not a self-hosted PDF. */}
      <a
        href="https://drive.google.com/file/d/1ezxdLGWdbPysvOBvxK8kmGaLY6Og5kWX/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.smallLink}
        onClick={onNavigate}
      >
        Resume
      </a>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/**
 * Primary site navigation. Desktop/tablet (>809px): a floating card in the
 * top-left corner with the "remi." wordmark, Work / Side Projects /
 * Experience anchors, then smaller LinkedIn/Email/Resume links.
 *
 * On the homepage at desktop, the card starts hidden and gently fades in
 * over the first ~130px of scroll (and out again when returning to top).
 * A focusable “Site navigation” control reveals it for keyboard users.
 * Mobile (<=809px) keeps the always-available hamburger — not scroll-hidden.
 */
export default function SidebarNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const reduceMotion = usePrefersReducedMotion();
  const revealId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setActiveId(null);
      return;
    }

    let frame = 0;

    const update = () => {
      const line = window.innerHeight * 0.7;
      let next: SectionId | null = null;
      for (const id of SECTION_IDS) {
        const section = document.getElementById(id);
        if (!section) continue;
        if (section.getBoundingClientRect().top <= line) next = id;
      }
      setActiveId((prev) => (prev === next ? prev : next));

      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_RANGE));
      setScrollProgress((prev) =>
        Math.abs(prev - progress) < 0.001 ? prev : progress,
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);

  // Non-home routes always show the desktop card (case studies still need nav).
  const fadeProgress = isHome ? scrollProgress : 1;
  const visualProgress = forceShow
    ? 1
    : reduceMotion
      ? fadeProgress >= 0.5
        ? 1
        : 0
      : fadeProgress;
  const desktopHidden = isHome && !forceShow && visualProgress < 0.02;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (desktopHidden) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  }, [desktopHidden]);

  const closeMobile = () => setMobileOpen(false);

  const onCardBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    // Drop forced show once focus leaves; scroll position decides visibility.
    setForceShow(false);
  };

  return (
    <nav className={styles.nav} aria-label="Primary">
      {/*
        Keyboard affordance: always in tab order on desktop homepage.
        Focusing or activating it reveals the card even at scrollY ≈ 0.
      */}
      {isHome ? (
        <button
          type="button"
          id={revealId}
          className={styles.revealControl}
          onFocus={() => setForceShow(true)}
          onClick={() => {
            setForceShow(true);
            // Move focus into the card so Tab continues through links.
            requestAnimationFrame(() => {
              cardRef.current
                ?.querySelector<HTMLElement>('a, button')
                ?.focus();
            });
          }}
        >
          Site navigation
        </button>
      ) : null}

      {/* Desktop / tablet: >809px */}
      <div
        ref={cardRef}
        className={styles.card}
        data-fading={isHome ? 'true' : undefined}
        data-hidden={desktopHidden ? 'true' : undefined}
        style={
          isHome
            ? ({
                '--nav-fade': String(visualProgress),
              } as CSSProperties)
            : undefined
        }
        onFocusCapture={() => setForceShow(true)}
        onBlur={onCardBlur}
        aria-hidden={desktopHidden ? true : undefined}
      >
        <a href="/" className={styles.logoLink} aria-label="remi. — home">
          <RemiLogo />
        </a>
        <div className={styles.divider} />
        <div className={styles.links}>
          <NavLinks isHome={isHome} activeId={activeId} />
        </div>
        <div className={styles.divider} />
        <SmallLinks />
      </div>

      {/* Mobile: <=809px — always available hamburger; not scroll-hidden. */}
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.mobileToggle}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="sidebar-nav-mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <HamburgerIcon />
        </button>
        {mobileOpen && (
          <div id="sidebar-nav-mobile-menu" className={styles.mobileMenu}>
            <a
              href="/"
              className={styles.logoLink}
              aria-label="remi. — home"
              onClick={closeMobile}
            >
              <RemiLogo />
            </a>
            <div className={styles.divider} />
            <div className={styles.links}>
              <NavLinks
                isHome={isHome}
                activeId={activeId}
                onNavigate={closeMobile}
              />
            </div>
            <div className={styles.divider} />
            <SmallLinks onNavigate={closeMobile} />
          </div>
        )}
      </div>
    </nav>
  );
}
