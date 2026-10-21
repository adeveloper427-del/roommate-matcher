-- Fixes "infinite recursion detected in policy" on conversation_participants.
-- The original SELECT policy queried conversation_participants from within its
-- own USING clause, which Postgres RLS forbids. This is why Messages hung/failed
-- to load. Fix: check membership through a SECURITY DEFINER function instead,
-- which runs outside the caller's RLS context.

create function public.is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id and user_id = auth.uid()
  );
$$;

drop policy if exists "Participants view participant rows for their conversations" on public.conversation_participants;
create policy "Participants view participant rows for their conversations"
  on public.conversation_participants for select
  to authenticated
  using (public.is_conversation_participant(conversation_id));

drop policy if exists "Participants view their conversations" on public.conversations;
create policy "Participants view their conversations"
  on public.conversations for select
  to authenticated
  using (public.is_conversation_participant(id));

drop policy if exists "Participants view messages in their conversations" on public.messages;
create policy "Participants view messages in their conversations"
  on public.messages for select
  to authenticated
  using (public.is_conversation_participant(conversation_id));

drop policy if exists "Participants send messages in their conversations" on public.messages;
create policy "Participants send messages in their conversations"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id and public.is_conversation_participant(conversation_id));

drop policy if exists "Participants mark messages read" on public.messages;
create policy "Participants mark messages read"
  on public.messages for update
  to authenticated
  using (public.is_conversation_participant(conversation_id));
