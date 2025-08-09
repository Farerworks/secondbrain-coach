import { NextRequest, NextResponse } from 'next/server';
import { addSourceToNotebook } from '@/lib/rag';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const notebookId = String(form.get('notebookId') || '');
    if (!notebookId) return NextResponse.json({ error: 'notebookId required' }, { status: 400 });

    const files = form.getAll('files');
    if (!files || files.length === 0) return NextResponse.json({ error: 'no files' }, { status: 400 });

    const results: any[] = [];
    for (const f of files) {
      if (typeof f === 'string') continue;
      const file = f as File;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const r = await addSourceToNotebook(notebookId, file.name, buffer, file.type || '');
      results.push({ file: file.name, ...r });
    }

    return NextResponse.json({ notebookId, results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'upload failed' }, { status: 500 });
  }
}
