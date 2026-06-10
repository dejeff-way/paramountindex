/**
 * Lead TypeScript interface — mirrors SQLite leads table schema
 * from ocean_county_scraper.py init_db().
 */

export interface DeepSeekData {
  contract_title: string;
  classification_niche: string;
  project_budget_estimate: number | null;
  submission_deadline_date: string | null;
  pre_bid_conference_details: string | null;
}

export interface Lead {
  id: number;
  project_id: string;
  contract_title: string;
  county_agency: string;
  classification_niche: string;
  project_budget_estimate: string;
  submission_deadline_date: string;
  pre_bid_conference_details: string;
  department: string;
  nigp_codes: string;
  status: string;
  raw_url: string;
  overview_text: string;
  scope_text: string;
  deepseek_json: DeepSeekData | string;
  discovered_at: string;
  updated_at: string;
}

/** Filter parameters for getLeads() */
export interface LeadFilters {
  county?: string;
  niche?: string;
  keyword?: string;
  status?: string;
}
