-- NS-TICKET-003: Auth/RLS policy draft
-- This is a draft to document intended Supabase policy boundaries.
-- It is not applied automatically in this ticket.

alter table public.users enable row level security;
alter table public.vocab_items enable row level security;
alter table public.grammar_items enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.exam_seen_feedback enable row level security;
alter table public.item_score_stats enable row level security;

create policy "public can read active vocab items"
  on public.vocab_items
  for select
  using (status = 'active');

create policy "public can read active grammar items"
  on public.grammar_items
  for select
  using (status = 'active');

create policy "public can read item score stats"
  on public.item_score_stats
  for select
  using (true);

create policy "users can read own profile"
  on public.users
  for select
  using (auth.uid() = id);

create policy "authenticated users can update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "public can insert quiz attempts"
  on public.quiz_attempts
  for insert
  with check (true);

create policy "authenticated users can read own exam seen feedback"
  on public.exam_seen_feedback
  for select
  using (auth.uid() = user_id);

create policy "authenticated users can upsert own exam seen feedback"
  on public.exam_seen_feedback
  for insert
  with check (auth.uid() = user_id);

create policy "authenticated users can update own exam seen feedback"
  on public.exam_seen_feedback
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
