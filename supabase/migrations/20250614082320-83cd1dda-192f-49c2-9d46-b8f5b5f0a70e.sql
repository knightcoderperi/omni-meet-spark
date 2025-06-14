
-- First, let's drop all existing policies to clean up the mess
DROP POLICY IF EXISTS "Allow authenticated users to create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can join meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can view meetings they host or participate in" ON public.meetings;
DROP POLICY IF EXISTS "Allow authenticated read access to all meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow authenticated users to read meeting details" ON public.meetings;
DROP POLICY IF EXISTS "Allow authenticated users to read meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow authenticated users to read meetings based on their role" ON public.meetings;
DROP POLICY IF EXISTS "Users can update their own meetings" ON public.meetings;

-- Drop all meeting_participants policies
DROP POLICY IF EXISTS "Hosts can manage and remove participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Hosts and users can update participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Consolidated update policy for participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Consolidated policy for inserting participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Hosts can manage participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Hosts can add participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Participants can be added" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can add or manage participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can join meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view participants for meetings they're part of" ON public.meeting_participants;
DROP POLICY IF EXISTS "Hosts can remove participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Hosts can update participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Hosts can update participants in their meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users and hosts can insert participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can add participants based on their role." ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view and join meetings and participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view participants and manage their meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view participants for their meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view participants in their meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view participants of their meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Participants can update themselves" ON public.meeting_participants;

-- Drop all meeting_analytics policies
DROP POLICY IF EXISTS "Meeting hosts can manage analytics" ON public.meeting_analytics;
DROP POLICY IF EXISTS "Users can view analytics for meetings they participated in" ON public.meeting_analytics;
DROP POLICY IF EXISTS "Users can view analytics for their meetings" ON public.meeting_analytics;
DROP POLICY IF EXISTS "Users can view analytics for their meetings and hosts" ON public.meeting_analytics;
DROP POLICY IF EXISTS "View analytics for hosts and participants" ON public.meeting_analytics;
DROP POLICY IF EXISTS "unified_view_policy" ON public.meeting_analytics;

-- Drop all action_items policies
DROP POLICY IF EXISTS "Users can manage action items for meetings they host" ON public.action_items;
DROP POLICY IF EXISTS "Users can manage and view action items for meetings they host" ON public.action_items;
DROP POLICY IF EXISTS "Users can view action items for their meetings" ON public.action_items;
DROP POLICY IF EXISTS "Users can manage and view action items for their meetings" ON public.action_items;
DROP POLICY IF EXISTS "Users can view and manage action items for their meetings" ON public.action_items;

-- Create optimized security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT (select auth.uid());
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_is_meeting_host(meeting_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.meetings 
    WHERE id = meeting_id_param 
    AND host_id = (select auth.uid())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_is_meeting_participant(meeting_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.meeting_participants 
    WHERE meeting_id = meeting_id_param 
    AND (user_id = (select auth.uid()) OR (select auth.uid()) IS NULL)
    AND status IN ('approved', 'joined')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now create clean, optimized policies

-- Meetings table policies
CREATE POLICY "meetings_insert_policy" ON public.meetings
FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "meetings_select_policy" ON public.meetings
FOR SELECT TO public
USING (true); -- Allow anyone to read meeting details for joining

CREATE POLICY "meetings_update_policy" ON public.meetings
FOR UPDATE TO authenticated
USING (host_id = (select auth.uid()));

CREATE POLICY "meetings_delete_policy" ON public.meetings
FOR DELETE TO authenticated
USING (host_id = (select auth.uid()));

-- Meeting participants table policies
CREATE POLICY "participants_insert_policy" ON public.meeting_participants
FOR INSERT TO public
WITH CHECK (
  user_id = (select auth.uid()) OR 
  (select auth.uid()) IS NULL OR
  public.user_is_meeting_host(meeting_id)
);

CREATE POLICY "participants_select_policy" ON public.meeting_participants
FOR SELECT TO public
USING (
  user_id = (select auth.uid()) OR 
  (select auth.uid()) IS NULL OR
  public.user_is_meeting_host(meeting_id) OR
  public.user_is_meeting_participant(meeting_id)
);

CREATE POLICY "participants_update_policy" ON public.meeting_participants
FOR UPDATE TO public
USING (
  user_id = (select auth.uid()) OR
  public.user_is_meeting_host(meeting_id)
);

CREATE POLICY "participants_delete_policy" ON public.meeting_participants
FOR DELETE TO public
USING (
  user_id = (select auth.uid()) OR
  public.user_is_meeting_host(meeting_id)
);

-- Meeting analytics table policies
CREATE POLICY "analytics_select_policy" ON public.meeting_analytics
FOR SELECT TO public
USING (
  public.user_is_meeting_host(meeting_id) OR
  public.user_is_meeting_participant(meeting_id)
);

CREATE POLICY "analytics_insert_policy" ON public.meeting_analytics
FOR INSERT TO authenticated
WITH CHECK (public.user_is_meeting_host(meeting_id));

CREATE POLICY "analytics_update_policy" ON public.meeting_analytics
FOR UPDATE TO authenticated
USING (public.user_is_meeting_host(meeting_id));

-- Action items table policies (fixed column name)
CREATE POLICY "action_items_select_policy" ON public.action_items
FOR SELECT TO public
USING (
  public.user_is_meeting_host(meeting_id) OR
  public.user_is_meeting_participant(meeting_id)
);

CREATE POLICY "action_items_insert_policy" ON public.action_items
FOR INSERT TO authenticated
WITH CHECK (
  public.user_is_meeting_host(meeting_id) OR
  public.user_is_meeting_participant(meeting_id)
);

CREATE POLICY "action_items_update_policy" ON public.action_items
FOR UPDATE TO authenticated
USING (
  public.user_is_meeting_host(meeting_id) OR
  public.user_is_meeting_participant(meeting_id)
);

CREATE POLICY "action_items_delete_policy" ON public.action_items
FOR DELETE TO authenticated
USING (
  public.user_is_meeting_host(meeting_id) OR
  assignee_id = (select auth.uid())
);

-- Fix the can_join_meeting function to work properly
CREATE OR REPLACE FUNCTION public.can_join_meeting(meeting_code_param text, user_id_param uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    meeting_record RECORD;
    participant_record RECORD;
BEGIN
    -- Get meeting details
    SELECT id, host_id, is_active, require_approval, meeting_password
    INTO meeting_record
    FROM public.meetings
    WHERE meeting_code = meeting_code_param;

    -- Check if meeting exists
    IF meeting_record.id IS NULL THEN
        RETURN jsonb_build_object(
            'can_join', false,
            'reason', 'Meeting not found'
        );
    END IF;

    -- Check if meeting is active
    IF NOT meeting_record.is_active THEN
        RETURN jsonb_build_object(
            'can_join', false,
            'reason', 'Meeting is not active'
        );
    END IF;

    -- Check if user is host
    IF user_id_param = meeting_record.host_id THEN
        RETURN jsonb_build_object(
            'can_join', true,
            'meeting_id', meeting_record.id,
            'is_host', true,
            'requires_approval', false,
            'password_required', meeting_record.meeting_password IS NOT NULL AND meeting_record.meeting_password != ''
        );
    END IF;

    -- Check if user is already a participant
    SELECT * INTO participant_record
    FROM public.meeting_participants
    WHERE meeting_id = meeting_record.id 
    AND (user_id = user_id_param OR user_id_param IS NULL);

    IF participant_record.id IS NOT NULL THEN
        IF participant_record.status = 'approved' THEN
            RETURN jsonb_build_object(
                'can_join', true,
                'meeting_id', meeting_record.id,
                'is_host', false,
                'requires_approval', false,
                'password_required', meeting_record.meeting_password IS NOT NULL AND meeting_record.meeting_password != ''
            );
        ELSIF participant_record.status = 'pending' THEN
            RETURN jsonb_build_object(
                'can_join', false,
                'reason', 'Waiting for host approval'
            );
        ELSIF participant_record.status = 'rejected' THEN
            RETURN jsonb_build_object(
                'can_join', false,
                'reason', 'Access denied by host'
            );
        END IF;
    END IF;

    -- New participant - return join requirements
    RETURN jsonb_build_object(
        'can_join', true,
        'meeting_id', meeting_record.id,
        'is_host', false,
        'requires_approval', COALESCE(meeting_record.require_approval, false),
        'password_required', meeting_record.meeting_password IS NOT NULL AND meeting_record.meeting_password != ''
    );
END;
$$;
