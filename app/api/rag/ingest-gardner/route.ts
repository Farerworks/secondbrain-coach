import { NextRequest, NextResponse } from 'next/server';
import drGardnerCore from '@/data/dr-gardner/core-concepts.json';
import drGardnerPara from '@/data/dr-gardner/para-system.json';
import drGardnerCode from '@/data/dr-gardner/code-method.json';
import drGardnerNotion from '@/data/dr-gardner/notion-setup.json';
import drGardnerAutomation from '@/data/dr-gardner/automation.json';
import drGardnerTroubleshooting from '@/data/dr-gardner/troubleshooting.json';
import { addPlainTextToNotebook } from '@/lib/rag';

export const runtime = 'nodejs';

function flattenToText(objects: any): string {
  const lines: string[] = [];
  Object.values(objects || {}).forEach((item: any) => {
    if (!item || typeof item !== 'object') return;
    const title = item.title || item.id || '';
    const summary = item.summary || '';
    const content = item.content || '';
    const keyPoints = Array.isArray(item.keyPoints) ? item.keyPoints.join(' • ') : '';
    const examples = Array.isArray(item.examples) ? item.examples.join(' • ') : '';
    const tips = Array.isArray(item.tips) ? item.tips.join(' • ') : '';
    const steps = Array.isArray(item.steps)
      ? item.steps.map((s: any, i: number) => (typeof s === 'string' ? `${i + 1}. ${s}` : `${s.step || i + 1}. ${s.title || ''}`)).join(' \n ')
      : '';
    lines.push(`# ${title}\n${summary}\n${content}\n핵심:${keyPoints}\n예시:${examples}\n팁:${tips}\n단계:${steps}`);
  });
  return lines.join('\n\n---\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const { notebookId } = await req.json();
    if (!notebookId) return NextResponse.json({ error: 'notebookId required' }, { status: 400 });

    const bundles = [drGardnerCore, drGardnerPara, drGardnerCode, drGardnerNotion, drGardnerAutomation, drGardnerTroubleshooting];
    const text = bundles.map(b => flattenToText(b)).join('\n\n====\n\n');
    const result = await addPlainTextToNotebook(notebookId, 'dr-gardner.jsonl', text);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'ingest failed' }, { status: 500 });
  }
}





