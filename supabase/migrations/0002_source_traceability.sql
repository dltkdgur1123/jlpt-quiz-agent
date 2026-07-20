-- NS-TICKET-018A: Source traceability for quiz items
-- Stores where each generated quiz item came from without claiming official JLPT provenance.

alter table public.vocab_items
  add column if not exists source_type text,
  add column if not exists source_day text,
  add column if not exists source_item text,
  add column if not exists source_reading text,
  add column if not exists generation_batch text,
  add column if not exists review_status text;

alter table public.grammar_items
  add column if not exists source_type text,
  add column if not exists source_day text,
  add column if not exists source_item text,
  add column if not exists source_reading text,
  add column if not exists generation_batch text,
  add column if not exists review_status text;

alter table public.vocab_items
  add constraint vocab_items_source_type_check
    check (source_type is null or source_type in ('shorts', 'manual', 'generated')),
  add constraint vocab_items_review_status_check
    check (review_status is null or review_status in ('draft', 'approved', 'rejected'));

alter table public.grammar_items
  add constraint grammar_items_source_type_check
    check (source_type is null or source_type in ('shorts', 'manual', 'generated')),
  add constraint grammar_items_review_status_check
    check (review_status is null or review_status in ('draft', 'approved', 'rejected'));

create index if not exists vocab_items_source_idx
  on public.vocab_items (source_type, source_day, generation_batch);

create index if not exists grammar_items_source_idx
  on public.grammar_items (source_type, source_day, generation_batch);
