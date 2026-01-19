/**
 * Companies API Service
 * Handles all company-related API calls
 */

import { apiClient } from './client';
import { 
  Company, 
  CompanyRequest, 
  CompanyListParams, 
  PaginatedResponse,
  CompanyUser,
  Role
} from './types';

export class CompaniesService {
  /**
   * List all companies
   */
  static async getCompanies(params?: CompanyListParams): Promise<PaginatedResponse<Company>> {
    return apiClient.get<PaginatedResponse<Company>>('/companies/', { params });
  }

  /**
   * Get company details by ID
   */
  static async getCompanyById(id: number): Promise<Company> {
    return apiClient.get<Company>(`/companies/${id}/`);
  }

  /**
   * Get company details with stats (alternative endpoint)
   */
  static async getCompanyDetails(id: number): Promise<Company> {
    return apiClient.get<Company>(`/companies/${id}/details/`);
  }

  /**
   * Update company
   */
  static async updateCompany(id: number, data: CompanyRequest): Promise<Company> {
    return apiClient.patch<Company>(`/companies/${id}/`, data);
  }

  /**
   * Get company users
   */
  static async getCompanyUsers(id: number): Promise<CompanyUser[]> {
    return apiClient.get<CompanyUser[]>(`/companies/${id}/users/`);
  }

  /**
   * Get company roles
   */
  static async getCompanyRoles(id: number): Promise<Role[]> {
    return apiClient.get<Role[]>(`/companies/${id}/roles/`);
  }
}