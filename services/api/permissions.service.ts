/**
 * Permissions API Service
 * Handles all permission-related API calls
 */

import { apiClient } from './client';
import { Permission, PermissionListParams, PaginatedResponse } from './types';

export class PermissionsService {
  /**
   * List all permissions
   */
  static async getPermissions(params?: PermissionListParams): Promise<PaginatedResponse<Permission>> {
    return apiClient.get<PaginatedResponse<Permission>>('/api/permissions/', { params });
  }
}