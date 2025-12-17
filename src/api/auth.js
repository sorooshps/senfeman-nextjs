import { apiRequest } from './base';
import apiConfig from '../config/api.config';

export const sendOtp = async (username) => {
  return apiRequest(apiConfig.endpoints.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
};

export const verifyOtp = async (username, code) => {
  return apiRequest(apiConfig.endpoints.AUTH.VERIFY_OTP, {
    method: 'POST',
    body: JSON.stringify({ username, code }),
  });
};

export const refreshToken = async (refresh) => {
  return apiRequest(apiConfig.endpoints.AUTH.REFRESH_TOKEN, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refresh}` },
  });
};

export const requestRole = async (data, token) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  return apiRequest(apiConfig.endpoints.AUTH.ROLE_REQUEST, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
};

export const getRoleStatus = async (token) => {
  return apiRequest(apiConfig.endpoints.AUTH.ROLE_STATUS, {
    headers: { Authorization: `Bearer ${token}` },
  });
};