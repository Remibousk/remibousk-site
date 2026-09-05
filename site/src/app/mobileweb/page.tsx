import Link from 'next/link';
import CaseLayout from '@/components/CaseStudy/CaseLayout';
import CaseHero, { MetaGroup } from '@/components/CaseStudy/CaseHero';
import CaseCta from '@/components/CaseStudy/CaseCta';
import s from '@/components/CaseStudy/CaseStudy.module.css';
import p from '@/components/CaseStudy/MobilewebPage.module.css';

const IMG = '/images/mobileweb';

function Phone({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  return (
    <figure className={p.phoneShot}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
      />
      {caption ? <h6 className={p.caption}>{caption}</h6> : null}
    </figure>
  );
}

/**
 * /mobileweb — SUMM / Crypto Tax Calculator mobile reports case study.
 * Copy from content/mobileweb.md. Layout follows the SiteMinder Pay craft:
 * a reading column, annotated frames, and one defended experiment.
 */
export default function MobileWebPage() {
  return (
    <CaseLayout variant="tight">
      <CaseHero
        client="Crypto Tax Calculator"
        title="Show the tax number first"
        tags={['Mobile UX', 'Information hierarchy', 'Experimentation']}
        tagsWrap
        stackMetaOnPhone
        left={
          <>
            <MetaGroup label="Role:">Lead Product Designer</MetaGroup>
            <MetaGroup label="When:">Q1 2025</MetaGroup>
          </>
        }
        right={
          <>
            <MetaGroup label="What:" wide>
              Rebuild reports for mobile, then apply the same pattern to
              transactions and filters
            </MetaGroup>
            <MetaGroup label="Outcome" wide>
              <p className={s.metaValue}>
                Reports page, <strong>16.27% → 20.84%</strong> plan
                conversion. n=2,090. 99.67% probability of being best.
              </p>
            </MetaGroup>
          </>
        }
      />

      <section className={p.heroShot} aria-label="Reports before and after">
        <figure className={p.shot}>
          <img
            src={`${IMG}/reports-before-after.jpg`}
            alt="Reports page before and after. Before: a plan-selection banner above the fold with key figures locked. After: total capital gains stated immediately, with a savings opportunity row underneath."
            width={1880}
            height={1800}
          />
        </figure>
        <h6 className={p.caption}>
          Before: a plan banner owns the fold and the tax number is locked.
          After: total capital gains first, then an explained savings row.
        </h6>
      </section>

      <section className={s.sectionWide}>
        <div className={p.lede}>
          <h3 className={s.sectionHeading}>The job</h3>
          <h5 className={s.body}>
            Coinbase sent a large influx of new users to a product that had
            been designed on desktop. About <strong>60%</strong> of those
            referrals arrived on a phone. The layouts had been squeezed, not
            redesigned. Friction concentrated where it converted: reports,
            then transactions and filters.
          </h5>
          <h5 className={s.body}>
            The most important number on the product — total capital gains —
            was often paywalled behind a blur, or sitting below a
            plan-selection banner that owned the fold.
          </h5>
        </div>
      </section>

      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>Audit</h3>
          <h5 className={s.body}>
            A mobile UX audit before the rebuild. Recurring problems, and
            what they implied:
          </h5>
        </div>
        <div className={`${s.card} ${p.copy}`}>
          <div className={`${s.body} ${s.bodyStack}`}>
            <p>
              <strong>Slow interaction.</strong> Taps could take one to two
              seconds. That is an engineering problem. I flagged it so we
              were not decorating a sluggish UI.
            </p>
            <p>
              <strong>Information overload.</strong> Too much content and too
              many warnings on a single screen. The screen had not decided
              what it was for.
            </p>
            <p>
              <strong>Desktop patterns on a phone.</strong> Horizontal
              scrolling, cramped tables, cluttered filter chrome.
            </p>
            <p>
              <strong>Hidden primary.</strong> Hierarchy was unclear,
              especially on reports: the plan banner was the first action,
              the tax number was not.
            </p>
          </div>
        </div>
      </section>

      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>The call</h3>
          <h5 className={s.body}>
            Desktop density is not a layout problem. It is a &ldquo;what is
            this screen for&rdquo; problem. Reports is for &ldquo;what is my
            tax position, and what should I do about it.&rdquo;
          </h5>
          <h5 className={s.body}>
            The commercial call: show the real number, then show what
            connecting more accounts could save. Useful for the customer, and
            a stronger reason to finish importing data or buy a plan. Those
            two things pointing the same direction is rare enough to take
            when it happens.
          </h5>
          <h5 className={s.body}>
            This was a judgment call, shipped behind a feature flag — not a
            three-variant test of number-first versus savings-first.
          </h5>
        </div>

        <div className={p.pair}>
          <div className={p.copy}>
            <p className={p.kicker}>Scannability</p>
            <h4 className={s.cardTitle}>Two states, one hierarchy</h4>
            <h5 className={s.body}>
              <strong>Unlocked.</strong> Total capital gains first. Savings
              as an explained, tappable row directly underneath. The full
              breakdown visible without a tap. That is the after state
              above.
            </h5>
            <h5 className={s.body}>
              <strong>Free.</strong> The headline figure can stay locked.
              The plan banner does not get the fold. The savings opportunity
              stays visible and explained. The plan CTA sits at the bottom.
            </h5>
          </div>
          <Phone
            src={`${IMG}/reports-free.jpg`}
            alt="Free-user reports summary with the headline capital gains locked, an explained savings opportunity of $14,698.56, and a Select a plan button at the bottom"
            width={804}
            height={1662}
            caption="Free users: number locked, savings visible, plan CTA at the bottom."
          />
        </div>
      </section>

      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>The proof</h3>
          <h5 className={s.body}>
            I designed the variant. It shipped behind a feature flag and was
            read with a Bayesian stats engine.
          </h5>
          <h5 className={s.body}>
            The primary metric was viewed reports → purchased a plan.
            Control converted at <strong>16.27%</strong>. The redesign
            converted at <strong>20.84%</strong> — a{' '}
            <strong>28.04%</strong> relative lift. 2,090 people in the
            experiment. 99.67% probability of being best. The 95% credible
            interval sat between +13.46% and +43.96%, all on the same side
            of zero.
          </h5>
          <h5 className={s.body}>
            A separate mobile onboarding-imports test ran in the same
            period. That result lives on the{' '}
            <Link href="/onboardingtoctc" className={p.inlineLink}>
              onboarding case study
            </Link>
            . It is not this project&apos;s headline.
          </h5>
        </div>
        <div className={p.heroShot}>
          <figure className={p.shot}>
            <img
              src={`${IMG}/experiment-reports.jpg`}
              alt="PostHog experiment Mobile Reports Page Uplift: complete, significant, 99.67% probability of being best. Control 16.27%, reports-page-uplift 20.84%, plus 28.04%."
              width={1700}
              height={1285}
              loading="lazy"
            />
          </figure>
          <h6 className={p.caption}>
            Mobile Reports Page Uplift. Bayesian, n=2,090, significant.
          </h6>
        </div>
        <p className={p.note}>
          Company growth over the broader period is context, not a design
          claim. This page owns the reports experiment.
        </p>
      </section>

      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>The same pattern</h3>
          <h5 className={s.body}>
            The reports call was the prototype for the rest of the phone:
            decide what the screen is for, put that first, hide the rest
            until it is useful, prefer patterns people already know.
          </h5>
        </div>

        <div className={p.frame}>
          <div className={p.frameCopy}>
            <p className={p.kicker}>Mobile familiarity</p>
            <h4 className={s.cardTitle}>Transactions</h4>
            <h5 className={s.body}>
              People checking history need three things: what happened,
              which assets moved, and what it was worth in local currency.
              The old table was a desktop grid compressed until a truncated
              hash was the most visible thing on the row. Date-grouped cards
              lead with type, assets, and local value. None of those is a
              hash.
            </h5>
          </div>
          <figure className={p.shot}>
            <img
              src={`${IMG}/transactions-before-after.jpg`}
              alt="Transactions table before and after. Before: a cramped list with truncated hashes. After: date-grouped cards showing trade type, assets, and local currency value."
              width={2220}
              height={1258}
              loading="lazy"
            />
          </figure>
        </div>

        <div className={p.frame}>
          <div className={p.frameCopy}>
            <p className={p.kicker}>Progressive disclosure</p>
            <h4 className={s.cardTitle}>Filters</h4>
            <h5 className={s.body}>
              Filters were a desktop control strip: pagination, view
              toggles, chips, all competing with the first transaction.
              After, search and a few icon buttons stay in the chrome; the
              rest lives in a sheet. Progressive disclosure, and a pattern
              people already know how to close.
            </h5>
          </div>
          <figure className={p.shot}>
            <img
              src={`${IMG}/filters-before-after.jpg`}
              alt="Filters before and after. Before: pagination, chips, and view controls stacked above the list. After: search and icon buttons, with filters moved into a sheet."
              width={2220}
              height={1258}
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>Around the loop</h3>
          <h5 className={s.body}>
            The same scannability rule on the rest of the loop: viewing
            history, landing on portfolio after onboarding, connecting an
            exchange as a job rather than a settings form.
          </h5>
        </div>
        <div className={p.phones}>
          <figure className={p.phoneShot}>
            <video
              src="/videos/mUreafFX0lfKLeNugAygqz9sNpo.mp4"
              width={496}
              height={1080}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Screen recording: viewing transactions on mobile"
            />
            <h6 className={p.caption}>Viewing transactions</h6>
          </figure>
          <figure className={p.phoneShot}>
            <video
              src="/videos/Wk3YEINpjKHIncfdO8kZPOZWxY.mp4"
              width={496}
              height={1080}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Screen recording: landing on portfolio after onboarding"
            />
            <h6 className={p.caption}>
              Landing on portfolio after onboarding
            </h6>
          </figure>
          <Phone
            src="/images/OV6hh3a2GbKHYB5AtYeoTSkGI.png"
            alt="Import Binance screen with API key, secret, and step-by-step sync instructions"
            width={804}
            height={1662}
            caption="Connecting Binance by API"
          />
        </div>
      </section>

      <CaseCta />
    </CaseLayout>
  );
}
