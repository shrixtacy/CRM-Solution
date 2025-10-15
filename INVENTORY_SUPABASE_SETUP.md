# Inventory Supabase Setup Guide

## 🚀 Quick Setup for Inventory Management

### Step 1: Run the SQL Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `inventory-schema.sql`
4. Click **Run** to create the tables

### Step 2: Verify Tables Created
You should see these tables in your Supabase dashboard:
- `products` - Main inventory table
- `stock_movements` - Track all inventory changes
- `invoices` - Sales invoices
- `invoice_items` - Items in each invoice

### Step 3: Test the Integration
The inventory system will now use Supabase instead of localStorage for:
- ✅ Product management
- ✅ Stock tracking
- ✅ Invoice creation
- ✅ Sales analytics

## 📊 Database Schema

### Products Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- sku (VARCHAR, Unique)
- price (DECIMAL)
- cost (DECIMAL)
- category (VARCHAR)
- stock (INTEGER)
- min_stock (INTEGER)
- max_stock (INTEGER)
- status (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Stock Movements Table
```sql
- id (UUID, Primary Key)
- product_id (UUID, Foreign Key)
- product_name (VARCHAR)
- sku (VARCHAR)
- movement_type (VARCHAR) -- 'in', 'out', 'adjustment'
- quantity (INTEGER)
- reason (VARCHAR)
- notes (TEXT)
- user_id (VARCHAR)
- previous_stock (INTEGER)
- new_stock (INTEGER)
- created_at (TIMESTAMP)
```

### Invoices Table
```sql
- id (UUID, Primary Key)
- invoice_number (VARCHAR, Unique)
- customer_id (UUID)
- customer_name (VARCHAR)
- customer_email (VARCHAR)
- customer_phone (VARCHAR)
- subtotal (DECIMAL)
- tax_amount (DECIMAL)
- total (DECIMAL)
- payment_method (VARCHAR)
- status (VARCHAR)
- due_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Invoice Items Table
```sql
- id (UUID, Primary Key)
- invoice_id (UUID, Foreign Key)
- product_id (UUID, Foreign Key)
- product_name (VARCHAR)
- sku (VARCHAR)
- price (DECIMAL)
- quantity (INTEGER)
- total (DECIMAL)
- created_at (TIMESTAMP)
```

## 🔧 Features Enabled

### Inventory Management
- ✅ Add/Edit/Delete products
- ✅ Real-time stock tracking
- ✅ Low stock alerts
- ✅ Stock movement history
- ✅ CSV import/export

### Sales & Invoicing
- ✅ Create invoices
- ✅ Automatic stock deduction
- ✅ Payment method tracking
- ✅ Tax calculations
- ✅ Invoice history

### Analytics
- ✅ Sales performance metrics
- ✅ Product performance tracking
- ✅ Customer analytics
- ✅ Revenue trends

## 🎯 Benefits of Supabase Integration

1. **Data Persistence** - No more data loss on browser refresh
2. **Real-time Updates** - Multiple users can work simultaneously
3. **Backup & Recovery** - Automatic data backup
4. **Scalability** - Handles large inventory datasets
5. **Security** - Row-level security and authentication
6. **Analytics** - Built-in database analytics

## 🚨 Important Notes

- The system will automatically migrate from localStorage to Supabase
- All existing data will be preserved
- No additional configuration needed
- Works with your existing Supabase setup

## 🔍 Troubleshooting

If you encounter issues:
1. Check Supabase connection in your environment variables
2. Verify tables are created correctly
3. Check browser console for any errors
4. Ensure RLS (Row Level Security) is configured if needed

## 📱 Mobile Ready

The inventory system is fully mobile-responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

Your inventory management system is now ready with Supabase! 🎉
