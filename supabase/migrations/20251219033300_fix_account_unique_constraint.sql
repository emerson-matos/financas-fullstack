-- Fix unique constraint on user_accounts table
-- The original constraint uk_user_accounts_identification was global, 
-- preventing different users from having accounts with the same name.
-- This migration changes it to be unique per user.

SET search_path TO thc, public;

-- Drop the overly restrictive global constraint
ALTER TABLE user_accounts DROP CONSTRAINT IF EXISTS uk_user_accounts_identification;

-- Add a new unique constraint that is per-user
-- We also include identification to ensure a user doesn't have duplicate account names
ALTER TABLE user_accounts ADD CONSTRAINT uk_user_accounts_user_id_identification UNIQUE (user_id, identification);
