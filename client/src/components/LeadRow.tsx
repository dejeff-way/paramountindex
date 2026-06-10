import type { Lead } from '../types';
import { ExternalLink } from 'lucide-react';

interface LeadRowProps {
  lead: Lead;
  isActive: boolean;
  onClick: () => void;
}

function getDaysRemaining(dateStr: string): { days: number; label: string; urgent: boolean } {
  if (!dateStr) return { days: 0, label: 'No deadline', urgent: false };
  const now = new Date();
  const due = new Date(dateStr);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { days: 0, label: 'Expired', urgent: true };
  if (diff === 0) return { days: 0, label: 'Due today', urgent: true };
  if (diff === 1) return { days: 1, label: '1 day left', urgent: true };
  return { days: diff, label: `${diff} days left`, urgent: diff <= 5 };
}

function getCategoryColor(niche: string): string {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Construction: { bg: 'rgba(94,106,210,0.12)', text: '#828fff', border: 'rgba(130,143,255,0.2)' },
    Fleet: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.2)' },
    'IT Services': { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
    General: { bg: 'rgba(255,255,255,0.05)', text: '#8a8f98', border: 'rgba(255,255,255,0.08)' },
    Engineering: { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(192,132,252,0.2)' },
  };
  return colors[niche]?.bg || colors.General.bg;
}

function getCategoryTextColor(niche: string): string {
  const colors: Record<string, string> = {
    Construction: '#828fff',
    Fleet: '#34d399',
    'IT Services': '#fbbf24',
    General: '#8a8f98',
    Engineering: '#c084fc',
  };
  return colors[niche] || colors.General;
}

export default function LeadRow({ lead, isActive, onClick }: LeadRowProps) {
  const deadline = getDaysRemaining(lead.submission_deadline_date);
  const budgetDisplay = lead.project_budget_estimate || '—';
  const catColor = getCategoryTextColor(lead.classification_niche);

  return (
    <div className={`lead-row ${isActive ? 'active' : ''}`} onClick={onClick}>
      {/* Left: Title + Agency */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-500 text-[var(--color-text-primary)] leading-tight tracking-tight mb-0.5 line-clamp-2">
          {lead.contract_title}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-400 text-[var(--color-text-quaternary)]">
            {lead.department || lead.county_agency}
          </span>
          <span className="text-[8px] text-[var(--color-text-quaternary)]">·</span>
          <a
            href={lead.raw_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-400 text-[var(--color-brand-accent)] hover:text-[var(--color-brand-hover)] inline-flex items-center gap-0.5 no-underline"
          >
            <ExternalLink size={10} />
            Portal
          </a>
        </div>
      </div>

      {/* Center: Category Badge + Date */}
      <div className="flex flex-col items-end gap-1 min-w-[100px]">
        <span
          className="category-badge"
          style={{
            background: getCategoryColor(lead.classification_niche),
            color: catColor,
            borderColor: `rgba(255,255,255,0.06)`,
          }}
        >
          {lead.classification_niche}
        </span>
        <span className="text-[10px] font-400 text-[var(--color-text-quaternary)] tracking-tight">
          {lead.submission_deadline_date || 'No date'}
        </span>
      </div>

      {/* Right: Budget + Countdown */}
      <div className="flex flex-col items-end gap-1 min-w-[90px]">
        <span className="text-[13px] font-500 text-[var(--color-text-secondary)] font-mono tracking-tight">
          {budgetDisplay}
        </span>
        <span
          className="countdown-pill"
          style={{
            background: deadline.urgent ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
            color: deadline.urgent ? '#ef4444' : 'var(--color-text-tertiary)',
          }}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${deadline.urgent ? 'bg-[#ef4444]' : 'bg-[var(--color-text-quaternary)]'}`} />
          {deadline.label}
        </span>
      </div>
    </div>
  );
}
