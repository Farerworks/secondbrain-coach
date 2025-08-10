# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SecondBrain Coach - A local AI coach system that learns Second Brain methodologies (PARA, CODE) and provides Q&A based on uploaded materials and Dr. Gardner content. Built with Next.js 15, TypeScript, and local LLM integration.

## Development Commands

```bash
# Install dependencies (Node 20 recommended)
npm install

# Development mode (with Turbopack disabled for stability)
NEXT_DISABLE_TURBOPACK=1 npm run dev -- -p 3001

# Production build and start
npm run build
npm run start -- -p 3001

# Linting
npm run lint
```

## Environment Setup

1. **Node Version**: Use Node 20 for optimal performance (Node 22 may cause compilation delays)
2. **LM Studio Configuration**: Create `.env.local` in project root:
```
LMSTUDIO_URL=http://127.0.0.1:1234/v1/chat/completions
LMSTUDIO_MODEL=google/gemma-3n-e4b
```
3. **Default Port**: 3001 (changeable with `-p` flag)

## Architecture Overview

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with Typography plugin
- **LLM**: LM Studio local server integration
- **Embeddings**: @xenova/transformers (All-MiniLM-L6-v2, auto-downloads locally)
- **Search**: Fuse.js for basic knowledge, cosine similarity for RAG

### Directory Structure
- `app/` - Next.js App Router pages and API routes
  - `api/chat/` - Main chat endpoint
  - `api/rag/` - RAG system endpoints (notebooks, upload, ask, ingest-gardner)
  - `page.tsx` - Main chat interface with integrated RAG toggle
  - `rag/page.tsx` - Dedicated upload interface
- `components/` - React components (Chat UI, Markdown renderer, etc.)
- `lib/` - Core logic
  - `search.ts` - Fuse.js search implementation with Dr. Gardner data
  - `rag.ts` - RAG system (chunking, embedding, vector search)
- `data/` - Data storage
  - `dr-gardner/` - Dr. Gardner JSON knowledge base
  - `rag-index.json` - Local RAG index (gitignored)

### Key Patterns

1. **RAG System Flow**:
   - File upload → Text extraction (PDF/TXT/MD) → Chunking (1000 chars with 150 overlap)
   - Embedding generation using @xenova/transformers
   - Vector storage in local JSON index
   - Cosine similarity search for retrieval
   - Context injection into LLM prompts

2. **Chat System**:
   - Session management with localStorage
   - Two modes: Basic (Fuse.js) and RAG-based (with citations)
   - Streaming responses from LM Studio
   - Markdown rendering with GFM support

3. **Data Management**:
   - Notebook-based organization for RAG documents
   - Persistent local storage in `data/rag-index.json`
   - Dr. Gardner content statically imported and flattened

## API Endpoints

- `POST /api/chat` - Main chat endpoint
- `POST /api/rag/notebooks` - Create notebook
- `GET /api/rag/notebooks` - List notebooks
- `POST /api/rag/upload` - Upload files (multipart/form-data)
- `POST /api/rag/ask` - RAG-based Q&A with citations
- `POST /api/rag/ingest-gardner` - Index Dr. Gardner content

## Important Notes

- First embedding may take 1-2 minutes for model download
- RAG index is stored locally and not committed to git
- Use absolute paths when working with file system operations
- PDF parsing uses pdf-parse library
- Embedding model runs locally via @xenova/transformers
- LM Studio must be running for chat functionality

## Testing Approach

No test framework is currently configured. To add tests, install and configure a testing framework like Jest or Vitest first.

## Common Issues

- **Port conflicts**: Kill existing process with `lsof -tiTCP:3001 -sTCP:LISTEN | xargs kill -9`
- **Slow compilation**: Use Node 20 and disable Turbopack with `NEXT_DISABLE_TURBOPACK=1`
- **LM Studio connection**: Verify server is running at configured URL
- **Browser caching**: Use incognito mode or different port