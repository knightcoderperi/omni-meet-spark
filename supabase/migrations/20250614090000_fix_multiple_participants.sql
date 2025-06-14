
-- Update the can_join_meeting function to better handle multiple participants
CREATE OR REPLACE FUNCTION public.can_join_meeting(meeting_code_param text, user_id_param uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    meeting_record RECORD;
    participant_record RECORD;
    participant_count INTEGER;
BEGIN
    -- Get meeting details
    SELECT id, host_id, is_active, require_approval, meeting_password, max_participants
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

    -- Check participant count limit
    SELECT COUNT(*) INTO participant_count
    FROM public.meeting_participants
    WHERE meeting_id = meeting_record.id 
    AND status IN ('approved', 'joined', 'pending');

    IF participant_count >= COALESCE(meeting_record.max_participants, 50) THEN
        RETURN jsonb_build_object(
            'can_join', false,
            'reason', 'Meeting is at maximum capacity'
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

    -- For authenticated users, check if they're already a participant
    IF user_id_param IS NOT NULL THEN
        SELECT * INTO participant_record
        FROM public.meeting_participants
        WHERE meeting_id = meeting_record.id 
        AND user_id = user_id_param;

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
            ELSIF participant_record.status = 'rejected' THEN
                RETURN jsonb_build_object(
                    'can_join', false,
                    'reason', 'Access denied by host'
                );
            END IF;
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

-- Update meetings table to ensure proper defaults for multiple participants
UPDATE public.meetings 
SET max_participants = 50 
WHERE max_participants IS NULL;

-- Make sure max_participants has a default
ALTER TABLE public.meetings 
ALTER COLUMN max_participants SET DEFAULT 50;
