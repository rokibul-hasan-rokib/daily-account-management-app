/**
 * Company Context
 * Manages company state and switching for multi-tenant support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { CompaniesService } from '@/services/api';
import { Company } from '@/services/api/types';

const STORAGE_KEY = 'selected_company_id';
const CACHE_KEY = 'companies_cache';
const CACHE_EXPIRY_KEY = 'companies_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web';

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  loadCompanies: () => Promise<void>;
  switchCompany: (companyId: number) => Promise<void>;
  refreshCurrentCompany: () => Promise<void>;
  clearCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Storage helpers
  const getStoredCompanyId = async (): Promise<number | null> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseInt(stored, 10) : null;
      } else {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        return stored ? parseInt(stored, 10) : null;
      }
    } catch (error) {
      console.warn('Error getting stored company ID:', error);
      return null;
    }
  };

  const setStoredCompanyId = async (companyId: number | null): Promise<void> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        if (companyId) {
          localStorage.setItem(STORAGE_KEY, companyId.toString());
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        if (companyId) {
          await SecureStore.setItemAsync(STORAGE_KEY, companyId.toString());
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Error storing company ID:', error);
    }
  };

  const getCachedCompanies = async (): Promise<Company[] | null> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (cached && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            return JSON.parse(cached);
          }
        }
      } else {
        const cached = await SecureStore.getItemAsync(CACHE_KEY);
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
      console.warn('Error getting cached companies:', error);
      return null;
    }
  };

  const setCachedCompanies = async (companies: Company[]): Promise<void> => {
    try {
      const expiry = (Date.now() + CACHE_DURATION).toString();
      const data = JSON.stringify(companies);
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_KEY, data);
        localStorage.setItem(CACHE_EXPIRY_KEY, expiry);
      } else {
        await SecureStore.setItemAsync(CACHE_KEY, data);
        await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry);
      }
    } catch (error) {
      console.warn('Error caching companies:', error);
    }
  };

  const clearCachedCompanies = async (): Promise<void> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
      } else {
        await SecureStore.deleteItemAsync(CACHE_KEY);
        await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
      }
    } catch (error) {
      console.warn('Error clearing cached companies:', error);
    }
  };

  // Load company details with stats
  const loadCompanyDetails = useCallback(async (companyId: number) => {
    try {
      // Try to get company from list first (faster)
      const existingCompany = companies.find(c => c.id === companyId);
      if (existingCompany && !existingCompany.stats) {
        // We have basic info but need details with stats
        const company = await CompaniesService.getCompanyDetails(companyId);
        setCurrentCompany(company);
        await setStoredCompanyId(companyId);
        // Update in companies list
        setCompanies(prev => prev.map(c => c.id === companyId ? company : c));
      } else if (existingCompany) {
        // Already have full details
        setCurrentCompany(existingCompany);
        await setStoredCompanyId(companyId);
      } else {
        // Company not in list, fetch it
        const company = await CompaniesService.getCompanyDetails(companyId);
        setCurrentCompany(company);
        await setStoredCompanyId(companyId);
        // Add to companies list if not already there
        setCompanies(prev => {
          const exists = prev.find(c => c.id === companyId);
          if (!exists) {
            return [...prev, company];
          }
          return prev.map(c => c.id === companyId ? company : c);
        });
      }
    } catch (error) {
      console.error('Error loading company details:', error);
      // Fallback to basic company info
      const existingCompany = companies.find(c => c.id === companyId);
      if (existingCompany) {
        setCurrentCompany(existingCompany);
        await setStoredCompanyId(companyId);
      }
    }
  }, [companies]);

  // Load companies from API
  const loadCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Show cached data immediately for better UX
      const cached = await getCachedCompanies();
      if (cached && cached.length > 0) {
        setCompanies(cached);
        setIsSuperAdmin(cached.length > 1);
      }

      // Always fetch fresh data from API
      const response = await CompaniesService.getCompanies();
      const fetchedCompanies = response.results || [];
      
      setCompanies(fetchedCompanies);
      await setCachedCompanies(fetchedCompanies);
      
      // Determine if super admin (can see multiple companies)
      setIsSuperAdmin(fetchedCompanies.length > 1);

      // Load current company (don't await to avoid blocking)
      const storedId = await getStoredCompanyId();
      if (storedId) {
        const company = fetchedCompanies.find(c => c.id === storedId);
        if (company) {
          // Load details in background, don't block
          loadCompanyDetails(company.id).catch(err => {
            console.error('Error loading company details:', err);
          });
        } else if (fetchedCompanies.length > 0) {
          // Stored company not found, select first one
          loadCompanyDetails(fetchedCompanies[0].id).catch(err => {
            console.error('Error loading company details:', err);
          });
        } else {
          setCurrentCompany(null);
        }
      } else if (fetchedCompanies.length === 1) {
        // Only one company, select it automatically
        loadCompanyDetails(fetchedCompanies[0].id).catch(err => {
          console.error('Error loading company details:', err);
        });
      } else if (fetchedCompanies.length > 1) {
        // Multiple companies but no selection - select first one
        loadCompanyDetails(fetchedCompanies[0].id).catch(err => {
          console.error('Error loading company details:', err);
        });
      } else if (fetchedCompanies.length === 0) {
        // No companies found
        setCurrentCompany(null);
      }
    } catch (error: any) {
      console.error('Error loading companies:', error);
      // If API fails, try cache
      const cached = await getCachedCompanies();
      if (cached && cached.length > 0) {
        setCompanies(cached);
        setIsSuperAdmin(cached.length > 1);
        const storedId = await getStoredCompanyId();
        if (storedId) {
          const company = cached.find(c => c.id === storedId);
          if (company) {
            setCurrentCompany(company);
          } else if (cached.length === 1) {
            setCurrentCompany(cached[0]);
          }
        } else if (cached.length === 1) {
          setCurrentCompany(cached[0]);
        }
      } else {
        // No cache, clear everything
        setCompanies([]);
        setCurrentCompany(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadCompanyDetails]);

  // Switch to a different company
  const switchCompany = useCallback(async (companyId: number) => {
    try {
      setIsLoading(true);
      await loadCompanyDetails(companyId);
      // Clear cache to force refresh of other contexts
      await clearCachedCompanies();
    } catch (error: any) {
      console.error('Error switching company:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh current company data
  const refreshCurrentCompany = useCallback(async () => {
    if (currentCompany) {
      await loadCompanyDetails(currentCompany.id);
    }
  }, [currentCompany]);

  // Clear all company data
  const clearCompanies = useCallback(async () => {
    setCompanies([]);
    setCurrentCompany(null);
    setIsSuperAdmin(false);
    await setStoredCompanyId(null);
    await clearCachedCompanies();
  }, []);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        isLoading,
        isSuperAdmin,
        loadCompanies,
        switchCompany,
        refreshCurrentCompany,
        clearCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}