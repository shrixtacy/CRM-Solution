# 🔧 Environment Setup - Fix DNS Error

## ❌ **Current Issue:**
The DNS error `getaddrinfo ENOTFOUND db.cekhahbluzicilrtkyvz.supabase.co` occurs because we're trying to connect directly to the database hostname.

## ✅ **Solution: Use Supabase Client**

I've updated the database connection to use the Supabase client instead of direct postgres connection, which avoids DNS issues.

## 🚀 **Quick Setup:**

### **1. Create/Update your `.env.local` file:**

```env
# Supabase Configuration (No database URL needed)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep your existing variables
AUTH_SECRET=your-auth-secret-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GEMINI_API_KEY=your-gemini-api-key-here
RESEND_API_KEY=your-resend-api-key-here
```

### **2. Test the Connection:**

```bash
npm run dev
```

You should see: **"✅ Connected to Supabase using client!"** in the console.

## 🎯 **What Changed:**

- ✅ **No more direct database connection** - uses Supabase client
- ✅ **No DNS issues** - connects via HTTPS API
- ✅ **Better error handling** - graceful fallbacks
- ✅ **Real-time features** - Supabase client supports real-time

## 🚀 **Benefits:**

- ✅ **No DNS errors** - uses HTTPS instead of direct postgres
- ✅ **Better performance** - optimized Supabase client
- ✅ **Real-time features** - live data updates
- ✅ **Authentication** - built-in user management
- ✅ **Storage** - file upload capabilities

## 🎊 **Result:**

The DNS error should be completely resolved! Your CRM will now connect to Supabase using the official client instead of direct database connection.

**No more `getaddrinfo ENOTFOUND` errors!** 🚀✨
