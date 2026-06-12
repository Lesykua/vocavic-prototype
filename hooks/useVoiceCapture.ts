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

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export function useVoiceCapture(): UseVoiceCaptureReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const startTimeRef = useRef<number>(0)
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finalRef = useRef<string>('')
  const interimRef = useRef<string>('')

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscript(null)
    setDurationMs(0)
    finalRef.current = ''
    interimRef.current = ''

    const SR = (typeof window !== 'undefined')
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
      : null

    if (!SR) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      setState('error')
      return
    }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let accumulated = finalRef.current
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          accumulated += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      finalRef.current = accumulated
      interimRef.current = interim
      setTranscript((accumulated + interim).trim() || null)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      stopDurationTimer()
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.')
        setState('error')
      } else if (event.error === 'no-speech') {
        // non-fatal: keep going
      } else {
        setError(`Speech recognition error: ${event.error}`)
        setState('error')
      }
    }

    recognition.onend = () => {
      stopDurationTimer()
      setDurationMs(Date.now() - startTimeRef.current)
      const full = (finalRef.current + interimRef.current).trim()
      setTranscript(full || null)
      setState('done')
    }

    try {
      recognition.start()
    } catch {
      setError('Could not start speech recognition. Please try again.')
      setState('error')
      return
    }

    startTimeRef.current = Date.now()
    setState('recording')

    durationTimerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current)
    }, 200)
  }, [stopDurationTimer])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stopDurationTimer()
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }
    setState('idle')
    setTranscript(null)
    setError(null)
    setDurationMs(0)
    finalRef.current = ''
    interimRef.current = ''
  }, [stopDurationTimer])

  return { state, transcript, error, durationMs, startRecording, stopRecording, reset }
}
