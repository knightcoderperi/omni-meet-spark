
-- First, let's see what indexes exist on the meetings table and remove duplicates
-- Drop the duplicate index on meeting_code (keeping the unique constraint one)
DROP INDEX IF EXISTS idx_meetings_meeting_code;

-- The unique constraint already provides an index, so we don't need the additional one
-- Let's also ensure we have the right indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_meetings_host_id_active ON public.meetings(host_id, is_active);
CREATE INDEX IF NOT EXISTS idx_meetings_status_scheduled ON public.meetings(status, scheduled_time) WHERE status = 'scheduled';
