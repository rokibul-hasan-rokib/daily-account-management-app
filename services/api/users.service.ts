/**
 * Users Service
 * Handles user-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { User } from './types';

export class UsersService {
  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.USERS.ME);
  }

  /**
   * Get user details by ID
   */
  static async getUserById(id: number): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id));
  }
}
