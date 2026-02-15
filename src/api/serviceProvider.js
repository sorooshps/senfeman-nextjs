import { apiRequest } from './base';
import apiConfig from '../config/api.config';

// Get all motorcycle providers
export const getMotorcycleProviders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Filter parameters
  if (params.home_to_intersection !== undefined) queryParams.append('home_to_intersection', params.home_to_intersection);
  if (params.available_on_load !== undefined) queryParams.append('available_on_load', params.available_on_load);
  if (params.personal_tasks !== undefined) queryParams.append('personal_tasks', params.personal_tasks);
  
  // Search and ordering
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  
  // Pagination
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${apiConfig.endpoints.SERVICE_PROVIDERS.MOTORCYCLE}?${queryString}`
    : apiConfig.endpoints.SERVICE_PROVIDERS.MOTORCYCLE;
  
  return apiRequest(endpoint, {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Get all van providers
export const getVanProviders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Filter parameters
  if (params.working_area) queryParams.append('working_area', params.working_area);
  if (params.home_to_intersection !== undefined) queryParams.append('home_to_intersection', params.home_to_intersection);
  if (params.available_on_load !== undefined) queryParams.append('available_on_load', params.available_on_load);
  if (params.personal_tasks !== undefined) queryParams.append('personal_tasks', params.personal_tasks);
  if (params.has_lift !== undefined) queryParams.append('has_lift', params.has_lift);
  
  // Search and ordering
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  
  // Pagination
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${apiConfig.endpoints.SERVICE_PROVIDERS.VAN}?${queryString}`
    : apiConfig.endpoints.SERVICE_PROVIDERS.VAN;
  
  return apiRequest(endpoint, {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Get all cart providers
export const getCartProviders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Filter parameters
  if (params.nationality) queryParams.append('nationality', params.nationality);
  if (params.personal_tasks_without_cart !== undefined) queryParams.append('personal_tasks_without_cart', params.personal_tasks_without_cart);
  if (params.always_available !== undefined) queryParams.append('always_available', params.always_available);
  if (params.lifting_tasks !== undefined) queryParams.append('lifting_tasks', params.lifting_tasks);
  
  // Search and ordering
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  
  // Pagination
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${apiConfig.endpoints.SERVICE_PROVIDERS.CART}?${queryString}`
    : apiConfig.endpoints.SERVICE_PROVIDERS.CART;
  
  return apiRequest(endpoint, {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Get all lift providers
export const getLiftProviders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Filter parameters
  if (params.nationality) queryParams.append('nationality', params.nationality);
  if (params.moving_tasks !== undefined) queryParams.append('moving_tasks', params.moving_tasks);
  if (params.always_available !== undefined) queryParams.append('always_available', params.always_available);
  
  // Search and ordering
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  
  // Pagination
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${apiConfig.endpoints.SERVICE_PROVIDERS.LIFT}?${queryString}`
    : apiConfig.endpoints.SERVICE_PROVIDERS.LIFT;
  
  return apiRequest(endpoint, {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Add service provider registration (if needed later)
export const registerServiceProvider = async (providerType, data) => {
  const endpoints = {
    'motorcycle': apiConfig.endpoints.SERVICE_PROVIDERS.MOTORCYCLE,
    'van': apiConfig.endpoints.SERVICE_PROVIDERS.VAN,
    'cart': apiConfig.endpoints.SERVICE_PROVIDERS.CART,
    'lift': apiConfig.endpoints.SERVICE_PROVIDERS.LIFT,
  };
  
  const endpoint = endpoints[providerType];
  if (!endpoint) {
    throw new Error('Invalid provider type');
  }
  
  return apiRequest(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};