-- Create role change requests table (fixed column names)
CREATE TABLE public.role_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  from_role TEXT NOT NULL,
  to_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by_name TEXT NOT NULL,
  requested_by_email TEXT NOT NULL,
  reason TEXT,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.role_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own role change requests" 
ON public.role_change_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create role change requests" 
ON public.role_change_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view and manage requests for their organization
CREATE POLICY "Admins can manage role change requests for their organization" 
ON public.role_change_requests 
FOR ALL 
USING (
  organization IN (
    SELECT p.organization 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'administrator'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_role_change_requests_updated_at
BEFORE UPDATE ON public.role_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();