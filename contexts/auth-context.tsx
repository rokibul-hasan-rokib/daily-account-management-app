/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/api';
import { User } from '@/services/api/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      // Not authenticated or token expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('AuthContext: Calling AuthService.login...');
      const response = await AuthService.login({ username, password });
      console.log('AuthContext: Login response received:', response);
      
      if (response && response.user) {
        setUser(response.user);
        console.log('AuthContext: User state updated');
      } else {
        console.warn('AuthContext: Response missing user data:', response);
        // Try to get user from API
        try {
          const user = await AuthService.getCurrentUser();
          setUser(user);
          console.log('AuthContext: User fetched from API');
        } catch (err) {
          console.error('AuthContext: Failed to fetch user:', err);
          throw new Error('Login successful but failed to get user data');
        }
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
  }) => {
    try {
      console.log('AuthContext: Calling AuthService.register...');
      const response = await AuthService.register(data);
      console.log('AuthContext: Register response received:', response);
      
      if (response && response.user) {
        setUser(response.user);
        console.log('AuthContext: User state updated');
      } else {
        console.warn('AuthContext: Response missing user data:', response);
        // Try to get user from API
        try {
          const user = await AuthService.getCurrentUser();
          setUser(user);
          console.log('AuthContext: User fetched from API');
        } catch (err) {
          console.error('AuthContext: Failed to fetch user:', err);
          throw new Error('Registration successful but failed to get user data');
        }
      }
    } catch (error: any) {
      console.error('AuthContext: Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      // Clear user even if logout fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
