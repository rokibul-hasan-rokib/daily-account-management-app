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
  first_name?: string;
  last_name?: string;
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
  is_active?: boolean;
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
  recurring_frequency?: string;
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
  notes?: string;
  receipt?: number;
  created_at?: string;
}

export interface ReceiptItemRequest {
  receipt?: number;
  item_name: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  category?: number;
  product_code?: string;
  notes?: string;
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
  receipt?: Receipt;
  receipt_id?: number;
  extracted?: boolean;
  confidence?: number;
  items_extracted?: number;
}

// Invoice types
export interface Invoice {
  id: number;
  vendor_name?: string;
  invoice_date?: string;
  total_amount?: string;
  tax_amount?: string;
  image?: string;
  is_extracted?: boolean;
  extraction_confidence?: number;
  items?: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceRequest {
  vendor_name?: string;
  invoice_date?: string;
  total_amount?: string;
  tax_amount?: string;
  image?: File | string | FormData;
}

export interface InvoiceExtractResponse {
  message?: string;
  invoice_id?: number;
  extracted?: boolean;
  confidence?: number;
  extracted_data?: Record<string, any>;
}

export interface InvoiceItem {
  id: number;
  item_name: string;
  description?: string;
  quantity: string;
  rate: string;
  amount: string;
  category?: number;
  category_name?: string;
  product_code?: string;
  notes?: string;
  invoice?: number;
  created_at?: string;
}

export interface InvoiceItemRequest {
  invoice: number; // Required: Invoice ID
  item_name: string; // Required: Item name
  quantity: string; // Required: Quantity (string format, e.g., "20.00")
  rate: string; // Required: Unit rate/price (string format, e.g., "0.90")
  amount: string; // Required: Total amount (string format, e.g., "18.00")
  description?: string; // Optional: Item description
  category?: number; // Optional: Category ID
  product_code?: string; // Optional: Product code
  notes?: string; // Optional: Additional notes
}

export interface InvoiceItemListParams {
  search?: string;
  start_date?: string;
  end_date?: string;
  invoice?: number;
  ordering?: string;
}

export interface ReceiptUploadResponse {
  message: string;
  receipt: Receipt;
  items?: ReceiptItem[];
  extracted: boolean;
  confidence: number;
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
  receipt?: number;
  receipt_id?: number;
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
  is_recurring?: boolean;
  recurring_frequency?: string;
  is_due_soon?: boolean;
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
  is_recurring?: boolean;
  recurring_frequency?: string;
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
  merchant_name?: string;
  keyword?: string;
  category: number;
  category_name?: string;
  priority: number;
  times_applied?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRuleRequest {
  merchant?: number;
  keyword?: string;
  category: number;
  priority?: number;
}

export interface CategoryRuleListParams {
  ordering?: 'priority' | 'times_applied' | 'created_at';
  page?: number;
  page_size?: number;
}

// Budget types
export interface Budget {
  id: number;
  category: number;
  category_name?: string;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold?: number;
  alert_sent?: boolean;
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

export interface BudgetListParams {
  ordering?: 'start_date' | 'amount' | 'created_at';
  page?: number;
  page_size?: number;
}

// Alert types
export interface Alert {
  id: number;
  type: string;
  type_display?: string;
  title: string;
  message: string;
  is_read: boolean;
  transaction?: number | null;
  liability?: number | null;
  category?: number | null;
  created_at: string;
}

export interface AlertListParams {
  type?: 'bill_due' | 'overspend' | 'unusual_spend' | 'budget_alert' | string;
  is_read?: boolean;
  ordering?: 'created_at' | '-created_at';
  page?: number;
  page_size?: number;
}

// Profile types
export interface UserProfile {
  id?: number;
  user?: number;
  currency: string;
  currency_display?: string;
  default_view?: string;
  show_balance?: boolean;
  show_profit_loss?: boolean;
  email_alerts?: boolean;
  push_alerts?: boolean;
  alert_days_before?: number;
  user_username?: string;
  created_at?: string;
  updated_at?: string;
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
    category__name: string;
    total: string;
  }>;
  expense_by_category: Array<{
    category__name: string;
    total: string;
  }>;
  monthly_data: Array<{
    month: string;
    income: number | string;
    expense: number | string;
    profit: number | string;
  }>;
  start_date?: string;
  end_date?: string;
}

export interface SummariesResponse {
  income: string;
  expenses: string;
  balance: string;
  prev_income: string;
  prev_expenses: string;
  prev_balance: string;
  category_expenses: Array<{
    category__name: string;
    total: string;
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

// Company types
export interface Company {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  status_display?: string;
  subscription_plan?: string;
  plan_display?: string;
  subscription_start?: string;
  subscription_end?: string;
  primary_color?: string;
  secondary_color?: string;
  max_users?: number;
  max_storage_mb?: number;
  features?: Record<string, any>;
  user_count?: number;
  stats?: CompanyStats;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyStats {
  total_users: number;
  total_transactions: number;
  total_liabilities: number;
  total_receipts: number;
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

export interface CompanyRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  subscription_plan?: string;
  max_users?: number;
  max_storage_mb?: number;
}

export interface CompanyListParams {
  search?: string;
  ordering?: 'name' | 'created_at' | 'status';
  page?: number;
  page_size?: number;
}

// Company User types
export interface CompanyUser {
  id: number;
  company: number;
  company_name?: string;
  user: User;
  role?: Role;
  is_admin: boolean;
  is_owner: boolean;
  is_active: boolean;
  joined_at?: string;
}

export interface CompanyUserRequest {
  company: number;
  user_id: number;
  role_id?: number;
  is_admin?: boolean;
  is_owner?: boolean;
}

export interface CompanyUserListParams {
  search?: string;
  ordering?: 'joined_at' | 'created_at';
  page?: number;
  page_size?: number;
}

// Role types
export interface Permission {
  id: number;
  name: string;
  codename: string;
  description?: string;
  category: string;
  created_at?: string;
}

export interface Role {
  id: number;
  company?: number;
  company_name?: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  is_default?: boolean;
  is_system?: boolean;
  user_count?: number;
  created_at?: string;
}

export interface RoleRequest {
  company: number;
  name: string;
  description?: string;
  permission_ids?: number[];
  is_default?: boolean;
}

export interface RoleListParams {
  search?: string;
  ordering?: 'name' | 'created_at';
  page?: number;
  page_size?: number;
}

export interface PermissionListParams {
  search?: string;
  ordering?: 'category' | 'name';
  page?: number;
  page_size?: number;
}
