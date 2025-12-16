-- Set search path to use thc schema
SET search_path TO thc, public;

CREATE OR REPLACE VIEW budget_items_with_spent AS
WITH tx_amounts AS (
    -- Non-split transactions
    SELECT
        t.category_id,
        t.amount,
        t.transacted_date
    FROM transactions t
    WHERE NOT EXISTS (
        SELECT 1
        FROM transaction_splits ts
        WHERE ts.transaction_id = t.id
    )

    UNION ALL

    -- Split transactions
    SELECT
        ts.category_id,
        ts.amount,
        t.transacted_date
    FROM transaction_splits ts
    JOIN transactions t ON t.id = ts.transaction_id
)
SELECT
    bi.id,
    bi.budget_id,
    bi.category_id,
    bi.amount AS planned,
    COALESCE(
        SUM(tx.amount) FILTER (
            WHERE tx.transacted_date BETWEEN b.start_date AND b.end_date
        ),
        0
    ) AS spent
FROM budget_items bi
JOIN budgets b ON b.id = bi.budget_id
LEFT JOIN tx_amounts tx ON tx.category_id = bi.category_id
GROUP BY
    bi.id,
    bi.budget_id,
    bi.category_id,
    bi.amount;
