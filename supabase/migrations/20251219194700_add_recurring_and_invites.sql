-- Migration: Add Recurring Templates and Group Invites
SET search_path TO thc, public;

-- Recurring Templates table
CREATE TABLE IF NOT EXISTS recurring_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    account_id UUID NOT NULL REFERENCES user_accounts(id),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(21, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    name TEXT NOT NULL,
    description TEXT,
    kind TEXT NOT NULL, 
    recurrence_rule TEXT NOT NULL, 
    next_occurrence TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Group Invites table
CREATE TABLE IF NOT EXISTS group_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES app_groups(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recurring_templates_user_id ON recurring_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_account_id ON recurring_templates(account_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_group_id ON group_invites(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_email ON group_invites(email);
CREATE INDEX IF NOT EXISTS idx_group_invites_token ON group_invites(token);

-- RLS
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Recurring Templates Policies
DROP POLICY IF EXISTS "Recurring Templates Select" ON recurring_templates;
DROP POLICY IF EXISTS "Recurring Templates Insert" ON recurring_templates;
DROP POLICY IF EXISTS "Recurring Templates Update" ON recurring_templates;
DROP POLICY IF EXISTS "Recurring Templates Delete" ON recurring_templates;

CREATE POLICY "Recurring Templates Select" ON recurring_templates FOR SELECT TO authenticated
    USING (user_id = auth.uid());
CREATE POLICY "Recurring Templates Insert" ON recurring_templates FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Recurring Templates Update" ON recurring_templates FOR UPDATE TO authenticated
    USING (user_id = auth.uid());
CREATE POLICY "Recurring Templates Delete" ON recurring_templates FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Group Invites Policies
DROP POLICY IF EXISTS "Group Invites Select" ON group_invites;
DROP POLICY IF EXISTS "Group Invites Insert" ON group_invites;
DROP POLICY IF EXISTS "Group Invites Delete" ON group_invites;

CREATE POLICY "Group Invites Select" ON group_invites FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM group_memberships WHERE group_id = group_invites.group_id AND user_id = auth.uid()));
CREATE POLICY "Group Invites Insert" ON group_invites FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM group_memberships WHERE group_id = group_invites.group_id AND user_id = auth.uid() AND user_role = 'admin'));
CREATE POLICY "Group Invites Delete" ON group_invites FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM group_memberships WHERE group_id = group_invites.group_id AND user_id = auth.uid() AND user_role = 'admin'));

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_recurring_templates_updated_at ON recurring_templates;
CREATE TRIGGER update_recurring_templates_updated_at BEFORE UPDATE ON recurring_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_invites_updated_at ON group_invites;
CREATE TRIGGER update_group_invites_updated_at BEFORE UPDATE ON group_invites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
