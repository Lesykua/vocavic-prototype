/**
 * Factory Glossary — edit this file to match your actual equipment and vocabulary.
 * These terms are injected into the LLM system prompts so the model normalises
 * machine names, component names, and tags to your exact terminology.
 */

export const GLOSSARY = {
  /**
   * Known machines / production lines.
   * When the operator says anything close to one of these, use the canonical name.
   */
  machines: [
    'Moulding Machine 1',
    'Moulding Machine 2',
    'Moulding Machine 3',
    'Moulding Machine 4',
    'Conveyor Line A',
    'Conveyor Line B',
    'Extruder 1',
    'Extruder 2',
    'Injection Press 1',
    'Injection Press 2',
    'Packaging Line 1',
    'Packaging Line 2',
    'Cooling Tower',
    'Compressor Room',
    'Robot Arm 1',
    'Robot Arm 2',
  ],

  /**
   * Known components / parts.
   * Use these exact names in the "component" field.
   */
  components: [
    'hydraulic seal',
    'drive belt',
    'motor',
    'gearbox',
    'bearing',
    'cooling fan',
    'heating element',
    'temperature sensor',
    'pressure sensor',
    'solenoid valve',
    'control panel',
    'PLC',
    'nozzle',
    'hopper',
    'screw',
    'barrel',
    'mould',
    'clamping unit',
    'ejector pin',
    'pump',
  ],

  /**
   * Standard reason / problem vocabulary.
   * Prefer these short phrases for the "reason" field over free text.
   */
  reasons: [
    'overheating',
    'oil leak',
    'hydraulic pressure drop',
    'mechanical jam',
    'vibration',
    'unusual noise',
    'power fault',
    'sensor fault',
    'alarm triggered',
    'scheduled maintenance',
    'unplanned downtime',
    'quality defect',
    'dimensional out-of-spec',
    'material blockage',
    'cooling failure',
  ],

  /**
   * Standard action phrases for the "actionTaken" field.
   */
  actions: [
    'called maintenance',
    'replaced seal',
    'replaced belt',
    'replaced bearing',
    'cleared blockage',
    'reset alarm',
    'adjusted temperature setpoint',
    'adjusted pressure setpoint',
    'lubricated bearing',
    'tightened fasteners',
    'isolated machine',
    'restarted machine',
    'escalated to supervisor',
    'raised work order',
    'completed planned service',
  ],

  /**
   * Preferred tag vocabulary — short single-word or hyphenated slugs.
   * The model should prefer these over free-form tags.
   */
  tags: [
    'overheating',
    'oil-leak',
    'hydraulics',
    'mechanical',
    'electrical',
    'sensor',
    'maintenance',
    'downtime',
    'quality',
    'alarm',
    'cooling',
    'lubrication',
    'belt',
    'seal',
    'bearing',
    'motor',
    'conveyor',
    'moulding',
    'extrusion',
    'packaging',
  ],
}

/** Returns a compact text block ready to paste into a system prompt. */
export function glossaryPromptBlock(): string {
  return `
FACTORY GLOSSARY — use these canonical terms when they match what was described:

Machines: ${GLOSSARY.machines.join(', ')}
Components: ${GLOSSARY.components.join(', ')}
Reasons/Problems: ${GLOSSARY.reasons.join(', ')}
Actions: ${GLOSSARY.actions.join(', ')}
Preferred tags: ${GLOSSARY.tags.join(', ')}

If the operator's words clearly refer to one of the above terms, use that exact term. Do not invent new machine names — if the machine is unclear, leave the field null.`.trim()
}
