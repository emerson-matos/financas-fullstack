-- Migration: Transaction FITID for Duplicate Prevention
-- Adds fit_id column to transactions table and replaces the old uniqueness constraint

SET search_path TO thc, public;

-- 1. Add fit_id column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS fit_id TEXT;

-- 2. Drop the old (restrictive) unique index
DROP INDEX IF EXISTS unique_transaction_import_idx;

-- 3. Create the new unique index based on fit_id
-- We use a total unique index (no WHERE clause) to ensure compatibility with 
-- standard ON CONFLICT (account_id, fit_id) clauses in API calls.
-- Note: PostgreSQL unique indexes allow multiple rows with NULL values in the indexed columns.
DROP INDEX IF EXISTS unique_transaction_fit_id_idx;
CREATE UNIQUE INDEX IF NOT EXISTS unique_transaction_fit_id_idx
ON transactions (account_id, fit_id);
