-- Update the current user's role to administrator since they're the first in their organization
UPDATE profiles 
SET role = 'administrator' 
WHERE user_id = '96ff7a86-9096-49d9-90a9-682b9ae26293' 
  AND organization = 'MainAdmin';