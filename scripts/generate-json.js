#!/usr/bin/env node
/**
 * generate-json.js — SQLite → Vite Data Pipeline
 * 
 * Reads leads.db, transforms each row into the Lead schema,
 * writes to client/src/data/leads.json so Vite embeds it at compile time.
 * 
 * Run:  node scripts/generate-json.js
 * After: npx vite build  (data is baked into the JS bundle — no public JSON file)
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const DB_PATH = path.resolve(__dirname, '..', 'leads.db');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'client', 'src', 'data', 'leads.json');

if (!fs.existsSync(DB_PATH)) {
  console.error(`[generate-json] leads.db not found at ${DB_PATH}`);
  console.error('[generate-json] Run the scraper first: python3 ocean_county_scraper.py');
  process.exit(1);
}

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(`[generate-json] Failed to open database: ${err.message}`);
    process.exit(1);
  }
});

const query = `
  SELECT project_id, contract_title, county_agency, classification_niche,
         project_budget_estimate, submission_deadline_date,
         pre_bid_conference_details, department, nigp_codes,
         raw_url, overview_text, scope_text, deepseek_json
  FROM leads
  WHERE status IN ('new', 'sent')
  ORDER BY 
    CASE 
      WHEN submission_deadline_date IS NULL OR submission_deadline_date = '' THEN 1
      ELSE 0
    END,
    submission_deadline_date ASC
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error(`[generate-json] Query failed: ${err.message}`);
    db.close();
    process.exit(1);
  }

  // Parse deepseek_json field from string to object
  const leads = rows.map(row => ({
    ...row,
    deepseek_json: (() => {
      try { return JSON.parse(row.deepseek_json || '{}'); }
      catch { return {}; }
    })(),
  }));

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(leads, null, 2), 'utf-8');
  console.log(`[generate-json] ✅ Wrote ${leads.length} leads to ${OUTPUT_PATH}`);

  db.close();
});
