import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { oldData, newData } = req.body;

    // 변경된 필드 찾기
    const changes = [];
    const trackFields = ['title', 'company', 'stage', 'status', 'pm', 'expected_schedule', 'stakeholder'];

    trackFields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          project_id: newData.id,
          field_name: field,
          old_value: oldData[field] || '',
          new_value: newData[field] || '',
        });
      }
    });

    if (changes.length > 0) {
      // 변경 사항 저장
      const { error } = await supabase
        .from('project_changes')
        .insert(changes);

      if (error) throw error;

      // AI 리포트 생성 트리거
      await fetch('/api/generate-report');
    }

    res.status(200).json({ message: 'Changes tracked successfully' });
  } catch (error) {
    console.error('Error tracking changes:', error);
    res.status(500).json({ message: 'Error tracking changes', error: error.message });
  }
} 