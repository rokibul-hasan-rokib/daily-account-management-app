/**
 * API Configuration
 * Base URL and configuration for API requests
 */

import { Platform } from 'react-native';

/**
 * Get the default API base URL based on platform and connection type
 * - Android Emulator (local): Use 10.0.2.2 to access host machine's localhost
 * - Network connection (Expo Go/dev build over network): Use network IP
 * - iOS Simulator: Use localhost (same as host)
 * - Web: Use localhost
 * - Physical Device: Use network IP (set via EXPO_PUBLIC_API_URL)
 */
const getDefaultBaseURL = (): string => {
  // If environment variable is set, use it (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Platform-specific defaults
  if (Platform.OS === 'android') {
    // Default to network IP for Expo Go / network dev builds
    // If using local Android emulator, change to 'http://10.0.2.2:5000/api'
    // Or set EXPO_PUBLIC_API_URL environment variable
    return 'http://192.168.0.193:5000/api';
  } else if (Platform.OS === 'ios') {
    // iOS Simulator can use localhost
    return 'http://localhost:5000/api';
  } else {
    // Web platform
    return 'http://localhost:5000/api';
  }
};

export const API_CONFIG = {
  BASE_URL: getDefaultBaseURL(),
  TIMEOUT: 30000, // 30 seconds
};

/**
 * Helper function to build query string from parameters
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Helper function to ensure trailing slash for Django URLs
 */
const ensureTrailingSlash = (url: string): string => {
  // If URL has query params, add trailing slash before query string
  if (url.includes('?')) {
    const [path, query] = url.split('?');
    return `${path.endsWith('/') ? path : path + '/'}?${query}`;
  }
  // Otherwise, just ensure trailing slash
  return url.endsWith('/') ? url : url + '/';
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    USER: '/auth/user/',
  },
  // Users
  USERS: {
    ME: '/users/me/',
    DETAIL: (id: number) => `/users/${id}/`,
  },
  // Categories
  CATEGORIES: {
    LIST: (params?: { type?: 'income' | 'expense'; search?: string; ordering?: string }) => {
      const query = buildQueryString(params || {});
      return `/categories${query}`;
    },
    CREATE: '/categories/',
    DETAIL: (id: number) => `/categories/${id}/`,
    UPDATE: (id: number) => `/categories/${id}/`,
    DELETE: (id: number) => `/categories/${id}/`,
  },
  // Merchants
  MERCHANTS: {
    LIST: (params?: { search?: string; ordering?: string }) => {
      const query = buildQueryString(params || {});
      return `/merchants${query}`;
    },
    CREATE: '/merchants/',
    DETAIL: (id: number) => `/merchants/${id}/`,
    UPDATE: (id: number) => `/merchants/${id}/`,
    DELETE: (id: number) => `/merchants/${id}/`,
  },
  // Transactions
  TRANSACTIONS: {
    LIST: (params?: {
      type?: 'income' | 'expense';
      category?: number;
      start_date?: string;
      end_date?: string;
      search?: string;
      ordering?: string;
      page?: number;
    }) => {
      const query = buildQueryString(params || {});
      return `/transactions${query}`;
    },
    CREATE: '/transactions/',
    DETAIL: (id: number) => `/transactions/${id}/`,
    UPDATE: (id: number) => `/transactions/${id}/`,
    DELETE: (id: number) => `/transactions/${id}/`,
  },
  // Receipts
  RECEIPTS: {
    LIST: (params?: { search?: string; ordering?: string }) => {
      const query = buildQueryString(params || {});
      const url = `/receipts${query}`;
      return ensureTrailingSlash(url);
    },
    CREATE: '/receipts/',
    UPLOAD: ensureTrailingSlash('/receipts/upload'),
    DETAIL: (id: number) => `/receipts/${id}/`,
    UPDATE: (id: number) => `/receipts/${id}/`,
    DELETE: (id: number) => `/receipts/${id}/`,
    EXTRACT: (id: number) => `/receipts/${id}/extract/`,
  },
  // Receipt Items
  RECEIPT_ITEMS: {
    LIST: (params?: {
      search?: string;
      start_date?: string;
      end_date?: string;
      ordering?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/receipt-items${query}`;
    },
    CREATE: '/receipt-items/',
    DETAIL: (id: number) => `/receipt-items/${id}/`,
    UPDATE: (id: number) => `/receipt-items/${id}/`,
    DELETE: (id: number) => `/receipt-items/${id}/`,
    ANALYTICS: (params?: {
      search?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/receipt-items/analytics${query}`;
    },
  },
  // Liabilities (Bills)
  LIABILITIES: {
    LIST: (params?: {
      status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
      search?: string;
      ordering?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/liabilities${query}`;
    },
    CREATE: '/liabilities/',
    DETAIL: (id: number) => `/liabilities/${id}/`,
    UPDATE: (id: number) => `/liabilities/${id}/`,
    DELETE: (id: number) => `/liabilities/${id}/`,
    MARK_PAID: (id: number) => `/liabilities/${id}/mark_paid/`,
  },
  // Rules
  RULES: {
    LIST: (params?: { ordering?: string }) => {
      const query = buildQueryString(params || {});
      return `/rules${query}`;
    },
    CREATE: '/rules/',
    DETAIL: (id: number) => `/rules/${id}/`,
    UPDATE: (id: number) => `/rules/${id}/`,
    DELETE: (id: number) => `/rules/${id}/`,
  },
  // Budgets
  BUDGETS: {
    LIST: (params?: { ordering?: string }) => {
      const query = buildQueryString(params || {});
      return `/budgets${query}`;
    },
    CREATE: '/budgets/',
    DETAIL: (id: number) => `/budgets/${id}/`,
    UPDATE: (id: number) => `/budgets/${id}/`,
    DELETE: (id: number) => `/budgets/${id}/`,
  },
  // Alerts
  ALERTS: {
    LIST: (params?: {
      type?: string;
      is_read?: boolean;
      ordering?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/alerts${query}`;
    },
    DETAIL: (id: number) => `/alerts/${id}/`,
    MARK_READ: (id: number) => `/alerts/${id}/mark_read/`,
    MARK_ALL_READ: '/alerts/mark_all_read/',
    GENERATE: '/alerts/generate/',
  },
  // Profile
  PROFILE: {
    ME: '/profile/me/',
    UPDATE: '/profile/me/',
  },
  // Dashboard & Analytics
  DASHBOARD: {
    SUMMARY: (params?: {
      range?: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
      start_date?: string;
      end_date?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/dashboard${query}`;
    },
  },
  PROFIT_LOSS: {
    SUMMARY: (params?: {
      range?: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
      start_date?: string;
      end_date?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/profit-loss${query}`;
    },
  },
  SUMMARIES: {
    SUMMARY: (params?: {
      range?: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
      start_date?: string;
      end_date?: string;
    }) => {
      const query = buildQueryString(params || {});
      return `/summaries${query}`;
    },
  },
};
