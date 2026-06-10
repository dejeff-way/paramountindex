import type { Lead } from '../types';
import LeadRow from './LeadRow';

interface LeadFeedProps {
  leads: Lead[];
  activeId: string | null;
  onSelect: (id: string) => void;
  filter: string;
}

export default function LeadFeed({ leads, activeId, onSelect, filter }: LeadFeedProps) {
  const filtered = filter === 'all'
    ? leads
    : leads.filter(l => l.classification_niche.toLowerCase() === filter || l.department.toLowerCase() === filter);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Feed Header */}
      <div className="sticky top-0 z-5 bg-[var(--color-bg-panel)] border-b border-[var(--border-subtle)] px-5 py-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-500 text-[var(--color-text-primary)] tracking-tight">
            Active Bids
          </h2>
          <p className="text-[11px] font-400 text-[var(--color-text-quaternary)] mt-0.5">
            {filtered.length} of {leads.length} projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11px] font-500 text-[var(--color-text-tertiary)] px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.03)] transition-colors">
            Due Date
          </button>
          <button className="text-[11px] font-500 text-[var(--color-text-tertiary)] px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.03)] transition-colors">
            Agency
          </button>
        </div>
      </div>

      {/* Feed Rows */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-3">
            <span className="text-[var(--color-text-quaternary)] text-lg">∅</span>
          </div>
          <p className="text-[13px] font-400 text-[var(--color-text-tertiary)]">
            No bids match this filter
          </p>
          <p className="text-[11px] font-400 text-[var(--color-text-quaternary)] mt-1">
            Try selecting a different category
          </p>
        </div>
      ) : (
        filtered.map((lead) => (
          <LeadRow
            key={lead.project_id}
            lead={lead}
            isActive={activeId === lead.project_id}
            onClick={() => onSelect(lead.project_id)}
          />
        ))
      )}
    </div>
  );
}
