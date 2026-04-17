const N8N_BASE = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

export async function n8nCall(endpoint: string, payload: any, token?: string) {
  const res = await fetch(`${N8N_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ body: payload }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`n8n Error: ${res.status} - ${errorText}`);
  }
  return res.json();
}

// API Helpers
export const uploadContent = (data: any, token: string) => n8nCall('/process-file', data, token);
export const generateQuiz = (data: any, token: string) => n8nCall('/generate-quiz', data, token);
export const evaluateQuiz = (data: any, token: string) => n8nCall('/evaluate-quiz', data, token);
export const generateFlashcards = (data: any, token: string) => n8nCall('/generate-flashcards', data, token);
export const crossFileLink = (data: any, token: string) => n8nCall('/cross-link', data, token);