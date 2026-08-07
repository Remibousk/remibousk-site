'use client';

import { useState, type ReactElement } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from './DeviceTabs.module.css';

/**
 * Tab bar + swapping mockup image ("Desktop/summ/dark" / "Tablet/summ/dark" /
 * "Mobile/summ/dark" component family in reference/mirror/home.html).
 *
 * The original is a Framer component instance with per-breakpoint variants
 * (Desktop/CTC/dark, Tablet/MM/dark, etc.) that swap both the tab pill's own
 * active/default styling AND the big background screenshot behind the whole
 * card. That variant -> image map isn't in the static HTML (only the default
 * "summ" state is server-rendered); it's reconstructed from the page's own
 * generated JS module (reference/mirror/framerusercontent.com/sites/
 * 5QZeuQrhP9PqgyB7kv1wOC/RUqqse2zCrL-QBAHKdCYLLMWWqufIEzSbI0QBx4F87A.DKx8smEm.mjs),
 * which maps each variant id to a literal `background.src`:
 *   Desktop/summ/dark -> EbKF5fIBtqzqFshDBrVpGSk08.png (1344x896)
 *   Desktop/CTC/dark  -> yBbJN1C6degAVAJeh9t5JFOjRU.png (1280x841)
 *   Desktop/MM/dark   -> T1wtXYvkk2GrUjtewb4EcEb9rvg.png (1280x841)
 * (same three images are reused for the Tablet/Mobile variants, just resized).
 *
 * The component actually has 18 variants — {Desktop, Tablet, Mobile} x
 * {summ, CTC, MM} x {dark, light}. Device only affects layout; the window
 * screenshot is a function of (product, theme) only, giving six images:
 *   summ/dark -> 2WjNINoC9OdUqLvsH7FRXys.png
 *   summ/light -> T0X4KQ827DP3lFOPX4nGk7JIJo.png
 *   CTC/dark  -> yBbJN1C6degAVAJeh9t5JFOjRU.png
 *   CTC/light -> AVdmC1lbjUmwxARFglm3fdPVevI.png
 *   MM/dark   -> T1wtXYvkk2GrUjtewb4EcEb9rvg.png
 *   MM/light  -> 8XUrQJLJt49bB0oEFQMBhZ5quw.png
 * The theme half is driven by the "Utility / Toggle" switch in the toolbar's
 * top-right corner, which is a real control on the original (variants
 * "On" = day/yellow track and "Off" = night/navy track, default "Off").
 */

type TabId = 'summ' | 'ctc' | 'mm';
type Theme = 'dark' | 'light';

interface TabDef {
  id: TabId;
  name: string;
  image: Record<Theme, string>;
  width: number;
  height: number;
}

/*
 * Integration correction (measured against home-desktop.png + the mirror
 * DOM): the card's own background is the desert-oasis artwork
 * (EbKF5fIBtqzqFshDBrVpGSk08.png, object-fit cover — constant across all
 * three tabs), and what the tabs swap is the floating app-window screenshot
 * (data-framer-name="Portfolio", .framer-1cuhrbf, aspect-ratio 1.522) that
 * sits below the toolbar row. All three window images are 2560x1682.
 */
const BACKGROUND_IMAGE = '/images/EbKF5fIBtqzqFshDBrVpGSk08.png';

const TABS: TabDef[] = [
  {
    id: 'summ',
    name: 'Summ',
    image: {
      dark: '/images/2WjNINoC9OdUqLvsH7FRXys.png',
      light: '/images/T0X4KQ827DP3lFOPX4nGk7JIJo.png',
    },
    width: 2560,
    height: 1682,
  },
  {
    id: 'ctc',
    name: 'CTC',
    image: {
      dark: '/images/yBbJN1C6degAVAJeh9t5JFOjRU.png',
      light: '/images/AVdmC1lbjUmwxARFglm3fdPVevI.png',
    },
    width: 2560,
    height: 1682,
  },
  {
    id: 'mm',
    name: 'MetaMask',
    image: {
      dark: '/images/T1wtXYvkk2GrUjtewb4EcEb9rvg.png',
      light: '/images/8XUrQJLJt49bB0oEFQMBhZ5quw.png',
    },
    width: 2560,
    height: 1682,
  },
];

/** "Summ/Active" pill icon — four-sparkle grid mark, exact path data from
 * the original's inline SVG (data-framer-name="Summ/Active" icon, viewBox
 * 0 0 24 24, fill rgb(255,255,255)). */
function SummIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={styles.tabIcon}>
      <path
        fill="rgb(255,255,255)"
        d="M 10.608 4.699 L 8.018 4.492 C 7.163 4.424 6.486 3.746 6.417 2.891 L 6.21 0.301 C 6.196 0.131 6.054 0 5.883 0 L 5.026 0 C 4.855 0 4.713 0.131 4.699 0.301 L 4.492 2.891 C 4.424 3.746 3.746 4.423 2.891 4.492 L 0.301 4.699 C 0.131 4.713 0 4.855 0 5.026 L 0 5.883 C 0 6.054 0.131 6.196 0.301 6.21 L 2.891 6.417 C 3.746 6.485 4.423 7.163 4.492 8.018 L 4.699 10.608 C 4.713 10.778 4.855 10.909 5.026 10.909 L 5.883 10.909 C 6.054 10.909 6.196 10.778 6.21 10.608 L 6.417 8.018 C 6.485 7.163 7.163 6.486 8.018 6.417 L 10.608 6.21 C 10.778 6.196 10.909 6.054 10.909 5.883 L 10.909 5.026 C 10.909 4.855 10.778 4.713 10.608 4.699 Z M 23.699 4.699 L 21.109 4.492 C 20.254 4.424 19.577 3.746 19.508 2.891 L 19.301 0.301 C 19.287 0.131 19.145 0 18.974 0 L 18.117 0 C 17.946 0 17.804 0.131 17.79 0.301 L 17.583 2.891 C 17.515 3.746 16.837 4.423 15.982 4.492 L 13.392 4.699 C 13.222 4.713 13.091 4.855 13.091 5.026 L 13.091 5.883 C 13.091 6.054 13.222 6.196 13.392 6.21 L 15.982 6.417 C 16.837 6.485 17.514 7.163 17.583 8.018 L 17.79 10.608 C 17.804 10.778 17.946 10.909 18.117 10.909 L 18.974 10.909 C 19.145 10.909 19.287 10.778 19.301 10.608 L 19.508 8.018 C 19.576 7.163 20.254 6.486 21.109 6.417 L 23.699 6.21 C 23.869 6.196 24 6.054 24 5.883 L 24 5.026 C 24 4.855 23.869 4.713 23.699 4.699 Z M 10.608 17.79 L 8.018 17.583 C 7.163 17.515 6.486 16.837 6.417 15.982 L 6.21 13.392 C 6.196 13.222 6.054 13.091 5.883 13.091 L 5.026 13.091 C 4.855 13.091 4.713 13.222 4.699 13.392 L 4.492 15.982 C 4.424 16.837 3.746 17.514 2.891 17.583 L 0.301 17.79 C 0.131 17.804 0 17.946 0 18.117 L 0 18.974 C 0 19.145 0.131 19.287 0.301 19.301 L 2.891 19.508 C 3.746 19.576 4.423 20.254 4.492 21.109 L 4.699 23.699 C 4.713 23.869 4.855 24 5.026 24 L 5.883 24 C 6.054 24 6.196 23.869 6.21 23.699 L 6.417 21.109 C 6.485 20.254 7.163 19.577 8.018 19.508 L 10.608 19.301 C 10.778 19.287 10.909 19.145 10.909 18.974 L 10.909 18.117 C 10.909 17.946 10.778 17.804 10.608 17.79 Z M 23.699 17.79 L 21.109 17.583 C 20.254 17.515 19.577 16.837 19.508 15.982 L 19.301 13.392 C 19.287 13.222 19.145 13.091 18.974 13.091 L 18.117 13.091 C 17.946 13.091 17.804 13.222 17.79 13.392 L 17.583 15.982 C 17.515 16.837 16.837 17.514 15.982 17.583 L 13.392 17.79 C 13.222 17.804 13.091 17.946 13.091 18.117 L 13.091 18.974 C 13.091 19.145 13.222 19.287 13.392 19.301 L 15.982 19.508 C 16.837 19.576 17.514 20.254 17.583 21.109 L 17.79 23.699 C 17.804 23.869 17.946 24 18.117 24 L 18.974 24 C 19.145 24 19.287 23.869 19.301 23.699 L 19.508 21.109 C 19.576 20.254 20.254 19.577 21.109 19.508 L 23.699 19.301 C 23.869 19.287 24 19.145 24 18.974 L 24 18.117 C 24 17.946 23.869 17.804 23.699 17.79 Z"
      />
    </svg>
  );
}

/** "CTC/Default" pill icon — CTC diamond/swap mark, exact path data from the
 * original (viewBox 0 0 24 24, purple palette). */
function CtcIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={styles.tabIcon}>
      <g>
        <path fill="rgb(176,137,244)" d="M 5.036 0 L 3.625 1.462 L 5.789 3.628 L 4.704 4.709 L 3.625 5.794 L 1.461 3.579 L 0 5.042 L 2.164 7.208 L 1.085 8.289 L 1.129 15.496 L 4.704 11.917 L 8.28 8.289 L 11.905 4.709 L 8.28 1.13 L 7.2 2.215 Z" />
        <path fill="rgb(203,176,248)" d="M 15.549 1.14 L 15.549 8.342 L 11.973 4.763 L 8.348 1.184 Z" />
        <path fill="rgb(144,103,255)" d="M 15.446 22.753 L 8.29 22.753 L 4.67 19.13 L 1.138 15.545 L 4.714 11.966 L 8.29 15.545 L 11.87 19.13 Z" />
        <path fill="rgb(124,58,237)" d="M 19.149 11.985 L 15.573 15.565 L 11.953 19.149 L 15.529 22.773 L 16.608 21.692 L 18.914 24 L 20.375 22.538 L 18.069 20.23 L 19.149 19.149 L 20.233 18.063 L 22.539 20.372 L 24 18.909 L 21.694 16.601 L 22.73 15.565 L 22.774 8.357 L 19.149 11.985 Z" />
        <path fill="rgb(116,86,207)" d="M 4.714 11.966 L 1.138 15.545 L 5.657 12.91 Z" />
        <path fill="rgb(214,207,237)" d="M 11.996 4.748 L 11.004 5.731 L 11.009 5.741 Z" />
        <path fill="rgb(154,120,223)" d="M 8.349 1.14 L 10.981 5.702 L 11.973 4.719 L 8.348 1.14 Z" />
        <path fill="rgb(87,69,158)" d="M 13.033 18.044 L 11.953 19.075 L 15.529 22.704 Z" />
      </g>
    </svg>
  );
}

/** "MM/Default" pill icon — MetaMask fox mark, exact path data from the
 * original (viewBox 0 0 24 23, orange palette). */
function MmIcon() {
  return (
    <svg viewBox="0 0 24 23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={styles.tabIcon}>
      <g>
        <path fill="rgb(255,92,22)" d="M 22.428 22.183 L 17.258 20.655 L 13.36 22.968 L 10.64 22.967 L 6.739 20.655 L 1.572 22.183 L 0 16.915 L 1.572 11.069 L 0 6.126 L 1.572 0 L 9.646 4.789 L 14.354 4.789 L 22.428 0 L 24 6.126 L 22.428 11.069 L 24 16.915 Z" />
        <path fill="rgb(255,92,22)" d="M 1.606 0 L 9.68 4.792 L 9.359 8.081 Z M 6.773 16.917 L 10.326 19.604 L 6.773 20.655 Z M 10.042 12.476 L 9.359 8.084 L 4.989 11.07 L 4.986 11.069 L 4.986 11.071 L 5 14.146 L 6.772 12.476 Z M 22.461 0 L 14.387 4.792 L 14.707 8.081 Z M 17.294 16.917 L 13.741 19.604 L 17.294 20.655 Z M 19.08 11.071 L 19.081 11.071 L 19.08 11.071 L 19.08 11.069 L 19.079 11.07 L 14.708 8.084 L 14.025 12.476 L 17.294 12.476 L 19.067 14.145 Z" />
        <path fill="rgb(227,72,7)" d="M 6.739 20.682 L 1.572 22.21 L 0 16.945 L 6.739 16.945 Z M 10.008 12.502 L 10.995 18.852 L 9.627 15.321 L 4.965 14.173 L 6.738 12.502 L 10.008 12.502 Z M 17.261 20.682 L 22.428 22.21 L 24 16.944 L 17.261 16.944 Z M 13.992 12.502 L 13.005 18.852 L 14.373 15.321 L 19.036 14.173 L 17.261 12.502 L 13.992 12.502 Z" />
        <path fill="rgb(255,141,93)" d="M 0 16.909 L 1.572 11.063 L 4.952 11.063 L 4.964 14.138 L 9.627 15.286 L 10.995 18.817 L 10.292 19.594 L 6.739 16.908 L 0 16.908 Z M 24 16.909 L 22.428 11.063 L 19.048 11.063 L 19.035 14.138 L 14.373 15.286 L 13.005 18.817 L 13.708 19.594 L 17.261 16.908 L 24 16.908 Z M 14.354 4.783 L 9.646 4.783 L 9.326 8.071 L 10.995 18.813 L 13.005 18.813 L 14.675 8.071 Z" />
        <path fill="rgb(255,92,22)" d="M 1.572 0 L 0 6.126 L 1.572 11.069 L 4.952 11.069 L 9.325 8.081 Z M 9.031 13.75 L 7.5 13.75 L 6.666 14.561 L 9.628 15.29 L 9.031 13.749 Z M 22.428 0 L 24 6.126 L 22.428 11.069 L 19.048 11.069 L 14.675 8.081 Z M 14.971 13.75 L 16.505 13.75 L 17.338 14.562 L 14.373 15.293 L 14.971 13.749 Z M 13.359 20.873 L 13.708 19.603 L 13.005 18.826 L 10.993 18.826 L 10.29 19.603 L 10.64 20.873" />
        <path fill="rgb(192,196,205)" d="M 13.368 20.892 L 13.368 22.989 L 10.649 22.989 L 10.649 20.892 Z" />
        <path fill="rgb(231,235,246)" d="M 6.761 20.684 L 10.663 23 L 10.663 20.903 L 10.314 19.634 Z M 17.282 20.684 L 13.38 23 L 13.38 20.903 L 13.729 19.634 Z" />
      </g>
    </svg>
  );
}

const TAB_ICONS: Record<TabId, () => ReactElement> = {
  summ: SummIcon,
  ctc: CtcIcon,
  mm: MmIcon,
};

/** Moon glyph shown in the knob while the toggle is "Off" (night). Path from
 * the original's `Moon` component (framer-qiexT), 15x15 box. */
function MoonIcon() {
  return (
    <svg viewBox="0 0 18 18" className={styles.moonIcon} aria-hidden="true">
      <path
        fill="none"
        stroke="rgb(0,0,0)"
        strokeWidth="1.5"
        d="M 6.382 0 C 5.421 3.179 6.287 6.628 8.635 8.976 C 10.983 11.324 14.432 12.19 17.611 11.229 C 16.362 15.336 12.387 17.989 8.116 17.567 C 3.845 17.145 0.466 13.766 0.044 9.495 C -0.378 5.224 2.275 1.249 6.382 0 Z"
      />
    </svg>
  );
}

/** Sun glyph shown in the knob while the toggle is "On" (day). Path from the
 * original's `Sun` component (framer-cQWRH), 12x12 box. */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.sunIcon} aria-hidden="true">
      <g fill="none" stroke="rgb(0,0,0)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 1.5v2.5M12 20v2.5M1.5 12h2.5M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8" />
      </g>
    </svg>
  );
}

/**
 * Day/night toggle in the showcase toolbar's top-right corner — the
 * original's "Utility / Toggle" component (framer-ufZ9I, 40x24, radius 30,
 * padding 4, two 16px slots). Track colour: "On" rgb(227,188,48) (day),
 * "Off" rgb(53,60,105) (night, the default). Switching variants reorders the
 * two slots so the white knob slides side to side; Framer animates it with
 * `{type:'spring', stiffness:500, damping:60, mass:1}`.
 */
function NightToggle({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const isDay = theme === 'light';

  return (
    <button
      type="button"
      className={styles.toggleTrack}
      data-day={isDay || undefined}
      role="switch"
      aria-checked={isDay}
      aria-label="Light theme preview"
      onClick={onToggle}
    >
      <motion.span
        className={styles.toggleKnob}
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 60, mass: 1 }}
      >
        {isDay ? <SunIcon /> : <MoonIcon />}
      </motion.span>
    </button>
  );
}

/**
 * Tabbed device showcase. Three pill tabs (Summ active by default) crossfade
 * the large mockup screenshot behind them. Composed inside CaseCards, sitting
 * between the "SUMM" heading block and the "Case studies" card grid — see
 * CaseCards.tsx for how the full section comes together.
 */
export default function DeviceTabs() {
  const [active, setActive] = useState<TabId>('summ');
  const [theme, setTheme] = useState<Theme>('dark');
  const shouldReduceMotion = useReducedMotion();
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];
  const activeSrc = activeTab.image[theme];

  return (
    <div className={styles.card}>
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        aria-hidden="true"
        width={1344}
        height={896}
        className={styles.cardBg}
      />

      <div className={styles.toolbar}>
        <div className={styles.tabList} role="tablist" aria-label="Product showcase">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.id];
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={tab.name}
                className={isActive ? styles.tabActive : styles.tabDefault}
                onClick={() => setActive(tab.id)}
              >
                <Icon />
              </button>
            );
          })}
        </div>
        <NightToggle
          theme={theme}
          onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      </div>

      <div className={styles.window}>
        <AnimatePresence initial={false}>
          <motion.img
            key={activeSrc}
            src={activeSrc}
            width={activeTab.width}
            height={activeTab.height}
            alt={`${activeTab.name} product screenshot`}
            className={styles.image}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
