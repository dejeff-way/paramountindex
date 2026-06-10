/**
 * Coverage map — shows active and coming-soon counties.
 * Good for SEO and credibility signaling.
 */
interface CountyEntry {
  slug: string;
  county: string;
  state: string;
  leadCount?: number;
  active: boolean;
}

const COUNTIES: CountyEntry[] = [
  {
    slug: 'ocean',
    county: 'Ocean County',
    state: 'NJ',
    leadCount: 10,
    active: true,
  },
  {
    slug: 'monmouth',
    county: 'Monmouth County',
    state: 'NJ',
    active: false,
  },
  {
    slug: 'middlesex',
    county: 'Middlesex County',
    state: 'NJ',
    active: false,
  },
  {
    slug: 'bergen',
    county: 'Bergen County',
    state: 'NJ',
    active: false,
  },
  {
    slug: 'morris',
    county: 'Morris County',
    state: 'NJ',
    active: false,
  },
  {
    slug: 'somerset',
    county: 'Somerset County',
    state: 'NJ',
    active: false,
  },
];

export default function Counties() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Coverage</h1>
        <p className="page-subtitle">
          Counties currently monitored for procurement bids
        </p>
      </div>

      {/* County Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
          padding: '24px 40px 80px',
        }}
      >
        {COUNTIES.map((c) => (
          <div
            key={c.slug}
            style={{
              padding: '24px 24px 20px',
              borderRadius: 'var(--radius-md)',
              background: c.active ? 'var(--color-bg-off)' : 'var(--color-bg)',
              border: c.active
                ? '1px solid var(--color-border-light)'
                : '1px dashed var(--color-border)',
              opacity: c.active ? 1 : 0.5,
              cursor: c.active ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--color-text-primary)',
                }}
              >
                {c.county}, {c.state}
              </h3>
              {c.active && c.leadCount !== undefined ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 28,
                    height: 28,
                    padding: '0 10px',
                    borderRadius: 'var(--radius-xl)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-bg)',
                    background: 'var(--color-text-primary)',
                  }}
                >
                  {c.leadCount}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-text-quaternary)',
                    fontFamily: 'var(--font-sans)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Coming Soon
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-quaternary)',
                margin: 0,
              }}
            >
              {c.active
                ? `${c.leadCount} active bids — monitoring daily`
                : 'Procurement portal integration in progress'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
