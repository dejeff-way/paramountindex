/**
 * Terms of Service — Paramount Index
 * Route: #/terms
 * Covers: service description, subscriptions, payments, IP, disclaimer, liability
 */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: 32 }}>
    <h3
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 12px',
      }}
    >
      {title}
    </h3>
    <div
      style={{
        fontSize: 14,
        lineHeight: 1.7,
        color: 'var(--color-text-tertiary)',
      }}
    >
      {children}
    </div>
  </section>
);

export default function Terms() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '60px 24px 80px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: '-0.3px',
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-quaternary)',
            marginBottom: 40,
          }}
        >
          Last updated: June 11, 2026
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Paramount Index ("the Service"), you agree to
            be bound by these Terms of Service. If you do not agree, do not use
            the Service. These terms apply to all users, including free-tier
            visitors and paid subscribers.
          </p>
        </Section>

        <Section title="2. Service Description">
          <p>
            Paramount Index is a B2B procurement intelligence platform that
            aggregates publicly available government procurement data from
            official portals. We monitor Request for Proposal (RFP) listings,
            classify them by industry niche, and deliver structured lead digests
            to subscribers.
          </p>
          <p style={{ marginTop: 8 }}>
            The Service currently covers Ocean County, New Jersey, with plans to
            expand to additional counties. Coverage information is available on
            our Coverage page and is subject to change.
          </p>
        </Section>

        <Section title="3. Subscriptions and Billing">
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              margin: '16px 0 6px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Free Tier
          </h4>
          <p>
            The free tier provides limited access — up to 3 leads per day with
            key details blurred. No payment information is required. We reserve
            the right to modify free tier limits at any time.
          </p>

          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              margin: '16px 0 6px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Pro Subscription
          </h4>
          <p>
            Pro subscribers receive unlimited lead access, full detail
            visibility, advanced filters, CSV export, and real-time alerts.
            Pricing is displayed on our Subscribe page and is subject to change
            with 30 days' notice to active subscribers.
          </p>

          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              margin: '16px 0 6px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Payment Terms
          </h4>
          <p>
            Payments are processed through Stripe, a PCI-compliant third-party
            payment processor. By subscribing, you authorize us to charge your
            payment method on a recurring basis (monthly or annually, depending
            on the plan you select) until you cancel. All fees are in U.S.
            dollars.
          </p>

          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              margin: '16px 0 6px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Cancellation and Refunds
          </h4>
          <p>
            You may cancel your subscription at any time from your account
            settings. Cancellation takes effect at the end of the current
            billing period — you will retain access until that date. We do not
            provide prorated refunds for partial months. If you believe you were
            charged in error, contact us within 14 days for a refund review.
          </p>
        </Section>

        <Section title="4. User Responsibilities">
          <p>You agree that you will not:</p>
          <ul style={{ paddingLeft: 18, margin: '8px 0 0' }}>
            <li>Use the Service for any unlawful purpose</li>
            <li>Scrape, crawl, or systematically extract data from the Service</li>
            <li>
              Resell, redistribute, or republish lead data outside your
              organization without written permission
            </li>
            <li>Share your account credentials with unauthorized users</li>
            <li>Attempt to bypass paywall or access restrictions</li>
            <li>Submit false or misleading information when creating an account</li>
          </ul>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            The Paramount Index platform, including its design, code, branding,
            classification system, and original content, is owned by Paramount
            Index. The underlying procurement data is sourced from public
            government records and is not claimed as proprietary. You retain
            ownership of any content you submit to the Service (such as saved
            notes or filters), but grant us a license to use it to provide and
            improve the Service.
          </p>
        </Section>

        <Section title="6. Procurement Data Disclaimer">
          <p>
            <strong>
              Paramount Index is an independent data aggregation service. We are
              not affiliated with, endorsed by, or connected to Ocean County,
              the State of New Jersey, OpenGov, or any government procurement
              agency.
            </strong>
          </p>
          <p style={{ marginTop: 8 }}>
            The procurement data we provide is sourced from publicly accessible
            government portals. While we strive for accuracy and timeliness
            (refreshing 3× daily), we cannot guarantee that all listings are
            current, complete, or error-free. Procurement details — including
            deadlines, budgets, specifications, and award decisions — may change
            without notice on the source portal.
          </p>
          <p style={{ marginTop: 8 }}>
            Paramount Index does not provide legal, financial, or procurement
            advisory services. The information we deliver is for business
            intelligence purposes only. You are responsible for verifying all
            bid details on the official procurement portal before submitting a
            proposal or making a business decision. We are not liable for missed
            deadlines, inaccurate bid specifications, or lost contract
            opportunities.
          </p>
          <p style={{ marginTop: 8 }}>
            Inclusion of a bid on our platform does not constitute a
            recommendation, endorsement, or guarantee of award. Past awards do
            not predict future outcomes.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Paramount Index and its
            owners, employees, and affiliates shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages —
            including lost profits, lost revenue, lost business opportunities,
            or procurement contract losses — arising from your use of or
            inability to use the Service, even if we have been advised of the
            possibility of such damages.
          </p>
          <p style={{ marginTop: 8 }}>
            Our total liability to you for any claim arising from the Service is
            limited to the amount you paid us in the 12 months preceding the
            claim, or $100 if you are a free-tier user.
          </p>
        </Section>

        <Section title="8. Service Availability">
          <p>
            We aim for high availability but do not guarantee uninterrupted
            access. The Service may be unavailable during maintenance, updates,
            or events beyond our control. We are not liable for missed lead
            alerts due to downtime, email delivery failures, or source portal
            outages.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            We reserve the right to suspend or terminate your account at any
            time for violation of these Terms, fraudulent activity, or abuse of
            the Service. In the event of termination without cause, Pro
            subscribers will receive a prorated refund for the unused portion of
            the current billing period.
          </p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>
            We may update these Terms from time to time. Material changes will
            be communicated via email to registered users and posted on this
            page. Continued use of the Service after changes take effect
            constitutes acceptance of the revised Terms. If you do not agree
            with the changes, you must cancel your subscription and stop using
            the Service.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by the laws of the State of New Jersey,
            without regard to conflict of law principles. Any disputes arising
            from these Terms or the Service shall be resolved in the state or
            federal courts located in Ocean County, New Jersey.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about these Terms of Service, contact us at:
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Paramount Index</strong>
            <br />
            Email:{' '}
            <a
              href="mailto:jeffrey@paramountindex.com"
              style={{ color: 'var(--color-text-primary)' }}
            >
              jeffrey@paramountindex.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}
