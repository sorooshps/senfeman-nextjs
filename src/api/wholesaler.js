import { apiRequest } from './base';
import apiConfig from '../config/api.config';

// Get all categories with subcategories
export const getCategories = async (token) => {
  return apiRequest(apiConfig.endpoints.PRODUCT.CATEGORIES, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get brands for a specific subcategory
export const getBrandsBySubcategory = async (subcategoryId, token) => {
  return apiRequest(`${apiConfig.endpoints.WHOLESALER.CATEGORY_PRODUCTS}brands/${subcategoryId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get all colors
export const getColors = async (token) => {
  return apiRequest(apiConfig.endpoints.PRODUCT.COLORS, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Search products by subcategory and brand (to get product slugs)
export const searchProducts = async (params, token) => {
  const queryParams = new URLSearchParams();
  if (params.scategory) queryParams.append('scategory', params.scategory);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.color) queryParams.append('color', params.color);
  if (params.q) queryParams.append('q', params.q);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${apiConfig.endpoints.PRODUCT.SEARCH}?${queryString}` : apiConfig.endpoints.PRODUCT.SEARCH;
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Add wholesaler category product (category-based product registration)
export const addWholesalerCategoryProduct = async (data, token) => {
  // data should be: { sCategory: subcategoryId, brands: [brandId1, brandId2, ...] }
  try {
    console.log('API Request payload:', data);
    const response = await fetch(apiConfig.getUrl(apiConfig.endpoints.WHOLESALER.CATEGORY_PRODUCT_ADD), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', response.status, responseData);
      throw new Error(responseData.detail || responseData.message || JSON.stringify(responseData));
    }
    
    return responseData;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Add wholesaler product (single product registration)
export const addWholesalerProduct = async (data, token) => {
  // data should be: { product: productId, stock: number, colors: [colorId1, colorId2, ...] }
  // Can also be an array for bulk creation
  return apiRequest(`${apiConfig.endpoints.WHOLESALER.BASE}product/add/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
};

// Get wholesaler's product category list
export const getWholesalerCategoryProducts = async (token) => {
  return apiRequest(apiConfig.endpoints.WHOLESALER.CATEGORY_PRODUCT_LIST, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get wholesaler's product list
export const getWholesalerProducts = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.color) queryParams.append('color', params.color);
  if (params.scategory) queryParams.append('scategory', params.scategory);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${apiConfig.endpoints.WHOLESALER.PRODUCT_LIST}?${queryString}` : apiConfig.endpoints.WHOLESALER.PRODUCT_LIST;
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get wholesaler's category product list with pagination
export const getWholesalerCategoryProductsPaginated = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${apiConfig.endpoints.WHOLESALER.CATEGORY_PRODUCT_LIST}?${queryString}` : apiConfig.endpoints.WHOLESALER.CATEGORY_PRODUCT_LIST;
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Delete wholesaler product
export const deleteWholesalerProduct = async (productId, token) => {
  return apiRequest(`${apiConfig.endpoints.WHOLESALER.BASE}product/delete/${productId}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};
