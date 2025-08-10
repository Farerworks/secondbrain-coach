import { NextRequest, NextResponse } from 'next/server';
import { createNotebook, listNotebooks } from '@/lib/rag';

export const runtime = 'nodejs';

export async function GET() {
  const notebooks = listNotebooks();
  return NextResponse.json({ notebooks });
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  const meta = await createNotebook(title);
  return NextResponse.json(meta);
}




