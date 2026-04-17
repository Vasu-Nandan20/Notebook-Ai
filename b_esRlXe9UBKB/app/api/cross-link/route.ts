// app/api/cross-link/route.ts
import { NextRequest } from 'next/server';
import { crossFileLink } from '@/lib/api';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient(token);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = {
      user_id: user.id,
      query: body.query,
      max_results: body.max_results || 15,
      similarity_threshold: body.similarity_threshold || 0.3,
    };

    const result = await crossFileLink(payload, token);

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      endpoint: '/api/cross-link',
      tokens_used: 0,
    });

    return Response.json(result);
  } catch (error: any) {
    console.error('Cross-Link Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to find cross-file connections' 
    }, { status: 500 });
  }
}