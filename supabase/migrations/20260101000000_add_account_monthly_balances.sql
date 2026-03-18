-- Add income/expense totals to account views
SET search_path TO thc, public;

-- Extend user_accounts_with_balance with income/expense aggregates
CREATE OR REPLACE VIEW user_accounts_with_balance AS
SELECT
    ua.*,
    COALESCE(SUM(t.amount), 0) AS current_amount,
    COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN -t.amount ELSE 0 END), 0) AS total_expense
FROM user_accounts ua
LEFT JOIN transactions t ON t.account_id = ua.id AND t.deactivated_at IS NULL
GROUP BY ua.id;

-- Monthly balance rollups per account
CREATE OR REPLACE VIEW account_monthly_balances AS
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
