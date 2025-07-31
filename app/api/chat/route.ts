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
            content: "You are a Second Brain expert. Explain PARA and CODE methods. Answer in Korean."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
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
      response: 'LM Studio가 연결되지 않았습니다. LM Studio를 실행하고 모델을 로드해주세요.' 
    });
  }
}