# 🔧 Supabase Connection Fix

## ❌ **Error: "Tenant or user not found"**

This error means the database connection string is incorrect. Here's how to fix it:

## 🎯 **Step 1: Get the Correct Database URL from Supabase**

### **1.1 Go to Your Supabase Dashboard:**
1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `cekhahbluzicilrtkyvz`

### **1.2 Get the Database Connection String:**
1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** format
4. Copy the **Connection string** (it should look like this):

```
postgresql://postgres:[YOUR-PASSWORD]@db.cekhahbluzicilrtkyvz.supabase.co:5432/postgres
```

### **1.3 Replace the Password:**
- Replace `[YOUR-PASSWORD]` with your actual database password
- The password is: `jOO2z-O1YHF4Ql865fm8zt8W5PJqpoHXFtk8SqfU76M`

**Final URL should look like:**
```
postgresql://postgres:jOO2z-O1YHF4Ql865fm8zt8W5PJqpoHXFtk8SqfU76M@db.cekhahbluzicilrtkyvz.supabase.co:5432/postgres
```

## 🔧 **Step 2: Update Your Environment Variables**

### **2.1 Update your `.env.local` file:**
```env
# Database Configuration (Supabase)
SUPABASE_DATABASE_URL=postgresql://postgres:jOO2z-O1YHF4Ql865fm8zt8W5PJqpoHXFtk8SqfU76M@db.cekhahbluzicilrtkyvz.supabase.co:5432/postgres
SUPABASE_URL=https://cekhahbluzicilrtkyvz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2hhaGJsdXppY2lscnRreXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzQ5OTEsImV4cCI6MjA3NTg1MDk5MX0.jOO2z-O1YHF4Ql865fm8zt8W5PJqpoHXFtk8SqfU76M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2hhaGJsdXppY2lscnRreXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI3NDk5MSwiZXhwIjoyMDc1ODUwOTkxfQ.Bh_Z1r5iFZICmSfnWYwYVyIFniebejg12oy_7HIQ1gE
```

## 🗄️ **Step 3: Set Up Your Database Tables**

### **3.1 Run the SQL Setup Script:**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to create all tables

## 🧪 **Step 4: Test the Connection**

### **4.1 Restart Your Development Server:**
```bash
npm run dev
```

### **4.2 Check for Errors:**
- The "Tenant or user not found" error should be gone
- Your CRM should load without database errors

## 🔍 **Common Issues & Solutions:**

### **Issue 1: Wrong Database URL Format**
- **Problem:** Using pooler URL instead of direct database URL
- **Solution:** Use the direct database URL from Supabase dashboard

### **Issue 2: Wrong Port Number**
- **Problem:** Using port 6543 (pooler) instead of 5432 (database)
- **Solution:** Use port 5432 for direct database connection

### **Issue 3: Missing Database Setup**
- **Problem:** Tables don't exist yet
- **Solution:** Run the SQL setup script first

## ✅ **Expected Result:**

After following these steps:
- ✅ No more "Tenant or user not found" errors
- ✅ Database connection works properly
- ✅ All tables are created and accessible
- ✅ Your CRM functions normally

## 🆘 **Still Having Issues?**

If you're still getting errors:
1. **Double-check the database URL** from Supabase dashboard
2. **Verify the password** is correct
3. **Make sure you've run the SQL setup script**
4. **Restart your development server**

**Your Supabase connection should work perfectly after these steps!** 🚀✨

