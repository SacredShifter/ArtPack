import type { IModule, ModuleManifest, GlobalEventHorizon, Journey, JourneyAdaptation } from '../../core/types';
import { createClient } from '@supabase/supabase-js';
import { GalleryAPI } from '../artpack-gallery/GalleryAPI';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class JourneyOrchestrator implements IModule {
  readonly manifest: ModuleManifest = {
    id: 'journey-orchestrator',
    name: 'Telos-Driven Journey Orchestrator',
    version: '1.0.0',
    essenceLabels: ['orchestration', 'telos-driven', 'adaptive', 'ceremonial', 'intentional'],
    capabilities: [
      'sequence-artpacks',
      'adapt-to-coherence',
      'align-with-intention',
      'crossfade-experiences',
      'track-journey-progress'
    ],
    telosAlignment: [
      'guide-ceremonial-experiences',
      'facilitate-transcendence',
      'support-meditative-states'
    ],
    dependencies: ['artpack-system'],
    resourceFootprintMB: 5,
    integrityScore: 95
  };

  private geh: GlobalEventHorizon | null = null;
  private currentJourney: Journey | null = null;
  private progressTimer: number | null = null;
  private currentUserId: string | null = null;

  private intentionMap: Record<string, IntentionMapping> = {
    'deep grief processing': {
      packSequence: ['zen-garden', 'cosmic-breath', 'fractal-bloom', 'aurora-triad'],
      baseDurations: [300000, 300000, 420000, 600000],
      telos: ['process-shadow', 'support-meditative-states', 'facilitate-transcendence']
    },
    'creative breakthrough': {
      packSequence: ['liquid-dreams', 'crystal-cave', 'electric-storm'],
      baseDurations: [240000, 360000, 480000],
      telos: ['enable-creative-expression', 'celebrate-joy']
    },
    'shadow integration': {
      packSequence: ['nebula-drift', 'electric-storm', 'aurora-triad', 'zen-garden'],
      baseDurations: [300000, 420000, 360000, 300000],
      telos: ['process-shadow', 'facilitate-transcendence', 'support-meditative-states']
    },
    'collective ceremony': {
      packSequence: ['aurora-triad', 'cosmic-breath', 'fractal-bloom'],
      baseDurations: [600000, 600000, 600000],
      telos: ['enhance-collective-field', 'guide-ceremonial-experiences']
    },
    'morning activation': {
      packSequence: ['electric-storm', 'liquid-dreams', 'fractal-bloom'],
      baseDurations: [180000, 240000, 300000],
      telos: ['celebrate-joy', 'enable-creative-expression']
    }
  };

  async initialize(geh: GlobalEventHorizon): Promise<void> {
    this.geh = geh;

    this.geh.subscribe('journey-requested', this.handleJourneyRequest.bind(this));
    this.geh.subscribe('coherence-sample-updated', this.adaptJourneyTiming.bind(this));
    this.geh.subscribe('user-authenticated', this.handleUserAuth.bind(this));
    this.geh.subscribe('journey-skip-requested', this.skipToNextPack.bind(this));
    this.geh.subscribe('journey-pause-requested', this.pauseJourney.bind(this));

    this.geh.publish({
      type: 'journey-orchestrator-initialized',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['system', 'lifecycle', 'orchestration'],
      payload: { ready: true }
    });
  }

  async activate(): Promise<void> {
    this.geh?.publish({
      type: 'journey-orchestrator-activated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle', 'orchestration'],
      payload: { active: true }
    });
  }

  async deactivate(): Promise<void> {
    if (this.currentJourney) {
      await this.endJourney();
    }

    this.geh?.publish({
      type: 'journey-orchestrator-deactivated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle'],
      payload: { active: false }
    });
  }

  async destroy(): Promise<void> {
    await this.deactivate();
    this.geh = null;
  }

  getExposedItems(): Record<string, any> {
    return {
      startJourney: this.startJourney.bind(this),
      getCurrentJourney: () => this.currentJourney,
      getIntentionOptions: () => Object.keys(this.intentionMap),
      skipToNext: this.skipToNextPack.bind(this),
      pauseJourney: this.pauseJourney.bind(this)
    };
  }

  private handleUserAuth(event: any): void {
    this.currentUserId = event.payload.userId;
  }

  private async handleJourneyRequest(event: any): Promise<void> {
    const { intention } = event.payload;
    await this.startJourney(intention);
  }

  private async startJourney(intention: string): Promise<void> {
    if (this.currentJourney) {
      await this.endJourney();
    }

    const mapping = this.intentionMap[intention.toLowerCase()];
    if (!mapping) {
      console.warn(`Unknown intention: ${intention}`);
      return;
    }

    this.currentJourney = {
      id: crypto.randomUUID(),
      userId: this.currentUserId || 'anonymous',
      intention,
      telos: mapping.telos,
      packs: mapping.packSequence,
      currentIndex: 0,
      durations: [...mapping.baseDurations],
      startTime: Date.now(),
      peakMoments: [],
      adaptations: []
    };

    await this.storeJourney(this.currentJourney);

    this.geh?.publish({
      type: 'journey-started',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['journey', 'lifecycle', 'telos-driven'],
      payload: {
        journeyId: this.currentJourney.id,
        intention,
        packCount: this.currentJourney.packs.length
      }
    });

    await this.progressJourney();
  }

  private async progressJourney(): Promise<void> {
    if (!this.currentJourney) return;

    const { packs, currentIndex, durations } = this.currentJourney;

    if (currentIndex >= packs.length) {
      await this.completeJourney();
      return;
    }

    const packId = packs[currentIndex];

    this.geh?.publish({
      type: 'journey-pack-loading',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['journey', 'orchestration', 'visual'],
      payload: {
        journeyId: this.currentJourney.id,
        packId,
        packIndex: currentIndex,
        totalPacks: packs.length
      }
    });

    const duration = durations[currentIndex];

    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }

    this.progressTimer = window.setTimeout(() => {
      if (this.currentJourney) {
        this.currentJourney.currentIndex++;
        this.progressJourney();
      }
    }, duration);

    await this.updateJourneyProgress();
  }

  private async adaptJourneyTiming(event: any): Promise<void> {
    if (!this.currentJourney) return;

    const { sample } = event.payload;
    const { amplitude } = sample;

    const currentIndex = this.currentJourney.currentIndex;
    const currentDuration = this.currentJourney.durations[currentIndex];

    if (amplitude > 0.85) {
      const extension = 60000;
      this.currentJourney.durations[currentIndex] = currentDuration + extension;

      const adaptation: JourneyAdaptation = {
        timestamp: Date.now(),
        reason: 'high-coherence-detected',
        action: `extended-duration-by-${extension}ms`,
        coherenceTrigger: amplitude
      };

      this.currentJourney.adaptations.push(adaptation);

      if (this.progressTimer) {
        clearTimeout(this.progressTimer);
        const timeRemaining = currentDuration + extension - (Date.now() - this.currentJourney.startTime);

        this.progressTimer = window.setTimeout(() => {
          if (this.currentJourney) {
            this.currentJourney.currentIndex++;
            this.progressJourney();
          }
        }, timeRemaining);
      }

      this.geh?.publish({
        type: 'journey-timing-adapted',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['journey', 'adaptive', 'coherence-responsive'],
        payload: {
          journeyId: this.currentJourney.id,
          reason: 'high-coherence',
          extension,
          newDuration: this.currentJourney.durations[currentIndex]
        }
      });

      await this.updateJourneyProgress();
    }

    if (amplitude > 0.9) {
      this.currentJourney.peakMoments.push(Date.now().toString());

      this.geh?.publish({
        type: 'journey-peak-moment-detected',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['journey', 'peak-state'],
        payload: {
          journeyId: this.currentJourney.id,
          packId: this.currentJourney.packs[currentIndex],
          amplitude
        },
        resonanceSignature: 92
      });
    }
  }

  private async skipToNextPack(): Promise<void> {
    if (!this.currentJourney) return;

    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }

    this.currentJourney.currentIndex++;

    this.geh?.publish({
      type: 'journey-pack-skipped',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['journey', 'user-action'],
      payload: {
        journeyId: this.currentJourney.id,
        newIndex: this.currentJourney.currentIndex
      }
    });

    await this.progressJourney();
  }

  private async pauseJourney(): Promise<void> {
    if (!this.currentJourney || !this.progressTimer) return;

    clearTimeout(this.progressTimer);
    this.progressTimer = null;

    this.geh?.publish({
      type: 'journey-paused',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['journey', 'user-action'],
      payload: {
        journeyId: this.currentJourney.id
      }
    });
  }

  private async completeJourney(): Promise<void> {
    if (!this.currentJourney) return;

    const duration = Date.now() - this.currentJourney.startTime;

    this.geh?.publish({
      type: 'journey-completed',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['journey', 'completion', 'milestone'],
      payload: {
        journeyId: this.currentJourney.id,
        intention: this.currentJourney.intention,
        duration,
        peakMoments: this.currentJourney.peakMoments.length,
        adaptations: this.currentJourney.adaptations.length
      },
      resonanceSignature: 88
    });

    await this.finalizeJourney();

    this.currentJourney = null;

    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private async endJourney(): Promise<void> {
    if (!this.currentJourney) return;

    this.geh?.publish({
      type: 'journey-ended-early',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['journey', 'lifecycle'],
      payload: {
        journeyId: this.currentJourney.id,
        completedPacks: this.currentJourney.currentIndex
      }
    });

    await this.finalizeJourney();

    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
      this.progressTimer = null;
    }

    this.currentJourney = null;
  }

  private async storeJourney(journey: Journey): Promise<void> {
    try {
      await supabase.from('journeys').insert({
        id: journey.id,
        user_id: journey.userId,
        intention: journey.intention,
        telos: journey.telos,
        pack_sequence: journey.packs,
        started_at: new Date(journey.startTime).toISOString()
      });
    } catch (error) {
      console.error('Failed to store journey:', error);
    }
  }

  private async updateJourneyProgress(): Promise<void> {
    if (!this.currentJourney) return;

    try {
      await supabase
        .from('journeys')
        .update({
          current_index: this.currentJourney.currentIndex,
          peak_moments: this.currentJourney.peakMoments,
          adaptations: this.currentJourney.adaptations
        })
        .eq('id', this.currentJourney.id);
    } catch (error) {
      console.error('Failed to update journey progress:', error);
    }
  }

  private async finalizeJourney(): Promise<void> {
    if (!this.currentJourney) return;

    try {
      await supabase
        .from('journeys')
        .update({
          completed_at: new Date().toISOString(),
          peak_moments: this.currentJourney.peakMoments,
          adaptations: this.currentJourney.adaptations
        })
        .eq('id', this.currentJourney.id);
    } catch (error) {
      console.error('Failed to finalize journey:', error);
    }
  }
}

interface IntentionMapping {
  packSequence: string[];
  baseDurations: number[];
  telos: string[];
}
