-- Temporarily disable RLS and foreign key constraints for seeding test data
-- This should be re-enabled after seeding is complete

-- Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;

-- Temporarily drop foreign key constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_owner_id_fkey;
ALTER TABLE public.programs DROP CONSTRAINT IF EXISTS programs_user_id_fkey;
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_company_id_fkey;