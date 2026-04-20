/**
 * Thin wrapper around the Hugging Face Inference Providers API (OpenAI-compatible).
 * Routes through Together AI using Qwen2.5-7B-Instruct-Turbo — confirmed working
 * on free-tier tokens with inference.serverless.write permission.
 *
 * URL format: https://router.huggingface.co/{provider}/v1/chat/completions
 * The model ID in the body must be the provider's alias, not the HF canonical ID.
 */

const HF_PROVIDER = 'together'
const HF_ROUTER_URL = `https://router.huggingface.co/${HF_PROVIDER}/v1/chat/completions`

// Together AI alias for Qwen/Qwen2.5-7B-Instruct (non-gated, confirmed live)
export const HF_TEXT_MODEL = 'Qwen/Qwen2.5-7B-Instruct-Turbo'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface HFChatOptions {
  model?: string
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

  const model = options.model ?? HF_TEXT_MODEL
  const res = await fetch(HF_ROUTER_URL, {
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
