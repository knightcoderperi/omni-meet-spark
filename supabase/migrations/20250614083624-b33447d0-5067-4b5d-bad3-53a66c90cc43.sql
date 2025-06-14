
-- Fix the multiple permissive policies issue on meetings table by ensuring we have clean, non-overlapping policies
-- First, let's make sure we have proper RLS policies that don't conflict

-- Drop any remaining conflicting policies that might still exist
DROP POLICY IF EXISTS "Allow authenticated users to read meetings based on their role" ON public.meetings;
DROP POLICY IF EXISTS "Allow authenticated read access to all meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow authenticated users to read meeting details" ON public.meetings;

-- Ensure we have a single, clear select policy for meetings
-- This replaces the previous permissive policy that was causing conflicts
CREATE POLICY "meetings_unified_select_policy" ON public.meetings
FOR SELECT TO public
USING (
  -- Allow if user is the host
  host_id = auth.uid() OR 
  -- Allow if user is a participant with approved status
  EXISTS (
    SELECT 1 FROM public.meeting_participants 
    WHERE meeting_id = meetings.id 
    AND user_id = auth.uid() 
    AND status IN ('approved', 'joined')
  ) OR
  -- Allow anonymous access for joining meetings (but limit visible fields through views if needed)
  auth.uid() IS NULL
);

-- Create a function to enable password compromise checking
CREATE OR REPLACE FUNCTION public.enable_password_breach_protection()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function serves as a reminder that password breach protection
  -- needs to be enabled in the Supabase dashboard under Authentication > Settings
  -- It cannot be enabled via SQL - it's a dashboard configuration
  RETURN true;
END;
$$;

-- Create a function to configure email OTP settings
CREATE OR REPLACE FUNCTION public.configure_email_otp_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function serves as a reminder that email OTP expiry settings
  -- need to be configured in the Supabase dashboard under Authentication > Settings
  -- The default 1 hour expiry should be reduced for better security
  RETURN true;
END;
$$;

-- Add a comment to document the manual steps required
COMMENT ON FUNCTION public.enable_password_breach_protection() IS 
'Reminder: Enable password breach protection in Supabase Dashboard > Authentication > Settings > Password Protection';

COMMENT ON FUNCTION public.configure_email_otp_security() IS 
'Reminder: Configure email OTP expiry in Supabase Dashboard > Authentication > Settings > Email OTP expiry (recommend 10-15 minutes instead of 1 hour)';
