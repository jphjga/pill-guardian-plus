-- Check and create missing trigger for new user profile creation
-- First, let's see if the trigger exists
DO $$
BEGIN
  -- Drop existing trigger if it exists to recreate it properly
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Update the handle_new_user function to set administrator role for first user of organization
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
  AS $function$
  DECLARE
    user_role text;
    org_exists boolean;
  BEGIN
    -- Check if organization already exists
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE organization = COALESCE(NEW.raw_user_meta_data ->> 'organization', '')
    ) INTO org_exists;
    
    -- If organization doesn't exist, make user an administrator
    -- Otherwise, use the role from signup or default to pharmacist
    IF NOT org_exists THEN
      user_role := 'administrator';
    ELSE
      user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'pharmacist');
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
  $function$;
  
  -- Create the trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;