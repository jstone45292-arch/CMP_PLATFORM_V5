
-- CMP Platform v5.0 Cloud Schema
-- Run this in Supabase SQL Editor.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('Advisor','Professor','Admin','Student')),
  lab_group text default 'Kim Tae Dong Lab',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists materials (
  id bigserial primary key,
  material_id text unique,
  material_name text not null,
  category text,
  subcategory text,
  cas_no text,
  hlb numeric,
  cmc_mm numeric,
  mw numeric,
  pka numeric,
  ionic_type text,
  cu_compatibility text,
  particle_removal text,
  corrosion_risk text,
  decision_recommendation text,
  literature_source text,
  verification_level text default 'Literature',
  internal_memo text,
  created_at timestamptz default now()
);

create table if not exists sop_documents (
  id bigserial primary key,
  sop_id text unique,
  title text not null,
  version text,
  status text default 'draft',
  content text,
  approved_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists mock_slurries (
  id bigserial primary key,
  slurry_id text unique,
  silica_wt numeric,
  particle_size text,
  ph numeric,
  status text,
  memo text,
  created_at timestamptz default now()
);

create table if not exists doe_runs (
  id bigserial primary key,
  run_id text unique,
  slurry_id text,
  surfactant text,
  chelator text,
  base_amine text,
  ph numeric,
  status text default 'plan',
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists measurements (
  id bigserial primary key,
  run_id text references doe_runs(run_id),
  operator_id uuid references profiles(id),
  particle_removal numeric,
  contact_angle numeric,
  ra_nm numeric,
  corrosion text,
  remark text,
  created_at timestamptz default now()
);

create table if not exists memos (
  id bigserial primary key,
  run_id text,
  author_id uuid references profiles(id),
  memo_type text default 'general',
  body text not null,
  created_at timestamptz default now()
);

create table if not exists decision_rules (
  id bigserial primary key,
  rule_id text unique,
  condition_text text not null,
  recommendation text not null,
  severity text default 'info',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table materials enable row level security;
alter table sop_documents enable row level security;
alter table mock_slurries enable row level security;
alter table doe_runs enable row level security;
alter table measurements enable row level security;
alter table memos enable row level security;
alter table decision_rules enable row level security;

-- Simple lab-wide access policy for v5.0 beta.
create policy "profiles read authenticated" on profiles for select to authenticated using (true);
create policy "materials all authenticated" on materials for all to authenticated using (true) with check (true);
create policy "sop all authenticated" on sop_documents for all to authenticated using (true) with check (true);
create policy "slurry all authenticated" on mock_slurries for all to authenticated using (true) with check (true);
create policy "doe all authenticated" on doe_runs for all to authenticated using (true) with check (true);
create policy "measure all authenticated" on measurements for all to authenticated using (true) with check (true);
create policy "memos all authenticated" on memos for all to authenticated using (true) with check (true);
create policy "rules all authenticated" on decision_rules for all to authenticated using (true) with check (true);

insert into mock_slurries (slurry_id, silica_wt, particle_size, ph, status, memo)
values
('MS-SiO2-01', 0.5, '80-100 nm', 10.5, 'training', 'weak contamination'),
('MS-SiO2-02', 1.0, '80-100 nm', 10.5, 'approved', 'standard contamination'),
('MS-SiO2-03', 2.0, '80-100 nm', 10.5, 'review', 'strong contamination')
on conflict (slurry_id) do nothing;

insert into decision_rules (rule_id, condition_text, recommendation, severity)
values
('RULE-001', 'pH > 11.5 AND EDTA', 'Cu corrosion risk HIGH', 'high'),
('RULE-002', 'Nonionic surfactant AND HLB 12~16', 'Good wetting candidate', 'info'),
('RULE-003', 'GLDA + BTA', 'Eco-friendly Cu cleaning candidate', 'info')
on conflict (rule_id) do nothing;
