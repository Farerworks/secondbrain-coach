# SecondBrain Coach

Second Brain 시스템(PARA, CODE 방법론)을 학습하고, 업로드한 자료와 닥터가드너 콘텐츠를 근거로 답하는 로컬 AI 코치입니다.

## 주요 기능

- 💬 기본 지식(Fuse.js) 기반 Q&A (닥터가드너 자료 포함)
- 📚 RAG 기반 근거 인용 답변(로컬 임베딩/로컬 LLM)
- 📤 파일 업로드(txt/md/pdf) → 청킹 → 임베딩 → 벡터 검색
- 🗂 노트북 단위로 자료 관리(Notebook)
- 🧩 메인 채팅 화면에 RAG 토글/노트북 선택/업로드 통합
- 🌙 다크모드, 다중 세션 저장

## 기술 스택

- **Framework**: Next.js 15(App Router), TypeScript, Tailwind CSS
- **LLM**: LM Studio (로컬 서버, 예: `google/gemma-3n-e4b`)
- **임베딩**: `@xenova/transformers` (All-MiniLM-L6-v2, 로컬에서 자동 다운로드)
- **검색**: Fuse.js(기본 지식), 코사인 유사도(RAG)

## 빠른 시작 (권장 환경: Node 20)

1) Node 20 사용(중요)
```bash
# nvm 설치 후
nvm install 20
nvm use 20
```

2) LM Studio 실행
- 모델 로드: 예) `google/gemma-3n-e4b`
- 서버 시작: Server 탭 → Start (기본: `http://127.0.0.1:1234`)
- `.env.local` (프로젝트 루트)
```
LMSTUDIO_URL=http://127.0.0.1:1234/v1/chat/completions
LMSTUDIO_MODEL=google/gemma-3n-e4b
```

3) 설치/실행
```bash
npm install
# 개발 모드(빠름)
NEXT_DISABLE_TURBOPACK=1 npm run dev -- -p 3001
# 또는 프로덕션
npm run build
npm run start -- -p 3001
```
- 접속: `http://localhost:3001`

## 사용법

### 메인 채팅에서 RAG 사용하기(권장)
- 메인(`/`) 접속 → 입력창 위 “근거 기반(RAG)” 체크 ON
- 노트북 선택/생성 → 파일 업로드(txt/md/pdf)
- 질문 입력 → 전송(근거 인용 포함 응답)

### 업로드 전용 페이지(선택)
- `http://localhost:3001/rag`
- 노트북 생성/선택 → 파일 업로드 → 질문

## RAG API

- POST `/api/rag/notebooks` 새 노트북 생성
```bash
curl -X POST http://localhost:3001/api/rag/notebooks \
  -H "Content-Type: application/json" \
  -d '{"title":"내 노트북"}'
```
- GET `/api/rag/notebooks` 노트북 목록
- POST `/api/rag/upload` 파일 업로드(멀티파트)
```bash
curl -X POST http://localhost:3001/api/rag/upload \
  -F "notebookId=<노트북_ID>" \
  -F "files=@/absolute/path/doc1.txt" \
  -F "files=@/absolute/path/doc2.pdf"
```
- POST `/api/rag/ask` 질문하기(근거 인용)
```bash
curl -X POST http://localhost:3001/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{"notebookId":"<노트북_ID>","question":"핵심 요약","topK":5}'
```
- POST `/api/rag/ingest-gardner` 닥터가드너 JSON 일괄 인덱싱(옵션)
```bash
curl -X POST http://localhost:3001/api/rag/ingest-gardner \
  -H "Content-Type: application/json" \
  -d '{"notebookId":"<노트북_ID>"}'
```

## 닥터가드너 데이터는 어디에?

- 폴더: `data/dr-gardner/`
  - `core-concepts.json`, `para-system.json`, `code-method.json`, `notion-setup.json`, `automation.json`, `troubleshooting.json`, (필요 시 `index.json`)
- 기본 Q&A 경로: `lib/search.ts`가 위 JSON들을 정적 import → `flattenDrGardnerData()`로 평탄화 → Fuse 인덱스에 통합
- RAG 포함(선택): `/api/rag/ingest-gardner` 호출 시 동일 JSON을 큰 텍스트로 합쳐 청킹/임베딩하여 RAG 인덱스에 저장 → 근거 인용 포함 응답 가능

## 데이터 보관/주의

- RAG 인덱스 파일: `data/rag-index.json` (로컬 영속, `.gitignore` 처리)
- 처음 임베딩 시 모델 다운로드로 1–2분 소요 가능
- 민감 정보는 업로드하지 마세요

## 트러블슈팅

- 브라우저가 안 열리면
  - 캐시 우회(시크릿 창) 또는 포트 변경: `-p 3002`
- dev 실행이 "Compiling …"에서 오래 걸리면
  - Node 20 사용 권장 (Node 22에서 지연 사례 있음)
  - 개발 모드: `NEXT_DISABLE_TURBOPACK=1 npm run dev -- -p 3001`
- 포트 충돌
```bash
lsof -tiTCP:3001 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
```
- LM Studio 모델/서버 확인
```bash
curl http://127.0.0.1:1234/v1/models
```

## 배포/버전 관리

- `.gitignore` 주요 항목: `.next/`, `node_modules/`, `.env.local`, `data/rag-index.json`
- GitHub 리포: `Farerworks/secondbrain-coach`

## 변경 이력(최근)

- feat: RAG 통합 및 업로드 UI 추가
  - `lib/rag.ts`(청킹/임베딩/검색/저장), `@xenova/transformers`, `pdf-parse`
  - API: `/api/rag/notebooks`, `/api/rag/upload`, `/api/rag/ask`, `/api/rag/ingest-gardner`
  - UI: 메인 채팅에 RAG 토글/노트북/업로드 통합, `/rag` 업로드 페이지 추가
  - LM Studio 연동(.env.local)
  - 닥터가드너 JSON의 RAG 인덱싱 지원

---

만든 사람: [@Farerworks](https://github.com/Farerworks)