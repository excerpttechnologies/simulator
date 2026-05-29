/**
 * Per-step narration scripts.
 * Edit these to match the tone and detail level you want.
 */

export interface StepNarration {
  starting: string;     // played when wafer arrives at this step
  completed?: string;   // optional: played when step finishes (before next starts)
}

export const STEP_NARRATIONS: Record<string, StepNarration> = {
  foup: {
    starting: 'Wafer loaded from FOUP cassette.',
    completed: 'FOUP load complete.',
  },
  dehy: {
    starting: 'Dehydration bake initiated at 150 degrees celsius.',
    completed: 'Dehydration bake complete.',
  },
  hmds: {
    starting: 'HMDS vapor prime initiated. Improving photoresist adhesion.',
    completed: 'HMDS prime complete.',
  },
  chill1: {
    starting: 'Chill plate cooling wafer to 22 degrees.',
    completed: 'Wafer cooled.',
  },
  prcoat: {
    starting: 'Photoresist coating starting. Spinning at high RPM.',
    completed: 'Photoresist coating complete.',
  },
  pab: {
    starting: 'Post-apply bake at 118 degrees. Evaporating solvents.',
    completed: 'Post-apply bake complete.',
  },
  chill2: {
    starting: 'Second chill plate. Stabilizing temperature.',
    completed: 'Temperature stabilized.',
  },
  iface_in: {
    starting: 'Transferring to scanner interface.',
  },
  scanner: {
    starting: '193 nanometer exposure starting. Projecting circuit pattern.',
    completed: 'Exposure complete.',
  },
  iface_out: {
    starting: 'Returning from scanner.',
  },
  peb: {
    starting: 'Post-exposure bake at 120 degrees. Activating chemical amplification.',
    completed: 'Post-exposure bake complete.',
  },
  develop: {
    starting: 'Developer applying. Dissolving exposed photoresist.',
    completed: 'Develop complete.',
  },
  rinse: {
    starting: 'D I water rinse to remove developer residue.',
    completed: 'Rinse complete.',
  },
  spindry: {
    starting: 'Spin dry with nitrogen purge.',
    completed: 'Wafer dried.',
  },
  chill3: {
    starting: 'Final chill plate cooling.',
    completed: 'Final cool complete.',
  },
  hardbake: {
    starting: 'Hard bake at 130 degrees. Stabilizing the resist pattern.',
    completed: 'Hard bake complete. Wafer ready.',
  },
};

/** Get narration for a step, with fallback */
export function getStepNarration(stepId: string): StepNarration {
  return STEP_NARRATIONS[stepId] ?? {
    starting: `${stepId} step starting.`,
    completed: `${stepId} complete.`,
  };
}
