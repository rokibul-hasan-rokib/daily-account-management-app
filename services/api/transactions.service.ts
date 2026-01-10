/**
 * Transactions Service
 * Handles transaction-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Transaction,
  TransactionRequest,
  TransactionListParams,
  PaginatedResponse,
} from './types';

export class TransactionsService {
  /**
   * Get list of transactions
   */
  static async getTransactions(
    params?: TransactionListParams
  ): Promise<Transaction[] | PaginatedResponse<Transaction>> {
    return await apiClient.get<Transaction[] | PaginatedResponse<Transaction>>(
      API_ENDPOINTS.TRANSACTIONS.LIST(params)
    );
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id: number): Promise<Transaction> {
    return await apiClient.get<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.DETAIL(id)
    );
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(data: TransactionRequest): Promise<Transaction> {
    return await apiClient.post<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.CREATE,
      data
    );
  }

  /**
   * Update transaction
   */
  static async updateTransaction(
    id: number,
    data: Partial<TransactionRequest>
  ): Promise<Transaction> {
    return await apiClient.patch<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.DETAIL(id),
      data
    );
  }

  /**
   * Delete transaction
   */
  static async deleteTransaction(id: number): Promise<void> {
    return await apiClient.delete<void>(
      API_ENDPOINTS.TRANSACTIONS.DETAIL(id)
    );
  }
}
