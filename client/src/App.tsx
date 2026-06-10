import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LeadFeed from './components/LeadFeed';
import DetailPanel from './components/DetailPanel';
import leadsData from './data/leads.json';
import type { Lead } from './types';

const leads = leadsData as Lead[];

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const activeLead = activeLeadId ? leads.find((l) => l.project_id === activeLeadId) || null : null;

  const handleSelectLead = (id: string) => {
    setActiveLeadId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg-deep)' }}>
      {/* Sidebar */}
      <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Main Content Area */}
      <div className="flex flex-1 ml-56">
        {/* Lead Feed */}
        <div className="flex-1 flex flex-col" style={{ background: 'var(--color-bg-panel)', borderRight: activeLead ? 'none' : '1px solid var(--border-subtle)' }}>
          {/* Feed Header Bar */}
          <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-2 border-b border-[var(--border-subtle)]" style={{ background: 'var(--color-bg-panel)' }}>
            <button className="text-[11px] font-500 text-[var(--color-text-tertiary)] px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              All
            </button>
            <button className="text-[11px] font-500 text-[var(--color-text-quaternary)] px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              Open
            </button>
            <button className="text-[11px] font-500 text-[var(--color-text-quaternary)] px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              Awarded
            </button>
            <div className="flex-1" />
            <span className="text-[10px] font-400 text-[var(--color-text-quaternary)]">
              Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <LeadFeed
            leads={leads}
            activeId={activeLeadId}
            onSelect={handleSelectLead}
            filter={activeFilter}
          />
        </div>

        {/* Detail Panel (Dual Pane) */}
        {activeLead && (
          <DetailPanel lead={activeLead} onClose={() => setActiveLeadId(null)} />
        )}
      </div>
    </div>
  );
}
