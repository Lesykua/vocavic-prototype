/**
 * Parquet Factory Glossary — edit this file to match your actual equipment and vocabulary.
 * These terms are injected into the LLM system prompts so the model normalises
 * machine names, component names, and tags to your exact terminology.
 */

export const GLOSSARY = {
  /**
   * Known machines / production lines.
   * When the operator says anything close to one of these, use the canonical name.
   */
  machines: [
    'Hot Press 1',
    'Hot Press 2',
    'Cold Press 1',
    'Cold Press 2',
    'Wide Belt Sander',
    'Glue Spreader 1',
    'Glue Spreader 2',
    'Cross-Cut Saw',
    'Rip Saw',
    'Tongue & Groove Line',
    'UV Coating Line',
    'Moisture Conditioning Chamber',
    'Sorting & Grading Station',
    'Packaging Line',
    'Dehumidification Unit',
    'Veneer Lathe',
  ],

  /**
   * Known components / parts.
   * Use these exact names in the "component" field.
   */
  components: [
    'press platen',
    'heating element',
    'hydraulic cylinder',
    'temperature sensor',
    'moisture sensor',
    'sanding belt',
    'feed roller',
    'glue roller',
    'doctor blade',
    'UV lamp',
    'conveyor belt',
    'pressure gauge',
    'vacuum pump',
    'alignment guide',
    'saw blade',
    'thickness gauge',
    'oil filter',
    'clamping unit',
    'infeed guide',
    'PLC',
  ],

  /**
   * Standard reason / problem vocabulary.
   * Prefer these short phrases for the "reason" field over free text.
   */
  reasons: [
    'press temperature drift',
    'delamination',
    'moisture deviation',
    'thickness out-of-spec',
    'surface scratch',
    'glue starvation',
    'glue spread variation',
    'sanding belt wear',
    'saw blade chatter',
    'UV cure failure',
    'board bow',
    'board warp',
    'veneer split',
    'hydraulic pressure drop',
    'alignment drift',
    'board jam',
    'coating thickness deviation',
    'sensor fouling',
    'coating drip',
    'unplanned downtime',
    'quality defect',
    'scheduled maintenance',
  ],

  /**
   * Standard action phrases for the "actionTaken" field.
   */
  actions: [
    'raised platen setpoint',
    'adjusted glue roller',
    'adjusted glue spread rate',
    'replaced sanding belt',
    'replaced saw blade',
    'adjusted doctor blade',
    'reset press temperature',
    'recalibrated moisture sensor',
    'cleaned UV lamp',
    'adjusted platen pressure',
    'lubricated feed roller',
    'cleared board jam',
    're-centered alignment guide',
    'isolated batch for QC inspection',
    'raised work order',
    'called maintenance',
    'isolated machine',
    'restarted machine',
    'escalated to supervisor',
    'completed planned service',
    'cleaned sensor',
    'adjusted feed speed',
  ],

  /**
   * Preferred tag vocabulary — short single-word or hyphenated slugs.
   * The model should prefer these over free-form tags.
   */
  tags: [
    'delamination',
    'moisture',
    'thickness',
    'glue',
    'pressing',
    'sanding',
    'coating',
    'uv-cure',
    'saw',
    'jam',
    'veneer',
    'warp',
    'alignment',
    'hydraulic',
    'surface',
    'quality',
    'maintenance',
    'downtime',
    'safety',
    'overheating',
    'sensor',
    'electrical',
    'mechanical',
  ],
}

/** Returns a compact text block ready to paste into a system prompt. */
export function glossaryPromptBlock(): string {
  return `
PARQUET FACTORY GLOSSARY — use these canonical terms when they match what was described:

Machines: ${GLOSSARY.machines.join(', ')}
Components: ${GLOSSARY.components.join(', ')}
Reasons/Problems: ${GLOSSARY.reasons.join(', ')}
Actions: ${GLOSSARY.actions.join(', ')}
Preferred tags: ${GLOSSARY.tags.join(', ')}

If the operator's words clearly refer to one of the above terms, use that exact term. Do not invent new machine names — if the machine is unclear, leave the field null.`.trim()
}
