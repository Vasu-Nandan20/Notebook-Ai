// app/api/export/route.ts
import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { content, format = 'pdf', content_type = 'general' } = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient(token);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    // Choose best format based on content type (simple logic)
    let finalFormat = format;
    if (content_type === 'quiz' && format === 'pdf') finalFormat = 'pdf';
    if (content_type === 'flashcards' && format === 'pdf') finalFormat = 'pdf';

    // For now, return the content with metadata.
    // In production, you can call a dedicated n8n export workflow or use libraries like pdf-lib, docx, etc.
    const exportData = {
      success: true,
      format: finalFormat,
      content_type,
      filename: `notebookai-export-${Date.now()}.${finalFormat}`,
      content: content.substring(0, 5000), // truncated for response
      message: `Export ready in ${finalFormat.toUpperCase()} format`,
    };

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      endpoint: '/api/export',
      tokens_used: 0,
    });

    return Response.json(exportData);
  } catch (error: any) {
    console.error('Export Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to export content' 
    }, { status: 500 });
  }
}