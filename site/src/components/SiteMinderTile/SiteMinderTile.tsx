'use client';

import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/Carousel/Carousel';
import CaseStudiesAccordion from '@/components/CaseStudiesAccordion/CaseStudiesAccordion';
import styles from './SiteMinderTile.module.css';

/**
 * The 6 unique product screenshots shown in the tile's carousel, in DOM
 * order. Filenames + data-framer-name labels come from
 * reference/mirror/home.html (data-framer-name: "BookingPerformance
 * SideBarOpen 2", "Occupancy report - 1360 - Graph 1", "RateParity
 * Default_SidebarExpanded 1", "Image 25", "Image 20", "CompRates Cal").
 * All six source files are 2560x1800 (aspect ~1.4222) — see manifest.csv.
 */
const SLIDES = [
  {
    src: '/images/FwGdL6erw7jGdwgS7aYfR0ijsH8.png',
    alt: 'SiteMinder booking performance dashboard showing revenue, room nights and reservations',
  },
  {
    src: '/images/tYgVAdTl8oCi4zYfxnx36om3j8.png',
    alt: 'SiteMinder occupancy report with a bar graph of booking data',
  },
  {
    src: '/images/VzTQTDNHXxzpY0NobeZxbIgfuc.png',
    alt: 'SiteMinder rate parity dashboard with the sidebar expanded',
  },
  {
    src: '/images/dv8FaJSmy5YZJxmH3wGfqPfuRVk.png',
    alt: 'SiteMinder product screenshot',
  },
  {
    src: '/images/q5faSm0h9cKJORzWrChQeQj0g.png',
    alt: 'SiteMinder product screenshot',
  },
  {
    src: '/images/8XjUMtcn8AsqioxSXFo4xS9e1Kc.png',
    alt: 'SiteMinder competitor rates calendar',
  },
];

/**
 * SiteMinder homepage tile: "SiteMinder / Senior product designer" heading
 * plus a bordered tile with a beach-photo background and a carousel of
 * product screenshots on top.
 *
 * The carousel is the original's Framer Slideshow with
 * `autoPlayControl: false` — it does NOT self-advance. It is paged by the
 * prev/next buttons (which sit *below* the frame: `arrowPosition
 * 'bottom-mid'`, `arrowPaddingBottom` -60 on desktop / -36 on phone,
 * `arrowSize` 40 / 30, `arrowRadius` 8, `arrowGap` 10, fill
 * rgba(0,0,0,0.2)) or by dragging, with `showProgressDots: false` and
 * `borderRadius: 10`.
 *
 * The original linked this whole block to /siteminder (a stub, dropped in
 * BUILD_SPEC). The carousel stays unlinkable so prev/next still work; a
 * case-study card below points at the new /siteminder-pay route.
 */
export default function SiteMinderTile() {
  return (
    <section className={styles.section} aria-label="SiteMinder — Senior product designer">
      <div className={styles.header}>
        <h2 className={styles.title}>SiteMinder</h2>
        <p className={styles.role}>Senior product designer</p>
      </div>

      <div className={styles.tile}>
        <Image
          src="/images/pEl1VC6AbN9dXY2KkeyEsp5ihQ.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1200px) 1200px, 100vw"
          className={styles.tileBg}
        />

        <Carousel
          className={styles.carousel}
          ariaLabel="SiteMinder product screenshots"
          gap={10}
          borderRadius={10}
          arrows
          arrowsClassName={styles.arrows}
          arrowClassName={styles.arrow}
          slides={SLIDES.map((slide) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              width={2560}
              height={1800}
              sizes="(min-width: 1200px) 1040px, (min-width: 810px) 90vw, 92vw"
              className={styles.slideImg}
            />
          ))}
        />
      </div>

      <CaseStudiesAccordion>
        <div className={styles.grid}>
          <Link href="/siteminder-pay" className={styles.card}>
            <div className={styles.mediaFrame}>
              <img
                className={styles.media}
                src="/images/siteminder-pay/process-payment.png"
                width={2878}
                height={2028}
                alt="SiteMinder Payments overlay for charging a reservation"
              />
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>SiteMinder Pay</h3>
              <h5 className={styles.cardSubtitle}>
                Making hotel payments part of the booking workflow.
              </h5>
            </div>
          </Link>
        </div>
      </CaseStudiesAccordion>
    </section>
  );
}
