import { useState } from 'react';
import LeadFeed from './components/LeadFeed';
import DetailPanel from './components/DetailPanel';
import leadsData from './data/leads.json';
import type { Lead } from './types';

const leads = leadsData as Lead[];

const categories = [
  { id: 'all', label: 'All Bids' },
  { id: 'Construction', label: 'Construction' },
  { id: 'Fleet', label: 'Fleet' },
  { id: 'IT Services', label: 'IT Services' },
  { id: 'General', label: 'General' },
  { id: 'Engineering', label: 'Engineering' },
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const activeLead = activeLeadId
    ? leads.find((l) => l.project_id === activeLeadId) || null
    : null;

  const filtered =
    activeFilter === 'all'
      ? leads
      : leads.filter((l) => l.classification_niche === activeFilter);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <nav className="top-nav">
        <a href="/" className="nav-brand" style={{ fontFamily: 'var(--font-sans)' }}>
          PARAMOUNT INDEX
        </a>
        <a
          href="mailto:jeffrey@paramountindex.com"
          className="nav-cta"
        >
          Get in Touch
        </a>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Ocean County Procurement Wire</h1>
        <p className="page-subtitle">
          B2B RFP arbitrage — classified by niche, refreshed 3× daily
        </p>
      </div>

      {/* Filter Pills */}
      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-pill ${activeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.label}
            {cat.id === 'all' && (
              <span className="filter-count">{leads.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <LeadFeed
        leads={filtered}
        onSelect={(id) =>
          setActiveLeadId((prev) => (prev === id ? null : id))
        }
      />

      {/* Detail Modal */}
      {activeLead && (
        <DetailPanel
          lead={activeLead}
          onClose={() => setActiveLeadId(null)}
        />
      )}
    </div>
  );
}
