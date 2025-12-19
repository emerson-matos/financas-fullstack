-- Add transacted_time column to transactions (TIMETZ for timezone awareness)
ALTER TABLE thc.transactions ADD COLUMN IF NOT EXISTS transacted_time TIMETZ;

-- Update the unified_timeline view to combine date and time
CREATE OR REPLACE VIEW thc.unified_timeline AS
SELECT 
    activity_log.id,
    activity_log.user_id,
    activity_log.account_id,
    'ACTIVITY'::text AS entry_type,
    activity_log.type AS highlight_type,
    activity_log.data,
    NULL::numeric AS amount,
    NULL::text AS currency,
    NULL::text AS description,
    activity_log.created_at AS event_time
FROM thc.activity_log
UNION ALL
SELECT 
    t.id,
    ua.user_id,
    t.account_id,
    'TRANSACTION'::text AS entry_type,
    t.kind AS highlight_type,
    jsonb_build_object('name', t.name, 'category_id', t.category_id) AS data,
    t.amount,
    t.currency,
    t.description,
    COALESCE(
        (t.transacted_date + COALESCE(t.transacted_time, '00:00:00'::TIMETZ)) AT TIME ZONE 'UTC',
        t.created_at
    ) AS event_time
FROM thc.transactions t
JOIN thc.user_accounts ua ON t.account_id = ua.id;

-- Ensure RLS and permissions are maintained (assuming they were already set on the schema/tables)
GRANT SELECT ON thc.unified_timeline TO authenticated;
GRANT SELECT ON thc.unified_timeline TO service_role;
