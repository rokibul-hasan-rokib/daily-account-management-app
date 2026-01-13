/**
 * Profile Context
 * Manages user profile state across the app with local caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProfileService } from '@/services/api';
import { UserProfile, UserProfileRequest } from '@/services/api/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UserProfileRequest) => Promise<UserProfile>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'profile_cache';
const CACHE_EXPIRY_KEY = 'profile_cache_expiry';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

async function getStoredProfile(): Promise<UserProfile | null> {
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
    console.warn('Error reading cached profile:', error);
    return null;
  }
}

async function storeProfile(profile: UserProfile): Promise<void> {
  try {
    const expiry = Date.now() + CACHE_DURATION;
    const data = JSON.stringify(profile);
    
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
      await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.warn('Error storing cached profile:', error);
    // Non-critical error, continue without cache
  }
}

async function clearCachedProfile(): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Error clearing cached profile:', error);
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    refreshProfile();
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cached = await getStoredProfile();
      if (cached) {
        setProfile(cached);
        setIsLoading(false);
      }

      // Fetch from API
      const profileData = await ProfileService.getProfile();
      
      setProfile(profileData);
      await storeProfile(profileData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Keep cached data if available
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UserProfileRequest): Promise<UserProfile> => {
    try {
      const updatedProfile = await ProfileService.updateProfile(data);
      
      setProfile(updatedProfile);
      await clearCachedProfile(); // Clear cache to force refresh
      
      return updatedProfile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
