/**
 * useMenu Hook
 * Custom hook for managing menu data, caching, and API calls
 */

import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MenuItem, MenuState, MenuCacheEntry } from "../types/menu";
import apiService from "../services/api";
import {
  transformWeeklyMenuForDay,
  getErrorMessage,
  isCacheValid,
} from "../utils/dataTransform";
import { getCacheKey } from "../utils/constants";
import ENV from "../config/environment";

/**
 * Hook for fetching and managing menu data for a specific day
 * @param selectedDay - Day index (0-4 for Monday-Friday)
 * @returns Menu state and refetch function
 */
export function useMenu(selectedDay: number) {
  const [state, setState] = useState<MenuState>({
    loading: true,
    error: null,
    data: null,
    lastFetch: null,
    weekInfo: null,
    refreshing: false,
  });

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Cache for all days to avoid refetching
  const weeklyCache = useRef<Map<number, MenuItem[]>>(new Map());

  /**
   * Load cached data from AsyncStorage
   */
  const loadFromCache = useCallback(
    async (dayIndex: number): Promise<boolean> => {
      try {
        const cacheKey = getCacheKey(dayIndex);
        const cachedData = await AsyncStorage.getItem(cacheKey);

        if (!cachedData) {
          return false;
        }

        const cache: MenuCacheEntry = JSON.parse(cachedData);

        // Check if cache is still valid
        if (!isCacheValid(cache.timestamp, ENV.CACHE_DURATION)) {
          // Cache expired, remove it
          await AsyncStorage.removeItem(cacheKey);
          return false;
        }

        // Cache is valid, use it
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            data: cache.data,
            weekInfo: cache.weekInfo,
            lastFetch: new Date(cache.timestamp),
            loading: false,
            error: null,
          }));

          // Also update in-memory cache
          weeklyCache.current.set(dayIndex, cache.data);
        }

        if (ENV.IS_DEV) {
          console.log("✅ Loaded menu from cache for day", dayIndex);
        }

        return true;
      } catch (error) {
        console.error("Error loading from cache:", error);
        return false;
      }
    },
    []
  );

  /**
   * Save data to AsyncStorage cache
   */
  const saveToCache = useCallback(
    async (
      dayIndex: number,
      data: MenuItem[],
      weekInfo: string
    ): Promise<void> => {
      try {
        const cacheKey = getCacheKey(dayIndex);
        const cache: MenuCacheEntry = {
          data,
          weekInfo,
          timestamp: Date.now(),
        };

        await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));

        if (ENV.IS_DEV) {
          console.log("💾 Saved menu to cache for day", dayIndex);
        }
      } catch (error) {
        console.error("Error saving to cache:", error);
      }
    },
    []
  );

  /**
   * Fetch menu data from API
   */
  const fetchMenu = useCallback(
    async (forceRefresh: boolean = false): Promise<void> => {
      try {
        // Set loading/refreshing state
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            loading: !forceRefresh,
            refreshing: forceRefresh,
            error: null,
          }));
        }

        // Check in-memory cache first (unless forcing refresh)
        if (!forceRefresh && weeklyCache.current.has(selectedDay)) {
          const cachedData = weeklyCache.current.get(selectedDay);
          if (cachedData && isMounted.current) {
            setState((prev) => ({
              ...prev,
              data: cachedData,
              loading: false,
              refreshing: false,
            }));
            return;
          }
        }

        // Check AsyncStorage cache (unless forcing refresh)
        if (!forceRefresh) {
          const cacheLoaded = await loadFromCache(selectedDay);
          if (cacheLoaded) {
            return;
          }
        }

        // Fetch from API
        if (ENV.IS_DEV) {
          console.log("📡 Fetching menu from API for day", selectedDay);
        }

        const response = await apiService.fetchWeeklyMenu();
        const { items, weekInfo } = transformWeeklyMenuForDay(
          response,
          selectedDay
        );

        // Save to both caches
        weeklyCache.current.set(selectedDay, items);
        await saveToCache(selectedDay, items, weekInfo);

        // Update state
        if (isMounted.current) {
          setState({
            loading: false,
            error: null,
            data: items,
            lastFetch: new Date(),
            weekInfo,
            refreshing: false,
          });
        }

        if (ENV.IS_DEV) {
          console.log("✅ Menu fetched successfully for day", selectedDay);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);

        // Try to load from cache as fallback
        const cacheLoaded = await loadFromCache(selectedDay);

        if (!cacheLoaded && isMounted.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            refreshing: false,
            error: getErrorMessage(error),
          }));
        } else if (isMounted.current) {
          // Show cached data but with error notification
          setState((prev) => ({
            ...prev,
            loading: false,
            refreshing: false,
            error: "Using cached data. " + getErrorMessage(error),
          }));
        }
      }
    },
    [selectedDay, loadFromCache, saveToCache]
  );

  /**
   * Refetch menu data (for pull-to-refresh)
   */
  const refetch = useCallback(() => {
    return fetchMenu(true);
  }, [fetchMenu]);

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      // Clear AsyncStorage cache
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("menu_cache_"));
      await AsyncStorage.multiRemove(cacheKeys);

      // Clear in-memory cache
      weeklyCache.current.clear();

      if (ENV.IS_DEV) {
        console.log("🗑️ Cache cleared");
      }

      // Refetch data
      await fetchMenu(true);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }, [fetchMenu]);

  /**
   * Effect: Fetch menu when selectedDay changes
   */
  useEffect(() => {
    isMounted.current = true;
    fetchMenu(false);

    return () => {
      isMounted.current = false;
    };
  }, [selectedDay, fetchMenu]);

  /**
   * Effect: Validate config on mount (dev only)
   */
  useEffect(() => {
    if (ENV.IS_DEV) {
      import("../config/environment").then(({ validateConfig }) => {
        validateConfig();
      });
    }
  }, []);

  return {
    ...state,
    refetch,
    clearCache,
  };
}

/**
 * Hook return type for external use
 */
export type UseMenuReturn = ReturnType<typeof useMenu>;
