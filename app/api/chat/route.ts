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
  let formatted = text;

  // 1. 추가 키워드 강조 (AI가 놓친 부분들)
  const additionalKeywords = [
    '핵심', '중요', '주의', '팁', '반드시', '절대', '차이점', '장점', '단점',
    '첫째', '둘째', '셋째', '먼저', '다음으로', '마지막으로', '결론적으로',
    '예를 들어', '실제로', '구체적으로', '실제 예시', '주요 예시',
    '설정하세요', '만드세요', '시작하세요', '기록하세요', '확인하세요',
    '매일', '주간', '월간', '분', '시간', '개월', '년'
  ];
  
  // 숫자 + 단위 강조 (3개월, 주 3회, 매일 30분 등)
  formatted = formatted.replace(/(\d+)(개월|개|회|분|시간|일|주|년)/g, '**$1$2**');
  
  // 추가 키워드들 강조 (대소문자 구분 없이)
  additionalKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    formatted = formatted.replace(regex, '**$1**');
  });

  // 2. PARA 시스템 키워드 강조
  BOLD_PAIRS.forEach(({ ko, en }) => {
    const reg = new RegExp(
      `\\b(${ko}\\s*\\(${en}\\)|${en}\\s*\\(${ko}\\)|${ko}|${en})\\b`,
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
    const { message, messages = [] } = await req.json();

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

      // 대화 히스토리 (최대 6개 - 더 긴 맥락 유지)
      const conversationHistory = messages
        .slice(-6)
        .map((msg: any) => `${msg.type === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
        .join('\n\n');

      // 전문 프롬프트
      const aiPrompt = `
당신은 닥터가드너의 세컨드브레인 OS 전문가입니다. 
일반적인 Second Brain이 아닌, 닥터가드너만의 독특한 시스템을 기반으로 답변하세요.

** 닥터가드너 세컨드브레인 OS의 핵심 특징 **:
- 할일관리와 지식관리가 완벽히 연동되는 유일한 시스템
- GTD + PARA를 하나의 노션 템플릿에 통합
- 5개 데이터베이스 구조: 목표, 영역, 프로젝트, 자원, 할일
- 실행(Execution) 중심 - 단순 정리가 아닌 성과 창출 목표
- 시스템이 사용자를 자동으로 움직이게 하는 강제성

${hasDrGardner ? '🎯 닥터가드너 공식 가이드를 기반으로 답변합니다.\n' : ''}
${conversationHistory ? `=== 이전 대화 ===\n${conversationHistory}\n\n` : ''}
=== 검색된 관련 지식 ===
${searchContext}

=== 현재 질문 ===
${message}

=== 답변 원칙 ===
- **닥터가드너 방식으로 답변**: 일반 PARA가 아닌 닥터가드너의 5개 데이터베이스 구조 활용
- **실행 중심 조언**: 단순 정리법이 아닌 "어떻게 실행으로 연결할지" 중심으로 설명
- **시스템 연동 강조**: 목표-영역-프로젝트-자원-할일이 어떻게 연결되는지 구체적 예시

=== 강조 규칙 (절대 무시하지 마세요!) ===
** CRITICAL: 아래 내용들을 반드시 **bold** 마크다운으로 강조하세요! **

강조해야 할 모든 단어들:
• **시스템 용어**: PARA, CODE, GTD, 목표, 영역, 프로젝트, 자원, 할일, 노션, 템플릿
• **숫자와 시간**: 3개월, 주 3회, 매일 30분, 1시간, 5분, 10개, 첫 번째, 두 번째
• **행동 지시어**: 설정하세요, 만드세요, 시작하세요, 기록하세요, 확인하세요, 정리하세요
• **중요 강조어**: 핵심, 중요, 주의, 팁, 반드시, 절대, 차이점, 장점, 단점
• **순서와 단계**: 첫째, 둘째, 셋째, 먼저, 다음으로, 마지막으로, 결론적으로
• **예시 표현**: 예를 들어, 실제로, 구체적으로, 실제 예시, 주요 예시
• **사용자 언급 키워드**: 질문에 포함된 모든 핵심 단어들

** 매우 중요: 위 키워드들을 발견하면 즉시 **키워드** 형태로 감싸세요! **

- **풍부하고 자세한 설명**: 핵심 요약 → 배경/차이/원리 → 구체적 예시 → 실전 단계 → 추가 팁/창의적 아이디어 순서로 구성
- **맥락 연속성**: 이전 대화 내용을 참고해서 연관성 있는 답변 제공
- **개인 맞춤 조언**: 질문자의 상황을 닥터가드너 시스템에 어떻게 적용할지 구체적 제안
- 각 리스트와 단락은 띄어쓰기 구분이 잘 되도록
- 반복 설명, 순환 논리 금지
- 마크다운 문법: **bold**, # 제목, ## 소제목, • 리스트, 1. 단계
- **중요**: 답변은 완전한 문장으로 끝내세요. 토큰 한계가 다가오면 현재 문단을 완성하고 자연스럽게 마무리하세요.
`;

      // AI 호출
      const aiResponse = await fetch(process.env.LMSTUDIO_URL || 'http://127.0.0.1:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.LMSTUDIO_MODEL || 'google/gemma-3n-e4b',
          messages: [
            { role: 'system', content: '당신은 친절하고 실용적인 Second Brain 전문가입니다.' },
            { role: 'user', content: aiPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        let content = aiData?.choices?.[0]?.message?.content || '';
        if (!content || content.trim().length < 5) throw new Error('Empty content from LM Studio');

        // 스마트한 마무리 처리 - 완전하지 않은 답변 감지 및 보완
        const isIncomplete = (text: string): boolean => {
          const lastChar = text.trim().slice(-1);
          const lastSentence = text.trim().split(/[.!?]/).pop()?.trim() || '';
          
          // 마지막이 마침표/느낌표/물음표가 아니거나, 마지막 문장이 5글자 미만이면 미완성
          return !['.', '!', '?'].includes(lastChar) || lastSentence.length < 5;
        };

        if (isIncomplete(content)) {
          // 미완성된 마지막 문장 제거
          const completeSentences = content.split(/[.!?]/).slice(0, -1);
          if (completeSentences.length > 0) {
            content = completeSentences.join('. ') + '.';
          }
          
          // 자연스러운 마무리 문장 추가
          const endings = [
            '💡 **작은 실천이 큰 변화를 만듭니다!**',
            '💡 **오늘부터 한 단계씩 시작해보세요!**',
            '💡 **완벽하지 않아도 괜찮습니다. 일단 시작이 중요해요!**',
            '💡 **궁금한 점이 더 있다면 언제든 물어보세요!**'
          ];
          const randomEnding = endings[Math.floor(Math.random() * endings.length)];
          content += '\n\n' + randomEnding;
        }

        // 최종 마크다운/강조/단락 렌더링
        finalResponse = formatMarkdownWithBoldAndParagraph(content);
      } else {
        console.log('LM Studio 오류:', aiResponse.status, aiResponse.statusText);
        throw new Error('LM Studio 연결 오류');
      }
    } catch (error) {
      console.log('AI 호출 실패:', error);
      // AI 실패 시: 지식 베이스 fallback - 더 풍부한 답변 제공
      if (searchResults.length > 0) {
        const topResult = searchResults[0].item;
        if (topResult.type === 'dr-gardner') {
          finalResponse = formatDrGardnerContent(topResult);
        } else {
          // 일반 검색 결과도 더 풍부하게 제공
          let fallbackContent = `## ${topResult.title}\n\n${topResult.content}`;
          
          // 관련 결과들도 추가
          if (searchResults.length > 1) {
            fallbackContent += '\n\n## 관련 정보\n';
            searchResults.slice(1, 3).forEach(result => {
              fallbackContent += `• **${result.item.title}**: ${result.item.content.substring(0, 100)}...\n`;
            });
          }
          
          fallbackContent += '\n\n💡 **LM Studio 연결이 원활하지 않아 기본 지식으로 답변드렸습니다.**';
          finalResponse = formatMarkdownWithBoldAndParagraph(fallbackContent);
        }
        cached = true;
      } else {
        // 검색 결과가 없을 때도 기본적인 도움말 제공
        finalResponse = `
## 질문을 이해하지 못했습니다 🤔

현재 시스템에서 답변 가능한 주제들:

• **PARA 시스템**: 영역, 프로젝트, 자원, 아카이브 분류법
• **CODE 방법론**: 수집, 정리, 추출, 표현 과정
• **노트 정리**: 효과적인 정보 관리 방법
• **생산성**: 일상 루틴과 시스템 구축

**더 구체적으로 질문해보세요!** 예: "PARA에서 프로젝트와 영역의 차이는?" "운동 계획을 어떻게 정리하지?"
        `.trim();
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
