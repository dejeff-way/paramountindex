import type { Lead } from '../types';
import { X, ExternalLink, Calendar, Building2, Tag, DollarSign, FileText, Clock } from 'lucide-react';

interface DetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
}

function getCategoryColor(niche: string): string {
  const colors: Record<string, string> = {
    Construction: '#828fff',
    Fleet: '#34d399',
    'IT Services': '#fbbf24',
    General: '#8a8f98',
    Engineering: '#c084fc',
  };
  return colors[niche] || colors.General;
}

export default function DetailPanel({ lead, onClose }: DetailPanelProps) {
  if (!lead) return null;

  const deadlineDate = lead.submission_deadline_date
    ? new Date(lead.submission_deadline_date + 'T23:59:59')
    : null;
  const now = new Date();
  const daysLeft = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="glass-drawer w-[420px] h-screen overflow-y-auto flex-shrink-0">
      {/* Drawer Header */}
      <div className="sticky top-0 z-5 bg-[var(--color-bg-panel)] border-b border-[var(--border-subtle)] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: getCategoryColor(lead.classification_niche) }} />
          <span className="text-[11px] font-500 text-[var(--color-text-tertiary)] tracking-tight uppercase">
            {lead.classification_niche}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <X size={14} className="text-[var(--color-text-quaternary)]" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-[17px] font-500 text-[var(--color-text-primary)] leading-snug tracking-tight">
            {lead.contract_title}
          </h2>
          <a
            href={lead.raw_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-400 text-[var(--color-brand-accent)] hover:text-[var(--color-brand-hover)] mt-1.5 no-underline"
          >
            <ExternalLink size={11} />
            View on Procurement Portal
          </a>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Building2 size={11} className="text-[var(--color-text-quaternary)]" />
              <span className="text-[10px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">Agency</span>
            </div>
            <span className="text-[12px] font-500 text-[var(--color-text-secondary)]">
              {lead.department || lead.county_agency}
            </span>
          </div>

          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={11} className="text-[var(--color-text-quaternary)]" />
              <span className="text-[10px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">Deadline</span>
            </div>
            <span className="text-[12px] font-500 text-[var(--color-text-secondary)]">
              {lead.submission_deadline_date || 'TBD'}
            </span>
          </div>

          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag size={11} className="text-[var(--color-text-quaternary)]" />
              <span className="text-[10px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">Category</span>
            </div>
            <span className="text-[12px] font-500" style={{ color: getCategoryColor(lead.classification_niche) }}>
              {lead.classification_niche}
            </span>
          </div>

          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <DollarSign size={11} className="text-[var(--color-text-quaternary)]" />
              <span className="text-[10px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">Budget</span>
            </div>
            <span className="text-[12px] font-500 font-mono text-[var(--color-text-secondary)]">
              {lead.project_budget_estimate || 'Not specified'}
            </span>
          </div>
        </div>

        {/* Countdown Bar */}
        {daysLeft !== null && (
          <div
            className="p-3 rounded-lg flex items-center gap-2.5"
            style={{
              background: daysLeft <= 5 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${daysLeft <= 5 ? 'rgba(239,68,68,0.15)' : 'var(--border-subtle)'}`,
            }}
          >
            <Clock size={14} className={daysLeft <= 5 ? 'text-[#ef4444]' : 'text-[var(--color-text-quaternary)]'} />
            <div>
              <span
                className="text-[13px] font-500"
                style={{ color: daysLeft <= 5 ? '#ef4444' : 'var(--color-text-secondary)' }}
              >
                {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
              </span>
              <span className="text-[11px] font-400 text-[var(--color-text-quaternary)] block">
                {lead.submission_deadline_date}
              </span>
            </div>
          </div>
        )}

        {/* Pre-Bid Meeting */}
        {lead.pre_bid_conference_details && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar size={12} className="text-[var(--color-text-quaternary)]" />
              <h3 className="text-[11px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">
                Pre-Bid Conference
              </h3>
            </div>
            <p className="text-[12px] font-400 text-[var(--color-text-secondary)] leading-relaxed">
              {lead.pre_bid_conference_details}
            </p>
          </div>
        )}

        {/* Overview */}
        {lead.overview_text && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={12} className="text-[var(--color-text-quaternary)]" />
              <h3 className="text-[11px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">
                Summary
              </h3>
            </div>
            <p className="text-[12px] font-400 text-[var(--color-text-secondary)] leading-relaxed">
              {lead.overview_text}
            </p>
          </div>
        )}

        {/* Scope of Work */}
        {lead.scope_text && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={12} className="text-[var(--color-text-quaternary)]" />
              <h3 className="text-[11px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">
                Scope of Work
              </h3>
            </div>
            <p className="text-[12px] font-400 text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {lead.scope_text}
            </p>
          </div>
        )}

        {/* NIGP Codes */}
        {lead.nigp_codes && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={12} className="text-[var(--color-text-quaternary)]" />
              <h3 className="text-[11px] font-500 text-[var(--color-text-quaternary)] uppercase tracking-wider">
                NIGP Codes
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lead.nigp_codes.split(',').map((code) => (
                <span
                  key={code.trim()}
                  className="text-[11px] font-500 text-[var(--color-text-tertiary)] px-2 py-1 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
                >
                  {code.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Download Source PDF */}
        <div className="pt-2">
          <a
            href={lead.raw_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-500 text-[var(--color-text-primary)] no-underline transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-standard)' }}
          >
            <FileText size={13} />
            Download Source PDF
          </a>
        </div>
      </div>
    </div>
  );
}
