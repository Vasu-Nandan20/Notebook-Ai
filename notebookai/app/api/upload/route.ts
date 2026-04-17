import { NextRequest } from 'next/server';
import { uploadContent } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await uploadContent(body, token);
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}