import CaseLayout from '@/components/CaseStudy/CaseLayout';
import CaseHero, { MetaGroup } from '@/components/CaseStudy/CaseHero';
import CaseCta from '@/components/CaseStudy/CaseCta';
import Reveal from '@/components/CaseStudy/Reveal';
import ResultMedia from '@/components/CaseStudy/ResultMedia';
import s from '@/components/CaseStudy/CaseStudy.module.css';
import p from '@/components/CaseStudy/MobilewebPage.module.css';

/**
 * /mobileweb — Crypto Tax Calculator mobile experience uplift case study.
 * Structure/markup measured from reference/mirror/mobileweb.html; copy is
 * verbatim from content/mobileweb.md (typos like "covrsion" intentional).
 */
export default function MobileWebPage() {
  return (
    <CaseLayout>
      <CaseHero
        client="Crypto Tax Calculator"
        title="Uplifting the mobile experience"
        tags={[
          'Mobile',
          'Web design',
          'Visual design',
          'Copywriting',
          'UX',
          'A/B testing',
        ]}
        left={
          <>
            <MetaGroup label="Role:">Lead Designer</MetaGroup>
            <MetaGroup label="When:">Q1 2025</MetaGroup>
          </>
        }
        right={
          <>
            <MetaGroup label="What:" wide>
              Optimising the end-to-end mobile journey for conversion.
            </MetaGroup>
            <MetaGroup label="Outcome" wide>
              <p className={s.metaValue}>
                Achieved a <strong>+50.76% CVR lift</strong> in mobile
                onboarding and a <strong>28.04% increase</strong> in reports
                page conversion
              </p>
            </MetaGroup>
          </>
        }
      />

      {/* Phone screenshot + 01 Problem / 02 Audit */}
      <section className={p.introRow}>
        <figure className={p.phoneCard}>
          <img
            src="/images/7m9E61Ujtnd0WvoTmtuvFLk8s0.png"
            alt="Uplifted mobile reports page showing total capital gains and tax reports"
            width={954}
            height={2073}
          />
        </figure>
        <div className={p.introText}>
          <div className={s.textGroup}>
            <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
              01 - Problem
            </h3>
            <h5 className={`${s.body} ${s.textBlock}`}>
              Following a strategic partnership with Coinbase, we saw a
              massive influx of new users, with <strong>
                60% of referrals
              </strong>{' '}
              arriving via mobile. However, our mobile experience wasn&#39;t
              optimized for this scale. An underwhelming UX led to significant
              friction and high churn rates at critical stages of the
              onboarding funnel.
            </h5>
          </div>
          <div className={s.textGroup}>
            <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
              02 - The Audit: &quot;It Wasn&#39;t Pretty&quot;
            </h3>
            <div className={`${s.textBlock} ${s.bodyStack}`}>
              <h5 className={s.body}>
                Before diving into solutions, I conducted a full UX audit that
                identified several critical friction points:
              </h5>
              <h5 className={s.body}>
                <strong>Janky and laggy experience</strong>
                <br />
                Users faced 1-2 second delays on taps, making the interface
                feel non-robust.
              </h5>
              <h5 className={s.body}>
                <strong>Information overload:</strong>
                <br />
                Pages were cluttered with &quot;too much content&quot; and
                unnecessary warnings that overwhelmed users.
              </h5>
              <h5 className={s.body}>
                <strong>Poor mobile patterns</strong>
                <br />
                Heavy reliance on horizontal scrolling and cluttered filter
                sections that &quot;suck on mobile&quot;.
              </h5>
              <h5 className={s.body}>
                <strong>Hidden primary actions:</strong>
                <br />
                Critical buttons were not prominent enough, and layout
                hierarchy was unclear, especially on the Reports page
              </h5>
            </div>
          </div>
        </div>
      </section>

      {/* 03 - Design principles */}
      <section className={s.sectionWide}>
        <div className={s.textGroup}>
          <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
            03 - Design principles
          </h3>
          <h5 className={`${s.body} ${s.textBlock}`}>
            To guide the uplift, I established three core principles focused
            on mobile-first comprehension:
          </h5>
        </div>
        <div className={s.grid3}>
          <Reveal className={s.card}>
            <ol className={`${s.cardTitleList} ${s.cardText}`}>
              <li>Progressive disclosure</li>
            </ol>
            <h5 className={`${s.body} ${s.cardText}`}>
              End to end usability testing on the existing experience to
              establish a benchmark and discover the &#39;why&#39; behind key
              drop of points
            </h5>
          </Reveal>
          <Reveal className={s.card}>
            <ol
              className={`${s.cardTitleList} ${s.cardText}`}
              start={2}
              style={{ counterReset: 'list-item 1' }}
            >
              <li>Optimise for scannability</li>
            </ol>
            <h5 className={`${s.body} ${s.cardText}`}>
              Prioritizing the most useful information to improve user
              comprehension at a glance
            </h5>
          </Reveal>
          <Reveal className={s.card}>
            <ol
              className={`${s.cardTitleList} ${s.cardText}`}
              start={3}
              style={{ counterReset: 'list-item 2' }}
            >
              <li>Mobile familiarity</li>
            </ol>
            <h5 className={`${s.body} ${s.cardText}`}>
              <strong>Mobile Familiarity:</strong> Utilizing common mobile
              patterns, such as the{' '}
              <strong>iOS-style &quot;sheet&quot; component</strong>, to
              reduce cognitive load.
            </h5>
          </Reveal>
        </div>
      </section>

      {/* Screenshot strip */}
      <section className={p.mediaStrip} aria-label="Uplifted mobile screens">
        <figure className={p.mediaCol}>
          <img
            src="/images/OV6hh3a2GbKHYB5AtYeoTSkGI.png"
            alt="Import Binance screen with API sync instructions"
            width={804}
            height={1662}
            loading="lazy"
          />
          <h6 className={p.caption}>Connecting Binance by API</h6>
        </figure>
        <figure className={p.mediaCol}>
          <img
            src="/images/vfyc7E91Cpb6nRADNgUBvm6ws.png"
            alt="Mobile transactions table grouped by day"
            width={804}
            height={1662}
            loading="lazy"
          />
          <h6 className={p.caption}>Transaction table</h6>
        </figure>
        <figure className={p.mediaCol}>
          <img
            src="/images/iQzZz1yqwqxim3SDXND9QFzPr0.png"
            alt="Transaction details sheet with trade breakdown"
            width={804}
            height={1662}
            loading="lazy"
          />
          <h6 className={p.caption}>Transaction breakdown</h6>
        </figure>
      </section>

      {/* Screen recording strip */}
      <section
        className={`${p.mediaStrip} ${p.mediaStripVideos}`}
        aria-label="Mobile flow screen recordings"
      >
        <figure className={p.mediaCol}>
          <div className={p.mediaVideo}>
            <video
              src="/videos/Wk3YEINpjKHIncfdO8kZPOZWxY.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Screen recording: landing on portfolio post onboarding"
            />
          </div>
          <h6 className={p.caption}>Landing on portfolio post onboarding</h6>
        </figure>
        <figure className={p.mediaCol}>
          <div className={p.mediaVideo}>
            <video
              src="/videos/mUreafFX0lfKLeNugAygqz9sNpo.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Screen recording: viewing transactions on mobile"
            />
          </div>
          <h6 className={p.caption}>Viewing transactions</h6>
        </figure>
        <figure className={p.mediaCol}>
          <div className={p.mediaVideo}>
            <video
              src="/videos/0vBQbh3mMA9YV0HZygJnLkiBU.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Screen recording: browsing the plans page"
            />
          </div>
          <h6 className={p.caption}>Browsing the plans page</h6>
        </figure>
      </section>

      {/* 03 - Impact */}
      <section className={s.sectionWide}>
        <div className={s.textGroup}>
          <h3 className={`${s.sectionHeading} ${s.textBlock}`}>03 - Impact</h3>
          <h5 className={`${s.body} ${s.textBlock}`}>
            The optimisations led to significant, measurable growth across the
            entire product funnel.
          </h5>
        </div>
        <div className={s.grid2}>
          <Reveal className={p.impactCard}>
            <h4 className={s.cardTitle}>Onboarding</h4>
            <h5 className={s.body}>+50.76% Increase in conversion rate</h5>
            {/* Both the "View results" button and the thumbnail itself open
                this lightbox in the original (image ids 148nign / cptmxa). */}
            <ResultMedia
              src="/images/vIl9U6342xvxqn4Wo6CswH3Xgfc.png"
              alt="Mobile onboarding A/B test results dashboard"
              width={2872}
              height={2162}
              thumbnailOpens
              lightbox={{
                src: '/images/vCNjyBxQjqhG6YZxs145IMbUc.png',
                alt: 'Full A/B test results for the mobile onboarding experiment',
                width: 2872,
                height: 2247,
              }}
            />
          </Reveal>
          <Reveal className={p.impactCard}>
            <h4 className={s.cardTitle}>Reports page</h4>
            <h5 className={s.body}>+28.04% increase in covrsion rate</h5>
            {/* Only the "View results" button opens this one (id 1a7w3m4);
                the thumbnail has no onTap in the original. */}
            <ResultMedia
              src="/images/CkY8W2cjQo9jtezh18OMBtDYs.png"
              alt="Mobile reports page uplift A/B test results dashboard"
              width={2524}
              height={1900}
              lightbox={{
                src: '/images/s4VCeqGVbh6zM0BtQpFQWNESMx0.png',
                alt: 'Full A/B test results for the mobile reports page experiment',
                width: 2524,
                height: 4338,
                scroll: true,
              }}
            />
          </Reveal>
        </div>
      </section>

      <CaseCta />
    </CaseLayout>
  );
}
