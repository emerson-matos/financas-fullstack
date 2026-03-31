-- Fix: add security_invoker = on to all views so RLS is enforced
-- Without this, views run as the owner (postgres superuser) and bypass RLS,
-- allowing any authenticated user to see all rows regardless of user_id.
SET search_path TO thc, public;

CREATE OR REPLACE VIEW user_accounts_with_balance WITH (security_invoker = on) AS
SELECT
    ua.*,
    COALESCE(SUM(t.amount), 0) AS current_amount,
    COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN -t.amount ELSE 0 END), 0) AS total_expense
FROM user_accounts ua
LEFT JOIN transactions t ON t.account_id = ua.id AND t.deactivated_at IS NULL
GROUP BY ua.id;

CREATE OR REPLACE VIEW account_monthly_balances WITH (security_invoker = on) AS
WITH monthly AS (
    SELECT
        account_id,
        date_trunc('month', transacted_at) AS month_start,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) AS expense,
        COALESCE(SUM(amount), 0) AS net_change
    FROM transactions
    WHERE deactivated_at IS NULL
    GROUP BY account_id, date_trunc('month', transacted_at)
)
SELECT
    account_id,
    month_start,
    income,
    expense,
    net_change,
    SUM(net_change) OVER (
        PARTITION BY account_id
        ORDER BY month_start
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_balance
FROM monthly;

CREATE OR REPLACE VIEW unified_timeline WITH (security_invoker = on) AS
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
    t.id,
    ua.user_id,
    t.account_id,
    'TRANSACTION' as entry_type,
    t.kind as highlight_type,
    jsonb_build_object('name', t.name, 'category_id', t.category_id) as data,
    t.amount,
    t.currency,
    t.description,
    t.transacted_at AS event_time
FROM transactions t
JOIN user_accounts ua ON t.account_id = ua.id;

CREATE OR REPLACE VIEW budget_items_with_spent WITH (security_invoker = on) AS
WITH tx_amounts AS (
    SELECT t.category_id, t.amount, t.transacted_at FROM transactions t
    WHERE NOT EXISTS (SELECT 1 FROM transaction_splits ts WHERE ts.transaction_id = t.id)
    UNION ALL
    SELECT ts.category_id, ts.amount, t.transacted_at FROM transaction_splits ts JOIN transactions t ON t.id = ts.transaction_id
)
SELECT bi.id, bi.budget_id, bi.category_id, bi.amount AS planned,
    COALESCE(SUM(tx.amount) FILTER (WHERE tx.transacted_at BETWEEN b.start_date AND b.end_date), 0) AS spent
FROM budget_items bi
JOIN budgets b ON b.id = bi.budget_id
LEFT JOIN tx_amounts tx ON tx.category_id = bi.category_id
GROUP BY bi.id, bi.budget_id, bi.category_id, bi.amount;
