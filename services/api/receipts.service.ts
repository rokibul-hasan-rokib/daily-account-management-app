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
  ReceiptUploadResponse,
  ReceiptExtractResponse,
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
      API_ENDPOINTS.RECEIPTS.LIST(params)
    );
  }

  /**
   * Get receipt by ID (includes items)
   */
  static async getReceiptById(id: number): Promise<Receipt> {
    return await apiClient.get<Receipt>(API_ENDPOINTS.RECEIPTS.DETAIL(id));
  }

  /**
   * Upload receipt with image (auto OCR)
   */
  static async uploadReceipt(data: ReceiptRequest | FormData): Promise<ReceiptUploadResponse> {
    // If FormData is passed directly (for image upload)
    if (data instanceof FormData) {
      return await apiClient.postFormData<ReceiptUploadResponse>(
        API_ENDPOINTS.RECEIPTS.UPLOAD,
        data
      );
    }
    
    // If image is a File, use FormData
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image as any);
      
      // Optional fields
      if (data.vendor_name) {
        formData.append('vendor_name', data.vendor_name);
      }
      if (data.receipt_date) {
        formData.append('receipt_date', data.receipt_date);
      }
      if (data.total_amount) {
        formData.append('total_amount', data.total_amount);
      }
      if (data.tax_amount) {
        formData.append('tax_amount', data.tax_amount);
      }
      
      // Append items if provided
      if (data.items && data.items.length > 0) {
        formData.append('items', JSON.stringify(data.items));
      }
      
      return await apiClient.postFormData<ReceiptUploadResponse>(
        API_ENDPOINTS.RECEIPTS.UPLOAD,
        formData
      );
    }
    
    throw new Error('Image is required for receipt upload');
  }

  /**
   * Create a new receipt (without auto OCR)
   */
  static async createReceipt(data: ReceiptRequest | FormData): Promise<Receipt> {
    // If FormData is passed directly
    if (data instanceof FormData) {
      return await apiClient.postFormData<Receipt>(
        API_ENDPOINTS.RECEIPTS.CREATE,
        data
      );
    }
    
    // If image is a File, use FormData
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image as any);
      
      // Optional fields
      if (data.vendor_name) {
        formData.append('vendor_name', data.vendor_name);
      }
      if (data.receipt_date) {
        formData.append('receipt_date', data.receipt_date);
      }
      if (data.total_amount) {
        formData.append('total_amount', data.total_amount);
      }
      if (data.tax_amount) {
        formData.append('tax_amount', data.tax_amount);
      }
      
      // Append items if provided
      if (data.items && data.items.length > 0) {
        formData.append('items', JSON.stringify(data.items));
      }
      
      return await apiClient.postFormData<Receipt>(
        API_ENDPOINTS.RECEIPTS.CREATE,
        formData
      );
    }
    
    // Regular JSON request (without image)
    return await apiClient.post<Receipt>(
      API_ENDPOINTS.RECEIPTS.CREATE,
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
  static async extractReceipt(id: number): Promise<ReceiptExtractResponse> {
    return await apiClient.post<ReceiptExtractResponse>(
      API_ENDPOINTS.RECEIPTS.EXTRACT(id)
    );
  }
}
