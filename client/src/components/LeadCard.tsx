import type { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

function getDaysRemaining(dateStr: string): {
  days: number;
  label: string;
  urgent: boolean;
} {
  if (!dateStr) return { days: 0, label: 'No deadline', urgent: false };
  const now = new Date();
  const due = new Date(dateStr + 'T23:59:59');
  const diff = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return { days: 0, label: 'Expired', urgent: true };
  if (diff === 0) return { days: 0, label: 'Due today', urgent: true };
  if (diff === 1) return { days: 1, label: '1 day left', urgent: true };
  return {
    days: diff,
    label: `${diff} days left`,
    urgent: diff <= 5,
  };
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

export default function LeadCard({
  lead,
  onClick,
}: LeadCardProps) {
  const deadline = getDaysRemaining(lead.submission_deadline_date);
  const budgetDisplay = lead.project_budget_estimate || 'Budget TBD';
  const agency = lead.department || lead.county_agency || 'Ocean County';

  return (
    <div
      className="lead-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      {/* Image Placeholder with gradient */}
      <div
        className="card-image"
        style={{ background: getGradient(lead.classification_niche) }}
      >
        <div className="card-image-placeholder">
          <span className="card-badge-top">
            {lead.classification_niche}
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="card-title">{lead.contract_title}</h2>

      {/* Agency + Date meta */}
      <div className="card-meta">
        <span>{agency}</span>
        <span className="card-meta-dot" />
        <span>
          {lead.submission_deadline_date || 'Date TBD'}
        </span>
      </div>

      {/* Footer: budget + deadline + view */}
      <div className="card-footer">
        <span style={{ fontSize: 12, fontWeight: 500 }}>
          {budgetDisplay}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            className={`card-deadline ${deadline.urgent ? 'urgent' : ''}`}
          >
            {deadline.label}
          </span>
          <button
            className="card-view-link"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Project
          </button>
        </div>
      </div>
    </div>
  );
}
