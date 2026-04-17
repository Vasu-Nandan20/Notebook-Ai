import { NextRequest } from 'next/server';
import { n8nCall } from '@/lib/api';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { query, outputType = 'summary', persona = 'teacher' } = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient(token);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await n8nCall('/rag-query', {   // You may need to create this n8n workflow
      query,
      user_id: user.id,
      persona
    }, token);

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}