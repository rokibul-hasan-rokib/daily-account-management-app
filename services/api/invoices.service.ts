/**
 * Invoices Service
 * Handles invoice-related API calls including OCR extraction
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { InvoiceExtractResponse } from './types';

export class InvoicesService {
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
}
