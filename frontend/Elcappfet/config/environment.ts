/**
 * Environment Configuration
 * Centralizes all environment variables for the application
 */

const ENV = {
  /**
   * Backend API base URL
   * In development: http://localhost:8000
   * In production: Should be set to actual server URL
   */
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000",

  /**
   * API request timeout in milliseconds
   * Default: 30 seconds
   */
  API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || "30000", 10),

  /**
   * Cache duration in milliseconds
   * Default: 2 hours (7200000 ms)
   */
  CACHE_DURATION: parseInt(
    process.env.EXPO_PUBLIC_CACHE_DURATION || "7200000",
    10
  ),

  /**
   * Development mode flag
   */
  IS_DEV: __DEV__,
};

/**
 * Validate environment configuration
 * Logs warnings if configuration seems incorrect
 */
export const validateConfig = (): void => {
  if (!ENV.API_BASE_URL) {
    console.warn("⚠️ API_BASE_URL is not configured");
  }

  if (ENV.IS_DEV && !ENV.API_BASE_URL.includes("localhost")) {
    console.warn(
      "⚠️ Running in dev mode but API_BASE_URL does not point to localhost"
    );
  }

  console.log("✅ Environment configured:", {
    apiBaseUrl: ENV.API_BASE_URL,
    timeout: `${ENV.API_TIMEOUT}ms`,
    cacheDuration: `${ENV.CACHE_DURATION}ms`,
    isDev: ENV.IS_DEV,
  });
};

export default ENV;
