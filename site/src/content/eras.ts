/**
 * Timeline hero eras — single source of truth for scrubber stops, headlines,
 * logos, and era cards. Order is chronological (left → right on the pill).
 *
 * Logos under /public/logos are traced recreations (not official marks) —
 * swap for brand assets when available.
 */

export type LogoId = 'summ' | 'siteminder' | 'ibm';

export type Era = {
  id: string;
  /** Short stop label on the scrubber (tabular-nums). */
  yearLabel: string;
  year: number;
  company: string;
  /** Which logo strip mark to highlight; null = dim all (e.g. Vivant). */
  logoId: LogoId | null;
  headline: string;
  card: {
    meta: string;
    title: string;
    oneLiner: string;
    image: string;
    alt: string;
    href?: string;
  };
};

export const DEFAULT_HEADLINE =
  'Remi is a product designer who loves building.';

export const LOGO_STRIP: {
  id: LogoId;
  label: string;
  src: string;
  width: number;
  height: number;
}[] = [
  {
    id: 'summ',
    label: 'SUMM',
    src: '/logos/summ-logo.svg',
    width: 104,
    height: 19,
  },
  {
    id: 'siteminder',
    label: 'SiteMinder',
    src: '/logos/siteminder-mark.svg',
    width: 16,
    height: 21,
  },
  {
    id: 'ibm',
    label: 'IBM',
    src: '/logos/ibm-logo.svg',
    width: 54,
    height: 20,
  },
];

export const ERAS: Era[] = [
  {
    id: 'vivant-2016',
    yearLabel: '2016',
    year: 2016,
    company: 'Vivant',
    logoId: null,
    headline: 'Remi is a product designer at Vivant.',
    card: {
      // TODO: confirm whether Superb was done at Vivant (era inferred in Figma).
      meta: 'Vivant · 2016',
      title: 'Superb',
      oneLiner: 'AustralianSuper concept exploration.',
      image: '/images/eras/superb.jpg',
      alt: 'Superb concept UI with a green header and dashboard panels',
    },
  },
  {
    id: 'ibm-2017',
    yearLabel: '2017',
    year: 2017,
    company: 'IBM',
    logoId: 'ibm',
    headline: 'Remi is a senior product designer at IBM.',
    card: {
      // TODO: confirm the IBM project name and one-liner.
      meta: 'IBM · 2017 — 2019',
      title: 'Senior Product Designer',
      oneLiner: 'Banking dashboards',
      image: '/images/eras/ibm.jpg',
      alt: 'Two tablets showing banking-style dashboards over a night city skyline',
    },
  },
  {
    id: 'siteminder-2019',
    yearLabel: '2019',
    year: 2019,
    company: 'SiteMinder',
    logoId: 'siteminder',
    headline: 'Remi is a senior product designer at SiteMinder.',
    card: {
      meta: 'SiteMinder · 2019 — 2022',
      title: 'SiteMinder Pay',
      oneLiner: 'Payments inside the booking workflow.',
      image: '/images/eras/pay.jpg',
      alt: 'SiteMinder Pay overlay for charging a reservation',
      href: '/siteminder-pay',
    },
  },
  {
    id: 'summ-2022',
    yearLabel: '2022',
    year: 2022,
    company: 'Summ',
    logoId: 'summ',
    headline: 'Remi is the lead product designer at Summ.',
    card: {
      // TODO: confirm the Summ design system start year (placeholder 2022).
      meta: 'Summ · 2022 — ongoing',
      title: 'Design system',
      oneLiner: 'Multi-theme, tokenised white-label system.',
      image: '/images/eras/design-system.jpg',
      alt: 'SUMM design system components including chips, buttons and steppers',
      href: '/summ-design-system',
    },
  },
  {
    id: 'summ-2025',
    yearLabel: '2025',
    year: 2025,
    company: 'Summ',
    logoId: 'summ',
    headline: 'Remi is shipping mobile web at Summ.',
    card: {
      // TODO: confirm whether Mobile web was Q1 2025 or Jun–Aug 2025.
      meta: 'Summ · 2025',
      title: 'Mobile web',
      oneLiner: '+50% paid conversion on the mobile journey.',
      image: '/images/eras/mobile-web.jpg',
      alt: 'Mobile web product screens for the SUMM portfolio experience',
      href: '/mobileweb',
    },
  },
  {
    id: 'now-2026',
    yearLabel: 'Now',
    year: 2026,
    company: 'Summ',
    logoId: 'summ',
    headline: 'Remi is a product designer who loves building.',
    card: {
      meta: 'Summ · 2022 — now',
      title: 'Version History',
      oneLiner: 'Understand changes and safely restore work.',
      image: '/images/eras/version-history.jpg',
      alt: 'Version History backups interface with saved restore points',
      href: 'https://version-history.remibousk.com/',
    },
  },
];
