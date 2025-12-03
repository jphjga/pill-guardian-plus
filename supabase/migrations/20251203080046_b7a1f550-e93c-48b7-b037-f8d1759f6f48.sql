-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('pharmacy', 'hospital', 'chemist', 'drug_store')),
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  max_accounts INTEGER NOT NULL DEFAULT 5,
  current_account_count INTEGER NOT NULL DEFAULT 1,
  license_number TEXT,
  admin_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
USING (name IN (
  SELECT organization FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can update their organization"
ON public.organizations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'administrator'
    AND organization = organizations.name
  )
);

-- Allow new organizations to be created during registration (before user is fully authenticated)
CREATE POLICY "Allow organization creation during signup"
ON public.organizations
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment account count
CREATE OR REPLACE FUNCTION public.increment_organization_account_count(org_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.organizations
  SET current_account_count = current_account_count + 1
  WHERE name = org_name;
END;
$$;

-- Function to check if organization can add more accounts
CREATE OR REPLACE FUNCTION public.can_add_account(org_name TEXT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organizations
    WHERE name = org_name
    AND current_account_count < max_accounts
  )
$$;