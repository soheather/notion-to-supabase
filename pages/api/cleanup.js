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
    // title이 없거나 빈 문자열인 데이터 삭제
    const { error: deleteEmptyError } = await supabase
      .from('project_list')
      .delete()
      .or('title.is.null,title.eq.');

    if (deleteEmptyError) {
      throw deleteEmptyError;
    }

    // 모든 프로젝트 조회
    const { data: allProjects, error: fetchError } = await supabase
      .from('project_list')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    // title별로 그룹화하여 중복 찾기
    const projectsByTitle = {};
    allProjects.forEach(project => {
      if (!projectsByTitle[project.title]) {
        projectsByTitle[project.title] = [];
      }
      projectsByTitle[project.title].push(project);
    });

    // 중복된 항목 처리
    for (const title in projectsByTitle) {
      const projects = projectsByTitle[title];
      if (projects.length > 1) {
        // 첫 번째 항목(가장 최근)을 제외한 나머지 삭제
        const idsToDelete = projects.slice(1).map(p => p.id);
        
        const { error: deleteError } = await supabase
          .from('project_list')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          throw deleteError;
        }
        console.log(`Removed ${idsToDelete.length} duplicates for project: ${title}`);
      }
    }

    res.status(200).json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 