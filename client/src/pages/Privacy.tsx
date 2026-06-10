/**
 * Privacy Policy — Paramount Index
 * Route: #/privacy
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

export default function Privacy() {
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
          Privacy Policy
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

        <Section title="1. Information We Collect">
          <p>
            <strong>Email address.</strong> When you subscribe to our waitlist
            or create an account, we collect your email address to send you
            procurement lead alerts and service updates.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Usage data.</strong> We may collect anonymized information
            about how you interact with our site — pages visited, time on site,
            and feature usage — to improve the product. This data does not
            identify you personally.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Payment information.</strong> When you purchase a Pro
            subscription, your payment card details are processed by our
            third-party payment processor (Stripe). We do not store your full
            credit card number on our servers.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>To deliver the Paramount Index service you signed up for</li>
            <li>To send procurement lead alerts and account-related emails</li>
            <li>To process payments and maintain your subscription</li>
            <li>To analyze usage patterns and improve the product</li>
            <li>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="3. Data Sharing">
          <p>
            <strong>We do not sell your personal information.</strong> We may
            share data with service providers who help us operate the platform
            (hosting, email delivery, payment processing) — and only to the
            extent necessary for them to perform those services. These providers
            are bound by data processing agreements.
          </p>
        </Section>

        <Section title="4. Cookies">
          <p>
            We use minimal cookies for essential site functionality (session
            management and authentication). We do not use advertising or
            third-party tracking cookies. You can disable cookies in your
            browser, but some features may not work correctly.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your account information for as long as your account is
            active. If you cancel your subscription, we will delete your
            personal data within 90 days unless we are required to retain it for
            legal or accounting purposes. Aggregated, anonymized data may be
            retained indefinitely.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            You have the right to access, correct, or delete your personal data.
            You may also request a copy of the data we hold about you. To
            exercise these rights, contact us at the email address below. We
            will respond within 30 days.
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            We implement reasonable technical and organizational measures to
            protect your data — including TLS encryption in transit, encrypted
            storage at rest, and access controls. However, no method of
            electronic storage is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            Paramount Index is not intended for use by anyone under the age of
            18. We do not knowingly collect personal information from children.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes via email or through a notice on our
            website. Continued use of the service after changes constitutes
            acceptance.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For questions about this Privacy Policy or to exercise your data
            rights, contact us at:
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
