import { streamText, type ModelMessage } from 'ai'

export const maxDuration = 30

const personaPrompts: Record<string, string> = {
  teacher:
    'You are a patient, encouraging teacher. Give clear, structured explanations, use concrete examples, and occasionally check the learner\'s understanding.',
  friend:
    'You are a warm, casual friend. Keep the tone conversational, relatable, and approachable while still being accurate.',
  expert:
    'You are a domain expert. Be precise, use correct technical terminology, and provide detailed, well-reasoned analysis.',
  child:
    'You are explaining to a curious child aged 8-10. Use simple words, fun analogies, and an upbeat tone.',
  eli5:
    'Explain as if the user is 5 years old. Use very simple language, short sentences, and everyday analogies.',
}

const outputPrompts: Record<string, string> = {
  summary:
    'Respond with a clear, well-structured answer. Use short paragraphs, headings, and bullet points where helpful.',
  mindmap:
    'Respond in a mind-map style: start with the central topic on one line, then use nested bullet points for branches and sub-branches. Use "- " for every bullet and indent with two spaces per level.',
  table:
    'Respond primarily as a well-formatted GitHub-flavored Markdown table that organizes the key information. Add a short intro sentence before the table.',
  flashcards:
    'Respond with 5-10 study flashcards. For each card use exactly this format on two lines:\n**Q:** <question>\n**A:** <answer>\nSeparate cards with a blank line.',
  quiz:
    'Respond with a 5-question multiple choice quiz. Format each question as:\n**Q1.** <question>\n- A) <option>\n- B) <option>\n- C) <option>\n- D) <option>\n**Answer:** <letter> — <brief explanation>\n\nLeave a blank line between questions.',
}

interface ChatRequestBody {
  messages: ModelMessage[]
  persona?: string
  outputType?: string
  sourcesContext?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody
    const messages = Array.isArray(body.messages) ? body.messages : []
    const persona = body.persona ?? 'teacher'
    const outputType = body.outputType ?? 'summary'
    const sourcesContext = body.sourcesContext?.trim()

    const systemParts = [
      'You are NotebookAI, an intelligent study assistant that helps users understand, summarize, and learn from their materials.',
      personaPrompts[persona] ?? personaPrompts.teacher,
      outputPrompts[outputType] ?? outputPrompts.summary,
      sourcesContext
        ? `The user has provided the following source materials. Prefer answering from these when relevant, and cite them when useful:\n\n${sourcesContext}`
        : 'The user has not uploaded source materials yet. Answer using your general knowledge, and note that no sources are attached if the question seems to require them.',
      'Always format your answer in Markdown. Be accurate, concise, and genuinely helpful. If you do not know something, say so.',
    ]

    const result = streamText({
      model: 'openai/gpt-5-mini',
      system: systemParts.join('\n\n'),
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    console.error('[v0] /api/chat error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
