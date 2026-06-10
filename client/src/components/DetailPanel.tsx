import type { Lead } from '../types';

interface DetailPanelProps {
  lead: Lead;
  onClose: () => void;
}

function getGradient(niche: string): string {
  const gradients: Record<string, string> = {
    Construction:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    Fleet:
      'linear-gradient(135deg, #0d2818 0%, #0a3d25 40%, #0b5e3c 100%)',
    'IT Services':
      'linear-gradient(135deg, #2d1b00 0%, #4a2c00 40%, #6b3f00 100%)',
    General:
      'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 40%, #404040 100%)',
    Engineering:
      'linear-gradient(135deg, #1a0a2e 0%, #2d1040 40%, #4a1d6e 100%)',
  };
  return gradients[niche] || gradients.General;
}

export default function DetailPanel({ lead, onClose }: DetailPanelProps) {
  const deadlineDate = lead.submission_deadline_date
    ? new Date(lead.submission_deadline_date + 'T23:59:59')
    : null;
  const now = new Date();
  const daysLeft = deadlineDate
    ? Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient bar */}
        <div
          style={{
            height: 120,
            background: getGradient(lead.classification_niche),
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '20px 32px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
            }}
          >
            {lead.classification_niche}
          </span>
        </div>

        <div className="modal-header">
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '-0.2px',
              lineHeight: 1.3,
              margin: 0,
              flex: 1,
              paddingRight: 16,
            }}
          >
            {lead.contract_title}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Quick stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatBox
              label="Agency"
              value={lead.department || lead.county_agency || 'Ocean County'}
            />
            <StatBox
              label="Deadline"
              value={lead.submission_deadline_date || 'TBD'}
              urgent={daysLeft !== null && daysLeft <= 5}
            />
            <StatBox label="Budget" value={lead.project_budget_estimate || 'Not specified'} />
            <StatBox label="Category" value={lead.classification_niche} />
          </div>

          {/* Countdown */}
          {daysLeft !== null && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background:
                  daysLeft <= 5 ? '#fef2f2' : 'var(--color-bg-off)',
                border:
                  daysLeft <= 5
                    ? '1px solid #fecaca'
                    : '1px solid var(--color-border-light)',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: daysLeft <= 5 ? '#dc2626' : 'var(--color-text-secondary)',
                }}
              >
                {daysLeft <= 0
                  ? 'Expired'
                  : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-quaternary)',
                }}
              >
                {lead.submission_deadline_date}
              </span>
            </div>
          )}

          {/* Pre-Bid Conference */}
          {lead.pre_bid_conference_details && (
            <div className="modal-section">
              <div className="modal-section-label">Pre-Bid Conference</div>
              <div className="modal-section-value">
                {lead.pre_bid_conference_details}
              </div>
            </div>
          )}

          {/* Overview */}
          {lead.overview_text && (
            <div className="modal-section">
              <div className="modal-section-label">Summary</div>
              <div className="modal-section-value">
                {lead.overview_text}
              </div>
            </div>
          )}

          {/* Scope of Work */}
          {lead.scope_text && (
            <div className="modal-section">
              <div className="modal-section-label">Scope of Work</div>
              <div className="modal-section-value" style={{ whiteSpace: 'pre-line' }}>
                {lead.scope_text}
              </div>
            </div>
          )}

          {/* NIGP Codes */}
          {lead.nigp_codes && (
            <div className="modal-section">
              <div className="modal-section-label">NIGP Codes</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lead.nigp_codes.split(',').map((code) => (
                  <span
                    key={code.trim()}
                    style={{
                      display: 'inline-flex',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-xl)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--color-text-tertiary)',
                      background: 'var(--color-bg-off)',
                      border: '1px solid var(--color-border-light)',
                    }}
                  >
                    {code.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Link */}
          <div style={{ marginTop: 32 }}>
            <a
              href={lead.raw_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 'var(--radius-xl)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-bg)',
                background: 'var(--color-text-primary)',
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
            >
              View on Procurement Portal ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  urgent,
}: {
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-off)',
        border: '1px solid var(--color-border-light)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--color-text-quaternary)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: urgent ? '#dc2626' : 'var(--color-text-secondary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
