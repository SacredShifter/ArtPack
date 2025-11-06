import type { IModule, ModuleManifest, GlobalEventHorizon, ResonanceMoment, BiometricStream } from '../../core/types';
import { createClient } from '@supabase/supabase-js';
import html2canvas from 'html2canvas';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class TemporalResonanceArchive implements IModule {
  readonly manifest: ModuleManifest = {
    id: 'temporal-resonance-archive',
    name: 'Temporal Resonance Archive',
    version: '1.0.0',
    essenceLabels: ['archival', 'peak-state', 'memory', 'temporal', 'reflective'],
    capabilities: [
      'capture-peak-moments',
      'store-resonance-snapshots',
      'retrieve-past-experiences',
      'identify-sacred-geometry',
      'generate-insights'
    ],
    telosAlignment: [
      'facilitate-transcendence',
      'enable-creative-expression',
      'support-meditative-states'
    ],
    dependencies: ['artpack-system'],
    resourceFootprintMB: 12,
    integrityScore: 94
  };

  private geh: GlobalEventHorizon | null = null;
  private currentUserId: string | null = null;
  private lastBiometricSnapshot: BiometricStream | null = null;
  private currentArtPackId: string | null = null;
  private captureThreshold = 0.85;
  private cooldownMs = 10000;
  private lastCaptureTime = 0;

  async initialize(geh: GlobalEventHorizon): Promise<void> {
    this.geh = geh;

    this.geh.subscribe('coherence-sample-updated', this.handleCoherenceUpdate.bind(this));
    this.geh.subscribe('biometric-stream-received', this.handleBiometricStream.bind(this));
    this.geh.subscribe('artpack-loaded', this.handleArtPackLoaded.bind(this));
    this.geh.subscribe('user-authenticated', this.handleUserAuth.bind(this));
    this.geh.subscribe('manual-capture-requested', this.handleManualCapture.bind(this));

    this.geh.publish({
      type: 'temporal-archive-initialized',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['system', 'lifecycle', 'archival'],
      payload: { ready: true }
    });
  }

  async activate(): Promise<void> {
    this.geh?.publish({
      type: 'temporal-archive-activated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle', 'archival'],
      payload: { monitoring: true }
    });
  }

  async deactivate(): Promise<void> {
    this.geh?.publish({
      type: 'temporal-archive-deactivated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle'],
      payload: { monitoring: false }
    });
  }

  async destroy(): Promise<void> {
    this.geh = null;
    this.lastBiometricSnapshot = null;
  }

  getExposedItems(): Record<string, any> {
    return {
      getMoments: this.getMoments.bind(this),
      getMomentById: this.getMomentById.bind(this),
      captureNow: this.captureResonanceMoment.bind(this),
      searchMoments: this.searchMoments.bind(this),
      getMomentInsights: this.getMomentInsights.bind(this)
    };
  }

  private async handleCoherenceUpdate(event: any): Promise<void> {
    const { sample } = event.payload;

    if (sample.amplitude >= this.captureThreshold) {
      const now = Date.now();
      if (now - this.lastCaptureTime > this.cooldownMs) {
        await this.captureResonanceMoment();
        this.lastCaptureTime = now;
      }
    }
  }

  private handleBiometricStream(event: any): void {
    this.lastBiometricSnapshot = event.payload.stream;
  }

  private handleArtPackLoaded(event: any): void {
    this.currentArtPackId = event.payload.packId;
  }

  private handleUserAuth(event: any): void {
    this.currentUserId = event.payload.userId;
  }

  private async handleManualCapture(event: any): Promise<void> {
    const { emotionalTag, notes } = event.payload;
    await this.captureResonanceMoment(emotionalTag, notes);
  }

  private async captureResonanceMoment(
    emotionalTag?: string,
    notes?: string
  ): Promise<ResonanceMoment | null> {
    if (!this.currentUserId) {
      console.warn('Cannot capture moment: no user authenticated');
      return null;
    }

    try {
      const screenshot = await this.captureScreenshot();

      const coherenceScore = this.calculateCurrentCoherence();

      const moment: ResonanceMoment = {
        id: crypto.randomUUID(),
        userId: this.currentUserId,
        timestamp: Date.now(),
        coherenceScore,
        screenshot,
        artPackId: this.currentArtPackId || 'unknown',
        biometricSnapshot: this.lastBiometricSnapshot || this.getEmptyBiometricSnapshot(),
        emotionalTag,
        notes
      };

      await this.storeMoment(moment);

      this.geh?.publish({
        type: 'resonance-moment-captured',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['peak-state', 'archival', 'user-action'],
        payload: {
          momentId: moment.id,
          coherenceScore: moment.coherenceScore,
          artPackId: moment.artPackId
        },
        resonanceSignature: 85
      });

      return moment;
    } catch (error) {
      console.error('Failed to capture resonance moment:', error);
      return null;
    }
  }

  private async captureScreenshot(): Promise<string> {
    const canvas = await html2canvas(document.body, {
      backgroundColor: null,
      logging: false,
      useCORS: true
    });

    return canvas.toDataURL('image/png');
  }

  private calculateCurrentCoherence(): number {
    if (!this.lastBiometricSnapshot) return 0.5;

    let coherence = 0;
    let factors = 0;

    if (this.lastBiometricSnapshot.hrv !== undefined) {
      coherence += Math.min(this.lastBiometricSnapshot.hrv / 100, 1);
      factors++;
    }

    if (this.lastBiometricSnapshot.eegBands) {
      const { theta, alpha } = this.lastBiometricSnapshot.eegBands;
      coherence += (theta + alpha) / 2;
      factors++;
    }

    return factors > 0 ? coherence / factors : 0.5;
  }

  private getEmptyBiometricSnapshot(): BiometricStream {
    return {
      userId: this.currentUserId || 'unknown',
      timestamp: Date.now()
    };
  }

  private async storeMoment(moment: ResonanceMoment): Promise<void> {
    const { data, error } = await supabase
      .from('resonance_moments')
      .insert({
        id: moment.id,
        user_id: moment.userId,
        timestamp: new Date(moment.timestamp).toISOString(),
        coherence_score: moment.coherenceScore,
        screenshot: moment.screenshot,
        artpack_id: moment.artPackId,
        biometric_snapshot: moment.biometricSnapshot,
        emotional_tag: moment.emotionalTag,
        notes: moment.notes
      });

    if (error) {
      throw new Error(`Failed to store moment: ${error.message}`);
    }
  }

  private async getMoments(
    userId?: string,
    limit: number = 50
  ): Promise<ResonanceMoment[]> {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from('resonance_moments')
      .select('*')
      .eq('user_id', targetUserId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch moments:', error);
      return [];
    }

    return data.map(this.mapDbToMoment);
  }

  private async getMomentById(momentId: string): Promise<ResonanceMoment | null> {
    const { data, error } = await supabase
      .from('resonance_moments')
      .select('*')
      .eq('id', momentId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapDbToMoment(data);
  }

  private async searchMoments(query: {
    artPackId?: string;
    emotionalTag?: string;
    minCoherence?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ResonanceMoment[]> {
    if (!this.currentUserId) return [];

    let dbQuery = supabase
      .from('resonance_moments')
      .select('*')
      .eq('user_id', this.currentUserId);

    if (query.artPackId) {
      dbQuery = dbQuery.eq('artpack_id', query.artPackId);
    }

    if (query.emotionalTag) {
      dbQuery = dbQuery.eq('emotional_tag', query.emotionalTag);
    }

    if (query.minCoherence !== undefined) {
      dbQuery = dbQuery.gte('coherence_score', query.minCoherence);
    }

    if (query.startDate) {
      dbQuery = dbQuery.gte('timestamp', query.startDate.toISOString());
    }

    if (query.endDate) {
      dbQuery = dbQuery.lte('timestamp', query.endDate.toISOString());
    }

    const { data, error } = await dbQuery.order('timestamp', { ascending: false });

    if (error) {
      console.error('Failed to search moments:', error);
      return [];
    }

    return data.map(this.mapDbToMoment);
  }

  private async getMomentInsights(userId?: string): Promise<MomentInsights> {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) {
      return this.getEmptyInsights();
    }

    const moments = await this.getMoments(targetUserId, 1000);

    const packFrequency = new Map<string, number>();
    const emotionalTags = new Map<string, number>();
    let totalCoherence = 0;
    let peakCoherence = 0;

    moments.forEach(moment => {
      packFrequency.set(
        moment.artPackId,
        (packFrequency.get(moment.artPackId) || 0) + 1
      );

      if (moment.emotionalTag) {
        emotionalTags.set(
          moment.emotionalTag,
          (emotionalTags.get(moment.emotionalTag) || 0) + 1
        );
      }

      totalCoherence += moment.coherenceScore;
      peakCoherence = Math.max(peakCoherence, moment.coherenceScore);
    });

    const avgCoherence = moments.length > 0 ? totalCoherence / moments.length : 0;

    const favoritePack = Array.from(packFrequency.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const mostCommonEmotion = Array.from(emotionalTags.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalMoments: moments.length,
      avgCoherence,
      peakCoherence,
      favoritePack,
      mostCommonEmotion,
      packFrequency: Object.fromEntries(packFrequency),
      emotionalDistribution: Object.fromEntries(emotionalTags)
    };
  }

  private getEmptyInsights(): MomentInsights {
    return {
      totalMoments: 0,
      avgCoherence: 0,
      peakCoherence: 0,
      favoritePack: null,
      mostCommonEmotion: null,
      packFrequency: {},
      emotionalDistribution: {}
    };
  }

  private mapDbToMoment(data: any): ResonanceMoment {
    return {
      id: data.id,
      userId: data.user_id,
      timestamp: new Date(data.timestamp).getTime(),
      coherenceScore: data.coherence_score,
      screenshot: data.screenshot,
      artPackId: data.artpack_id,
      biometricSnapshot: data.biometric_snapshot,
      emotionalTag: data.emotional_tag,
      notes: data.notes
    };
  }
}

interface MomentInsights {
  totalMoments: number;
  avgCoherence: number;
  peakCoherence: number;
  favoritePack: string | null;
  mostCommonEmotion: string | null;
  packFrequency: Record<string, number>;
  emotionalDistribution: Record<string, number>;
}
