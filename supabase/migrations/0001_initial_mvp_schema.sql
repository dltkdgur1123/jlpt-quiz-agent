-- NS-TICKET-002: JLPT Quiz Data Platform MVP schema draft
-- Scope: official MVP tables only. No official JLPT exam history is stored.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  auth_provider text not null,
  provider_user_id text not null,
  target_jlpt_level text check (target_jlpt_level in ('N1', 'N2', 'N3', 'N4', 'N5')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  unique (auth_provider, provider_user_id)
);

create table if not exists public.vocab_items (
  id uuid primary key default gen_random_uuid(),
  jlpt_level text not null check (jlpt_level in ('N1', 'N2', 'N3', 'N4', 'N5')),
  word text not null,
  reading text,
  meaning text not null,
  question_text text not null,
  choice_a text not null,
  choice_b text not null,
  choice_c text not null,
  choice_d text not null,
  correct_choice text not null check (correct_choice in ('A', 'B', 'C', 'D')),
  explanation text,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (choice_a <> choice_b and choice_a <> choice_c and choice_a <> choice_d and choice_b <> choice_c and choice_b <> choice_d and choice_c <> choice_d)
);

create table if not exists public.grammar_items (
  id uuid primary key default gen_random_uuid(),
  jlpt_level text not null check (jlpt_level in ('N1', 'N2', 'N3', 'N4', 'N5')),
  grammar_point text not null,
  meaning text not null,
  question_text text not null,
  choice_a text not null,
  choice_b text not null,
  choice_c text not null,
  choice_d text not null,
  correct_choice text not null check (correct_choice in ('A', 'B', 'C', 'D')),
  explanation text,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (choice_a <> choice_b and choice_a <> choice_c and choice_a <> choice_d and choice_b <> choice_c and choice_b <> choice_d and choice_c <> choice_d)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  item_type text not null check (item_type in ('vocab', 'grammar')),
  item_id uuid not null,
  selected_choice text not null check (selected_choice in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  response_time_ms integer check (response_time_ms is null or response_time_ms >= 0)
);

create table if not exists public.exam_seen_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_type text not null check (item_type in ('vocab', 'grammar')),
  item_id uuid not null,
  feedback text not null check (feedback in ('yes', 'no', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create table if not exists public.item_score_stats (
  item_type text not null check (item_type in ('vocab', 'grammar')),
  item_id uuid not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  incorrect_count integer not null default 0 check (incorrect_count >= 0),
  correct_rate numeric(6,5) check (correct_rate is null or (correct_rate >= 0 and correct_rate <= 1)),
  feedback_yes_count integer not null default 0 check (feedback_yes_count >= 0),
  feedback_no_count integer not null default 0 check (feedback_no_count >= 0),
  feedback_unknown_count integer not null default 0 check (feedback_unknown_count >= 0),
  feedback_total_count integer not null default 0 check (feedback_total_count >= 0),
  seen_yes_rate numeric(6,5) check (seen_yes_rate is null or (seen_yes_rate >= 0 and seen_yes_rate <= 1)),
  sample_confidence numeric(6,5) check (sample_confidence is null or (sample_confidence >= 0 and sample_confidence <= 1)),
  perceived_exam_score numeric(6,5) check (perceived_exam_score is null or (perceived_exam_score >= 0 and perceived_exam_score <= 1)),
  confusion_score numeric(6,5) check (confusion_score is null or (confusion_score >= 0 and confusion_score <= 1)),
  updated_at timestamptz not null default now(),
  primary key (item_type, item_id),
  check (correct_count + incorrect_count <= attempt_count),
  check (feedback_yes_count + feedback_no_count + feedback_unknown_count = feedback_total_count)
);

create index if not exists vocab_items_level_status_idx on public.vocab_items (jlpt_level, status);
create index if not exists grammar_items_level_status_idx on public.grammar_items (jlpt_level, status);
create index if not exists quiz_attempts_item_idx on public.quiz_attempts (item_type, item_id);
create index if not exists quiz_attempts_user_answered_idx on public.quiz_attempts (user_id, answered_at desc);
create index if not exists exam_seen_feedback_item_idx on public.exam_seen_feedback (item_type, item_id);
create index if not exists item_score_stats_score_idx on public.item_score_stats (perceived_exam_score desc nulls last);
