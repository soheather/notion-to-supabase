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
    // 프로젝트 변경 이력 삭제
    await supabase
      .from('project_changes')
      .delete()
      .lt('created_at', new Date().toISOString());

    // 리포트 삭제
    await supabase
      .from('reports')
      .delete()
      .lt('generated_at', new Date().toISOString());

    return res.status(200).json({ message: '테스트 데이터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Error clearing data:', error);
    return res.status(500).json({ 
      error: '데이터 삭제 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
} 