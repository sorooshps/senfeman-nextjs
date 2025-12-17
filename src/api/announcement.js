import { apiRequest } from './base';

// Get announcement channel details
export const getAnnouncementChannel = async (token) => {
  return apiRequest('announcement/channel/', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get list of announcement messages
export const getAnnouncementMessages = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `announcement/messages/?${queryString}` : 'announcement/messages/';
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Create a new announcement message
export const createAnnouncementMessage = async (text, token) => {
  return apiRequest('announcement/messages/create/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });
};

// Update an announcement message
export const updateAnnouncementMessage = async (id, text, token) => {
  return apiRequest(`announcement/messages/${id}/update/`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });
};

// Delete an announcement message
export const deleteAnnouncementMessage = async (id, token) => {
  return apiRequest(`announcement/messages/${id}/delete/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get notifications list
export const getAnnouncementNotifications = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `announcement/notifications/?${queryString}` : 'announcement/notifications/';
  
  return apiRequest(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (token) => {
  return apiRequest('announcement/notifications/unread-count/', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Mark a notification as read
export const markNotificationAsRead = async (id, token) => {
  return apiRequest(`announcement/notifications/${id}/read/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (token) => {
  return apiRequest('announcement/notifications/mark-all-read/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
};
