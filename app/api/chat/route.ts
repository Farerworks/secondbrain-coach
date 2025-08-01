import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/search';

// 빠른 응답을 위한 템플릿 (더 정확한 매칭을 위해 개선)
const quickResponses = new Map([
  ['para란', {
    keywords: ['para란', 'para가 뭐', 'para 설명', 'para 시스템'],
    response: `PARA는 **Projects, Areas, Resources, Archives**의 약자로...`
  }],
  ['영역 프로젝트 차이', {
    keywords: ['영역과 프로젝트', '프로젝트와 영역', '차이가 뭐', '어떻게 구분'],
    response: `프로젝트와 영역의 가장 중요한 차이는 **"끝이 있느냐 없느냐"**입니다...`
  }],
  ['code 방법론', {
    keywords: ['code 방법론', 'code란', 'code 설명', 'code가 뭐'],
    response: `CODE는 **Capture, Organize, Distill, Express**의 약자로...`
  }],
  // 더 많은 템플릿...
]);

// 키워드 매칭 함수 개선
function findQuickResponse(question: string): string | null {
  const normalizedQuestion = question.toLowerCase().trim();
  
  for (const [, template] of quickResponses) {
    // 모든 키워드가 포함되어 있는지 엄격하게 확인
    const isMatch = template.keywords.some(keyword => {
      const keywordParts = keyword.split(' ');
      return keywordParts.every(part => normalizedQuestion.includes(part));
    });
    
    if (isMatch) {
      return template.response;
    }
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = await req.json();
    
    console.log('받은 메시지:', message);
    console.log('대화 ID:', conversationId);

    // 1. 먼저 빠른 응답 확인 (엄격한 매칭)
    const quickResponse = findQuickResponse(message);
    
    // 2. 지식 베이스 검색 (항상 수행)
    const searchResults = await searchKnowledge(message);
    console.log('검색 결과 수:', searchResults.length);

    // 3. AI 응답 생성 여부 결정
    let finalResponse = '';
    let suggestions = [];
    let cached = false;

    // 빠른 응답이 있고 검색 결과가 매우 관련성이 높은 경우에만 사용
    if (quickResponse && searchResults.length > 0 && searchResults[0].score < 0.3) {
      finalResponse = quickResponse;
      cached = true;
    } else {
      // AI에게 검색 결과와 함께 질문 전달
      try {
        const aiPrompt = `
당신은 닥터가드너의 Second Brain 시스템 전문가입니다. 
사용자의 질문에 대해 친절하고 구체적으로 답변해주세요.

사용자 질문: ${message}

${searchResults.length > 0 ? `
관련 지식 베이스 내용:
${searchResults.slice(0, 3).map(result => `
- ${result.item.title}
${result.item.content}
`).join('\n')}
` : ''}

답변 지침:
1. 사용자의 질문에 직접적으로 답변하세요
2. 구체적인 예시를 포함하세요
3. PARA나 CODE 같은 핵심 개념은 굵은 글씨(**텍스트**)로 강조하세요
4. 실용적이고 적용 가능한 조언을 제공하세요
5. 마크다운 형식으로 작성하세요
`;

        const aiResponse = await fetch('http://localhost:1234/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemma-3n-e4b',
            messages: [
              { 
                role: 'system', 
                content: '당신은 닥터가드너의 Second Brain 시스템 전문가입니다. 사용자가 실제로 시스템을 활용할 수 있도록 구체적이고 실용적인 조언을 제공하세요.'
              },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          finalResponse = aiData.choices[0].message.content;
        } else {
          // AI 응답 실패 시 검색 결과 기반 응답
          if (searchResults.length > 0) {
            finalResponse = `${searchResults[0].item.content}\n\n**관련 주제:**\n${searchResults[0].item.relatedTopics?.join(', ') || ''}`;
          } else {
            finalResponse = '죄송합니다. 해당 질문에 대한 정보를 찾을 수 없습니다. 다른 방식으로 질문해 주시겠어요?';
          }
        }
      } catch (aiError) {
        console.error('AI 응답 오류:', aiError);
        // AI 오류 시 검색 결과 활용
        if (searchResults.length > 0) {
          finalResponse = searchResults[0].item.content;
        } else {
          finalResponse = '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      }
    }

    // 4. 추천 질문 생성 (컨텍스트 기반)
    if (message.includes('살') || message.includes('다이어트') || message.includes('건강')) {
      suggestions = [
        '습관을 프로젝트로 관리하는 방법은?',
        '건강 관련 영역 설정하는 방법',
        'Habit Tracker 활용법'
      ];
    } else if (searchResults.length > 0 && searchResults[0].item.relatedTopics) {
      suggestions = searchResults[0].item.relatedTopics.slice(0, 3);
    } else {
      // 기본 추천 질문
      suggestions = [
        'PARA 시스템이란?',
        'CODE 방법론 설명해줘',
        '프로젝트와 영역의 차이점'
      ];
    }

    return NextResponse.json({
      response: finalResponse,
      suggestions,
      cached,
      searchResults: searchResults.length
    });

  } catch (error) {
    console.error('Chat API 오류:', error);
    return NextResponse.json(
      { 
        response: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}