# 🧠 SecondBrain Coach

닥터가드너의 Second Brain 시스템을 AI 챗봇으로 구현한 프로젝트입니다.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📌 프로젝트 소개

SecondBrain Coach는 PARA 시스템과 CODE 방법론을 쉽게 학습하고 적용할 수 있도록 도와주는 AI 기반 대화형 코치입니다.

### 주요 특징
- 💬 **실시간 AI 대화**: 사용자의 질문에 맞춤형 답변 제공
- 📚 **PARA 시스템 가이드**: Projects, Areas, Resources, Archives 분류법 학습
- 🔄 **CODE 방법론 안내**: Capture, Organize, Distill, Express 프로세스 설명
- 🔍 **스마트 검색**: Fuse.js 기반 지식 베이스 검색
- 💾 **세션 관리**: 여러 대화 내역 저장 및 관리
- 🌙 **다크모드**: 눈이 편안한 다크 테마 지원

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- LM Studio (개발 환경)

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/Farerworks/secondbrain-coach.git
cd secondbrain-coach
```

2. **의존성 설치**
```bash
npm install
# 또는
yarn install
```

3. **LM Studio 설정**
   - [LM Studio](https://lmstudio.ai/) 다운로드 및 설치
   - 모델 다운로드: `google/gemma-3n-e4b`
   - 포트 1234에서 서버 시작

4. **개발 서버 실행**
```bash
npm run dev
# 또는
yarn dev
```

5. **브라우저에서 접속**
```
http://localhost:3000
```

## 🛠 기술 스택

- **Frontend Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: LM Studio (Local) / OpenAI API (Production ready)
- **Search**: Fuse.js
- **Markdown**: React Markdown with remark-gfm
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
secondbrain-coach/
├── app/                    # Next.js 앱 디렉토리
│   ├── api/               # API 라우트
│   ├── page.tsx           # 메인 페이지
│   └── layout.tsx         # 레이아웃
├── components/            # React 컴포넌트
│   ├── ChatMessage.tsx    # 채팅 메시지
│   ├── ChatInput.tsx      # 입력창
│   └── ...
├── lib/                   # 유틸리티 함수
│   └── search.ts          # 검색 로직
├── types/                 # TypeScript 타입 정의
└── data/                  # 지식 베이스 데이터
```

## 💡 사용 방법

1. **첫 방문시**: "무료로 시작하기" 버튼 클릭
2. **질문하기**: Second Brain 관련 궁금한 점 입력
3. **추천 질문**: 하단의 빠른 질문 버튼 활용
4. **세션 관리**: 좌측 사이드바에서 대화 내역 관리
5. **다크모드**: 우측 상단 토글 버튼으로 전환

### 예시 질문
- "PARA 시스템이 뭐야?"
- "프로젝트와 영역의 차이가 뭐야?"
- "노트 쪼개기는 어떻게 해?"
- "나 살빼야 하는데 이 시스템에 어떻게 적용할 수 있어?"

## 🔧 환경 설정

### 개발 환경
```env
NODE_ENV=development
```

### 프로덕션 환경 (준비중)
```env
NODE_ENV=production
OPENAI_API_KEY=your-api-key-here
```

## 📈 향후 계획

- [ ] OpenAI API 통합
- [ ] 사용자 인증 시스템
- [ ] 대화 내보내기 (PDF/Markdown)
- [ ] 음성 입력 기능
- [ ] 모바일 앱 개발
- [ ] 다국어 지원

## 🤝 기여하기

프로젝트 개선에 관심이 있으시다면 언제든 기여해주세요!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 만든 사람

- **개발자**: [codeyoon]
- **이메일**: farerworks@gmail.com
- **GitHub**: [@Farerworks](https://github.com/Farerworks)

## 🙏 감사의 말

- 닥터가드너님의 Second Brain 시스템
- Tiago Forte의 PARA Method
- 모든 오픈소스 기여자들

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!