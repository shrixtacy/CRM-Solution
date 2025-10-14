-- Supabase Database Setup for Vyapaar CRM
-- Run these queries in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" text,
  "email" text UNIQUE,
  "emailVerified" timestamp,
  "image" text
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS "account" (
  "userId" text NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "providerAccountId"),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Create waitlist_users table
CREATE TABLE IF NOT EXISTS "waitlist_users" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" text NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT NOW() NOT NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "age" integer NOT NULL,
  "email" text NOT NULL UNIQUE,
  "gender" text NOT NULL,
  "phone" text NOT NULL UNIQUE,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "purchase_history" text NOT NULL,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  "business_expenses" integer NOT NULL,
  "business_growth_rate" real NOT NULL,
  "customer_satisfaction_score" integer NOT NULL,
  "loyalty_points" integer NOT NULL,
  "average_order_value" integer NOT NULL
);

-- Create leads table
CREATE TABLE IF NOT EXISTS "leads" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" text NOT NULL,
  "email" text,
  "phone" text,
  "company" text,
  "source" text NOT NULL,
  "referral_source" text,
  "status" text DEFAULT 'new' NOT NULL,
  "priority" text DEFAULT 'medium',
  "notes" text,
  "follow_up_date" timestamp,
  "follow_up_notes" text,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL
);

-- Create onboarding_checklist table
CREATE TABLE IF NOT EXISTS "onboarding_checklist" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "lead_id" text NOT NULL,
  "welcome_offer_sent" boolean DEFAULT false,
  "intro_call_done" boolean DEFAULT false,
  "first_purchase_made" boolean DEFAULT false,
  "contract_signed" boolean DEFAULT false,
  "onboarding_complete" boolean DEFAULT false,
  "custom_steps" text[],
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE
);

-- Create follow_up_reminders table
CREATE TABLE IF NOT EXISTS "follow_up_reminders" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "lead_id" text NOT NULL,
  "reminder_date" timestamp NOT NULL,
  "reminder_type" text NOT NULL,
  "reminder_notes" text,
  "is_completed" boolean DEFAULT false,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_customers_email" ON "customers"("email");
CREATE INDEX IF NOT EXISTS "idx_customers_phone" ON "customers"("phone");
CREATE INDEX IF NOT EXISTS "idx_customers_state" ON "customers"("state");
CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "leads"("status");
CREATE INDEX IF NOT EXISTS "idx_leads_priority" ON "leads"("priority");
CREATE INDEX IF NOT EXISTS "idx_leads_source" ON "leads"("source");
CREATE INDEX IF NOT EXISTS "idx_follow_up_reminders_date" ON "follow_up_reminders"("reminder_date");
CREATE INDEX IF NOT EXISTS "idx_follow_up_reminders_completed" ON "follow_up_reminders"("is_completed");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON "leads" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_checklist_updated_at BEFORE UPDATE ON "onboarding_checklist" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No sample data - ready for your real data

-- Enable Row Level Security (RLS) for better security
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "waitlist_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "onboarding_checklist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follow_up_reminders" ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed for your auth setup)
CREATE POLICY "Enable all operations for authenticated users" ON "user" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON "account" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON "waitlist_users" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON "customers" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON "leads" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON "onboarding_checklist" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON "follow_up_reminders" FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

