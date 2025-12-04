-- Update the handle_new_user function to properly respect the role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text;
  org_exists boolean;
BEGIN
  -- Check if organization already exists in profiles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE organization = COALESCE(NEW.raw_user_meta_data ->> 'organization', '')
  ) INTO org_exists;
  
  -- If role is explicitly provided in metadata, use it (e.g., admin creating org or staff)
  -- Otherwise, if organization doesn't exist in profiles, make user an administrator
  -- Otherwise, default to pharmacist
  IF NEW.raw_user_meta_data ->> 'role' IS NOT NULL AND NEW.raw_user_meta_data ->> 'role' != '' THEN
    user_role := NEW.raw_user_meta_data ->> 'role';
  ELSIF NOT org_exists THEN
    user_role := 'administrator';
  ELSE
    user_role := 'pharmacist';
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, email, organization, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'organization', ''),
    user_role
  );
  RETURN NEW;
END;
$$;