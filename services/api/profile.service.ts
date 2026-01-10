/**
 * Profile Service
 * Handles user profile-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  UserProfile,
  UserProfileRequest,
} from './types';

export class ProfileService {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile> {
    return await apiClient.get<UserProfile>(API_ENDPOINTS.PROFILE.ME);
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UserProfileRequest): Promise<UserProfile> {
    return await apiClient.patch<UserProfile>(
      API_ENDPOINTS.PROFILE.UPDATE,
      data
    );
  }
}
