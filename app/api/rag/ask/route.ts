import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext } from '@/lib/rag';

export const runtime = 'nodejs';

const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1/chat/completions';
const LMSTUDIO_MODEL = process.env.LMSTUDIO_MODEL || 'google/gemma-3n-e4b';

export async function POST(req: NextRequest) {
  try {
    const { notebookId, question, topK = 5 } = await req.json();
    if (!notebookId || !question) {
      return NextResponse.json({ error: 'notebookId and question required' }, { status: 400 });
    }

    const { contexts, citations } = await retrieveContext(notebookId, question, Math.min(topK, 8));

    const prompt = `다음은 사용자의 질문과 관련 소스 발췌입니다. 발췌를 기반으로 정확하고 간결하게 답하세요.\n\n[컨텍스트]\n${contexts.map((c, i) => `(${i + 1}) ${c}`).join('\n\n')}\n\n[질문]\n${question}\n\n원칙:\n- 근거가 없는 내용은 추측하지 마세요\n- 핵심 요약 → 세부 설명 → 다음 단계 순서로 답변\n- 인용이 가능한 부분은 (출처: 번호) 형식으로 표시`;

    let answer = '';
    try {
      const aiRes = await fetch(LMSTUDIO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: LMSTUDIO_MODEL,
          messages: [
            { role: 'system', content: '당신은 신중하고 근거 중심의 한국어 조교입니다.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      });
      if (!aiRes.ok) throw new Error('LM Studio request failed');
      const data = await aiRes.json();
      answer = data.choices?.[0]?.message?.content || '';
    } catch {
      // LM 실패 시, 컨텍스트 요약형 응답
      answer = contexts.slice(0, 3).map((c, i) => `(${i + 1}) ${c}`).join('\n\n');
    }

    return NextResponse.json({ answer, citations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'ask failed' }, { status: 500 });
  }
}
