import fs from 'fs';
import path from 'path';

// 지연 로딩을 위한 타입 선언
let pipeline: any;

export interface NotebookMeta {
  id: string;
  title: string;
  createdAt: string;
}

export interface ChunkMeta {
  sourceId: string;
  fileName: string;
  page: string;
  chunkIndex: number;
}

export interface VectorEntry {
  id: string;
  text: string;
  metadata: ChunkMeta;
  vector: number[];
}

export interface RAGIndexFile {
  notebooks: Record<string, NotebookMeta>;
  store: Record<string, VectorEntry[]>; // notebookId -> entries
  sources: Record<string, { id: string; notebookId: string; fileName: string; pageCount?: number; uploadedAt: string }[]>; // notebookId -> sources
}

const DATA_DIR = path.join(process.cwd(), 'data');
const INDEX_PATH = path.join(DATA_DIR, 'rag-index.json');

function ensureDataFile(): RAGIndexFile {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(INDEX_PATH)) {
    const init: RAGIndexFile = { notebooks: {}, store: {}, sources: {} };
    fs.writeFileSync(INDEX_PATH, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
  const raw = fs.readFileSync(INDEX_PATH, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    const init: RAGIndexFile = { notebooks: {}, store: {}, sources: {} };
    fs.writeFileSync(INDEX_PATH, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
}

function saveDataFile(data: RAGIndexFile) {
  fs.writeFileSync(INDEX_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function createNotebook(title: string): Promise<NotebookMeta> {
  const db = ensureDataFile();
  const id = `nb_${Date.now()}`;
  const meta: NotebookMeta = { id, title, createdAt: new Date().toISOString() };
  db.notebooks[id] = meta;
  db.store[id] = db.store[id] || [];
  db.sources[id] = db.sources[id] || [];
  saveDataFile(db);
  return meta;
}

export function listNotebooks(): NotebookMeta[] {
  const db = ensureDataFile();
  return Object.values(db.notebooks);
}

export function listSources(notebookId: string) {
  const db = ensureDataFile();
  return db.sources[notebookId] || [];
}

// 텍스트 청킹
export function chunkText(text: string, maxChars = 1000, overlap = 150): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + maxChars, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    if (end >= cleaned.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

// PDF -> 텍스트
export async function extractTextFromPdf(buffer: Buffer): Promise<{ pages: string[] }>{
  const { default: pdfParse } = await import('pdf-parse');
  const data = await pdfParse(buffer);
  // pdf-parse는 전체 텍스트를 반환하므로, 간단히 단락 기준으로 분할
  const pages = data.text.split(/\n\s*\n/g).map(p => p.trim()).filter(Boolean);
  return { pages };
}

// 임베딩 초기화 및 계산
async function getEmbeddingPipeline() {
  if (!pipeline) {
    const mod = await import('@xenova/transformers');
    pipeline = await (mod as any).pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return pipeline;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const pipe = await getEmbeddingPipeline();
  const vectors: number[][] = [];
  for (const t of texts) {
    const output = await pipe(t, { pooling: 'mean', normalize: true });
    const arr = Array.from(output.data as Float32Array);
    vectors.push(arr);
  }
  return vectors;
}

// 코사인 유사도
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-8;
  return dot / denom;
}

export function topKSimilar(queryVec: number[], entries: VectorEntry[], k = 5) {
  return entries
    .map(e => ({ entry: e, score: cosineSimilarity(queryVec, e.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export async function addSourceToNotebook(
  notebookId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
) {
  const db = ensureDataFile();
  if (!db.notebooks[notebookId]) throw new Error('Notebook not found');

  const chunks: { text: string; page: string; idx: number }[] = [];

  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    const { pages } = await extractTextFromPdf(fileBuffer);
    pages.forEach((p, i) => {
      const cs = chunkText(p);
      cs.forEach((c, j) => chunks.push({ text: c, page: String(i + 1), idx: j }));
    });
  } else {
    const text = fileBuffer.toString('utf-8');
    const cs = chunkText(text);
    cs.forEach((c, j) => chunks.push({ text: c, page: '-', idx: j }));
  }

  if (chunks.length === 0) return { added: 0 };

  const vectors = await embedTexts(chunks.map(c => c.text));

  const sourceId = `src_${Date.now()}`;
  const now = new Date().toISOString();

  db.sources[notebookId] = db.sources[notebookId] || [];
  db.sources[notebookId].push({ id: sourceId, notebookId, fileName, uploadedAt: now });

  db.store[notebookId] = db.store[notebookId] || [];
  chunks.forEach((c, i) => {
    const entry: VectorEntry = {
      id: `${sourceId}_${i}`,
      text: c.text,
      metadata: {
        sourceId,
        fileName,
        page: c.page,
        chunkIndex: c.idx,
      },
      vector: vectors[i],
    };
    db.store[notebookId].push(entry);
  });

  saveDataFile(db);
  return { added: chunks.length, sourceId };
}

export async function retrieveContext(
  notebookId: string,
  question: string,
  k = 5
) {
  const db = ensureDataFile();
  const entries = db.store[notebookId] || [];
  if (entries.length === 0) return { contexts: [], citations: [] as any[] };

  const [qv] = await embedTexts([question]);
  const ranked = topKSimilar(qv, entries, k);

  const contexts = ranked.map(r => r.entry.text);
  const citations = ranked.map(r => ({
    score: r.score,
    fileName: r.entry.metadata.fileName,
    page: r.entry.metadata.page,
    sourceId: r.entry.metadata.sourceId,
    snippet: r.entry.text.slice(0, 200)
  }));
  return { contexts, citations };
}

// 임의 텍스트를 파일처럼 노트북에 추가
export async function addPlainTextToNotebook(
  notebookId: string,
  fileName: string,
  text: string
) {
  const db = ensureDataFile();
  if (!db.notebooks[notebookId]) throw new Error('Notebook not found');

  const segments = chunkText(text);
  if (segments.length === 0) return { added: 0 };

  const vectors = await embedTexts(segments);
  const sourceId = `src_${Date.now()}`;
  const now = new Date().toISOString();

  db.sources[notebookId] = db.sources[notebookId] || [];
  db.sources[notebookId].push({ id: sourceId, notebookId, fileName, uploadedAt: now });

  db.store[notebookId] = db.store[notebookId] || [];
  segments.forEach((seg, i) => {
    const entry: VectorEntry = {
      id: `${sourceId}_${i}`,
      text: seg,
      metadata: {
        sourceId,
        fileName,
        page: '-',
        chunkIndex: i,
      },
      vector: vectors[i],
    };
    db.store[notebookId].push(entry);
  });

  saveDataFile(db);
  return { added: segments.length, sourceId };
}
