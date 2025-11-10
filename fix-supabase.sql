-- ============================================
-- FIX: Add missing 'timestamp' column and allow anonymous access
-- ============================================

-- Option 1: Add 'timestamp' column that mirrors 'started_at'
-- (This way we don't break existing code)
ALTER TABLE workflow_executions
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE;

-- Copy existing started_at values to timestamp
UPDATE workflow_executions
SET timestamp = started_at
WHERE timestamp IS NULL;

-- Make timestamp default to started_at for new rows
ALTER TABLE workflow_executions
ALTER COLUMN timestamp SET DEFAULT NOW();

-- Create a trigger to keep timestamp in sync with started_at
CREATE OR REPLACE FUNCTION sync_timestamp_with_started_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.timestamp = NEW.started_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_from_started_at ON workflow_executions;
CREATE TRIGGER set_timestamp_from_started_at
    BEFORE INSERT OR UPDATE ON workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION sync_timestamp_with_started_at();

-- ============================================
-- FIX: Allow anonymous read access for the dashboard
-- ============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Service role has full access to workflow_executions" ON workflow_executions;

-- Create new policies
CREATE POLICY "Allow anonymous read access to workflow_executions"
    ON workflow_executions FOR SELECT
    USING (true);

CREATE POLICY "Allow service role full access to workflow_executions"
    ON workflow_executions FOR ALL
    USING (auth.role() = 'service_role');

-- Same for clients table
DROP POLICY IF EXISTS "Service role has full access to clients" ON clients;

CREATE POLICY "Allow anonymous read access to clients"
    ON clients FOR SELECT
    USING (true);

CREATE POLICY "Allow service role full access to clients"
    ON clients FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- Verify the fix
-- ============================================

-- Check if timestamp column exists and has data
SELECT
    id,
    client_id,
    workflow_name,
    status,
    started_at,
    timestamp,
    event_type
FROM workflow_executions
LIMIT 5;

-- Test the exact query the app uses
SELECT COUNT(*) as total_rows
FROM workflow_executions
WHERE client_id = '2e75e60c-2362-42d1-8300-225944efb8db'
AND timestamp >= NOW() - INTERVAL '7 days';
