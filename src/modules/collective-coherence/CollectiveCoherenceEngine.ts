import type { IModule, ModuleManifest, GlobalEventHorizon, CoherenceSample, BiometricStream } from '../../core/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class CollectiveCoherenceEngine implements IModule {
  readonly manifest: ModuleManifest = {
    id: 'collective-coherence-engine',
    name: 'Collective Coherence Engine',
    version: '1.0.0',
    essenceLabels: ['collective', 'coherence', 'biometric', 'real-time', 'synchronization'],
    capabilities: [
      'aggregate-biometric-streams',
      'calculate-group-coherence',
      'detect-field-emergence',
      'synchronize-experiences'
    ],
    telosAlignment: [
      'enhance-collective-field',
      'facilitate-transcendence',
      'guide-ceremonial-experiences'
    ],
    dependencies: [],
    resourceFootprintMB: 8,
    integrityScore: 96
  };

  private geh: GlobalEventHorizon | null = null;
  private activeSessions: Map<string, CollectiveSession> = new Map();
  private biometricStreams: Map<string, BiometricStream> = new Map();
  private coherenceUpdateInterval: number | null = null;

  async initialize(geh: GlobalEventHorizon): Promise<void> {
    this.geh = geh;

    this.geh.subscribe('biometric-stream-received', this.handleBiometricStream.bind(this));
    this.geh.subscribe('session-joined', this.handleSessionJoined.bind(this));
    this.geh.subscribe('session-left', this.handleSessionLeft.bind(this));

    this.geh.publish({
      type: 'collective-coherence-initialized',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['system', 'lifecycle', 'collective'],
      payload: { ready: true }
    });
  }

  async activate(): Promise<void> {
    this.startCoherenceCalculation();

    this.geh?.publish({
      type: 'collective-coherence-activated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle', 'collective'],
      payload: { calculating: true }
    });
  }

  async deactivate(): Promise<void> {
    this.stopCoherenceCalculation();

    this.geh?.publish({
      type: 'collective-coherence-deactivated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle'],
      payload: { calculating: false }
    });
  }

  async destroy(): Promise<void> {
    await this.deactivate();
    this.activeSessions.clear();
    this.biometricStreams.clear();
    this.geh = null;
  }

  getExposedItems(): Record<string, any> {
    return {
      createSession: this.createSession.bind(this),
      getSessionCoherence: this.getSessionCoherence.bind(this),
      getActiveSessionCount: () => this.activeSessions.size
    };
  }

  private async handleBiometricStream(event: any): Promise<void> {
    const stream: BiometricStream = event.payload.stream;
    this.biometricStreams.set(stream.userId, stream);

    const session = this.findSessionForUser(stream.userId);
    if (session) {
      await this.updateSessionCoherence(session);
    }
  }

  private handleSessionJoined(event: any): void {
    const { sessionId, userId } = event.payload;
    const session = this.activeSessions.get(sessionId);

    if (session) {
      session.participants.add(userId);

      this.geh?.publish({
        type: 'session-participant-joined',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['collective', 'session'],
        payload: {
          sessionId,
          userId,
          participantCount: session.participants.size
        }
      });
    }
  }

  private handleSessionLeft(event: any): void {
    const { sessionId, userId } = event.payload;
    const session = this.activeSessions.get(sessionId);

    if (session) {
      session.participants.delete(userId);

      if (session.participants.size === 0) {
        this.activeSessions.delete(sessionId);
      }

      this.geh?.publish({
        type: 'session-participant-left',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['collective', 'session'],
        payload: {
          sessionId,
          userId,
          participantCount: session.participants.size
        }
      });
    }
  }

  private createSession(sessionId: string, facilitatorId: string): void {
    const session: CollectiveSession = {
      id: sessionId,
      facilitatorId,
      participants: new Set([facilitatorId]),
      startTime: Date.now(),
      groupCoherence: 0,
      coherenceHistory: [],
      emergenceDetected: false
    };

    this.activeSessions.set(sessionId, session);

    this.geh?.publish({
      type: 'collective-session-created',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['collective', 'session', 'lifecycle'],
      payload: { sessionId, facilitatorId }
    });
  }

  private findSessionForUser(userId: string): CollectiveSession | undefined {
    for (const session of this.activeSessions.values()) {
      if (session.participants.has(userId)) {
        return session;
      }
    }
    return undefined;
  }

  private async updateSessionCoherence(session: CollectiveSession): Promise<void> {
    const participantStreams = Array.from(session.participants)
      .map(userId => this.biometricStreams.get(userId))
      .filter((stream): stream is BiometricStream => stream !== undefined);

    if (participantStreams.length < 2) return;

    const groupCoherence = this.calculateGroupCoherence(participantStreams);
    session.groupCoherence = groupCoherence.score;
    session.coherenceHistory.push({
      timestamp: Date.now(),
      score: groupCoherence.score
    });

    if (session.coherenceHistory.length > 1000) {
      session.coherenceHistory.shift();
    }

    if (groupCoherence.score > 0.85 && !session.emergenceDetected) {
      session.emergenceDetected = true;

      this.geh?.publish({
        type: 'field-emergence-detected',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['collective', 'peak-state', 'emergence'],
        payload: {
          sessionId: session.id,
          coherenceScore: groupCoherence.score,
          participantCount: session.participants.size
        },
        resonanceSignature: 95
      });
    }

    this.geh?.publish({
      type: 'group-coherence-updated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['collective', 'coherence', 'real-time'],
      payload: {
        sessionId: session.id,
        groupCoherence: groupCoherence.score,
        individualCoherences: groupCoherence.individual,
        synchronizationIndex: groupCoherence.syncIndex
      }
    });

    await this.storeCoherenceData(session, groupCoherence);
  }

  private calculateGroupCoherence(streams: BiometricStream[]): GroupCoherence {
    const individual: number[] = [];
    let totalCoherence = 0;

    streams.forEach(stream => {
      const coherence = this.calculateIndividualCoherence(stream);
      individual.push(coherence);
      totalCoherence += coherence;
    });

    const avgCoherence = totalCoherence / streams.length;

    const syncIndex = this.calculateSynchronizationIndex(streams);

    const score = (avgCoherence * 0.7) + (syncIndex * 0.3);

    return {
      score: Math.min(score, 1),
      individual,
      syncIndex
    };
  }

  private calculateIndividualCoherence(stream: BiometricStream): number {
    let coherence = 0;
    let factors = 0;

    if (stream.hrv !== undefined) {
      coherence += this.normalizeHRV(stream.hrv);
      factors++;
    }

    if (stream.breathRate !== undefined) {
      coherence += this.normalizeBreathRate(stream.breathRate);
      factors++;
    }

    if (stream.eegBands) {
      const { theta, alpha } = stream.eegBands;
      coherence += (theta + alpha) / 2;
      factors++;
    }

    return factors > 0 ? coherence / factors : 0;
  }

  private normalizeHRV(hrv: number): number {
    return Math.min(hrv / 100, 1);
  }

  private normalizeBreathRate(breathRate: number): number {
    const optimalRate = 6;
    const deviation = Math.abs(breathRate - optimalRate);
    return Math.max(0, 1 - (deviation / optimalRate));
  }

  private calculateSynchronizationIndex(streams: BiometricStream[]): number {
    if (streams.length < 2) return 0;

    const heartRates = streams
      .map(s => s.heartRate)
      .filter((hr): hr is number => hr !== undefined);

    if (heartRates.length < 2) return 0;

    const avgHeartRate = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
    const deviations = heartRates.map(hr => Math.abs(hr - avgHeartRate));
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

    const syncIndex = Math.max(0, 1 - (avgDeviation / 30));

    return syncIndex;
  }

  private startCoherenceCalculation(): void {
    this.coherenceUpdateInterval = window.setInterval(() => {
      this.activeSessions.forEach(session => {
        this.updateSessionCoherence(session);
      });
    }, 1000);
  }

  private stopCoherenceCalculation(): void {
    if (this.coherenceUpdateInterval !== null) {
      clearInterval(this.coherenceUpdateInterval);
      this.coherenceUpdateInterval = null;
    }
  }

  private getSessionCoherence(sessionId: string): number {
    const session = this.activeSessions.get(sessionId);
    return session?.groupCoherence || 0;
  }

  private async storeCoherenceData(session: CollectiveSession, coherence: GroupCoherence): Promise<void> {
    try {
      await supabase.from('collective_coherence_samples').insert({
        session_id: session.id,
        timestamp: new Date().toISOString(),
        group_coherence: coherence.score,
        participant_count: session.participants.size,
        synchronization_index: coherence.syncIndex,
        individual_coherences: coherence.individual
      });
    } catch (error) {
      console.error('Failed to store coherence data:', error);
    }
  }
}

interface CollectiveSession {
  id: string;
  facilitatorId: string;
  participants: Set<string>;
  startTime: number;
  groupCoherence: number;
  coherenceHistory: Array<{ timestamp: number; score: number }>;
  emergenceDetected: boolean;
}

interface GroupCoherence {
  score: number;
  individual: number[];
  syncIndex: number;
}
