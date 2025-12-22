-- Migration: Group-based Splits and Duplicate Prevention
SET search_path TO thc, public;

-- Cleanup legacy table from partial migration
DROP TABLE IF EXISTS thc.group_splits;


-- 1. Add group_id to transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES app_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON transactions(group_id);

-- 2. Add split_rules to app_groups
ALTER TABLE app_groups
ADD COLUMN IF NOT EXISTS split_rules JSONB DEFAULT '{}'::jsonb;

-- 3. Create split_proposals table
CREATE TABLE IF NOT EXISTS split_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES app_groups(id) ON DELETE CASCADE,
    split_rules JSONB DEFAULT '{}'::jsonb, 
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_split_proposals_transaction_id ON split_proposals(transaction_id);
CREATE INDEX IF NOT EXISTS idx_split_proposals_group_id ON split_proposals(group_id);

-- 4. Create member_debts table
CREATE TABLE IF NOT EXISTS member_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES split_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The one who owes money
    amount NUMERIC(21, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_debts_proposal_id ON member_debts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_member_debts_user_id ON member_debts(user_id);

-- RLS
ALTER TABLE split_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_debts ENABLE ROW LEVEL SECURITY;

-- Split Proposals Policies
CREATE POLICY "Split Proposals Select" ON split_proposals FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.group_id = split_proposals.group_id AND gm.user_id = auth.uid()));

CREATE POLICY "Split Proposals Insert" ON split_proposals FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.group_id = split_proposals.group_id AND gm.user_id = auth.uid()));

CREATE POLICY "Split Proposals Update" ON split_proposals FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM group_memberships gm WHERE gm.group_id = split_proposals.group_id AND gm.user_id = auth.uid() AND gm.user_role = 'admin'));

-- Member Debts Policies
CREATE POLICY "Member Debts Select" ON member_debts FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR -- Debtor
        EXISTS ( -- Recipient (Payer)
            SELECT 1 FROM split_proposals p 
            JOIN transactions t ON p.transaction_id = t.id 
            WHERE p.id = member_debts.proposal_id AND t.created_by = auth.uid()
        ) OR
        EXISTS ( -- Admin
            SELECT 1 FROM split_proposals p
            JOIN group_memberships gm ON p.group_id = gm.group_id
            WHERE p.id = member_debts.proposal_id AND gm.user_id = auth.uid() AND gm.user_role = 'admin'
        )
    );

CREATE POLICY "Member Debts Update" ON member_debts FOR UPDATE TO authenticated
    USING (
        EXISTS ( -- Recipient (Payer) can mark as paid
            SELECT 1 FROM split_proposals p 
            JOIN transactions t ON p.transaction_id = t.id 
            WHERE p.id = member_debts.proposal_id AND t.created_by = auth.uid()
        ) OR
        EXISTS ( -- Admin
            SELECT 1 FROM split_proposals p
            JOIN group_memberships gm ON p.group_id = gm.group_id
            WHERE p.id = member_debts.proposal_id AND gm.user_id = auth.uid() AND gm.user_role = 'admin'
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_split_proposals_updated_at BEFORE UPDATE ON split_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_debts_updated_at BEFORE UPDATE ON member_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Duplicate Prevention Constraint
CREATE UNIQUE INDEX IF NOT EXISTS unique_transaction_import_idx
ON transactions (account_id, transacted_at, amount, name)
WHERE deactivated_at IS NULL;
