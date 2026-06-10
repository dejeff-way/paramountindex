import type { Lead, LeadFilters } from '../types/lead';
import { mockLeads } from '../data/mockLeads';
// TODO: Replace with real API call when FastAPI server is deployed.
// Endpoint will be GET /leads?county=&niche=&keyword=&status=
// and GET /leads/:project_id

/**
 * Fetch leads with optional filters.
 * Currently returns mock data. Will hit FastAPI backend.
 */
export async function getLeads(filters?: LeadFilters): Promise<Lead[]> {
  // TODO: const params = new URLSearchParams();
  // TODO: if (filters?.county) params.set('county', filters.county);
  // TODO: if (filters?.niche) params.set('niche', filters.niche);
  // TODO: if (filters?.keyword) params.set('keyword', filters.keyword);
  // TODO: if (filters?.status) params.set('status', filters.status);
  // TODO: const res = await fetch(`/api/leads?${params}`);
  // TODO: return res.json();

  // Mock implementation — filter in memory
  let leads = [...mockLeads];

  if (filters?.county) {
    const c = filters.county.toLowerCase();
    leads = leads.filter((l) =>
      l.county_agency.toLowerCase().includes(c) ||
      l.department.toLowerCase().includes(c)
    );
  }
  if (filters?.niche) {
    leads = leads.filter(
      (l) =>
        l.classification_niche.toLowerCase() === filters.niche!.toLowerCase()
    );
  }
  if (filters?.keyword) {
    const kw = filters.keyword.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.contract_title.toLowerCase().includes(kw) ||
        l.overview_text.toLowerCase().includes(kw) ||
        l.scope_text.toLowerCase().includes(kw)
    );
  }
  if (filters?.status) {
    leads = leads.filter(
      (l) => l.status.toLowerCase() === filters.status!.toLowerCase()
    );
  }

  return leads;
}

/**
 * Fetch a single lead by project_id.
 */
export async function getLead(id: string): Promise<Lead | null> {
  // TODO: const res = await fetch(`/api/leads/${encodeURIComponent(id)}`);
  // TODO: if (!res.ok) return null;
  // TODO: return res.json();

  return mockLeads.find((l) => l.project_id === id) ?? null;
}
