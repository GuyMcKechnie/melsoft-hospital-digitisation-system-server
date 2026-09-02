-- Melsoft Hospital Digitisation System - Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'staff', 'user', 'patient'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'deleted', etc.
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "lastLogin" TIMESTAMPTZ,
    "deletedAt" TIMESTAMPTZ
);

-- 3. Tokens Table (for Refresh & Reset tokens)
CREATE TABLE IF NOT EXISTS public.tokens (
    token TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'refresh', 'reset'
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    doctor TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Completed', 'Cancelled'
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    fromname TEXT,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed'
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    createdat TIMESTAMPTZ NOT NULL DEFAULT now(),
    updatedat TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);

CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.tokens (token);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date);

CREATE INDEX IF NOT EXISTS idx_enquiries_userid ON public.enquiries (userid);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);

-- 7. Permissions & RLS Configuration
-- Disables RLS so the Express backend API (using service role or anon key) can manage operations
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;

-- Grant permissions to Supabase roles
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tokens TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.appointments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.enquiries TO anon, authenticated, service_role;
