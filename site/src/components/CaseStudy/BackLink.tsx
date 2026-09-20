'use client';

import { usePathname } from 'next/navigation';
import styles from './CaseStudy.module.css';

/**
 * "Go back" on case-study pages. SUMM cases return to the homepage
 * "Other case studies" accordion; SiteMinder Pay returns to its accordion.
 * Direct visits (no matching route) fall back to the homepage top.
 */
const BACK_HREF: Record<string, string> = {
  '/onboardingtoctc': '/#summ-case-studies',
  '/summ-design-system': '/#summ-case-studies',
  '/mobileweb': '/#summ-case-studies',
  '/siteminder-pay': '/#siteminder-case-studies',
};

function ChevronLeftIcon() {
  return (
    <svg
      className={styles.backIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export default function BackLink() {
  const pathname = usePathname();
  const href = BACK_HREF[pathname] ?? '/';

  return (
    <a href={href} className={styles.backLink}>
      <ChevronLeftIcon />
      <span>Go back</span>
    </a>
  );
}
