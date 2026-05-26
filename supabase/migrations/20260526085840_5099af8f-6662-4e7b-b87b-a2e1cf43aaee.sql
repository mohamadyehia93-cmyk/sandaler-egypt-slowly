-- Enable RLS on realtime broker
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop if rerun
DROP POLICY IF EXISTS "Participants read realtime for own conversations" ON realtime.messages;
DROP POLICY IF EXISTS "Users read realtime for own user topic" ON realtime.messages;

-- Conversation topics: "conversation:<uuid>"
CREATE POLICY "Participants read realtime for own conversations"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  split_part(realtime.topic(), ':', 1) = 'conversation'
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = split_part(realtime.topic(), ':', 2)
      AND (auth.uid() = c.participant_1 OR auth.uid() = c.participant_2)
  )
);

-- Personal user topics: "user:<uuid>"
CREATE POLICY "Users read realtime for own user topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  split_part(realtime.topic(), ':', 1) = 'user'
  AND split_part(realtime.topic(), ':', 2) = auth.uid()::text
);