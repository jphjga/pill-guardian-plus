-- Create notifications table for user notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  type TEXT NOT NULL, -- 'role_change_response', 'direct_message', 'broadcast'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Extra data like role_change_request_id, new_role, etc.
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins and managers can create notifications for users in their organization
CREATE POLICY "Staff can create notifications in their organization"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  organization IN (
    SELECT p.organization
    FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('administrator', 'manager')
  )
);

-- Create sales table for recording transactions
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash', -- 'cash', 'card', 'insurance', etc.
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Users can view sales in their organization
CREATE POLICY "Users can view sales in their organization"
ON public.sales
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND organization = sales.organization
  )
);

-- Users can create sales in their organization
CREATE POLICY "Users can create sales in their organization"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND organization = sales.organization
  )
);

-- Create sale_items table for individual items in a sale
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sale_items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Users can view sale items for sales in their organization
CREATE POLICY "Users can view sale items in their organization"
ON public.sale_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sales s
    JOIN profiles p ON p.organization = s.organization
    WHERE s.id = sale_items.sale_id
    AND p.user_id = auth.uid()
  )
);

-- Users can create sale items for sales in their organization
CREATE POLICY "Users can create sale items in their organization"
ON public.sale_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sales s
    JOIN profiles p ON p.organization = s.organization
    WHERE s.id = sale_items.sale_id
    AND p.user_id = auth.uid()
  )
);

-- Add barcode column to medications if not exists
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- Create index on barcode for fast lookups
CREATE INDEX IF NOT EXISTS idx_medications_barcode ON public.medications(barcode);

-- Create trigger to update notifications updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update sales updated_at
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;