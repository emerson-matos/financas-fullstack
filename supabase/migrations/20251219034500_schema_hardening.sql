-- Database Schema Hardening Migration
-- 1. Optimize RLS performance (use EXISTS instead of IN)
-- 2. Implement soft-delete logic in RLS policies
-- 3. Standardize metadata columns (created_by, last_modified_by)
-- 4. Add missing indexes for performance

SET search_path TO thc, public;

-- ============================================================================
-- 1. STANDARDIZE METADATA COLUMNS
-- ============================================================================

-- Function to safely convert created_by/last_modified_by to UUID
-- We use NULL for 'system' to maintain referential integrity with auth.users
CREATE OR REPLACE FUNCTION thc.to_uuid_or_null(text_val TEXT) 
RETURNS UUID AS $$
BEGIN
    RETURN CASE 
        WHEN text_val = 'system' THEN NULL
        ELSE text_val::UUID 
    END;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Categories
ALTER TABLE categories ALTER COLUMN created_by TYPE UUID USING thc.to_uuid_or_null(created_by);
ALTER TABLE categories ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE categories ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE categories ADD CONSTRAINT fk_categories_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE categories ALTER COLUMN last_modified_by TYPE UUID USING thc.to_uuid_or_null(last_modified_by);
ALTER TABLE categories ADD CONSTRAINT fk_categories_last_modified_by FOREIGN KEY (last_modified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- User Accounts
ALTER TABLE user_accounts ALTER COLUMN created_by TYPE UUID USING thc.to_uuid_or_null(created_by);
ALTER TABLE user_accounts ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE user_accounts ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE user_accounts ADD CONSTRAINT fk_user_accounts_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE user_accounts ALTER COLUMN last_modified_by TYPE UUID USING thc.to_uuid_or_null(last_modified_by);
ALTER TABLE user_accounts ADD CONSTRAINT fk_user_accounts_last_modified_by FOREIGN KEY (last_modified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Transactions
ALTER TABLE transactions ALTER COLUMN created_by TYPE UUID USING thc.to_uuid_or_null(created_by);
ALTER TABLE transactions ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE transactions ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE transactions ALTER COLUMN last_modified_by TYPE UUID USING thc.to_uuid_or_null(last_modified_by);
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_last_modified_by FOREIGN KEY (last_modified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Budgets
ALTER TABLE budgets ALTER COLUMN created_by TYPE UUID USING thc.to_uuid_or_null(created_by);
ALTER TABLE budgets ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE budgets ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE budgets ADD CONSTRAINT fk_budgets_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE budgets ALTER COLUMN last_modified_by TYPE UUID USING thc.to_uuid_or_null(last_modified_by);
ALTER TABLE budgets ADD CONSTRAINT fk_budgets_last_modified_by FOREIGN KEY (last_modified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- DROP helper function
DROP FUNCTION thc.to_uuid_or_null(TEXT);

-- ============================================================================
-- 2. REVISE RLS POLICIES (EXISTS & Soft Delete)
-- ============================================================================

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can insert their own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can update their own budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can delete their own budget items" ON budget_items;

DROP POLICY IF EXISTS "Users can view their own transaction splits" ON transaction_splits;
DROP POLICY IF EXISTS "Users can insert their own transaction splits" ON transaction_splits;
DROP POLICY IF EXISTS "Users can update their own transaction splits" ON transaction_splits;
DROP POLICY IF EXISTS "Users can delete their own transaction splits" ON transaction_splits;

-- Optimized Transactions Policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT TO authenticated
    USING (
        deactivated_at IS NULL AND
        EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid() AND deactivated_at IS NULL)
    );

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid())
    );

-- Optimized User Accounts Policies
DROP POLICY IF EXISTS "Users can view their own accounts" ON user_accounts;
CREATE POLICY "Users can view their own accounts" ON user_accounts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() AND deactivated_at IS NULL);

-- Optimized Budgets Policies
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
CREATE POLICY "Users can view their own budgets" ON budgets
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() AND deactivated_at IS NULL);

-- Optimized Budget Items Policies
CREATE POLICY "Users can view their own budget items" ON budget_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid() AND deactivated_at IS NULL)
    );

CREATE POLICY "Users can insert their own budget items" ON budget_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update their own budget items" ON budget_items
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own budget items" ON budget_items
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid())
    );

-- Optimized Transaction Splits Policies
CREATE POLICY "Users can view their own transaction splits" ON transaction_splits
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM transactions t
            JOIN user_accounts ua ON t.account_id = ua.id
            WHERE t.id = transaction_splits.transaction_id 
            AND ua.user_id = auth.uid()
            AND t.deactivated_at IS NULL
            AND ua.deactivated_at IS NULL
        )
    );

CREATE POLICY "Users can insert their own transaction splits" ON transaction_splits
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM transactions t
            JOIN user_accounts ua ON t.account_id = ua.id
            WHERE t.id = transaction_splits.transaction_id AND ua.user_id = auth.uid()
        )
    );

-- Group Collaboration: Allow group members to see each other
DROP POLICY IF EXISTS "Users can view groups they belong to" ON app_groups;
CREATE POLICY "Users can view groups they belong to" ON app_groups
    FOR SELECT TO authenticated
    USING (
        deactivated_at IS NULL AND
        EXISTS (SELECT 1 FROM group_memberships WHERE group_id = app_groups.id AND user_id = auth.uid() AND deactivated_at IS NULL)
    );

-- Optimized Group Memberships Policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_memberships;
CREATE POLICY "Users can view their own memberships" ON group_memberships
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() AND deactivated_at IS NULL);

-- ============================================================================
-- 3. EXTRA INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_budgets_date_range ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_transactions_kind ON transactions(kind);
CREATE INDEX IF NOT EXISTS idx_transactions_deactivated_at ON transactions(deactivated_at) WHERE (deactivated_at IS NULL);
