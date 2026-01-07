/**
 * Analytics Service
 * Handles dashboard, profit-loss, and summaries API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  DashboardSummary,
  DashboardParams,
  ProfitLossResponse,
  SummariesResponse,
} from './types';

export class AnalyticsService {
  /**
   * Get dashboard summary
   */
  static async getDashboardSummary(
    params?: DashboardParams
  ): Promise<DashboardSummary> {
    return await apiClient.get<DashboardSummary>(
      API_ENDPOINTS.DASHBOARD.SUMMARY,
      { params }
    );
  }

  /**
   * Get profit & loss report
   */
  static async getProfitLoss(
    params?: DashboardParams
  ): Promise<ProfitLossResponse> {
    return await apiClient.get<ProfitLossResponse>(
      API_ENDPOINTS.PROFIT_LOSS.SUMMARY,
      { params }
    );
  }

  /**
   * Get summaries & insights
   */
  static async getSummaries(
    params?: DashboardParams
  ): Promise<SummariesResponse> {
    return await apiClient.get<SummariesResponse>(
      API_ENDPOINTS.SUMMARIES.SUMMARY,
      { params }
    );
  }
}
