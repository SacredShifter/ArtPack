import * as THREE from 'three';

export interface RegionSeed {
  region_name: string;
  lat: number;
  lng: number;
  cultural_essence?: string;
  timestamp: number;
}

export interface CoherenceSample {
  individual: number;
  collective: number;
  stillness: number;
  timestamp: number;
}

export interface GAAState {
  phase: number;
  lfo: number;
  baseFreq: number;
  harmonics: number[];
  musicalTime: number;
}

export interface SonicEnvelope {
  amplitude: number;
  hueShift: number;
  breathRate: number;
  tension: number;
}

export interface SafetyCaps {
  maxStrobeHz: number;
  maxBrightness: number;
  maxSaturation: number;
  lowSensoryMode: boolean;
  photosensitiveWarning?: boolean;
}

export interface PackManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  esm_url: string;
  entry?: string;
  minEngine?: string;
  safety?: Partial<SafetyCaps>;
  essenceLabels?: string[];
  telosAlignment?: string[];
}

export interface EngineAPI {
  registerMaterial(name: string, material: THREE.Material): void;
  registerNode(name: string, factory: () => THREE.Object3D): void;
  setParamMapper(fn: (seed: RegionSeed, coherence: CoherenceSample, gaa: GAAState, envelope: SonicEnvelope) => Record<string, any>): void;
  onFrame(fn: (deltaTime: number, params: Record<string, any>) => void): void;
  defineSafetyCaps(caps: Partial<SafetyCaps>): void;
  getThree(): typeof THREE;
}

export interface PackModule {
  register(engine: EngineAPI): void;
  cleanup?(): void;
}

export interface LoadedPack {
  manifest: PackManifest;
  module: PackModule;
  active: boolean;
  loadedAt: number;
}

export interface TourContext {
  sessionId: string;
  locationId?: string;
  regionName?: string;
  coordinates?: { lat: number; lng: number };
  timestamp: number;
}

export interface ResonanceParams {
  uTime: number;
  uCoherence: number;
  uStillness: number;
  uColorShift: number;
  uPhase: number;
  uLFO: number;
  uAmplitude: number;
  uBreathRate: number;
  uHarmonics: number[];
  uSeed: [number, number, number];

  uCoh: number;
  uCx: number;
  uPol: number;
  uU: number;
  uSyn: number;
  uRes: number;
  uFormType: string;
  uLift: number;
  uMerkaba: boolean;
}
