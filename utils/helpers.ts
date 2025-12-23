// Utility functions for formatting and calculations

export const formatCurrency = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
};

export const formatDateRelative = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(date);
};

export const getPeriodDates = (period: 'today' | 'week' | 'month'): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setDate(end.getDate() - 30);
      break;
  }
  
  return { start, end };
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculatePercentageOfTotal = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

export const getCategoryLabel = (category: string): string => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'salary': '#10b981',
    'freelance': '#3b82f6',
    'sales': '#8b5cf6',
    'other-income': '#06b6d4',
    'groceries': '#f59e0b',
    'transport': '#ef4444',
    'utilities': '#6366f1',
    'rent': '#ec4899',
    'raw-materials': '#f97316',
    'equipment': '#14b8a6',
    'marketing': '#a855f7',
    'other-expense': '#64748b',
  };
  return colors[category] || '#94a3b8';
};

export const generateInsights = (
  transactions: any[],
  previousTransactions: any[]
): string[] => {
  const insights: string[] = [];
  
  // Calculate category spending changes
  const currentByCategory: Record<string, number> = {};
  const previousByCategory: Record<string, number> = {};
  
  transactions.filter(t => t.type === 'expense').forEach(t => {
    currentByCategory[t.category] = (currentByCategory[t.category] || 0) + t.amount;
  });
  
  previousTransactions.filter(t => t.type === 'expense').forEach(t => {
    previousByCategory[t.category] = (previousByCategory[t.category] || 0) + t.amount;
  });
  
  // Find significant changes
  Object.entries(currentByCategory).forEach(([category, amount]) => {
    const previousAmount = previousByCategory[category] || 0;
    const change = calculatePercentageChange(amount, previousAmount);
    
    if (Math.abs(change) > 15) {
      const direction = change > 0 ? 'increased' : 'decreased';
      insights.push(
        `${getCategoryLabel(category)} ${direction} ${Math.abs(change).toFixed(0)}% this period.`
      );
    }
  });
  
  // Find top spending category
  const topCategory = Object.entries(currentByCategory)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCategory) {
    const totalExpenses = Object.values(currentByCategory).reduce((sum, val) => sum + val, 0);
    const percentage = calculatePercentageOfTotal(topCategory[1], totalExpenses);
    insights.push(
      `${getCategoryLabel(topCategory[0])} represents ${percentage.toFixed(0)}% of your total spending.`
    );
  }
  
  return insights.slice(0, 3); // Return top 3 insights
};
