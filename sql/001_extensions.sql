-- ============================================================
-- 001_extensions.sql
-- Enable required PostgreSQL extensions
-- Run this first in Supabase SQL Editor
-- ============================================================

-- Required for UUID generation (uuid_generate_v4())
create extension if not exists "uuid-ossp";

-- Required for cryptographic functions
create extension if not exists "pgcrypto";

-- Required for full-text search (used in global search)
create extension if not exists "pg_trgm";
