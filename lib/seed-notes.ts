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
    // ── 1. Injection Press 2 — motor burned out, 90 min downtime ───────────
    {
      id: 'seed-001',
      timestamp: hoursAgo(7.2),
      createdAt: hoursAgo(7.2),
      deviceId,
      transcript:
        'Injection Press 2 went down hard at shift start. Motor burned out — smell of burning from the control panel, automatic shutdown triggered. Called emergency maintenance. Machine was down for 90 minutes. Maintenance replaced the motor. We lost the first production run completely. This is the second motor failure on this press in three months.',
      structured: {
        tags: ['electrical', 'motor', 'downtime', 'alarm'],
        reason: 'power fault',
        machine: 'Injection Press 2',
        component: 'motor',
        actionTaken: 'called maintenance, replaced motor, restarted machine',
        lesson: 'Injection Press 2 motor is failing repeatedly — escalate for full electrical inspection before next shift',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 2. Safety near-miss — hydraulic fluid leak near walkway ────────────
    {
      id: 'seed-002',
      timestamp: hoursAgo(6.1),
      createdAt: hoursAgo(6.1),
      deviceId,
      transcript:
        'Near-miss on the moulding floor. Hydraulic fluid leak from Moulding Machine 4 pooling on the main walkway near the emergency exit. Operator almost slipped. Isolated the machine immediately, put down absorbent mats, filed a safety report. Maintenance patched the line but the root cause is a worn hydraulic seal. Machine back in service but needs proper seal replacement on next planned stop.',
      structured: {
        tags: ['hydraulics', 'oil-leak', 'seal', 'moulding'],
        reason: 'oil leak',
        machine: 'Moulding Machine 4',
        component: 'hydraulic seal',
        actionTaken: 'isolated machine, filed safety report, patched hydraulic line',
        lesson: 'replace hydraulic seal on MM4 at next planned stop — do not wait',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 3. Packaging Line 2 — full batch rejected, wrong label run ──────────
    {
      id: 'seed-003',
      timestamp: hoursAgo(5.0),
      createdAt: hoursAgo(5.0),
      deviceId,
      transcript:
        'Major quality event on Packaging Line 2. Entire two-hour run — approximately 4,000 units — labeled with wrong product code. QC caught it during routine check. Full batch quarantined and flagged for rework. Root cause: label reel from previous shift was left loaded and not checked at changeover. Supervisor notified. Production plan for the rest of shift needs to be revised.',
      structured: {
        tags: ['quality', 'packaging', 'downtime'],
        reason: 'quality defect',
        machine: 'Packaging Line 2',
        component: 'control panel',
        actionTaken: 'isolated machine, quarantined batch, escalated to supervisor',
        lesson: 'mandatory label verification check required at every changeover — add to shift start checklist',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 4. Extruder 2 — screw wear causing dimensional drift ────────────────
    {
      id: 'seed-004',
      timestamp: hoursAgo(3.5),
      createdAt: hoursAgo(3.5),
      deviceId,
      transcript:
        'Extruder 2 producing product with gradual dimensional drift — wall thickness creeping up by 0.4mm over two hours. QC flagged it. Suspect screw wear — this machine is overdue for a screw inspection by about 600 hours. Adjusted process parameters to compensate for now but this is a temporary fix. Raised work order for screw inspection. Batches since 10am have been held pending QC review.',
      structured: {
        tags: ['quality', 'extrusion', 'maintenance', 'downtime'],
        reason: 'dimensional out-of-spec',
        machine: 'Extruder 2',
        component: 'screw',
        actionTaken: 'adjusted pressure setpoint, raised work order, held batch for QC review',
        lesson: 'screw wear inspection overdue by 600h — schedule immediately, do not let it reach failure',
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
        'Temperature on Moulding Machine 3 running about 15 degrees above setpoint. Not alarming yet but I am keeping an eye on it. Adjusted the temperature setpoint slightly. The cooling fan might need a look — airflow feels reduced when I stand next to it. Third time this week the temperature has crept up on this machine.',
      structured: {
        tags: ['overheating', 'cooling', 'moulding', 'sensor'],
        reason: 'overheating',
        machine: 'Moulding Machine 3',
        component: 'temperature sensor',
        actionTaken: 'adjusted temperature setpoint',
        lesson: 'recurring overheating on MM3 — cooling system needs proper inspection, not just setpoint adjustment',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 6. Robot Arm 1 — fourth collision fault this week ───────────────────
    {
      id: 'seed-006',
      timestamp: hoursAgo(1.8),
      createdAt: hoursAgo(1.8),
      deviceId,
      transcript:
        'Robot Arm 1 collision fault again. Fourth time this week. Line stopped for 20 minutes each time. Reset the alarm and did a manual path check — arm is running but the root cause has not been found. Maintenance says the sensor is fine. I think it is a calibration drift issue or something in the PLC program. Escalated to engineering. This is costing us roughly 80 minutes of production per week.',
      structured: {
        tags: ['sensor', 'alarm', 'electrical', 'downtime'],
        reason: 'sensor fault',
        machine: 'Robot Arm 1',
        component: 'PLC',
        actionTaken: 'reset alarm, escalated to engineering',
        lesson: 'fourth fault this week — reset is not a fix. Engineering must investigate PLC calibration before next shift',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 7. Compressor Room — pressure drop affecting entire cooling loop ─────
    {
      id: 'seed-007',
      timestamp: hoursAgo(1.0),
      createdAt: hoursAgo(1.0),
      deviceId,
      transcript:
        'Compressor room pressure dropped sharply — cooling pressure fell below minimum threshold across the whole moulding floor. All four moulding machines automatically reduced cycle speed. Lost about 25% throughput for 40 minutes while maintenance diagnosed it. Turned out a solenoid valve had stuck closed. Maintenance forced it open manually and pressure restored. Valve needs replacing — it has been sticking intermittently for two weeks.',
      structured: {
        tags: ['cooling', 'hydraulics', 'moulding', 'downtime', 'alarm'],
        reason: 'hydraulic pressure drop',
        machine: 'Compressor Room',
        component: 'solenoid valve',
        actionTaken: 'called maintenance, manually opened valve, restored pressure',
        lesson: 'sticking solenoid valve flagged two weeks ago — it caused a floor-wide slowdown today. Replace immediately',
      },
      completenessScore: 100,
      isComplete: true,
    },

    // ── 8. Conveyor Line B — bearing failure, line down ─────────────────────
    {
      id: 'seed-008',
      timestamp: hoursAgo(0.4),
      createdAt: hoursAgo(0.4),
      deviceId,
      transcript:
        'Conveyor Line B bearing failure. Loud grinding noise then a full stop. Maintenance confirmed the main drive bearing has seized. Replacement part not in stock — maintenance had to pull one from the spares on Conveyor Line A which takes Line A offline too. Both conveyors down. Expected back up in 45 minutes. Production supervisor is aware. Parts department notified to reorder bearing stock.',
      structured: {
        tags: ['mechanical', 'bearing', 'conveyor', 'downtime'],
        reason: 'mechanical jam',
        machine: 'Conveyor Line B',
        component: 'bearing',
        actionTaken: 'called maintenance, sourced spare from Line A, restarted machine',
        lesson: 'bearing stock critically low — single failure took down two lines. Reorder minimum 4 units immediately',
      },
      completenessScore: 100,
      isComplete: true,
    },
  ]
}
