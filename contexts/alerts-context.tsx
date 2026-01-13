/**
 * Alerts Context
 * Manages alerts state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AlertsService } from '@/services/api';
import { Alert, AlertListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AlertsContextType {
  alerts: Alert[];
  isLoading: boolean;
  unreadCount: number;
  getAlertById: (id: number) => Alert | undefined;
  refreshAlerts: (params?: AlertListParams) => Promise<void>;
  markAsRead: (id: number) => Promise<Alert>;
  markAllAsRead: () => Promise<void>;
  generateAlerts: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

const STORAGE_KEY = 'alerts_cache';
const CACHE_EXPIRY_KEY = 'alerts_cache_expiry';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter cache for alerts)

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredAlerts(): Promise<Alert[] | null> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (cached && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          return JSON.parse(cached);
        }
      }
      return null;
    } else {
      const cached = await SecureStore.getItemAsync(STORAGE_KEY);
      const expiry = await SecureStore.getItemAsync(CACHE_EXPIRY_KEY);
      
      if (cached && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          return JSON.parse(cached);
        }
      }
      return null;
    }
  } catch (error) {
    console.warn('Error reading cached alerts:', error);
    return null;
  }
}

async function storeAlerts(alerts: Alert[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(alerts);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached alerts:', error);
    // Non-critical error, continue without cache
  }
}

async function clearCachedAlerts(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached alerts:', error);
  }
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate unread count
  const unreadCount = alerts.filter(a => !a.is_read).length;

  // Load alerts on mount
  useEffect(() => {
    refreshAlerts();
  }, []);

  const refreshAlerts = useCallback(async (params?: AlertListParams) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cached = await getStoredAlerts();
      if (cached) {
        setAlerts(cached);
        setIsLoading(false);
      }

      // Fetch from API
      const response = await AlertsService.getAlerts(params);
      const alertsList = Array.isArray(response) ? response : response.results;
      
      setAlerts(alertsList);
      await storeAlerts(alertsList);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      // Keep cached data if available
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAlertById = useCallback((id: number): Alert | undefined => {
    return alerts.find(a => a.id === id);
  }, [alerts]);

  const markAsRead = useCallback(async (id: number): Promise<Alert> => {
    try {
      const updatedAlert = await AlertsService.markAsRead(id);
      
      setAlerts(prev => prev.map(a => a.id === id ? updatedAlert : a));
      await clearCachedAlerts(); // Clear cache to force refresh
      
      return updatedAlert;
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await AlertsService.markAllAsRead();
      
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      await clearCachedAlerts(); // Clear cache to force refresh
    } catch (error: any) {
      console.error('Error marking all alerts as read:', error);
      throw error;
    }
  }, []);

  const generateAlerts = useCallback(async (): Promise<void> => {
    try {
      await AlertsService.generateAlerts();
      // Refresh alerts after generation
      await refreshAlerts();
    } catch (error: any) {
      console.error('Error generating alerts:', error);
      throw error;
    }
  }, [refreshAlerts]);

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        isLoading,
        unreadCount,
        getAlertById,
        refreshAlerts,
        markAsRead,
        markAllAsRead,
        generateAlerts,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
