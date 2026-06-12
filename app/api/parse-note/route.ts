import { NextRequest, NextResponse } from 'next/server'
import { ShiftNoteStructured, ParseNoteRequest, ParseNoteResponse } from '@/lib/types'
import { enrichWithCompleteness } from '@/lib/completeness'
import { hfChat, parseJsonResponse } from '@/lib/hf-client'
import { glossaryPromptBlock } from '@/lib/glossary'

const SYSTEM_PROMPT = `You are an industrial shift note parser. Extract structured information from a spoken shift note transcript.

Return ONLY valid JSON with this exact shape (omit fields that are not mentioned — do NOT guess):
{
  "tags": string[],
  "reason": string | null,
  "machine": string | null,
  "component": string | null,
  "actionTaken": string | null,
  "lesson": string | null
}

Field descriptions:
- tags: 1–3 short keyword tags based on what is mentioned — prefer glossary tags, lowercase hyphenated
- reason: the problem or reason for the note — prefer glossary reason terms; null if not mentioned
- machine: machine or production line involved — use exact glossary machine name if it matches; null if not mentioned
- component: specific part involved — use exact glossary component name if it matches; null if not mentioned
- actionTaken: what was done — prefer glossary action phrases; null if not mentioned
- lesson: lesson or follow-up recommendation — null if not mentioned

Rules:
- Use null for fields not mentioned in the transcript
- Be concise — extract phrases from the transcript, do not elaborate or invent
- Match to glossary terms when the operator clearly refers to them; otherwise use their exact words
- Output ONLY the JSON object, no explanation, no markdown fences

${glossaryPromptBlock()}`

export async function POST(req: NextRequest) {
  let body: ParseNoteRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { transcript } = body
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  let extracted: ShiftNoteStructured

  if (!process.env.HF_API_TOKEN) {
    // No token configured — return empty fields so the user can fill them in manually
    extracted = { tags: [] }
  } else {
    try {
      const raw = await hfChat({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Transcript: "${transcript.trim()}"` },
        ],
        maxTokens: 256,
        temperature: 0.1,
      })

      const parsed = parseJsonResponse<Record<string, unknown>>(raw)

      extracted = {
        tags: Array.isArray(parsed.tags) ? (parsed.tags as string[]) : [],
        reason: typeof parsed.reason === 'string' ? parsed.reason : undefined,
        machine: typeof parsed.machine === 'string' ? parsed.machine : undefined,
        component: typeof parsed.component === 'string' ? parsed.component : undefined,
        actionTaken: typeof parsed.actionTaken === 'string' ? parsed.actionTaken : undefined,
        lesson: typeof parsed.lesson === 'string' ? parsed.lesson : undefined,
      }
    } catch (err) {
      return NextResponse.json({ error: 'Failed to parse note', detail: String(err) }, { status: 502 })
    }
  }

  const completeness = enrichWithCompleteness(extracted)

  const response: ParseNoteResponse = {
    transcript,
    structured: extracted,
    ...completeness,
  }

  return NextResponse.json(response)
}
