import type { LeadFilters } from '../types/lead';

interface FilterBarProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

const COUNTIES = [
  { label: 'All Counties', value: '' },
  { label: 'Ocean County', value: 'Ocean County' },
];

const NICHES = [
  { label: 'All Categories', value: '' },
  { label: 'Construction', value: 'Construction' },
  { label: 'Fleet', value: 'Fleet' },
  { label: 'IT Services', value: 'IT Services' },
  { label: 'Janitorial', value: 'Janitorial' },
  { label: 'Professional Services', value: 'Professional Services' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'General', value: 'General' },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '24px 40px 16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Keyword search */}
      <input
        type="text"
        placeholder="Search bids..."
        value={filters.keyword ?? ''}
        onChange={(e) =>
          onChange({ ...filters, keyword: e.target.value || undefined })
        }
        style={{
          flex: '1 1 240px',
          minWidth: 200,
          padding: '8px 16px',
          borderRadius: 'var(--radius-xl)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text-primary)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          outline: 'none',
        }}
      />

      {/* County dropdown */}
      <select
        value={filters.county ?? ''}
        onChange={(e) =>
          onChange({ ...filters, county: e.target.value || undefined })
        }
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--radius-xl)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text-primary)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {COUNTIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Niche dropdown */}
      <select
        value={filters.niche ?? ''}
        onChange={(e) =>
          onChange({ ...filters, niche: e.target.value || undefined })
        }
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--radius-xl)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text-primary)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {NICHES.map((n) => (
          <option key={n.value} value={n.value}>
            {n.label}
          </option>
        ))}
      </select>
    </div>
  );
}
