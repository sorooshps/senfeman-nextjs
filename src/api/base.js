import apiConfig from '../config/api.config';

const API_BASE = apiConfig.API_BASE_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  const url = apiConfig.getUrl(endpoint);
  const config = {
    ...options,
  };
  if (!(options.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  } else {
    config.headers = {
      ...options.headers,
    };
  }

  try {
    const response = await fetch(url, config);

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Invalid JSON response' };
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;

      // Retry on network errors or 5xx server errors
      if (retryCount < MAX_RETRIES && (response.status >= 500 || !response.status)) {
        await delay(RETRY_DELAY * (retryCount + 1));
        return apiRequest(endpoint, options, retryCount + 1);
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (retryCount < MAX_RETRIES && (error.name === 'TypeError' || error.message.includes('fetch'))) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return apiRequest(endpoint, options, retryCount + 1);
    }

    throw error;
  }
};