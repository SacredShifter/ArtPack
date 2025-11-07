export interface ConsciousnessMetrics {
  timestamp: number;
  sessionId: string;
  participantId: string;

  coherence: {
    personal: number;
    withGroup: number;
    withField: number;
    stability: number;
  };

  presence: {
    quality: number;
    depth: number;
    continuity: number;
    witnessing: number;
  };

  resonance: {
    harmonicAlignment: number;
    gaaSync: number;
    locationResonance: number;
    elementalBalance: number;
  };

  attention: {
    focus: number;
    dispersion: number;
    shiftRate: number;
    centeredness: number;
  };

  energetic: {
    amplitude: number;
    frequency: number;
    phase: number;
    waveform: string;
  };

  emotional: {
    valence: number;
    arousal: number;
    dominance: number;
    flow: number;
  };

  collective: {
    influence: number;
    receptivity: number;
    contribution: number;
    synergy: number;
  };

  dimensional: {
    depth: number;
    expansion: number;
    integration: number;
    transcendence: number;
  };
}

export interface CollectiveConsciousnessState {
  sessionId: string;
  timestamp: number;
  participantCount: number;

  coherenceField: {
    average: number;
    variance: number;
    peak: number;
    momentum: number;
  };

  resonanceField: {
    harmonicCenter: number;
    spread: number;
    stability: number;
    clarity: number;
  };

  energyField: {
    totalAmplitude: number;
    dominantFrequency: number;
    phaseAlignment: number;
    waveCoherence: number;
  };

  attentionField: {
    collectiveFocus: number;
    distributionPattern: string;
    centerOfMass: [number, number];
    radius: number;
  };

  emergentProperties: {
    synergyScore: number;
    fieldStability: number;
    evolutionRate: number;
    dimensionalExpansion: number;
  };

  astrologicalInfluence: {
    transitIntensity: number;
    aspectActivation: number;
    elementalBalance: {
      fire: number;
      earth: number;
      air: number;
      water: number;
    };
  };
}

export interface ConsciousnessEvent {
  id: string;
  sessionId: string;
  participantId?: string;
  timestamp: number;
  type: ConsciousnessEventType;
  intensity: number;
  metadata: Record<string, any>;
}

export enum ConsciousnessEventType {
  BREAKTHROUGH = 'breakthrough',
  COHERENCE_SPIKE = 'coherence_spike',
  RESONANCE_LOCK = 'resonance_lock',
  COLLECTIVE_SHIFT = 'collective_shift',
  DIMENSIONAL_EXPANSION = 'dimensional_expansion',
  SYNERGY_EMERGENCE = 'synergy_emergence',
  PHASE_TRANSITION = 'phase_transition',
  FIELD_STABILIZATION = 'field_stabilization',
  PARTICIPANT_JOIN = 'participant_join',
  PARTICIPANT_LEAVE = 'participant_leave',
  INTENTION_SET = 'intention_set',
  SILENCE_DEEPENING = 'silence_deepening'
}

export interface TelemetrySnapshot {
  sessionId: string;
  timestamp: number;
  metrics: ConsciousnessMetrics[];
  collectiveState: CollectiveConsciousnessState;
  events: ConsciousnessEvent[];
  imageUrl?: string;
}

export interface ConsciousnessPattern {
  id: string;
  name: string;
  description: string;
  signature: number[];
  confidence: number;
  occurrences: number;
  lastSeen: number;
}

export interface TelemetryAnalytics {
  sessionId: string;
  duration: number;
  totalSamples: number;

  averageMetrics: ConsciousnessMetrics;
  peakMetrics: ConsciousnessMetrics;

  patterns: ConsciousnessPattern[];
  insights: string[];

  timeline: {
    coherenceEvolution: number[];
    resonanceEvolution: number[];
    energyEvolution: number[];
  };

  participantCorrelations: Map<string, {
    synergyWith: string[];
    influenceOn: string[];
    resonanceWith: string[];
  }>;
}
