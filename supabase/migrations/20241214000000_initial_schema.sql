-- Supabase Migration: Initial Schema
-- Using auth.users directly (no separate app_users table)
-- User metadata stored in auth.users.raw_user_meta_data
-- All tables created in 'thc' schema for isolation from other apps

-- Set search path to use thc schema
SET search_path TO thc, public;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    description VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system',
    CONSTRAINT uk_categories_name UNIQUE (name)
);

-- App Groups table
CREATE TABLE IF NOT EXISTS app_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system',
    CONSTRAINT uk_app_groups_name UNIQUE (name)
);

-- User Accounts table
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES app_groups(id),
    identification VARCHAR(255),
    kind VARCHAR(255),
    currency VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system',
    CONSTRAINT uk_user_accounts_identification UNIQUE (identification)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES user_accounts(id),
    category_id UUID REFERENCES categories(id) default '00000000-0000-0000-0000-000000000000',
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL, -- For linking transfer pairs
    amount NUMERIC(21, 2),
    currency VARCHAR(255),
    description VARCHAR(255),
    name VARCHAR(255),
    label VARCHAR(255),
    kind VARCHAR(255),
    opts VARCHAR(255),
    transacted_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system'
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system'
);

-- Budget Items table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    amount NUMERIC(21, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system'
);

-- Group Memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES app_groups(id),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_date TIMESTAMPTZ,
    last_modified_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ
);

-- Transaction Splits table
CREATE TABLE IF NOT EXISTS transaction_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    amount NUMERIC(21, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Categorization Jobs table
CREATE TABLE IF NOT EXISTS transaction_categorization_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    last_modified_by VARCHAR(50) DEFAULT 'system'
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transacted_date ON transactions(transacted_date);
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_group_id ON user_accounts(group_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category_id ON budget_items(category_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction_id ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_categorization_jobs_user_id ON transaction_categorization_jobs(user_id);

-- ============================================================================
-- DEFAULT CATEGORIES (Required data - not seed)
-- ============================================================================
INSERT INTO categories (id, name, description, created_by) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Inicial', 'Categoria da transação inicial, logo depois de criar uma conta com algum valor', 'system'),
    ('c0000000-0000-0000-0000-000000000001', 'Supermercado', 'Despesas relacionadas à compra de alimentos e outros itens domésticos', 'system'),
    ('c0000000-0000-0000-0000-000000000002', 'Desconhecido', 'Categoria padrão para transações sem categoria informada', 'system'),
    ('c0000000-0000-0000-0000-000000000003', 'Aluguel', 'Pagamentos mensais de aluguel para moradia ou imóvel', 'system'),
    ('c0000000-0000-0000-0000-000000000004', 'Contas', 'Pagamentos de serviços essenciais como eletricidade, água e gás', 'system'),
    ('c0000000-0000-0000-0000-000000000005', 'Transporte', 'Despesas relacionadas ao deslocamento ou viagens (por exemplo: transporte público ou combustível)', 'system'),
    ('c0000000-0000-0000-0000-000000000006', 'Entretenimento', 'Despesas com atividades de lazer como filmes, shows ou assinaturas', 'system'),
    ('c0000000-0000-0000-0000-000000000007', 'Restaurantes', 'Gastos com refeições, jantares fora de casa e entregas', 'system'),
    ('c0000000-0000-0000-0000-000000000008', 'Salário', 'Renda proveniente de emprego ou serviços prestados', 'system'),
    ('c0000000-0000-0000-0000-000000000009', 'Rendimentos de Investimentos', 'Renda proveniente de investimentos como dividendos, juros ou ganhos de capital', 'system'),
    ('c0000000-0000-0000-0000-00000000000a', 'Parcelamento de Empréstimo', 'Pagamentos feitos para quitar empréstimos ou créditos tomados', 'system'),
    ('c0000000-0000-0000-0000-00000000000b', 'Reembolso', 'Dinheiro retornado devido a pagamento excessivo ou devoluções de produtos/serviços', 'system'),
    ('c0000000-0000-0000-0000-00000000000c', 'Rendimentos de Juros', 'Renda obtida com contas de poupança ou outros investimentos que geram juros', 'system'),
    ('c0000000-0000-0000-0000-00000000000d', 'Presente', 'Dinheiro ou itens recebidos como presente', 'system'),
    ('c0000000-0000-0000-0000-00000000000e', 'Despesas Médicas', 'Pagamentos para serviços médicos, tratamentos ou seguros', 'system'),
    ('c0000000-0000-0000-0000-00000000000f', 'Compras', 'Despesas com bens de varejo ou itens pessoais', 'system'),
    ('c0000000-0000-0000-0000-000000000010', 'Seguro', 'Pagamentos feitos para apólices de seguros (por exemplo, saúde, vida, automóvel)', 'system')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categorization_jobs ENABLE ROW LEVEL SECURITY;

-- Categories: System categories (user_id IS NULL) readable by all, user categories only by owner
CREATE POLICY "System categories viewable by all authenticated" ON categories
    FOR SELECT TO authenticated 
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create their own categories" ON categories
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE TO authenticated 
    USING (user_id = auth.uid());

-- User accounts: Direct auth.uid() check
CREATE POLICY "Users can view their own accounts" ON user_accounts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own accounts" ON user_accounts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own accounts" ON user_accounts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own accounts" ON user_accounts
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Transactions: Check via account ownership
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT TO authenticated
    USING (account_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (account_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE TO authenticated
    USING (account_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE TO authenticated
    USING (account_id IN (SELECT id FROM user_accounts WHERE user_id = auth.uid()));

-- Budgets: Direct auth.uid() check
CREATE POLICY "Users can view their own budgets" ON budgets
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own budgets" ON budgets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own budgets" ON budgets
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own budgets" ON budgets
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Budget items: Check via budget ownership
CREATE POLICY "Users can view their own budget items" ON budget_items
    FOR SELECT TO authenticated
    USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own budget items" ON budget_items
    FOR INSERT TO authenticated
    WITH CHECK (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own budget items" ON budget_items
    FOR UPDATE TO authenticated
    USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own budget items" ON budget_items
    FOR DELETE TO authenticated
    USING (budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid()));

-- App groups: Viewable by members
CREATE POLICY "Users can view groups they belong to" ON app_groups
    FOR SELECT TO authenticated
    USING (id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid()));

-- Group memberships: Direct auth.uid() check
CREATE POLICY "Users can view their own memberships" ON group_memberships
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create memberships" ON group_memberships
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own memberships" ON group_memberships
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Transaction splits: Check via transaction ownership
CREATE POLICY "Users can view their own transaction splits" ON transaction_splits
    FOR SELECT TO authenticated
    USING (transaction_id IN (
        SELECT t.id FROM transactions t 
        JOIN user_accounts ua ON t.account_id = ua.id 
        WHERE ua.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own transaction splits" ON transaction_splits
    FOR INSERT TO authenticated
    WITH CHECK (transaction_id IN (
        SELECT t.id FROM transactions t 
        JOIN user_accounts ua ON t.account_id = ua.id 
        WHERE ua.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own transaction splits" ON transaction_splits
    FOR UPDATE TO authenticated
    USING (transaction_id IN (
        SELECT t.id FROM transactions t 
        JOIN user_accounts ua ON t.account_id = ua.id 
        WHERE ua.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own transaction splits" ON transaction_splits
    FOR DELETE TO authenticated
    USING (transaction_id IN (
        SELECT t.id FROM transactions t 
        JOIN user_accounts ua ON t.account_id = ua.id 
        WHERE ua.user_id = auth.uid()
    ));

-- Categorization jobs: Direct auth.uid() check
CREATE POLICY "Users can view their own categorization jobs" ON transaction_categorization_jobs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own categorization jobs" ON transaction_categorization_jobs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categorization jobs" ON transaction_categorization_jobs
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_groups_updated_at
    BEFORE UPDATE ON app_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_accounts_updated_at
    BEFORE UPDATE ON user_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
    BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_memberships_updated_at
    BEFORE UPDATE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_splits_updated_at
    BEFORE UPDATE ON transaction_splits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorization_jobs_updated_at
    BEFORE UPDATE ON transaction_categorization_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user metadata from auth.users
CREATE OR REPLACE FUNCTION get_user_metadata(user_uuid UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT raw_user_meta_data FROM auth.users WHERE id = user_uuid;
$$;

-- Check if user completed onboarding
CREATE OR REPLACE FUNCTION is_onboarding_completed(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE((raw_user_meta_data->>'onboarding_completed')::boolean, false)
    FROM auth.users 
    WHERE id = user_uuid;
$$;

COMMENT ON FUNCTION get_user_metadata IS 'Get user metadata from auth.users. Use for reading onboarding_completed, default_currency, etc.';
COMMENT ON FUNCTION is_onboarding_completed IS 'Check if user has completed onboarding flow';

-- ============================================================================
-- BUDGET TRANSACTION FUNCTIONS
-- ============================================================================

-- Create a budget with its items in a single transaction
CREATE OR REPLACE FUNCTION create_budget_with_items(
    p_name VARCHAR(255),
    p_start_date DATE,
    p_end_date DATE,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_budget_items JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_budget_id UUID;
    v_user_id UUID := auth.uid();
    v_item JSONB;
BEGIN
    -- Create the budget
    INSERT INTO budgets (user_id, name, start_date, end_date, is_active, created_by)
    VALUES (v_user_id, p_name, p_start_date, p_end_date, p_is_active, v_user_id::TEXT)
    RETURNING id INTO v_budget_id;

    -- Insert budget items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_budget_items)
    LOOP
        INSERT INTO budget_items (budget_id, category_id, amount, created_by)
        VALUES (
            v_budget_id,
            (v_item->>'category_id')::UUID,
            (v_item->>'amount')::NUMERIC,
            v_user_id::TEXT
        );
    END LOOP;

    RETURN v_budget_id;
END;
$$;

-- Update a budget with its items in a single transaction
CREATE OR REPLACE FUNCTION update_budget_with_items(
    p_budget_id UUID,
    p_name VARCHAR(255),
    p_start_date DATE,
    p_end_date DATE,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_budget_items JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_item JSONB;
BEGIN
    -- Verify ownership
    IF NOT EXISTS (SELECT 1 FROM budgets WHERE id = p_budget_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Budget not found or access denied';
    END IF;

    -- Update the budget
    UPDATE budgets
    SET name = p_name,
        start_date = p_start_date,
        end_date = p_end_date,
        is_active = p_is_active,
        updated_at = NOW(),
        last_modified_by = v_user_id::TEXT
    WHERE id = p_budget_id;

    -- Delete existing budget items
    DELETE FROM budget_items WHERE budget_id = p_budget_id;

    -- Insert new budget items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_budget_items)
    LOOP
        INSERT INTO budget_items (budget_id, category_id, amount, created_by)
        VALUES (
            p_budget_id,
            (v_item->>'category_id')::UUID,
            (v_item->>'amount')::NUMERIC,
            v_user_id::TEXT
        );
    END LOOP;

    RETURN p_budget_id;
END;
$$;

COMMENT ON FUNCTION create_budget_with_items IS 'Create a budget with its items in a single transaction';
COMMENT ON FUNCTION update_budget_with_items IS 'Update a budget with its items in a single transaction (replaces all items)';
