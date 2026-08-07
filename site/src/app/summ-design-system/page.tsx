import CaseLayout from '@/components/CaseStudy/CaseLayout';
import CaseHero, { MetaGroup } from '@/components/CaseStudy/CaseHero';
import CaseCta from '@/components/CaseStudy/CaseCta';
import s from '@/components/CaseStudy/CaseStudy.module.css';
import p from '@/components/CaseStudy/SummPage.module.css';

/**
 * /summ-design-system — Crypto Tax Calculator / Summ design system case
 * study. Structure measured from reference/mirror/summ-design-system.html;
 * copy is verbatim from content/summ-design-system.md (typos like
 * "sytems" and the truncated Outcome sentence are intentional).
 */
export default function SummDesignSystemPage() {
  return (
    <CaseLayout>
      <CaseHero
        client="Crypto Tax Calculator"
        title="Design System"
        tags={[
          'Design sytems',
          'Design Tokens',
          'Design<>Development automation',
          'UI',
          'UX',
          'Mobile',
        ]}
        tagsWrap
        left={
          <>
            <MetaGroup label="Role:">Lead Designer</MetaGroup>
            <MetaGroup label="When:">Ongoing</MetaGroup>
          </>
        }
        right={
          <>
            <MetaGroup label="What:" wide>
              Designing and building design systems and processes from scratch
            </MetaGroup>
            <MetaGroup label="Outcome" wide>
              Multi theme design system, complete with design tokens and
              support for white label product customisation, leading to a
              white
            </MetaGroup>
          </>
        }
      />

      {/* 01 - The challenge */}
      <section className={s.textGroup}>
        <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
          01 - The challenge
        </h3>
        <h5 className={`${s.body} ${s.textBlock}`}>
          When I joined, the product&#39;s user interface was fragmented,
          relying on a mix of disparate, out-of-the-box components. This
          resulted in hundreds of undocumented inconsistencies across the user
          experience, leading to a disjointed user journey, brand dilution,
          and significant slowdowns in both design and development workflows.
        </h5>
      </section>

      {/* 02 - My role & approach */}
      <section className={s.textGroup}>
        <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
          02 - My role &amp; approach
        </h3>
        <div className={`${s.textBlock} ${s.bodyStack}`}>
          <h5 className={s.body}>
            Recognising the need for standardisation, I took the initiative to
            lead the creation of a new, comprehensive design system. This was
            a self-directed project, not a formal assignment.
          </h5>
          <h5 className={s.body}>
            I approached this pragmatically to avoid impacting team velocity,
            I developed the system incrementally. The work was done in
            parallel with active projects, allowing us to build, test, and
            roll out new standards without ever pausing design or development
            output.
          </h5>
        </div>
      </section>

      {/* 03 - The outcome */}
      <section className={s.textGroup}>
        <h3 className={`${s.sectionHeading} ${s.textBlock}`}>
          03 - The outcome
        </h3>
        <h5 className={`${s.body} ${s.textBlock}`}>
          A robust scalable design system, established as the source of truth
          for the entire product. It included:
        </h5>
        <ul className={`${s.bodyList} ${s.textBlock}`}>
          <li>A library of componentised elements</li>
          <li>
            A foundational layer of design tokens for managing colours, fonts
            and radiuses
          </li>
          <li>Full multi-theme support</li>
        </ul>
        <h5 className={`${s.body} ${s.textBlock}`}>
          The flexibility of the system directly:
        </h5>
        <ul className={`${s.bodyList} ${s.textBlock}`}>
          <li>
            Enabled a new strategic partnership with MetaMask as we could
            seamlessly match their design style and theme
          </li>
        </ul>
        <ul className={`${s.bodyList} ${s.textBlock}`}>
          <li>
            Facilitated a full company rebrand with significantly reduced
            engineering effort.
          </li>
        </ul>
      </section>

      {/* Design system structure diagram */}
      <section className={p.galleryCard} aria-label="Design system structure">
        <figure className={p.shotPlain}>
          <img
            src="/images/KSbHY0x6AqR2ySqiO17mxHbxo.png"
            alt="Design system structure diagram: design tokens, styles and component layers"
            width={2104}
            height={1476}
            loading="lazy"
          />
        </figure>
      </section>

      {/* Figma components gallery */}
      <section
        className={p.galleryCard}
        aria-label="Figma component library gallery"
      >
        <div className={p.captionRow}>
          <h6 className={p.caption}>
            Components built in Figma and linked directly to code using Figma
            Code Connect
          </h6>
        </div>
        <figure className={p.shot}>
          <img
            src="/images/GVPWdacp7ovOjAqBMi7zIQWCHY.png"
            alt="Overview of the Figma component library pages"
            width={4096}
            height={1294}
            loading="lazy"
          />
        </figure>
        <div className={p.splitRow}>
          <figure className={`${p.shot} ${p.splitWide}`}>
            <img
              src="/images/n2pwAG6vhAKcZuAiCibIGgB0w.png"
              alt="Tooltip component variants documented in Figma"
              width={2618}
              height={1470}
              loading="lazy"
            />
          </figure>
          <figure className={`${p.shot} ${p.splitNarrow}`}>
            <img
              src="/images/PI74vjurDHL92lg4a3bqh9CQk.png"
              alt="Info accordion component states"
              width={1086}
              height={1332}
              loading="lazy"
            />
          </figure>
        </div>
        <figure className={p.shot}>
          <img
            src="/images/u55gMEEKWoIPaXMpJMopDNNNsZ8.png"
            alt="Responsive modal component documentation for mobile and desktop"
            width={3494}
            height={1682}
            loading="lazy"
          />
        </figure>
        <figure className={p.shot}>
          <img
            src="/images/xZ9CybE2FGa5Kpiq61ihMWfU4.png"
            alt="Chip component matrix across sizes, colours and states"
            width={5362}
            height={4012}
            loading="lazy"
          />
        </figure>
        <div className={p.gridQuad}>
          <figure className={p.shot}>
            <img
              src="/images/FKqpRCZS3L4TwvpHcYIvHhwlVus.png"
              alt="Button component documentation"
              width={2560}
              height={1682}
              loading="lazy"
            />
          </figure>
          <figure className={p.shot}>
            <img
              src="/images/ZXHwSmDmpnIY0CKja0A7wWYhA.png"
              alt="Form input component documentation"
              width={2560}
              height={1682}
              loading="lazy"
            />
          </figure>
          <figure className={p.shot}>
            <img
              src="/images/jH7ajZjtv33Tpsu8C5uCrUJUHUk.png"
              alt="Table component documentation"
              width={2560}
              height={1682}
              loading="lazy"
            />
          </figure>
          <figure className={p.shot}>
            <img
              src="/images/vB2J5yJLSG8LU9DShGUV3K405o.png"
              alt="Navigation component documentation"
              width={2560}
              height={1682}
              loading="lazy"
            />
          </figure>
        </div>
      </section>

      {/* Design tokens gallery */}
      <section className={p.galleryCard} aria-label="Design tokens">
        <div className={p.captionRow}>
          <h6 className={p.caption}>
            Design tokens across fonts, colours and Radiuses linked directly
            to code using Figma Code Connect
          </h6>
        </div>
        <figure className={p.shotPlain}>
          <img
            src="/images/xJLoN1RevrtlSpJSH7HFQeUwMs.png"
            alt="Design token tables for fonts, colours and radiuses in Figma"
            width={4040}
            height={3296}
            loading="lazy"
          />
        </figure>
      </section>

      {/* Storybook prototyping environment */}
      <section className={p.storybookCard}>
        <h4 className={`${s.cardTitle} ${p.storybookTitle}`}>
          Currently building a storybook prototyping environment for shareable
          design concepts built using cursor. Chat to me about it.
        </h4>
        <figure className={p.storybookVideo}>
          <video
            src="/videos/SWWmYoL2JF7loTdvJAbwlWCjxM.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Screen recording of the storybook prototyping environment"
          />
        </figure>
      </section>

      <CaseCta />
    </CaseLayout>
  );
}
