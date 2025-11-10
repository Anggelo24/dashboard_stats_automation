-- ============================================
-- FIX: Allow anonymous read access for dashboard
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Fix workflow_executions table
-- ============================================

-- Drop the restrictive service-role-only policy
DROP POLICY IF EXISTS "Service role has full access to workflow_executions" ON workflow_executions;

-- Allow anonymous users to READ workflow execution data (for dashboard)
CREATE POLICY "Allow anonymous read access to workflow_executions"
    ON workflow_executions FOR SELECT
    USING (true);

-- Allow service role full access (for N8N webhooks to insert data)
CREATE POLICY "Allow service role full access to workflow_executions"
    ON workflow_executions FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 2. Fix clients table
-- ============================================

-- Drop the restrictive service-role-only policy
DROP POLICY IF EXISTS "Service role has full access to clients" ON clients;

-- Allow anonymous users to READ client info (for dashboard branding)
CREATE POLICY "Allow anonymous read access to clients"
    ON clients FOR SELECT
    USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to clients"
    ON clients FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 3. OPTIONAL: Fix other tables if needed
-- ============================================

-- If you're using workflow_metrics table
DROP POLICY IF EXISTS "Service role has full access to workflow_metrics" ON workflow_metrics;

CREATE POLICY "Allow anonymous read access to workflow_metrics"
    ON workflow_metrics FOR SELECT
    USING (true);

CREATE POLICY "Allow service role full access to workflow_metrics"
    ON workflow_metrics FOR ALL
    USING (auth.role() = 'service_role');

-- If you're using event_type_metrics table
DROP POLICY IF EXISTS "Service role has full access to event_type_metrics" ON event_type_metrics;

CREATE POLICY "Allow anonymous read access to event_type_metrics"
    ON event_type_metrics FOR SELECT
    USING (true);

CREATE POLICY "Allow service role full access to event_type_metrics"
    ON event_type_metrics FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 4. Verify the policies are working
-- ============================================

-- List all policies on workflow_executions
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'workflow_executions';

-- Test query (should work now)
SELECT COUNT(*) as total_executions
FROM workflow_executions
WHERE client_id = '2e75e60c-2362-42d1-8300-225944efb8db';
