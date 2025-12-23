# App Architecture & Data Flow

## Navigation Structure

```
┌─────────────────────────────────────────┐
│         Bottom Tab Navigator            │
├─────────────────────────────────────────┤
│                                         │
│  [Dashboard]          [Menu]            │
│      🏠                 ☰               │
│                                         │
└─────────────────────────────────────────┘
        │                    │
        │                    └─────────────┐
        │                                  │
        ▼                                  ▼
┌──────────────────┐          ┌─────────────────────┐
│   Dashboard      │          │   Menu Screen       │
│   (index.tsx)    │          │   (menu.tsx)        │
├──────────────────┤          ├─────────────────────┤
│ • Money In       │          │ • Transactions →    │
│ • Money Out      │          │ • Profit & Loss →   │
│ • Balance        │          │ • Bills →           │
│ • Profit/Loss    │          │ • Item Analytics → │
│ • Bills Preview  │          └─────────────────────┘
│ • Insights       │                      │
│ • Quick Actions  │                      │
└──────────────────┘                      │
        │                                 │
        │ Click "Add Transaction"         │
        ▼                                 ▼
┌──────────────────┐          ┌─────────────────────┐
│ Add Transaction  │          │  Full Screens       │
│ (add.tsx)        │          │  (separate routes)  │
└──────────────────┘          └─────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │  Transactions   │ │  Profit & Loss  │ │     Bills       │
        │  List           │ │   Analysis      │ │  & Liabilities  │
        └─────────────────┘ └─────────────────┘ └─────────────────┘
                                                          │
                                                          ▼
                                              ┌─────────────────────┐
                                              │  Item Analytics ⭐  │
                                              │  (CRITICAL)         │
                                              └─────────────────────┘
```

## Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React Native)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Components (UI)                                            │
│  ↓                                                          │
│  Data Layer (Currently: dummy-data.ts)                      │
│  ↓                                                          │
│  Types (TypeScript Interfaces)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ (Phase 2)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Future)                        │
├─────────────────────────────────────────────────────────────┤
│  • services/api.ts                                          │
│  • Authentication (JWT)                                     │
│  • HTTP Client (Axios)                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                Django REST API (Backend)                    │
├─────────────────────────────────────────────────────────────┤
│  • Authentication                                           │
│  • Transactions API                                         │
│  • Receipts API                                            │
│  • Receipt Items API ⭐                                     │
│  • Liabilities API                                         │
│  • Item Analytics API                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database (PostgreSQL)                   │
├─────────────────────────────────────────────────────────────┤
│  • users                                                    │
│  • transactions                                             │
│  • receipts                                                │
│  • receipt_items ⭐ (CRITICAL TABLE)                       │
│  • liabilities                                             │
│  • category_rules                                          │
└─────────────────────────────────────────────────────────────┘
```

## Item-Level Tracking Data Flow

### Current (Dummy Data)
```
Transaction
    ↓
Receipt
    ↓
ReceiptItem[] ⭐
    ↓
Item Analytics Screen
```

### With Backend (Phase 2)
```
User scans receipt
    ↓
OCR Service (Google Vision/Tesseract)
    ↓
Extract: Vendor, Date, Total, Items[]
    ↓
User reviews & edits
    ↓
Save to Database:
    - Create Transaction
    - Create Receipt (linked to Transaction)
    - Create ReceiptItem[] (linked to Receipt) ⭐
    ↓
Item Analytics queries ReceiptItem table
    ↓
Generate insights & trends
```

## Database Relationships

```
User
  │
  ├─► Transaction (many)
  │     │
  │     ├─► type: income/expense
  │     ├─► amount
  │     ├─► category
  │     └─► date
  │
  ├─► Receipt (many)
  │     │
  │     ├─► links to: Transaction (one-to-one)
  │     ├─► merchant_name
  │     ├─► total_amount
  │     └─► ReceiptItem[] (many) ⭐ CRITICAL
  │           │
  │           ├─► item_name
  │           ├─► quantity
  │           ├─► unit_price
  │           └─► total_price
  │
  └─► Liability (many)
        │
        ├─► amount
        ├─► due_date
        └─► status
```

## Item Analytics Query Flow

### Current Period Data
```sql
SELECT 
    item_name,
    SUM(total_price) as total_spend,
    SUM(quantity) as total_quantity,
    AVG(unit_price) as average_price,
    COUNT(DISTINCT receipt_id) as transaction_count
FROM receipt_items
JOIN receipts ON receipt_items.receipt_id = receipts.id
WHERE receipts.user_id = ?
  AND receipts.date >= ?
  AND receipts.date <= ?
GROUP BY item_name
ORDER BY total_spend DESC
```

### Trend Calculation
```
1. Get current period spend per item
2. Get previous period spend per item
3. Calculate: (current - previous) / previous * 100
4. Classify: > 5% = ↑, < -5% = ↓, else →
```

### Percentage of Total
```
item_spend / total_spend * 100
```

## Feature Flow Diagrams

### Adding a Transaction (Current)
```
User clicks "Add Transaction"
    ↓
Select Type: Income/Expense
    ↓
Enter Amount (£)
    ↓
Enter Description
    ↓
Select Category (chips)
    ↓
Enter Merchant (optional)
    ↓
Click "Save"
    ↓
(Currently: logs to console)
(Future: POST /api/transactions/)
```

### Viewing Item Analytics
```
User opens Menu
    ↓
Click "Item Analytics"
    ↓
Select Period: Week/Month
    ↓
View Top 5 Items:
  - Total spend
  - Trend indicator (↑↓→)
  - Percentage of total
  - Quantity & avg price
    ↓
Optional: Search for specific item
    ↓
See detailed breakdown
```

### Dashboard Insights Generation
```
Get transactions for period
    ↓
Get transactions for previous period
    ↓
Calculate category totals
    ↓
Compare current vs previous
    ↓
Identify changes > 15%
    ↓
Generate human-readable insights:
  "Groceries increased 18% this month"
  "Rent represents 40% of your expenses"
```

## Component Hierarchy

```
App
├── (tabs)
│   ├── index (Dashboard)
│   │   ├── Header
│   │   ├── PeriodFilter
│   │   ├── MetricsGrid
│   │   │   ├── MoneyInCard
│   │   │   ├── MoneyOutCard
│   │   │   ├── BalanceCard
│   │   │   └── ProfitLossCard
│   │   ├── UpcomingBills
│   │   ├── Insights
│   │   └── QuickActions
│   │
│   └── menu
│       ├── Header
│       ├── MenuGrid
│       │   ├── TransactionsMenuItem
│       │   ├── ProfitLossMenuItem
│       │   ├── BillsMenuItem
│       │   └── ItemAnalyticsMenuItem
│       └── InfoSection
│
├── transactions
│   ├── Header (with Add button)
│   ├── SearchBar
│   ├── FilterButtons
│   └── TransactionList
│       └── TransactionItem[]
│
├── transactions/add
│   ├── Header (Cancel/Save)
│   ├── TypeToggle
│   ├── AmountInput
│   ├── DescriptionInput
│   ├── CategoryGrid
│   └── MerchantInput
│
├── profit-loss
│   ├── Header
│   ├── PeriodFilter
│   ├── SummaryCard
│   ├── IncomeBreakdown
│   └── ExpensesBreakdown
│
├── bills
│   ├── Header (with Add button)
│   ├── FilterButtons
│   └── BillsList
│       └── BillCard[]
│
└── item-analytics ⭐
    ├── Header
    ├── PeriodFilter
    ├── TotalCard
    ├── SearchBar
    ├── TopItems
    │   └── ItemCard[]
    │       ├── Rank
    │       ├── ItemName
    │       ├── TrendBadge
    │       ├── Stats (Spend/Qty/Price)
    │       └── Meta (% of total, purchases)
    └── InfoBox
```

## State Management (Current)

```
Local Component State (useState)
  ↓
Period filters
Search queries
Filter selections
  ↓
Computed from dummy data
```

## State Management (Future with Backend)

```
React Query / SWR
  ↓
Server State Cache
  ↓
API Calls
  ↓
Django Backend
```

## Security Flow (Phase 2)

```
User Login
  ↓
Backend validates credentials
  ↓
Returns JWT token
  ↓
Frontend stores token (secure storage)
  ↓
All API requests include token
  ↓
Backend validates token
  ↓
Returns user-scoped data only
```

---

## File Import Structure

```
Components import:
  ↓
Types (from @/types)
  ↓
Dummy Data (from @/data/dummy-data)
  ↓
Helpers (from @/utils/helpers)
  ↓
UI Components (from @/components)
```

## Critical Feature: Item Analytics Implementation

### Frontend
```typescript
// 1. Get receipts for period
const receipts = dummyReceipts.filter(
  r => r.date >= start && r.date <= end
);

// 2. Get receipt items
const items = dummyReceiptItems.filter(
  item => receiptIds.includes(item.receiptId)
);

// 3. Group by item name
const grouped = items.reduce((acc, item) => {
  if (!acc[item.itemName]) {
    acc[item.itemName] = {
      totalSpend: 0,
      totalQuantity: 0,
      prices: []
    };
  }
  acc[item.itemName].totalSpend += item.totalPrice;
  acc[item.itemName].totalQuantity += item.quantity;
  acc[item.itemName].prices.push(item.unitPrice);
  return acc;
}, {});

// 4. Calculate metrics
const analytics = Object.entries(grouped).map(([name, data]) => ({
  itemName: name,
  totalSpend: data.totalSpend,
  averagePrice: average(data.prices),
  trend: calculateTrend(name, currentPeriod, previousPeriod)
}));
```

### Backend (Future)
```python
# views.py
def item_analytics(request):
    period = request.query_params.get('period', 'month')
    start_date, end_date = calculate_dates(period)
    
    items = ReceiptItem.objects.filter(
        receipt__user=request.user,
        receipt__date__gte=start_date,
        receipt__date__lte=end_date
    ).values('item_name').annotate(
        total_spend=Sum('total_price'),
        total_quantity=Sum('quantity'),
        average_price=Avg('unit_price'),
        transaction_count=Count('receipt', distinct=True)
    ).order_by('-total_spend')
    
    # Calculate trends
    previous_items = get_previous_period_items(...)
    for item in items:
        item['trend'] = calculate_trend(item, previous_items)
    
    return Response(items)
```

---

**This architecture ensures the critical item-level tracking feature works seamlessly from frontend to backend!**
