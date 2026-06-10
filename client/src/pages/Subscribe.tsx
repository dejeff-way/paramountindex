import { useState } from 'react';

/**
 * Clean single-purpose email capture page.
 * POSTs to /api/subscribe (stub — console.log for now).
 */
export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/subscribe when FastAPI server is deployed
    console.log('[Subscribe] email:', email);
    setSubmitted(true);
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <div
        style={{
          maxWidth: 560,
          margin: '80px auto 0',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '-0.4px',
            lineHeight: 1.2,
            color: 'var(--color-text-primary)',
            marginBottom: 12,
          }}
        >
          Get every Ocean County bid the day it drops.
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--color-text-tertiary)',
            marginBottom: 32,
          }}
        >
          Never miss a government RFP again. We monitor procurement portals 3× daily
          so you don't have to.
        </p>

        {submitted ? (
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-off)',
              border: '1px solid var(--color-border-light)',
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Thanks! We'll be in touch.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 8,
              maxWidth: 420,
              margin: '0 auto',
            }}
          >
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 'var(--radius-xl)',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--radius-xl)',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-bg)',
                background: 'var(--color-text-primary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Pricing */}
      <div
        style={{
          maxWidth: 640,
          margin: '60px auto 0',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}
      >
        {/* Free Tier */}
        <div
          style={{
            padding: '28px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-off)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 18,
              fontWeight: 600,
              margin: '0 0 4px',
            }}
          >
            Free
          </h3>
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              margin: '0 0 16px',
            }}
          >
            $0<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-quaternary)' }}>/mo</span>
          </p>
          <ul style={{ padding: '0 0 0 18px', fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 2 }}>
            <li>3 leads per day</li>
            <li>24-hour delay on new bids</li>
            <li>Basic keyword search</li>
            <li>Ocean County only</li>
          </ul>
        </div>

        {/* Pro Tier */}
        <div
          style={{
            padding: '28px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg)',
            border: '1px solid var(--color-text-primary)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 18,
              fontWeight: 600,
              margin: '0 0 4px',
            }}
          >
            Pro
          </h3>
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              margin: '0 0 16px',
            }}
          >
            $29<span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}>/mo</span>
          </p>
          <ul style={{ padding: '0 0 0 18px', fontSize: 13, lineHeight: 2, opacity: 0.9 }}>
            <li>Unlimited leads — all counties</li>
            <li>Real-time alerts (email + SMS)</li>
            <li>Advanced keyword & NIGP filters</li>
            <li>Full scope-of-work text search</li>
            <li>Export to CSV</li>
            <li>Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
