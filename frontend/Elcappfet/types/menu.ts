/**
 * Type Definitions for Menu Data
 * Defines interfaces for both Backend API responses and Frontend data structures
 */

// ============================================================================
// Backend API Types (from Tonton's FastAPI)
// ============================================================================

/**
 * Backend menu item (Bistro or Vitality)
 */
export interface BackendMenuItem {
  type: "Bistro" | "Vitality";
  contenu: string;
  prix: string; // Format: "CHF 14.50"
  disponible: boolean;
}

/**
 * Backend response for a single day's menu
 */
export interface BackendDayMenu {
  bistro: BackendMenuItem | { disponible: false };
  vitality: BackendMenuItem | { disponible: false };
}

/**
 * Backend response for weekly menu (GET /menus/weekly)
 */
export interface BackendWeeklyMenuResponse {
  success: boolean;
  data: {
    semaine: string; // e.g., "Du 6 au 10 Octobre"
    jours: {
      [key: string]: BackendDayMenu; // Key: "lundi", "mardi", etc.
    };
  };
  metadata: {
    source_url: string;
    parsed_at: string;
    served_at: string;
    endpoint: string;
    total_jours: number;
    jours_disponibles: string[];
  };
}

/**
 * Backend response for today's menu (GET /menus/today)
 */
export interface BackendTodayMenuResponse {
  success: boolean;
  data: {
    jour: string;
    semaine: string;
    bistro: BackendMenuItem | { disponible: false };
    vitality: BackendMenuItem | { disponible: false };
  };
  metadata: {
    source_url: string;
    parsed_at: string;
    served_at: string;
    endpoint: string;
    jours_disponibles: string[];
    total_jours: number;
  };
}

// ============================================================================
// Frontend Types (for React Native components)
// ============================================================================

/**
 * Frontend menu item - matches existing MenuCard interface
 */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Bistro" | "Vitality";
  imageUrl: string;
  dietaryTags?: string[];
}

/**
 * Menu state for useMenu hook
 */
export interface MenuState {
  loading: boolean;
  error: string | null;
  data: MenuItem[] | null;
  lastFetch: Date | null;
  weekInfo: string | null;
  refreshing: boolean;
}

/**
 * Cache entry structure for AsyncStorage
 */
export interface MenuCacheEntry {
  data: MenuItem[];
  weekInfo: string;
  timestamp: number;
}

/**
 * API Error type
 */
export interface APIError {
  message: string;
  status?: number;
  endpoint?: string;
}

// ============================================================================
// Helper Type Guards
// ============================================================================

/**
 * Type guard to check if a backend item is available
 */
export function isBackendMenuItemAvailable(
  item: BackendMenuItem | { disponible: false }
): item is BackendMenuItem {
  return "disponible" in item && item.disponible === true;
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T extends { success: boolean }>(
  response: T
): response is T & { success: true } {
  return response.success === true;
}
