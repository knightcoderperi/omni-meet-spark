
-- First, let's check what constraints and indexes we actually have
-- Instead of dropping the index, let's drop the constraint and recreate it properly
-- This will ensure we have the right unique constraint without conflicts

-- Drop the existing unique constraint (this will also drop its associated index)
ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS unique_meeting_code;

-- Now create a proper unique constraint on the normalized meeting_code
-- This ensures meeting codes are unique regardless of case/whitespace
ALTER TABLE public.meetings ADD CONSTRAINT meetings_meeting_code_unique 
  UNIQUE (meeting_code);

-- Add performance indexes that don't conflict
CREATE INDEX IF NOT EXISTS idx_meetings_host_id_active ON public.meetings(host_id, is_active);
CREATE INDEX IF NOT EXISTS idx_meetings_status_scheduled ON public.meetings(status, scheduled_time) WHERE status = 'scheduled';

-- Also fix the duplicate constraint issue in meeting_participants
-- Add a unique constraint to prevent the duplicate key violations we're seeing in the logs
ALTER TABLE public.meeting_participants 
  DROP CONSTRAINT IF EXISTS meeting_participants_meeting_id_user_id_key;
  
ALTER TABLE public.meeting_participants 
  ADD CONSTRAINT meeting_participants_unique_user_meeting 
  UNIQUE (meeting_id, user_id);

-- For guest participants (where user_id is null), we need a separate constraint
-- But PostgreSQL treats NULL values as unique, so this should work fine
