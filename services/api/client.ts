/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_CONFIG } from './config';

const TOKEN_KEY = 'auth_token';
// Check if we're on web platform
const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof localStorage !== 'undefined');

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token and handle FormData
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Token ${token}`;
        }
        
        // If FormData is being sent, remove Content-Type header
        // to let axios/browser set it automatically with boundary
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }
        
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          await this.clearToken();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      let message = data?.error || data?.detail || data?.message || error.message;
      
      // Check if response is HTML (Django debug error page)
      if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
        // Try to extract error message from HTML
        const htmlString = data as string;
        
        // Check for DisallowedHost error
        if (htmlString.includes('DisallowedHost') || htmlString.includes('ALLOWED_HOSTS')) {
          const hostMatch = htmlString.match(/add ['"]([^'"]+)['"] to ALLOWED_HOSTS/i);
          const host = hostMatch ? hostMatch[1] : '192.168.0.193';
          message = `Django server configuration error: The IP address '${host}' needs to be added to ALLOWED_HOSTS in your Django settings.py file. Please add '${host}' to the ALLOWED_HOSTS list and restart your Django server.`;
        } else {
          // Try to extract exception value from HTML
          const exceptionMatch = htmlString.match(/<pre class="exception_value">([^<]+)<\/pre>/i);
          if (exceptionMatch) {
            message = `Server error: ${exceptionMatch[1].trim()}`;
          } else {
            message = 'Server returned an error. Check your Django server configuration.';
          }
        }
      }
      
      const errorObj = new Error(message || 'An error occurred');
      // Preserve response data for better error handling
      (errorObj as any).response = error.response;
      return errorObj;
    } else if (error.request) {
      // Request made but no response received - check if server is reachable
      const message = `Cannot connect to server at ${API_CONFIG.BASE_URL}. Make sure your Django server is running and accessible.`;
      return new Error(message);
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Token management
  async setToken(token: string): Promise<void> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        // Use localStorage for web
        localStorage.setItem(TOKEN_KEY, token);
        console.log('ApiClient: Token stored in localStorage');
      } else if (!isWeb) {
        // Use SecureStore for native platforms
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        console.log('ApiClient: Token stored in SecureStore');
      } else {
        console.warn('ApiClient: No storage available - token not persisted');
      }
    } catch (error: any) {
      console.error('ApiClient: Error storing token (non-critical):', error);
      // Don't throw - allow login to proceed even if storage fails
      // Token will still be available in the response and can be used for API calls
      // Just log the error but don't fail the login process
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        // Use localStorage for web
        return localStorage.getItem(TOKEN_KEY);
      } else {
        // Use SecureStore for native platforms
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.warn('Error getting token:', error);
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        // Use localStorage for web
        localStorage.removeItem(TOKEN_KEY);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      // Ignore errors
      console.warn('Error clearing token:', error);
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log('ApiClient: POST request to:', url);
      console.log('ApiClient: Request data:', data);
      const response = await this.client.post<T>(url, data, config);
      console.log('ApiClient: Response status:', response.status);
      console.log('ApiClient: Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ApiClient: POST error:', error);
      console.error('ApiClient: Error response:', error.response?.data);
      console.error('ApiClient: Error status:', error.response?.status);
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // For file uploads (FormData)
  async postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    // Ensure trailing slash for Django URLs (Django REST framework requires it)
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    
    // Don't set Content-Type header - let axios set it automatically with boundary
    // Setting it manually prevents axios from adding the boundary parameter
    // The interceptor will handle removing Content-Type for FormData
    const response = await this.client.post<T>(normalizedUrl, formData, {
      ...config,
      headers: {
        ...config?.headers,
        // Explicitly remove Content-Type to let axios handle it
        'Content-Type': undefined,
      },
    });
    return response.data;
  }

  // Get the underlying axios instance if needed
  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
