-- 프로젝트 목록 테이블
drop table if exists project_changes;
drop table if exists project_list;
drop table if exists reports;

create table project_list (
  id bigint primary key generated always as identity,
  title text unique not null,
  company text,
  stage text,
  status text,
  pm text,
  expected_schedule date,
  stakeholder text,
  training boolean default false,
  project_doc text,
  genai boolean default false,
  digital_output boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 프로젝트 변경 이력 테이블
create table project_changes (
  id bigint primary key generated always as identity,
  project_id bigint references project_list(id) on delete cascade,
  field_name text not null,
  old_value text,
  new_value text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 리포트 테이블
create table reports (
  id bigint primary key generated always as identity,
  content text not null,
  generated_at timestamp with time zone not null,
  changes_count integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 테이블에 RLS 정책 설정
alter table project_list enable row level security;
alter table project_changes enable row level security;
alter table reports enable row level security;

-- 모든 사용자에게 읽기 권한 부여
create policy "Enable read access for all users" on project_list for select using (true);
create policy "Enable read access for all users" on project_changes for select using (true);
create policy "Enable read access for all users" on reports for select using (true);

-- 모든 사용자에게 쓰기 권한 부여
create policy "Enable insert access for all users" on project_list for insert with check (true);
create policy "Enable insert access for all users" on project_changes for insert with check (true);
create policy "Enable insert access for all users" on reports for insert with check (true);

-- 업데이트 트리거 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 업데이트 트리거 설정
create trigger update_project_list_updated_at
  before update on project_list
  for each row
  execute function update_updated_at_column(); 