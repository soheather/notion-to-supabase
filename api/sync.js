import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 파일을 명시적으로 로드
dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function syncData() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  const response = await notion.databases.query({ database_id: databaseId });

  for (const page of response.results) {
    const properties = page.properties;

    const title = properties.title.title[0]?.plain_text || '';
    const company = properties.company.select?.name || '';
    const stage = properties.stage.select?.name || '';
    const training = properties.training.checkbox;
    const stakeholder = properties.stakeholder.rich_text?.[0]?.plain_text || '';
    const project_doc = properties.project_doc.url || '';
    const genai = properties.genai.checkbox;
    const digital_output = properties.digital_output.checkbox;
    const expected_schedule = properties.expected_schedule.date?.start || null;

    const data = {
      title,
      company,
      stage,
      training,
      stakeholder,
      project_doc,
      genai,
      digital_output,
      expected_schedule,
    };

    const { error } = await supabase.from('project_list').upsert(data);

    if (error) {
      console.error('업로드 실패:', error);
    } else {
      console.log('업로드 성공:', data.title);
    }
  }
}

// Vercel에서는 handler로 내보내고, CLI에서는 실행
export default async function handler(req, res) {
  await syncData();
  res.status(200).json({ message: 'Sync complete' });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  // CLI로 실행되었을 때만 실행
  syncData();
}
