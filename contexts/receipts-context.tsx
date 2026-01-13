/**
 * Receipts Context
 * Manages receipts state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ReceiptsService } from '@/services/api';
import { Receipt, ReceiptListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface ReceiptsContextType {
  receipts: Receipt[];
  isLoading: boolean;
  getReceiptById: (id: number) => Receipt | undefined;
  refreshReceipts: (params?: ReceiptListParams) => Promise<void>;
  createReceipt: (data: FormData) => Promise<Receipt>;
  updateReceipt: (id: number, data: Partial<{
    vendor_name?: string;
    receipt_date?: string;
    total_amount?: string;
    tax_amount?: string;
  }>) => Promise<Receipt>;
  deleteReceipt: (id: number) => Promise<void>;
  extractReceipt: (id: number) => Promise<Receipt>;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

const STORAGE_KEY = 'receipts_cache';
const CACHE_EXPIRY_KEY = 'receipts_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredReceipts(): Promise<Receipt[] | null> {
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
    console.warn('Error reading cached receipts:', error);
    return null;
  }
}

async function storeReceipts(receipts: Receipt[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(receipts);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached receipts:', error);
    // Non-critical error, continue without cache
  }
}

async function clearCachedReceipts(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached receipts:', error);
  }
}

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load receipts on mount
  useEffect(() => {
    refreshReceipts();
  }, []);

  const refreshReceipts = useCallback(async (params?: ReceiptListParams) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cached = await getStoredReceipts();
      if (cached) {
        setReceipts(cached);
        setIsLoading(false);
      }

      // Fetch from API
      const response = await ReceiptsService.getReceipts(params);
      const receiptsList = Array.isArray(response) ? response : response.results;
      
      setReceipts(receiptsList);
      await storeReceipts(receiptsList);
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      // Keep cached data if available
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReceiptById = useCallback((id: number): Receipt | undefined => {
    return receipts.find(r => r.id === id);
  }, [receipts]);

  const createReceipt = useCallback(async (data: FormData): Promise<Receipt> => {
    try {
      const response = await ReceiptsService.uploadReceipt(data);
      const newReceipt = response.receipt;
      
      setReceipts(prev => [newReceipt, ...prev]);
      await clearCachedReceipts(); // Clear cache to force refresh
      
      return newReceipt;
    } catch (error: any) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  }, []);

  const updateReceipt = useCallback(async (
    id: number,
    data: Partial<{
      vendor_name?: string;
      receipt_date?: string;
      total_amount?: string;
      tax_amount?: string;
    }>
  ): Promise<Receipt> => {
    try {
      const updatedReceipt = await ReceiptsService.updateReceipt(id, data);
      
      setReceipts(prev => prev.map(r => r.id === id ? updatedReceipt : r));
      await clearCachedReceipts(); // Clear cache to force refresh
      
      return updatedReceipt;
    } catch (error: any) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  }, []);

  const deleteReceipt = useCallback(async (id: number): Promise<void> => {
    try {
      await ReceiptsService.deleteReceipt(id);
      
      setReceipts(prev => prev.filter(r => r.id !== id));
      await clearCachedReceipts(); // Clear cache to force refresh
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }, []);

  const extractReceipt = useCallback(async (id: number): Promise<Receipt> => {
    try {
      const response = await ReceiptsService.extractReceipt(id);
      const extractedReceipt = response.receipt || await ReceiptsService.getReceiptById(id);
      
      setReceipts(prev => prev.map(r => r.id === id ? extractedReceipt : r));
      await clearCachedReceipts(); // Clear cache to force refresh
      
      return extractedReceipt;
    } catch (error: any) {
      console.error('Error extracting receipt:', error);
      throw error;
    }
  }, []);

  return (
    <ReceiptsContext.Provider
      value={{
        receipts,
        isLoading,
        getReceiptById,
        refreshReceipts,
        createReceipt,
        updateReceipt,
        deleteReceipt,
        extractReceipt,
      }}
    >
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
}
