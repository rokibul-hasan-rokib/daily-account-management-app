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
   * GET /api/receipts/
   * Query Parameters: search, ordering (receipt_date, created_at)
   */
  static async getReceipts(
    params?: ReceiptListParams
  ): Promise<PaginatedResponse<Receipt>> {
    return await apiClient.get<PaginatedResponse<Receipt>>(
      API_ENDPOINTS.RECEIPTS.LIST(params)
    );
  }

  /**
   * Get receipt by ID (includes items)
   * GET /api/receipts/{id}/
   * Response includes items array
   */
  static async getReceiptById(id: number): Promise<Receipt> {
    return await apiClient.get<Receipt>(API_ENDPOINTS.RECEIPTS.DETAIL(id));
  }

  /**
   * Upload receipt with image (auto OCR)
   * POST /api/receipts/upload/
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
        data.items.forEach((item, index) => {
          formData.append(`items[${index}][item_name]`, item.item_name);
          formData.append(`items[${index}][quantity]`, item.quantity);
          formData.append(`items[${index}][unit_price]`, item.unit_price);
          formData.append(`items[${index}][total_price]`, item.total_price);
          if (item.category) {
            formData.append(`items[${index}][category]`, item.category.toString());
          }
          if (item.product_code) {
            formData.append(`items[${index}][product_code]`, item.product_code);
          }
        });
      }
      
      return await apiClient.postFormData<ReceiptUploadResponse>(
        API_ENDPOINTS.RECEIPTS.UPLOAD,
        formData
      );
    }
    
    throw new Error('Image is required for receipt upload');
  }

  /**
   * Create a new receipt (with items support)
   * POST /api/receipts/
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
      
      // Append items if provided - API expects items array
      if (data.items && data.items.length > 0) {
        // For FormData, we need to append each item separately or as JSON
        data.items.forEach((item, index) => {
          formData.append(`items[${index}][item_name]`, item.item_name);
          formData.append(`items[${index}][quantity]`, item.quantity);
          formData.append(`items[${index}][unit_price]`, item.unit_price);
          formData.append(`items[${index}][total_price]`, item.total_price);
          if (item.category) {
            formData.append(`items[${index}][category]`, item.category.toString());
          }
          if (item.product_code) {
            formData.append(`items[${index}][product_code]`, item.product_code);
          }
        });
      }
      
      return await apiClient.postFormData<Receipt>(
        API_ENDPOINTS.RECEIPTS.CREATE,
        formData
      );
    }
    
    // Regular JSON request (with items array)
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
   * POST /api/receipts/{id}/extract/
   * Triggers OCR extraction for receipt
   */
  static async extractReceipt(id: number): Promise<ReceiptExtractResponse> {
    return await apiClient.post<ReceiptExtractResponse>(
      API_ENDPOINTS.RECEIPTS.EXTRACT(id)
    );
  }
}
