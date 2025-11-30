-- DSO Database Schema for Supabase
-- This schema tracks scans, findings, fixes, and provides analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  repository_url TEXT,
  provider TEXT, -- 'github', 'gitlab', 'local'
  language TEXT,
  framework TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- Scans table
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  total_findings INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  fixable_count INTEGER DEFAULT 0,
  exploitable_count INTEGER DEFAULT 0,
  duration_ms INTEGER,
  scan_path TEXT NOT NULL,
  scan_format TEXT DEFAULT 'json', -- 'json', 'text'
  verbose BOOLEAN DEFAULT false,
  tools_used TEXT[], -- Array of tools used: ['trivy', 'gitleaks', 'grype', 'tfsec']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Findings table
CREATE TABLE IF NOT EXISTS public.findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  finding_id TEXT NOT NULL, -- Original finding ID from scanner
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  tool TEXT NOT NULL, -- 'trivy', 'gitleaks', 'grype', 'tfsec'
  type TEXT, -- 'SECRET', 'DEPENDENCY', 'SAST', 'IAC', 'CONFIG'
  fixable BOOLEAN DEFAULT false,
  exploitable BOOLEAN DEFAULT false,
  cvss_score NUMERIC(3,1),
  cve_id TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'fixed', 'ignored', 'false_positive'
  fixed_at TIMESTAMPTZ,
  fixed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixes table (track applied fixes)
CREATE TABLE IF NOT EXISTS public.fixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finding_id UUID REFERENCES public.findings(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  fix_type TEXT NOT NULL, -- 'auto', 'manual'
  fix_command TEXT,
  status TEXT DEFAULT 'applied', -- 'applied', 'failed', 'reverted'
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reverted_at TIMESTAMPTZ,
  error_message TEXT
);

-- AI Analysis table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  business_impact TEXT,
  model_used TEXT, -- Ollama model name
  analysis_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Top Fixes table (from AI analysis)
CREATE TABLE IF NOT EXISTS public.top_fixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES public.ai_analysis(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES public.findings(id) ON DELETE CASCADE,
  priority INTEGER, -- 1 = highest priority
  fix_command TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan History (for analytics)
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  total_scans INTEGER DEFAULT 1,
  total_findings INTEGER DEFAULT 0,
  critical_trend INTEGER DEFAULT 0, -- Change from previous day
  high_trend INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, scan_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_project_id ON public.scans(project_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON public.findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON public.findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_status ON public.findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_file_path ON public.findings(file_path);
CREATE INDEX IF NOT EXISTS idx_fixes_finding_id ON public.fixes(finding_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own findings" ON public.findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = findings.scan_id
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own fixes" ON public.fixes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fixes" ON public.fixes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analysis" ON public.ai_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = ai_analysis.scan_id
      AND scans.user_id = auth.uid()
    )
  );

-- Functions for analytics
CREATE OR REPLACE FUNCTION public.get_scan_statistics(user_uuid UUID, days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_scans BIGINT,
  total_findings BIGINT,
  critical_count BIGINT,
  high_count BIGINT,
  average_duration_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_scans,
    SUM(total_findings)::BIGINT as total_findings,
    SUM(critical_count)::BIGINT as critical_count,
    SUM(high_count)::BIGINT as high_count,
    AVG(duration_ms)::NUMERIC as average_duration_ms
  FROM public.scans
  WHERE user_id = user_uuid
    AND created_at >= NOW() - (days || ' days')::INTERVAL
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trend data
CREATE OR REPLACE FUNCTION public.get_finding_trends(project_uuid UUID, days INTEGER DEFAULT 30)
RETURNS TABLE (
  scan_date DATE,
  total_findings INTEGER,
  critical_count INTEGER,
  high_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as scan_date,
    SUM(total_findings)::INTEGER as total_findings,
    SUM(critical_count)::INTEGER as critical_count,
    SUM(high_count)::INTEGER as high_count
  FROM public.scans
  WHERE project_id = project_uuid
    AND created_at >= NOW() - (days || ' days')::INTERVAL
    AND status = 'completed'
  GROUP BY DATE(created_at)
  ORDER BY scan_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

