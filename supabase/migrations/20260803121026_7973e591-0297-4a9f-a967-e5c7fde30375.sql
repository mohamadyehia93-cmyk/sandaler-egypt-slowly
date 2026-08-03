-- 1. Conversations: add WITH CHECK preventing participant reassignment
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE OR REPLACE FUNCTION public.prevent_conversation_participant_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.participant_1 IS DISTINCT FROM OLD.participant_1
     OR NEW.participant_2 IS DISTINCT FROM OLD.participant_2 THEN
    RAISE EXCEPTION 'Conversation participants cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_conversation_participant_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS conversations_lock_participants ON public.conversations;
CREATE TRIGGER conversations_lock_participants
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.prevent_conversation_participant_change();

-- 2. Messages: add WITH CHECK so sender_id cannot be spoofed
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- 3. SECURITY DEFINER function no longer callable anonymously
REVOKE EXECUTE ON FUNCTION public.get_follower_count(text, text) FROM anon;
