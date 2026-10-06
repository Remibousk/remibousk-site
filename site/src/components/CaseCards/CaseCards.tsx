import Link from 'next/link';
import type { ReactElement } from 'react';
import CaseStudiesAccordion from '@/components/CaseStudiesAccordion/CaseStudiesAccordion';
import MobileWebTile from './MobileWebTile';
import SummVideos from './SummVideos';
import VersionHistoryTile from './VersionHistoryTile';
import styles from './CaseCards.module.css';

/**
 * "SUMM" header block + product recordings + featured case-study banners
 * (Mobile web, then Version History) + collapsed "Other case studies"
 * accordion (card grid is unchanged once opened).
 * Source: reference/mirror/home.html, the (unnamed) wrapper div that holds
 * both the "SUMM"/"Formerly Crypto Tax Calculator"/"Lead product designer"
 * heading (framer-1a9z7v2, no data-framer-name of its own) and, immediately
 * after it in the DOM, the three responsive "<Breakpoint>/summ/dark"
 * components (data-framer-name="Desktop/summ/dark" etc.) which themselves
 * contain the "Portfolio" section (data-framer-name="Portfolio") with the
 * "Case studies" heading and the three "Onboarding card" links.
 *
 * The original tabbed device mockup is no longer shown. SummVideos places
 * the clickthrough as the section hero, then the remaining product loops.
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
];

/**
 * Onboarding card's media: a looping mp4 that plays once the accordion
 * opens (BVBw6HPmvDBjrHViefERyskIw8.mp4 — confirmed via
 * reference/mirror/home.html). The design-system card uses
 * LjAF6ttW1OyRFF8BptAITS4wDJ8.png.
 */
function OnboardingMedia() {
  return (
    <video
      className={styles.media}
      src="/videos/BVBw6HPmvDBjrHViefERyskIw8.mp4"
      muted
      loop
      playsInline
      preload="none"
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

const CARD_MEDIA: Record<string, () => ReactElement> = {
  onboarding: OnboardingMedia,
  'design-system': DesignSystemMedia,
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

      <SummVideos />

      <div className={styles.featured}>
        <p className={styles.featuredLabel}>Featured case studies</p>
        <div className={styles.featuredBanners}>
          <MobileWebTile />
          <VersionHistoryTile />
        </div>
      </div>

      <CaseStudiesAccordion id="summ-case-studies" label="Other case studies">
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
      </CaseStudiesAccordion>
    </section>
  );
}
