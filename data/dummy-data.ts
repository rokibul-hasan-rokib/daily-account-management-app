// Dummy data store - will be replaced with Django backend later
import {
    CategoryRule,
    Liability,
    Receipt,
    ReceiptItem,
    Transaction
} from '@/types';

// Helper to generate dates
const today = new Date();
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Dummy Transactions
export const dummyTransactions: Transaction[] = [
  // Income
  {
    id: 'txn-1',
    type: 'income',
    amount: 3500,
    category: 'salary',
    date: daysAgo(28),
    description: 'Monthly salary',
    merchantName: 'ABC Company',
  },
  {
    id: 'txn-2',
    type: 'income',
    amount: 850,
    category: 'freelance',
    date: daysAgo(15),
    description: 'Website development project',
    merchantName: 'Client XYZ',
  },
  {
    id: 'txn-3',
    type: 'income',
    amount: 1200,
    category: 'sales',
    date: daysAgo(5),
    description: 'Product sales',
    merchantName: 'Online Store',
  },
  {
    id: 'txn-4',
    type: 'income',
    amount: 450,
    category: 'freelance',
    date: daysAgo(2),
    description: 'Consulting session',
    merchantName: 'Client ABC',
  },
  
  // Expenses
  {
    id: 'txn-5',
    type: 'expense',
    amount: 180,
    category: 'groceries',
    date: daysAgo(25),
    description: 'Weekly groceries',
    merchantName: 'Tesco',
    receiptId: 'receipt-1',
  },
  {
    id: 'txn-6',
    type: 'expense',
    amount: 1200,
    category: 'rent',
    date: daysAgo(27),
    description: 'Monthly rent',
    merchantName: 'Property Manager',
  },
  {
    id: 'txn-7',
    type: 'expense',
    amount: 45,
    category: 'transport',
    date: daysAgo(20),
    description: 'Uber rides',
    merchantName: 'Uber',
  },
  {
    id: 'txn-8',
    type: 'expense',
    amount: 85,
    category: 'utilities',
    date: daysAgo(18),
    description: 'Electricity bill',
    merchantName: 'Power Company',
  },
  {
    id: 'txn-9',
    type: 'expense',
    amount: 320,
    category: 'raw-materials',
    date: daysAgo(12),
    description: 'Restaurant supplies',
    merchantName: 'Food Wholesaler',
    receiptId: 'receipt-2',
  },
  {
    id: 'txn-10',
    type: 'expense',
    amount: 220,
    category: 'groceries',
    date: daysAgo(10),
    description: 'Weekly groceries',
    merchantName: 'Tesco',
    receiptId: 'receipt-3',
  },
  {
    id: 'txn-11',
    type: 'expense',
    amount: 65,
    category: 'transport',
    date: daysAgo(8),
    description: 'Petrol',
    merchantName: 'Shell',
  },
  {
    id: 'txn-12',
    type: 'expense',
    amount: 420,
    category: 'raw-materials',
    date: daysAgo(6),
    description: 'Fresh produce',
    merchantName: 'Market Suppliers',
    receiptId: 'receipt-4',
  },
  {
    id: 'txn-13',
    type: 'expense',
    amount: 150,
    category: 'equipment',
    date: daysAgo(4),
    description: 'Kitchen equipment',
    merchantName: 'Restaurant Supply Co',
  },
  {
    id: 'txn-14',
    type: 'expense',
    amount: 95,
    category: 'marketing',
    date: daysAgo(3),
    description: 'Facebook ads',
    merchantName: 'Meta',
  },
  {
    id: 'txn-15',
    type: 'expense',
    amount: 35,
    category: 'transport',
    date: daysAgo(1),
    description: 'Uber rides',
    merchantName: 'Uber',
  },
  {
    id: 'txn-16',
    type: 'expense',
    amount: 195,
    category: 'groceries',
    date: today,
    description: 'Weekly groceries',
    merchantName: 'Sainsburys',
    receiptId: 'receipt-5',
  },
];

// Dummy Receipt Items - CRITICAL for item-level tracking
export const dummyReceiptItems: ReceiptItem[] = [
  // Receipt 1 (Tesco - groceries)
  {
    id: 'item-1',
    receiptId: 'receipt-1',
    itemName: 'Milk',
    quantity: 2,
    unitPrice: 1.20,
    totalPrice: 2.40,
    category: 'groceries',
  },
  {
    id: 'item-2',
    receiptId: 'receipt-1',
    itemName: 'Bread',
    quantity: 3,
    unitPrice: 0.95,
    totalPrice: 2.85,
    category: 'groceries',
  },
  {
    id: 'item-3',
    receiptId: 'receipt-1',
    itemName: 'Chicken',
    quantity: 1.5,
    unitPrice: 6.50,
    totalPrice: 9.75,
    category: 'groceries',
  },
  {
    id: 'item-4',
    receiptId: 'receipt-1',
    itemName: 'Tomatoes',
    quantity: 2,
    unitPrice: 1.80,
    totalPrice: 3.60,
    category: 'groceries',
  },
  
  // Receipt 2 (Food Wholesaler - raw materials)
  {
    id: 'item-5',
    receiptId: 'receipt-2',
    itemName: 'Beef',
    quantity: 5,
    unitPrice: 24.00,
    totalPrice: 120.00,
    category: 'raw-materials',
  },
  {
    id: 'item-6',
    receiptId: 'receipt-2',
    itemName: 'Cauliflower',
    quantity: 4,
    unitPrice: 10.00,
    totalPrice: 40.00,
    category: 'raw-materials',
  },
  {
    id: 'item-7',
    receiptId: 'receipt-2',
    itemName: 'Onion',
    quantity: 10,
    unitPrice: 2.00,
    totalPrice: 20.00,
    category: 'raw-materials',
  },
  {
    id: 'item-8',
    receiptId: 'receipt-2',
    itemName: 'Cooking Oil',
    quantity: 2,
    unitPrice: 15.00,
    totalPrice: 30.00,
    category: 'raw-materials',
  },
  
  // Receipt 3 (Tesco - groceries)
  {
    id: 'item-9',
    receiptId: 'receipt-3',
    itemName: 'Beef',
    quantity: 2,
    unitPrice: 28.00,
    totalPrice: 56.00,
    category: 'groceries',
  },
  {
    id: 'item-10',
    receiptId: 'receipt-3',
    itemName: 'Pasta',
    quantity: 4,
    unitPrice: 1.25,
    totalPrice: 5.00,
    category: 'groceries',
  },
  {
    id: 'item-11',
    receiptId: 'receipt-3',
    itemName: 'Cheese',
    quantity: 1,
    unitPrice: 4.50,
    totalPrice: 4.50,
    category: 'groceries',
  },
  
  // Receipt 4 (Market Suppliers - raw materials)
  {
    id: 'item-12',
    receiptId: 'receipt-4',
    itemName: 'Beef',
    quantity: 8,
    unitPrice: 26.00,
    totalPrice: 208.00,
    category: 'raw-materials',
  },
  {
    id: 'item-13',
    receiptId: 'receipt-4',
    itemName: 'Lettuce',
    quantity: 10,
    unitPrice: 1.80,
    totalPrice: 18.00,
    category: 'raw-materials',
  },
  {
    id: 'item-14',
    receiptId: 'receipt-4',
    itemName: 'Tomatoes',
    quantity: 8,
    unitPrice: 2.50,
    totalPrice: 20.00,
    category: 'raw-materials',
  },
  
  // Receipt 5 (Sainsburys - groceries)
  {
    id: 'item-15',
    receiptId: 'receipt-5',
    itemName: 'Milk',
    quantity: 3,
    unitPrice: 1.30,
    totalPrice: 3.90,
    category: 'groceries',
  },
  {
    id: 'item-16',
    receiptId: 'receipt-5',
    itemName: 'Eggs',
    quantity: 2,
    unitPrice: 2.75,
    totalPrice: 5.50,
    category: 'groceries',
  },
  {
    id: 'item-17',
    receiptId: 'receipt-5',
    itemName: 'Cauliflower',
    quantity: 2,
    unitPrice: 2.20,
    totalPrice: 4.40,
    category: 'groceries',
  },
  {
    id: 'item-18',
    receiptId: 'receipt-5',
    itemName: 'Chicken',
    quantity: 1,
    unitPrice: 7.50,
    totalPrice: 7.50,
    category: 'groceries',
  },
];

// Dummy Receipts
export const dummyReceipts: Receipt[] = [
  {
    id: 'receipt-1',
    transactionId: 'txn-5',
    merchantName: 'Tesco',
    date: daysAgo(25),
    totalAmount: 180,
    items: dummyReceiptItems.filter(i => i.receiptId === 'receipt-1'),
  },
  {
    id: 'receipt-2',
    transactionId: 'txn-9',
    merchantName: 'Food Wholesaler',
    date: daysAgo(12),
    totalAmount: 320,
    items: dummyReceiptItems.filter(i => i.receiptId === 'receipt-2'),
  },
  {
    id: 'receipt-3',
    transactionId: 'txn-10',
    merchantName: 'Tesco',
    date: daysAgo(10),
    totalAmount: 220,
    items: dummyReceiptItems.filter(i => i.receiptId === 'receipt-3'),
  },
  {
    id: 'receipt-4',
    transactionId: 'txn-12',
    merchantName: 'Market Suppliers',
    date: daysAgo(6),
    totalAmount: 420,
    items: dummyReceiptItems.filter(i => i.receiptId === 'receipt-4'),
  },
  {
    id: 'receipt-5',
    transactionId: 'txn-16',
    merchantName: 'Sainsburys',
    date: today,
    totalAmount: 195,
    items: dummyReceiptItems.filter(i => i.receiptId === 'receipt-5'),
  },
];

// Dummy Liabilities
export const dummyLiabilities: Liability[] = [
  {
    id: 'liability-1',
    name: 'Credit Card Payment',
    amount: 580,
    dueDate: daysFromNow(5),
    status: 'unpaid',
    category: 'credit-card',
    notes: 'Visa ending in 4532',
  },
  {
    id: 'liability-2',
    name: 'Rent',
    amount: 1200,
    dueDate: daysFromNow(8),
    status: 'unpaid',
    category: 'rent',
  },
  {
    id: 'liability-3',
    name: 'Internet Bill',
    amount: 45,
    dueDate: daysFromNow(3),
    status: 'unpaid',
    category: 'utilities',
    notes: 'Monthly broadband',
  },
  {
    id: 'liability-4',
    name: 'Business Loan Installment',
    amount: 350,
    dueDate: daysFromNow(12),
    status: 'unpaid',
    category: 'loan',
    notes: 'Monthly installment',
  },
  {
    id: 'liability-5',
    name: 'Insurance Premium',
    amount: 125,
    dueDate: daysFromNow(1),
    status: 'unpaid',
    category: 'insurance',
    notes: 'Business insurance',
  },
  {
    id: 'liability-6',
    name: 'Water Bill',
    amount: 35,
    dueDate: daysAgo(2),
    status: 'overdue',
    category: 'utilities',
  },
];

// Dummy Category Rules
export const dummyCategoryRules: CategoryRule[] = [
  {
    id: 'rule-1',
    merchantPattern: 'Uber',
    category: 'transport',
  },
  {
    id: 'rule-2',
    merchantPattern: 'Tesco',
    category: 'groceries',
  },
  {
    id: 'rule-3',
    merchantPattern: 'Sainsburys',
    category: 'groceries',
  },
  {
    id: 'rule-4',
    merchantPattern: 'Shell',
    category: 'transport',
  },
];

// Helper functions for data queries
export const getTransactionsByDateRange = (start: Date, end: Date): Transaction[] => {
  return dummyTransactions.filter(t => t.date >= start && t.date <= end);
};

export const getReceiptItemsByDateRange = (start: Date, end: Date): ReceiptItem[] => {
  const receipts = dummyReceipts.filter(r => r.date >= start && r.date <= end);
  const receiptIds = receipts.map(r => r.id);
  return dummyReceiptItems.filter(item => receiptIds.includes(item.receiptId));
};

export const getItemAnalytics = (itemName: string, period: 'week' | 'month' = 'month') => {
  const now = new Date();
  const periodStart = new Date();
  periodStart.setDate(now.getDate() - (period === 'week' ? 7 : 30));
  
  const items = dummyReceiptItems.filter(item => 
    item.itemName.toLowerCase().includes(itemName.toLowerCase())
  );
  
  const receipts = dummyReceipts.filter(r => 
    items.some(i => i.receiptId === r.id) && r.date >= periodStart
  );
  
  return items.filter(item => {
    const receipt = dummyReceipts.find(r => r.id === item.receiptId);
    return receipt && receipt.date >= periodStart;
  });
};

export const getTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getUpcomingLiabilities = (): Liability[] => {
  const now = new Date();
  const inSevenDays = new Date();
  inSevenDays.setDate(now.getDate() + 7);
  
  return dummyLiabilities.filter(
    l => l.status === 'unpaid' && l.dueDate <= inSevenDays
  );
};
