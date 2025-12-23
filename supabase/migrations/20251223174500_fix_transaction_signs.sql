-- Fix transaction signs for consistency
-- Ensure DEBITs are negative and CREDITs are positive
UPDATE thc.transactions 
SET amount = -ABS(amount) 
WHERE kind = 'DEBIT' AND amount > 0;

UPDATE thc.transactions 
SET amount = ABS(amount) 
WHERE kind = 'CREDIT' AND amount < 0;
