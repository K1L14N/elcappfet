/**
 * Data Transformation Utilities
 * Transforms backend API data to frontend-compatible format
 */

import type {
  BackendMenuItem,
  BackendWeeklyMenuResponse,
  MenuItem,
} from "../types/menu";
import { isBackendMenuItemAvailable } from "../types/menu";
import apiService from "../services/api";
import {
  MENU_NAME_WORD_COUNT,
  DIETARY_KEYWORDS,
  DIETARY_TAGS,
  DAY_MAP,
} from "./constants";

/**
 * Extract menu item name from description
 * Takes the first N words from the content as the name
 */
export function extractMenuName(description: string): string {
  const words = description.trim().split(/\s+/);
  const nameWords = words.slice(0, MENU_NAME_WORD_COUNT);
  return nameWords.join(" ");
}

/**
 * Parse price from CHF format to number
 * Input: "CHF 14.50" or "14.50" or "14,50"
 * Output: 14.50
 */
export function parsePrice(priceString: string): number {
  // Remove "CHF" prefix and any non-numeric characters except dot and comma
  const cleaned = priceString.replace(/CHF/gi, "").trim();

  // Replace comma with dot for decimal
  const normalized = cleaned.replace(",", ".");

  // Extract number
  const match = normalized.match(/[\d.]+/);

  if (match) {
    return parseFloat(match[0]);
  }

  // Default price if parsing fails
  return 0;
}

/**
 * Detect dietary tags from menu description
 * Analyzes French menu description for dietary keywords
 */
export function detectDietaryTags(description: string): string[] {
  const tags: string[] = [];
  const lowerDescription = description.toLowerCase();

  // Check each dietary tag keyword list
  Object.entries(DIETARY_KEYWORDS).forEach(([tag, keywords]) => {
    const hasKeyword = keywords.some((keyword) =>
      lowerDescription.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      tags.push(tag);
    }
  });

  // Remove duplicates and return
  return [...new Set(tags)];
}

/**
 * Generate unique ID for menu item
 */
export function generateMenuItemId(
  type: string,
  dayIndex: number,
  timestamp: number
): string {
  return `${type.toLowerCase()}_${dayIndex}_${timestamp}`;
}

/**
 * Transform a single backend menu item to frontend format
 */
export function transformBackendMenuItem(
  backendItem: BackendMenuItem,
  dayIndex: number
): MenuItem {
  const name = extractMenuName(backendItem.contenu);
  const price = parsePrice(backendItem.prix);
  const dietaryTags = detectDietaryTags(backendItem.contenu);
  const imageUrl = apiService.getImageUrl(
    backendItem.type,
    backendItem.contenu
  );
  const id = generateMenuItemId(backendItem.type, dayIndex, Date.now());

  return {
    id,
    name,
    description: backendItem.contenu,
    price,
    category: backendItem.type,
    imageUrl,
    dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined,
  };
}

/**
 * Transform weekly menu response to list of menu items for a specific day
 */
export function transformWeeklyMenuForDay(
  response: BackendWeeklyMenuResponse,
  dayIndex: number
): { items: MenuItem[]; weekInfo: string } {
  const items: MenuItem[] = [];
  const weekInfo = response.data.semaine;

  // Get the French day name from the index
  const frenchDayNames = Object.keys(DAY_MAP);
  const dayName = frenchDayNames.find((day) => DAY_MAP[day] === dayIndex);

  if (!dayName) {
    return { items: [], weekInfo };
  }

  // Get the day's menu from response
  const dayMenu = response.data.jours[dayName];

  if (!dayMenu) {
    return { items: [], weekInfo };
  }

  // Transform Bistro menu if available
  if (isBackendMenuItemAvailable(dayMenu.bistro)) {
    items.push(transformBackendMenuItem(dayMenu.bistro, dayIndex));
  }

  // Transform Vitality menu if available
  if (isBackendMenuItemAvailable(dayMenu.vitality)) {
    items.push(transformBackendMenuItem(dayMenu.vitality, dayIndex));
  }

  return { items, weekInfo };
}

/**
 * Transform entire weekly menu response to map of day indices to menu items
 */
export function transformWeeklyMenu(
  response: BackendWeeklyMenuResponse
): Map<number, MenuItem[]> {
  const menuMap = new Map<number, MenuItem[]>();

  // Iterate through each French day name
  Object.entries(response.data.jours).forEach(([dayName, dayMenu]) => {
    const dayIndex = DAY_MAP[dayName];

    if (dayIndex === undefined) {
      console.warn(`Unknown day name: ${dayName}`);
      return;
    }

    const items: MenuItem[] = [];

    // Transform Bistro menu
    if (isBackendMenuItemAvailable(dayMenu.bistro)) {
      items.push(transformBackendMenuItem(dayMenu.bistro, dayIndex));
    }

    // Transform Vitality menu
    if (isBackendMenuItemAvailable(dayMenu.vitality)) {
      items.push(transformBackendMenuItem(dayMenu.vitality, dayIndex));
    }

    menuMap.set(dayIndex, items);
  });

  return menuMap;
}

/**
 * Validate menu data structure
 */
export function validateMenuData(
  data: unknown
): data is BackendWeeklyMenuResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const response = data as any;

  return (
    typeof response.success === "boolean" &&
    response.data &&
    typeof response.data === "object" &&
    typeof response.data.semaine === "string" &&
    response.data.jours &&
    typeof response.data.jours === "object"
  );
}

/**
 * Get human-readable error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}

/**
 * Format date for cache keys
 */
export function formatCacheDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(
  timestamp: number,
  cacheDuration: number
): boolean {
  const now = Date.now();
  return now - timestamp < cacheDuration;
}
