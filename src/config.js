/* =========================================
   GLOBAL CONFIGURATION
========================================= */

export const API_BASE_URL =
  "https://krishnamills-backend-api.hf.space";

/* DEFAULT SCANNER CONFIG */
export const DEFAULT_SCANNER_CONFIG = {
  detectionInterval: 1200,
  confidenceThreshold: 0.55,
  autoRefreshInterval: 10000,
};

/* SPEECH LANGUAGES */
export const SUPPORTED_LANGUAGES = [
  {
    label: "English",
    value: "en-US",
  },
  {
    label: "Hindi",
    value: "hi-IN",
  },
  {
    label: "Nepali",
    value: "ne-NP",
  },
];

/* CRM STATUS TYPES */
export const CUSTOMER_STATUS_TYPES = [
  "Lead",
  "Active",
  "VIP",
];