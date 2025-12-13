-- Migration: 00000000000000_create_thc_schema.sql
-- Creates dedicated schema for Top Hat Finanças app
-- This isolates our tables from other apps sharing this Supabase instance

-- Enable required extensions (in extensions schema, shared across all apps)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create the dedicated schema
CREATE SCHEMA IF NOT EXISTS thc;

-- Grant usage to authenticated and anon roles
GRANT USAGE ON SCHEMA thc TO authenticated;
GRANT USAGE ON SCHEMA thc TO anon;

-- Grant privileges on all current and future tables
GRANT ALL ON ALL TABLES IN SCHEMA thc TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA thc TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA thc TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA thc TO anon;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA thc GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA thc GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA thc GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA thc GRANT USAGE ON SEQUENCES TO anon;

-- Add thc to the search path for this database
-- This allows queries to find tables without schema prefix
ALTER DATABASE postgres SET search_path TO thc, public, extensions;
