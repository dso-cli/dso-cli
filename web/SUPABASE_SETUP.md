# Supabase Setup

Supabase integration is optional and mainly used for persistence/collaboration features in the web interface.

## 1) Create a Supabase Project

1. Sign in at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

## 2) Initialize Database Schema

Run `web/supabase/schema.sql` in the Supabase SQL editor.

## 3) Configure Environment

Create a `.env` file in `web/` with:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 4) Verify Integration

Start the web app and ensure database-backed features load correctly.  
If Supabase is not configured, the app should still run in local mode.
