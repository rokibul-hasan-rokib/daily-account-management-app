# API Integration Updates

All API endpoints have been updated to match the latest API documentation.

## ✅ Updates Made

### 1. **Authentication**
- ✅ Simplified registration: Removed `first_name` and `last_name` fields
- ✅ Registration now only requires: `username`, `email`, `password`, `password2`
- ✅ Updated login to handle various response formats
- ✅ Added comprehensive error handling and logging

### 2. **Transaction Types**
- ✅ Added `recurring_frequency` field to TransactionRequest
- ✅ Updated ordering to support `-date`, `-amount`, `-created_at` formats

### 3. **Receipt Types**
- ✅ Added `is_extracted` and `extraction_confidence` fields
- ✅ Made receipt upload fields optional (vendor_name, receipt_date, total_amount)
- ✅ Added `category_name` to ReceiptItem
- ✅ Added `receipt` field to ReceiptItem

### 4. **Category Types**
- ✅ Added `description` and `is_default` fields

### 5. **Merchant Types**
- ✅ Added `default_category_name` field

### 6. **Liability Types**
- ✅ Added `category_name` field

### 7. **Alert Types**
- ✅ Added `title` field (in addition to `message`)

### 8. **Dashboard Types**
- ✅ Added `yesterday` to range options
- ✅ Updated to use `range` parameter (not `range_type`)

### 9. **Item Analytics**
- ✅ Updated `category_breakdown` structure to match API:
  - Changed from `category` to `category__name`
  - Changed from `total_spent` to `total` (number)
  - Changed from `item_count` to `count`

### 10. **Profile Types**
- ✅ Added `push_alerts` field
- ✅ Made `id` and `user` optional

## 📝 API Base URL

Default: `http://127.0.0.1:5000/api`

Can be changed via environment variable:
```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 🔑 Default Admin Credentials

- **Username:** `admin123`
- **Password:** `admin`
- **Email:** `admin123@gmail.com`

## 📋 Updated Registration Form

The registration form now only requires:
- Username
- Email
- Password
- Confirm Password

First Name and Last Name fields have been removed to match the API.

## 🚀 All Endpoints Available

All API endpoints from the documentation are now integrated:

### Authentication
- ✅ POST `/api/auth/register/`
- ✅ POST `/api/auth/login/`
- ✅ POST `/api/auth/logout/`
- ✅ GET `/api/auth/user/`

### Dashboard & Analytics
- ✅ GET `/api/dashboard/`
- ✅ GET `/api/profit-loss/`
- ✅ GET `/api/summaries/`

### Transactions
- ✅ GET `/api/transactions/`
- ✅ POST `/api/transactions/`
- ✅ PATCH `/api/transactions/{id}/`
- ✅ DELETE `/api/transactions/{id}/`

### Receipts
- ✅ POST `/api/receipts/` (with image upload)
- ✅ POST `/api/receipts/{id}/extract/` (OCR)
- ✅ GET `/api/receipts/{id}/`
- ✅ GET `/api/receipts/`

### Receipt Items
- ✅ GET `/api/receipt-items/`
- ✅ GET `/api/receipt-items/analytics/`

### Categories
- ✅ GET `/api/categories/`
- ✅ POST `/api/categories/`
- ✅ PATCH `/api/categories/{id}/`
- ✅ DELETE `/api/categories/{id}/`

### Merchants
- ✅ GET `/api/merchants/`
- ✅ POST `/api/merchants/`
- ✅ PATCH `/api/merchants/{id}/`
- ✅ DELETE `/api/merchants/{id}/`

### Liabilities (Bills)
- ✅ GET `/api/liabilities/`
- ✅ POST `/api/liabilities/`
- ✅ PATCH `/api/liabilities/{id}/`
- ✅ DELETE `/api/liabilities/{id}/`
- ✅ POST `/api/liabilities/{id}/mark_paid/`

### Alerts
- ✅ GET `/api/alerts/`
- ✅ POST `/api/alerts/{id}/mark_read/`
- ✅ POST `/api/alerts/mark_all_read/`
- ✅ POST `/api/alerts/generate/`

### Profile
- ✅ GET `/api/profile/me/`
- ✅ PATCH `/api/profile/me/`

## 🎯 Usage Examples

### Login
```typescript
import { useAuth } from '@/contexts/auth-context';

const { login } = useAuth();
await login('admin123', 'admin');
```

### Register
```typescript
const { register } = useAuth();
await register({
  username: 'user123',
  email: 'user@example.com',
  password: 'password123',
  password2: 'password123'
});
```

### Get Dashboard
```typescript
import { AnalyticsService } from '@/services/api';

const dashboard = await AnalyticsService.getDashboardSummary({
  range: 'month'
});
```

### Upload Receipt
```typescript
import { ReceiptsService } from '@/services/api';

const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'receipt.jpg',
} as any);

const receipt = await ReceiptsService.createReceipt(formData);
```

### Get Transactions
```typescript
import { TransactionsService } from '@/services/api';

const transactions = await TransactionsService.getTransactions({
  type: 'expense',
  start_date: '2026-01-01',
  end_date: '2026-01-31',
  ordering: '-date'
});
```

## ✨ Features

- ✅ Type-safe API calls
- ✅ Automatic token management
- ✅ Secure token storage
- ✅ Error handling
- ✅ Pagination support
- ✅ File upload support
- ✅ Flexible response handling

All API services are ready to use throughout the app!
