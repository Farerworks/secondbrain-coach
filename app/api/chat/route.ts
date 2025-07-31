import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // LM Studio API 호출
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "lmstudio-community/gemma-3n-E4B-it-MLX-4bit",
        messages: [
          {
            role: "system",
            content: `You are an expert on Dr. Gardner's Second Brain system using Notion.

Key concepts you must explain:

1. PARA Method:
- Projects: Have clear end dates (e.g., "Get certification", "Move to new house")
- Areas: Ongoing responsibilities (e.g., "Health", "Family", "Work")
- Resources: Interests without responsibility (e.g., "Writing tips", "Investment")
- Archives: Completed or paused items

2. CODE Method:
- Capture: Quickly collect everything
- Organize: Sort using PARA
- Distill: Extract key insights, atomic notes
- Express: Create actual outputs

3. Important principles:
- Projects come from Areas
- Archives are assets, not trash
- Habits can be 30-day projects
- Use "When will this end?" to distinguish Projects vs Areas

ALWAYS answer in Korean (한국어로 답변하세요).
Be specific with examples.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.5,  // 낮춰서 더 일관된 답변
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('LM Studio 연결 실패');
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return NextResponse.json({ response: botResponse });
    
  } catch (error) {
    console.error('API 에러:', error);
    
    // 에러 시 기본 응답
    return NextResponse.json({ 
      response: '❌ LM Studio 연결 오류\n\n해결 방법:\n1. LM Studio 실행 확인\n2. 모델 로드 확인\n3. 서버 시작 (포트 1234)\n\n임시로 기본 답변을 제공합니다.' 
    });
  }
}