/**
 * Company Users API Service
 * Handles all company user-related API calls
 */

import { apiClient } from './client';
import { CompanyUser, CompanyUserRequest, CompanyUserListParams, PaginatedResponse } from './types';

export class CompanyUsersService {
  /**
   * List all company users
   */
  static async getCompanyUsers(params?: CompanyUserListParams): Promise<PaginatedResponse<CompanyUser>> {
    return apiClient.get<PaginatedResponse<CompanyUser>>('/api/company-users/', { params });
  }

  /**
   * Create a company user
   */
  static async createCompanyUser(data: CompanyUserRequest): Promise<CompanyUser> {
    return apiClient.post<CompanyUser>('/api/company-users/', data);
  }

  /**
   * Update a company user
   */
  static async updateCompanyUser(id: number, data: Partial<CompanyUserRequest>): Promise<CompanyUser> {
    return apiClient.patch<CompanyUser>(`/api/company-users/${id}/`, data);
  }

  /**
   * Delete a company user
   */
  static async deleteCompanyUser(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/company-users/${id}/`);
  }
}