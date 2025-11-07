import { createClient } from '@supabase/supabase-js';
import { ConsciousnessMetrics, CollectiveConsciousnessState, ConsciousnessEvent, ConsciousnessEventType } from './types';
import { CosmicSignature } from '../sacred-shifter-core/CosmicSignatureEncoder';
import { GAAState } from '../sacred-shifter-core/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export class TelemetryEngine {
  private sessionId: string;
  private samplingInterval: number = 1000;
  private intervalId: number | null = null;
  private eventBuffer: ConsciousnessEvent[] = [];
  private lastCollectiveState: CollectiveConsciousnessState | null = null;

  constructor(sessionId: string, samplingRateHz: number = 1) {
    this.sessionId = sessionId;
    this.samplingInterval = 1000 / samplingRateHz;
  }

  start() {
    if (this.intervalId !== null) return;

    this.intervalId = window.setInterval(() => {
      this.flushEventBuffer();
    }, 5000);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.flushEventBuffer();
  }

  async captureMetrics(
    participantId: string,
    cosmicSignature: CosmicSignature,
    gaaState: GAAState,
    visualState: {
      amplitude: number;
      coherence: number;
      stillness: number;
    }
  ): Promise<void> {
    const metrics = this.calculateMetrics(
      participantId,
      cosmicSignature,
      gaaState,
      visualState
    );

    const { error } = await supabase
      .from('consciousness_metrics')
      .insert({
        session_id: this.sessionId,
        participant_id: participantId,
        timestamp: new Date().toISOString(),

        coherence_personal: metrics.coherence.personal,
        coherence_group: metrics.coherence.withGroup,
        coherence_field: metrics.coherence.withField,
        coherence_stability: metrics.coherence.stability,

        presence_quality: metrics.presence.quality,
        presence_depth: metrics.presence.depth,
        presence_continuity: metrics.presence.continuity,
        presence_witnessing: metrics.presence.witnessing,

        resonance_harmonic: metrics.resonance.harmonicAlignment,
        resonance_gaa_sync: metrics.resonance.gaaSync,
        resonance_location: metrics.resonance.locationResonance,
        resonance_elemental: metrics.resonance.elementalBalance,

        attention_focus: metrics.attention.focus,
        attention_dispersion: metrics.attention.dispersion,
        attention_shift_rate: metrics.attention.shiftRate,
        attention_centeredness: metrics.attention.centeredness,

        energetic_amplitude: metrics.energetic.amplitude,
        energetic_frequency: metrics.energetic.frequency,
        energetic_phase: metrics.energetic.phase,
        energetic_waveform: metrics.energetic.waveform,

        emotional_valence: metrics.emotional.valence,
        emotional_arousal: metrics.emotional.arousal,
        emotional_dominance: metrics.emotional.dominance,
        emotional_flow: metrics.emotional.flow,

        collective_influence: metrics.collective.influence,
        collective_receptivity: metrics.collective.receptivity,
        collective_contribution: metrics.collective.contribution,
        collective_synergy: metrics.collective.synergy,

        dimensional_depth: metrics.dimensional.depth,
        dimensional_expansion: metrics.dimensional.expansion,
        dimensional_integration: metrics.dimensional.integration,
        dimensional_transcendence: metrics.dimensional.transcendence
      });

    if (error) {
      console.error('Failed to capture consciousness metrics:', error);
    }
  }

  private calculateMetrics(
    participantId: string,
    cosmicSignature: CosmicSignature,
    gaaState: GAAState,
    visualState: any
  ): ConsciousnessMetrics {
    const timestamp = Date.now();

    const coherence = {
      personal: cosmicSignature.cosmic.gaaAlignment.phaseSync,
      withGroup: visualState.coherence,
      withField: cosmicSignature.cosmic.locationResonance,
      stability: this.calculateCoherenceStability(cosmicSignature)
    };

    const presence = {
      quality: visualState.stillness,
      depth: cosmicSignature.cosmic.multidimensionalDepth,
      continuity: visualState.amplitude,
      witnessing: this.calculateWitnessing(cosmicSignature, visualState)
    };

    const resonance = {
      harmonicAlignment: cosmicSignature.cosmic.gaaAlignment.harmonicRatio,
      gaaSync: cosmicSignature.cosmic.gaaAlignment.phaseSync,
      locationResonance: cosmicSignature.cosmic.locationResonance,
      elementalBalance: this.calculateElementalBalance(cosmicSignature)
    };

    const attention = {
      focus: visualState.coherence * visualState.stillness,
      dispersion: 1.0 - (visualState.coherence * visualState.stillness),
      shiftRate: Math.abs(gaaState.lfo),
      centeredness: cosmicSignature.positionRadius < 0.5 ? 1.0 : 0.5
    };

    const energetic = {
      amplitude: visualState.amplitude,
      frequency: cosmicSignature.cosmic.gaaAlignment.personalFrequency,
      phase: gaaState.phase,
      waveform: 'sine'
    };

    const emotional = {
      valence: this.inferValence(cosmicSignature),
      arousal: visualState.amplitude,
      dominance: cosmicSignature.amplitude,
      flow: visualState.coherence
    };

    const collective = {
      influence: cosmicSignature.amplitude * cosmicSignature.blendWeight,
      receptivity: cosmicSignature.cosmic.locationResonance,
      contribution: this.calculateContribution(cosmicSignature),
      synergy: this.calculateSynergy(cosmicSignature)
    };

    const dimensional = {
      depth: cosmicSignature.cosmic.multidimensionalDepth,
      expansion: cosmicSignature.cosmic.transitInfluence.intensity,
      integration: this.calculateIntegration(cosmicSignature),
      transcendence: this.calculateTranscendence(cosmicSignature, visualState)
    };

    return {
      timestamp,
      sessionId: this.sessionId,
      participantId,
      coherence,
      presence,
      resonance,
      attention,
      energetic,
      emotional,
      collective,
      dimensional
    };
  }

  async captureCollectiveState(
    signatures: CosmicSignature[],
    gaaState: GAAState,
    visualState: any
  ): Promise<void> {
    if (signatures.length === 0) return;

    const collectiveState = this.calculateCollectiveState(signatures, gaaState, visualState);
    this.lastCollectiveState = collectiveState;

    const { error } = await supabase
      .from('collective_consciousness_states')
      .insert({
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        participant_count: collectiveState.participantCount,

        coherence_average: collectiveState.coherenceField.average,
        coherence_variance: collectiveState.coherenceField.variance,
        coherence_peak: collectiveState.coherenceField.peak,
        coherence_momentum: collectiveState.coherenceField.momentum,

        resonance_harmonic_center: collectiveState.resonanceField.harmonicCenter,
        resonance_spread: collectiveState.resonanceField.spread,
        resonance_stability: collectiveState.resonanceField.stability,
        resonance_clarity: collectiveState.resonanceField.clarity,

        energy_total_amplitude: collectiveState.energyField.totalAmplitude,
        energy_dominant_frequency: collectiveState.energyField.dominantFrequency,
        energy_phase_alignment: collectiveState.energyField.phaseAlignment,
        energy_wave_coherence: collectiveState.energyField.waveCoherence,

        attention_collective_focus: collectiveState.attentionField.collectiveFocus,
        attention_distribution_pattern: collectiveState.attentionField.distributionPattern,
        attention_center_x: collectiveState.attentionField.centerOfMass[0],
        attention_center_y: collectiveState.attentionField.centerOfMass[1],
        attention_radius: collectiveState.attentionField.radius,

        emergent_synergy_score: collectiveState.emergentProperties.synergyScore,
        emergent_field_stability: collectiveState.emergentProperties.fieldStability,
        emergent_evolution_rate: collectiveState.emergentProperties.evolutionRate,
        emergent_dimensional_expansion: collectiveState.emergentProperties.dimensionalExpansion,

        astro_transit_intensity: collectiveState.astrologicalInfluence.transitIntensity,
        astro_aspect_activation: collectiveState.astrologicalInfluence.aspectActivation,
        astro_element_fire: collectiveState.astrologicalInfluence.elementalBalance.fire,
        astro_element_earth: collectiveState.astrologicalInfluence.elementalBalance.earth,
        astro_element_air: collectiveState.astrologicalInfluence.elementalBalance.air,
        astro_element_water: collectiveState.astrologicalInfluence.elementalBalance.water
      });

    if (error) {
      console.error('Failed to capture collective state:', error);
    }
  }

  private calculateCollectiveState(
    signatures: CosmicSignature[],
    gaaState: GAAState,
    visualState: any
  ): CollectiveConsciousnessState {
    const timestamp = Date.now();
    const count = signatures.length;

    const coherenceValues = signatures.map(s => s.cosmic.gaaAlignment.phaseSync);
    const coherenceField = {
      average: coherenceValues.reduce((a, b) => a + b, 0) / count,
      variance: this.calculateVariance(coherenceValues),
      peak: Math.max(...coherenceValues),
      momentum: this.calculateMomentum(coherenceValues)
    };

    const harmonicRatios = signatures.map(s => s.cosmic.gaaAlignment.harmonicRatio);
    const resonanceField = {
      harmonicCenter: harmonicRatios.reduce((a, b) => a + b, 0) / count,
      spread: Math.max(...harmonicRatios) - Math.min(...harmonicRatios),
      stability: 1.0 - this.calculateVariance(harmonicRatios),
      clarity: visualState.coherence || 0.7
    };

    const amplitudes = signatures.map(s => s.amplitude);
    const frequencies = signatures.map(s => s.cosmic.gaaAlignment.personalFrequency);
    const energyField = {
      totalAmplitude: amplitudes.reduce((a, b) => a + b, 0),
      dominantFrequency: this.findDominantFrequency(frequencies),
      phaseAlignment: gaaState.phase,
      waveCoherence: visualState.coherence || 0.7
    };

    const positions = signatures.map(s => ({
      x: Math.cos(s.positionAngle * Math.PI / 180) * s.positionRadius,
      y: Math.sin(s.positionAngle * Math.PI / 180) * s.positionRadius
    }));
    const centerOfMass = this.calculateCenterOfMass(positions);
    const attentionField = {
      collectiveFocus: visualState.coherence * visualState.stillness || 0.5,
      distributionPattern: count <= 50 ? 'clustered' : 'distributed',
      centerOfMass: [centerOfMass.x, centerOfMass.y] as [number, number],
      radius: this.calculateRadius(positions, centerOfMass)
    };

    const synergyScores = signatures.map(s => {
      let totalSynergy = 0;
      let connections = 0;
      s.synastry.forEach(conn => {
        totalSynergy += conn.compatibility;
        connections++;
      });
      return connections > 0 ? totalSynergy / connections : 0.5;
    });

    const emergentProperties = {
      synergyScore: synergyScores.reduce((a, b) => a + b, 0) / count,
      fieldStability: 1.0 - this.calculateVariance(coherenceValues),
      evolutionRate: Math.abs(coherenceField.momentum),
      dimensionalExpansion: signatures.reduce((sum, s) => sum + s.cosmic.multidimensionalDepth, 0) / count
    };

    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
    let totalTransit = 0;
    let totalAspects = 0;

    signatures.forEach(s => {
      elementCounts[s.astrology.element]++;
      totalTransit += s.cosmic.transitInfluence.intensity;
      totalAspects += s.aspects.length;
    });

    const astrologicalInfluence = {
      transitIntensity: totalTransit / count,
      aspectActivation: (totalAspects / count) / 20,
      elementalBalance: {
        fire: elementCounts.fire / count,
        earth: elementCounts.earth / count,
        air: elementCounts.air / count,
        water: elementCounts.water / count
      }
    };

    return {
      sessionId: this.sessionId,
      timestamp,
      participantCount: count,
      coherenceField,
      resonanceField,
      energyField,
      attentionField,
      emergentProperties,
      astrologicalInfluence
    };
  }

  recordEvent(
    type: ConsciousnessEventType,
    intensity: number,
    participantId?: string,
    metadata?: Record<string, any>
  ): void {
    const event: ConsciousnessEvent = {
      id: crypto.randomUUID(),
      sessionId: this.sessionId,
      participantId,
      timestamp: Date.now(),
      type,
      intensity,
      metadata: metadata || {}
    };

    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= 10) {
      this.flushEventBuffer();
    }
  }

  private async flushEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    const { error } = await supabase
      .from('consciousness_events')
      .insert(
        events.map(e => ({
          session_id: e.sessionId,
          participant_id: e.participantId,
          timestamp: new Date(e.timestamp).toISOString(),
          event_type: e.type,
          intensity: e.intensity,
          metadata: e.metadata
        }))
      );

    if (error) {
      console.error('Failed to flush consciousness events:', error);
      this.eventBuffer.push(...events);
    }
  }

  private calculateCoherenceStability(signature: CosmicSignature): number {
    return signature.cosmic.gaaAlignment.phaseSync * signature.cosmic.locationResonance;
  }

  private calculateWitnessing(signature: CosmicSignature, visualState: any): number {
    return (signature.cosmic.multidimensionalDepth + visualState.stillness) / 2;
  }

  private calculateElementalBalance(signature: CosmicSignature): number {
    return signature.astrology.elementIntensity;
  }

  private inferValence(signature: CosmicSignature): number {
    const positiveElements = ['fire', 'air'];
    return positiveElements.includes(signature.astrology.element) ? 0.3 : -0.3;
  }

  private calculateContribution(signature: CosmicSignature): number {
    return signature.amplitude * signature.blendWeight;
  }

  private calculateSynergy(signature: CosmicSignature): number {
    let totalCompatibility = 0;
    let count = 0;
    signature.synastry.forEach(conn => {
      totalCompatibility += conn.compatibility;
      count++;
    });
    return count > 0 ? totalCompatibility / count : 0.5;
  }

  private calculateIntegration(signature: CosmicSignature): number {
    const hasBalancedElements = signature.astrology.elementIntensity > 0.4 && signature.astrology.elementIntensity < 0.6;
    const hasConnections = signature.synastry.size > 0;
    return (hasBalancedElements ? 0.5 : 0) + (hasConnections ? 0.5 : 0);
  }

  private calculateTranscendence(signature: CosmicSignature, visualState: any): number {
    return signature.cosmic.multidimensionalDepth * visualState.stillness;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateMomentum(values: number[]): number {
    if (values.length < 2) return 0;
    return values[values.length - 1] - values[values.length - 2];
  }

  private findDominantFrequency(frequencies: number[]): number {
    const histogram = new Map<number, number>();
    frequencies.forEach(f => {
      const rounded = Math.round(f / 10) * 10;
      histogram.set(rounded, (histogram.get(rounded) || 0) + 1);
    });
    let maxCount = 0;
    let dominant = 432;
    histogram.forEach((count, freq) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = freq;
      }
    });
    return dominant;
  }

  private calculateCenterOfMass(positions: { x: number; y: number }[]): { x: number; y: number } {
    const sum = positions.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / positions.length, y: sum.y / positions.length };
  }

  private calculateRadius(positions: { x: number; y: number }[], center: { x: number; y: number }): number {
    const distances = positions.map(p => Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2)));
    return distances.reduce((a, b) => a + b, 0) / distances.length;
  }
}
