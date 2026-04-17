// app/api/quiz/generate/route.ts
import { NextRequest } from 'next/server';
import { generateQuiz } from '@/lib/api';
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
      difficulty: body.difficulty || 'medium',
      num_questions: body.num_questions || 8,
      topic_focus: body.topic_focus || '',
    };

    const result = await generateQuiz(payload, token);

    // Optional: Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      endpoint: '/api/quiz/generate',
      tokens_used: 0, // Can be estimated from response
    });

    return Response.json(result);
  } catch (error: any) {
    console.error('Quiz Generate Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to generate quiz' 
    }, { status: 500 });
  }
}