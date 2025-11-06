export interface GESemanticEvent {
  type: string;
  timestamp: number;
  sourceModule: string;
  labels: string[];
  payload: any;
  correlationId?: string;
  resonanceSignature?: number;
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  essenceLabels: string[];
  capabilities: string[];
  telosAlignment: string[];
  dependencies: string[];
  resourceFootprintMB: number;
  integrityScore: number;
}

export interface IModule {
  readonly manifest: ModuleManifest;
  initialize(geh: GlobalEventHorizon): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  destroy(): Promise<void>;
  getExposedItems(): Record<string, any>;
}

export interface GlobalEventHorizon {
  publish(event: GESemanticEvent): void;
  subscribe(eventType: string, handler: (event: GESemanticEvent) => void | Promise<void>): string;
  unsubscribe(subscriptionId: string): void;
  queryHistory(filters: EventQueryFilter): GESemanticEvent[];
  getResonanceField(): ResonanceField;
}

export interface EventQueryFilter {
  types?: string[];
  labels?: string[];
  sourceModules?: string[];
  timeRange?: { start: number; end: number };
  limit?: number;
}

export interface ResonanceField {
  globalCoherence: number;
  activeModules: string[];
  eventDensity: number;
  dominantLabels: string[];
}

export interface CoherenceSample {
  timestamp: number;
  amplitude: number;
  phase: number;
  frequency: number;
  source?: string;
  userId?: string;
}

export interface RegionSeed {
  lat: number;
  lon: number;
  entropy: number;
  harmonics: number[];
}

export interface SafetyCaps {
  maxStrobeHz: number;
  maxBrightness: number;
  maxSaturation: number;
  lowSensoryMode: boolean;
}

export interface BiometricStream {
  userId: string;
  timestamp: number;
  heartRate?: number;
  hrv?: number;
  breathRate?: number;
  skinConductance?: number;
  eegBands?: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
}

export interface ResonanceMoment {
  id: string;
  userId: string;
  timestamp: number;
  coherenceScore: number;
  screenshot?: string;
  artPackId: string;
  biometricSnapshot: BiometricStream;
  emotionalTag?: string;
  notes?: string;
}

export interface Journey {
  id: string;
  userId: string;
  intention: string;
  telos: string[];
  packs: string[];
  currentIndex: number;
  durations: number[];
  startTime: number;
  peakMoments: string[];
  adaptations: JourneyAdaptation[];
}

export interface JourneyAdaptation {
  timestamp: number;
  reason: string;
  action: string;
  coherenceTrigger: number;
}

export interface QuantumPair {
  userId1: string;
  userId2: string;
  sessionId: string;
  startTime: number;
  syncMode: 'complementary' | 'mirrored' | 'harmonic';
  coherenceCorrelation: number;
}
