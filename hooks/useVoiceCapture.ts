'use client'

import { useState, useRef, useCallback } from 'react'

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export interface UseVoiceCaptureReturn {
  state: RecordingState
  transcript: string | null
  error: string | null
  durationMs: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
}

export function useVoiceCapture(): UseVoiceCaptureReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
  }, [])

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setState('processing')

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    // Retry up to 3 times to handle model-loading 503s
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      const data = await res.json() as { transcript?: string; error?: string; loading?: boolean }

      if (res.status === 503 && data.loading) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 5000))
          continue
        }
        setError('Whisper model is still loading. Please try again in a moment.')
        setState('error')
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Transcription failed')
        setState('error')
        return
      }

      setTranscript(data.transcript ?? '')
      setState('done')
      return
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscript(null)
    setDurationMs(0)
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.')
      setState('error')
      return
    }

    // Prefer webm/opus; fall back to whatever the browser supports
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : ''

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      stopDurationTimer()
      setDurationMs(Date.now() - startTimeRef.current)

      const audioBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
      await transcribeAudio(audioBlob)
    }

    recorder.start(250) // collect data every 250ms
    startTimeRef.current = Date.now()
    setState('recording')

    durationTimerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current)
    }, 200)
  }, [stopDurationTimer, transcribeAudio])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const reset = useCallback(() => {
    stopDurationTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setState('idle')
    setTranscript(null)
    setError(null)
    setDurationMs(0)
    chunksRef.current = []
  }, [stopDurationTimer])

  return { state, transcript, error, durationMs, startRecording, stopRecording, reset }
}
