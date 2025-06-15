
-- First, let's check and fix any issues with the meeting-related tables
-- Add indexes for better performance on frequently queried fields
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_code ON public.meetings(meeting_code);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON public.meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON public.meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON public.meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_lobby_queue_meeting_id ON public.lobby_queue(meeting_id);

-- Ensure meeting codes are unique and properly formatted
ALTER TABLE public.meetings ADD CONSTRAINT unique_meeting_code UNIQUE (meeting_code);

-- Add a function to normalize meeting codes consistently
CREATE OR REPLACE FUNCTION public.normalize_meeting_code(code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT UPPER(TRIM(code));
$$;

-- Update the can_join_meeting function to use normalized meeting codes
CREATE OR REPLACE FUNCTION public.can_join_meeting(meeting_code_param text, user_id_param uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    meeting_record RECORD;
    participant_record RECORD;
    normalized_code text;
BEGIN
    -- Normalize the meeting code
    normalized_code := public.normalize_meeting_code(meeting_code_param);
    
    -- Get meeting details using normalized code
    SELECT id, host_id, is_active, require_approval, meeting_password
    INTO meeting_record
    FROM public.meetings
    WHERE public.normalize_meeting_code(meeting_code) = normalized_code;

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
        IF participant_record.status = 'approved' OR participant_record.status = 'joined' THEN
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
        ELSIF participant_record.status = 'denied' OR participant_record.status = 'rejected' THEN
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
$function$;

-- Add a function to get meeting by normalized code
CREATE OR REPLACE FUNCTION public.get_meeting_by_code(meeting_code_param text)
RETURNS TABLE(
    id uuid,
    title text,
    meeting_code text,
    host_id uuid,
    is_active boolean,
    require_approval boolean,
    meeting_password text,
    created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT 
        m.id,
        m.title,
        m.meeting_code,
        m.host_id,
        m.is_active,
        m.require_approval,
        m.meeting_password,
        m.created_at
    FROM public.meetings m
    WHERE public.normalize_meeting_code(m.meeting_code) = public.normalize_meeting_code(meeting_code_param)
    AND m.is_active = true;
$$;
