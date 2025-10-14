-- Clear all mock data from Supabase database
-- Run this in your Supabase SQL Editor to remove all existing data

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear all data from tables (in correct order due to foreign keys)
DELETE FROM "follow_up_reminders";
DELETE FROM "onboarding_checklist";
DELETE FROM "leads";
DELETE FROM "customers";
DELETE FROM "waitlist_users";
DELETE FROM "account";
DELETE FROM "user";

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Reset sequences to start from 1
-- Note: UUID sequences don't need resetting

-- Verify tables are empty
SELECT 'customers' as table_name, COUNT(*) as count FROM "customers"
UNION ALL
SELECT 'leads' as table_name, COUNT(*) as count FROM "leads"
UNION ALL
SELECT 'onboarding_checklist' as table_name, COUNT(*) as count FROM "onboarding_checklist"
UNION ALL
SELECT 'follow_up_reminders' as table_name, COUNT(*) as count FROM "follow_up_reminders"
UNION ALL
SELECT 'user' as table_name, COUNT(*) as count FROM "user"
UNION ALL
SELECT 'account' as table_name, COUNT(*) as count FROM "account"
UNION ALL
SELECT 'waitlist_users' as table_name, COUNT(*) as count FROM "waitlist_users";
