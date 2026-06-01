/**
 * Demo seed notes — pre-populate the shift log for live demos.
 * Timestamps are calculated relative to "now" so the notes always
 * appear to be from the current shift regardless of when the demo runs.
 *
 * Note at index 4 (Moulding Machine 3 / overheating, ~2.5h ago) is
 * intentionally on the same machine + reason as the demo script so
 * the "related note" banner fires automatically.
 */

import { ShiftNote } from './types'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

export function buildSeedNotes(deviceId: string): ShiftNote[] {
  return [
    // ── 1. Moulding Machine 1 — hydraulic seal ─────────────────────────────
    {
      id: 'seed-001',
      timestamp: hoursAgo(7.1),
      createdAt: hoursAgo(7.1),
      deviceId,
      transcript:
        'Moulding Machine 1 went down at the start of shift. Hydraulic pressure dropped — found a leaking hydraulic seal on the clamping unit. Replaced the seal and restarted the machine. Everything looks normal now. We should check the seals on the other moulding machines as well.',
      structured: {
        tags: ['hydraulics', 'seal', 'moulding'],
        reason: 'hydraulic pressure drop',
        machine: 'Moulding Machine 1',
        component: 'hydraulic seal',
        actionTaken: 'replaced seal, restarted machine',
        lesson: 'check hydraulic seals on all moulding machines at shift start',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 2. Conveyor Line A — drive belt ────────────────────────────────────
    {
      id: 'seed-002',
      timestamp: hoursAgo(6.0),
      createdAt: hoursAgo(6.0),
      deviceId,
      transcript:
        'Conveyor Line A stopped about halfway through the first hour. Mechanical jam — the drive belt had slipped off the pulley. Cleared the blockage and replaced the belt. Line is running again.',
      structured: {
        tags: ['mechanical', 'belt', 'conveyor', 'downtime'],
        reason: 'mechanical jam',
        machine: 'Conveyor Line A',
        component: 'drive belt',
        actionTaken: 'cleared blockage, replaced belt',
      },
      completenessScore: 90,
      isComplete: true,
    },

    // ── 3. Moulding Machine 2 — gearbox noise ──────────────────────────────
    {
      id: 'seed-003',
      timestamp: hoursAgo(5.0),
      createdAt: hoursAgo(5.0),
      deviceId,
      transcript:
        'Moulding Machine 2 making an unusual noise from the gearbox area. Not bad enough to stop production but I logged it. Lubricated the bearing and raised a work order for maintenance to inspect it properly during the next planned stop.',
      structured: {
        tags: ['mechanical', 'bearing', 'moulding', 'lubrication'],
        reason: 'unusual noise',
        machine: 'Moulding Machine 2',
        component: 'gearbox',
        actionTaken: 'lubricated bearing, raised work order',
        lesson: 'schedule full gearbox inspection at next planned stop',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 4. Extruder 1 — hopper blockage ────────────────────────────────────
    {
      id: 'seed-004',
      timestamp: hoursAgo(3.8),
      createdAt: hoursAgo(3.8),
      deviceId,
      transcript:
        'Material blockage in Extruder 1 hopper. Production stopped for about 15 minutes. Cleared the blockage manually and restarted. Material flow looks normal now. Might be related to the batch we got this morning — material seems drier than usual.',
      structured: {
        tags: ['extrusion', 'downtime', 'mechanical'],
        reason: 'material blockage',
        machine: 'Extruder 1',
        component: 'hopper',
        actionTaken: 'cleared blockage, restarted machine',
        lesson: 'check incoming material moisture content before loading hopper',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 5. Moulding Machine 3 — early overheating warning ──────────────────
    // ⚠️  Same machine + reason as the demo script → triggers "related note" banner
    {
      id: 'seed-005',
      timestamp: hoursAgo(2.5),
      createdAt: hoursAgo(2.5),
      deviceId,
      transcript:
        'Temperature on Moulding Machine 3 running about 15 degrees above setpoint. Not alarming yet but keeping an eye on it. Adjusted the temperature setpoint slightly. The cooling fan might need a look — airflow feels reduced when I stand next to it.',
      structured: {
        tags: ['overheating', 'cooling', 'moulding', 'sensor'],
        reason: 'overheating',
        machine: 'Moulding Machine 3',
        component: 'temperature sensor',
        actionTaken: 'adjusted temperature setpoint',
      },
      completenessScore: 80,
      isComplete: true,
    },

    // ── 6. Packaging Line 1 — quality defect ───────────────────────────────
    {
      id: 'seed-006',
      timestamp: hoursAgo(2.0),
      createdAt: hoursAgo(2.0),
      deviceId,
      transcript:
        'Packaging Line 1 producing parts slightly out of spec. Dimensional issue — parts coming out about 0.3mm too wide. Isolated the line and called maintenance. I think it is a mould alignment issue.',
      structured: {
        tags: ['quality', 'moulding', 'packaging', 'downtime'],
        reason: 'dimensional out-of-spec',
        machine: 'Packaging Line 1',
        component: 'mould',
        actionTaken: 'isolated machine, called maintenance',
        lesson: 'verify mould alignment after every tool change',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 7. Robot Arm 1 — PLC sensor fault ──────────────────────────────────
    {
      id: 'seed-007',
      timestamp: hoursAgo(1.2),
      createdAt: hoursAgo(1.2),
      deviceId,
      transcript:
        'Robot Arm 1 threw a sensor fault on the PLC. Line stopped automatically. Reset the alarm and ran a full cycle test — arm is operating normally. Escalated to supervisor anyway since this is the third time this week.',
      structured: {
        tags: ['sensor', 'alarm', 'electrical', 'maintenance'],
        reason: 'sensor fault',
        machine: 'Robot Arm 1',
        component: 'PLC',
        actionTaken: 'reset alarm, escalated to supervisor',
        lesson: 'recurring PLC fault — needs permanent fix, not just reset',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 8. Cooling Tower — pump fault ──────────────────────────────────────
    {
      id: 'seed-008',
      timestamp: hoursAgo(0.5),
      createdAt: hoursAgo(0.5),
      deviceId,
      transcript:
        'Cooling tower pump showing a fault. Pressure dropping in the cooling loop across the whole line. Called maintenance — they isolated the pump and switched to the backup. Cooling restored. Original pump needs a service.',
      structured: {
        tags: ['cooling', 'downtime', 'maintenance'],
        reason: 'cooling failure',
        machine: 'Cooling Tower',
        component: 'pump',
        actionTaken: 'called maintenance, isolated machine',
        lesson: 'test backup pump monthly to confirm it is ready',
      },
      completenessScore: 100,
      isComplete: true,
    },
  ]
}
