-- NS-TICKET-020: Mock exam set schema
-- Scope: non-listening mock exam platform tables. No official JLPT scoring or official exam history is stored.

create table if not exists public.mock_exam_sets (
  id uuid primary key default gen_random_uuid(),
  jlpt_level text not null check (jlpt_level in ('N1', 'N2', 'N3', 'N4', 'N5')),
  set_code text not null unique,
  set_title text not null,
  mode text not null default 'lite' check (mode in ('lite', 'full')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  time_limit_minutes integer not null check (time_limit_minutes > 0),
  listening_included boolean not null default false,
  question_count integer not null default 0 check (question_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  check (listening_included = false)
);

create table if not exists public.mock_exam_sections (
  id uuid primary key default gen_random_uuid(),
  mock_exam_set_id uuid not null references public.mock_exam_sets(id) on delete cascade,
  section_key text not null check (section_key in ('vocab', 'grammar', 'reading', 'listening')),
  section_title text not null,
  sort_order integer not null check (sort_order > 0),
  question_count integer not null default 0 check (question_count >= 0),
  time_limit_minutes integer check (time_limit_minutes is null or time_limit_minutes > 0),
  created_at timestamptz not null default now(),
  check (section_key <> 'listening'),
  unique (mock_exam_set_id, section_key),
  unique (mock_exam_set_id, sort_order)
);

create table if not exists public.mock_exam_questions (
  id uuid primary key default gen_random_uuid(),
  mock_exam_set_id uuid not null references public.mock_exam_sets(id) on delete cascade,
  section_id uuid not null references public.mock_exam_sections(id) on delete cascade,
  item_type text not null check (item_type in ('vocab', 'grammar', 'reading')),
  item_id uuid not null,
  sort_order integer not null check (sort_order > 0),
  points integer not null default 1 check (points > 0),
  created_at timestamptz not null default now(),
  unique (mock_exam_set_id, sort_order),
  unique (mock_exam_set_id, item_type, item_id)
);

create table if not exists public.mock_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  mock_exam_set_id uuid not null references public.mock_exam_sets(id) on delete restrict,
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'abandoned')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  elapsed_seconds integer check (elapsed_seconds is null or elapsed_seconds >= 0),
  score_total integer check (score_total is null or score_total >= 0),
  score_max integer check (score_max is null or score_max >= 0),
  correct_count integer check (correct_count is null or correct_count >= 0),
  question_count integer not null check (question_count >= 0),
  check (score_total is null or score_max is null or score_total <= score_max),
  check (correct_count is null or correct_count <= question_count)
);

create table if not exists public.mock_exam_answers (
  id uuid primary key default gen_random_uuid(),
  mock_exam_attempt_id uuid not null references public.mock_exam_attempts(id) on delete cascade,
  mock_exam_question_id uuid not null references public.mock_exam_questions(id) on delete restrict,
  selected_choice text check (selected_choice is null or selected_choice in ('A', 'B', 'C', 'D')),
  is_correct boolean,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mock_exam_attempt_id, mock_exam_question_id)
);

create table if not exists public.mock_exam_section_results (
  id uuid primary key default gen_random_uuid(),
  mock_exam_attempt_id uuid not null references public.mock_exam_attempts(id) on delete cascade,
  section_key text not null check (section_key in ('vocab', 'grammar', 'reading')),
  score integer not null check (score >= 0),
  score_max integer not null check (score_max >= 0),
  correct_count integer not null check (correct_count >= 0),
  question_count integer not null check (question_count >= 0),
  correct_rate numeric(6,5) check (correct_rate is null or (correct_rate >= 0 and correct_rate <= 1)),
  weakness_label text,
  created_at timestamptz not null default now(),
  check (score <= score_max),
  check (correct_count <= question_count),
  unique (mock_exam_attempt_id, section_key)
);

create index if not exists mock_exam_sets_level_status_idx
  on public.mock_exam_sets (jlpt_level, status, published_at desc);
create index if not exists mock_exam_sections_set_order_idx
  on public.mock_exam_sections (mock_exam_set_id, sort_order);
create index if not exists mock_exam_questions_set_order_idx
  on public.mock_exam_questions (mock_exam_set_id, sort_order);
create index if not exists mock_exam_questions_section_order_idx
  on public.mock_exam_questions (section_id, sort_order);
create index if not exists mock_exam_attempts_user_started_idx
  on public.mock_exam_attempts (user_id, started_at desc);
create index if not exists mock_exam_attempts_set_status_idx
  on public.mock_exam_attempts (mock_exam_set_id, status);
create index if not exists mock_exam_answers_attempt_idx
  on public.mock_exam_answers (mock_exam_attempt_id);
