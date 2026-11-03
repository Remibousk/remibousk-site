/**
 * Timeline hero eras — single source of truth for scrubber stops, headlines,
 * logos, era cards, and settleable widgets (PR 3).
 *
 * Logos under /public/logos are traced recreations (not official marks) —
 * swap for brand assets when available.
 */

export type LogoId = 'vivant' | 'ibm' | 'siteminder' | 'summ';

export type LogoMark =
  | {
      id: LogoId;
      label: string;
      /** Image mark under /public/logos */
      src: string;
      width: number;
      height: number;
    }
  | {
      id: LogoId;
      label: string;
      /** Figtree 600 text placeholder until a real mark exists */
      wordmark: true;
    };

export type EraMedia =
  | {
      kind: 'image';
      src: string;
      alt: string;
    }
  | {
      kind: 'video';
      src: string;
      poster: string;
      alt: string;
      width: number;
      height: number;
    };

export type Era = {
  id: string;
  /** Full stop label on the scrubber (desktop). */
  yearLabel: string;
  /** Narrow-screen stop label; aria still uses the full year + company. */
  yearLabelShort: string;
  year: number;
  company: string;
  /** Which logo strip mark to highlight. */
  logoId: LogoId;
  headline: string;
  /**
   * When true, moving past this era settles its card into a corner widget.
   * Vivant / IBM leave nothing behind (no project on the site).
   */
  leavesWidget: boolean;
  card: {
    meta: string;
    title: string;
    oneLiner: string;
    media: EraMedia;
    href?: string;
  };
};

/** Side-project widgets that collect around the page (video media). */
export type SideWidget = {
  id: string;
  title: string;
  meta: string;
  oneLiner: string;
  href: string;
  media: Extract<EraMedia, { kind: 'video' }>;
  /** First era index at which this widget may settle (inclusive). */
  appearFromIndex: number;
};

export const DEFAULT_HEADLINE =
  'Remi is a product designer who loves building.';

export const LOGO_STRIP: LogoMark[] = [
  // TODO: replace Vivant wordmark with a real logo asset when available.
  {
    id: 'vivant',
    label: 'Vivant',
    wordmark: true,
  },
  {
    id: 'ibm',
    label: 'IBM',
    src: '/logos/ibm-logo.svg',
    width: 54,
    height: 20,
  },
  {
    id: 'siteminder',
    label: 'SiteMinder',
    src: '/logos/siteminder-mark.svg',
    width: 16,
    height: 21,
  },
  {
    id: 'summ',
    label: 'SUMM',
    src: '/logos/summ-logo.svg',
    width: 104,
    height: 19,
  },
];

export const ERAS: Era[] = [
  {
    id: 'vivant-2016',
    yearLabel: '2016',
    yearLabelShort: '’16',
    year: 2016,
    company: 'Vivant',
    logoId: 'vivant',
    leavesWidget: false,
    headline: 'Remi is a product designer at Vivant.',
    card: {
      // TODO: confirm whether Superb was done at Vivant (era inferred in Figma).
      meta: 'Vivant · 2016',
      title: 'Superb',
      oneLiner: 'AustralianSuper concept exploration.',
      media: {
        kind: 'image',
        src: '/images/eras/superb.jpg',
        alt: 'Superb concept UI with a green header and dashboard panels',
      },
    },
  },
  {
    id: 'ibm-2017',
    yearLabel: '2017',
    yearLabelShort: '’17',
    year: 2017,
    company: 'IBM',
    logoId: 'ibm',
    leavesWidget: false,
    headline: 'Remi is a senior product designer at IBM.',
    card: {
      // TODO: confirm the IBM project name and one-liner.
      meta: 'IBM · 2017–2019',
      title: 'Senior Product Designer',
      oneLiner: 'Banking dashboards',
      media: {
        kind: 'image',
        src: '/images/eras/ibm.jpg',
        alt: 'Two tablets showing banking-style dashboards over a night city skyline',
      },
    },
  },
  {
    id: 'siteminder-2019',
    yearLabel: '2019',
    yearLabelShort: '’19',
    year: 2019,
    company: 'SiteMinder',
    logoId: 'siteminder',
    leavesWidget: true,
    headline: 'Remi is a senior product designer at SiteMinder.',
    card: {
      meta: 'SiteMinder · 2019–2022',
      title: 'SiteMinder Pay',
      oneLiner: 'Payments inside the booking workflow.',
      media: {
        kind: 'image',
        src: '/images/eras/pay.jpg',
        alt: 'SiteMinder Pay overlay for charging a reservation',
      },
      href: '/siteminder-pay',
    },
  },
  {
    id: 'summ-2022',
    yearLabel: '2022',
    yearLabelShort: '’22',
    year: 2022,
    company: 'Summ',
    logoId: 'summ',
    leavesWidget: true,
    headline: 'Remi is the lead product designer at Summ.',
    card: {
      // TODO: confirm the Summ design system start year (placeholder 2022).
      meta: 'Summ · 2022–ongoing',
      title: 'Design system',
      oneLiner: 'Multi-theme, tokenised white-label system.',
      media: {
        kind: 'image',
        src: '/images/eras/design-system.jpg',
        alt: 'SUMM design system components including chips, buttons and steppers',
      },
      href: '/summ-design-system',
    },
  },
  {
    id: 'summ-2025',
    yearLabel: '2025',
    yearLabelShort: '’25',
    year: 2025,
    company: 'Summ',
    logoId: 'summ',
    leavesWidget: true,
    headline: 'Remi is shipping mobile web at Summ.',
    card: {
      // TODO: confirm whether Mobile web was Q1 2025 or Jun–Aug 2025.
      meta: 'Summ · 2025',
      title: 'Mobile web',
      oneLiner: '+50% paid conversion on the mobile journey.',
      media: {
        kind: 'image',
        src: '/images/eras/mobile-web.jpg',
        alt: 'Mobile web product screens for the SUMM portfolio experience',
      },
      href: '/mobileweb',
    },
  },
  {
    id: 'now-2026',
    yearLabel: 'Now',
    yearLabelShort: 'Now',
    year: 2026,
    company: 'Summ',
    logoId: 'summ',
    leavesWidget: true,
    headline: 'Remi is a product designer who loves building.',
    card: {
      meta: 'Summ · 2022–now',
      title: 'Version History',
      oneLiner: 'Understand changes and safely restore work.',
      media: {
        kind: 'image',
        src: '/images/eras/version-history.jpg',
        alt: 'Version History backups interface with saved restore points',
      },
      href: 'https://version-history.remibousk.com/',
    },
  },
];

/** RemOS / Symbol Morph settle as video widgets once you reach Summ eras. */
export const SIDE_WIDGETS: SideWidget[] = [
  {
    id: 'remos',
    title: 'RemOS',
    meta: 'Side project',
    oneLiner: 'A personal OS.',
    href: 'https://os.remibousk.com',
    appearFromIndex: 3, // Summ 2022+
    media: {
      kind: 'video',
      src: '/videos/remos.mp4',
      poster: '/images/remos-poster.jpg',
      alt: 'RemOS desktop interface looping demo',
      width: 1280,
      height: 774,
    },
  },
  {
    id: 'symbol-morph',
    title: 'Symbol Morph',
    meta: 'Side project',
    oneLiner: 'Shape and motion playground.',
    href: 'https://symbol-morph.vercel.app/',
    appearFromIndex: 4, // Summ 2025+
    media: {
      kind: 'video',
      src: '/videos/symbol-morph.mp4',
      poster: '/images/symbol-morph-poster.jpg',
      alt: 'Symbol Morph looping shape animation',
      width: 1280,
      height: 852,
    },
  },
];

/** Max settled widgets. Mobile shows none (stacked era card is enough). */
export const MAX_DESKTOP_WIDGETS = 4;
/** ≤1280: drop the crowded top-left slot — three widgets reads cleaner. */
export const MAX_COMPACT_WIDGETS = 3;
export const MAX_MOBILE_WIDGETS = 0;
