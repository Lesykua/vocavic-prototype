// Core data model for a shift voice note

export interface ShiftNoteStructured {
  tags: string[]
  reason?: string          // e.g. "overheating", "seal failure"
  machine?: string         // e.g. "moulding machine 3", "line 2"
  component?: string       // e.g. "seal", "motor", "conveyor belt"
  actionTaken?: string     // e.g. "called maintenance", "changed seal"
  lesson?: string          // e.g. "check seals every 2 weeks"
}

export interface ShiftNote {
  id: string
  timestamp: string        // ISO 8601
  deviceId: string
  transcript: string
  structured: ShiftNoteStructured
  completenessScore: number  // 0–100
  isComplete: boolean        // true if score >= COMPLETENESS_THRESHOLD
  createdAt: string
}

// Completeness scoring weights per field (must sum to 100)
export const FIELD_WEIGHTS = {
  reason: 30,
  machine: 25,
  actionTaken: 25,
  component: 10,
  lesson: 10,
} as const

export const COMPLETENESS_THRESHOLD = 60

// What the parse-note API returns before we attach id/deviceId/timestamps
export interface ParsedNote {
  structured: ShiftNoteStructured
  completenessScore: number
  isComplete: boolean
  missingFields: string[]
}

// API request/response shapes
export interface TranscribeRequest {
  // FormData with key "audio" (Blob/File)
}

export interface TranscribeResponse {
  transcript: string
}

export interface ParseNoteRequest {
  transcript: string
}

export interface ParseNoteResponse extends ParsedNote {
  transcript: string
}
