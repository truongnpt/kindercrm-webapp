/*
 * Reply-to support for communication messages.
 */

alter table public.communication_messages
  add column if not exists reply_to_message_id uuid
    references public.communication_messages (id) on delete set null;

create index if not exists idx_communication_messages_reply_to
  on public.communication_messages (reply_to_message_id)
  where reply_to_message_id is not null;
