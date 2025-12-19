-- Supabase Migration: Consolidated Initial Schema
-- All tables created in 'thc' schema for isolation
SET search_path TO thc, public;

-- ============================================================================
-- helper to handle auth.uid() in DDL if needed (though not used in table defs)
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT uk_categories_user_id_name UNIQUE (user_id, name)
);

-- App Groups table
CREATE TABLE IF NOT EXISTS app_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT uk_app_groups_created_by_name UNIQUE (created_by, name)
);

-- User Accounts table
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES app_groups(id),
    identification TEXT NOT NULL,
    kind TEXT,
    currency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT uk_user_accounts_user_id_identification UNIQUE (user_id, identification)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES user_accounts(id),
    category_id UUID REFERENCES categories(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    amount NUMERIC(21, 2) NOT NULL DEFAULT 0,
    currency TEXT,
    description TEXT,
    name TEXT,
    label TEXT,
    kind TEXT,
    opts TEXT,
    transacted_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT chk_transactions_amount_not_zero CHECK (amount != 0),
    CONSTRAINT uk_transactions_id_category_id UNIQUE (id, category_id)
);

-- Activity Log table (User/Account Milestones)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES user_accounts(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Unified Timeline View (Merges Logs and Transactions for easier UI sorting)
CREATE OR REPLACE VIEW unified_timeline AS
SELECT 
    id,
    user_id,
    account_id,
    'ACTIVITY' as entry_type,
    type as highlight_type,
    data,
    NULL::NUMERIC as amount,
    NULL::TEXT as currency,
    NULL::TEXT as description,
    created_at as event_time
FROM activity_log
UNION ALL
SELECT 
    id,
    created_by as user_id,
    account_id,
    'TRANSACTION' as entry_type,
    kind as highlight_type,
    jsonb_build_object('name', name, 'category_id', category_id) as data,
    amount,
    currency,
    description,
    COALESCE(transacted_date::TIMESTAMPTZ, created_at) as event_time
FROM transactions;

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Budget Items table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    amount NUMERIC(21, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT chk_budget_items_amount_positive CHECK (amount >= 0)
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    default_currency TEXT DEFAULT 'BRL',
    budgeting_goals JSONB DEFAULT '[]'::JSONB,
    notification_preferences JSONB DEFAULT '{}'::JSONB,
    financial_goals TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_user_preferences_user_id UNIQUE (user_id)
);

-- Group Memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES app_groups(id),
    user_role TEXT DEFAULT 'member',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Splits table
CREATE TABLE IF NOT EXISTS transaction_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    amount NUMERIC(21, 2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_transaction_splits_amount_positive CHECK (amount > 0)
);

-- Transaction Categorization Jobs table
CREATE TABLE IF NOT EXISTS transaction_categorization_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transacted_date ON transactions(transacted_date);
CREATE INDEX IF NOT EXISTS idx_transactions_kind ON transactions(kind);
CREATE INDEX IF NOT EXISTS idx_transactions_soft_delete ON transactions(deactivated_at) WHERE (deactivated_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_group_id ON user_accounts(group_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_date_range ON budgets(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category_id ON budget_items(category_id);

CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction_id ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_categorization_jobs_user_id ON transaction_categorization_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_account_id ON activity_log(account_id);

-- ============================================================================
-- DEFAULT CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Inicial', 'Categoria da transação inicial, logo depois de criar uma conta com algum valor'),
    ('c0000000-0000-0000-0000-000000000001', 'Supermercado', 'Despesas relacionadas à compra de alimentos e outros itens domésticos'),
    ('c0000000-0000-0000-0000-000000000002', 'Desconhecido', 'Categoria padrão para transações sem categoria informada'),
    ('c0000000-0000-0000-0000-000000000003', 'Aluguel', 'Pagamentos mensais de aluguel para moradia ou imóvel'),
    ('c0000000-0000-0000-0000-000000000004', 'Contas', 'Pagamentos de serviços essenciais como eletricidade, água e gás'),
    ('c0000000-0000-0000-0000-000000000005', 'Transporte', 'Despesas relacionadas ao deslocamento ou viagens (por exemplo: transporte público ou combustível)'),
    ('c0000000-0000-0000-0000-000000000006', 'Entretenimento', 'Despesas com atividades de lazer como filmes, shows ou assinaturas'),
    ('c0000000-0000-0000-0000-000000000007', 'Restaurantes', 'Gastos com refeições, jantares fora de casa e entregas'),
    ('c0000000-0000-0000-0000-000000000008', 'Salário', 'Renda proveniente de emprego ou serviços prestados'),
    ('c0000000-0000-0000-0000-000000000009', 'Rendimentos de Investimentos', 'Renda proveniente de investimentos como dividendos, juros ou ganhos de capital'),
    ('c0000000-0000-0000-0000-00000000000a', 'Parcelamento de Empréstimo', 'Pagamentos feitos para quitar empréstimos ou créditos tomados'),
    ('c0000000-0000-0000-0000-00000000000b', 'Reembolso', 'Dinheiro retornado devido a pagamento excessivo ou devoluções de produtos/serviços'),
    ('c0000000-0000-0000-0000-00000000000c', 'Rendimentos de Juros', 'Renda obtida com contas de poupança ou outros investimentos que geram juros'),
    ('c0000000-0000-0000-0000-00000000000d', 'Presente', 'Dinheiro ou itens recebidos como presente'),
    ('c0000000-0000-0000-0000-00000000000e', 'Despesas Médicas', 'Pagamentos para serviços médicos, tratamentos ou seguros'),
    ('c0000000-0000-0000-0000-00000000000f', 'Compras', 'Despesas com bens de varejo ou itens pessoais'),
    ('c0000000-0000-0000-0000-000000000010', 'Seguro', 'Pagamentos feitos para apólices de seguros (por exemplo, saúde, vida, automóvel)')
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
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categorization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies (Optimized with EXISTS and soft-delete filtering)

-- Categories: System categories readable by all, user categories only by owner
CREATE POLICY "Categories Select" ON categories FOR SELECT TO authenticated 
    USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Categories Insert" ON categories FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Categories Update" ON categories FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Categories Delete" ON categories FOR DELETE TO authenticated USING (user_id = auth.uid());

-- User Accounts
CREATE POLICY "Accounts Select" ON user_accounts FOR SELECT TO authenticated 
    USING (user_id = auth.uid() AND deactivated_at IS NULL);
CREATE POLICY "Accounts Insert" ON user_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Accounts Update" ON user_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Accounts Delete" ON user_accounts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Transactions
CREATE POLICY "Transactions Select" ON transactions FOR SELECT TO authenticated
    USING (deactivated_at IS NULL AND EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid() AND deactivated_at IS NULL));
CREATE POLICY "Transactions Insert" ON transactions FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid()));
CREATE POLICY "Transactions Update" ON transactions FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid()));
CREATE POLICY "Transactions Delete" ON transactions FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM user_accounts WHERE id = transactions.account_id AND user_id = auth.uid()));

-- Budgets
CREATE POLICY "Budgets Select" ON budgets FOR SELECT TO authenticated USING (user_id = auth.uid() AND deactivated_at IS NULL);
CREATE POLICY "Budgets Insert" ON budgets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Budgets Update" ON budgets FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Budgets Delete" ON budgets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Budget items
CREATE POLICY "Budget Items Select" ON budget_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid() AND deactivated_at IS NULL));
CREATE POLICY "Budget Items Insert" ON budget_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid()));
CREATE POLICY "Budget Items Update" ON budget_items FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid()));
CREATE POLICY "Budget Items Delete" ON budget_items FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM budgets WHERE id = budget_items.budget_id AND user_id = auth.uid()));

-- Preferences
CREATE POLICY "Preferences Access" ON user_preferences FOR ALL TO authenticated USING (user_id = auth.uid());

-- App groups
CREATE POLICY "Groups Select" ON app_groups FOR SELECT TO authenticated 
    USING (deactivated_at IS NULL AND EXISTS (SELECT 1 FROM group_memberships WHERE group_id = app_groups.id AND user_id = auth.uid() AND deactivated_at IS NULL));

-- Memberships
CREATE POLICY "Memberships Select" ON group_memberships FOR SELECT TO authenticated USING (user_id = auth.uid() AND deactivated_at IS NULL);
CREATE POLICY "Memberships Insert" ON group_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Memberships Delete" ON group_memberships FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Reports
CREATE POLICY "Reports Access" ON reports FOR ALL TO authenticated USING (user_id = auth.uid());

-- Splits
CREATE POLICY "Splits Select" ON transaction_splits FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM transactions t JOIN user_accounts ua ON t.account_id = ua.id WHERE t.id = transaction_splits.transaction_id AND ua.user_id = auth.uid() AND t.deactivated_at IS NULL AND ua.deactivated_at IS NULL));
CREATE POLICY "Splits Insert" ON transaction_splits FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM transactions t JOIN user_accounts ua ON t.account_id = ua.id WHERE t.id = transaction_splits.transaction_id AND ua.user_id = auth.uid()));

-- Jobs
CREATE POLICY "Jobs Access" ON transaction_categorization_jobs FOR ALL TO authenticated USING (user_id = auth.uid());

-- Activity Log
CREATE POLICY "Activity Access" ON activity_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Activity Insert" ON activity_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Unified Timeline View is automatically protected by the RLS of underlying tables,
-- but we can add explicit grant if needed. In Supabase, the view executor
-- (usually the same role) inherits the base table RLS by default in many configs,
-- but standard practice for "authenticated" is to ensure they can select.
GRANT SELECT ON unified_timeline TO authenticated;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_groups_updated_at BEFORE UPDATE ON app_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_accounts_updated_at BEFORE UPDATE ON user_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_memberships_updated_at BEFORE UPDATE ON group_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_splits_updated_at BEFORE UPDATE ON transaction_splits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorization_jobs_updated_at BEFORE UPDATE ON transaction_categorization_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_metadata(user_uuid UUID DEFAULT auth.uid()) RETURNS JSONB LANGUAGE sql SECURITY DEFINER STABLE SET search_path = thc, public AS $$
    SELECT raw_user_meta_data FROM auth.users WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION is_onboarding_completed(user_uuid UUID DEFAULT auth.uid()) RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = thc, public AS $$
    SELECT COALESCE((raw_user_meta_data->>'onboarding_completed')::boolean, false) FROM auth.users WHERE id = user_uuid;
$$;

COMMENT ON FUNCTION get_user_metadata IS 'Get user metadata from auth.users. Use for reading onboarding_completed, default_currency, etc.';
COMMENT ON FUNCTION is_onboarding_completed IS 'Check if user has completed onboarding flow';

-- ============================================================================
-- BUDGET TRANSACTION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_budget_with_items(
    p_name TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_budget_items JSONB DEFAULT '[]'::JSONB
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = thc, public AS $$
DECLARE
    v_budget_id UUID;
    v_user_id UUID := auth.uid();
    v_item JSONB;
BEGIN
    INSERT INTO budgets (user_id, name, start_date, end_date, is_active, created_by)
    VALUES (v_user_id, p_name, p_start_date, p_end_date, p_is_active, v_user_id)
    RETURNING id INTO v_budget_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_budget_items) LOOP
        INSERT INTO budget_items (budget_id, category_id, amount, created_by)
        VALUES (v_budget_id, (v_item->>'category_id')::UUID, (v_item->>'amount')::NUMERIC, v_user_id);
    END LOOP;
    RETURN v_budget_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_budget_with_items(
    p_budget_id UUID,
    p_name TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_budget_items JSONB DEFAULT '[]'::JSONB
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = thc, public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_item JSONB;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM budgets WHERE id = p_budget_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Budget not found or access denied';
    END IF;

    UPDATE budgets SET name = p_name, start_date = p_start_date, end_date = p_end_date, is_active = p_is_active, updated_at = NOW(), last_modified_by = v_user_id WHERE id = p_budget_id;
    DELETE FROM budget_items WHERE budget_id = p_budget_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_budget_items) LOOP
        INSERT INTO budget_items (budget_id, category_id, amount, created_by)
        VALUES (p_budget_id, (v_item->>'category_id')::UUID, (v_item->>'amount')::NUMERIC, v_user_id);
    END LOOP;
    RETURN p_budget_id;
END;
$$;

COMMENT ON FUNCTION create_budget_with_items IS 'Create a budget with its items in a single transaction';
COMMENT ON FUNCTION update_budget_with_items IS 'Update a budget with its items in a single transaction (replaces all items)';

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW budget_items_with_spent AS
WITH tx_amounts AS (
    SELECT t.category_id, t.amount, t.transacted_date FROM transactions t
    WHERE NOT EXISTS (SELECT 1 FROM transaction_splits ts WHERE ts.transaction_id = t.id)
    UNION ALL
    SELECT ts.category_id, ts.amount, t.transacted_date FROM transaction_splits ts JOIN transactions t ON t.id = ts.transaction_id
)
SELECT bi.id, bi.budget_id, bi.category_id, bi.amount AS planned,
    COALESCE(SUM(tx.amount) FILTER (WHERE tx.transacted_date BETWEEN b.start_date AND b.end_date), 0) AS spent
FROM budget_items bi
JOIN budgets b ON b.id = bi.budget_id
LEFT JOIN tx_amounts tx ON tx.category_id = bi.category_id
GROUP BY bi.id, bi.budget_id, bi.category_id, bi.amount;
