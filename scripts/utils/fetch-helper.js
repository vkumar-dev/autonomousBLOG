/**
 * Fetch Helper Utilities
 * Provides timeout, retry, and error handling for API calls
 */

/**
 * Fetch with timeout
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} [timeoutMs=30000] - Timeout in milliseconds
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If timeout or network error
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Fetch with retry logic
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} [retries=3] - Number of retry attempts
 * @param {number} [delayMs=1000] - Delay between retries
 * @param {number} [timeoutMs=30000] - Request timeout
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If all retries fail
 */
async function fetchWithRetry(
  url,
  options = {},
  retries = 3,
  delayMs = 1000,
  timeoutMs = 30000
) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      
      // Don't retry on client errors (4xx), only server errors (5xx) and network
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      if (response.ok) {
        return response;
      }
      
      // 5xx errors are retriable
      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status}`);
      } else {
        return response;
      }
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt < retries) {
        console.warn(
          `Fetch attempt ${attempt}/${retries} failed: ${error.message}. ` +
          `Retrying in ${delayMs}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Failed to fetch ${url} after ${retries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Parse JSON response with error handling
 * 
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed JSON
 * @throws {Error} If response is not valid JSON
 */
async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON response, got: ${contentType || 'unknown content-type'}`
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
}

/**
 * Validate API response structure
 * Ensures required fields exist
 * 
 * @param {Object} data - Response data
 * @param {Array<string>} requiredFields - Required field names
 * @returns {boolean} True if all required fields present
 * @throws {Error} If required fields missing
 */
function validateApiResponse(data, requiredFields = []) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  const missing = requiredFields.filter(field => !(field in data));
  
  if (missing.length > 0) {
    throw new Error(
      `Invalid response: missing required fields: ${missing.join(', ')}`
    );
  }

  return true;
}

module.exports = {
  fetchWithTimeout,
  fetchWithRetry,
  parseJsonResponse,
  validateApiResponse
};
