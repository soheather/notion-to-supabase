import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 일주일 전 날짜 설정
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    // 변경 사항 조회
    const { data: changes, error: changesError } = await supabase
      .from('project_changes')
      .select('*')
      .gte('created_at', lastWeek.toISOString())
      .order('created_at', { ascending: false });

    if (changesError) {
      console.error('Error fetching changes:', changesError);
      throw changesError;
    }

    if (!changes || changes.length === 0) {
      return res.status(200).json({
        message: '변경 사항이 없습니다.',
        report: '지난 일주일간 프로젝트 변경 사항이 없습니다.',
      });
    }

    // 저장된 리포트 설정 가져오기
    const { data: settingsData } = await supabase
      .from('report_settings')
      .select('settings')
      .single();

    const settings = settingsData?.settings || {
      reportFormat: 'summary',
      includeChanges: true,
      includeRecommendations: true,
      includeTimeline: true,
      changeTypes: ['registration', 'status', 'stage', 'pm', 'stakeholder'],
    };

    // 선택된 변경 유형만 필터링 (새 프로젝트 등록 포함)
    const filteredChanges = changes.filter(change =>
      settings.changeTypes.includes(change.field)
    );

    if (filteredChanges.length === 0) {
      return res.status(200).json({
        message: '선택된 유형의 변경 사항이 없습니다.',
        report: '지난 일주일간 선택된 유형의 프로젝트 변경 사항이 없습니다.',
      });
    }

    // GPT 프롬프트 생성
    let prompt = '';
    if (settings.reportFormat === 'custom' && settings.customPrompt) {
      prompt = settings.customPrompt;
    } else {
      prompt = `지난 일주일간의 프로젝트 변경 사항을 분석하여 리포트를 작성해주세요.\n\n`;
      
      if (settings.includeChanges) {
        prompt += `변경 사항:\n${filteredChanges.map(change =>
          `- ${change.project_title}: ${change.field_name}가 "${change.old_value || '미지정'}"에서 "${change.new_value || '미지정'}"로 변경됨`
        ).join('\n')}\n\n`;
      }

      if (settings.includeTimeline) {
        prompt += `타임라인:\n${filteredChanges.map(change =>
          `- ${new Date(change.created_at).toLocaleString()}: ${change.project_title}의 ${change.field_name} 변경`
        ).join('\n')}\n\n`;
      }

      if (settings.includeRecommendations) {
        prompt += `위 변경 사항들을 분석하여 다음 사항들을 포함해주세요:
1. 주요 변경 사항 요약
2. 변경된 프로젝트들의 현재 상태 분석
3. 후속 조치가 필요한 항목
4. PM 및 이해관계자들에게 전달해야 할 중요 사항
5. 리스크가 예상되는 항목`;
      }
    }

    // GPT에게 리포트 생성 요청
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates project change reports in Korean."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const report = completion.choices[0].message.content;

    // 리포트 저장
    const { error: saveError } = await supabase
      .from('reports')
      .insert({
        content: report,
        settings: settings,
      });

    if (saveError) {
      console.error('Error saving report:', saveError);
      throw saveError;
    }

    return res.status(200).json({
      message: '리포트가 생성되었습니다.',
      report,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return res.status(500).json({
      error: '리포트 생성 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
} 