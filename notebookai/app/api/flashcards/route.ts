// app/api/flashcards/route.ts
import { NextRequest } from 'next/server';
import { generateFlashcards } from '@/lib/api';
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
      file_id: body.file_id,
      num_cards: body.num_cards || 10,
      focus_topics: body.focus_topics || [],
    };

    const result = await generateFlashcards(payload, token);

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      endpoint: '/api/flashcards',
      tokens_used: 0,
    });

    return Response.json(result);
  } catch (error: any) {
    console.error('Flashcards Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to generate flashcards' 
    }, { status: 500 });
  }
}