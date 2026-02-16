/**
 * Budgets Context
 * Manages budgets state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BudgetsService } from '@/services/api';
import { Budget, BudgetRequest, BudgetListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface BudgetsContextType {
  budgets: Budget[];
  isLoading: boolean;
  getBudgetById: (id: number) => Budget | undefined;
  refreshBudgets: (params?: BudgetListParams) => Promise<void>;
  createBudget: (data: BudgetRequest) => Promise<Budget>;
  updateBudget: (id: number, data: Partial<BudgetRequest>) => Promise<Budget>;
  deleteBudget: (id: number) => Promise<void>;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

const STORAGE_KEY = 'budgets_cache';
const CACHE_EXPIRY_KEY = 'budgets_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredBudgets(): Promise<Budget[] | null> {
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
    console.warn('Error reading cached budgets:', error);
    return null;
  }
}

async function storeBudgets(budgets: Budget[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(budgets);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached budgets:', error);
  }
}

async function clearCachedBudgets(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached budgets:', error);
  }
}

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshBudgets();
  }, []);

  const refreshBudgets = useCallback(async (params?: BudgetListParams) => {
    try {
      setIsLoading(true);
      
      const cached = await getStoredBudgets();
      if (cached) {
        setBudgets(cached);
        setIsLoading(false);
      }

      const response = await BudgetsService.getBudgets(params);
      const budgetsList = Array.isArray(response) ? response : response.results;
      
      setBudgets(budgetsList);
      await storeBudgets(budgetsList);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBudgetById = useCallback((id: number): Budget | undefined => {
    return budgets.find(b => b.id === id);
  }, [budgets]);

  const createBudget = useCallback(async (data: BudgetRequest): Promise<Budget> => {
    try {
      const newBudget = await BudgetsService.createBudget(data);
      setBudgets(prev => [newBudget, ...prev]);
      await clearCachedBudgets();
      return newBudget;
    } catch (error: any) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }, []);

  const updateBudget = useCallback(async (id: number, data: Partial<BudgetRequest>): Promise<Budget> => {
    try {
      const updatedBudget = await BudgetsService.updateBudget(id, data);
      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
      await clearCachedBudgets();
      return updatedBudget;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }, []);

  const deleteBudget = useCallback(async (id: number): Promise<void> => {
    try {
      await BudgetsService.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      await clearCachedBudgets();
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }, []);

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        isLoading,
        getBudgetById,
        refreshBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return context;
}
