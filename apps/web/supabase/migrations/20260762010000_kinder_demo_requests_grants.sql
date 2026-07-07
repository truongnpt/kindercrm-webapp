-- MARKETING-001 follow-up: grant minimal privileges for public request-demo API

grant usage on schema public to anon, authenticated;

grant insert on table public.demo_requests to anon, authenticated;
grant select, update on table public.demo_requests to authenticated;
