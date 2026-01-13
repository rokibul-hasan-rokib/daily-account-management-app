/**
 * Transactions Context
 * Manages transactions state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TransactionsService } from '@/services/api';
import { Transaction, TransactionListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface TransactionsContextType {
  transactions: Transaction[];
  isLoading: boolean;
  getTransactionById: (id: number) => Transaction | undefined;
  refreshTransactions: (params?: TransactionListParams) => Promise<void>;
  createTransaction: (data: {
    type: 'income' | 'expense';
    amount: string;
    date: string;
    category: number;
    merchant?: number;
    description?: string;
    notes?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }) => Promise<Transaction>;
  updateTransaction: (id: number, data: Partial<{
    type: 'income' | 'expense';
    amount: string;
    date: string;
    category: number;
    merchant?: number;
    description?: string;
    notes?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }>) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const STORAGE_KEY = 'transactions_cache';
const CACHE_EXPIRY_KEY = 'transactions_cache_expiry';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter cache for transactions)

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredTransactions(): Promise<Transaction[] | null> {
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
    console.warn('Error reading cached transactions:', error);
    return null;
  }
}

async function storeTransactions(transactions: Transaction[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(transactions);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached transactions:', error);
  }
}

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastParams, setLastParams] = useState<TransactionListParams | undefined>();

  const loadTransactions = useCallback(async (params?: TransactionListParams, useCache = true) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first (only if same params)
      if (useCache && params === lastParams) {
        const cached = await getStoredTransactions();
        if (cached && cached.length > 0) {
          setTransactions(cached);
          setIsLoading(false);
          
          // Refresh in background
          refreshTransactionsFromAPI(params);
          return;
        }
      }
      
      // Load from API
      await refreshTransactionsFromAPI(params);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      // Try to use cached data if API fails
      const cached = await getStoredTransactions();
      if (cached) {
        setTransactions(cached);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lastParams]);

  const refreshTransactionsFromAPI = async (params?: TransactionListParams) => {
    try {
      const response = await TransactionsService.getTransactions(params);
      const transactionsList = Array.isArray(response) ? response : response.results;
      setTransactions(transactionsList);
      setLastParams(params);
      await storeTransactions(transactionsList);
    } catch (error) {
      throw error;
    }
  };

  const refreshTransactions = useCallback(async (params?: TransactionListParams) => {
    await loadTransactions(params, false); // Force refresh from API
  }, [loadTransactions]);

  const getTransactionById = useCallback((id: number): Transaction | undefined => {
    return transactions.find(transaction => transaction.id === id);
  }, [transactions]);

  const createTransaction = useCallback(async (data: {
    type: 'income' | 'expense';
    amount: string;
    date: string;
    category: number;
    merchant?: number;
    description?: string;
    notes?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }): Promise<Transaction> => {
    const newTransaction = await TransactionsService.createTransaction(data);
    setTransactions(prev => [newTransaction, ...prev]);
    const updatedTransactions = [newTransaction, ...transactions];
    await storeTransactions(updatedTransactions);
    return newTransaction;
  }, [transactions]);

  const updateTransaction = useCallback(async (id: number, data: Partial<{
    type: 'income' | 'expense';
    amount: string;
    date: string;
    category: number;
    merchant?: number;
    description?: string;
    notes?: string;
    is_recurring?: boolean;
    recurring_frequency?: string;
  }>): Promise<Transaction> => {
    const updatedTransaction = await TransactionsService.updateTransaction(id, data);
    setTransactions(prev => prev.map(transaction => transaction.id === id ? updatedTransaction : transaction));
    const updatedTransactions = transactions.map(transaction => transaction.id === id ? updatedTransaction : transaction);
    await storeTransactions(updatedTransactions);
    return updatedTransaction;
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: number): Promise<void> => {
    await TransactionsService.deleteTransaction(id);
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    await storeTransactions(updatedTransactions);
  }, [transactions]);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        isLoading,
        getTransactionById,
        refreshTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
