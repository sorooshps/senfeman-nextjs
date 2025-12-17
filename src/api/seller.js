import { apiRequest } from './base';
import apiConfig from '../config/api.config';

// Get list of wholesalers (derived from announcement messages)
// Note: backend currently doesn't provide a dedicated wholesalers list endpoint.
export const getWholesalers = async (token) => {
  const response = await apiRequest(`${apiConfig.endpoints.ANNOUNCEMENT.MESSAGES}?page_size=1000`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const messages = Array.isArray(response) ? response : (response?.results || []);

  const bySender = new Map();
  for (const msg of messages) {
    const senderId = msg?.sender;
    if (!senderId) continue;
    if (!bySender.has(senderId)) {
      bySender.set(senderId, {
        id: senderId,
        name: msg?.sender_name || String(senderId),
        brand_name: msg?.sender_name || String(senderId),
        unread_count: 0,
      });
    }
  }

  return Array.from(bySender.values());
};

// Get announcement messages for a specific wholesaler
export const getAnnouncementMessages = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${apiConfig.endpoints.ANNOUNCEMENT.MESSAGES}?${queryString}` : apiConfig.endpoints.ANNOUNCEMENT.MESSAGES;
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAnnouncementUnreadCount = async (token) => {
  return apiRequest(apiConfig.endpoints.ANNOUNCEMENT.UNREAD_COUNT, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAnnouncementNotifications = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  if (params.mark_read === false) queryParams.append('mark_read', 'false');

  const queryString = queryParams.toString();
  const endpoint = queryString ? `${apiConfig.endpoints.ANNOUNCEMENT.NOTIFICATIONS}?${queryString}` : apiConfig.endpoints.ANNOUNCEMENT.NOTIFICATIONS;

  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAnnouncementNotificationRead = async (token, notificationId) => {
  return apiRequest(`announcement/notifications/${notificationId}/read/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAllAnnouncementNotificationsRead = async (token) => {
  return apiRequest(apiConfig.endpoints.ANNOUNCEMENT.MARK_ALL_READ, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
};


// Get all categories with subcategories
export const getCategories = async (token) => {
  return apiRequest(apiConfig.endpoints.PRODUCT.CATEGORIES, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get subcategories for a specific category
export const getSubcategories = async (token, categoryId) => {
  return apiRequest(`${apiConfig.endpoints.PRODUCT.SUBCATEGORIES}${categoryId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Search products
export const searchProducts = async (params, token) => {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.category) queryParams.append('category', params.category);
  if (params.scategory) queryParams.append('scategory', params.scategory);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.color) queryParams.append('color', params.color);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${apiConfig.endpoints.PRODUCT.SEARCH}?${queryString}` : apiConfig.endpoints.PRODUCT.SEARCH;
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get all brands
export const getBrands = async (token) => {
  return apiRequest(apiConfig.endpoints.PRODUCT.BRANDS, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get all colors
export const getColors = async (token) => {
  return apiRequest(apiConfig.endpoints.PRODUCT.COLORS, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get product detail
export const getProductDetail = async (productId, token) => {
  return apiRequest(`${apiConfig.endpoints.PRODUCT.DETAIL}${productId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get product by slug
export const getProductBySlug = async (slug, token) => {
  return apiRequest(`${apiConfig.endpoints.PRODUCT.DETAIL_SLUG}${slug}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get wholesalers with exact product match (موجودی دقیق)
export const getWholesalersByProduct = async (productId, token) => {
  return apiRequest(`${apiConfig.endpoints.WHOLESALER.PRODUCT_LIST}${productId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get wholesalers with category product match (موجودی احتمالی)
export const getWholesalersByCategoryProduct = async (productId, token) => {
  return apiRequest(`${apiConfig.endpoints.WHOLESALER.CATEGORY_PRODUCT_LIST}${productId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Local storage helpers for recent searches
const RECENT_SEARCHES_KEY = 'seller_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const getRecentSearches = () => {
  if (typeof window === 'undefined') return [];
  try {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearch = (searchItem) => {
  if (typeof window === 'undefined') return;
  try {
    let searches = getRecentSearches();
    // Remove if already exists
    searches = searches.filter(s => s.id !== searchItem.id);
    // Add to beginning
    searches.unshift(searchItem);
    // Keep only last N
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (err) {
    console.error('Failed to save recent search:', err);
  }
};

export const deleteRecentSearch = (searchId) => {
  if (typeof window === 'undefined') return;
  try {
    let searches = getRecentSearches();
    searches = searches.filter(s => s.id !== searchId);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (err) {
    console.error('Failed to delete recent search:', err);
  }
};

export const clearRecentSearches = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (err) {
    console.error('Failed to clear recent searches:', err);
  }
};
