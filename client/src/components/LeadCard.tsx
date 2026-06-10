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

const CATEGORY_IMAGE: Record<string, string> = {
  Construction: '/category-images/construction.jpg',
  Fleet: '/category-images/fleet.jpg',
  'IT Services': '/category-images/it-services.jpg',
  Janitorial: '/category-images/janitorial.jpg',
  'Professional Services': '/category-images/professional-services.jpg',
  General: '/category-images/general.jpg',
  Healthcare: '/category-images/healthcare.jpg',
  Engineering: '/category-images/engineering.jpg',
};

function getCategoryImage(niche: string): string {
  return CATEGORY_IMAGE[niche] || CATEGORY_IMAGE.General;
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
      {/* Category Image */}
      <div
        className="card-image"
        style={{
          backgroundImage: `url(${getCategoryImage(lead.classification_niche)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
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
