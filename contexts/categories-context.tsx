/**
 * Categories Context
 * Manages categories state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CategoriesService } from '@/services/api';
import { Category } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface CategoriesContextType {
  categories: Category[];
  isLoading: boolean;
  incomeCategories: Category[];
  expenseCategories: Category[];
  getCategoryById: (id: number) => Category | undefined;
  refreshCategories: () => Promise<void>;
  createCategory: (data: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    description?: string;
  }) => Promise<Category>;
  updateCategory: (id: number, data: Partial<{
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    description?: string;
  }>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const STORAGE_KEY = 'categories_cache';
const CACHE_EXPIRY_KEY = 'categories_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredCategories(): Promise<Category[] | null> {
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
    console.warn('Error reading cached categories:', error);
    return null;
  }
}

async function storeCategories(categories: Category[]): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(categories);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached categories:', error);
    // Non-critical error, continue without cache
  }
}

async function clearCachedCategories(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached categories:', error);
  }
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const loadCategories = useCallback(async (useCache = true) => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      if (useCache) {
        const cached = await getStoredCategories();
        if (cached && cached.length > 0) {
          setCategories(cached);
          setIsLoading(false);
          
          // Refresh in background
          refreshCategoriesFromAPI();
          return;
        }
      }
      
      // Load from API
      await refreshCategoriesFromAPI();
    } catch (error: any) {
      console.error('Error loading categories:', error);
      // Try to use cached data if API fails
      const cached = await getStoredCategories();
      if (cached) {
        setCategories(cached);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCategoriesFromAPI = async () => {
    try {
      const response = await CategoriesService.getCategories();
      const categoriesList = Array.isArray(response) ? response : response.results;
      setCategories(categoriesList);
      await storeCategories(categoriesList);
    } catch (error) {
      throw error;
    }
  };

  const refreshCategories = useCallback(async () => {
    await loadCategories(false); // Force refresh from API
  }, [loadCategories]);

  const getCategoryById = useCallback((id: number): Category | undefined => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const createCategory = useCallback(async (data: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    description?: string;
  }): Promise<Category> => {
    const newCategory = await CategoriesService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
    await storeCategories([...categories, newCategory]);
    return newCategory;
  }, [categories]);

  const updateCategory = useCallback(async (id: number, data: Partial<{
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    description?: string;
  }>): Promise<Category> => {
    const updatedCategory = await CategoriesService.updateCategory(id, data);
    setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
    const updatedCategories = categories.map(cat => cat.id === id ? updatedCategory : cat);
    await storeCategories(updatedCategories);
    return updatedCategory;
  }, [categories]);

  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    await CategoriesService.deleteCategory(id);
    setCategories(prev => prev.filter(cat => cat.id !== id));
    const updatedCategories = categories.filter(cat => cat.id !== id);
    await storeCategories(updatedCategories);
  }, [categories]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        isLoading,
        incomeCategories,
        expenseCategories,
        getCategoryById,
        refreshCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
