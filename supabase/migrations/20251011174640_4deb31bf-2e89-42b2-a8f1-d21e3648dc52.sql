-- ============================================
-- OPTION 1: Complete Role-Based Access & Organization Isolation
-- ============================================

-- Step 1: Normalize existing role data
UPDATE public.profiles 
SET role = 'technician' 
WHERE role = 'pharmacy_tech';

-- Step 2: Create user_roles table (enum already exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization TEXT NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, organization)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, organization, role)
SELECT user_id, organization, role::app_role
FROM public.profiles
WHERE organization IS NOT NULL AND organization != ''
ON CONFLICT (user_id, organization) DO NOTHING;

-- Step 4: Create security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _organization TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND organization = _organization
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Step 5: RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their organization" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles in their organization"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'administrator'
      AND ur.organization = user_roles.organization
  )
);

-- Step 6: Remove the problematic admin policy from profiles
DROP POLICY IF EXISTS "Administrators can update user roles" ON public.profiles;

-- Step 7: Add organization column to all data tables
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS organization TEXT;

-- Step 8: Create trigger to auto-populate organization
CREATE OR REPLACE FUNCTION public.set_organization_from_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organization IS NULL OR NEW.organization = '' THEN
    SELECT profiles.organization INTO NEW.organization
    FROM public.profiles
    WHERE profiles.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_customers_organization ON public.customers;
DROP TRIGGER IF EXISTS set_medications_organization ON public.medications;
DROP TRIGGER IF EXISTS set_inventory_organization ON public.inventory;
DROP TRIGGER IF EXISTS set_orders_organization ON public.orders;
DROP TRIGGER IF EXISTS set_alerts_organization ON public.alerts;

CREATE TRIGGER set_customers_organization
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.set_organization_from_user();

CREATE TRIGGER set_medications_organization
BEFORE INSERT ON public.medications
FOR EACH ROW EXECUTE FUNCTION public.set_organization_from_user();

CREATE TRIGGER set_inventory_organization
BEFORE INSERT ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.set_organization_from_user();

CREATE TRIGGER set_orders_organization
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_organization_from_user();

CREATE TRIGGER set_alerts_organization
BEFORE INSERT ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.set_organization_from_user();

-- Step 9: Add organization-based RLS policies

-- Customers
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view customers in their organization" ON public.customers;
DROP POLICY IF EXISTS "Users can manage customers in their organization" ON public.customers;

CREATE POLICY "Users can view customers in their organization"
ON public.customers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = customers.organization
  )
);

CREATE POLICY "Users can manage customers in their organization"
ON public.customers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = customers.organization
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = customers.organization
  )
);

-- Medications
DROP POLICY IF EXISTS "Authenticated users can view medications" ON public.medications;
DROP POLICY IF EXISTS "Authenticated users can manage medications" ON public.medications;
DROP POLICY IF EXISTS "Users can view medications in their organization" ON public.medications;
DROP POLICY IF EXISTS "Users can manage medications in their organization" ON public.medications;

CREATE POLICY "Users can view medications in their organization"
ON public.medications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = medications.organization
  )
);

CREATE POLICY "Users can manage medications in their organization"
ON public.medications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = medications.organization
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = medications.organization
  )
);

-- Inventory
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can view inventory in their organization" ON public.inventory;
DROP POLICY IF EXISTS "Users can manage inventory in their organization" ON public.inventory;

CREATE POLICY "Users can view inventory in their organization"
ON public.inventory FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = inventory.organization
  )
);

CREATE POLICY "Users can manage inventory in their organization"
ON public.inventory FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = inventory.organization
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = inventory.organization
  )
);

-- Orders
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders in their organization" ON public.orders;
DROP POLICY IF EXISTS "Users can manage orders in their organization" ON public.orders;

CREATE POLICY "Users can view orders in their organization"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = orders.organization
  )
);

CREATE POLICY "Users can manage orders in their organization"
ON public.orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = orders.organization
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = orders.organization
  )
);

-- Alerts
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can manage alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can view alerts in their organization" ON public.alerts;
DROP POLICY IF EXISTS "Users can manage alerts in their organization" ON public.alerts;

CREATE POLICY "Users can view alerts in their organization"
ON public.alerts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = alerts.organization
  )
);

CREATE POLICY "Users can manage alerts in their organization"
ON public.alerts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = alerts.organization
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization = alerts.organization
  )
);