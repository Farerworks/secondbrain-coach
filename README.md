# 🧠 SecondBrain Coach

> **AI 기반 지식 관리 학습 플랫폼** - Next.js와 TypeScript로 구현한 풀스택 프로젝트

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react)

## 🎯 프로젝트 개요

복잡한 지식 관리 방법론(PARA, CODE)을 쉽게 학습할 수 있도록 돕는 **AI 대화형 웹 애플리케이션**입니다. 사용자의 질문에 실시간으로 맞춤형 답변을 제공하며, 학습 진도를 관리할 수 있습니다.

### 개발 동기
- 지식 관리 시스템의 높은 진입 장벽을 낮추고자 시작
- AI와 대화하며 학습하는 인터랙티브한 경험 제공
- 실제 사용자의 니즈를 반영한 실용적인 솔루션 개발

## 💡 주요 기능 및 기술적 구현

### 1. **AI 챗봇 시스템**
- **구현**: Next.js API Routes + LM Studio 연동
- **특징**: 
  - 실시간 스트리밍 응답 처리
  - 컨텍스트 기반 대화 관리
  - 에러 핸들링 및 폴백 메커니즘
```typescript
// API 라우트에서 AI 모델 연동
const response = await fetch('http://localhost:1234/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model, messages, temperature })
});
```

### 2. **지능형 검색 시스템**
- **기술**: Fuse.js를 활용한 퍼지 검색
- **최적화**: 
  - 한국어 형태소 처리 (조사 제거)
  - 가중치 기반 검색 정확도 향상
  - 검색 결과 캐싱으로 성능 개선

### 3. **세션 관리 시스템**
- **구현**: React Context API + LocalStorage
- **기능**:
  - 다중 대화 세션 동시 관리
  - 자동 저장 및 복원
  - 세션별 제목 자동 생성

### 4. **반응형 UI/UX**
- **프레임워크**: Tailwind CSS + Custom Components
- **특징**:
  - 다크모드 지원 (시스템 설정 연동)
  - 모바일 최적화 레이아웃
  - 접근성 고려 (ARIA labels, 키보드 네비게이션)

### 5. **컴포넌트 설계**
- **아키텍처**: Atomic Design Pattern 적용
- **재사용성**: 10개의 독립적인 컴포넌트 모듈화
- **타입 안정성**: TypeScript 인터페이스 전체 적용

## 🛠 기술 스택 상세

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (엄격한 타입 체크)
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Markdown**: react-markdown + remark-gfm

### Backend
- **API**: Next.js API Routes
- **AI Integration**: LM Studio (로컬) / OpenAI API 호환
- **Search Engine**: Fuse.js
- **Data Storage**: LocalStorage (클라이언트)

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Version Control**: Git & GitHub

## 📊 프로젝트 성과

- ✅ **100% TypeScript** 적용으로 타입 안정성 확보
- ✅ **10개 이상**의 재사용 가능한 컴포넌트 개발
- ✅ **반응 속도 300ms 이내** 검색 결과 제공
- ✅ **모바일 최적화**로 모든 디바이스 지원
- ✅ **SEO 최적화** 및 웹 접근성 준수

## 🚀 설치 및 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/Farerworks/secondbrain-coach.git
cd secondbrain-coach

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
http://localhost:3000
```

### 환경 설정
1. **LM Studio 설치** (AI 모델 실행용)
2. 추천 모델 다운로드 및 실행
3. 포트 1234에서 API 서버 시작

## 💭 프로젝트를 통해 배운 점

### 기술적 성장
- **Next.js App Router**의 서버/클라이언트 컴포넌트 이해
- **TypeScript**를 활용한 타입 안전한 개발 경험
- **AI API 통합** 및 스트리밍 응답 처리
- **상태 관리**와 **성능 최적화** 기법

### 문제 해결 경험
1. **검색 정확도 문제**: 한국어 특성을 고려한 형태소 처리로 해결
2. **AI 응답 지연**: 스트리밍 응답과 로딩 상태 관리로 UX 개선
3. **세션 데이터 유실**: LocalStorage와 자동 저장 메커니즘 구현

## 🔮 향후 개발 계획

- [ ] 사용자 인증 시스템 구현 (NextAuth.js)
- [ ] 데이터베이스 연동 (PostgreSQL + Prisma)
- [ ] 실시간 협업 기능 (WebSocket)
- [ ] PWA 지원 및 오프라인 모드
- [ ] 다국어 지원 (i18n)

## 📞 연락처

- **GitHub**: [@Farerworks](https://github.com/Farerworks)
- **프로젝트 문의**: GitHub Issues 또는 Pull Request

---

### 🏆 이 프로젝트의 특별한 점

초보 개발자로서 **실제 사용자의 문제를 해결**하는 것에 집중했습니다. 단순한 클론 프로젝트가 아닌, **실용적인 가치**를 제공하는 애플리케이션을 만들고자 했으며, 최신 기술 스택을 활용하여 **프로덕션 레벨**의 품질을 목표로 개발했습니다.

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**