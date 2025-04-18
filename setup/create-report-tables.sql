-- 프로젝트 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS project_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type TEXT NOT NULL, -- 'weekly', 'daily'
  data JSONB NOT NULL, -- 프로젝트 데이터 스냅샷
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 프로젝트 리포트 테이블 생성
CREATE TABLE IF NOT EXISTS project_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  changed_projects JSONB NOT NULL,
  new_projects JSONB NOT NULL,
  previous_snapshot_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS project_history_snapshot_type_idx ON project_history(snapshot_type);
CREATE INDEX IF NOT EXISTS project_history_created_at_idx ON project_history(created_at);
CREATE INDEX IF NOT EXISTS project_reports_report_date_idx ON project_reports(report_date);
