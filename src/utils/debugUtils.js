/**
 * Utility functions for debugging API requests and responses
 */

/**
 * Log API request details
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 */
export const logApiRequest = (method, url, data) => {
  console.group(`API Request: ${method} ${url}`);
  console.log('Request Data:', data);
  console.groupEnd();
};

/**
 * Log API response details
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 */
export const logApiResponse = (method, url, data, status) => {
  console.group(`API Response: ${method} ${url} (${status})`);
  console.log('Response Data:', data);
  console.groupEnd();
};

/**
 * Log API error details
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} error - Error object
 */
export const logApiError = (method, url, error) => {
  console.group(`API Error: ${method} ${url}`);
  console.error('Error:', error);
  console.log('Response:', error.response?.data);
  console.log('Status:', error.response?.status);
  console.groupEnd();
};