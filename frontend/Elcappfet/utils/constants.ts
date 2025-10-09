/**
 * Application Constants
 * Centralized constants for day mappings, names, and other configuration
 */

// ============================================================================
// Day Mappings and Names
// ============================================================================

/**
 * Mapping from French day names (backend) to English day indices (0-6)
 * Only weekdays (Monday-Friday) are supported by the backend
 */
export const DAY_MAP: { [key: string]: number } = {
  lundi: 0, // Monday
  mardi: 1, // Tuesday
  mercredi: 2, // Wednesday
  jeudi: 3, // Thursday
  vendredi: 4, // Friday
};

/**
 * Reverse mapping from day index to French day name
 */
export const INDEX_TO_DAY_FR: { [key: number]: string } = {
  0: "lundi",
  1: "mardi",
  2: "mercredi",
  3: "jeudi",
  4: "vendredi",
};

/**
 * Full English day names (weekdays only)
 */
export const DAY_NAMES_EN = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

/**
 * French day names (weekdays only)
 */
export const DAY_NAMES_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];

/**
 * Short English day names for DayFilter component
 */
export const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// ============================================================================
// Menu Categories
// ============================================================================

/**
 * Menu type categories from backend
 */
export const MENU_CATEGORIES = {
  BISTRO: "Bistro",
  VITALITY: "Vitality",
} as const;

// ============================================================================
// Dietary Tags
// ============================================================================

/**
 * Known dietary tags that can be extracted from menu descriptions
 */
export const DIETARY_TAGS = {
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  GLUTEN_FREE: "Gluten-Free",
  HIGH_PROTEIN: "High Protein",
  DAIRY_FREE: "Dairy-Free",
} as const;

/**
 * Keywords to detect dietary tags in French menu descriptions
 */
export const DIETARY_KEYWORDS: { [key: string]: string[] } = {
  [DIETARY_TAGS.VEGETARIAN]: [
    "végétarien",
    "vegetarien",
    "légumes",
    "vegetable",
  ],
  [DIETARY_TAGS.VEGAN]: ["végan", "vegan"],
  [DIETARY_TAGS.GLUTEN_FREE]: ["sans gluten", "gluten-free"],
  [DIETARY_TAGS.HIGH_PROTEIN]: [
    "poulet",
    "chicken",
    "poisson",
    "fish",
    "viande",
    "meat",
    "protéine",
  ],
  [DIETARY_TAGS.DAIRY_FREE]: ["sans lactose", "dairy-free"],
};

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * AsyncStorage keys
 */
export const STORAGE_KEYS = {
  MENU_CACHE_PREFIX: "menu_cache_",
  LAST_FETCH: "menu_last_fetch",
  WEEK_INFO: "menu_week_info",
} as const;

/**
 * Get cache key for a specific day
 */
export function getCacheKey(dayIndex: number): string {
  return `${STORAGE_KEYS.MENU_CACHE_PREFIX}${dayIndex}`;
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * API endpoint paths (relative to base URL)
 */
export const API_ENDPOINTS = {
  WEEKLY_MENU: "/menus/weekly",
  TODAY_MENU: "/menus/today",
  MENU_BY_DAY: (day: string) => `/menus/${day}`,
  MENU_IMAGE: (type: string, description: string) =>
    `/images/menu/${type}/${encodeURIComponent(description)}`,
  HEALTH: "/health",
} as const;

// ============================================================================
// UI Constants
// ============================================================================

/**
 * Number of words to extract for menu item name
 */
export const MENU_NAME_WORD_COUNT = 3;

/**
 * Placeholder image for failed image loads
 */
export const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/800x600/262626/fafafa?text=Menu+Image";

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your internet connection.",
  SERVER_ERROR: "Server is currently unavailable. Please try again later.",
  PARSE_ERROR: "Unable to process menu data. Please try again.",
  NO_DATA: "No menu data available for this day.",
  TIMEOUT: "Request timed out. Please try again.",
} as const;
