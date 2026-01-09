/**
 * API Configuration
 * Base URL and configuration for API requests
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000/api',
  TIMEOUT: 30000, // 30 seconds
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
    LIST: '/categories/',
    DETAIL: (id: number) => `/categories/${id}/`,
  },
  // Merchants
  MERCHANTS: {
    LIST: '/merchants/',
    DETAIL: (id: number) => `/merchants/${id}/`,
  },
  // Transactions vinchi 
  TRANSACTIONS: {
    LIST: '/transactions/',
    DETAIL: (id: number) => `/transactions/${id}/`,
  },
  // Receipts
  RECEIPTS: {
    LIST: '/receipts/',
    DETAIL: (id: number) => `/receipts/${id}/`,
    EXTRACT: (id: number) => `/receipts/${id}/extract/`,
  },
  // Receipt Items
  RECEIPT_ITEMS: {
    LIST: '/receipt-items/',
    ANALYTICS: '/receipt-items/analytics/',
  },
  // Liabilities (Bills)
  LIABILITIES: {
    LIST: '/liabilities/',
    DETAIL: (id: number) => `/liabilities/${id}/`,
    MARK_PAID: (id: number) => `/liabilities/${id}/mark_paid/`,
  },
  // Rules
  RULES: {
    LIST: '/rules/',
    DETAIL: (id: number) => `/rules/${id}/`,
  },
  // Budgets
  BUDGETS: {
    LIST: '/budgets/',
    DETAIL: (id: number) => `/budgets/${id}/`,
  },
  // Alerts
  ALERTS: {
    LIST: '/alerts/',
    DETAIL: (id: number) => `/alerts/${id}/`,
    MARK_READ: (id: number) => `/alerts/${id}/mark_read/`,
    MARK_ALL_READ: '/alerts/mark_all_read/',
    GENERATE: '/alerts/generate/',
  },
  // Profile
  PROFILE: {
    ME: '/profile/me/',
  },
  // Dashboard & Analytics
  DASHBOARD: {
    SUMMARY: '/dashboard/',
  },
  PROFIT_LOSS: {
    SUMMARY: '/profit-loss/',
  },
  SUMMARIES: {
    SUMMARY: '/summaries/',
  },
};
