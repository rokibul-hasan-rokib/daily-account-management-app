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
  private static extractToken(payload: any): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const directKeys = [
      'token',
      'access',
      'access_token',
      'auth_token',
      'key',
      'jwt',
    ];
    for (const key of directKeys) {
      const value = payload[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    if (payload.tokens && typeof payload.tokens === 'object') {
      const nestedToken =
        payload.tokens.access ||
        payload.tokens.access_token ||
        payload.tokens.token;
      if (typeof nestedToken === 'string' && nestedToken.trim()) {
        return nestedToken.trim();
      }
    }

    if (payload.data && typeof payload.data === 'object') {
      return this.extractToken(payload.data);
    }

    return null;
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    // Store token after successful registration - don't fail if storage fails
    const token = this.extractToken(response);
    if (token) {
      try {
        await apiClient.setToken(token);
        console.log('AuthService: Registration token stored successfully');
      } catch (storageError: any) {
        console.warn('AuthService: Token storage failed (non-critical):', storageError);
        // Continue - token is in response
      }
    }
    
    return response;
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('AuthService: Sending login request to:', API_ENDPOINTS.AUTH.LOGIN);
      console.log('AuthService: Login data:', { username: data.username, password: '***' });
      
      const response = await apiClient.getInstance().post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      
      console.log('AuthService: Login response received:', JSON.stringify(response?.data, null, 2));
      
      const responseData = response?.data ?? {};
      const tokenFromBody = this.extractToken(responseData);
      const headerAuth =
        response?.headers?.authorization ||
        response?.headers?.Authorization ||
        response?.headers?.['x-auth-token'];
      const tokenFromHeaders =
        typeof headerAuth === 'string' && headerAuth.trim()
          ? headerAuth.trim()
          : null;
      const token = tokenFromBody || tokenFromHeaders;
      
      if (!token) {
        console.warn('AuthService: No token found in response:', responseData);
        throw new Error('Login response missing authentication token');
      }
      
      // Store token first - don't fail login if storage fails
      try {
        await apiClient.setToken(token);
        console.log('AuthService: Token stored successfully');
      } catch (storageError: any) {
        console.warn('AuthService: Token storage failed (non-critical):', storageError);
        // Continue with login - token is in response, can be stored manually if needed
      }
      
      // Extract user data
      let user: User | undefined;
      if (responseData.user) {
        user = responseData.user;
      } else if (responseData.data?.user) {
        user = responseData.data.user;
      }
      
      // If no user in response, fetch it
      if (!user) {
        console.log('AuthService: Fetching user data...');
        try {
          user = await this.getCurrentUser();
        } catch (err) {
          console.warn('AuthService: Could not fetch user, using minimal user object');
          // Create minimal user object from username
          user = {
            id: 0,
            username: data.username,
            email: '',
          };
        }
      }
      
      const authResponse: AuthResponse = {
        token,
        user
      };
      
      return authResponse;
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      console.error('AuthService: Error response:', error.response?.data);
      throw error;
    }
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
