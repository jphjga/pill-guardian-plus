-- Allow administrators to update user roles in profiles table
CREATE POLICY "Administrators can update user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'administrator'
    AND admin_profile.organization = profiles.organization
  )
);