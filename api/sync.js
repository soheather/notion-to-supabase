import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    for (const page of response.results) {
      const props = page.properties;

      const title = props.title.title[0]?.plain_text || '';
      const company = props.company.select?.name || '';
      const stage = props.stage.select?.name || '';
      const training = props.training.checkbox;
      const stakeholder = props.stakeholder.rich_text[0]?.plain_text || '';
      const project_doc = props.project_doc.url || '';
      const genai = props.genai.checkbox;
      const digital_output = props.digital_output.checkbox;
      const expected_schedule = props.expected_schedule.date?.start || null;

      await supabase.from('projects').upsert([{
        title,
        company,
        stage,
        training,
        stakeholder,
        project_doc,
        genai,
        digital_output,
        expected_schedule
      }]);
    }

    res.status(200).json({ message: '✅ Sync complete' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
