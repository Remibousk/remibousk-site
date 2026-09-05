---
url: /siteminder-pay
title: SiteMinder Pay — Remi Bouskila
---

# SiteMinder Pay

## Making hotel payments part of the booking workflow

Hotel operators were moving between online travel agent portals, SiteMinder's Channel Manager, payment terminals, and property systems to take and reconcile booking payments. SiteMinder Pay explored a simpler model: let operators understand and act on payment status where they already manage reservations, while keeping deeper financial operations in a dedicated payments product.

| | |
|---|---|
| **My role** | Product design and research: research planning, moderation, prototyping, synthesis, and interaction design |
| **Team** | Product design collaboration with Heidi Egger and the broader SiteMinder product team |
| **Methods** | Contextual interviews, workflow mapping, moderated usability testing, and prototype iteration |
| **Research** | Five sessions planned; four completed sessions are represented in the available synthesis |
| **Stage shown** | Concept development and usability validation, 2019 |

## The challenge

Taking a booking payment was not one task in one product. Operators had to find the reservation, retrieve or reveal card details, manually re-enter them into a terminal, update another system, send a receipt, and reconcile the result later.

The business opportunity was to embed payments into SiteMinder's ecosystem. The design challenge was more specific:

> How might we reduce payment handling without forcing operators to abandon the reservation workflows they already trust?

This mattered because payment is a high-consequence action. Speed alone was not enough; operators also needed to know who had paid, what remained outstanding, whether a receipt had been sent, and how a refund would affect the record.

## Researching the real workflow

I helped plan and moderate in-person sessions with small and mid-sized property operators in Wollongong, Kiama, and Sydney. Participants used Channel Manager but did not have a fully integrated property management system, which made their manual workarounds especially visible.

The sessions combined contextual inquiry with a realistic task sequence:

1. Walk through the current process for an OTA booking payment.
2. Find an unpaid reservation through Reservations or the Check-in Report.
3. Take an early payment from the booking summary.
4. Confirm the result and mark the reservation paid.
5. Find the transaction and issue a refund.
6. Review transactions and payouts in the dedicated Payments area.

### What we learned

The research revealed a consistent baseline and a clear appetite for change:

- **4 of 4 participants manually entered card details into a payment terminal** in their current process.
- **4 of 4 noticed the payment module in the booking summary**, and all understood and liked the payment-status concept.
- **4 of 4 immediately understood the payment screen and how to process a payment.** Three explicitly recognised meaningful time savings.
- **4 of 4 understood that the customer had been charged** after seeing the success state.
- **4 of 4 said they would try SiteMinder Pay in future.**

The test also exposed discoverability problems:

- Only **1 of 4 noticed payment status in the reservation list** without prompting.
- Only **2 of 4 found the refund action immediately**; the other two needed roughly 15 seconds.
- **0 of 4 could intuitively find the past-transactions page.**

These results shifted the design conversation from “Can operators process a payment?” to “Can they confidently locate, verify, and recover a payment later?”

## Choosing a hybrid product model

We explored three levels of integration:

- **Fully integrated:** put the complete payment experience inside Channel Manager.
- **Standalone:** move the workflow into a separate SiteMinder Pay product.
- **Hybrid:** initiate and track payments in the booking context, with a dedicated area for transaction history, refunds, payouts, and reconciliation.

The hybrid direction best matched the workflow evidence. Booking context answered the immediate operational question - “Has this guest paid?” - while the dedicated Payments area supported finance-oriented tasks across many reservations. It also avoided overloading the legacy booking summary with every back-office function.

## Selected workflow

The screens below follow the sequence used during the moderated test.

- Check-in report
- Booking summary
- Process payment
- Payment successful
- Paid reservation
- Refund
- Transaction details
- Payouts

## What changed after testing

The synthesis translated observations into concrete design changes:

- Default Reservations to the next seven days and add a payment-status filter.
- Strengthen payment status in the booking summary and use a compact dropdown control.
- Add customer contact details where payment decisions are made.
- Disable surcharge controls when they do not apply.
- Separate an internal note from a customer-facing note.
- Let operators customise the receipt email and include an invoice.
- Replace ambiguous transaction navigation with direct receipt and print actions.
- Make refund entry points more explicit.
- Add date-based sorting and filtering for daily reconciliation.

This was the most valuable outcome of the study: the core payment action tested well, while the surrounding information architecture, labels, and recovery paths needed refinement.

## Outcome

The prototype validated the central proposition: operators could understand and complete an embedded payment flow, and all four participants represented in the synthesis expressed willingness to try it. The research also gave the team a defensible hybrid architecture and a prioritised set of usability improvements before release.

Evidence note: the research plan scheduled five participants. The supplied usability synthesis contains four participant columns, so all test ratios in this case study use n=4. No production analytics or launch results were included in the source material.
