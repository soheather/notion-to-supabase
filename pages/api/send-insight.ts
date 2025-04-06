import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 프로젝트 데이터 조회
    const { data: projects, error: fetchError } = await supabase
      .from("project_list")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return res.status(500).json({ error: "프로젝트 데이터 조회 실패" });
    }

    if (!projects || projects.length === 0) {
      return res.status(404).json({ error: "프로젝트 데이터가 없습니다" });
    }

    // 변경 사항 조회 (최근 1주일)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const { data: changes, error: changesError } = await supabase
      .from("project_changes")
      .select("*")
      .gte("created_at", lastWeek.toISOString())
      .order("created_at", { ascending: false });

    if (changesError) {
      console.error("Changes fetch error:", changesError);
    }

    // GPT 프롬프트 생성
    const prompt = `
다음 프로젝트 데이터를 기반으로 리더를 위한 요약 리포트를 작성해주세요.
현재 총 ${projects.length}개의 프로젝트가 있으며, 지난 1주일간 ${changes?.length || 0}개의 변경 사항이 있었습니다.

1. 전체 현황 요약
- 진행 중인 프로젝트 수
- 각 단계별 프로젝트 수
- 주요 변경 사항

2. 이슈 요약
- 지연되거나 위험이 예상되는 프로젝트
- 특별한 관심이 필요한 프로젝트

3. 도움이 필요한 프로젝트
- PM이나 이해관계자의 지원이 필요한 프로젝트
- 리소스 추가가 필요한 프로젝트

4. 리더가 취할 액션 제안
- 우선순위가 높은 의사결정 사항
- 주요 이해관계자와의 협의가 필요한 사항

프로젝트 데이터:
${JSON.stringify(projects, null, 2)}

최근 변경 사항:
${JSON.stringify(changes, null, 2)}
    `;

    // GPT API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes project data and generates insightful reports in Korean."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const insight = completion.choices[0].message?.content;
    
    if (!insight) {
      throw new Error("GPT 응답이 비어있습니다");
    }

    // 이메일 전송
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const today = new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `"프로젝트 리더 리포트" <${process.env.EMAIL_USER}>`,
      to: "heather@52g.team",
      subject: `📬 ${today} 프로젝트 인사이트 리포트`,
      html: `
        <h1>프로젝트 인사이트 리포트</h1>
        <p>생성일시: ${today}</p>
        <hr />
        ${insight.replace(/\n/g, "<br />")}
        <hr />
        <p>이 리포트는 AI가 자동으로 생성한 내용입니다.</p>
      `,
      text: insight,
    };

    await transporter.sendMail(mailOptions);

    // 리포트 저장
    const { error: saveError } = await supabase
      .from("reports")
      .insert({
        content: insight,
        settings: {
          type: "leader_insight",
          generated_at: new Date().toISOString(),
        },
      });

    if (saveError) {
      console.error("Report save error:", saveError);
    }

    res.status(200).json({
      message: "인사이트 리포트가 이메일로 전송되었습니다",
      insight,
    });
  } catch (err) {
    console.error("Error in insight generation:", err);
    res.status(500).json({
      error: "리포트 생성 중 오류가 발생했습니다",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
} 