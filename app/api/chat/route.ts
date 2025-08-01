import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/search';

// 텍스트를 마크다운으로 안전하게 변환
function ensureMarkdownFormat(content: string): string {
  let formatted = content;
  
  // 헤더 형식 통일
  formatted = formatted.replace(/^(#{1,6})\s*([^\n]+)/gm, (match, hashes, title) => {
    const level = Math.min(hashes.length, 3); // 최대 ### 까지만
    return '#'.repeat(level) + ' ' + title.trim();
  });
  
  // 리스트 형식 정리
  formatted = formatted.replace(/^[\s]*[-*+•·▪▫◦‣⁃]\s+/gm, '• ');
  formatted = formatted.replace(/^[\s]*(\d+)[.)]\s+/gm, '$1. ');
  
  // 링크 형식 정리
  formatted = formatted.replace(/\[([^\]]+)\]\s+\(([^)]+)\)/g, '[$1]($2)');
  
  // 코드 블록 정리
  formatted = formatted.replace(/```([^`\n]*)\n/g, '```$1\n');
  formatted = formatted.replace(/\n```/g, '\n```');
  
  // 인라인 코드 정리
  formatted = formatted.replace(/`([^`]+)`/g, '`$1`');
  
  // 빈 줄 정리
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // 문단 시작 공백 제거
  formatted = formatted.replace(/\n\s+/g, '\n');
  
  return formatted.trim();
}

// 응답 포맷을 완전히 정리하는 함수
function formatResponse(content: string): string {
  // 1단계: 마크다운 형식 보장
  let formatted = ensureMarkdownFormat(content);
  
  // 2단계: 특수 케이스 처리
  
  // PARA 요소들 강조 (이미 강조된 것은 건너뛰기)
  const paraKeywords = [
    { word: 'Projects', korean: '프로젝트' },
    { word: 'Areas', korean: '영역' },
    { word: 'Resources', korean: '자원' },
    { word: 'Archives', korean: '아카이브' }
  ];
  
  // CODE 요소들 강조
  const codeKeywords = [
    { word: 'Capture', korean: '수집' },
    { word: 'Organize', korean: '정리' },
    { word: 'Distill', korean: '추출' },
    { word: 'Express', korean: '표현' }
  ];
  
  // 키워드 강조 적용 (이미 강조된 것은 건너뛰기)
  [...paraKeywords, ...codeKeywords].forEach(({ word, korean }) => {
    // 영어 버전
    const engRegex = new RegExp(`(?<!\\*\\*)\\b${word}s?\\b(?!\\*\\*)`, 'g');
    formatted = formatted.replace(engRegex, `**${word}**`);
    
    // 한국어 버전
    const korRegex = new RegExp(`(?<!\\*\\*)${korean}(?!\\*\\*)`, 'g');
    formatted = formatted.replace(korRegex, `**${korean}**`);
  });
  
  // 이모지 정리
  const emojis = ['🎯', '💡', '📌', '🔍', '📊', '✅', '❌', '⚠️', '🎉', '📋', '💭', '✨'];
  emojis.forEach(emoji => {
    formatted = formatted.replace(new RegExp(`${emoji}\\s*`, 'g'), `${emoji} `);
  });
  
  // 3단계: 자연스러운 단락 나눔 추가
  // 마침표 뒤에 대문자나 한글이 시작하면 단락 나눔
  formatted = formatted.replace(/([.!?])\s+([A-Z가-힣])/g, '$1\n\n$2');
  
  // 리스트 전후 단락 나눔
  formatted = formatted.replace(/([^\n])\n(•|\d+\.)/g, '$1\n\n$2');
  formatted = formatted.replace(/(•[^\n]+)\n([^•\d])/g, '$1\n\n$2');
  
  // 제목 전후 단락 나눔
  formatted = formatted.replace(/([^\n])\n(#{1,3}\s)/g, '$1\n\n$2');
  formatted = formatted.replace(/(#{1,3}[^\n]+)\n([^#])/g, '$1\n\n$2');
  
  // 4단계: 최종 정리
  
  // 문장 끝 공백 제거
  formatted = formatted.replace(/\s+\./g, '.');
  formatted = formatted.replace(/\s+,/g, ',');
  
  // 중복된 강조 표시 제거
  formatted = formatted.replace(/\*{4,}/g, '**'); // 4개 이상의 *는 2개로
  formatted = formatted.replace(/\*\*\s+\*\*/g, ' ');
  
  // 리스트 항목 사이 적절한 간격
  formatted = formatted.replace(/\n(•|\d+\.)\s+/g, '\n$1 ');
  
  // 과도한 빈 줄 제거
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  
  // $1 같은 치환 문자 제거 (혹시 남아있을 경우)
  formatted = formatted.replace(/\$\d+/g, '');
  
  return formatted;
}

// 닥터가드너 콘텐츠를 마크다운 형식으로 변환
function formatDrGardnerContent(item: any): string {
  let response = '';
  
  // 기본 콘텐츠
  if (item.content) {
    response = ensureMarkdownFormat(item.content);
  }
  
  // keyPoints가 있으면 추가
  if (item.keyPoints && Array.isArray(item.keyPoints) && item.keyPoints.length > 0) {
    response += '\n\n### 💡 핵심 포인트\n\n';
    item.keyPoints.forEach((point: string) => {
      response += `• ${point.trim()}\n`;
    });
  }
  
  // examples가 있으면 추가
  if (item.examples && Array.isArray(item.examples) && item.examples.length > 0) {
    response += '\n\n### 📌 예시\n\n';
    item.examples.forEach((ex: string) => {
      response += `• ${ex.trim()}\n`;
    });
  }
  
  // tips가 있으면 추가
  if (item.tips && Array.isArray(item.tips) && item.tips.length > 0) {
    response += '\n\n### 💭 팁\n\n';
    item.tips.forEach((tip: string) => {
      response += `• ${tip.trim()}\n`;
    });
  }
  
  // steps가 있으면 추가
  if (item.steps && Array.isArray(item.steps) && item.steps.length > 0) {
    response += '\n\n### 📋 단계별 가이드\n\n';
    item.steps.forEach((step: any, index: number) => {
      if (typeof step === 'string') {
        response += `${index + 1}. ${step.trim()}\n`;
      } else if (step.step && step.title) {
        response += `**${step.step}. ${step.title}**\n`;
        if (step.actions && Array.isArray(step.actions)) {
          step.actions.forEach((action: string) => {
            response += `   • ${action.trim()}\n`;
          });
        }
        response += '\n';
      }
    });
  }
  
  // 최종 포맷 정리
  return formatResponse(response);
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, messages = [] } = await req.json();
    
    console.log('받은 메시지:', message);
    console.log('대화 ID:', conversationId);

    // 지식 베이스 검색
    const searchResults = await searchKnowledge(message);
    console.log('검색 결과 수:', searchResults.length);
    
    // 닥터가드너 콘텐츠가 있는지 확인
    const hasDrGardnerContent = searchResults.some(
      result => result.item.type === 'dr-gardner' || 
                result.item.category?.includes('닥터가드너')
    );
    console.log('닥터가드너 콘텐츠 포함:', hasDrGardnerContent);

    let finalResponse = '';
    let suggestions = [];
    let cached = false;

    // AI 응답 시도
    try {
      console.log('🔍 LM Studio 시도 중...');
      
      // 검색 결과에서 컨텍스트 생성
      const searchContext = searchResults.slice(0, 5).map(result => {
        const item = result.item;
        return `[${item.category}] ${item.title}: ${item.content?.substring(0, 300)}...`;
      }).join('\n\n');
      
      // 대화 히스토리 생성 (최근 5개 메시지만)
      const conversationHistory = messages
        .slice(-10) // 최근 10개 메시지 (5턴의 대화)
        .map((msg: any) => `${msg.type === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
        .join('\n\n');
      
      // 닥터가드너 전문 프롬프트
      const aiPrompt = `
당신은 닥터가드너의 Second Brain OS 시스템 전문가입니다.
질문에 대해 명확하고 실용적인 답변을 제공하세요.

${hasDrGardnerContent ? '🎯 닥터가드너 공식 가이드를 기반으로 답변합니다.\n' : ''}

${conversationHistory ? `=== 이전 대화 내용 ===
${conversationHistory}

` : ''}

=== 검색된 관련 지식 ===
${searchContext}

=== 현재 사용자 질문 ===
${message}

=== 답변 원칙 ===
1. 이전 대화 맥락을 고려하여 답변:
   - 사용자가 이전에 언급한 내용 참조
   - 반복적인 설명 피하기
   - 대화의 흐름을 자연스럽게 이어가기

2. 구조화된 답변:
   - 핵심 답변을 먼저 제시 (1-2문장으로 명확히)
   - 이유와 배경 설명 (왜 그런지 설명)
   - 구체적인 예시 포함
   - 실행 가능한 단계별 가이드

2. PARA 분류 기준 설명시:
   - Projects: 마감일이 있는 일 (예: "이번달 발표 준비", "다음주까지 보고서 작성")
   - Areas: 지속 관리가 필요한 책임 영역 (예: "건강 관리", "재정 관리", "팀 리더십")
   - Resources: 언젠가 쓸 수 있는 참고 자료 (예: "여행 정보", "레시피", "투자 정보")
   - Archive: 더 이상 활성화되지 않은 것들 (예: "완료된 프로젝트", "이전 직장 자료")

3. CODE 방법론 설명시:
   - Capture: 떠오르는 모든 아이디어를 빠르게 수집
   - Organize: PARA 기준으로 체계적으로 정리
   - Distill: 핵심만 추출하여 실행 가능하게 만들기
   - Express: 축적된 지식으로 가치 있는 결과물 만들기

4. 답변 구성:
   - 핵심 답변 (2-3문장)
   - 배경 설명 (4-5문장)
   - 구체적 예시 (2-3개)
   - 실용적 팁 (3-4개)
   - 다음 행동 제안 (1-2문장)

5. 풍부한 내용 포함:
   - 실제 사용 시나리오
   - 자주 하는 실수와 해결책
   - 단계별 구현 방법
   - 관련 개념과의 연결

6. 피해야 할 것:
   - 순환 논리 (닥터가드너 시스템을 설명하며 닥터가드너 참고하라고 하지 않기)
   - 지나치게 이론적인 설명
   - 실행하기 어려운 조언

마크다운 형식:
- 중요 개념은 **굵게**
- 리스트는 • 사용
- 단계별 설명은 1. 2. 3. 사용
- 필요시 ### 제목 사용`;

      console.log('📡 LM Studio 요청 전송...');
      
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
              content: '당신은 친절하고 상세한 Second Brain 전문가입니다. 질문의 핵심에 답하면서도 풍부한 예시와 실용적인 조언을 제공하세요. 답변은 구조화되고 읽기 쉬워야 합니다.'
            },
            { role: 'user', content: aiPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800,  // 600에서 800으로 증가
          presence_penalty: 0.2,  // 0.3에서 0.2로 줄임
          frequency_penalty: 0.2,
          stop: ["추가적으로", "더 자세한 내용은", "다음 글에서"]
        })
      });

      console.log('📨 응답 상태:', aiResponse.status);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        console.log('✅ LM Studio 응답 성공!');
        console.log('응답 길이:', aiData.choices[0].message.content.length);
        
        let content = aiData.choices[0].message.content;
        
        // 응답 길이 조절
        const sentences = content.split('. ');
        if (sentences.length > 20) {  // 15에서 20으로 늘림
          content = sentences.slice(0, 18).join('. ') + '.';
          content += '\n\n💡 **다음 단계**: 오늘 바로 PARA 폴더를 만들고 현재 진행 중인 일들을 분류해보세요!';
        }
        
        // 포맷 정리
        finalResponse = formatResponse(content);
        console.log('최종 응답 미리보기:', finalResponse.substring(0, 200));
      } else {
        throw new Error('LM Studio 응답 실패');
      }
    } catch (aiError) {
      console.error('❌ LM Studio 오류:', aiError);
      
      // AI 실패 시 검색 결과 기반 간단한 응답
      if (searchResults.length > 0) {
        const topResult = searchResults[0].item;
        
        // 닥터가드너 콘텐츠가 있으면 더 풍부한 응답 생성
        if (topResult.type === 'dr-gardner') {
          finalResponse = formatDrGardnerContent(topResult);
          
          // 카테고리에 따른 추가 안내
          if (topResult.category?.includes('PARA')) {
            finalResponse += '\n\n🎯 **다음 단계**: PARA 폴더를 만들고 현재 진행 중인 프로젝트를 정리해보세요.';
          } else if (topResult.category?.includes('CODE')) {
            finalResponse += '\n\n🎯 **다음 단계**: 오늘부터 수집 습관을 시작해보세요. 모든 아이디어를 즉시 캡처하세요!';
          } else if (topResult.category?.includes('자동화')) {
            finalResponse += '\n\n🎯 **다음 단계**: 가장 자주 하는 반복 작업부터 버튼으로 자동화해보세요.';
          }
        } else {
          // 일반 콘텐츠는 요약
          const sentences = topResult.content.split('. ').slice(0, 3).join('. ') + '.';
          finalResponse = formatResponse(sentences);
        }
        
        cached = true;
      } else {
        finalResponse = '죄송합니다. 해당 질문에 대한 정보를 찾을 수 없습니다.';
      }
    }

    // 추천 질문 생성 (컨텍스트 기반)
    if (message.includes('살') || message.includes('다이어트') || message.includes('건강')) {
      suggestions = [
        '습관을 프로젝트로 관리하는 방법은?',
        '운동 계획 세우는 법',
        '주간 리뷰 활용법'
      ];
    } else if (searchResults.length > 0 && searchResults[0].item.relatedTopics) {
      suggestions = searchResults[0].item.relatedTopics.slice(0, 3);
    } else {
      suggestions = [
        'PARA가 뭐야?',
        'CODE 방법론 알려줘',
        '노트 정리 팁'
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
        response: '죄송합니다. 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}