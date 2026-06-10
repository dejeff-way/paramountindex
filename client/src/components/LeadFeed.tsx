import type { Lead } from '../types';
import LeadCard from './LeadCard';

interface LeadFeedProps {
  leads: Lead[];
  onSelect: (id: string) => void;
}

export default function LeadFeed({
  leads,
  onSelect,
}: LeadFeedProps) {
  if (leads.length === 0) {
    return (
      <div className="card-grid">
        <div className="empty-state">
          <div className="empty-state-icon">—</div>
          <p className="empty-state-title">No bids match this filter</p>
          <p className="empty-state-sub">
            Try selecting a different category
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {leads.map((lead) => (
        <LeadCard
          key={lead.project_id}
          lead={lead}
          onClick={() => onSelect(lead.project_id)}
        />
      ))}
    </div>
  );
}
