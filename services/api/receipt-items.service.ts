/**
 * Receipt Items Service
 * Handles receipt item-related API calls and analytics
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  ReceiptItem,
  ReceiptItemRequest,
  ReceiptItemListParams,
  ItemAnalyticsResponse,
  ItemAnalyticsParams,
  PaginatedResponse,
} from './types';

export class ReceiptItemsService {
  /**
   * Get list of receipt items
   * GET /api/receipt-items/
   * Query Parameters: search, start_date, end_date, ordering (item_name, total_price, created_at)
   */
  static async getReceiptItems(
    params?: ReceiptItemListParams
  ): Promise<PaginatedResponse<ReceiptItem>> {
    return await apiClient.get<PaginatedResponse<ReceiptItem>>(
      API_ENDPOINTS.RECEIPT_ITEMS.LIST(params)
    );
  }

  /**
   * Get receipt item by ID
   */
  static async getReceiptItemById(id: number): Promise<ReceiptItem> {
    return await apiClient.get<ReceiptItem>(
      API_ENDPOINTS.RECEIPT_ITEMS.DETAIL(id)
    );
  }

  /**
   * Create a new receipt item
   */
  static async createReceiptItem(data: ReceiptItemRequest): Promise<ReceiptItem> {
    return await apiClient.post<ReceiptItem>(
      API_ENDPOINTS.RECEIPT_ITEMS.CREATE,
      data
    );
  }

  /**
   * Update receipt item
   */
  static async updateReceiptItem(
    id: number,
    data: Partial<ReceiptItemRequest>
  ): Promise<ReceiptItem> {
    return await apiClient.patch<ReceiptItem>(
      API_ENDPOINTS.RECEIPT_ITEMS.DETAIL(id),
      data
    );
  }

  /**
   * Delete receipt item
   */
  static async deleteReceiptItem(id: number): Promise<void> {
    return await apiClient.delete<void>(
      API_ENDPOINTS.RECEIPT_ITEMS.DETAIL(id)
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
