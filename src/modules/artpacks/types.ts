import * as THREE from 'three';

export interface CoherenceSample {
  timestamp: number;
  amplitude: number;
  phase: number;
  frequency: number;
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

export interface ArtPackManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  entry: string;
  minEngine: string;
  safety?: {
    maxStrobeHz?: number;
    photosensitiveWarning?: boolean;
  };
}

export interface EngineAPI {
  registerMaterial(name: string, material: THREE.Material): void;
  registerNode(name: string, factory: () => THREE.Object3D): void;
  setParamMapper(fn: (region: RegionSeed, coherence: CoherenceSample) => Record<string, any>): void;
  onFrame(fn: (deltaTime: number, params: Record<string, any>) => void): void;
  defineSafetyCaps(caps: Partial<SafetyCaps>): void;
}

export interface ArtPackModule {
  register(engine: EngineAPI): void;
  cleanup?(): void;
}

export interface LoadedPack {
  manifest: ArtPackManifest;
  module: ArtPackModule;
  active: boolean;
}
