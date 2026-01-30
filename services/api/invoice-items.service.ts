/**
 * Invoice Items Service
 * Handles invoice item-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  InvoiceItem,
  InvoiceItemRequest,
  InvoiceItemListParams,
  PaginatedResponse,
} from './types';

export class InvoiceItemsService {
  /**
   * Get list of invoice items
   * GET /api/invoice-items/
   * Query Parameters: search, start_date, end_date, invoice, ordering
   */
  static async getInvoiceItems(
    params?: InvoiceItemListParams
  ): Promise<PaginatedResponse<InvoiceItem>> {
    return await apiClient.get<PaginatedResponse<InvoiceItem>>(
      API_ENDPOINTS.INVOICE_ITEMS.LIST(params)
    );
  }

  /**
   * Get invoice item by ID
   * GET /api/invoice-items/{id}/
   */
  static async getInvoiceItemById(id: number): Promise<InvoiceItem> {
    return await apiClient.get<InvoiceItem>(
      API_ENDPOINTS.INVOICE_ITEMS.DETAIL(id)
    );
  }

  /**
   * Create a new invoice item
   * POST /api/invoice-items/
   * 
   * Required fields:
   * - invoice: Invoice ID
   * - item_name: Item name
   * - quantity: Quantity (string format, e.g., "20.00")
   * - rate: Unit rate/price (string format, e.g., "0.90")
   * - amount: Total amount (string format, e.g., "18.00")
   * 
   * Optional fields:
   * - description: Item description
   * - category: Category ID
   * - product_code: Product code
   * - notes: Additional notes
   * 
   * @example
   * await InvoiceItemsService.createInvoiceItem({
   *   invoice: 1,
   *   item_name: "BREAD MEDIUM",
   *   description: "MEDIUM",
   *   quantity: "20.00",
   *   rate: "0.90",
   *   amount: "18.00",
   *   category: 1
   * });
   */
  static async createInvoiceItem(data: InvoiceItemRequest): Promise<InvoiceItem> {
    return await apiClient.post<InvoiceItem>(
      API_ENDPOINTS.INVOICE_ITEMS.CREATE,
      data
    );
  }

  /**
   * Update invoice item
   * PUT/PATCH /api/invoice-items/{id}/
   */
  static async updateInvoiceItem(
    id: number,
    data: Partial<InvoiceItemRequest>
  ): Promise<InvoiceItem> {
    return await apiClient.patch<InvoiceItem>(
      API_ENDPOINTS.INVOICE_ITEMS.DETAIL(id),
      data
    );
  }

  /**
   * Delete invoice item
   * DELETE /api/invoice-items/{id}/
   */
  static async deleteInvoiceItem(id: number): Promise<void> {
    return await apiClient.delete<void>(
      API_ENDPOINTS.INVOICE_ITEMS.DETAIL(id)
    );
  }
}
