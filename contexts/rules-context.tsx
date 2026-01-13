/**
 * Rules Context
 * Manages category rules state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RulesService } from '@/services/api';
import { CategoryRule, CategoryRuleListParams } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface RulesContextType {
  rules: CategoryRule[];
  isLoading: boolean;
  getRuleById: (id: number) => CategoryRule | undefined;
  refreshRules: (params?: CategoryRuleListParams) => Promise<void>;
  createRule: (data: {
    merchant?: number;
    keyword?: string;
    category: number;
    priority?: number;
  }) => Promise<CategoryRule>;
  updateRule: (id: number, data: Partial<{
    merchant?: number;
    keyword?: string;
    category?: number;
    priority?: number;
  }>) => Promise<CategoryRule>;
  deleteRule: (id: number) => Promise<void>;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

const STORAGE_KEY = 'rules_cache';
const CACHE_EXPIRY_KEY = 'rules_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredRules(): Promise<CategoryRule[] | null> {
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
    console.warn('Error reading cached rules:', error);
    return null;
  }
}

async function storeRules(rules: CategoryRule[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(rules);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached rules:', error);
    // Non-critical error, continue without cache
  }
}

async function clearCachedRules(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached rules:', error);
  }
}

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load rules on mount
  useEffect(() => {
    refreshRules();
  }, []);

  const refreshRules = useCallback(async (params?: CategoryRuleListParams) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cached = await getStoredRules();
      if (cached) {
        setRules(cached);
        setIsLoading(false);
      }

      // Fetch from API
      const response = await RulesService.getRules(params);
      const rulesList = Array.isArray(response) ? response : response.results;
      
      setRules(rulesList);
      await storeRules(rulesList);
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      // Keep cached data if available
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRuleById = useCallback((id: number): CategoryRule | undefined => {
    return rules.find(r => r.id === id);
  }, [rules]);

  const createRule = useCallback(async (data: {
    merchant?: number;
    keyword?: string;
    category: number;
    priority?: number;
  }): Promise<CategoryRule> => {
    try {
      const newRule = await RulesService.createRule(data);
      
      setRules(prev => [newRule, ...prev]);
      await clearCachedRules(); // Clear cache to force refresh
      
      return newRule;
    } catch (error: any) {
      console.error('Error creating rule:', error);
      throw error;
    }
  }, []);

  const updateRule = useCallback(async (
    id: number,
    data: Partial<{
      merchant?: number;
      keyword?: string;
      category?: number;
      priority?: number;
    }>
  ): Promise<CategoryRule> => {
    try {
      const updatedRule = await RulesService.updateRule(id, data);
      
      setRules(prev => prev.map(r => r.id === id ? updatedRule : r));
      await clearCachedRules(); // Clear cache to force refresh
      
      return updatedRule;
    } catch (error: any) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }, []);

  const deleteRule = useCallback(async (id: number): Promise<void> => {
    try {
      await RulesService.deleteRule(id);
      
      setRules(prev => prev.filter(r => r.id !== id));
      await clearCachedRules(); // Clear cache to force refresh
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  }, []);

  return (
    <RulesContext.Provider
      value={{
        rules,
        isLoading,
        getRuleById,
        refreshRules,
        createRule,
        updateRule,
        deleteRule,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
}
