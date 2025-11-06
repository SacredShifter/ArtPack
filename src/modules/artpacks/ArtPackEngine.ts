import * as THREE from 'three';
import {
  ArtPackManifest,
  ArtPackModule,
  CoherenceSample,
  RegionSeed,
  SafetyCaps,
  EngineAPI,
  LoadedPack
} from './types';

type PackEventType = 'loaded' | 'switched' | 'error';
type PackEventHandler = (data: any) => void;

export class ArtPackEngine {
  private static instance: ArtPackEngine;

  private materials: Map<string, THREE.Material> = new Map();
  private nodes: Map<string, () => THREE.Object3D> = new Map();
  private paramMapper: ((region: RegionSeed, coherence: CoherenceSample) => Record<string, any>) | null = null;
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

  static getInstance(): ArtPackEngine {
    if (!ArtPackEngine.instance) {
      ArtPackEngine.instance = new ArtPackEngine();
    }
    return ArtPackEngine.instance;
  }

  private createEngineAPI(): EngineAPI {
    return {
      registerMaterial: (name: string, material: THREE.Material) => {
        this.materials.set(name, material);
      },
      registerNode: (name: string, factory: () => THREE.Object3D) => {
        this.nodes.set(name, factory);
      },
      setParamMapper: (fn: (region: RegionSeed, coherence: CoherenceSample) => Record<string, any>) => {
        this.paramMapper = fn;
      },
      onFrame: (fn: (deltaTime: number, params: Record<string, any>) => void) => {
        this.frameCallbacks.push(fn);
      },
      defineSafetyCaps: (caps: Partial<SafetyCaps>) => {
        this.safetyCaps = { ...this.safetyCaps, ...caps };
      }
    };
  }

  async loadPack(manifestUrl: string | URL): Promise<void> {
    try {
      const url = typeof manifestUrl === 'string' ? manifestUrl : manifestUrl.toString();
      const baseUrl = url.substring(0, url.lastIndexOf('/'));

      const manifestResponse = await fetch(url);
      if (!manifestResponse.ok) {
        throw new Error(`Failed to fetch manifest: ${manifestResponse.statusText}`);
      }

      const manifest: ArtPackManifest = await manifestResponse.json();

      this.validateManifest(manifest);

      const entryUrl = `${baseUrl}/${manifest.entry}`;
      const module: ArtPackModule = await import(entryUrl);

      if (typeof module.register !== 'function') {
        throw new Error(`Pack ${manifest.id} missing register() function`);
      }

      this.packs.set(manifest.id, {
        manifest,
        module,
        active: false
      });

      this.emit('loaded', { packId: manifest.id, manifest });

      if (!this.currentPackId) {
        await this.switchPack(manifest.id);
      }
    } catch (error) {
      this.emit('error', { error: error instanceof Error ? error.message : String(error) });
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

  private clearRegistry(): void {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    this.nodes.clear();
    this.frameCallbacks = [];
    this.paramMapper = null;
  }

  private validateManifest(manifest: ArtPackManifest): void {
    const required = ['id', 'name', 'version', 'entry', 'minEngine'];
    for (const field of required) {
      if (!(field in manifest)) {
        throw new Error(`Manifest missing required field: ${field}`);
      }
    }

    if (manifest.safety?.maxStrobeHz && manifest.safety.maxStrobeHz > 3) {
      console.warn(`Pack ${manifest.id} declares strobe rate ${manifest.safety.maxStrobeHz}Hz exceeding safe limit`);
    }
  }

  getMaterial(name: string): THREE.Material | undefined {
    return this.materials.get(name);
  }

  createNode(name: string): THREE.Object3D | undefined {
    const factory = this.nodes.get(name);
    return factory ? factory() : undefined;
  }

  computeParams(region: RegionSeed, coherence: CoherenceSample): Record<string, any> {
    if (!this.paramMapper) {
      return {};
    }
    const params = this.paramMapper(region, coherence);
    return this.applySafetyCaps(params);
  }

  private applySafetyCaps(params: Record<string, any>): Record<string, any> {
    const capped = { ...params };

    if (this.safetyCaps.lowSensoryMode) {
      capped.amplitude = Math.min(capped.amplitude ?? 1, 0.5);
      capped.brightness = Math.min(capped.brightness ?? 1, 0.6);
    }

    if (typeof capped.brightness === 'number') {
      capped.brightness = Math.min(capped.brightness, this.safetyCaps.maxBrightness);
    }

    if (typeof capped.saturation === 'number') {
      capped.saturation = Math.min(capped.saturation, this.safetyCaps.maxSaturation);
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

export const artPackEngine = ArtPackEngine.getInstance();
