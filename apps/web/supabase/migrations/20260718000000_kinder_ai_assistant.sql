/*
 * EPIC-015 Phase 4 — AI Assistant (AI-001..AI-007 foundation)
 */

create type public.ai_message_role as enum ('user', 'assistant', 'system');

create type public.ai_action_type as enum (
  'chat',
  'daily_comment',
  'report',
  'notification_draft',
  'enrollment_forecast',
  'revenue_forecast'
);

create table public.ai_chat_sessions (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title varchar(200) not null default 'Cuộc trò chuyện mới',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_chat_sessions_set_updated_at
  before update on public.ai_chat_sessions
  for each row execute function public.set_updated_at();

create table public.ai_chat_messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  session_id uuid not null references public.ai_chat_sessions (id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  credits_used integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_ai_chat_messages_session on public.ai_chat_messages (session_id, created_at);

create table public.ai_credit_usage (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  usage_month date not null,
  credits_used integer not null default 0,
  credits_limit integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint ai_credit_usage_school_month_unique unique (school_id, usage_month)
);

create table public.ai_knowledge_articles (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  title varchar(200) not null,
  content text not null,
  category varchar(100) not null default 'general',
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_knowledge_articles_set_updated_at
  before update on public.ai_knowledge_articles
  for each row execute function public.set_updated_at();

alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.ai_credit_usage enable row level security;
alter table public.ai_knowledge_articles enable row level security;

create policy ai_chat_sessions_school on public.ai_chat_sessions
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy ai_chat_messages_school on public.ai_chat_messages
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy ai_credit_usage_school on public.ai_credit_usage
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy ai_knowledge_articles_school on public.ai_knowledge_articles
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update, delete on public.ai_chat_sessions to authenticated, service_role;
grant select, insert, update, delete on public.ai_chat_messages to authenticated, service_role;
grant select, insert, update on public.ai_credit_usage to authenticated, service_role;
grant select, insert, update, delete on public.ai_knowledge_articles to authenticated, service_role;
