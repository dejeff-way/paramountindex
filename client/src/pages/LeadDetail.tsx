import { useState, useEffect } from 'react';
import { getLead } from '../lib/api';
import type { Lead } from '../types/lead';

/**
 * Full detail view for a single lead — served at /leads/:id
 * Shows all fields with a back-link to the feed.
 */
export default function LeadDetail({ projectId }: { projectId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    getLead(projectId).then(setLead);
  }, [projectId]);

  if (!lead) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-quaternary)' }}>Loading…</p>
      </div>
    );
  }

  const deadlineDate = lead.submission_deadline_date
    ? new Date(lead.submission_deadline_date + 'T23:59:59')
    : null;
  const now = new Date();
  const daysLeft = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Back link */}
      <div style={{ padding: '16px 40px 0' }}>
        <a
          href="#/"
          style={{
            fontSize: 13,
            color: 'var(--color-text-tertiary)',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          ← Back to Feed
        </a>
      </div>

      {/* Header */}
      <div style={{ padding: '24px 40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              padding: '4px 14px',
              borderRadius: 'var(--radius-xl)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-bg)',
              background: 'var(--color-text-primary)',
            }}
          >
            {lead.classification_niche}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-text-quaternary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {lead.department || lead.county_agency}
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: '-0.3px',
            lineHeight: 1.25,
            margin: 0,
            color: 'var(--color-text-primary)',
          }}
        >
          {lead.contract_title}
        </h1>
      </div>

      {/* Key Dates Table */}
      <div style={{ padding: '32px 40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <DetailField label="Deadline" value={lead.submission_deadline_date || 'TBD'} />
          <DetailField
            label="Days Remaining"
            value={
              daysLeft !== null
                ? daysLeft <= 0
                  ? 'Expired'
                  : `${daysLeft} days`
                : '—'
            }
            urgent={daysLeft !== null && daysLeft <= 5}
          />
          <DetailField label="Budget" value={lead.project_budget_estimate || 'Not specified'} />
          <DetailField label="Status" value={lead.status} />
          <DetailField label="Department" value={lead.department || '—'} />
          <DetailField label="Agency" value={lead.county_agency} />
        </div>
      </div>

      {/* Pre-Bid Conference */}
      {lead.pre_bid_conference_details && (
        <div style={{ padding: '0 40px 24px' }}>
          <SectionLabel>Pre-Bid Conference</SectionLabel>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {lead.pre_bid_conference_details}
          </p>
        </div>
      )}

      {/* Scope of Work */}
      {lead.scope_text && (
        <div style={{ padding: '0 40px 24px' }}>
          <SectionLabel>Scope of Work</SectionLabel>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {lead.scope_text}
          </p>
        </div>
      )}

      {/* Overview */}
      {lead.overview_text && (
        <div style={{ padding: '0 40px 24px' }}>
          <SectionLabel>Overview</SectionLabel>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {lead.overview_text}
          </p>
        </div>
      )}

      {/* NIGP Codes */}
      {lead.nigp_codes && (
        <div style={{ padding: '0 40px 24px' }}>
          <SectionLabel>NIGP Codes</SectionLabel>
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
      <div style={{ padding: '0 40px 60px' }}>
        <a
          href={lead.raw_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            borderRadius: 'var(--radius-xl)',
            fontSize: 14,
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
  );
}

function DetailField({
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
        padding: '14px 16px',
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
          fontSize: 14,
          fontWeight: 500,
          color: urgent ? '#dc2626' : 'var(--color-text-secondary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        color: 'var(--color-text-quaternary)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}
