/**
 * Receipt Items Service
 * Handles receipt item-related API calls and analytics
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  ReceiptItem,
  ReceiptItemListParams,
  ItemAnalyticsResponse,
  ItemAnalyticsParams,
  PaginatedResponse,
} from './types';

export class ReceiptItemsService {
  /**
   * Get list of receipt items
   */
  static async getReceiptItems(
    params?: ReceiptItemListParams
  ): Promise<ReceiptItem[] | PaginatedResponse<ReceiptItem>> {
    return await apiClient.get<ReceiptItem[] | PaginatedResponse<ReceiptItem>>(
      API_ENDPOINTS.RECEIPT_ITEMS.LIST(params)
    );
  }

  /**
   * Get item analytics
   */
  static async getItemAnalytics(
    params?: ItemAnalyticsParams
  ): Promise<ItemAnalyticsResponse> {
    return await apiClient.get<ItemAnalyticsResponse>(
      API_ENDPOINTS.RECEIPT_ITEMS.ANALYTICS(params)
    );
  }
}
