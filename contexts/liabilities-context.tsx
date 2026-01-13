/**
 * Liabilities Context
 * Manages liabilities (bills) state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LiabilitiesService } from '@/services/api';
import { Liability, LiabilityListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface LiabilitiesContextType {
  liabilities: Liability[];
  isLoading: boolean;
  getLiabilityById: (id: number) => Liability | undefined;
  refreshLiabilities: (params?: LiabilityListParams) => Promise<void>;
  createLiability: (data: {
    name: string;
    amount: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    category?: number;
    description?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }) => Promise<Liability>;
  updateLiability: (id: number, data: Partial<{
    name: string;
    amount: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    category?: number;
    description?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }>) => Promise<Liability>;
  deleteLiability: (id: number) => Promise<void>;
  markAsPaid: (id: number) => Promise<Liability>;
}

const LiabilitiesContext = createContext<LiabilitiesContextType | undefined>(undefined);

const STORAGE_KEY = 'liabilities_cache';
const CACHE_EXPIRY_KEY = 'liabilities_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredLiabilities(): Promise<Liability[] | null> {
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
    console.warn('Error reading cached liabilities:', error);
    return null;
  }
}

async function storeLiabilities(liabilities: Liability[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(liabilities);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached liabilities:', error);
    // Non-critical error, continue without cache
  }
}

async function clearCachedLiabilities(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached liabilities:', error);
  }
}

export function LiabilitiesProvider({ children }: { children: ReactNode }) {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load liabilities on mount
  useEffect(() => {
    refreshLiabilities();
  }, []);

  const refreshLiabilities = useCallback(async (params?: LiabilityListParams) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cached = await getStoredLiabilities();
      if (cached) {
        setLiabilities(cached);
        setIsLoading(false);
      }

      // Fetch from API
      const response = await LiabilitiesService.getLiabilities(params);
      const liabilitiesList = Array.isArray(response) ? response : response.results;
      
      setLiabilities(liabilitiesList);
      await storeLiabilities(liabilitiesList);
    } catch (error: any) {
      console.error('Error fetching liabilities:', error);
      // Keep cached data if available
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLiabilityById = useCallback((id: number): Liability | undefined => {
    return liabilities.find(l => l.id === id);
  }, [liabilities]);

  const createLiability = useCallback(async (data: {
    name: string;
    amount: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    category?: number;
    description?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }): Promise<Liability> => {
    try {
      const newLiability = await LiabilitiesService.createLiability(data);
      
      setLiabilities(prev => [newLiability, ...prev]);
      await clearCachedLiabilities(); // Clear cache to force refresh
      
      return newLiability;
    } catch (error: any) {
      console.error('Error creating liability:', error);
      throw error;
    }
  }, []);

  const updateLiability = useCallback(async (
    id: number,
    data: Partial<{
      name: string;
      amount: string;
      due_date: string;
      status: 'pending' | 'paid' | 'overdue' | 'cancelled';
      category?: number;
      description?: string;
      is_recurring?: boolean;
      recurring_frequency?: string;
    }>
  ): Promise<Liability> => {
    try {
      const updatedLiability = await LiabilitiesService.updateLiability(id, data);
      
      setLiabilities(prev => prev.map(l => l.id === id ? updatedLiability : l));
      await clearCachedLiabilities(); // Clear cache to force refresh
      
      return updatedLiability;
    } catch (error: any) {
      console.error('Error updating liability:', error);
      throw error;
    }
  }, []);

  const deleteLiability = useCallback(async (id: number): Promise<void> => {
    try {
      await LiabilitiesService.deleteLiability(id);
      
      setLiabilities(prev => prev.filter(l => l.id !== id));
      await clearCachedLiabilities(); // Clear cache to force refresh
    } catch (error: any) {
      console.error('Error deleting liability:', error);
      throw error;
    }
  }, []);

  const markAsPaid = useCallback(async (id: number): Promise<Liability> => {
    try {
      const updatedLiability = await LiabilitiesService.markAsPaid(id);
      
      setLiabilities(prev => prev.map(l => l.id === id ? updatedLiability : l));
      await clearCachedLiabilities(); // Clear cache to force refresh
      
      return updatedLiability;
    } catch (error: any) {
      console.error('Error marking liability as paid:', error);
      throw error;
    }
  }, []);

  return (
    <LiabilitiesContext.Provider
      value={{
        liabilities,
        isLoading,
        getLiabilityById,
        refreshLiabilities,
        createLiability,
        updateLiability,
        deleteLiability,
        markAsPaid,
      }}
    >
      {children}
    </LiabilitiesContext.Provider>
  );
}

export function useLiabilities() {
  const context = useContext(LiabilitiesContext);
  if (context === undefined) {
    throw new Error('useLiabilities must be used within a LiabilitiesProvider');
  }
  return context;
}
