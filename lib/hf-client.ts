/**
 * Thin wrapper around the Hugging Face Inference Providers API (OpenAI-compatible).
 *
 * URL format: https://router.huggingface.co/{provider}/v1/chat/completions
 * The model ID in the body must be the provider's alias, not the HF canonical ID.
 *
 * Confirmed working providers:
 *   together      — Qwen/Qwen2.5-7B-Instruct-Turbo  (field extraction)
 *   featherless-ai — google/gemma-3-12b-it           (shift summary)
 */

// Default provider + model for field extraction
export const HF_DEFAULT_PROVIDER = 'together'
export const HF_TEXT_MODEL = 'Qwen/Qwen2.5-7B-Instruct-Turbo'

// Gemma 3 12B for shift summaries — more natural prose, low hallucination
export const HF_SUMMARY_PROVIDER = 'featherless-ai'
export const HF_SUMMARY_MODEL = 'google/gemma-3-12b-it'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface HFChatOptions {
  model?: string
  provider?: string   // overrides default provider
  messages: Message[]
  maxTokens?: number
  temperature?: number
}

interface HFChatResponse {
  choices: Array<{
    message: { content: string }
  }>
}

export async function hfChat(options: HFChatOptions): Promise<string> {
  const token = process.env.HF_API_TOKEN
  if (!token) throw new Error('HF_API_TOKEN not configured')

  const provider = options.provider ?? HF_DEFAULT_PROVIDER
  const routerUrl = `https://router.huggingface.co/${provider}/v1/chat/completions`
  const model = options.model ?? HF_TEXT_MODEL

  const res = await fetch(routerUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 512,
      temperature: options.temperature ?? 0.2,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HF chat API error ${res.status}: ${body}`)
  }

  const data = (await res.json()) as HFChatResponse
  return data.choices[0]?.message?.content?.trim() ?? ''
}

/** Strip markdown code fences and parse JSON from an LLM response. */
export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  return JSON.parse(cleaned) as T
}
