import { useState, useEffect } from 'react';
import LeadCard from '../components/LeadCard';
import FilterBar from '../components/FilterBar';
import { getLeads } from '../lib/api';
import type { Lead, LeadFilters } from '../types/lead';

const FREE_TIER_LIMIT = 3;

export default function Feed() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  useEffect(() => {
    getLeads(filters).then(setLeads);
  }, [filters]);

  const activeLead = activeLeadId
    ? leads.find((l) => l.project_id === activeLeadId) ?? null
    : null;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Ocean County Procurement Wire</h1>
        <p className="page-subtitle">
          B2B RFP arbitrage — classified by niche, refreshed 3× daily
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Lead Grid */}
      {leads.length === 0 ? (
        <div className="card-grid">
          <div className="empty-state">
            <div className="empty-state-icon">—</div>
            <p className="empty-state-title">No bids match your filters</p>
            <p className="empty-state-sub">
              Try adjusting your search or selecting a different category
            </p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {leads.map((lead, idx) => (
            <GatedCard
              key={lead.project_id}
              lead={lead}
              gated={idx >= FREE_TIER_LIMIT}
              onClick={() =>
                setActiveLeadId((prev) =>
                  prev === lead.project_id ? null : lead.project_id
                )
              }
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {activeLead && (
        <DetailModal
          lead={activeLead}
          onClose={() => setActiveLeadId(null)}
        />
      )}
    </div>
  );
}

/** Card with optional paywall blur for free tier users */
function GatedCard({
  lead,
  gated,
  onClick,
}: {
  lead: Lead;
  gated: boolean;
  onClick: () => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={gated ? { filter: 'blur(6px)', pointerEvents: 'none' } : undefined}>
        <LeadCard lead={lead} onClick={onClick} />
      </div>
      {gated && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 'var(--radius-md)',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              textAlign: 'center',
            }}
          >
            Subscribe for full access
          </span>
          <a
            href="#/subscribe"
            style={{
              display: 'inline-flex',
              padding: '8px 20px',
              borderRadius: 'var(--radius-xl)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-bg)',
              background: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            View Plans
          </a>
        </div>
      )}
    </div>
  );
}

/** Inline detail modal (matches existing DetailPanel patterns) */
function DetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const deadlineDate = lead.submission_deadline_date
    ? new Date(lead.submission_deadline_date + 'T23:59:59')
    : null;
  const now = new Date();
  const daysLeft = deadlineDate
    ? Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const categoryImage = `/category-images/${lead.classification_niche.toLowerCase().replace(' ', '-')}.jpg`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            height: 120,
            backgroundImage: `url(${categoryImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatBox label="Agency" value={lead.department || lead.county_agency} />
            <StatBox
              label="Deadline"
              value={lead.submission_deadline_date || 'TBD'}
              urgent={daysLeft !== null && daysLeft <= 5}
            />
            <StatBox label="Budget" value={lead.project_budget_estimate || 'Not specified'} />
            <StatBox label="Category" value={lead.classification_niche} />
          </div>

          {daysLeft !== null && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: daysLeft <= 5 ? '#fef2f2' : 'var(--color-bg-off)',
                border: daysLeft <= 5 ? '1px solid #fecaca' : '1px solid var(--color-border-light)',
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
                {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
              </span>
            </div>
          )}

          {lead.pre_bid_conference_details && (
            <div className="modal-section">
              <div className="modal-section-label">Pre-Bid Conference</div>
              <div className="modal-section-value">{lead.pre_bid_conference_details}</div>
            </div>
          )}

          {lead.overview_text && (
            <div className="modal-section">
              <div className="modal-section-label">Summary</div>
              <div className="modal-section-value">{lead.overview_text}</div>
            </div>
          )}

          {lead.scope_text && (
            <div className="modal-section">
              <div className="modal-section-label">Scope of Work</div>
              <div className="modal-section-value" style={{ whiteSpace: 'pre-line' }}>
                {lead.scope_text}
              </div>
            </div>
          )}

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
