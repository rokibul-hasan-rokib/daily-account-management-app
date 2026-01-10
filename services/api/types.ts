/**
 * API Type Definitions
 * TypeScript interfaces for API request/response types
 */

// Common types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRequest {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  description?: string;
}

export interface CategoryListParams {
  type?: 'income' | 'expense';
  search?: string;
  ordering?: 'name' | 'type' | 'created_at';
  page?: number;
  page_size?: number;
}

// Merchant types
export interface Merchant {
  id: number;
  name: string;
  default_category?: number;
  default_category_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MerchantRequest {
  name: string;
  default_category?: number;
}

export interface MerchantListParams {
  search?: string;
  ordering?: 'name' | 'created_at';
  page?: number;
  page_size?: number;
}

// Transaction types
export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  date: string;
  category: number;
  category_name?: string;
  merchant?: number;
  merchant_name?: string;
  description?: string;
  notes?: string;
  is_recurring?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionRequest {
  type: 'income' | 'expense';
  amount: string;
  date: string;
  category: number;
  merchant?: number;
  description?: string;
  notes?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
}

export interface TransactionListParams {
  type?: 'income' | 'expense';
  category?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  ordering?: 'date' | '-date' | 'amount' | '-amount' | 'created_at' | '-created_at';
  page?: number;
  page_size?: number;
}

// Receipt types
export interface ReceiptItem {
  id: number;
  item_name: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  category?: number;
  category_name?: string;
  product_code?: string;
  receipt?: number;
  created_at?: string;
}

export interface ReceiptItemRequest {
  item_name: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  category?: number;
  product_code?: string;
}

export interface Receipt {
  id: number;
  vendor_name: string;
  receipt_date: string;
  total_amount: string;
  tax_amount?: string;
  image?: string;
  is_extracted?: boolean;
  extraction_confidence?: number;
  items: ReceiptItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ReceiptRequest {
  vendor_name?: string;
  receipt_date?: string;
  total_amount?: string;
  tax_amount?: string;
  image?: File | string | FormData;
  items?: ReceiptItemRequest[];
}

export interface ReceiptExtractResponse {
  message: string;
  receipt_id: number;
}

export interface ReceiptListParams {
  search?: string;
  ordering?: 'receipt_date' | 'created_at';
  page?: number;
  page_size?: number;
}

export interface ReceiptItemListParams {
  search?: string;
  start_date?: string;
  end_date?: string;
  ordering?: 'item_name' | 'total_price' | 'created_at';
  page?: number;
  page_size?: number;
}

export interface ItemAnalyticsResponse {
  top_items: Array<{
    item_name: string;
    total_spent: string;
    count: number;
  }>;
  category_breakdown: Array<{
    category__name: string;
    total: number;
    count: number;
  }>;
  recent_items: Array<{
    item_name: string;
    last_purchase_date: string;
    total_spent: string;
  }>;
  total_items: number;
}

export interface ItemAnalyticsParams {
  search?: string;
  start_date?: string;
  end_date?: string;
}

// Liability (Bill) types
export interface Liability {
  id: number;
  name: string;
  amount: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category?: number;
  category_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LiabilityRequest {
  name: string;
  amount: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category?: number;
  description?: string;
}

export interface LiabilityListParams {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  search?: string;
  ordering?: 'due_date' | 'amount' | 'created_at';
  page?: number;
  page_size?: number;
}

// Rule types
export interface CategoryRule {
  id: number;
  merchant?: number;
  keyword?: string;
  category: number;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRuleRequest {
  merchant?: number;
  keyword?: string;
  category: number;
  priority?: number;
}

// Budget types
export interface Budget {
  id: number;
  category: number;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetRequest {
  category: number;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold?: number;
}

// Alert types
export interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AlertListParams {
  type?: string;
  is_read?: boolean;
  ordering?: 'created_at';
  page?: number;
  page_size?: number;
}

// Profile types
export interface UserProfile {
  id?: number;
  user?: number;
  currency: string;
  default_view?: string;
  show_balance?: boolean;
  show_profit_loss?: boolean;
  email_alerts?: boolean;
  push_alerts?: boolean;
  alert_days_before?: number;
}

export interface UserProfileRequest {
  currency?: string;
  default_view?: string;
  show_balance?: boolean;
  show_profit_loss?: boolean;
  email_alerts?: boolean;
  push_alerts?: boolean;
  alert_days_before?: number;
}

// Dashboard & Analytics types
export interface DashboardSummary {
  income: string;
  expenses: string;
  balance: string;
  total_balance: string;
  total_bills_due: string;
  start_date: string;
  end_date: string;
  range_type: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
}

export interface DashboardParams {
  range?: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  start_date?: string;
  end_date?: string;
}

export interface ProfitLossResponse {
  total_income: string;
  total_expense: string;
  net_profit: string;
  income_by_category: Array<{
    category: string;
    amount: string;
  }>;
  expense_by_category: Array<{
    category: string;
    amount: string;
  }>;
  monthly_data: Array<{
    month: string;
    income: string;
    expense: string;
    profit: string;
  }>;
}

export interface SummariesResponse {
  income: string;
  expenses: string;
  balance: string;
  prev_income: string;
  prev_expenses: string;
  prev_balance: string;
  category_expenses: Array<{
    category: string;
    amount: string;
    percentage: number;
  }>;
  insights: string[];
  upcoming_bills: Liability[];
}

// Form Data types for React Native file uploads
export interface ReceiptImageUpload {
  uri: string;
  type: string;
  name: string;
}

// Update types for React Native FormData compatibility
export type ReceiptFormData = FormData | {
  image: ReceiptImageUpload;
  vendor_name?: string;
  receipt_date?: string;
  total_amount?: string;
  tax_amount?: string;
}
