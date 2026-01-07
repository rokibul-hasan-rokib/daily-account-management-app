/**
 * Alerts Service
 * Handles alert-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Alert,
  AlertListParams,
  PaginatedResponse,
} from './types';

export class AlertsService {
  /**
   * Get list of alerts
   */
  static async getAlerts(
    params?: AlertListParams
  ): Promise<Alert[] | PaginatedResponse<Alert>> {
    return await apiClient.get<Alert[] | PaginatedResponse<Alert>>(
      API_ENDPOINTS.ALERTS.LIST,
      { params }
    );
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(id: number): Promise<Alert> {
    return await apiClient.get<Alert>(API_ENDPOINTS.ALERTS.DETAIL(id));
  }

  /**
   * Mark alert as read
   */
  static async markAsRead(id: number): Promise<Alert> {
    return await apiClient.post<Alert>(
      API_ENDPOINTS.ALERTS.MARK_READ(id)
    );
  }

  /**
   * Mark all alerts as read
   */
  static async markAllAsRead(): Promise<void> {
    return await apiClient.post<void>(
      API_ENDPOINTS.ALERTS.MARK_ALL_READ
    );
  }

  /**
   * Generate alerts manually
   */
  static async generateAlerts(): Promise<void> {
    return await apiClient.post<void>(
      API_ENDPOINTS.ALERTS.GENERATE
    );
  }
}
