-- NS-TICKET-031: Wrong-note review persistence
-- Stores logged-in retry outcomes for previously wrong mock-exam answers.
-- This is learner review state only; it is not official JLPT scoring or pass/fail prediction.

create table if not exists public.mock_exam_wrong_reviews (
  id uuid primary key default gen_random_uuid(),
  mock_exam_answer_id uuid not null references public.mock_exam_answers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  review_result text not null check (review_result in ('resolved', 'repeat_wrong')),
  reviewed_choice text not null check (reviewed_choice in ('A', 'B', 'C', 'D')),
  review_count integer not null default 1 check (review_count > 0),
  repeat_wrong_count integer not null default 0 check (repeat_wrong_count >= 0),
  last_reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mock_exam_answer_id)
);

create index if not exists mock_exam_wrong_reviews_user_result_idx
  on public.mock_exam_wrong_reviews (user_id, review_result, last_reviewed_at desc);
create index if not exists mock_exam_wrong_reviews_answer_idx
  on public.mock_exam_wrong_reviews (mock_exam_answer_id);
