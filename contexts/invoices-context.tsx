/**
 * Invoices Context
 * Manages invoices state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { InvoicesService, InvoiceItemsService } from '@/services/api';
import { Invoice, InvoiceItem, InvoiceItemRequest, InvoiceItemListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface InvoicesContextType {
  invoices: Invoice[];
  isLoading: boolean;
  getInvoiceById: (id: number) => Promise<Invoice>;
  refreshInvoices: () => Promise<void>;
  extractInvoice: (id: number) => Promise<any>;
  finalizeInvoice: (id: number, data?: any) => Promise<Invoice>;
  getInvoiceItems: (params?: InvoiceItemListParams) => Promise<InvoiceItem[]>;
  createInvoiceItem: (data: InvoiceItemRequest) => Promise<InvoiceItem>;
  updateInvoiceItem: (id: number, data: Partial<InvoiceItemRequest>) => Promise<InvoiceItem>;
  deleteInvoiceItem: (id: number) => Promise<void>;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

const STORAGE_KEY = 'invoices_cache';
const CACHE_EXPIRY_KEY = 'invoices_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000;

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredInvoices(): Promise<Invoice[] | null> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (cached && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) return JSON.parse(cached);
      }
      return null;
    } else {
      const cached = await SecureStore.getItemAsync(STORAGE_KEY);
      const expiry = await SecureStore.getItemAsync(CACHE_EXPIRY_KEY);
      if (cached && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) return JSON.parse(cached);
      }
      return null;
    }
  } catch (error) {
    console.warn('Error reading cached invoices:', error);
    return null;
  }
}

async function storeInvoices(invoices: Invoice[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(invoices);
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached invoices:', error);
  }
}

async function clearCachedInvoices(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached invoices:', error);
  }
}

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshInvoices();
  }, []);

  const refreshInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const cached = await getStoredInvoices();
      if (cached) {
        setInvoices(cached);
        setIsLoading(false);
      }

      // Invoice items list gives us all items, we can derive invoices from them
      // For now, use cached data and individual getById calls
      // The API doesn't have a list invoices endpoint, so we maintain local state
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInvoiceById = useCallback(async (id: number): Promise<Invoice> => {
    try {
      const invoice = await InvoicesService.getInvoiceById(id);
      // Update local state
      setInvoices(prev => {
        const exists = prev.find(i => i.id === id);
        if (exists) {
          return prev.map(i => i.id === id ? invoice : i);
        }
        return [invoice, ...prev];
      });
      return invoice;
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }, []);

  const extractInvoice = useCallback(async (id: number) => {
    try {
      const result = await InvoicesService.extractInvoice(id);
      await clearCachedInvoices();
      return result;
    } catch (error: any) {
      console.error('Error extracting invoice:', error);
      throw error;
    }
  }, []);

  const finalizeInvoice = useCallback(async (id: number, data?: any): Promise<Invoice> => {
    try {
      const invoice = await InvoicesService.finalizeInvoice(id, data);
      setInvoices(prev => prev.map(i => i.id === id ? invoice : i));
      await clearCachedInvoices();
      return invoice;
    } catch (error: any) {
      console.error('Error finalizing invoice:', error);
      throw error;
    }
  }, []);

  const getInvoiceItems = useCallback(async (params?: InvoiceItemListParams): Promise<InvoiceItem[]> => {
    try {
      const response = await InvoiceItemsService.getInvoiceItems(params);
      return response.results || [];
    } catch (error: any) {
      console.error('Error fetching invoice items:', error);
      throw error;
    }
  }, []);

  const createInvoiceItem = useCallback(async (data: InvoiceItemRequest): Promise<InvoiceItem> => {
    try {
      const item = await InvoiceItemsService.createInvoiceItem(data);
      return item;
    } catch (error: any) {
      console.error('Error creating invoice item:', error);
      throw error;
    }
  }, []);

  const updateInvoiceItem = useCallback(async (id: number, data: Partial<InvoiceItemRequest>): Promise<InvoiceItem> => {
    try {
      const item = await InvoiceItemsService.updateInvoiceItem(id, data);
      return item;
    } catch (error: any) {
      console.error('Error updating invoice item:', error);
      throw error;
    }
  }, []);

  const deleteInvoiceItem = useCallback(async (id: number): Promise<void> => {
    try {
      await InvoiceItemsService.deleteInvoiceItem(id);
    } catch (error: any) {
      console.error('Error deleting invoice item:', error);
      throw error;
    }
  }, []);

  return (
    <InvoicesContext.Provider
      value={{
        invoices,
        isLoading,
        getInvoiceById,
        refreshInvoices,
        extractInvoice,
        finalizeInvoice,
        getInvoiceItems,
        createInvoiceItem,
        updateInvoiceItem,
        deleteInvoiceItem,
      }}
    >
      {children}
    </InvoicesContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
}
