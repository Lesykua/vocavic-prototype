'use client'

import { useVoiceCapture } from '@/hooks/useVoiceCapture'

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface VoiceCaptureProps {
  onTranscript: (transcript: string) => void
}

export function VoiceCapture({ onTranscript }: VoiceCaptureProps) {
  const { state, transcript, error, durationMs, startRecording, stopRecording, reset } = useVoiceCapture()

  const handleStop = () => {
    stopRecording()
  }

  const handleConfirm = () => {
    if (transcript) onTranscript(transcript)
  }

  const handleRetry = () => {
    reset()
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">

      {/* Status label */}
      <p className="text-sm font-medium tracking-wide uppercase" style={{ color: '#687d85' }}>
        {state === 'idle' && 'Ready to capture'}
        {state === 'recording' && 'Recording…'}
        {state === 'processing' && 'Transcribing with Whisper…'}
        {state === 'done' && 'Transcription complete'}
        {state === 'error' && 'Something went wrong'}
      </p>

      {/* Main record button */}
      {(state === 'idle' || state === 'error') && (
        <button
          onClick={startRecording}
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: '#0f5f68' }}
          aria-label="Start recording"
        >
          <MicIcon className="w-10 h-10 text-white" />
        </button>
      )}

      {state === 'recording' && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStop}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl animate-pulse"
            style={{ background: '#d65848' }}
            aria-label="Stop recording"
          >
            <StopIcon className="w-10 h-10 text-white" />
          </button>
          <span className="text-2xl font-mono font-semibold" style={{ color: '#12232c' }}>
            {formatDuration(durationMs)}
          </span>
        </div>
      )}

      {state === 'processing' && (
        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#0f5f68', borderTopColor: 'transparent' }} />
      )}

      {/* Transcript preview */}
      {state === 'done' && transcript !== null && (
        <div className="w-full max-w-xl flex flex-col gap-4">
          <div
            className="rounded-2xl p-5 text-base leading-relaxed shadow-sm"
            style={{ background: '#f2ebe0', color: '#12232c' }}
          >
            {transcript.length > 0
              ? `"${transcript}"`
              : <span className="italic" style={{ color: '#687d85' }}>No speech detected. Please try again.</span>
            }
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!transcript}
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#0f5f68' }}
            >
              Continue →
            </button>
            <button
              onClick={handleRetry}
              className="px-5 py-3 rounded-xl font-semibold border transition-colors"
              style={{ borderColor: '#0f5f68', color: '#0f5f68' }}
            >
              Re-record
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && error && (
        <p className="text-sm max-w-sm text-center" style={{ color: '#d65848' }}>{error}</p>
      )}
    </div>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}
