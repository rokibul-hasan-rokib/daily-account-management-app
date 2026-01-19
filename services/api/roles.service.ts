/**
 * Roles API Service
 * Handles all role-related API calls
 */

import { apiClient } from './client';
import { Role, RoleRequest, RoleListParams, PaginatedResponse } from './types';

export class RolesService {
  /**
   * List all roles
   */
  static async getRoles(params?: RoleListParams): Promise<PaginatedResponse<Role>> {
    return apiClient.get<PaginatedResponse<Role>>('/api/roles/', { params });
  }

  /**
   * Create a role
   */
  static async createRole(data: RoleRequest): Promise<Role> {
    return apiClient.post<Role>('/api/roles/', data);
  }

  /**
   * Update a role
   */
  static async updateRole(id: number, data: Partial<RoleRequest>): Promise<Role> {
    return apiClient.patch<Role>(`/api/roles/${id}/`, data);
  }

  /**
   * Delete a role
   */
  static async deleteRole(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/roles/${id}/`);
  }
}