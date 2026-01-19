/**
 * Company Users Context
 * Manages company users state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { CompanyUsersService } from '@/services/api';
import { CompanyUser, CompanyUserRequest } from '@/services/api/types';
import { useCompany } from './company-context';

const STORAGE_KEY = 'company_users_cache';
const CACHE_EXPIRY_KEY = 'company_users_cache_expiry';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const isWeb = Platform.OS === 'web';

interface CompanyUsersContextType {
  companyUsers: CompanyUser[];
  isLoading: boolean;
  loadCompanyUsers: () => Promise<void>;
  createCompanyUser: (data: CompanyUserRequest) => Promise<CompanyUser>;
  updateCompanyUser: (id: number, data: Partial<CompanyUserRequest>) => Promise<CompanyUser>;
  deleteCompanyUser: (id: number) => Promise<void>;
  clearCompanyUsers: () => Promise<void>;
}

const CompanyUsersContext = createContext<CompanyUsersContextType | undefined>(undefined);

export function CompanyUsersProvider({ children }: { children: ReactNode }) {
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentCompany } = useCompany();

  const getStoredCompanyUsers = async (): Promise<CompanyUser[] | null> => {
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
      } else {
        const cached = await SecureStore.getItemAsync(STORAGE_KEY);
        const expiry = await SecureStore.getItemAsync(CACHE_EXPIRY_KEY);
        if (cached && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            return JSON.parse(cached);
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Error getting cached company users:', error);
      return null;
    }
  };

  const storeCompanyUsers = async (users: CompanyUser[]): Promise<void> => {
    try {
      const expiry = (Date.now() + CACHE_DURATION).toString();
      const data = JSON.stringify(users);
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, data);
        localStorage.setItem(CACHE_EXPIRY_KEY, expiry);
      } else {
        await SecureStore.setItemAsync(STORAGE_KEY, data);
        await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry);
      }
    } catch (error) {
      console.warn('Error storing company users:', error);
    }
  };

  const clearCachedCompanyUsers = async (): Promise<void> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
      }
    } catch (error) {
      console.warn('Error clearing cached company users:', error);
    }
  };

  const loadCompanyUsers = useCallback(async () => {
    if (!currentCompany) return;

    try {
      setIsLoading(true);
      
      // Try cache first
      const cached = await getStoredCompanyUsers();
      if (cached && cached.length >= 0) {
        setCompanyUsers(cached);
      }

      // Fetch from API
      const response = await CompanyUsersService.getCompanyUsers();
      const users = response.results || [];
      
      setCompanyUsers(users);
      await storeCompanyUsers(users);
    } catch (error: any) {
      console.error('Error loading company users:', error);
      // If API fails, try cache
      const cached = await getStoredCompanyUsers();
      if (cached) {
        setCompanyUsers(cached);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany]);

  const createCompanyUser = useCallback(async (data: CompanyUserRequest): Promise<CompanyUser> => {
    const newUser = await CompanyUsersService.createCompanyUser(data);
    setCompanyUsers(prev => [...prev, newUser]);
    await clearCachedCompanyUsers();
    return newUser;
  }, []);

  const updateCompanyUser = useCallback(async (id: number, data: Partial<CompanyUserRequest>): Promise<CompanyUser> => {
    const updatedUser = await CompanyUsersService.updateCompanyUser(id, data);
    setCompanyUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    await clearCachedCompanyUsers();
    return updatedUser;
  }, []);

  const deleteCompanyUser = useCallback(async (id: number): Promise<void> => {
    await CompanyUsersService.deleteCompanyUser(id);
    setCompanyUsers(prev => prev.filter(u => u.id !== id));
    await clearCachedCompanyUsers();
  }, []);

  const clearCompanyUsers = useCallback(async () => {
    setCompanyUsers([]);
    await clearCachedCompanyUsers();
  }, []);

  // Reload when company changes
  useEffect(() => {
    if (currentCompany) {
      loadCompanyUsers();
    } else {
      setCompanyUsers([]);
    }
  }, [currentCompany, loadCompanyUsers]);

  return (
    <CompanyUsersContext.Provider
      value={{
        companyUsers,
        isLoading,
        loadCompanyUsers,
        createCompanyUser,
        updateCompanyUser,
        deleteCompanyUser,
        clearCompanyUsers,
      }}
    >
      {children}
    </CompanyUsersContext.Provider>
  );
}

export function useCompanyUsers() {
  const context = useContext(CompanyUsersContext);
  if (context === undefined) {
    throw new Error('useCompanyUsers must be used within a CompanyUsersProvider');
  }
  return context;
}