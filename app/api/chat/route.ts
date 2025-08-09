import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/search';

const BOLD_PAIRS = [
  { ko: '영역', en: 'Areas' },
  { ko: '프로젝트', en: 'Projects' },
  { ko: '자원', en: 'Resources' },
  { ko: '아카이브', en: 'Archive' },
  { ko: '수집', en: 'Capture' },
  { ko: '정리', en: 'Organize' },
  { ko: '추출', en: 'Distill' },
  { ko: '표현', en: 'Express' },
];

// 텍스트를 마크다운 + 단락/강조 가독성 강화
function formatMarkdownWithBoldAndParagraph(text: string): string {
  // 1. 모든 기존 bold 해제
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '$1');

  // 2. 키워드(한글/영문/쌍) 한 번만 bold
  BOLD_PAIRS.forEach(({ ko, en }) => {
    // ex) 영역 (Areas), Areas (영역), 영역, Areas
    const reg = new RegExp(
      `(${ko}\\s*\\(${en}\\)|${en}\\s*\\(${ko}\\}|${ko}|${en})`,
      'g'
    );
    formatted = formatted.replace(reg, '**$1**');
  });

  // 3. 마침표/느낌표/물음표 뒤 대문자/한글이 나오면 단락 분리
  formatted = formatted.replace(/([.!?])(\s+)(?=[A-Z가-힣])/g, '$1\n\n');

  // 4. 리스트(•, 1. 등) 앞뒤 단락 구분
  formatted = formatted.replace(/\n?([•\d]+\.)\s+/g, '\n\n$1 ');

  // 5. 두 번 이상 연속 줄바꿈은 두 번만
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // 6. 불필요한 띄어쓰기, 이중 bold, 빈 줄
  formatted = formatted.replace(/\s+\./g, '.');
  formatted = formatted.replace(/\*{4,}/g, '**');

  return formatted.trim();
}

// 닥터가드너 json 구조용: 마크다운 + 포인트/예시/팁/단계 자동 렌더링
function formatDrGardnerContent(item: any): string {
  let response = '';

  if (item.title) response += `# ${item.title}\n\n`;
  if (item.content) response += item.content + '\n\n';

  if (item.keyPoints?.length) {
    response += '## 💡 핵심 포인트\n';
    item.keyPoints.forEach((p: string) => (response += `• ${p}\n`));
    response += '\n';
  }
  if (item.examples?.length) {
    response += '## 📌 예시\n';
    item.examples.forEach((ex: string) => (response += `• ${ex}\n`));
    response += '\n';
  }
  if (item.tips?.length) {
    response += '## 💭 팁\n';
    item.tips.forEach((tip: string) => (response += `• ${tip}\n`));
    response += '\n';
  }
  if (item.steps?.length) {
    response += '## 📋 단계별 가이드\n';
    item.steps.forEach((step: any, idx: number) => {
      if (typeof step === 'string') response += `${idx + 1}. ${step}\n`;
      else if (step.step && step.title) {
        response += `${step.step}. ${step.title}\n`;
        if (step.actions?.length)
          step.actions.forEach((a: string) => (response += `   • ${a}\n`));
      }
    });
    response += '\n';
  }
  return formatMarkdownWithBoldAndParagraph(response);
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, messages = [] } = await req.json();

    // 1. 검색
    const searchResults = await searchKnowledge(message);
    const hasDrGardner = searchResults.some(
      r => r.item.type === 'dr-gardner' || r.item.category?.includes('닥터가드너')
    );

    let finalResponse = '';
    let suggestions: string[] = [];
    let cached = false;

    // 2. LM Studio AI 시도
    try {
      // 검색 컨텍스트
      const searchContext = searchResults
        .slice(0, 5)
        .map(
          r =>
            `[${r.item.category}] ${r.item.title}: ${
              r.item.content?.substring(0, 300) || ''
            }...`
        )
        .join('\n\n');

      // 대화 히스토리 (최대 10개)
      const conversationHistory = messages
        .slice(-10)
        .map((msg: any) => `${msg.type === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
        .join('\n\n');

      // 전문 프롬프트
      const aiPrompt = `
당신은 닥터가드너의 Second Brain OS 시스템 전문가입니다.
질문에 대해 명확하고 실용적인 답변을 제공하세요.

${hasDrGardner ? '🎯 닥터가드너 공식 가이드를 기반으로 답변합니다.\n' : ''}
${conversationHistory ? `=== 이전 대화 ===\n${conversationHistory}\n\n` : ''}
=== 검색된 관련 지식 ===
${searchContext}

=== 현재 질문 ===
${message}

=== 답변 원칙 ===
- 반드시 핵심 요약 → 배경/차이/예시/팁 → 실전 단계 순서로 마크다운 단락으로 구분
- PARA/CODE 주요 개념은 반드시 bold, 예시와 단계를 풍부하게
- 각 리스트와 단락은 띄어쓰기 구분이 잘 되도록
- 반복 설명, 순환 논리 금지
- 마크다운 문법: **bold**, # 제목, ## 소제목, • 리스트, 1. 단계
`;

      // AI 호출
      const aiResponse = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemma-3n-e4b',
          messages: [
            { role: 'system', content: '당신은 친절하고 실용적인 Second Brain 전문가입니다.' },
            { role: 'user', content: aiPrompt },
          ],
          temperature: 0.7,
          max_tokens: 900,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        let content = aiData.choices[0].message.content;

        // 만약 너무 길면 앞 18문장까지만
        const sentences = content.split('. ');
        if (sentences.length > 20)
          content = sentences.slice(0, 18).join('. ') + '.\n\n💡 **다음 단계**: 오늘 바로 PARA 폴더를 만들어 실습해보세요!';

        // 최종 마크다운/강조/단락 렌더링
        finalResponse = formatMarkdownWithBoldAndParagraph(content);
      } else {
        throw new Error('LM Studio 오류');
      }
    } catch {
      // AI 실패 시: 지식 베이스 fallback
      if (searchResults.length > 0) {
        const topResult = searchResults[0].item;
        if (topResult.type === 'dr-gardner')
          finalResponse = formatDrGardnerContent(topResult);
        else
          finalResponse = formatMarkdownWithBoldAndParagraph(
            topResult.content.split('. ').slice(0, 4).join('. ')
          );
        cached = true;
      } else {
        finalResponse = '죄송합니다. 답변 가능한 정보를 찾을 수 없습니다.';
      }
    }

    // 추천 질문
    if (message.includes('건강') || message.includes('다이어트')) {
      suggestions = [
        '습관을 프로젝트로 관리하는 법?',
        '운동 루틴을 어떻게 만들지?',
        'PARA 시스템 실전 예시 알려줘',
      ];
    } else if (searchResults[0]?.item?.relatedTopics) {
      suggestions = searchResults[0].item.relatedTopics.slice(0, 3);
    } else {
      suggestions = ['PARA가 뭐야?', 'CODE 방법론은?', '노트 정리 잘하는 팁'];
    }

    return NextResponse.json({
      response: finalResponse,
      suggestions,
      cached,
      searchResults: searchResults.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        response: '죄송합니다. 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
