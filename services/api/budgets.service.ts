/**
 * Budgets Service
 * Handles budget-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Budget,
  BudgetRequest,
  BudgetListParams,
  PaginatedResponse,
} from './types';

export class BudgetsService {
  /**
   * Get list of budgets
   */
  static async getBudgets(
    params?: BudgetListParams
  ): Promise<Budget[] | PaginatedResponse<Budget>> {
    return await apiClient.get<Budget[] | PaginatedResponse<Budget>>(
      API_ENDPOINTS.BUDGETS.LIST(params)
    );
  }

  /**
   * Get budget by ID
   */
  static async getBudgetById(id: number): Promise<Budget> {
    return await apiClient.get<Budget>(API_ENDPOINTS.BUDGETS.DETAIL(id));
  }

  /**
   * Create a new budget
   */
  static async createBudget(data: BudgetRequest): Promise<Budget> {
    return await apiClient.post<Budget>(
      API_ENDPOINTS.BUDGETS.CREATE,
      data
    );
  }

  /**
   * Update budget
   */
  static async updateBudget(
    id: number,
    data: Partial<BudgetRequest>
  ): Promise<Budget> {
    return await apiClient.patch<Budget>(
      API_ENDPOINTS.BUDGETS.DETAIL(id),
      data
    );
  }

  /**
   * Delete budget
   */
  static async deleteBudget(id: number): Promise<void> {
    return await apiClient.delete<void>(API_ENDPOINTS.BUDGETS.DETAIL(id));
  }
}
