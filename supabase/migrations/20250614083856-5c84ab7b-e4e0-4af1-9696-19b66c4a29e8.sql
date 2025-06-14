
-- Drop ALL existing policies on meetings table to start clean
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies for meetings table
    FOR policy_record IN
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'meetings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.meetings', policy_record.policyname);
    END LOOP;
END $$;

-- Now create the optimized policies that address the auth RLS initialization plan issue
-- By using (SELECT auth.uid()) instead of auth.uid() directly, we prevent re-evaluation for each row

-- Single, optimized select policy
CREATE POLICY "meetings_optimized_select_policy" ON public.meetings
FOR SELECT TO public
USING (
  -- Allow if user is the host - using subquery to prevent re-evaluation
  host_id = (SELECT auth.uid()) OR 
  -- Allow if user is a participant with approved status
  EXISTS (
    SELECT 1 FROM public.meeting_participants 
    WHERE meeting_id = meetings.id 
    AND user_id = (SELECT auth.uid())
    AND status IN ('approved', 'joined')
  ) OR
  -- Allow anonymous access for joining meetings
  (SELECT auth.uid()) IS NULL
);

-- Create insert policy for meetings
CREATE POLICY "meetings_insert_policy" ON public.meetings
FOR INSERT TO authenticated
WITH CHECK (host_id = (SELECT auth.uid()));

-- Create update policy for meetings
CREATE POLICY "meetings_update_policy" ON public.meetings
FOR UPDATE TO authenticated
USING (host_id = (SELECT auth.uid()))
WITH CHECK (host_id = (SELECT auth.uid()));

-- Create delete policy for meetings
CREATE POLICY "meetings_delete_policy" ON public.meetings
FOR DELETE TO authenticated
USING (host_id = (SELECT auth.uid()));
