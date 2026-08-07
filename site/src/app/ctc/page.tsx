import CaseLayout from '@/components/CaseStudy/CaseLayout';
import CaseHero, { MetaGroup } from '@/components/CaseStudy/CaseHero';
import caseStyles from '@/components/CaseStudy/CaseStudy.module.css';
import styles from '@/components/CaseStudy/CtcPage.module.css';

/**
 * Heroicons arrow-up-right (20 solid), exact path from the mirror's
 * svg-templates block (#svg-1637351227_343). 14x14 next to "View live".
 */
function ArrowUpRightIcon() {
  return (
    <svg
      className={caseStyles.viewLiveIcon}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * /ctc — Crypto Tax Calculator marketing website case study.
 *
 * Deliberate fixes applied (BUILD_SPEC):
 *  #2 fluid width, no horizontal overflow >= 320px (original locks ~795px
 *     at <= 1199px); desktop >= 1200px appearance unchanged.
 *  #3 "View live" links to https://cryptotaxcalculator.io (no href on the
 *     original).
 */
export default function CtcPage() {
  return (
    <CaseLayout variant="ctc">
      <CaseHero
        client="Crypto Tax Calculator"
        title="Marketing website"
        tags={['Web design', 'Visual design', 'Copywriting', 'UX', 'Mobile']}
        tightLeft
        left={
          <>
            <MetaGroup label="Role:">Lead Designer and PM</MetaGroup>
            <MetaGroup label="When:">Q4 2023</MetaGroup>
            <a
              className={caseStyles.viewLive}
              href="https://cryptotaxcalculator.io"
              target="_blank"
              rel="noopener"
            >
              <span>View live</span>
              <ArrowUpRightIcon />
            </a>
          </>
        }
        right={
          <MetaGroup label="Overview:" wide>
            <>
              <p className={caseStyles.metaValue}>
                Following a strategic shift in our target market toward crypto
                native &quot;degens&quot; and in the lead up to US tax season we
                wanted to: align our marketing site more with this target,
                increase the aesthetic polish and improve the sites conversion
                rate.
              </p>
              <p className={caseStyles.metaValue}>
                I lead the end to end design from concepting through to
                research, high fidelity designs and subsequent implementation
                with our front end devs
              </p>
            </>
          </MetaGroup>
        }
      />

      {/* Landing page — desktop + mobile screenshots bleeding off the panel */}
      <section
        className={`${styles.panel} ${styles.panelLp}`}
        aria-label="New landing page designs"
      >
        <figure className={styles.lpDesktop}>
          <img
            src="/images/PV4kzOU95mbRSuqVB4MuWzu68MA.png"
            alt="Crypto Tax Calculator marketing site landing page on desktop"
            width={1390}
            height={2029}
          />
        </figure>
        <figure className={styles.lpMobile}>
          <img
            src="/images/58D7zgzrAXx01u9mZB23sYWdFE.png"
            alt="Crypto Tax Calculator marketing site landing page on mobile"
            width={967}
            height={2406}
            loading="lazy"
          />
        </figure>
      </section>

      {/* NFT support promo video + Learn hub / compliance images */}
      <section className={styles.panelRow} aria-label="Education and compliance sections">
        <div className={styles.videoPanel}>
          <figure className={styles.videoFill}>
            <video
              src="/videos/PryCemOtMCpHXlD5dXMjxN8Aa4.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Animation of the tailored NFT support section on the marketing site"
            />
          </figure>
        </div>
        <div className={styles.duoPanel}>
          <figure className={styles.eduImage}>
            <img
              src="/images/YbyLkR6pNuOAfqjm92oYGyxerlc.png"
              alt="Learn hub section with NFT, US and DeFi tax guides"
              width={2396}
              height={1132}
              loading="lazy"
            />
          </figure>
          <figure className={styles.complianceImage}>
            <img
              src="/images/rslKgDcY46CEKwKwl6QGArAdbNY.png"
              alt="Confidently compliant and safe and secure trust badges"
              width={2424}
              height={320}
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      {/* Bento feature grid */}
      <section
        className={`${styles.panel} ${styles.panelBento}`}
        aria-label="Product feature bento grid"
      >
        <figure className={styles.bentoImage}>
          <img
            src="/images/FfUq9pfAjywBtWyjdTX75EX9xzM.png"
            alt="Image of features in crypto tax calculator"
            width={2668}
            height={2432}
            loading="lazy"
          />
        </figure>
      </section>

      {/* Business page walkthrough gif */}
      <section
        className={`${styles.panel} ${styles.panelGif}`}
        aria-label="Business landing page walkthrough"
      >
        <figure className={styles.gifImage}>
          <img
            src="/images/ozdX8TEBYY6SpLV4AedCWhf9c.gif"
            alt="Animated walkthrough of the crypto accounting business page"
            width={1200}
            height={829}
            loading="lazy"
          />
        </figure>
      </section>
    </CaseLayout>
  );
}
