/**
 * Liabilities (Bills) Service
 * Handles liability/bill-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Liability,
  LiabilityRequest,
  LiabilityListParams,
  PaginatedResponse,
} from './types';

export class LiabilitiesService {
  /**
   * Get list of liabilities
   */
  static async getLiabilities(
    params?: LiabilityListParams
  ): Promise<Liability[] | PaginatedResponse<Liability>> {
    return await apiClient.get<Liability[] | PaginatedResponse<Liability>>(
      API_ENDPOINTS.LIABILITIES.LIST(params)
    );
  }

  /**
   * Get liability by ID
   */
  static async getLiabilityById(id: number): Promise<Liability> {
    return await apiClient.get<Liability>(
      API_ENDPOINTS.LIABILITIES.DETAIL(id)
    );
  }

  /**
   * Create a new liability
   */
  static async createLiability(data: LiabilityRequest): Promise<Liability> {
    return await apiClient.post<Liability>(
      API_ENDPOINTS.LIABILITIES.CREATE,
      data
    );
  }

  /**
   * Update liability
   */
  static async updateLiability(
    id: number,
    data: Partial<LiabilityRequest>
  ): Promise<Liability> {
    return await apiClient.patch<Liability>(
      API_ENDPOINTS.LIABILITIES.DETAIL(id),
      data
    );
  }

  /**
   * Delete liability
   */
  static async deleteLiability(id: number): Promise<void> {
    return await apiClient.delete<void>(
      API_ENDPOINTS.LIABILITIES.DETAIL(id)
    );
  }

  /**
   * Mark liability as paid
   */
  static async markAsPaid(id: number): Promise<Liability> {
    return await apiClient.post<Liability>(
      API_ENDPOINTS.LIABILITIES.MARK_PAID(id)
    );
  }
}
