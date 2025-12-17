'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleStatus, refreshToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleStatus, setRoleStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const authCheckRef = useRef(false);

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
      throw err;
    }
  }, [setStoredTokens, clearTokens]);

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
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    
    setLoading(true);
    setError(null);

    const { access } = getStoredTokens();
    if (!access) {
      setLoading(false);
      setIsInitialized(true);
      authCheckRef.current = false;
      return;
    }

    try {
      const data = await checkRoleStatus(access);
      setIsAuthenticated(true);
      setIsInitialized(true);
    } catch (err) {
      setError(err.message);
      clearTokens();
    } finally {
      setLoading(false);
      authCheckRef.current = false;
    }
  }, [getStoredTokens, checkRoleStatus, clearTokens]);

  const logout = useCallback(() => {
    clearTokens();
    router.push('/auth/login');
  }, [clearTokens, router]);

  const getToken = useCallback(() => {
    const { access } = getStoredTokens();
    return access;
  }, [getStoredTokens]);

  useEffect(() => {
    if (!isInitialized) {
      authenticate();
    }
  }, [isInitialized, authenticate]);

  const value = {
    isAuthenticated,
    userRole,
    roleStatus,
    loading,
    error,
    isInitialized,
    authenticate,
    logout,
    refreshAccessToken,
    checkRoleStatus,
    getToken,
    clearTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
