-- Add sender_id to notifications table to support conversation threads
ALTER TABLE notifications 
ADD COLUMN sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster conversation queries
CREATE INDEX idx_notifications_conversation 
ON notifications(sender_id, user_id, type) 
WHERE type = 'direct_message';

-- Update RLS policy for notifications insert to allow sender_id
DROP POLICY IF EXISTS "Staff can create notifications in their organization" ON notifications;

CREATE POLICY "Staff can create notifications in their organization" 
ON notifications 
FOR INSERT 
WITH CHECK (
  organization IN (
    SELECT p.organization
    FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('administrator', 'manager', 'pharmacist', 'technician')
  )
);