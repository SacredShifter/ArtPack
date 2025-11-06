import type { IModule, ModuleManifest } from './types';
import { geh } from './GlobalEventHorizon';
import { labelProcessor } from './LabelProcessor';

export class ModuleManager {
  private static instance: ModuleManager;

  private modules: Map<string, IModule> = new Map();
  private activeModules: Set<string> = new Set();
  private moduleStates: Map<string, ModuleState> = new Map();

  private readonly INTEGRITY_THRESHOLD = 60;
  private readonly LOW_MEMORY_THRESHOLD_MB = 100;

  private constructor() {}

  static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  async registerModule(module: IModule): Promise<void> {
    const manifest = module.manifest;

    const dissonanceCheck = labelProcessor.detectDissonance(manifest);
    if (dissonanceCheck.isDissonant) {
      console.warn(`Module ${manifest.id} has dissonance:`, dissonanceCheck.issues);

      if (manifest.integrityScore < this.INTEGRITY_THRESHOLD) {
        throw new Error(`Module ${manifest.id} rejected: integrity score too low`);
      }
    }

    if (this.modules.has(manifest.id)) {
      console.warn(`Module ${manifest.id} already registered, replacing...`);
      await this.destroyModule(manifest.id);
    }

    this.modules.set(manifest.id, module);
    this.moduleStates.set(manifest.id, {
      status: 'registered',
      lastActivated: null,
      lastDeactivated: null,
      resourceUsageMB: manifest.resourceFootprintMB,
      errorCount: 0
    });

    await module.initialize(geh);

    geh.publish({
      type: 'module-registered',
      timestamp: Date.now(),
      sourceModule: 'module-manager',
      labels: ['system', 'lifecycle'],
      payload: {
        moduleId: manifest.id,
        manifest
      }
    });
  }

  async activateModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (this.activeModules.has(moduleId)) {
      console.warn(`Module ${moduleId} already active`);
      return;
    }

    try {
      await module.activate();
      this.activeModules.add(moduleId);

      const state = this.moduleStates.get(moduleId)!;
      state.status = 'active';
      state.lastActivated = Date.now();

      geh.publish({
        type: 'module-activated',
        timestamp: Date.now(),
        sourceModule: 'module-manager',
        labels: ['system', 'lifecycle'],
        payload: { moduleId }
      });
    } catch (error) {
      const state = this.moduleStates.get(moduleId)!;
      state.errorCount++;

      geh.publish({
        type: 'module-activation-failed',
        timestamp: Date.now(),
        sourceModule: 'module-manager',
        labels: ['system', 'error'],
        payload: {
          moduleId,
          error: String(error)
        }
      });

      throw error;
    }
  }

  async deactivateModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (!this.activeModules.has(moduleId)) {
      console.warn(`Module ${moduleId} not active`);
      return;
    }

    await module.deactivate();
    this.activeModules.delete(moduleId);

    const state = this.moduleStates.get(moduleId)!;
    state.status = 'inactive';
    state.lastDeactivated = Date.now();

    geh.publish({
      type: 'module-deactivated',
      timestamp: Date.now(),
      sourceModule: 'module-manager',
      labels: ['system', 'lifecycle'],
      payload: { moduleId }
    });
  }

  async destroyModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) return;

    if (this.activeModules.has(moduleId)) {
      await this.deactivateModule(moduleId);
    }

    await module.destroy();
    this.modules.delete(moduleId);
    this.moduleStates.delete(moduleId);
    this.activeModules.delete(moduleId);

    geh.publish({
      type: 'module-destroyed',
      timestamp: Date.now(),
      sourceModule: 'module-manager',
      labels: ['system', 'lifecycle', 'cleanup'],
      payload: { moduleId }
    });
  }

  getExposedItem(moduleId: string, itemName: string): any {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const exposedItems = module.getExposedItems();
    if (!(itemName in exposedItems)) {
      throw new Error(`Item ${itemName} not exposed by module ${moduleId}`);
    }

    return exposedItems[itemName];
  }

  findModulesByLabel(labels: string[], minSimilarity: number = 50): ModuleManifest[] {
    const manifests = Array.from(this.modules.values()).map(m => m.manifest);
    return labelProcessor.findModulesByLabel(manifests, labels, minSimilarity);
  }

  findModulesByTelos(telos: string[], minAlignment: number = 50): ModuleManifest[] {
    const manifests = Array.from(this.modules.values()).map(m => m.manifest);
    return labelProcessor.findModulesByTelos(manifests, telos, minAlignment);
  }

  async orchestrateByTelos(userTelos: string[]): Promise<void> {
    const alignedModules = this.findModulesByTelos(userTelos, 60);

    for (const manifest of alignedModules) {
      if (!this.activeModules.has(manifest.id)) {
        await this.activateModule(manifest.id);
      }
    }

    geh.publish({
      type: 'telos-orchestration-completed',
      timestamp: Date.now(),
      sourceModule: 'module-manager',
      labels: ['orchestration', 'telos-driven'],
      payload: {
        userTelos,
        activatedModules: alignedModules.map(m => m.id)
      }
    });
  }

  async purgeCycle(): Promise<void> {
    const inactiveModules = Array.from(this.modules.keys())
      .filter(id => !this.activeModules.has(id));

    const now = Date.now();
    const INACTIVE_THRESHOLD_MS = 5 * 60 * 1000;

    for (const moduleId of inactiveModules) {
      const state = this.moduleStates.get(moduleId)!;

      if (
        state.lastDeactivated &&
        now - state.lastDeactivated > INACTIVE_THRESHOLD_MS
      ) {
        await this.destroyModule(moduleId);
      }
    }

    geh.publish({
      type: 'purge-cycle-completed',
      timestamp: Date.now(),
      sourceModule: 'module-manager',
      labels: ['system', 'cleanup', 'conspansion'],
      payload: { purgedCount: inactiveModules.length }
    });
  }

  async handleLowMemory(): Promise<void> {
    const modulesByFootprint = Array.from(this.modules.entries())
      .map(([id, module]) => ({
        id,
        footprint: module.manifest.resourceFootprintMB,
        isActive: this.activeModules.has(id)
      }))
      .sort((a, b) => b.footprint - a.footprint);

    for (const { id, isActive } of modulesByFootprint) {
      if (!isActive) {
        await this.destroyModule(id);
      }

      const currentUsage = this.getTotalMemoryUsage();
      if (currentUsage < this.LOW_MEMORY_THRESHOLD_MB) {
        break;
      }
    }

    geh.publish({
      type: 'low-memory-handled',
      timestamp: Date.now(),
      sourceModule: 'module-manager',
      labels: ['system', 'resource-management'],
      payload: {
        currentUsageMB: this.getTotalMemoryUsage()
      }
    });
  }

  getTotalMemoryUsage(): number {
    return Array.from(this.moduleStates.values())
      .reduce((sum, state) => sum + state.resourceUsageMB, 0);
  }

  getModuleState(moduleId: string): ModuleState | undefined {
    return this.moduleStates.get(moduleId);
  }

  getActiveModules(): string[] {
    return Array.from(this.activeModules);
  }

  getAllModules(): ModuleManifest[] {
    return Array.from(this.modules.values()).map(m => m.manifest);
  }
}

interface ModuleState {
  status: 'registered' | 'active' | 'inactive' | 'error';
  lastActivated: number | null;
  lastDeactivated: number | null;
  resourceUsageMB: number;
  errorCount: number;
}

export const moduleManager = ModuleManager.getInstance();
