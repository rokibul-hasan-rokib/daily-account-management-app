# API Services Documentation

This directory contains all API service integrations for the Finance App. The API services are organized by domain and provide a clean, type-safe interface to the Django REST Framework backend.

## Structure

```
services/api/
├── config.ts              # API configuration and endpoints
├── client.ts              # Axios client with interceptors
├── types.ts               # TypeScript type definitions
├── index.ts               # Central export point
├── auth.service.ts        # Authentication services
├── users.service.ts       # User management
├── categories.service.ts   # Category CRUD operations
├── merchants.service.ts   # Merchant CRUD operations
├── transactions.service.ts # Transaction CRUD operations
├── receipts.service.ts     # Receipt operations (including OCR)
├── receipt-items.service.ts # Receipt item analytics
├── liabilities.service.ts  # Bills/liabilities management
├── rules.service.ts        # Category rules
├── budgets.service.ts      # Budget management
├── alerts.service.ts       # Alert management
├── profile.service.ts      # User profile
└── analytics.service.ts    # Dashboard & analytics
```

## Configuration

Set the API base URL using environment variables:

```bash
# .env or app.json
EXPO_PUBLIC_API_URL=http://127.0.0.1:5000/api
```

Default: `http://127.0.0.1:5000/api`

## Usage Examples

### Authentication

```typescript
import { AuthService } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';

// Using the auth context (recommended)
function LoginScreen() {
  const { login, user, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('username', 'password');
      // User is now authenticated
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}

// Direct service usage
const response = await AuthService.login({
  username: 'john_doe',
  password: 'securepassword123'
});
```

### Categories

```typescript
import { CategoriesService } from '@/services/api';

// Get all categories
const categories = await CategoriesService.getCategories({
  type: 'expense',
  search: 'groceries',
  ordering: 'name'
});

// Create category
const newCategory = await CategoriesService.createCategory({
  name: 'Transport',
  type: 'expense',
  icon: '🚗',
  color: '#e74c3c'
});

// Update category
await CategoriesService.updateCategory(1, {
  name: 'Updated Name'
});

// Delete category
await CategoriesService.deleteCategory(1);
```

### Transactions

```typescript
import { TransactionsService } from '@/services/api';

// Get transactions with filters
const transactions = await TransactionsService.getTransactions({
  type: 'expense',
  start_date: '2026-01-01',
  end_date: '2026-01-31',
  category: 1,
  ordering: 'date'
});

// Create transaction
const transaction = await TransactionsService.createTransaction({
  type: 'expense',
  amount: '50.00',
  date: '2026-01-05',
  category: 1,
  merchant: 1,
  description: 'Weekly shopping'
});
```

### Receipts

```typescript
import { ReceiptsService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

// Create receipt with image
const image = await ImagePicker.launchImageLibraryAsync();
const formData = new FormData();
formData.append('image', {
  uri: image.uri,
  type: 'image/jpeg',
  name: 'receipt.jpg',
} as any);

const receipt = await ReceiptsService.createReceipt({
  vendor_name: 'Tesco',
  receipt_date: '2026-01-05',
  total_amount: '120.00',
  tax_amount: '20.00',
  image: formData,
  items: [
    {
      item_name: 'Beef',
      quantity: '2.00',
      unit_price: '60.00',
      total_price: '120.00',
      category: 1
    }
  ]
});

// Extract receipt using OCR
const extracted = await ReceiptsService.extractReceipt(receipt.id);
```

### Analytics

```typescript
import { AnalyticsService } from '@/services/api';

// Dashboard summary
const dashboard = await AnalyticsService.getDashboardSummary({
  range: 'month',
  start_date: '2026-01-01',
  end_date: '2026-01-31'
});

// Profit & Loss
const profitLoss = await AnalyticsService.getProfitLoss({
  range: 'month'
});

// Summaries & Insights
const summaries = await AnalyticsService.getSummaries({
  range: 'month'
});
```

### Item Analytics

```typescript
import { ReceiptItemsService } from '@/services/api';

// Get item analytics
const analytics = await ReceiptItemsService.getItemAnalytics({
  search: 'Beef',
  start_date: '2026-01-01',
  end_date: '2026-01-31'
});

console.log(analytics.top_items);
console.log(analytics.category_breakdown);
```

## Error Handling

All services throw errors that can be caught and handled:

```typescript
try {
  await CategoriesService.createCategory(data);
} catch (error: any) {
  if (error.message.includes('Network error')) {
    // Handle network error
  } else {
    // Handle other errors
    Alert.alert('Error', error.message);
  }
}
```

## Authentication Token Management

Tokens are automatically stored securely using `expo-secure-store` and included in all authenticated requests. The API client handles:

- Automatic token injection in request headers
- Token expiration (401 errors)
- Secure token storage
- Token cleanup on logout

## Type Safety

All API responses are fully typed. Import types from `@/services/api/types`:

```typescript
import type { Transaction, Category, Receipt } from '@/services/api/types';
```

## Pagination

List endpoints support pagination:

```typescript
const response = await TransactionsService.getTransactions({
  page: 1,
  page_size: 20
});

// Response can be either array or paginated response
if ('results' in response) {
  // Paginated response
  console.log(response.results);
  console.log(response.count);
  console.log(response.next);
} else {
  // Array response
  console.log(response);
}
```

## File Uploads

For file uploads (like receipt images), use FormData:

```typescript
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'receipt.jpg',
} as any);

await ReceiptsService.createReceipt({
  ...receiptData,
  image: formData
});
```

## Available Services

- **AuthService** - Authentication & registration
- **UsersService** - User management
- **CategoriesService** - Category CRUD
- **MerchantsService** - Merchant CRUD
- **TransactionsService** - Transaction CRUD
- **ReceiptsService** - Receipt operations & OCR
- **ReceiptItemsService** - Receipt item analytics
- **LiabilitiesService** - Bills/liabilities management
- **RulesService** - Category rules
- **BudgetsService** - Budget management
- **AlertsService** - Alert management
- **ProfileService** - User profile
- **AnalyticsService** - Dashboard & analytics

## Base URL

The API base URL is configured in `config.ts` and can be overridden with the `EXPO_PUBLIC_API_URL` environment variable.
