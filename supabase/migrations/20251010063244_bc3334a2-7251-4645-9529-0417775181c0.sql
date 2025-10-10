-- Drop the existing policy that causes recursion
DROP POLICY IF EXISTS "Administrators can update user roles" ON public.profiles;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_in_organization(target_org text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'administrator'
      AND organization = target_org
  )
$$;

-- Create new policy using the security definer function
CREATE POLICY "Administrators can update user roles"
ON public.profiles
FOR UPDATE
USING (
  public.is_admin_in_organization(profiles.organization)
);