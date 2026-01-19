/**
 * Roles Context
 * Manages roles and permissions state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { RolesService, PermissionsService } from '@/services/api';
import { Role, RoleRequest, Permission } from '@/services/api/types';
import { useCompany } from './company-context';

const ROLES_STORAGE_KEY = 'roles_cache';
const ROLES_CACHE_EXPIRY_KEY = 'roles_cache_expiry';
const PERMISSIONS_STORAGE_KEY = 'permissions_cache';
const PERMISSIONS_CACHE_EXPIRY_KEY = 'permissions_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isWeb = Platform.OS === 'web';

interface RolesContextType {
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  loadRoles: () => Promise<void>;
  loadPermissions: () => Promise<void>;
  createRole: (data: RoleRequest) => Promise<Role>;
  updateRole: (id: number, data: Partial<RoleRequest>) => Promise<Role>;
  deleteRole: (id: number) => Promise<void>;
  clearRoles: () => Promise<void>;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

export function RolesProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentCompany } = useCompany();

  const getStoredRoles = async (): Promise<Role[] | null> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(ROLES_STORAGE_KEY);
        const expiry = localStorage.getItem(ROLES_CACHE_EXPIRY_KEY);
        if (cached && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            return JSON.parse(cached);
          }
        }
      } else {
        const cached = await SecureStore.getItemAsync(ROLES_STORAGE_KEY);
        const expiry = await SecureStore.getItemAsync(ROLES_CACHE_EXPIRY_KEY);
        if (cached && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            return JSON.parse(cached);
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Error getting cached roles:', error);
      return null;
    }
  };

  const storeRoles = async (roles: Role[]): Promise<void> => {
    try {
      const expiry = (Date.now() + CACHE_DURATION).toString();
      const data = JSON.stringify(roles);
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(ROLES_STORAGE_KEY, data);
        localStorage.setItem(ROLES_CACHE_EXPIRY_KEY, expiry);
      } else {
        await SecureStore.setItemAsync(ROLES_STORAGE_KEY, data);
        await SecureStore.setItemAsync(ROLES_CACHE_EXPIRY_KEY, expiry);
      }
    } catch (error) {
      console.warn('Error storing roles:', error);
    }
  };

  const getStoredPermissions = async (): Promise<Permission[] | null> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
        const expiry = localStorage.getItem(PERMISSIONS_CACHE_EXPIRY_KEY);
        if (cached && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            return JSON.parse(cached);
          }
        }
      } else {
        const cached = await SecureStore.getItemAsync(PERMISSIONS_STORAGE_KEY);
        const expiry = await SecureStore.getItemAsync(PERMISSIONS_CACHE_EXPIRY_KEY);
        if (cached && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            return JSON.parse(cached);
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Error getting cached permissions:', error);
      return null;
    }
  };

  const storePermissions = async (permissions: Permission[]): Promise<void> => {
    try {
      const expiry = (Date.now() + CACHE_DURATION).toString();
      const data = JSON.stringify(permissions);
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, data);
        localStorage.setItem(PERMISSIONS_CACHE_EXPIRY_KEY, expiry);
      } else {
        await SecureStore.setItemAsync(PERMISSIONS_STORAGE_KEY, data);
        await SecureStore.setItemAsync(PERMISSIONS_CACHE_EXPIRY_KEY, expiry);
      }
    } catch (error) {
      console.warn('Error storing permissions:', error);
    }
  };

  const clearCachedRoles = async (): Promise<void> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.removeItem(ROLES_STORAGE_KEY);
        localStorage.removeItem(ROLES_CACHE_EXPIRY_KEY);
      } else {
        await SecureStore.deleteItemAsync(ROLES_STORAGE_KEY);
        await SecureStore.deleteItemAsync(ROLES_CACHE_EXPIRY_KEY);
      }
    } catch (error) {
      console.warn('Error clearing cached roles:', error);
    }
  };

  const loadRoles = useCallback(async (params?: { search?: string; ordering?: string }) => {
    if (!currentCompany) return;

    try {
      setIsLoading(true);
      
      // Try cache first
      const cached = await getStoredRoles();
      if (cached && cached.length >= 0 && !params?.search) {
        setRoles(cached);
      }

      // Fetch from API
      const response = await RolesService.getRoles(params);
      const fetchedRoles = response.results || [];
      
      setRoles(fetchedRoles);
      if (!params?.search) {
        await storeRoles(fetchedRoles);
      }
    } catch (error: any) {
      console.error('Error loading roles:', error);
      // If API fails, try cache
      const cached = await getStoredRoles();
      if (cached && !params?.search) {
        setRoles(cached);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany]);

  const loadPermissions = useCallback(async () => {
    try {
      // Try cache first
      const cached = await getStoredPermissions();
      if (cached && cached.length >= 0) {
        setPermissions(cached);
      }

      // Fetch from API
      const response = await PermissionsService.getPermissions();
      const fetchedPermissions = response.results || [];
      
      setPermissions(fetchedPermissions);
      await storePermissions(fetchedPermissions);
    } catch (error: any) {
      console.error('Error loading permissions:', error);
      // If API fails, try cache
      const cached = await getStoredPermissions();
      if (cached) {
        setPermissions(cached);
      }
    }
  }, []);

  const createRole = useCallback(async (data: RoleRequest): Promise<Role> => {
    const newRole = await RolesService.createRole(data);
    setRoles(prev => [...prev, newRole]);
    await clearCachedRoles();
    return newRole;
  }, []);

  const updateRole = useCallback(async (id: number, data: Partial<RoleRequest>): Promise<Role> => {
    const updatedRole = await RolesService.updateRole(id, data);
    setRoles(prev => prev.map(r => r.id === id ? updatedRole : r));
    await clearCachedRoles();
    return updatedRole;
  }, []);

  const deleteRole = useCallback(async (id: number): Promise<void> => {
    // Check if role is system role before attempting deletion
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete?.is_system) {
      throw new Error('System roles cannot be deleted');
    }
    
    await RolesService.deleteRole(id);
    setRoles(prev => prev.filter(r => r.id !== id));
    await clearCachedRoles();
  }, [roles]);

  const clearRoles = useCallback(async () => {
    setRoles([]);
    setPermissions([]);
    await clearCachedRoles();
  }, []);

  // Load roles when company changes
  useEffect(() => {
    if (currentCompany) {
      loadRoles();
      loadPermissions();
    } else {
      setRoles([]);
    }
  }, [currentCompany, loadRoles, loadPermissions]);

  return (
    <RolesContext.Provider
      value={{
        roles,
        permissions,
        isLoading,
        loadRoles,
        loadPermissions,
        createRole,
        updateRole,
        deleteRole,
        clearRoles,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
}

export function useRoles() {
  const context = useContext(RolesContext);
  if (context === undefined) {
    throw new Error('useRoles must be used within a RolesProvider');
  }
  return context;
}