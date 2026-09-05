import type { ReactNode } from 'react';
import CaseLayout from '@/components/CaseStudy/CaseLayout';
import CaseHero, { MetaGroup } from '@/components/CaseStudy/CaseHero';
import CaseCta from '@/components/CaseStudy/CaseCta';
import Reveal from '@/components/CaseStudy/Reveal';
import s from '@/components/CaseStudy/CaseStudy.module.css';
import p from '@/components/CaseStudy/SiteMinderPayPage.module.css';

const IMG = '/images/siteminder-pay';

function Frame({
  src,
  alt,
  width,
  height,
  title,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <figure className={p.frame}>
      <div className={p.frameCopy}>
        <h4 className={s.cardTitle}>{title}</h4>
        <h5 className={s.body}>{children}</h5>
      </div>
      <div className={p.shot}>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
        />
      </div>
    </figure>
  );
}

/**
 * /siteminder-pay — SiteMinder Pay case study.
 * Screens are not cropped.
 */
export default function SiteMinderPayPage() {
  return (
    <CaseLayout variant="tight">
      <CaseHero
        client="SiteMinder"
        title="SiteMinder Pay"
        tags={[
          'Payments',
          'Research',
          'Information architecture',
          'Legacy product',
        ]}
        tagsWrap
        stackMetaOnPhone
        left={
          <>
            <MetaGroup label="Role:">
              Product design &amp; research, with Heidi Egger
            </MetaGroup>
            <MetaGroup label="When:">2019</MetaGroup>
          </>
        }
        right={
          <>
            <MetaGroup label="What:" wide>
              Take and track a booking payment without leaving Channel
              Manager
            </MetaGroup>
            <MetaGroup label="Outcome" wide>
              <p className={s.metaValue}>
                Hybrid model validated: pay in the reservation, reconcile
                in Payments. 4 of 4 completed the flow and would use it.
              </p>
            </MetaGroup>
          </>
        }
      />

      <section className={p.heroShot} aria-label="Reservation list">
        <figure className={p.shot}>
          <img
            src={`${IMG}/reservation-payment-status.png`}
            alt="Channel Manager reservation list with a Payments Taken column showing paid, unpaid, and partial amounts"
            width={2876}
            height={2028}
          />
        </figure>
        <h6 className={p.caption}>
          Look at Payments Taken on the right: unpaid in red, paid in
          green, partial still outstanding. That is the front-desk
          question this product had to answer.
        </h6>
      </section>

      {/* 1. The job */}
      <section className={s.sectionWide}>
        <div className={p.lede}>
          <h3 className={s.sectionHeading}>The job</h3>
          <h5 className={s.body}>
            Taking a booking payment was not one task in one product.
            Small and mid-sized operators in Wollongong, Kiama, and Sydney
            were moving between OTA portals, Channel Manager, a physical
            terminal, and a property system — and none of them had a fully
            integrated PMS, so the workarounds were fully visible.
          </h5>
          <h5 className={s.body}>
            <strong>4 of 4</strong> still retyped card details into a
            payment terminal.
          </h5>
        </div>
        <Reveal className={`${s.card} ${p.copy}`}>
          <p className={p.kicker}>The current process</p>
          <ol className={s.bodyList}>
            <li>Find the reservation in Channel Manager or an OTA portal.</li>
            <li>Retrieve or reveal the card details.</li>
            <li>Retype them into a payment terminal.</li>
            <li>Mark the booking paid in another system.</li>
            <li>Send a receipt, and reconcile later.</li>
          </ol>
        </Reveal>
        <div className={p.copy}>
          <blockquote>
            <h5 className={s.quote}>
              How might we reduce payment handling without forcing
              operators to abandon the reservation workflows they already
              trust?
            </h5>
          </blockquote>
          <h5 className={s.body}>
            Payment is a high-consequence action. Speed is not enough.
            Operators needed to know who had paid, what remained
            outstanding, whether a receipt had gone out, and how a refund
            would hit the record.
          </h5>
        </div>
      </section>

      {/* 2. The bet */}
      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>The bet</h3>
          <h5 className={s.body}>
            SiteMinder wanted payments in the product they already sold.
            We looked at three levels of integration. Two of them failed
            the workflow evidence.
          </h5>
        </div>
        <div className={s.grid3}>
          <Reveal className={s.card}>
            <p className={p.kicker}>Rejected</p>
            <h4 className={s.cardTitle}>Fully integrated</h4>
            <h5 className={s.body}>
              Put history, payouts, and reconciliation inside Channel
              Manager. It would have overloaded a legacy booking summary
              with back-office finance.
            </h5>
          </Reveal>
          <Reveal className={s.card}>
            <p className={p.kicker}>Rejected</p>
            <h4 className={s.cardTitle}>Standalone</h4>
            <h5 className={s.body}>
              Move the whole job into a separate SiteMinder Pay product.
              Operators would leave the reservation tools they already
              trust just to take a deposit.
            </h5>
          </Reveal>
          <Reveal className={`${s.card} ${p.chosen}`}>
            <p className={`${p.kicker} ${p.chosenKicker}`}>Chosen</p>
            <h4 className={s.cardTitle}>Hybrid</h4>
            <h5 className={s.body}>
              Initiate and track payment in the booking. Keep transaction
              history, refunds, payouts, and reconciliation in a dedicated
              Payments area.
            </h5>
          </Reveal>
        </div>
        <div className={p.split}>
          <figure>
            <img
              src={`${IMG}/booking-summary.png`}
              alt="Booking summary modal with a Payments module and Manage payments action"
              width={2878}
              height={2026}
              loading="lazy"
            />
            <h6 className={p.caption}>
              Booking context answers &ldquo;Has this guest paid?&rdquo;
            </h6>
          </figure>
          <figure>
            <img
              src={`${IMG}/payment-terminal.png`}
              alt="SiteMinder Payments terminal for taking a standalone charge"
              width={2878}
              height={2028}
              loading="lazy"
            />
            <h6 className={p.caption}>
              Payments holds finance work across many reservations.
            </h6>
          </figure>
        </div>
        <div className={p.copy}>
          <h5 className={s.body}>
            The business bet was attach: if payment lives on the
            reservation, SiteMinder has a wedge into hotel finance —
            deposits taken, leakage reduced, time-to-charge shortened —
            without pretending Channel Manager is a ledger.
          </h5>
        </div>
      </section>

      {/* 3. The proof */}
      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>The proof</h3>
          <h5 className={s.body}>
            Four in-person sessions. We walked the current process, then
            asked operators to find an unpaid booking, take a payment,
            confirm it, issue a refund, and find the transaction later.
          </h5>
        </div>
        <div className={s.grid2}>
          <Reveal className={`${s.card} ${p.cluster}`}>
            <p className={p.kicker}>The charge</p>
            <h4 className={s.cardTitle}>Worked</h4>
            <div className={`${p.clusterList} ${s.body}`}>
              <p>
                <strong>4 of 4</strong> immediately understood the payment
                screen and processed a charge. Three named meaningful time
                savings.
              </p>
              <p>
                <strong>4 of 4</strong> understood the guest had been
                charged after the success state.
              </p>
              <p>
                <strong>4 of 4</strong> said they would try SiteMinder Pay.
              </p>
            </div>
          </Reveal>
          <Reveal className={`${s.card} ${p.cluster}`}>
            <p className={p.kicker}>Find / verify / recover</p>
            <h4 className={s.cardTitle}>Failed</h4>
            <div className={`${p.clusterList} ${s.body}`}>
              <p>
                <strong>1 of 4</strong> noticed payment status in the
                reservation list without prompting.
              </p>
              <p>
                <strong>2 of 4</strong> found the refund immediately. The
                other two needed about 15 seconds.
              </p>
              <p>
                <strong>0 of 4</strong> could intuitively find past
                transactions.
              </p>
            </div>
          </Reveal>
        </div>
        <div className={p.copy}>
          <h5 className={s.body}>
            That shifted the design conversation. We stopped asking whether
            operators could process a payment, and started asking whether
            they could locate, verify, and recover one later.
          </h5>
        </div>
      </section>

      {/* 4. What we designed */}
      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>What we designed</h3>
          <h5 className={s.body}>
            The charge lives inside the reservation they already open. The
            dedicated Payments product is for the work that spans many
            bookings.
          </h5>
        </div>

        <Frame
          src={`${IMG}/checkin-report.png`}
          alt="Check-in report listing upcoming arrivals with payment taken shown as unpaid"
          width={2878}
          height={2028}
          title="Find the unpaid arrival"
        >
          Check-in is where they already look. Payment Taken sits on the
          booking, in red when nothing has been collected.
        </Frame>

        <Frame
          src={`${IMG}/booking-summary.png`}
          alt="Booking summary with reservation details, card data, and a Manage payments button"
          width={2878}
          height={2026}
          title="Act from the booking they already trust"
        >
          Card details are already on the reservation. Manage payments
          starts the charge without sending them to another product.
        </Frame>

        <Frame
          src={`${IMG}/process-payment.png`}
          alt="SiteMinder Payments overlay for charging a reservation, with amount, surcharge, and process payment"
          width={2878}
          height={2028}
          title="No retyping"
        >
          Amount, surcharge, and the card on file. Process payment is the
          step that used to mean a terminal and a second system.
        </Frame>

        <Frame
          src={`${IMG}/paid-state.png`}
          alt="Payment successful overlay confirming the guest has been charged and a confirmation email sent"
          width={2878}
          height={2028}
          title="System state, not a toast"
        >
          Branson Richardson has been charged AUD 403.90. A confirmation
          is on its way. 4 of 4 understood the customer had been charged
          from this screen.
        </Frame>

        <Frame
          src={`${IMG}/paid-past-payments.png`}
          alt="Payments overlay showing a succeeded past payment with a refund action"
          width={1440}
          height={1024}
          title="Recover from the same booking"
        >
          Past payments and a refund sit on the reservation. This is the
          path 2 of 4 found slowly, and where 0 of 4 expected to look for
          history.
        </Frame>

        <div className={p.split}>
          <figure>
            <img
              src={`${IMG}/refund-flow.png`}
              alt="Refund form showing transaction details, card details, and amount to refund"
              width={2878}
              height={2028}
              loading="lazy"
            />
            <h6 className={p.caption}>
              Refund is an explicit action, with the amount available
              sitting next to the control.
            </h6>
          </figure>
          <figure>
            <img
              src={`${IMG}/transaction-details.png`}
              alt="Transaction details for a succeeded payment, with refund and in-transit payout status"
              width={2878}
              height={2028}
              loading="lazy"
            />
            <h6 className={p.caption}>
              Transaction detail is a record, not a navigation problem:
              status, fee, refund, and where the money is.
            </h6>
          </figure>
        </div>

        <div className={p.copy}>
          <h5 className={s.body}>
            Payouts stay in Payments. That is the finance surface — money
            moving across many reservations — and the reason the booking
            summary does not try to be a ledger.
          </h5>
        </div>
        <figure className={p.shot}>
          <img
            src={`${IMG}/payouts.png`}
            alt="Payouts list filtered by status and date, showing in-transit and paid rows"
            width={2878}
            height={2028}
            loading="lazy"
          />
        </figure>
      </section>

      {/* Insight to change */}
      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>What the test changed</h3>
          <h5 className={s.body}>
            The charge was not the problem. Find, verify, and recover were.
            Three changes carried the weight; the rest were copy and
            control fixes.
          </h5>
        </div>
        <div className={s.grid3}>
          <Reveal className={`${s.card} ${p.changeCard}`}>
            <p className={p.kicker}>1 of 4 saw list status</p>
            <h4 className={s.cardTitle}>Make status the default view</h4>
            <h5 className={s.body}>
              Default Reservations to the next seven days, add a
              payment-status filter, and strengthen status in the list and
              the booking summary.
            </h5>
          </Reveal>
          <Reveal className={`${s.card} ${p.changeCard}`}>
            <p className={p.kicker}>2 of 4 found refund slowly</p>
            <h4 className={s.cardTitle}>Put refund on the booking</h4>
            <h5 className={s.body}>
              Refund is an explicit action on the paid reservation, not a
              hunt through a separate transactions page.
            </h5>
          </Reveal>
          <Reveal className={`${s.card} ${p.changeCard}`}>
            <p className={p.kicker}>0 of 4 found history</p>
            <h4 className={s.cardTitle}>Replace &ldquo;transactions&rdquo;</h4>
            <h5 className={s.body}>
              Direct receipt and print actions instead of ambiguous
              transaction navigation. History has to be reachable from the
              booking they just charged.
            </h5>
          </Reveal>
        </div>
        <div className={p.copy}>
          <h5 className={s.body}>
            Plus a set of smaller fixes: surcharge disabled when it does
            not apply, internal note separated from the customer-facing
            one, receipt email and invoice under operator control,
            date-based sorting for daily reconciliation.
          </h5>
        </div>
      </section>

      {/* Outcome */}
      <section className={s.sectionWide}>
        <div className={p.copy}>
          <h3 className={s.sectionHeading}>What we left with</h3>
          <h5 className={s.body}>
            This was concept validation, not a launch readout. Operators
            could complete an embedded payment. All four in the synthesis
            said they would try it.
          </h5>
          <h5 className={s.body}>
            What the team actually took into build was a hybrid
            architecture they could defend, and a ranked usability backlog
            pointed at find / verify / recover — not another pass on the
            charge button.
          </h5>
          <p className={p.note}>
            n=4. Five sessions were planned; one column is missing from
            the synthesis, so every ratio on this page uses four. No
            production analytics or launch results were in the source
            material.
          </p>
        </div>
      </section>

      <CaseCta />
    </CaseLayout>
  );
}
