/**
 * Invoices Service
 * Handles invoice-related API calls including OCR extraction
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { Invoice, InvoiceRequest, InvoiceExtractResponse } from './types';

export class InvoicesService {
  /**
   * Get invoice by ID
   * GET /api/invoices/{id}/
   */
  static async getInvoiceById(id: number): Promise<Invoice> {
    return await apiClient.get<Invoice>(API_ENDPOINTS.INVOICES.DETAIL(id));
  }

  /**
   * Extract invoice data using OCR
   * POST /api/invoices/{id}/extract/
   * Triggers OCR extraction for invoice
   */
  static async extractInvoice(id: number): Promise<InvoiceExtractResponse> {
    return await apiClient.post<InvoiceExtractResponse>(
      API_ENDPOINTS.INVOICES.EXTRACT(id)
    );
  }

  /**
   * Finalize invoice after user edits
   * POST /api/invoices/{id}/finalize/
   * Saves the invoice with all user edits and marks it as finalized
   */
  static async finalizeInvoice(
    id: number,
    data?: Partial<InvoiceRequest>
  ): Promise<Invoice> {
    return await apiClient.post<Invoice>(
      API_ENDPOINTS.INVOICES.FINALIZE(id),
      data || {}
    );
  }
}
