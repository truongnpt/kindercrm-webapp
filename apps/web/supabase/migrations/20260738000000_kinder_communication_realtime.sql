/*
 * Enable Supabase Realtime for parent ↔ school chat (Messenger-style live updates).
 */

alter table public.communication_messages replica identity full;
alter table public.communication_threads replica identity full;

alter publication supabase_realtime add table public.communication_messages;
alter publication supabase_realtime add table public.communication_threads;
