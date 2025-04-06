import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 일주일 전 날짜 설정
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    // Notion에서 데이터 가져오기
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            timestamp: 'last_edited_time',
            last_edited_time: {
              on_or_after: lastWeek.toISOString(),
            },
          },
        ],
      },
    });

    // 변경된 프로젝트들의 이전 상태 가져오기
    const { data: previousProjects } = await supabase
      .from('project_list')
      .select('*');

    const previousProjectsMap = new Map(
      previousProjects?.map(p => [p.title, p]) || []
    );

    // 변경 사항 기록
    const changes = [];
    const currentTime = new Date().toISOString();

    for (const page of results) {
      const properties = page.properties;
      const title = properties.title?.title?.[0]?.plain_text || '';
      const previousProject = previousProjectsMap.get(title);

      const newData = {
        title,
        company: properties.company?.select?.name || '',
        stage: properties.stage?.select?.name || '',
        status: properties.status?.select?.name || '',
        stakeholder: properties.stakeholder?.rich_text?.[0]?.plain_text || '',
        pm: properties.pm?.rich_text?.[0]?.plain_text || '',
        training: properties.training?.checkbox || false,
        genai: properties.genai?.checkbox || false,
        digital_output: properties.digital_output?.checkbox || false,
        project_document: properties.project_document?.url || '',
        expected_schedule: properties.expected_schedule?.date?.start || null,
      };

      // 새로운 프로젝트인 경우 변경 사항으로 기록
      if (!previousProject) {
        changes.push({
          project_title: title,
          field: 'registration',
          field_name: '프로젝트 등록',
          old_value: null,
          new_value: '신규 등록',
          created_at: currentTime,
        });
      } else {
        // 기존 변경 사항 확인 및 기록
        const fields = [
          { key: 'status', label: '상태' },
          { key: 'stage', label: '단계' },
          { key: 'stakeholder', label: '이해관계자' },
          { key: 'pm', label: 'PM' },
        ];

        for (const { key, label } of fields) {
          if (previousProject[key] !== newData[key]) {
            changes.push({
              project_title: title,
              field: key,
              field_name: label,
              old_value: previousProject[key],
              new_value: newData[key],
              created_at: currentTime,
            });
          }
        }
      }

      // Supabase에 프로젝트 정보 업데이트
      await supabase
        .from('project_list')
        .upsert({
          ...newData,
          updated_at: currentTime,
        }, {
          onConflict: 'title',
        });
    }

    // 변경 사항이 있는 경우 기록
    if (changes.length > 0) {
      const { data: insertedChanges, error: changesError } = await supabase
        .from('project_changes')
        .insert(changes);

      if (changesError) {
        console.error('Error inserting changes:', changesError);
        throw changesError;
      }

      console.log('Inserted changes:', changes.length);
    }

    return res.status(200).json({
      message: '데이터가 성공적으로 동기화되었습니다.',
      changes_count: changes.length,
      changes: changes, // 디버깅을 위해 변경 사항 목록 추가
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({
      error: '데이터 동기화 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
} 