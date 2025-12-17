'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleStatus, refreshToken } from '../api';

export const useAuth = (requiredRole = null, options = {}) => {
  // Default options
  const { skipRoleRedirect = false } = options;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleStatus, setRoleStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Prevent double authentication calls
  const authInProgress = useRef(false);
  const hasAuthenticated = useRef(false);

  const getStoredTokens = useCallback(() => {
    if (typeof window === 'undefined') return { access: null, refresh: null };
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');
    return { access, refresh };
  }, []);

  const setStoredTokens = useCallback((access, refresh) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
  }, []);

  const clearTokens = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    setUserRole(null);
    setRoleStatus(null);
  }, []);

  const refreshAccessToken = useCallback(async (refreshTokenValue) => {
    try {
      const refreshData = await refreshToken(refreshTokenValue);
      const newAccess = refreshData.access || refreshData.access_token;
      const newRefresh = refreshData.refresh || refreshData.refresh_token;
      setStoredTokens(newAccess, newRefresh);
      return newAccess;
    } catch (err) {
      clearTokens();
      router.push('/auth/login');
      throw err;
    }
  }, [setStoredTokens, clearTokens, router]);

  const checkRoleStatus = useCallback(async (accessToken) => {
    try {
      const data = await getRoleStatus(accessToken);
      const normalizedStatus = data.status || (data.approved ? 'approved' : (data.status === null ? 'not_requested' : 'pending'));
      const normalizedRole = data.role || data.data?.role;

      setRoleStatus(normalizedStatus);
      setUserRole(normalizedRole);
      return { ...data, status: normalizedStatus, role: normalizedRole };
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        const { refresh: refreshTokenValue } = getStoredTokens();
        if (refreshTokenValue) {
          try {
            const newAccess = await refreshAccessToken(refreshTokenValue);
            const data = await getRoleStatus(newAccess);
            const normalizedStatus = data.status || (data.approved ? 'approved' : (data.status === null ? 'not_requested' : 'pending'));
            const normalizedRole = data.role || data.data?.role;
            setRoleStatus(normalizedStatus);
            setUserRole(normalizedRole);
            return { ...data, status: normalizedStatus, role: normalizedRole };
          } catch (refreshErr) {
            throw refreshErr;
          }
        }
      }
      throw err;
    }
  }, [getStoredTokens, refreshAccessToken]);

  const authenticate = useCallback(async () => {
    // Prevent concurrent authentication calls
    if (authInProgress.current || hasAuthenticated.current) {
      return;
    }
    
    authInProgress.current = true;
    setLoading(true);
    setError(null);

    const { access } = getStoredTokens();
    if (!access) {
      setLoading(false);
      authInProgress.current = false;
      router.push('/auth/login');
      return;
    }

    try {
      const data = await checkRoleStatus(access);
      setIsAuthenticated(true);
      hasAuthenticated.current = true;

      // Only redirect to role-status if skipRoleRedirect is false
      if (!skipRoleRedirect) {
        // Check if role matches required role
        if (requiredRole && data.role !== requiredRole && data.data?.role !== requiredRole) {
          router.push('/auth/role-status');
          return;
        }

        // Check if status is accepted/approved
        if (data.status !== 'accepted' && data.status !== 'approved') {
          router.push('/auth/role-status');
          return;
        }
      }

    } catch (err) {
      setError(err.message);
      clearTokens();
      router.push('/auth/login');
    } finally {
      setLoading(false);
      authInProgress.current = false;
    }
  }, [getStoredTokens, checkRoleStatus, requiredRole, router, clearTokens, skipRoleRedirect]);

  const logout = useCallback(() => {
    hasAuthenticated.current = false;
    clearTokens();
    router.push('/auth/login');
  }, [clearTokens, router]);

  // Run authentication only once on mount
  useEffect(() => {
    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle role requirement changes
  useEffect(() => {
    if (!skipRoleRedirect && hasAuthenticated.current && requiredRole && userRole && userRole !== requiredRole) {
      router.push('/auth/role-status');
    }
  }, [requiredRole, userRole, router, skipRoleRedirect]);

  const getToken = useCallback(() => {
    const { access } = getStoredTokens();
    return access;
  }, [getStoredTokens]);

  return {
    isAuthenticated,
    userRole,
    roleStatus,
    loading,
    error,
    authenticate,
    logout,
    refreshAccessToken,
    checkRoleStatus,
    getToken,
  };
};