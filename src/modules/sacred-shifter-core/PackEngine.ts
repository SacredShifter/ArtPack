import * as THREE from 'three';
import {
  PackManifest,
  PackModule,
  LoadedPack,
  RegionSeed,
  CoherenceSample,
  GAAState,
  SonicEnvelope,
  SafetyCaps,
  EngineAPI,
  ResonanceParams
} from './types';

type PackEventType = 'loaded' | 'switched' | 'error' | 'unloaded';
type PackEventHandler = (data: any) => void;

export class PackEngine {
  private static instance: PackEngine;

  private materials: Map<string, THREE.Material> = new Map();
  private nodes: Map<string, () => THREE.Object3D> = new Map();
  private paramMapper: ((seed: RegionSeed, coherence: CoherenceSample, gaa: GAAState, envelope: SonicEnvelope) => Record<string, any>) | null = null;
  private frameCallbacks: Array<(deltaTime: number, params: Record<string, any>) => void> = [];
  private safetyCaps: SafetyCaps = {
    maxStrobeHz: 3,
    maxBrightness: 0.85,
    maxSaturation: 0.9,
    lowSensoryMode: false
  };

  private packs: Map<string, LoadedPack> = new Map();
  private currentPackId: string | null = null;
  private eventHandlers: Map<PackEventType, PackEventHandler[]> = new Map();

  private constructor() {}

  static getInstance(): PackEngine {
    if (!PackEngine.instance) {
      PackEngine.instance = new PackEngine();
    }
    return PackEngine.instance;
  }

  private createEngineAPI(): EngineAPI {
    return {
      registerMaterial: (name: string, material: THREE.Material) => {
        this.materials.set(name, material);
      },
      registerNode: (name: string, factory: () => THREE.Object3D) => {
        this.nodes.set(name, factory);
      },
      setParamMapper: (fn: (seed: RegionSeed, coherence: CoherenceSample, gaa: GAAState, envelope: SonicEnvelope) => Record<string, any>) => {
        this.paramMapper = fn;
      },
      onFrame: (fn: (deltaTime: number, params: Record<string, any>) => void) => {
        this.frameCallbacks.push(fn);
      },
      defineSafetyCaps: (caps: Partial<SafetyCaps>) => {
        this.safetyCaps = { ...this.safetyCaps, ...caps };
      },
      getThree: () => THREE
    };
  }

  async loadPack(manifestUrl: string): Promise<void> {
    try {
      const resolvedUrl = this.resolveManifestUrl(manifestUrl);
      const baseUrl = resolvedUrl.substring(0, resolvedUrl.lastIndexOf('/'));

      const manifestResponse = await fetch(resolvedUrl);
      if (!manifestResponse.ok) {
        throw new Error(`Failed to fetch manifest: ${manifestResponse.statusText}`);
      }

      const manifest: PackManifest = await manifestResponse.json();
      this.validateManifest(manifest);

      const moduleUrl = manifest.esm_url.startsWith('http')
        ? manifest.esm_url
        : `${baseUrl}/${manifest.esm_url}`;

      const module: PackModule = await import(moduleUrl);

      if (typeof module.register !== 'function') {
        throw new Error(`Pack ${manifest.id} missing register() function`);
      }

      this.packs.set(manifest.id, {
        manifest,
        module,
        active: false,
        loadedAt: Date.now()
      });

      this.emit('loaded', { packId: manifest.id, manifest });

      if (!this.currentPackId) {
        await this.switchPack(manifest.id);
      }
    } catch (error) {
      this.emit('error', { error: error instanceof Error ? error.message : String(error), url: manifestUrl });
      throw error;
    }
  }

  async switchPack(packId: string): Promise<void> {
    const pack = this.packs.get(packId);
    if (!pack) {
      throw new Error(`Pack ${packId} not loaded`);
    }

    if (this.currentPackId) {
      const currentPack = this.packs.get(this.currentPackId);
      if (currentPack) {
        currentPack.active = false;
        if (currentPack.module.cleanup) {
          currentPack.module.cleanup();
        }
      }
    }

    this.clearRegistry();

    pack.module.register(this.createEngineAPI());
    pack.active = true;
    this.currentPackId = packId;

    this.emit('switched', { packId, manifest: pack.manifest });
  }

  unloadPack(packId: string): void {
    const pack = this.packs.get(packId);
    if (!pack) return;

    if (pack.active && pack.module.cleanup) {
      pack.module.cleanup();
    }

    this.packs.delete(packId);
    this.emit('unloaded', { packId });

    if (this.currentPackId === packId) {
      this.currentPackId = null;
      this.clearRegistry();
    }
  }

  private clearRegistry(): void {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    this.nodes.clear();
    this.frameCallbacks = [];
    this.paramMapper = null;
  }

  private validateManifest(manifest: PackManifest): void {
    const required = ['id', 'name', 'version', 'esm_url'];
    for (const field of required) {
      if (!(field in manifest)) {
        throw new Error(`Manifest missing required field: ${field}`);
      }
    }

    if (manifest.safety?.maxStrobeHz && manifest.safety.maxStrobeHz > 3) {
      console.warn(`Pack ${manifest.id} declares strobe rate ${manifest.safety.maxStrobeHz}Hz exceeding safe limit`);
    }
  }

  private resolveManifestUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }

    return url;
  }

  createNode(name: string): THREE.Object3D | undefined {
    const factory = this.nodes.get(name);
    return factory ? factory() : undefined;
  }

  computeParams(
    seed: RegionSeed,
    coherence: CoherenceSample,
    gaa: GAAState,
    envelope: SonicEnvelope,
    evoInputs?: { Coh: number; Cx: number; Pol: number; U: number; Syn: number; Res: number },
    evoParams?: { lift: number; merkaba: boolean; formType: string }
  ): ResonanceParams {
    const baseParams: ResonanceParams = {
      uTime: Date.now() / 1000,
      uCoherence: coherence.collective,
      uStillness: coherence.stillness,
      uColorShift: envelope.hueShift,
      uPhase: gaa.phase,
      uLFO: gaa.lfo,
      uAmplitude: envelope.amplitude,
      uBreathRate: envelope.breathRate,
      uHarmonics: gaa.harmonics,
      uSeed: [seed.lat, seed.lng, seed.timestamp],

      uCoh: evoInputs?.Coh ?? coherence.collective,
      uCx: evoInputs?.Cx ?? 0.5,
      uPol: evoInputs?.Pol ?? 0.5,
      uU: evoInputs?.U ?? 0.5,
      uSyn: evoInputs?.Syn ?? 0.5,
      uRes: evoInputs?.Res ?? 0.3,
      uFormType: evoParams?.formType ?? 'circle',
      uLift: evoParams?.lift ?? 0,
      uMerkaba: evoParams?.merkaba ?? false
    };

    if (this.paramMapper) {
      const customParams = this.paramMapper(seed, coherence, gaa, envelope);
      return { ...baseParams, ...customParams };
    }

    return baseParams;
  }

  private applySafetyCaps(params: Record<string, any>): Record<string, any> {
    const capped = { ...params };

    if (this.safetyCaps.lowSensoryMode) {
      if (capped.uAmplitude !== undefined) capped.uAmplitude = Math.min(capped.uAmplitude, 0.5);
      if (capped.uBrightness !== undefined) capped.uBrightness = Math.min(capped.uBrightness, 0.6);
    }

    if (capped.uBrightness !== undefined) {
      capped.uBrightness = Math.min(capped.uBrightness, this.safetyCaps.maxBrightness);
    }

    if (capped.uSaturation !== undefined) {
      capped.uSaturation = Math.min(capped.uSaturation, this.safetyCaps.maxSaturation);
    }

    return capped;
  }

  runFrameCallbacks(deltaTime: number, params: Record<string, any>): void {
    const cappedParams = this.applySafetyCaps(params);
    for (const callback of this.frameCallbacks) {
      callback(deltaTime, cappedParams);
    }
  }

  getCurrentPackId(): string | null {
    return this.currentPackId;
  }

  getCurrentPack(): LoadedPack | undefined {
    return this.currentPackId ? this.packs.get(this.currentPackId) : undefined;
  }

  getAllPacks(): LoadedPack[] {
    return Array.from(this.packs.values());
  }

  getSafetyCaps(): SafetyCaps {
    return { ...this.safetyCaps };
  }

  updateSafetyCaps(caps: Partial<SafetyCaps>): void {
    this.safetyCaps = { ...this.safetyCaps, ...caps };
  }

  on(event: PackEventType, handler: PackEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: PackEventType, handler: PackEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: PackEventType, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

export const packEngine = PackEngine.getInstance();
