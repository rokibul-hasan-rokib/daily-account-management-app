/**
 * Category Rules Service
 * Handles category rule-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  CategoryRule,
  CategoryRuleRequest,
  CategoryRuleListParams,
  PaginatedResponse,
} from './types';

export class RulesService {
  /**
   * Get list of rules
   */
  static async getRules(
    params?: CategoryRuleListParams
  ): Promise<CategoryRule[] | PaginatedResponse<CategoryRule>> {
    return await apiClient.get<CategoryRule[] | PaginatedResponse<CategoryRule>>(
      API_ENDPOINTS.RULES.LIST(params)
    );
  }

  /**
   * Get rule by ID
   */
  static async getRuleById(id: number): Promise<CategoryRule> {
    return await apiClient.get<CategoryRule>(API_ENDPOINTS.RULES.DETAIL(id));
  }

  /**
   * Create a new rule
   */
  static async createRule(data: CategoryRuleRequest): Promise<CategoryRule> {
    return await apiClient.post<CategoryRule>(
      API_ENDPOINTS.RULES.CREATE,
      data
    );
  }

  /**
   * Update rule
   */
  static async updateRule(
    id: number,
    data: Partial<CategoryRuleRequest>
  ): Promise<CategoryRule> {
    return await apiClient.patch<CategoryRule>(
      API_ENDPOINTS.RULES.DETAIL(id),
      data
    );
  }

  /**
   * Delete rule
   */
  static async deleteRule(id: number): Promise<void> {
    return await apiClient.delete<void>(API_ENDPOINTS.RULES.DETAIL(id));
  }
}
