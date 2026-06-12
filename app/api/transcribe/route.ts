import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // Vercel: allow up to 60s for model cold-start

const HF_MODEL = 'openai/whisper-large-v3-turbo'
// Use the HF Inference router (hf-inference provider) — works with free-tier tokens
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`

export async function POST(req: NextRequest) {
  const hfToken = process.env.HF_API_TOKEN
  if (!hfToken) {
    return NextResponse.json({ error: 'HF_API_TOKEN not configured' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const audioFile = formData.get('audio')
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json({ error: 'Missing audio field' }, { status: 400 })
  }

  const audioBuffer = await audioFile.arrayBuffer()

  let hfResponse: Response
  try {
    hfResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': audioFile.type || 'audio/webm',
      },
      body: audioBuffer,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reach HF API', detail: String(err) }, { status: 502 })
  }

  if (!hfResponse.ok) {
    const body = await hfResponse.text()
    // Hugging Face returns 503 while the model is loading
    if (hfResponse.status === 503) {
      return NextResponse.json(
        { error: 'Model is loading, please retry in a few seconds', loading: true },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'HF API error', detail: body }, { status: hfResponse.status })
  }

  const result = await hfResponse.json() as { text?: string }
  const transcript = result.text?.trim() ?? ''

  return NextResponse.json({ transcript })
}
