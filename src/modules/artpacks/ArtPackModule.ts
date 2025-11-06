import type { IModule, ModuleManifest, GlobalEventHorizon, CoherenceSample, RegionSeed } from '../../core/types';
import { artPackEngine } from './ArtPackEngine';
import { GalleryAPI } from '../artpack-gallery/GalleryAPI';

export class ArtPackModule implements IModule {
  readonly manifest: ModuleManifest = {
    id: 'artpack-system',
    name: 'Art Pack & Gallery System',
    version: '1.0.0',
    essenceLabels: ['visual', 'creative', 'experiential', 'community', 'safety-conscious', 'coherence-reactive'],
    capabilities: [
      'render-visual-experiences',
      'manage-art-packs',
      'gallery-marketplace',
      'safety-validation',
      'real-time-shader-rendering'
    ],
    telosAlignment: [
      'facilitate-transcendence',
      'enable-creative-expression',
      'enhance-collective-field',
      'provide-visual-anchors',
      'support-meditative-states'
    ],
    dependencies: [],
    resourceFootprintMB: 15,
    integrityScore: 98
  };

  private geh: GlobalEventHorizon | null = null;
  private isActive = false;
  private currentCoherence: CoherenceSample | null = null;
  private currentRegion: RegionSeed | null = null;

  async initialize(geh: GlobalEventHorizon): Promise<void> {
    this.geh = geh;

    this.geh.subscribe('coherence-sample-updated', this.handleCoherenceUpdate.bind(this));
    this.geh.subscribe('region-seed-changed', this.handleRegionChange.bind(this));
    this.geh.subscribe('user-telos-declared', this.handleTelosChange.bind(this));
    this.geh.subscribe('safety-mode-toggled', this.handleSafetyToggle.bind(this));
    this.geh.subscribe('load-pack-by-id', this.handleLoadPackById.bind(this));
    this.geh.subscribe('apply-stillness-amplification', this.handleAmplification.bind(this));

    this.geh.publish({
      type: 'artpack-module-initialized',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['system', 'lifecycle'],
      payload: { capabilities: this.manifest.capabilities }
    });
  }

  async activate(): Promise<void> {
    this.isActive = true;

    this.geh?.publish({
      type: 'artpack-module-activated',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['lifecycle', 'visual'],
      payload: { active: true }
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh?.publish({
      type: 'artpack-module-deactivated',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['lifecycle'],
      payload: { active: false }
    });
  }

  async destroy(): Promise<void> {
    this.geh = null;
  }

  getExposedItems(): Record<string, any> {
    return {
      loadPack: this.loadPackByIntent.bind(this),
      getGalleryAPI: () => GalleryAPI,
      listPacks: GalleryAPI.listPacks.bind(GalleryAPI)
    };
  }

  private async handleCoherenceUpdate(event: any): Promise<void> {
    if (!this.isActive) return;

    this.currentCoherence = event.payload.sample;

    this.geh?.publish({
      type: 'visual-coherence-updated',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['visual', 'coherence', 'real-time'],
      payload: {
        amplitude: this.currentCoherence.amplitude,
        visuallyRendered: true
      }
    });
  }

  private async handleRegionChange(event: any): Promise<void> {
    this.currentRegion = event.payload.seed;

    this.geh?.publish({
      type: 'visual-region-updated',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['visual', 'location'],
      payload: { region: this.currentRegion }
    });
  }

  private async handleTelosChange(event: any): Promise<void> {
    const userTelos = event.payload.telos;

    const matchingPacks = await this.findPacksByTelos(userTelos);

    if (matchingPacks.length > 0) {
      this.geh?.publish({
        type: 'artpack-recommendations-available',
        timestamp: Date.now(),
        sourceModule: 'artpack-system',
        labels: ['recommendation', 'telos-aligned'],
        payload: {
          telos: userTelos,
          recommendedPacks: matchingPacks,
          count: matchingPacks.length
        }
      });
    }
  }

  private async handleSafetyToggle(event: any): Promise<void> {
    const safetyMode = event.payload.enabled;

    this.geh?.publish({
      type: 'visual-safety-updated',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['safety', 'accessibility'],
      payload: { safetyMode }
    });
  }

  private async handleLoadPackById(event: any): Promise<void> {
    const { packId } = event.payload;

    const packs = await GalleryAPI.listPacks('all', 'all', '');
    const pack = packs.find(p => p.id === packId);

    if (pack) {
      this.geh?.publish({
        type: 'artpack-loaded',
        timestamp: Date.now(),
        sourceModule: 'artpack-system',
        labels: ['lifecycle', 'visual'],
        payload: {
          packId: pack.id,
          packName: pack.title
        }
      });
    }
  }

  private async handleAmplification(event: any): Promise<void> {
    const { modifiers } = event.payload;

    this.geh?.publish({
      type: 'artpack-modifiers-applied',
      timestamp: Date.now(),
      sourceModule: 'artpack-system',
      labels: ['visual', 'modification'],
      payload: { modifiers }
    });
  }

  private async loadPackByIntent(intent: string): Promise<void> {
    const packs = await GalleryAPI.listPacks('all', 'all', intent);

    if (packs.length > 0) {
      const bestMatch = packs[0];

      this.geh?.publish({
        type: 'artpack-loaded',
        timestamp: Date.now(),
        sourceModule: 'artpack-system',
        labels: ['lifecycle', 'visual'],
        payload: {
          packId: bestMatch.id,
          packName: bestMatch.title,
          intent
        }
      });

      this.geh?.publish({
        type: 'akashic-record-event',
        timestamp: Date.now(),
        sourceModule: 'artpack-system',
        labels: ['history', 'user-action'],
        payload: {
          action: 'pack-loaded',
          packId: bestMatch.id,
          userIntent: intent
        }
      });
    }
  }

  private async findPacksByTelos(telos: string[]): Promise<any[]> {
    const telosToTagMap: Record<string, string[]> = {
      'facilitate-transcendence': ['psychedelic', 'intense', 'meditative'],
      'enable-creative-expression': ['colorful', 'dynamic', 'creative'],
      'support-meditative-states': ['minimal', 'zen', 'calming', 'safe'],
      'process-shadow': ['dark', 'intense', 'transformative'],
      'celebrate-joy': ['colorful', 'energetic', 'playful']
    };

    const searchTags = telos.flatMap(t => telosToTagMap[t] || []);
    const uniqueTags = [...new Set(searchTags)];

    const results = await Promise.all(
      uniqueTags.map(tag => GalleryAPI.listPacks('all', 'all', tag))
    );

    const allPacks = results.flat();
    const uniquePacks = Array.from(new Map(allPacks.map(p => [p.id, p])).values());

    return uniquePacks;
  }
}
