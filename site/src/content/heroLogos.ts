/**
 * Homepage logo-hover hero — logos, captions, and hero clip paths.
 * Vivant wordmark is a Figtree 600 placeholder until a brand mark exists.
 */

export type HeroLogoId = 'vivant' | 'ibm' | 'siteminder' | 'summ';

export type HeroLogo =
  | {
      id: HeroLogoId;
      label: string;
      wordmark: true;
      caption: string;
      video: string;
      poster: string;
      /** Intrinsic video size for aspect-ratio (width / height). */
      width: number;
      height: number;
    }
  | {
      id: HeroLogoId;
      label: string;
      src: string;
      logoWidth: number;
      logoHeight: number;
      caption: string;
      video: string;
      poster: string;
      width: number;
      height: number;
      /** SiteMinder mark + word. */
      wordAlongside?: string;
    };

export const HERO_HEADLINE =
  'Remi is a product designer who loves building.';

export const HERO_LOGOS: HeroLogo[] = [
  // TODO: replace Vivant wordmark with a real logo asset when available.
  {
    id: 'vivant',
    label: 'Vivant',
    wordmark: true,
    caption: 'Vivant · Superb',
    video: '/videos/hero/vivant.mp4',
    poster: '/videos/hero/posters/vivant.jpg',
    width: 880,
    height: 674,
  },
  {
    id: 'ibm',
    label: 'IBM',
    src: '/logos/ibm-logo.svg',
    logoWidth: 54,
    logoHeight: 20,
    caption: 'IBM · Banking dashboards',
    video: '/videos/hero/ibm.mp4',
    poster: '/videos/hero/posters/ibm.jpg',
    width: 880,
    height: 500,
  },
  {
    id: 'siteminder',
    label: 'SiteMinder',
    src: '/logos/siteminder-mark.svg',
    logoWidth: 16,
    logoHeight: 21,
    wordAlongside: 'SiteMinder',
    caption: 'SiteMinder · Payments & campaigns',
    video: '/videos/hero/siteminder.mp4',
    poster: '/videos/hero/posters/siteminder.jpg',
    width: 880,
    height: 496,
  },
  {
    id: 'summ',
    label: 'SUMM',
    src: '/logos/summ-logo.svg',
    logoWidth: 104,
    logoHeight: 19,
    caption: 'Summ · Mobile app',
    video: '/videos/hero/summ.mp4',
    poster: '/videos/hero/posters/summ.jpg',
    width: 880,
    height: 660,
  },
];
