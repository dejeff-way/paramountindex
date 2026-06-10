import type { Lead } from '../types/lead';

/**
 * 8 realistic Ocean County NJ mock leads for development.
 * Mirrors real categories and bid patterns from the county.
 */
export const mockLeads: Lead[] = [
  {
    id: 1,
    project_id: 'OC-2025-001',
    contract_title: 'Resurfacing of County Roads — Phase IV',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Construction',
    project_budget_estimate: '$2,400,000',
    submission_deadline_date: '2026-07-15',
    pre_bid_conference_details:
      'Mandatory pre-bid meeting July 1, 2026 at 10:00 AM, 101 Hooper Ave Room 119',
    department: 'Public Works',
    nigp_codes: '91327, 91350, 91384',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-001',
    overview_text:
      'Mill and resurface approximately 12.7 miles of county roadways including Hooper Avenue, Route 571, and associated connector roads. Work includes full-depth patching, ADA curb ramp upgrades, traffic striping, and signal loop replacement.',
    scope_text:
      'Contractor shall provide all labor, materials, and equipment for asphalt milling (0–4"), HMA 9.5M64 surface course overlay, thermoplastic striping, and traffic control. All work must comply with NJDOT Standard Specifications 2019. Night work required on arterial segments.',
    deepseek_json: {
      contract_title: 'Resurfacing of County Roads — Phase IV',
      classification_niche: 'Construction',
      project_budget_estimate: 2400000,
      submission_deadline_date: '2026-07-15',
      pre_bid_conference_details: 'Mandatory pre-bid meeting July 1, 2026',
    },
    discovered_at: '2026-06-10T10:00:00Z',
    updated_at: '2026-06-10T10:00:00Z',
  },
  {
    id: 2,
    project_id: 'OC-2025-002',
    contract_title: 'Custodial Services — Justice Complex',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Janitorial',
    project_budget_estimate: '$380,000',
    submission_deadline_date: '2026-06-28',
    pre_bid_conference_details:
      'Optional walkthrough June 18, 2026 at 9:00 AM, Justice Complex Main Lobby',
    department: 'Administration',
    nigp_codes: '91039, 91065',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-002',
    overview_text:
      'Daily janitorial and custodial services for the Ocean County Justice Complex (120,000 sq ft). Includes cleaning of courtrooms, holding cells, public lobbies, administrative offices, and restrooms. Contract term: 2 years with 2 optional 1-year renewals.',
    scope_text:
      'Provide all supervision, labor, supplies, and equipment for: daily trash removal and recycling, restroom sanitation and restocking, hard-floor care (stripping/waxing quarterly), carpet extraction (monthly), window cleaning (quarterly interior, semi-annual exterior), and emergency spill response within 2 hours.',
    deepseek_json: {
      contract_title: 'Custodial Services — Justice Complex',
      classification_niche: 'Janitorial',
      project_budget_estimate: 380000,
      submission_deadline_date: '2026-06-28',
      pre_bid_conference_details: 'Optional walkthrough June 18, 2026',
    },
    discovered_at: '2026-06-09T10:00:00Z',
    updated_at: '2026-06-09T10:00:00Z',
  },
  {
    id: 3,
    project_id: 'OC-2025-003',
    contract_title: 'Fleet Vehicle Fuel Supply — Unleaded & Diesel',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Fleet',
    project_budget_estimate: '$1,100,000',
    submission_deadline_date: '2026-07-08',
    pre_bid_conference_details: '',
    department: 'Fleet Services',
    nigp_codes: '40509, 40515',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-003',
    overview_text:
      'Supply and delivery of unleaded gasoline (87 octane) and ultra-low sulfur diesel (ULSD) to county fueling stations at 5 locations. Estimated annual volume: 180,000 gallons unleaded, 95,000 gallons diesel. Contract term: 1 year with 2 optional renewals.',
    scope_text:
      'Vendor must maintain fuel inventory with 48-hour delivery guarantee, provide electronic tank monitoring, and meet NJ DEP vapor recovery requirements. Price shall be fixed margin over OPIS rack average. Emergency delivery within 8 hours during declared weather events.',
    deepseek_json: {
      contract_title: 'Fleet Vehicle Fuel Supply — Unleaded & Diesel',
      classification_niche: 'Fleet',
      project_budget_estimate: 1100000,
      submission_deadline_date: '2026-07-08',
      pre_bid_conference_details: null,
    },
    discovered_at: '2026-06-08T10:00:00Z',
    updated_at: '2026-06-08T10:00:00Z',
  },
  {
    id: 4,
    project_id: 'OC-2025-004',
    contract_title: 'Managed IT Services & Cybersecurity',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'IT Services',
    project_budget_estimate: '$850,000',
    submission_deadline_date: '2026-07-22',
    pre_bid_conference_details:
      'Virtual pre-proposal conference June 25, 2026 at 2:00 PM EST via Microsoft Teams',
    department: 'Information Technology',
    nigp_codes: '91830, 91871, 92037',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-004',
    overview_text:
      'Comprehensive managed IT services for 28 county facilities including: 24/7 help desk (tier 1–3), network monitoring and management, server administration (Windows/Linux), backup and disaster recovery, endpoint protection, and annual penetration testing.',
    scope_text:
      'Contractor shall provide: NOC operations 24×7×365 with 15-minute response SLA for P1 incidents, patching management for 1,200 endpoints, Microsoft 365 tenant administration, firewall management (Palo Alto), SIEM monitoring (Splunk), quarterly vulnerability assessments, and annual SOC 2 Type II report.',
    deepseek_json: {
      contract_title: 'Managed IT Services & Cybersecurity',
      classification_niche: 'IT Services',
      project_budget_estimate: 850000,
      submission_deadline_date: '2026-07-22',
      pre_bid_conference_details: 'Virtual pre-proposal conference June 25, 2026',
    },
    discovered_at: '2026-06-07T10:00:00Z',
    updated_at: '2026-06-07T10:00:00Z',
  },
  {
    id: 5,
    project_id: 'OC-2025-005',
    contract_title: 'Bridge Inspection Services — Countywide',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Professional Services',
    project_budget_estimate: '$620,000',
    submission_deadline_date: '2026-07-01',
    pre_bid_conference_details: '',
    department: 'Engineering',
    nigp_codes: '92533, 91842',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-005',
    overview_text:
      'NBIS-compliant bridge safety inspections for 47 county-owned bridges and culverts >20 ft span. Includes routine biennial inspections, fracture-critical member inspections, underwater inspections (12 structures), and load rating updates. 3-year contract.',
    scope_text:
      'All inspections per NJDOT/NBIS standards. Deliverables: inspection reports within 30 days, element-level condition ratings, NBI data submission to FHWA, prioritized repair recommendations with cost estimates. Team leader must be NJ-licensed PE with NHI Bridge Inspection certification.',
    deepseek_json: {
      contract_title: 'Bridge Inspection Services — Countywide',
      classification_niche: 'Professional Services',
      project_budget_estimate: 620000,
      submission_deadline_date: '2026-07-01',
      pre_bid_conference_details: null,
    },
    discovered_at: '2026-06-06T10:00:00Z',
    updated_at: '2026-06-06T10:00:00Z',
  },
  {
    id: 6,
    project_id: 'OC-2025-006',
    contract_title: 'Solid Waste Collection & Disposal — Southern District',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Janitorial',
    project_budget_estimate: '$1,700,000',
    submission_deadline_date: '2026-08-01',
    pre_bid_conference_details:
      'Mandatory site visit July 10, 2026 at 8:00 AM, Southern Recycling Center',
    department: 'Solid Waste Management',
    nigp_codes: '91027, 92645, 97537',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-006',
    overview_text:
      'Weekly solid waste collection for 14 county facilities in the southern district including parks, maintenance yards, and administrative buildings. Includes provision of 8-yard front-load containers (32 total), recycling collection (single-stream), and transfer to county-designated disposal facility.',
    scope_text:
      'Contractor shall provide: weekly pickup (Monday/Thursday routes), 8-yard compactors at 4 high-volume sites, cardboard baler service, annual bulk waste collection event coordination, and monthly tonnage reporting by waste stream. All vehicles must be GPS-tracked with route data provided monthly.',
    deepseek_json: {
      contract_title: 'Solid Waste Collection & Disposal — Southern District',
      classification_niche: 'Janitorial',
      project_budget_estimate: 1700000,
      submission_deadline_date: '2026-08-01',
      pre_bid_conference_details: 'Mandatory site visit July 10, 2026',
    },
    discovered_at: '2026-06-05T10:00:00Z',
    updated_at: '2026-06-05T10:00:00Z',
  },
  {
    id: 7,
    project_id: 'OC-2025-007',
    contract_title: 'Countywide HVAC Preventive Maintenance',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Construction',
    project_budget_estimate: '$490,000',
    submission_deadline_date: '2026-06-20',
    pre_bid_conference_details: '',
    department: 'Administration',
    nigp_codes: '91450, 91017, 91458',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-007',
    overview_text:
      'Preventive maintenance and on-call repair services for HVAC equipment across 19 county buildings. Coverage includes chillers, boilers, packaged rooftop units, split systems, VRF systems, building automation controls (Johnson Controls Metasys), and exhaust fans.',
    scope_text:
      'Quarterly PM visits per building: filter replacement, coil cleaning, belt inspection, refrigerant charge verification, condensate drain cleaning, control calibration, and efficiency testing. 4-hour emergency response for critical facilities (courthouse, 911 center, shelter). Annual steam boiler inspection per NJAC 12:90.',
    deepseek_json: {
      contract_title: 'Countywide HVAC Preventive Maintenance',
      classification_niche: 'Construction',
      project_budget_estimate: 490000,
      submission_deadline_date: '2026-06-20',
      pre_bid_conference_details: null,
    },
    discovered_at: '2026-06-04T10:00:00Z',
    updated_at: '2026-06-04T10:00:00Z',
  },
  {
    id: 8,
    project_id: 'OC-2025-008',
    contract_title: 'Police Fleet Vehicle Upfitting — Pursuit & Admin',
    county_agency: 'Ocean County Purchasing Department',
    classification_niche: 'Fleet',
    project_budget_estimate: '$740,000',
    submission_deadline_date: '2026-07-31',
    pre_bid_conference_details:
      'Vendor demonstration day June 29, 2026 at Fleet Services garage, Bay 4',
    department: 'Fleet Services',
    nigp_codes: '07105, 07180, 07545, 25755',
    status: 'open',
    raw_url: 'https://procurement.opengov.com/portal/oceancounty/projects/OC-2025-008',
    overview_text:
      'Upfitting of 22 police pursuit vehicles (2026 Ford Police Interceptor Utility) and 8 administrative vehicles. Includes: emergency lighting package (Whelen), siren/PA system, partition cage, in-car video system (Axon Fleet 3), mobile data terminal mount, rifle/shotgun lock, and ballistic door panels.',
    scope_text:
      'All upfitting per NJ DCJ specifications. Contractor must be an authorized Whelen and Axon installer. Vehicles to be delivered in 4 batches of 7–8 units with 21-day turnaround per batch. Warranty: 3yr/36k on upfit components. Radio install coordinated with County Communications Division.',
    deepseek_json: {
      contract_title: 'Police Fleet Vehicle Upfitting — Pursuit & Admin',
      classification_niche: 'Fleet',
      project_budget_estimate: 740000,
      submission_deadline_date: '2026-07-31',
      pre_bid_conference_details: 'Vendor demonstration day June 29, 2026',
    },
    discovered_at: '2026-06-03T10:00:00Z',
    updated_at: '2026-06-03T10:00:00Z',
  },
];
