-- NS-TICKET-025: Replace legacy mock exam mode naming with realistic operation mode.
-- Safe additive/constraint update: existing legacy rows are normalized before tightening the check.

alter table public.mock_exam_sets
  alter column mode set default 'realistic';

update public.mock_exam_sets
set mode = 'realistic'
where mode = 'lite';

alter table public.mock_exam_sets
  drop constraint if exists mock_exam_sets_mode_check;

alter table public.mock_exam_sets
  add constraint mock_exam_sets_mode_check check (mode in ('realistic', 'full'));
