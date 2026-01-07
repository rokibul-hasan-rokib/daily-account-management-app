/**
 * Merchants Service
 * Handles merchant-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Merchant,
  MerchantRequest,
  MerchantListParams,
  PaginatedResponse,
} from './types';

export class MerchantsService {
  /**
   * Get list of merchants
   */
  static async getMerchants(
    params?: MerchantListParams
  ): Promise<Merchant[] | PaginatedResponse<Merchant>> {
    return await apiClient.get<Merchant[] | PaginatedResponse<Merchant>>(
      API_ENDPOINTS.MERCHANTS.LIST,
      { params }
    );
  }

  /**
   * Get merchant by ID
   */
  static async getMerchantById(id: number): Promise<Merchant> {
    return await apiClient.get<Merchant>(API_ENDPOINTS.MERCHANTS.DETAIL(id));
  }

  /**
   * Create a new merchant
   */
  static async createMerchant(data: MerchantRequest): Promise<Merchant> {
    return await apiClient.post<Merchant>(
      API_ENDPOINTS.MERCHANTS.LIST,
      data
    );
  }

  /**
   * Update merchant
   */
  static async updateMerchant(
    id: number,
    data: Partial<MerchantRequest>
  ): Promise<Merchant> {
    return await apiClient.patch<Merchant>(
      API_ENDPOINTS.MERCHANTS.DETAIL(id),
      data
    );
  }

  /**
   * Delete merchant
   */
  static async deleteMerchant(id: number): Promise<void> {
    return await apiClient.delete<void>(API_ENDPOINTS.MERCHANTS.DETAIL(id));
  }
}
