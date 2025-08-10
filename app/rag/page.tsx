'use client'

import React, { useEffect, useState, useCallback } from 'react';

interface NotebookMeta {
  id: string;
  title: string;
  createdAt: string;
}

interface UploadResultItem {
  file: string;
  added: number;
  sourceId: string;
}

interface AskResponse {
  answer: string;
  citations: Array<{ score: number; fileName: string; page: string; sourceId: string; snippet: string }>
}

export default function RAGPage() {
  const [notebooks, setNotebooks] = useState<NotebookMeta[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('내 노트북');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<UploadResultItem[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [asking, setAsking] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>('');
  const [citations, setCitations] = useState<AskResponse['citations']>([]);
  const [error, setError] = useState<string>('');

  const loadNotebooks = useCallback(async () => {
    try {
      const res = await fetch('/api/rag/notebooks');
      const data = await res.json();
      setNotebooks(data.notebooks || []);
      if (!selectedNotebookId && data.notebooks?.length) {
        setSelectedNotebookId(data.notebooks[0].id);
      }
    } catch (e: any) {
      setError(e?.message || '노트북 목록을 불러오지 못했습니다.');
    }
  }, [selectedNotebookId]);

  useEffect(() => {
    // 초기 진입 시 1회만 호출
    loadNotebooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNotebook = async () => {
    try {
      setError('');
      const res = await fetch('/api/rag/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle || '새 노트북' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '노트북 생성 실패');
      setNotebooks(prev => [data, ...prev]);
      setSelectedNotebookId(data.id);
    } catch (e: any) {
      setError(e?.message || '노트북 생성 실패');
    }
  };

  const handleUpload = async () => {
    if (!selectedNotebookId) {
      setError('노트북을 먼저 선택하거나 생성하세요.');
      return;
    }
    if (!files || files.length === 0) {
      setError('업로드할 파일을 선택하세요.');
      return;
    }
    try {
      setUploading(true);
      setError('');
      const form = new FormData();
      form.append('notebookId', selectedNotebookId);
      Array.from(files).forEach(f => form.append('files', f));
      const res = await fetch('/api/rag/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      setUploadResults(data.results || []);
    } catch (e: any) {
      setError(e?.message || '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!selectedNotebookId) {
      setError('노트북을 먼저 선택하세요.');
      return;
    }
    if (!question.trim()) return;
    try {
      setAsking(true);
      setError('');
      setAnswer('');
      setCitations([]);
      const res = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId: selectedNotebookId, question, topK: 5 })
      });
      const data: AskResponse = await res.json();
      if (!res.ok) throw new Error((data as any).error || '질문 실패');
      setAnswer(data.answer);
      setCitations(data.citations || []);
    } catch (e: any) {
      setError(e?.message || '질문 실패');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">RAG 업로드/질문</h1>

        {error && (
          <div className="p-3 rounded-md bg-red-100 text-red-800">{error}</div>
        )}

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="font-semibold mb-3">1) 노트북 선택/생성</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedNotebookId}
              onChange={(e) => setSelectedNotebookId(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2"
            >
              <option value="">노트북 선택</option>
              {notebooks.map(nb => (
                <option key={nb.id} value={nb.id}>{nb.title} ({new Date(nb.createdAt).toLocaleDateString('ko-KR')})</option>
              ))}
            </select>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 노트북 제목"
              className="bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2"
            />
            <button onClick={handleCreateNotebook} className="px-4 py-2 bg-purple-600 text-white rounded-md">생성</button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="font-semibold mb-3">2) 파일 업로드 (txt, md, pdf)</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="block"
            />
            <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
          {uploadResults.length > 0 && (
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="font-medium">업로드 결과</div>
              <ul className="list-disc ml-5">
                {uploadResults.map((r, idx) => (
                  <li key={idx}>{r.file} → {r.added} 청크 (sourceId: {r.sourceId})</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="font-semibold mb-3">3) 질문하기</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요"
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2"
            />
            <button onClick={handleAsk} disabled={asking} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50">
              {asking ? '생성 중...' : '질문'}
            </button>
          </div>
          {answer && (
            <div className="mt-4">
              <div className="font-semibold mb-2">답변</div>
              <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          )}
          {citations.length > 0 && (
            <div className="mt-4 text-sm">
              <div className="font-semibold mb-2">인용</div>
              <ul className="list-disc ml-5">
                {citations.map((c, idx) => (
                  <li key={idx}>[{(c.score).toFixed(3)}] {c.fileName} p.{c.page} - &quot;{c.snippet.slice(0, 80)}...&quot;</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
