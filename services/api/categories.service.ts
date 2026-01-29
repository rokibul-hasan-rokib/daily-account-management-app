/**
 * Categories Service
 * Handles category-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  Category,
  CategoryRequest,
  CategoryListParams,
  PaginatedResponse,
} from './types';

export class CategoriesService {
  /**
   * Get list of categories
   */
  static async getCategories(
    params?: CategoryListParams
  ): Promise<Category[] | PaginatedResponse<Category>> {
    return await apiClient.get<Category[] | PaginatedResponse<Category>>(
      API_ENDPOINTS.CATEGORIES.LIST(params)
    );
  }

  /**
   * Get all categories across paginated responses
   */
  static async getAllCategories(params?: CategoryListParams): Promise<Category[]> {
    const response = await CategoriesService.getCategories(params);
    if (Array.isArray(response)) {
      return response;
    }

    let results = [...response.results];
    let next = response.next;
    while (next) {
      const page = await apiClient.get<PaginatedResponse<Category>>(next);
      results = results.concat(page.results);
      next = page.next;
    }
    return results;
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: number): Promise<Category> {
    return await apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
  }

  /**
   * Create a new category
   */
  static async createCategory(data: CategoryRequest): Promise<Category> {
    return await apiClient.post<Category>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
  }

  /**
   * Update category
   */
  static async updateCategory(
    id: number,
    data: Partial<CategoryRequest>
  ): Promise<Category> {
    return await apiClient.patch<Category>(
      API_ENDPOINTS.CATEGORIES.DETAIL(id),
      data
    );
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: number): Promise<void> {
    return await apiClient.delete<void>(API_ENDPOINTS.CATEGORIES.DETAIL(id));
  }
}
