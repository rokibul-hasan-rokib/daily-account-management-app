/**
 * Receipts Service
 * Handles receipt-related API calls including OCR extraction
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Receipt,
  ReceiptRequest,
  ReceiptListParams,
  PaginatedResponse,
} from './types';

export class ReceiptsService {
  /**
   * Get list of receipts
   */
  static async getReceipts(
    params?: ReceiptListParams
  ): Promise<Receipt[] | PaginatedResponse<Receipt>> {
    return await apiClient.get<Receipt[] | PaginatedResponse<Receipt>>(
      API_ENDPOINTS.RECEIPTS.LIST,
      { params }
    );
  }

  /**
   * Get receipt by ID (includes items)
   */
  static async getReceiptById(id: number): Promise<Receipt> {
    return await apiClient.get<Receipt>(API_ENDPOINTS.RECEIPTS.DETAIL(id));
  }

  /**
   * Create a new receipt
   */
  static async createReceipt(data: ReceiptRequest): Promise<Receipt> {
    // If image is a File, use FormData
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('vendor_name', data.vendor_name);
      formData.append('receipt_date', data.receipt_date);
      formData.append('total_amount', data.total_amount);
      if (data.tax_amount) {
        formData.append('tax_amount', data.tax_amount);
      }
      formData.append('image', data.image as any);
      
      // Append items as JSON string
      formData.append('items', JSON.stringify(data.items));
      
      return await apiClient.postFormData<Receipt>(
        API_ENDPOINTS.RECEIPTS.LIST,
        formData
      );
    }
    
    return await apiClient.post<Receipt>(
      API_ENDPOINTS.RECEIPTS.LIST,
      data
    );
  }

  /**
   * Update receipt
   */
  static async updateReceipt(
    id: number,
    data: Partial<ReceiptRequest>
  ): Promise<Receipt> {
    return await apiClient.patch<Receipt>(
      API_ENDPOINTS.RECEIPTS.DETAIL(id),
      data
    );
  }

  /**
   * Delete receipt
   */
  static async deleteReceipt(id: number): Promise<void> {
    return await apiClient.delete<void>(API_ENDPOINTS.RECEIPTS.DETAIL(id));
  }

  /**
   * Extract receipt data using OCR
   */
  static async extractReceipt(id: number): Promise<Receipt> {
    return await apiClient.post<Receipt>(
      API_ENDPOINTS.RECEIPTS.EXTRACT(id)
    );
  }
}
