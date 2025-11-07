export interface UnseenState {
  phaseError: {
    natal: number;
    transit: number;
    gaa: number;
  };
  residualMag: number;
  uncertainty: number;
  silenceSec: number;
  entrain: {
    locked: boolean;
    deltaPct: number;
  };
  collective: {
    potential: number;
    q: number;
    syncBPM: number;
  };
}

export interface LatentObservation {
  sessionId: string;
  userId: string;
  timestamp: number;
  phaseErrorNatal: number;
  phaseErrorTransit: number;
  phaseErrorGAA: number;
  residualMagnitude: number;
  uncertaintyScore: number;
  silenceSeconds: number;
  entrainmentLock: boolean;
  entrainmentDeltaPct: number;
  collectivePotentialScore: number;
}

export interface CollectiveMetrics {
  sessionId: string;
  timestamp: number;
  elementRatio: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  graphModularityQ: number;
  synchronyBurstsPerMin: number;
  dominantPhase: string;
  elementEntropy: number;
  avgResidual: number;
  avgUncertainty: number;
  collectiveCoherence: number;
  evolutionRate: number;
}

export interface EvoInputs {
  Coh: number;
  Cx: number;
  Pol: number;
  U: number;
  Syn: number;
  Res: number;
}

export interface EvoParams {
  m: number;
  n1: number;
  n2: number;
  n3: number;
  lift: number;
  merkaba: boolean;
  vesicaStrength: number;
  starMix: number;
  hazeIntensity: number;
}

export type FormType = 'circle' | 'polygon' | 'flower' | 'star' | 'platonic' | 'merkaba';

export interface EvolutionState {
  sessionId: string;
  userId?: string;
  timestamp: number;
  params: EvoParams;
  formType: FormType;
  transitionProgress: number;
}

export interface PhaseTransition {
  sessionId: string;
  userId?: string;
  timestamp: number;
  fromForm: FormType;
  toForm: FormType;
  triggerMetric: string;
  thresholdValue: number;
  holdDurationSec: number;
}

export interface PredictedState {
  expectedAmplitude: number;
  expectedCoherence: number;
  expectedPhase: number;
  expectedTempo: number;
}

export interface ObservedState {
  actualAmplitude: number;
  actualCoherence: number;
  actualPhase: number;
  actualTempo: number;
  interactionRate: number;
  focusStability: number;
}
