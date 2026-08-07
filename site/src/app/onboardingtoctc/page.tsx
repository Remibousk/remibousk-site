import CaseLayout from '@/components/CaseStudy/CaseLayout';
import CaseHero, { MetaGroup } from '@/components/CaseStudy/CaseHero';
import CaseCta from '@/components/CaseStudy/CaseCta';
import Reveal from '@/components/CaseStudy/Reveal';
import s from '@/components/CaseStudy/CaseStudy.module.css';
import p from '@/components/CaseStudy/OnboardingPage.module.css';

/**
 * /onboardingtoctc — Crypto Tax Calculator onboarding redesign case study.
 * Section structure, text markup (numbered lists with `start`, strong/em
 * runs, <br/><br/> paragraph breaks) and card appear animations are copied
 * from reference/mirror/onboardingtoctc.html; copy is verbatim from
 * content/onboardingtoctc.md (typos intentional).
 */
export default function OnboardingToCtcPage() {
  return (
    <CaseLayout>
      <CaseHero
        client="Crypto Tax Calculator"
        title="Onboarding"
        tags={['Web design', 'Visual design', 'Copywriting', 'UX', 'Mobile']}
        left={
          <>
            <MetaGroup label="Role:">Lead Designer</MetaGroup>
            <MetaGroup label="When:">Q4 2023</MetaGroup>
          </>
        }
        right={
          <>
            <MetaGroup label="What:" wide>
              Onboarding re-design
            </MetaGroup>
            <MetaGroup label="Outcome" wide>
              Lift in paid plan conversion rate from 16% to 24%
            </MetaGroup>
          </>
        }
      />

      {/* 01 - Problem */}
      <section className={s.textGroup}>
        <h3 className={`${s.sectionHeading} ${s.textBlock}`}>01 - Problem</h3>
        <h5 className={`${s.body} ${s.textBlock}`}>
          Through research and analytics we uncovered two critical problems
          blocking new user adoption.
        </h5>
        <ol className={`${s.bodyList} ${s.textBlock}`}>
          <li>
            A significant portion of new customers held false assumptions, for
            example, believing that tax was only due when converting to fiat,
            or that their trades were &#39;invisible&#39; to tax authorities.
          </li>
        </ol>
        <ol
          className={`${s.bodyList} ${s.textBlock}`}
          start={2}
          style={{ counterReset: 'list-item 1' }}
        >
          <li>
            High drop-off rate for new users. We saw they would sign up, land
            on the main platform, click around on all the pages, and then
            leave. They weren&#39;t being shown the value.
          </li>
        </ol>
      </section>

      {/* 02 - Business impact */}
      <section className={s.textGroup}>
        <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
          02 - Business impact
        </h3>
        <div className={p.stack20}>
          <h5 className={`${s.body} ${s.textBlock}`}>
            This knowledge gap created a direct barrier to adoption. Users who
            misunderstood the complexity or necessity of crypto taxes failed
            to see the value in our product, leading to low conversion rates
            and high drop-offs.
          </h5>
          <blockquote className={s.textBlock}>
            <h5 className={s.quote}>
              &quot;Why pay for software to calculate my crypto taxes if I can
              just do it easily myself&quot;
            </h5>
          </blockquote>
        </div>
      </section>

      {/* 03 - Our hypothesis */}
      <section className={s.textGroup}>
        <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
          03 - Our hypothesis
        </h3>
        <div className={p.stack20}>
          <h5 className={`${s.body} ${s.textBlock}`}>
            We believed that by educating new users AND then immedietly show
            them value, then they would grasp the core value of the product
            and convert at a higher rate.
          </h5>
        </div>
      </section>

      {/* 04 - Project approach */}
      <section className={s.sectionWide}>
        <div className={p.approachHeader}>
          <h3 className={s.sectionHeading}>04 - Project approach</h3>
          <h5 className={s.body}>A phased and iterative process</h5>
        </div>
        <div className={s.grid3}>
          <Reveal className={s.card}>
            <ol className={`${s.cardTitleList} ${s.cardText}`}>
              <li>Establishing a baseline</li>
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
              <li>Iterative design and testing</li>
            </ol>
            <h5 className={`${s.body} ${s.cardText}`}>
              Over 3 rounds of interviews we redesigned the onboarding flow,
              progressively increasing fidelity. Measuring user reactions and
              learning what wording and formats were most effective at
              building understanding.
            </h5>
          </Reveal>
          <Reveal className={s.card}>
            <ol
              className={`${s.cardTitleList} ${s.cardText}`}
              start={3}
              style={{ counterReset: 'list-item 2' }}
            >
              <li>Live mult-variant testing</li>
            </ol>
            <h5 className={`${s.body} ${s.cardText}`}>
              User interviews can only take you so far. To really evaluate the
              effectiveness of this redesign we conducted live multi-variant
              testing to measure <em>actual behaviour</em> and gather
              quantitative data
            </h5>
          </Reveal>
        </div>
      </section>

      {/* 05 - UX Principles */}
      <section className={s.sectionCenter}>
        <div className={p.approachHeader}>
          <h3 className={s.sectionHeading}>05 - UX Principles</h3>
        </div>
        <Reveal className={`${s.card} ${p.principleCard}`}>
          <ol className={`${s.cardTitleList} ${s.cardText}`}>
            <li>Visibility of system state</li>
          </ol>
          <h5 className={`${s.body} ${s.cardText}`}>
            Insight: Users consistently underestimated the steps needed for an
            accurate tax report. This &quot;black box&quot; process meant they
            had unrealistic expectations, leading to frustration and drop-offs
          </h5>
        </Reveal>
        <figure className={p.stepperVideo}>
          <video
            src="/videos/qwsE1ZHEvaegJ4ashQvtIQT5jc.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Animated onboarding progress stepper: Personalise, Import data, Review transactions, Get tax report"
          />
        </figure>
      </section>

      <section className={s.sectionCenter}>
        <Reveal className={`${s.card} ${p.principleCard}`}>
          <ol
            className={`${s.cardTitleList} ${s.cardText}`}
            start={2}
            style={{ counterReset: 'list-item 1' }}
          >
            <li>Progressive disclosure </li>
          </ol>
          <h5 className={`${s.body} ${s.cardText}`}>
            There&#39;s a wide range of crypto activity. A user who only{' '}
            <em>buys</em> crypto has different needs and understanding than
            someone who <em>trades NFTs</em> or <em>uses DeFi</em>.
            <br />
            <br />
            To avoid overwhelming users, we built <strong>
              conditional logic
            </strong>{' '}
            into the onboarding. This created a personalised path that
            progressively disclosed <strong>only the right education</strong>{' '}
            based on that user&#39;s specific activity, ensuring the
            information was always relevant and never a blocker.
          </h5>
        </Reveal>
        <div className={s.grid2ScreensPair}>
          <figure className={p.shotImage}>
            <img
              src="/images/9myu8FUikBmmHuQwrU1ZVQyY1Q.png"
              alt="Onboarding question: what types of platforms have you traded on?"
              width={1756}
              height={1196}
              loading="lazy"
            />
          </figure>
          <figure className={p.shotImage}>
            <img
              src="/images/mTZhgaVjuNd8ezAY0Zp3pHrR66g.png"
              alt="Onboarding question: what types of trading activity have you done?"
              width={1772}
              height={1196}
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      <section className={s.sectionCenterTight}>
        <Reveal className={`${s.card} ${p.principleCard}`}>
          <ol
            className={`${s.cardTitleList} ${s.cardText}`}
            start={3}
            style={{ counterReset: 'list-item 2' }}
          >
            <li>Education</li>
          </ol>
          <h5 className={`${s.body} ${s.cardText}`}>
            We distilled the highest impact knowledge gaps into key screens
            that educated users crypto taxes while introducing key terms
            they&#39;ll encounter through the product.
          </h5>
        </Reveal>
        <figure className={p.wideImage}>
          <img
            src="/images/up6WN5M3RV8jpIELd3s6buwNss.png"
            alt="Educational onboarding screen: crypto to crypto trades are taxable"
            width={1756}
            height={1196}
            loading="lazy"
          />
        </figure>
      </section>

      <section className={s.sectionCenter}>
        <Reveal className={`${s.card} ${p.principleCard}`}>
          <ol
            className={`${s.cardTitleList} ${s.cardText}`}
            start={4}
            style={{ counterReset: 'list-item 3' }}
          >
            <li>The &quot;Aha&quot; moment</li>
          </ol>
          <h5 className={`${s.body} ${s.cardText}`}>
            Insight: Letting users into the platform without connecting at
            least 1 exchange or wallet caused high cognitive load and no clear
            path to the &quot;Aha&quot; moment.
            <br />
            <br />
            We hypothesised that the first &quot;Aha!&quot; moment was seeing{' '}
            <em>their own data</em> in the app. So we gated the platform
          </h5>
        </Reveal>
        <figure className={p.ahaVideo}>
          <video
            src="/videos/NSLY0rYWQDcSL4ZL9R5htfctNs.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Screen recording of the gated onboarding flow connecting a first exchange"
          />
        </figure>
      </section>

      {/* 06 - The result */}
      <section className={p.resultSection}>
        <div className={p.resultText}>
          <h3 className={s.sectionHeading}>06 - The result</h3>
          <h3 className={s.sectionHeading}>A 50% lift in conversion</h3>
          <h5 className={s.body}>
            To measure the impact of our new flow and our education
            hypothesis, we ran a live A/B test with three variants. The
            results were clear.
          </h5>
          <ul className={s.bodyList}>
            <li>
              <strong>Control:</strong> The original flow with no changes.
            </li>
            <li>
              <strong>New Onboarding (No Education):</strong> Our new, gated
              flow <em>without</em> the educational screens.
            </li>
            <li>
              <strong>New Onboarding (With Education):</strong> The final,
              complete flow with both the new structure <em>and</em> the
              educational screens.
            </li>
          </ul>
        </div>
        <figure className={p.resultImage}>
          <img
            src="/images/VklWD9MutaghyRZxcq6xwYZ2D6A.png"
            alt="A/B test results dashboard comparing the three onboarding variants"
            width={2777}
            height={3860}
            loading="lazy"
          />
        </figure>
      </section>

      <CaseCta />
    </CaseLayout>
  );
}
