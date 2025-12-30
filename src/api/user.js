import { apiRequest } from './base';

/**
 * Get user role request status
 * @param {string} token - Authentication token
 * @returns {Promise} Response with role request status
 */
export const getUserRoleStatus = async (token) => {
  return apiRequest('/user/role-request/status/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.first_name - First name
 * @param {string} profileData.last_name - Last name
 * @param {string} profileData.phone - Phone number
 * @param {string} profileData.phone2 - Secondary phone number (optional)
 * @param {string} profileData.address - Address
 * @param {number} profileData.city - City ID
 * @param {string} token - Authentication token
 * @returns {Promise} Response with update status
 */
export const updateUserProfile = async (profileData, token) => {
  return apiRequest('/user/profile/update-request/', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
};

/**
 * Get list of cities
 * @param {string} token - Authentication token
 * @returns {Promise} Response with cities list
 */
export const getCities = async (token) => {
  return apiRequest('/base/cities/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get list of states
 * @param {string} token - Authentication token
 * @returns {Promise} Response with states list
 */
export const getStates = async (token) => {
  return apiRequest('/base/states/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};
