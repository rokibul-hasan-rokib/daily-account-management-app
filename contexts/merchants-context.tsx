/**
 * Merchants Context
 * Manages merchants state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MerchantsService } from '@/services/api';
import { Merchant } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface MerchantsContextType {
  merchants: Merchant[];
  isLoading: boolean;
  getMerchantById: (id: number) => Merchant | undefined;
  refreshMerchants: () => Promise<void>;
  createMerchant: (data: { name: string; default_category?: number }) => Promise<Merchant>;
  updateMerchant: (id: number, data: Partial<{ name: string; default_category?: number }>) => Promise<Merchant>;
  deleteMerchant: (id: number) => Promise<void>;
}

const MerchantsContext = createContext<MerchantsContextType | undefined>(undefined);

const STORAGE_KEY = 'merchants_cache';
const CACHE_EXPIRY_KEY = 'merchants_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredMerchants(): Promise<Merchant[] | null> {
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
    console.warn('Error reading cached merchants:', error);
    return null;
  }
}

async function storeMerchants(merchants: Merchant[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(merchants);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached merchants:', error);
  }
}

export function MerchantsProvider({ children }: { children: ReactNode }) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMerchants = useCallback(async (useCache = true) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      if (useCache) {
        const cached = await getStoredMerchants();
        if (cached && cached.length > 0) {
          setMerchants(cached);
          setIsLoading(false);
          
          // Refresh in background
          refreshMerchantsFromAPI();
          return;
        }
      }
      
      // Load from API
      await refreshMerchantsFromAPI();
    } catch (error: any) {
      console.error('Error loading merchants:', error);
      // Try to use cached data if API fails
      const cached = await getStoredMerchants();
      if (cached) {
        setMerchants(cached);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshMerchantsFromAPI = async () => {
    try {
      const response = await MerchantsService.getMerchants();
      const merchantsList = Array.isArray(response) ? response : response.results;
      setMerchants(merchantsList);
      await storeMerchants(merchantsList);
    } catch (error) {
      throw error;
    }
  };

  const refreshMerchants = useCallback(async () => {
    await loadMerchants(false); // Force refresh from API
  }, [loadMerchants]);

  const getMerchantById = useCallback((id: number): Merchant | undefined => {
    return merchants.find(merchant => merchant.id === id);
  }, [merchants]);

  const createMerchant = useCallback(async (data: {
    name: string;
    default_category?: number;
  }): Promise<Merchant> => {
    const newMerchant = await MerchantsService.createMerchant(data);
    setMerchants(prev => [...prev, newMerchant]);
    await storeMerchants([...merchants, newMerchant]);
    return newMerchant;
  }, [merchants]);

  const updateMerchant = useCallback(async (id: number, data: Partial<{
    name: string;
    default_category?: number;
  }>): Promise<Merchant> => {
    const updatedMerchant = await MerchantsService.updateMerchant(id, data);
    setMerchants(prev => prev.map(merchant => merchant.id === id ? updatedMerchant : merchant));
    const updatedMerchants = merchants.map(merchant => merchant.id === id ? updatedMerchant : merchant);
    await storeMerchants(updatedMerchants);
    return updatedMerchant;
  }, [merchants]);

  const deleteMerchant = useCallback(async (id: number): Promise<void> => {
    await MerchantsService.deleteMerchant(id);
    setMerchants(prev => prev.filter(merchant => merchant.id !== id));
    const updatedMerchants = merchants.filter(merchant => merchant.id !== id);
    await storeMerchants(updatedMerchants);
  }, [merchants]);

  // Load merchants on mount
  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  return (
    <MerchantsContext.Provider
      value={{
        merchants,
        isLoading,
        getMerchantById,
        refreshMerchants,
        createMerchant,
        updateMerchant,
        deleteMerchant,
      }}
    >
      {children}
    </MerchantsContext.Provider>
  );
}

export function useMerchants() {
  const context = useContext(MerchantsContext);
  if (context === undefined) {
    throw new Error('useMerchants must be used within a MerchantsProvider');
  }
  return context;
}
