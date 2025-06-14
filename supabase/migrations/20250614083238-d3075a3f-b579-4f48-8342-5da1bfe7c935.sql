
-- Fix the multiple permissive policies issue on meetings table
-- Drop the old policy that's causing the conflict
DROP POLICY IF EXISTS "Allow authenticated users to read meetings based on their role" ON public.meetings;

-- Update functions to have immutable search_path for security
-- Fix can_join_meeting function
CREATE OR REPLACE FUNCTION public.can_join_meeting(meeting_code_param text, user_id_param uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix generate_shareable_link function
CREATE OR REPLACE FUNCTION public.generate_shareable_link(meeting_code text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    RETURN 'https://omnimeet.app/join/' || meeting_code;
END;
$$;

-- Fix create_instant_meeting function
CREATE OR REPLACE FUNCTION public.create_instant_meeting(user_id uuid, title text, description text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    new_meeting_id uuid;
    generated_meeting_code text;
BEGIN
    -- Generate a unique meeting code
    generated_meeting_code := public.generate_meeting_code();

    INSERT INTO public.meetings (host_id, title, description, meeting_code, scheduled_time, is_active)
    VALUES (user_id, title, description, generated_meeting_code, now(), true)
    RETURNING id INTO new_meeting_id;

    RETURN new_meeting_id;
END;
$$;

-- Fix get_current_user_id function
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';

-- Fix user_is_meeting_host function
CREATE OR REPLACE FUNCTION public.user_is_meeting_host(meeting_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.meetings 
    WHERE id = meeting_id_param 
    AND host_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';

-- Fix user_is_meeting_participant function
CREATE OR REPLACE FUNCTION public.user_is_meeting_participant(meeting_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.meeting_participants 
    WHERE meeting_id = meeting_id_param 
    AND (user_id = auth.uid() OR auth.uid() IS NULL)
    AND status IN ('approved', 'joined')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';

-- Fix generate_meeting_code function
CREATE OR REPLACE FUNCTION public.generate_meeting_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Remove duplicate is_host functions and create one proper one
DROP FUNCTION IF EXISTS public.is_host();
DROP FUNCTION IF EXISTS public.is_host(uuid);

CREATE OR REPLACE FUNCTION public.is_host(user_id uuid, meeting_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meetings 
    WHERE id = meeting_id AND host_id = user_id
  );
$$;

-- Clean up unused functions that might be causing issues
DROP FUNCTION IF EXISTS public.generate_shareable_link() CASCADE;
DROP FUNCTION IF EXISTS public.can_join_meeting() CASCADE;
DROP FUNCTION IF EXISTS public.can_join_meeting(integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_meeting_ids() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_meeting_ids() CASCADE;
