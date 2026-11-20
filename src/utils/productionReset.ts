/**
 * One-time clean production reset to start fresh with zero sample/test records.
 * Runs synchronously before React mounts on the first load after deployment,
 * clearing legacy test operational data while preserving admin login, theme
 * preferences, reusable email templates, and uploaded curriculum videos.
 */

const RESET_MARKER_KEY = 'bnc_prod_clean_reset_2026_11_20';

const OPERATIONAL_STORAGE_KEYS = [
  'bnc_all_leads',
  'bnc_leads_directory',
  'bnc_crm_call_logs',
  'bnc_lms_managed_students',
  'bnc_lms_students',
  'bnc_campaign_form_uploads',
  'bnc_hero_enquiries',
  'bnc_brochure_downloads',
  'bnc_inquiries',
  'bnc_orders',
  'bnc_enrollment_requests',
  'bnc_order_sequence_counter',
  'bnc_lms_completed_lessons',
  'bnc_lms_notes',
];

export function runProductionCleanResetOnce(): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(RESET_MARKER_KEY) === 'done') {
      return;
    }

    OPERATIONAL_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore storage errors
      }
    });

    if (window.indexedDB) {
      try {
        window.indexedDB.deleteDatabase('bnc_campaign_sheets_db');
      } catch {
        // ignore IndexedDB errors
      }
    }

    localStorage.setItem(RESET_MARKER_KEY, 'done');
  } catch {
    // ignore storage access issues
  }
}
