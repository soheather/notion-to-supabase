import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const notion = new Client({ 
  auth: 'secret_cvcbEr6O8AkysPEpAofxF0AzuzVcMEK0QNLq3IcTgsD'
});

const supabase = createClient(
  'https://xkrnoltmippzgpaudbnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrcm5vbHRtaXBwemdwYXVkYm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzMyMjgwMiwiZXhwIjoyMDU4ODk4ODAyfQ.xd0dRK6qel9FTdtVJyUg_KNqxw5IdmMFrfe_uVb9SP8'
);

const DATABASE_ID = '17ef800bd1c181f88901e00db31cba80';

async function getExistingProject(title) {
  const { data, error } = await supabase
    .from("project_list")
    .select("*")
    .eq("title", title)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching existing project:", error);
  }
  return data;
}

async function trackChanges(oldData, newData) {
  if (!oldData) return; // 새로운 프로젝트인 경우 변경 사항 추적 안 함

  const trackFields = [
    'title',
    'company',
    'stage',
    'status',
    'pm',
    'expected_schedule',
    'stakeholder',
    'training',
    'project_doc',
    'genai',
    'digital_output'
  ];

  const changes = [];
  
  trackFields.forEach(field => {
    if (oldData[field] !== newData[field]) {
      changes.push({
        project_id: oldData.id,
        field_name: field,
        old_value: oldData[field] || '',
        new_value: newData[field] || '',
      });
    }
  });

  if (changes.length > 0) {
    const { error } = await supabase
      .from('project_changes')
      .insert(changes);

    if (error) {
      console.error("Error tracking changes:", error);
    } else {
      console.log(`✅ Tracked ${changes.length} changes for project: ${oldData.title}`);
      
      // AI 리포트 생성 트리거
      try {
        await fetch('http://localhost:3000/api/generate-report', {
          method: 'POST'
        });
      } catch (error) {
        console.error("Error triggering report generation:", error);
      }
    }
  }
}

export async function syncData() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: "title",
          direction: "ascending"
        }
      ]
    });

    console.log(`📊 Found ${response.results.length} projects in Notion`);

    for (const page of response.results) {
      const props = page.properties;

      // 데이터 추출
      const title = props.title?.title?.[0]?.plain_text || '';
      
      // title이 없는 경우 건너뛰기
      if (!title) {
        console.log('⚠️ Skipping project with empty title');
        continue;
      }

      const projectData = {
        title,
        company: props.company?.multi_select?.map(item => item.name).join(', ') || '',
        stage: props.stage?.status?.name || '',
        status: props.status?.select?.name || '',
        pm: props.pm?.people?.map(person => person.name).join(', ') || '',
        expected_schedule: props.expected_schedule?.date?.start || null,
        stakeholder: props.stakeholder?.rich_text?.[0]?.plain_text || '',
        training: props.training?.checkbox || false,
        project_doc: props.project_doc?.url || '',
        genai: props.genai?.checkbox || false,
        digital_output: props.digital_output?.checkbox || false
      };

      // 기존 프로젝트 조회
      const existingProject = await getExistingProject(projectData.title);

      if (existingProject) {
        // 업데이트
        const { error: updateError } = await supabase
          .from("project_list")
          .update(projectData)
          .eq("id", existingProject.id);

        if (updateError) {
          console.error(`❌ Error updating project ${projectData.title}:`, updateError);
        } else {
          console.log(`✅ Updated: ${projectData.title}`);
          await trackChanges(existingProject, projectData);
        }
      } else {
        // 새로운 프로젝트 추가
        const { error: insertError } = await supabase
          .from("project_list")
          .insert(projectData);

        if (insertError) {
          console.error(`❌ Error inserting project ${projectData.title}:`, insertError);
        } else {
          console.log(`✅ Inserted: ${projectData.title}`);
        }
      }
    }

    console.log('✨ Synchronization completed successfully');
  } catch (error) {
    console.error("❌ Synchronization error:", error);
    throw error;
  }
}

// 직접 실행 시 syncData 함수 호출
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncData().catch(console.error);
}

export default syncData;
