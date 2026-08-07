'use client';

import { useEffect, useState } from 'react';
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
        fill="rgb(224, 224, 224)"
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

/**
 * The two anchor buttons. Faithful to the original's two distinct components:
 *
 * - "Work" (`NavButton 3`, framer-rGfuZ) is instantiated with no scroll-section
 *   ref and no hover gesture, so its 12px dot stays rgb(42,39,53) at all times
 *   and the button never changes on hover. (Its Variant 2 — a rgb(100,59,204)
 *   dot — exists in the component but is never reachable on the published
 *   site.)
 * - "Experience" (`NavButton`, framer-prE4U) IS wired to a scroll section:
 *   `__framer__targets: [{ref: <#experience>, target: 'SPzzMnmKN'}]` with
 *   `__framer__threshold: 0` and `__framer__animateOnce: false`. While any
 *   part of #experience is in the viewport the button switches to Variant 2
 *   (dot rgb(59,91,255)) and its transform effect scales it to 1.1, animated
 *   with `{type:'spring', bounce:0.2, duration:0.4}`.
 */
function NavLinks({
  isHome,
  experienceInView,
  onNavigate,
}: {
  isHome: boolean;
  experienceInView: boolean;
  onNavigate?: () => void;
}) {
  const anchorHref = useAnchorHref(isHome);

  return (
    <>
      <a href={anchorHref('work')} className={styles.navLink} onClick={onNavigate}>
        <span className={styles.dot} aria-hidden="true" />
        Work
      </a>
      <a
        href={anchorHref('experience')}
        className={styles.navLink}
        data-inview={experienceInView || undefined}
        aria-current={experienceInView ? 'true' : undefined}
        onClick={onNavigate}
      >
        <span className={styles.dot} aria-hidden="true" />
        Experience
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
        Linkedin
      </a>
      <a
        href="mailto:remi.bouskila@gmail.com"
        className={styles.smallLink}
        onClick={onNavigate}
      >
        Email
      </a>
      {/* Resume href is the original's exact Google Drive share link (see
          reference/mirror/home.html) — not a framerusercontent PDF asset,
          so there is nothing to self-host. Flagged in the build report. */}
      <a
        href="https://drive.google.com/file/d/1K3cDPcaTtubMTIIHOGLsKj8TPRLqcfAQ/view?usp=sharing"
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

/**
 * Primary site navigation. Desktop/tablet (>809px): a floating card in the
 * top-left corner with the "remi." wordmark, Work/Experience anchor links
 * (see NavLinks for the Experience-only in-view indicator), a divider, then
 * smaller Linkedin/Email/Resume links.
 *
 * Mobile (<=809px): collapses to a small top-left icon button that expands a
 * dropdown panel with the same content (see BUILD_SPEC.md breakpoints) —
 * matching the original, whose Nav switches to Variant 3 below 810px.
 */
export default function SidebarNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [experienceInView, setExperienceInView] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setExperienceInView(false);
      return;
    }

    const section = document.getElementById('experience');
    if (!section) return;

    // threshold 0 == "any part visible", matching __framer__threshold: 0.
    const observer = new IntersectionObserver(
      ([entry]) => setExperienceInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [isHome]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={styles.nav} aria-label="Primary">
      {/* Desktop / tablet: >809px */}
      <div className={styles.card}>
        <a href="/" className={styles.logoLink} aria-label="remi. — home">
          <RemiLogo />
        </a>
        <div className={styles.divider} />
        <div className={styles.links}>
          <NavLinks isHome={isHome} experienceInView={experienceInView} />
        </div>
        <div className={styles.divider} />
        <SmallLinks />
      </div>

      {/* Mobile: <=809px, collapses to a top bar with an expandable menu */}
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
                experienceInView={experienceInView}
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
