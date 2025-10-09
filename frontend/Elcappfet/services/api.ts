/**
 * API Service
 * Handles all HTTP communication with the backend FastAPI server
 */

import ENV from "../config/environment";
import type {
  BackendWeeklyMenuResponse,
  BackendTodayMenuResponse,
  APIError,
} from "../types/menu";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../utils/constants";

/**
 * Custom error class for API errors
 */
class APIServiceError extends Error implements APIError {
  status?: number;
  endpoint?: string;

  constructor(message: string, status?: number, endpoint?: string) {
    super(message);
    this.name = "APIServiceError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * API Service Class
 * Singleton service for making API requests
 */
class APIService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = ENV.API_BASE_URL;
    this.timeout = ENV.API_TIMEOUT;
  }

  /**
   * Generic fetch wrapper with timeout and error handling
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new APIServiceError(ERROR_MESSAGES.TIMEOUT, undefined, url);
        }
        throw new APIServiceError(ERROR_MESSAGES.NETWORK_ERROR, undefined, url);
      }

      throw new APIServiceError("Unknown error occurred", undefined, url);
    }
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(
    response: Response,
    endpoint: string
  ): Promise<T> {
    // Handle non-2xx status codes
    if (!response.ok) {
      const status = response.status;

      if (status >= 500) {
        throw new APIServiceError(
          ERROR_MESSAGES.SERVER_ERROR,
          status,
          endpoint
        );
      }

      if (status >= 400) {
        let errorMessage = `Request failed with status ${status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }

        throw new APIServiceError(errorMessage, status, endpoint);
      }
    }

    // Parse JSON response
    try {
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw new APIServiceError(
        ERROR_MESSAGES.PARSE_ERROR,
        response.status,
        endpoint
      );
    }
  }

  /**
   * Fetch weekly menu from backend
   * GET /menus/weekly
   */
  async fetchWeeklyMenu(): Promise<BackendWeeklyMenuResponse> {
    const endpoint = API_ENDPOINTS.WEEKLY_MENU;
    const url = `${this.baseURL}${endpoint}`;

    if (ENV.IS_DEV) {
      console.log("📡 Fetching weekly menu from:", url);
    }

    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<BackendWeeklyMenuResponse>(
      response,
      endpoint
    );

    if (!data.success) {
      throw new APIServiceError(
        "Backend returned unsuccessful response",
        response.status,
        endpoint
      );
    }

    if (ENV.IS_DEV) {
      console.log("✅ Weekly menu fetched successfully");
    }

    return data;
  }

  /**
   * Fetch today's menu from backend
   * GET /menus/today
   */
  async fetchTodayMenu(): Promise<BackendTodayMenuResponse> {
    const endpoint = API_ENDPOINTS.TODAY_MENU;
    const url = `${this.baseURL}${endpoint}`;

    if (ENV.IS_DEV) {
      console.log("📡 Fetching today menu from:", url);
    }

    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<BackendTodayMenuResponse>(
      response,
      endpoint
    );

    if (!data.success) {
      throw new APIServiceError(
        "Backend returned unsuccessful response",
        response.status,
        endpoint
      );
    }

    if (ENV.IS_DEV) {
      console.log("✅ Today menu fetched successfully");
    }

    return data;
  }

  /**
   * Get image URL for a menu item
   * Constructs URL to /images/menu/{type}/{description}
   */
  getImageUrl(type: string, description: string): string {
    const endpoint = API_ENDPOINTS.MENU_IMAGE(type, description);
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Check backend health
   * GET /health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.HEALTH}`;
      const response = await this.fetchWithTimeout(url);
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Update base URL (useful for testing or environment switches)
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
    if (ENV.IS_DEV) {
      console.log("🔄 API base URL updated to:", url);
    }
  }
}

// Export singleton instance
const apiService = new APIService();
export default apiService;

// Export error class for type checking
export { APIServiceError };
