-- Circle AI Inspector Database Schema
-- Initial migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- INSPECTION SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Site info (captured at inspection start)
    site_name TEXT NOT NULL,
    site_address TEXT,
    site_latitude DECIMAL(10, 8) NOT NULL,
    site_longitude DECIMAL(11, 8) NOT NULL,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Status
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    findings_count INTEGER DEFAULT 0 NOT NULL,

    -- Report reference
    report_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.inspection_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.inspection_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.inspection_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON public.inspection_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_sessions_user_id ON public.inspection_sessions(user_id);
CREATE INDEX idx_sessions_status ON public.inspection_sessions(status);
CREATE INDEX idx_sessions_created_at ON public.inspection_sessions(created_at DESC);

-- ============================================
-- SESSION FINDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.session_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.inspection_sessions(id) ON DELETE CASCADE,

    -- Timing
    timestamp_seconds DECIMAL(10, 2) NOT NULL,

    -- Finding details
    category TEXT NOT NULL CHECK (category IN ('safety', 'security', 'compliance', 'maintenance')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title TEXT NOT NULL,
    description TEXT,
    location_hint TEXT,

    -- AI metadata
    ai_confidence DECIMAL(3, 2),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.session_findings ENABLE ROW LEVEL SECURITY;

-- Users can view findings for their sessions
CREATE POLICY "Users can view own session findings"
    ON public.session_findings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_sessions
            WHERE id = session_findings.session_id
            AND user_id = auth.uid()
        )
    );

-- Users can insert findings for their sessions
CREATE POLICY "Users can insert findings for own sessions"
    ON public.session_findings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inspection_sessions
            WHERE id = session_findings.session_id
            AND user_id = auth.uid()
        )
    );

-- Index for faster lookups
CREATE INDEX idx_findings_session_id ON public.session_findings(session_id);
CREATE INDEX idx_findings_severity ON public.session_findings(severity);

-- ============================================
-- INSPECTION REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.inspection_sessions(id) ON DELETE CASCADE UNIQUE,

    -- Inspector accountability
    inspector_name TEXT NOT NULL,
    inspector_email TEXT NOT NULL,
    inspector_acknowledged BOOLEAN DEFAULT FALSE NOT NULL,

    -- Report content (JSONB for flexibility)
    summary JSONB,
    findings JSONB,
    recommendations JSONB,
    disclaimer JSONB,

    -- PDF and delivery
    pdf_storage_path TEXT,
    email_sent_to TEXT[],
    email_sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;

-- Users can view reports for their sessions
CREATE POLICY "Users can view own reports"
    ON public.inspection_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_sessions
            WHERE id = inspection_reports.session_id
            AND user_id = auth.uid()
        )
    );

-- Users can insert reports for their sessions
CREATE POLICY "Users can insert reports for own sessions"
    ON public.inspection_reports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inspection_sessions
            WHERE id = inspection_reports.session_id
            AND user_id = auth.uid()
        )
    );

-- Users can update their own reports
CREATE POLICY "Users can update own reports"
    ON public.inspection_reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_sessions
            WHERE id = inspection_reports.session_id
            AND user_id = auth.uid()
        )
    );

-- Index
CREATE INDEX idx_reports_session_id ON public.inspection_reports(session_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment findings count
CREATE OR REPLACE FUNCTION public.increment_findings_count(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.inspection_sessions
    SET findings_count = findings_count + 1
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create bucket for inspection reports (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for reports bucket
CREATE POLICY "Users can upload own reports"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'reports' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own reports"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'reports' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
