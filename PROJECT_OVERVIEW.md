# Cash Flow & Profit/Loss Tracker

A simple, mobile-friendly web app (mobile app ready) for individuals and small businesses to track cash flow, profit/loss, and expenses with item-level analytics.

## 🎯 Project Goal

Help users understand their finances in **under 10 seconds**:
- What they earned (Money In)
- What they spent (Money Out)
- What's left (Balance)
- Profit or Loss
- What they owe (Upcoming Bills)

## ✅ MVP Features (Phase 1) - COMPLETED

### 1. Cash Flow Dashboard
- **Quick snapshot** showing:
  - Total Money In
  - Total Money Out
  - Current Balance
  - Profit/Loss
- **Period filters**: Today / Week / Month
- **Upcoming bills** preview (next 7 days)
- **Smart insights**: Automatically generated spending insights

### 2. Transaction Management
- **View all transactions** with filtering (All / Income / Expense)
- **Search functionality** by description, merchant, or category
- **Add transactions** manually with:
  - Amount
  - Type (Income/Expense)
  - Category
  - Description
  - Merchant (optional)
- **Color-coded categories** for quick visual scanning

### 3. Profit & Loss Dashboard
- **Summary card** showing:
  - Total Income
  - Total Expenses
  - Profit/Loss calculation
- **Income breakdown** by category with percentages
- **Expenses breakdown** by category with percentages
- **Period comparison** (current vs previous period)

### 4. Bills & Liabilities
- **Track unpaid bills** and upcoming payments
- **Status tracking**: Unpaid / Paid / Overdue
- **Filter by status**
- **Visual indicators** (color-coded)
- **Total unpaid amount** at a glance
- **Quick "Mark as Paid"** action

### 5. 🌟 Item-Level Analytics (CRITICAL FEATURE)
This is the **key differentiator** for businesses:

- **Individual item tracking** from receipts (e.g., "Beef", "Milk", "Cauliflower")
- **Spend per item** with trends
- **Quantity tracking**
- **Average price calculation**
- **Trend analysis**: Compare current period vs previous period
- **Percentage of total spend**
- **Search functionality** to find specific items
- **Top 5 items** dashboard with detailed insights

**Example insights you can get:**
- "Beef cost increased 22% this month vs last month"
- "Beef represents 38% of your raw-material cost this month"
- "You purchased Beef 3 times this month, spending £384"

## 📁 Project Structure

```
my-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Cash Flow Dashboard
│   │   ├── menu.tsx            # Menu/Navigation
│   │   └── _layout.tsx         # Tab navigation layout
│   ├── transactions.tsx        # Transactions list
│   ├── transactions/
│   │   └── add.tsx            # Add transaction form
│   ├── profit-loss.tsx        # Profit & Loss page
│   ├── bills.tsx              # Bills & Liabilities page
│   └── item-analytics.tsx     # Item-level analytics (CRITICAL)
├── data/
│   └── dummy-data.ts          # Dummy data store (temporary)
├── types/
│   └── index.ts               # TypeScript types
├── utils/
│   └── helpers.ts             # Utility functions
└── components/                # Reusable UI components
```

## 🗄️ Data Structure

### Core Entities

1. **Transaction**
   - id, type (income/expense), amount, category, date
   - description, merchantName, receiptId

2. **Receipt** (linked to transaction)
   - id, transactionId, merchantName, date, totalAmount
   - **items[]** (array of receipt items)

3. **ReceiptItem** ⭐ **CRITICAL**
   - id, receiptId, itemName, quantity, unitPrice, totalPrice
   - category (optional)

4. **Liability**
   - id, name, amount, dueDate, status, category, notes

5. **CategoryRule** (for auto-categorization - Phase 2)
   - id, merchantPattern, category, splitRules

## 🎨 UX Principles (Non-Negotiable)

1. ✅ **Minimal steps** to add data
2. ✅ **Simple language** (no accounting jargon)
3. ✅ **Fast dashboard** that answers "what's going on"
4. ✅ **Everything editable** (especially scan results in Phase 2)
5. ✅ **Mobile-friendly** design (works on all devices)

## 🚀 Phase 2 Features (Next Steps)

### 1. Receipt/Invoice Scanning
- Camera upload
- Extract vendor, date, totals, **line items**
- Auto-categorization
- **Editable results before saving**
- Save into transactions + receipt_items

### 2. Auto-Categorization Rules
- "Always treat Uber as Transport"
- "Always treat Tesco as Groceries"
- Split expenses into multiple categories

### 3. Smart Alerts (Light, Not Spammy)
- Upcoming bills reminders
- Unusual spending spikes
- Category overspend warnings

### 4. Enhanced Analytics
- Forecasting
- Behavioral insights
- Comparison charts

## 🔧 Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Platform**: Mobile-friendly web (iOS/Android ready)
- **Backend** (Phase 2): Django REST API

## 🏃 Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm start
# or
npx expo start --port 8082
```

### Open the App

- **Web**: Press `w` in terminal
- **iOS**: Press `i` (requires Mac + Xcode)
- **Android**: Press `a` (requires Android Studio)
- **Expo Go**: Scan QR code with Expo Go app

## 📊 Current State: Dummy Data

The app currently uses **dummy data** stored in `data/dummy-data.ts`. This includes:

- 16 sample transactions (income & expenses)
- 5 receipts with **18 line items** (demonstrating item-level tracking)
- 6 liabilities (unpaid bills)
- Sample category rules

**Next step**: Replace with Django backend API integration.

## 🎯 Item Analytics - Why It Matters

Traditional expense trackers only show **total amounts**:
- "Groceries: £595"

This app shows **item-level detail**:
- "Beef: £384 (3 purchases, avg £26/kg, ↑22%)"
- "Milk: £7.10 (4 purchases, avg £1.27)"
- "Cauliflower: £44.40 (4 purchases, avg £2.07, ↑45%)"

**This is critical for**:
- Restaurants tracking raw material costs
- Small businesses analyzing supplier prices
- Anyone who wants to see price trends per item

## 📝 Definition of Done

### Receipt Scanning (Phase 2)
✅ User uploads photo → system extracts vendor/date/total/items  
✅ User can edit each field + each line item  
✅ Saving creates: (1) expense transaction + (2) item records linked to invoice  
✅ Item analytics updates immediately  

### Item Analytics
✅ Searching "Beef" shows spend this week/month + trend chart/list  
✅ Can compare this month vs last month  
✅ Can show "% of total raw-material cost" style insight  

## 🔒 Security & Privacy

- Secure authentication (Phase 2)
- Encrypted sensitive data
- No third-party data sharing
- Careful handling of receipt images

## 📱 Screenshots

### Dashboard
- Quick metrics (Money In, Money Out, Balance, Profit/Loss)
- Period filters (Today/Week/Month)
- Upcoming bills preview
- Smart insights

### Transactions
- Searchable transaction list
- Color-coded categories
- Filter by type (Income/Expense)

### Profit & Loss
- Income vs Expenses breakdown
- Category-wise analysis
- Percentage distribution

### Bills & Liabilities
- Status-based filtering
- Due date tracking
- One-tap "Mark as Paid"

### Item Analytics ⭐
- Top items by spend
- Trend indicators (↑↓→)
- Quantity & price tracking
- Search functionality
- Period comparison

## 🤝 Contributing

This is a solo project for now. Backend integration with Django coming soon!

## 📄 License

Private project - Not for redistribution

---

**Built with ❤️ for individuals and small businesses who want clarity, not spreadsheets.**
