import { ShiftNoteStructured, FIELD_WEIGHTS, COMPLETENESS_THRESHOLD, ParsedNote } from './types'

/**
 * Calculates a completeness score (0–100) for a structured shift note.
 * Each field has a weight; present + non-empty fields contribute their weight.
 */
export function calculateCompleteness(structured: ShiftNoteStructured): {
  score: number
  isComplete: boolean
  missingFields: string[]
} {
  const missingFields: string[] = []
  let score = 0

  const checks: Array<{ key: keyof typeof FIELD_WEIGHTS; label: string; value: string | undefined }> = [
    { key: 'reason',      label: 'Reason for note',   value: structured.reason },
    { key: 'machine',     label: 'Machine / line',     value: structured.machine },
    { key: 'actionTaken', label: 'Action taken',       value: structured.actionTaken },
    { key: 'component',   label: 'Component involved', value: structured.component },
    { key: 'lesson',      label: 'Lesson learned',     value: structured.lesson },
  ]

  for (const { key, label, value } of checks) {
    if (value && value.trim().length > 0) {
      score += FIELD_WEIGHTS[key]
    } else {
      missingFields.push(label)
    }
  }

  return {
    score,
    isComplete: score >= COMPLETENESS_THRESHOLD,
    missingFields,
  }
}

/**
 * Derives completeness fields on a ParsedNote-shaped object.
 * Convenience wrapper used after Claude returns structured data.
 */
export function enrichWithCompleteness(structured: ShiftNoteStructured): Pick<ParsedNote, 'completenessScore' | 'isComplete' | 'missingFields'> {
  const { score, isComplete, missingFields } = calculateCompleteness(structured)
  return {
    completenessScore: score,
    isComplete,
    missingFields,
  }
}
