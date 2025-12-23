// Core data types for the cash flow app

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'salary'
  | 'freelance'
  | 'sales'
  | 'other-income'
  | 'groceries'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'raw-materials'
  | 'equipment'
  | 'marketing'
  | 'other-expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: Date;
  description: string;
  merchantName?: string;
  receiptId?: string;
  isRecurring?: boolean;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: TransactionCategory;
}

export interface Receipt {
  id: string;
  transactionId: string;
  merchantName: string;
  date: Date;
  totalAmount: number;
  imageUrl?: string;
  items: ReceiptItem[];
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  status: 'unpaid' | 'paid' | 'overdue';
  category: string;
  notes?: string;
}

export interface CategoryRule {
  id: string;
  merchantPattern: string;
  category: TransactionCategory;
  splitRules?: {
    category: TransactionCategory;
    percentage: number;
  }[];
}

export interface DashboardSummary {
  period: 'day' | 'week' | 'month';
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  profitLoss: number;
  topCategories: {
    category: TransactionCategory;
    amount: number;
    percentage: number;
  }[];
  insights: string[];
  upcomingBills: Liability[];
}

export interface ItemAnalytics {
  itemName: string;
  totalSpend: number;
  quantity: number;
  averagePrice: number;
  percentageOfTotal: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  transactions: {
    date: Date;
    quantity: number;
    price: number;
    merchant: string;
  }[];
}

export type DateRange = {
  start: Date;
  end: Date;
};

export type PeriodFilter = 'today' | 'week' | 'month' | 'custom';
