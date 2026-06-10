import { Search, Filter, ListOrdered, Building2, HardHat, Cable, BookmarkCheck, CreditCard, ChevronDown } from 'lucide-react';

const filters = [
  { id: 'all', label: 'All Bids', icon: 'ListOrdered', count: 10 },
  { id: 'oceancounty', label: 'Ocean County', icon: 'Building2', count: 10 },
  { id: 'construction', label: 'Construction', icon: 'HardHat', count: 4 },
  { id: 'fleet', label: 'Fleet', icon: 'Cable', count: 3 },
  { id: 'general', label: 'General', icon: 'Filter', count: 2 },
  { id: 'engineering', label: 'Engineering', icon: 'HardHat', count: 1 },
  { id: 'saved', label: 'Saved', icon: 'BookmarkCheck', count: 0 },
  { id: 'billing', label: 'Billing', icon: 'CreditCard', count: 0 },
];

const iconMap: Record<string, React.ReactNode> = {
  ListOrdered: <ListOrdered size={16} />,
  Building2: <Building2 size={16} />,
  HardHat: <HardHat size={16} />,
  Cable: <Cable size={16} />,
  Filter: <Filter size={16} />,
  BookmarkCheck: <BookmarkCheck size={16} />,
  CreditCard: <CreditCard size={16} />,
};

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

export default function Sidebar({ activeFilter, onFilterChange }: SidebarProps) {
  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-screen w-56 flex flex-col z-10">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="w-7 h-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
          <span className="text-white text-xs font-600 tracking-tight">PI</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-500 text-[var(--color-text-primary)] tracking-tight leading-none">
            Paramount Index
          </span>
          <span className="text-[10px] font-400 text-[var(--color-text-quaternary)] tracking-tight mt-0.5">
            Ocean County Wire
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[var(--border-standard)]">
          <Search size={13} className="text-[var(--color-text-quaternary)]" />
          <input
            type="text"
            placeholder="Search bids..."
            className="bg-transparent border-none outline-none text-[12px] font-400 text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-quaternary)] w-full"
          />
        </div>
      </div>

      {/* Filters */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] font-500 transition-all duration-100 ${
                isActive
                  ? 'bg-[rgba(113,112,255,0.12)] text-[var(--color-brand-accent)]'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {iconMap[f.icon]}
              </span>
              <span className="flex-1 text-left">{f.label}</span>
              {f.count !== undefined && (
                <span className={`text-[10px] font-500 px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[rgba(113,112,255,0.2)] text-[var(--color-brand-accent)]' : 'text-[var(--color-text-quaternary)]'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--color-text-quaternary)]">
          <div className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[9px] font-500 text-[var(--color-text-tertiary)]">
            JB
          </div>
          <span className="flex-1">jeffrey@paramountindex.com</span>
          <ChevronDown size={12} />
        </div>
      </div>
    </aside>
  );
}
