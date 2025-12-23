# 🚀 Quick Start Guide

## What You Have Now

A fully functional **Cash Flow & Profit/Loss Tracker MVP** with:
- ✅ Cash Flow Dashboard
- ✅ Transaction Management
- ✅ Profit & Loss Analysis
- ✅ Bills & Liabilities Tracking
- ✅ **Item-Level Analytics** (the critical feature!)

Currently running on **dummy data** - ready for Django backend integration.

## How to Run

### 1. Start the Development Server

```bash
cd "c:\RKB SOFTWARE\react-native\my-app"
npm start
```

Or if port 8081 is in use:
```bash
npx expo start --port 8082
```

### 2. Open the App

Choose your platform:

**🌐 Web Browser (Recommended for quick testing)**
- Press `w` in the terminal
- App opens at `http://localhost:8081` (or 8082)

**📱 iOS Simulator** (Mac only)
- Press `i` in the terminal
- Requires Xcode installed

**🤖 Android Emulator**
- Press `a` in the terminal
- Requires Android Studio installed

**📲 Physical Device**
- Install "Expo Go" app from App Store / Play Store
- Scan the QR code shown in terminal

## Navigation Guide

### Main Dashboard (Home Tab)
- **Money In / Money Out / Balance / Profit-Loss** cards
- **Period filters**: Today / Week / Month
- **Upcoming Bills** preview
- **Insights** (auto-generated)
- **Quick Actions**: Add Transaction, View All

### Menu Tab
Access all features:
1. **Transactions** - View/search all transactions
2. **Profit & Loss** - Detailed P&L analysis
3. **Bills & Liabilities** - Track unpaid bills
4. **Item Analytics** - ⭐ The critical feature!

## Testing the Critical Feature: Item Analytics

### What to Look For

1. **Open Menu** → **Item Analytics**

2. **Top Items Dashboard**:
   - See "Beef" with £384 total spend
   - Notice the **↑22%** trend indicator (price increased)
   - Check **"38% of total spend"** insight

3. **Period Filters**:
   - Switch between "This Week" / "This Month"
   - Watch data update automatically

4. **Search Functionality**:
   - Type "Beef" in search box
   - See all Beef purchases across the period

5. **Detailed Stats per Item**:
   - Total Spend
   - Quantity purchased
   - Average Price
   - Number of purchases
   - Last purchase date

### Why This Matters

Traditional apps show:
```
"Groceries: £595"
```

This app shows:
```
"Beef: £384 (3 purchases, avg £26/kg, ↑22% vs last month)"
"Milk: £7.10 (4 purchases, avg £1.27)"
"Cauliflower: £44.40 (4 purchases, avg £2.07, ↑45%)"
```

**Perfect for restaurants, small businesses, anyone tracking supplies!**

## Dummy Data Included

The app comes with realistic dummy data:

### Transactions (16 total)
- 4 income transactions (salary, freelance, sales)
- 12 expense transactions (groceries, rent, transport, etc.)
- Date range: Last 30 days

### Receipts with Line Items (5 receipts, 18 items)
Example:
```
Receipt from "Food Wholesaler" (£320 total)
  ├─ Beef: £120 (5kg @ £24/kg)
  ├─ Cauliflower: £40 (4 @ £10 each)
  ├─ Onion: £20 (10 @ £2 each)
  └─ Cooking Oil: £30 (2 @ £15 each)
```

### Bills (6 liabilities)
- Credit card: £580 (due in 5 days)
- Rent: £1,200 (due in 8 days)
- Internet: £45 (due in 3 days)
- Insurance: £125 (due in 1 day)
- Water Bill: £35 (OVERDUE by 2 days)
- Business Loan: £350 (due in 12 days)

## Adding New Transactions

1. **Dashboard** → **+ Add Transaction** button
   OR
   **Menu** → **Transactions** → **+ Add** button

2. **Select Type**: Income or Expense

3. **Enter Details**:
   - Amount (£)
   - Description
   - Category (select from chips)
   - Merchant (optional)

4. **Save** (currently logs to console, will save to backend later)

## Key Files to Review

### UI Components
- `app/(tabs)/index.tsx` - Main dashboard
- `app/transactions.tsx` - Transactions list
- `app/profit-loss.tsx` - P&L page
- `app/bills.tsx` - Bills page
- `app/item-analytics.tsx` - ⭐ Item analytics (critical)

### Data Layer
- `data/dummy-data.ts` - All dummy data
- `types/index.ts` - TypeScript types
- `utils/helpers.ts` - Formatting & calculations

### Documentation
- `PROJECT_OVERVIEW.md` - Full project description
- `BACKEND_PLAN.md` - Django integration plan
- `REQUIREMENTS_CHECK.md` - Requirements alignment

## Common Issues

### Port Already in Use
```bash
# Use a different port
npx expo start --port 8082
```

### Metro Bundler Errors
```bash
# Clear cache and restart
npx expo start --clear
```

### TypeScript Errors
```bash
# Install dependencies
npm install
```

## Next Steps

### 1. Test the MVP ✅ (You are here!)
- Explore all features
- Test item analytics thoroughly
- Provide feedback

### 2. Backend Development
- Set up Django project
- Follow `BACKEND_PLAN.md`
- Implement models from schema
- Build REST API endpoints

### 3. Integration
- Replace dummy data imports
- Add API client (`services/api.ts`)
- Connect authentication
- Test with real data

### 4. Phase 2 Features
- Receipt scanning (OCR)
- Auto-categorization
- Alerts system
- Export functionality

## 🎯 Focus Points

When testing, pay special attention to:

1. **Speed**: Dashboard should load instantly
2. **Clarity**: Is everything understandable without accounting knowledge?
3. **Item Analytics**: Is the item-level tracking clear and useful?
4. **Insights**: Are the auto-generated insights helpful?
5. **Navigation**: Can you reach any feature in ≤2 clicks?

## Getting Help

### Check Documentation
- `PROJECT_OVERVIEW.md` - What the app does
- `BACKEND_PLAN.md` - How to build backend
- `REQUIREMENTS_CHECK.md` - Verify requirements

### Debug Console
- Press `F12` in web browser
- Check console for logs

## Ready for Production?

**Current Status**: MVP Complete ✅

**Before Production**:
- [ ] Django backend integration
- [ ] User authentication
- [ ] Real database (PostgreSQL)
- [ ] Receipt scanning (OCR)
- [ ] Testing with real users
- [ ] Deploy backend (AWS/Heroku/DigitalOcean)
- [ ] Deploy frontend (Vercel/Netlify for web)

---

**Everything is ready to test! Open the app and explore.** 🚀

The most important feature to verify is **Item Analytics** - make sure it shows item-level spending breakdown with trends. This is what makes your app different from others!
