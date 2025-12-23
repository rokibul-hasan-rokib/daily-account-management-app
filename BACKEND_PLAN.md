# Django Backend Integration Plan

## Overview

This document outlines the backend API structure needed to replace the dummy data with a Django REST API.

## Database Schema

### 1. Users
```python
class User(AbstractUser):
    email = EmailField(unique=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### 2. Transactions
```python
class Transaction(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    type = CharField(choices=[('income', 'Income'), ('expense', 'Expense')])
    amount = DecimalField(max_digits=10, decimal_places=2)
    category = CharField(max_length=50)
    date = DateTimeField()
    description = TextField()
    merchant_name = CharField(max_length=200, blank=True)
    receipt = ForeignKey('Receipt', null=True, blank=True)
    is_recurring = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### 3. Receipts (invoices)
```python
class Receipt(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    transaction = OneToOneField(Transaction, on_delete=CASCADE, related_name='receipt_detail')
    merchant_name = CharField(max_length=200)
    date = DateTimeField()
    total_amount = DecimalField(max_digits=10, decimal_places=2)
    image_url = URLField(blank=True)
    raw_text = TextField(blank=True)  # OCR extracted text
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### 4. ReceiptItems ⭐ CRITICAL
```python
class ReceiptItem(Model):
    receipt = ForeignKey(Receipt, on_delete=CASCADE, related_name='items')
    item_name = CharField(max_length=200)
    quantity = DecimalField(max_digits=10, decimal_places=2)
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    total_price = DecimalField(max_digits=10, decimal_places=2)
    category = CharField(max_length=50, blank=True)
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            Index(fields=['item_name']),  # For item analytics queries
            Index(fields=['receipt', 'item_name']),
        ]
```

### 5. Liabilities
```python
class Liability(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    name = CharField(max_length=200)
    amount = DecimalField(max_digits=10, decimal_places=2)
    due_date = DateTimeField()
    status = CharField(choices=[
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue')
    ])
    category = CharField(max_length=50)
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### 6. CategoryRules
```python
class CategoryRule(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    merchant_pattern = CharField(max_length=200)  # Regex pattern
    category = CharField(max_length=50)
    priority = IntegerField(default=0)
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
```

### 7. SplitRule (for splitting transactions)
```python
class SplitRule(Model):
    category_rule = ForeignKey(CategoryRule, on_delete=CASCADE, related_name='split_rules')
    category = CharField(max_length=50)
    percentage = DecimalField(max_digits=5, decimal_places=2)
```

## API Endpoints

### Authentication
```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/auth/user/
```

### Transactions
```
GET    /api/transactions/
POST   /api/transactions/
GET    /api/transactions/{id}/
PUT    /api/transactions/{id}/
DELETE /api/transactions/{id}/
GET    /api/transactions/summary/?period=month&start=2024-01-01&end=2024-01-31
```

**Response for summary:**
```json
{
  "total_income": 5000.00,
  "total_expenses": 3010.00,
  "balance": 1990.00,
  "profit_loss": 1990.00,
  "top_categories": [
    {
      "category": "rent",
      "amount": 1200.00,
      "percentage": 39.87
    }
  ],
  "insights": [
    "Groceries increased 18% this month"
  ],
  "upcoming_bills": [...]
}
```

### Receipts
```
GET    /api/receipts/
POST   /api/receipts/
GET    /api/receipts/{id}/
PUT    /api/receipts/{id}/
DELETE /api/receipts/{id}/
POST   /api/receipts/scan/          # Upload image + OCR
POST   /api/receipts/{id}/finalize/ # Save after user edits
```

**Scan workflow:**
```
1. POST /api/receipts/scan/ with image
2. Backend: OCR extraction → temporary receipt object
3. Return extracted data (editable)
4. Frontend: User reviews/edits
5. POST /api/receipts/{id}/finalize/ to save
```

### Receipt Items ⭐
```
GET    /api/receipt-items/?receipt={id}
POST   /api/receipt-items/
PUT    /api/receipt-items/{id}/
DELETE /api/receipt-items/{id}/
```

### Item Analytics ⭐ CRITICAL
```
GET    /api/item-analytics/?period=month&item_name=Beef
GET    /api/item-analytics/summary/?period=month
```

**Response for item analytics:**
```json
{
  "item_name": "Beef",
  "total_spend": 384.00,
  "total_quantity": 15.0,
  "average_price": 25.60,
  "transaction_count": 3,
  "percentage_of_total": 38.2,
  "trend": "up",
  "trend_percentage": 22.5,
  "last_purchase": "2024-01-15",
  "transactions": [
    {
      "date": "2024-01-15",
      "quantity": 8.0,
      "price": 26.00,
      "merchant": "Market Suppliers"
    }
  ]
}
```

**Database query for item analytics:**
```python
# Get all items for a period
items = ReceiptItem.objects.filter(
    receipt__user=user,
    receipt__date__gte=start_date,
    receipt__date__lte=end_date
).select_related('receipt')

# Group by item_name
from django.db.models import Sum, Avg, Count
analytics = items.values('item_name').annotate(
    total_spend=Sum('total_price'),
    total_quantity=Sum('quantity'),
    average_price=Avg('unit_price'),
    transaction_count=Count('receipt', distinct=True)
)
```

### Liabilities
```
GET    /api/liabilities/
POST   /api/liabilities/
GET    /api/liabilities/{id}/
PUT    /api/liabilities/{id}/
DELETE /api/liabilities/{id}/
PATCH  /api/liabilities/{id}/mark-paid/
```

### Category Rules
```
GET    /api/category-rules/
POST   /api/category-rules/
PUT    /api/category-rules/{id}/
DELETE /api/category-rules/{id}/
```

## Critical Implementation Notes

### 1. Item-Level Storage

**DO NOT** store only receipt totals. Must store:
```
Receipt (total: £320)
  ├─ Item: Beef (£120)
  ├─ Item: Cauliflower (£40)
  ├─ Item: Onion (£20)
  └─ Item: Oil (£30)
```

### 2. Item Analytics Performance

Add database indexes:
```python
# In ReceiptItem model
class Meta:
    indexes = [
        Index(fields=['item_name']),
        Index(fields=['receipt__date']),
        Index(fields=['item_name', 'receipt__date']),
    ]
```

### 3. OCR Integration (Phase 2)

Options:
- **Google Cloud Vision API**
- **AWS Textract**
- **Tesseract** (open-source)

Expected extraction:
- Merchant name
- Date
- Total amount
- **Line items** (name, quantity, price)

### 4. Auto-Categorization Logic

```python
def auto_categorize(merchant_name, user):
    rules = CategoryRule.objects.filter(
        user=user
    ).order_by('-priority')
    
    for rule in rules:
        if re.search(rule.merchant_pattern, merchant_name, re.IGNORECASE):
            return rule.category
    
    return 'other-expense'  # default
```

### 5. Insights Generation

```python
def generate_insights(user, period_start, period_end):
    current = get_transactions(user, period_start, period_end)
    previous = get_transactions(user, previous_start, previous_end)
    
    insights = []
    
    # Compare categories
    for category in current.keys():
        current_amount = current[category]
        previous_amount = previous.get(category, 0)
        
        if previous_amount > 0:
            change = ((current_amount - previous_amount) / previous_amount) * 100
            
            if abs(change) > 15:
                direction = 'increased' if change > 0 else 'decreased'
                insights.append(
                    f"{category.title()} {direction} {abs(change):.0f}% this period"
                )
    
    return insights
```

## Security Considerations

1. **Authentication**: JWT tokens or Django sessions
2. **Authorization**: User-scoped queries only
3. **File uploads**: Validate image types, size limits
4. **Rate limiting**: Prevent abuse of OCR endpoints
5. **Data encryption**: Sensitive fields (receipt images)

## Frontend Integration

### Replace Dummy Data

**Before:**
```typescript
import { dummyTransactions } from '@/data/dummy-data';
```

**After:**
```typescript
import { apiClient } from '@/services/api';

const transactions = await apiClient.get('/transactions/', {
  params: { period: 'month' }
});
```

### API Client Setup

```typescript
// services/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Testing Strategy

1. **Unit tests**: Django models & serializers
2. **API tests**: DRF test client
3. **Integration tests**: Receipt scan → item extraction → analytics
4. **Performance tests**: Item analytics queries with large datasets

## Migration Path

1. ✅ Phase 1: Build MVP with dummy data (DONE)
2. 🔲 Phase 2: Django backend + basic CRUD APIs
3. 🔲 Phase 3: Receipt scanning + OCR
4. 🔲 Phase 4: Auto-categorization + alerts
5. 🔲 Phase 5: Advanced analytics + forecasting

---

**Next Steps**: Set up Django project with these models and endpoints.
