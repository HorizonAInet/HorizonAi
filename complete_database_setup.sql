-- ================================================
-- COMPLETE DATABASE SETUP FOR NLP APPLICATION
-- ================================================
-- This script combines all database setup files into a single comprehensive setup
-- Run this entire script in your Supabase SQL Editor
-- 
-- Created: August 20, 2025
-- Purpose: Complete database schema setup with user authentication and API key management
-- ================================================

-- ================================================
-- SECTION 1: CORE TABLES CREATION
-- ================================================

-- 1.1: Create query_history table
CREATE TABLE IF NOT EXISTS public.query_history (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    query TEXT NOT NULL,
    generated_code TEXT,
    result TEXT,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    execution_time FLOAT,
    dataset_info JSONB,
    user_id TEXT,  -- Using TEXT for flexibility
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2: Create uploaded_files table
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Using TEXT for flexibility
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    column_info JSONB,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3: Create user_api_keys table
CREATE TABLE IF NOT EXISTS public.user_api_keys (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key_encrypted TEXT NOT NULL,
    api_provider VARCHAR(50) DEFAULT 'groq',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, api_provider)
);

-- ================================================
-- SECTION 2: INDEXES FOR PERFORMANCE
-- ================================================

-- 2.1: Indexes for query_history table
CREATE INDEX IF NOT EXISTS idx_query_history_timestamp ON public.query_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_query_history_success ON public.query_history(success);
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON public.query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON public.query_history(created_at);
CREATE INDEX IF NOT EXISTS idx_query_history_query ON public.query_history USING gin(to_tsvector('english', query));

-- 2.2: Indexes for uploaded_files table
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_upload_date ON public.uploaded_files(upload_date);

-- 2.3: Indexes for user_api_keys table
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON public.user_api_keys(user_id);

-- ================================================
-- SECTION 3: FUNCTIONS AND TRIGGERS
-- ================================================

-- 3.1: Create function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3.2: Create triggers for automatic updated_at
-- For query_history table
DROP TRIGGER IF EXISTS update_query_history_updated_at ON public.query_history;
CREATE TRIGGER update_query_history_updated_at
    BEFORE UPDATE ON public.query_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- For uploaded_files table
DROP TRIGGER IF EXISTS update_uploaded_files_updated_at ON public.uploaded_files;
CREATE TRIGGER update_uploaded_files_updated_at
    BEFORE UPDATE ON public.uploaded_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- For user_api_keys table
DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON public.user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at 
    BEFORE UPDATE ON public.user_api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) SETUP
-- ================================================

-- 4.1: Enable Row Level Security on all tables
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- ================================================
-- SECTION 5: RLS POLICIES
-- ================================================

-- 5.1: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own queries" ON public.query_history;
DROP POLICY IF EXISTS "Users can insert own queries" ON public.query_history;
DROP POLICY IF EXISTS "Users can update own queries" ON public.query_history;
DROP POLICY IF EXISTS "Users can delete own queries" ON public.query_history;
DROP POLICY IF EXISTS "Allow all operations on query_history" ON public.query_history;

DROP POLICY IF EXISTS "Users can view own files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can insert own files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can update own files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can delete own files" ON public.uploaded_files;

DROP POLICY IF EXISTS "Users can manage own API keys" ON public.user_api_keys;
DROP POLICY IF EXISTS "Service role access" ON public.user_api_keys;

-- 5.2: Create RLS policies for query_history table
CREATE POLICY "Users can view own queries" ON public.query_history
    FOR SELECT USING (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can insert own queries" ON public.query_history
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update own queries" ON public.query_history
    FOR UPDATE USING (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete own queries" ON public.query_history
    FOR DELETE USING (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

-- 5.3: Create RLS policies for uploaded_files table
CREATE POLICY "Users can view own files" ON public.uploaded_files
    FOR SELECT USING (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can insert own files" ON public.uploaded_files
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update own files" ON public.uploaded_files
    FOR UPDATE USING (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete own files" ON public.uploaded_files
    FOR DELETE USING (
        user_id = auth.uid()::text 
        OR 
        auth.role() = 'service_role'
    );

-- 5.4: Create RLS policies for user_api_keys table
-- Service role access (safe because backend validates user identity via JWT)
CREATE POLICY "Service role access" ON public.user_api_keys
    FOR ALL 
    TO service_role 
    USING (true)
    WITH CHECK (true);

-- Authenticated users can manage their own API keys
CREATE POLICY "Users can manage own API keys" ON public.user_api_keys
    FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ================================================
-- SECTION 6: ANALYTICS VIEW
-- ================================================

-- 6.1: Create analytics view for query performance monitoring
CREATE OR REPLACE VIEW public.query_analytics AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_queries,
    COUNT(CASE WHEN success THEN 1 END) as successful_queries,
    ROUND(
        (COUNT(CASE WHEN success THEN 1 END)::numeric / COUNT(*)) * 100, 2
    ) as success_rate,
    AVG(execution_time) as avg_execution_time,
    MAX(execution_time) as max_execution_time,
    MIN(execution_time) as min_execution_time
FROM public.query_history
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- ================================================
-- SECTION 7: PERMISSIONS
-- ================================================

-- 7.1: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.query_history TO authenticated;
GRANT ALL ON public.uploaded_files TO authenticated;
GRANT ALL ON public.user_api_keys TO authenticated;
GRANT ALL ON public.user_api_keys TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================
-- SECTION 8: VERIFICATION QUERIES
-- ================================================

-- 8.1: Verify tables were created successfully
SELECT 
    table_name, 
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('query_history', 'uploaded_files', 'user_api_keys')
ORDER BY table_name;

-- 8.2: Verify columns for user_api_keys table
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_api_keys' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8.3: Verify RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('query_history', 'uploaded_files', 'user_api_keys')
ORDER BY tablename, policyname;

-- 8.4: Verify indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('query_history', 'uploaded_files', 'user_api_keys')
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ================================================
-- SETUP COMPLETE
-- ================================================
-- 
-- This script has created:
-- 1. Core tables: query_history, uploaded_files, user_api_keys
-- 2. Performance indexes on all tables
-- 3. Auto-update triggers for timestamp columns
-- 4. Row Level Security policies for data isolation
-- 5. Analytics view for monitoring
-- 6. Proper permissions for all roles
-- 
-- Your database is now ready for the NLP application!
-- ================================================
