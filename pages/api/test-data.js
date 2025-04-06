import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 테스트용 프로젝트 추가
    const { data: project, error: projectError } = await supabase
      .from('project_list')
      .insert({
        title: `테스트 프로젝트 ${Date.now()}`,
        company: 'GS E&R',
        stage: '진행중',
        status: '정상',
        pm: '홍길동',
        stakeholder: '개발팀',
        training: true,
        project_doc: 'https://example.com/doc1',
        genai: true,
        digital_output: false
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      throw projectError;
    }

    // 변경 사항 기록
    const { error: changeError } = await supabase
      .from('project_changes')
      .insert({
        project_id: project.id,
        field_name: 'status',
        old_value: '계획',
        new_value: '진행중'
      });

    if (changeError) {
      console.error('Change creation error:', changeError);
      throw changeError;
    }

    res.status(200).json({ 
      message: '테스트 데이터가 생성되었습니다.',
      project: project
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 