/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
} from './types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    // Store token after successful registration
    if (response.token) {
      await apiClient.setToken(response.token);
    }
    
    return response;
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    
    // Store token after successful login
    if (response.token) {
      await apiClient.setToken(response.token);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await apiClient.clearToken();
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.AUTH.USER);
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getToken();
    return !!token;
  }

  /**
   * Get stored auth token
   */
  static async getToken(): Promise<string | null> {
    return await apiClient.getToken();
  }

  /**
   * Clear auth token
   */
  static async clearToken(): Promise<void> {
    return await apiClient.clearToken();
  }
}
