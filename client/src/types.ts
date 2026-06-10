export interface Lead {
  project_id: string;
  contract_title: string;
  county_agency: string;
  classification_niche: string;
  project_budget_estimate: string;
  submission_deadline_date: string;
  pre_bid_conference_details: string;
  department: string;
  nigp_codes: string;
  raw_url: string;
  overview_text: string;
  scope_text: string;
  deepseek_json: string;
}

export interface SidebarFilter {
  id: string;
  label: string;
  icon: string;
  count?: number;
}
