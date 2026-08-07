import Link from 'next/link';
import type { ReactElement } from 'react';
import DeviceTabs from '@/components/DeviceTabs/DeviceTabs';
import styles from './CaseCards.module.css';

/**
 * "SUMM" header block + tabbed device showcase + "Case studies" card grid.
 * Source: reference/mirror/home.html, the (unnamed) wrapper div that holds
 * both the "SUMM"/"Formerly Crypto Tax Calculator"/"Lead product designer"
 * heading (framer-1a9z7v2, no data-framer-name of its own) and, immediately
 * after it in the DOM, the three responsive "<Breakpoint>/summ/dark"
 * components (data-framer-name="Desktop/summ/dark" etc.) which themselves
 * contain the "Portfolio" section (data-framer-name="Portfolio") with the
 * "Case studies" heading and the three "Onboarding card" links.
 *
 * DeviceTabs is a standalone, separately-exported component (own folder),
 * but this component is what actually places it in the page — it renders
 * between the two heading blocks to match the original's DOM order exactly.
 * Text verbatim from content/home.md.
 *
 * No entrance animation: the original homepage carries no Framer appear
 * effects at all (`/` has zero `data-framer-appear-id` nodes in the mirror).
 */

interface CardDef {
  key: string;
  href: string;
  title: string;
  subtitle: string;
}

const CARDS: CardDef[] = [
  {
    key: 'onboarding',
    href: '/onboardingtoctc',
    title: 'Onboarding',
    subtitle: 'How we achieved a 50% uplift in conversion rate.',
  },
  {
    key: 'design-system',
    href: '/summ-design-system',
    title: 'Design System',
    subtitle: 'Complete multi-theme, fully tokenised white label design system.',
  },
  {
    key: 'mobile-experience',
    href: '/mobileweb',
    title: 'Mobile experience',
    subtitle: 'Optimising the end-to-end mobile journey for conversion.',
  },
];

/**
 * Onboarding card's media: an autoplaying, looping mp4
 * (BVBw6HPmvDBjrHViefERyskIw8.mp4 — confirmed via reference/mirror/home.html,
 * this is the only one of the three "Onboarding card" anchors that contains
 * a <video> rather than an <img>; the other two use LjAF6ttW1OyRFF8BptAITS4wDJ8.png
 * and 7wxvhyqQBQnK74KbhtDilqlok.png/aalz0wO0iak5HKwo88fdr62dk.png respectively).
 */
function OnboardingMedia() {
  return (
    <video
      className={styles.media}
      src="/videos/BVBw6HPmvDBjrHViefERyskIw8.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Onboarding flow screen recording"
    />
  );
}

function DesignSystemMedia() {
  return (
    <img
      className={styles.media}
      src="/images/LjAF6ttW1OyRFF8BptAITS4wDJ8.png"
      width={3318}
      height={2288}
      alt="SUMM design system components: chips, tooltips, toasts, buttons, and steppers"
      loading="lazy"
    />
  );
}

/**
 * Mobile experience card's media swaps source image at the same
 * tablet/desktop breakpoint as the original (desktop: 7wxvhyqQBQnK74KbhtDilqlok.png
 * 968x589, tablet+mobile: aalz0wO0iak5HKwo88fdr62dk.png 968x612 — verified via
 * the ssr-variant wrappers in reference/mirror/home.html, not two stacked
 * layers as the flattened markdown might suggest).
 */
function MobileExperienceMedia() {
  return (
    <>
      <img
        className={`${styles.media} ${styles.mediaDesktopOnly}`}
        src="/images/7wxvhyqQBQnK74KbhtDilqlok.png"
        width={968}
        height={589}
        alt="Mobile portfolio app screen with balance chart"
        loading="lazy"
      />
      <img
        className={`${styles.media} ${styles.mediaTabletMobileOnly}`}
        src="/images/aalz0wO0iak5HKwo88fdr62dk.png"
        width={968}
        height={612}
        alt="Mobile portfolio app screen with balance chart"
        loading="lazy"
      />
    </>
  );
}

const CARD_MEDIA: Record<string, () => ReactElement> = {
  onboarding: OnboardingMedia,
  'design-system': DesignSystemMedia,
  'mobile-experience': MobileExperienceMedia,
};

export default function CaseCards() {
  return (
    <section className={styles.section} aria-labelledby="summ-heading">
      <div className={styles.heading}>
        <h1 id="summ-heading" className={styles.title}>
          SUMM
        </h1>
        <div className={styles.subheadRow}>
          <h5 className={styles.subhead}>Formerly Crypto Tax Calculator</h5>
          <h5 className={styles.subhead}>Lead product designer</h5>
        </div>
      </div>

      <DeviceTabs />

      <div className={styles.portfolio}>
        <h3 className={styles.caseStudiesHeading}>Case studies</h3>
        <div className={styles.grid}>
          {CARDS.map((card) => {
            const Media = CARD_MEDIA[card.key];
            return (
              <Link key={card.key} href={card.href} className={styles.card}>
                <div className={styles.mediaFrame}>
                  <Media />
                </div>
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <h5 className={styles.cardSubtitle}>{card.subtitle}</h5>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
