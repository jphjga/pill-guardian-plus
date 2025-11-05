-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a security definer function to get user's organization without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_organization_safe(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create new policy using the security definer function
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  get_user_organization_safe(auth.uid()) = organization
);