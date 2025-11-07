import { createClient } from '@supabase/supabase-js';
import { ConsciousnessPattern, ConsciousnessMetrics, CollectiveConsciousnessState, TelemetryAnalytics } from './types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export class PatternAnalytics {
  private knownPatterns: Map<string, ConsciousnessPattern> = new Map();

  constructor() {
    this.initializeKnownPatterns();
  }

  private initializeKnownPatterns() {
    const patterns: ConsciousnessPattern[] = [
      {
        id: 'coherence_cascade',
        name: 'Coherence Cascade',
        description: 'Rapid increase in group coherence indicating collective alignment',
        signature: [0.3, 0.5, 0.7, 0.9],
        confidence: 0,
        occurrences: 0,
        lastSeen: 0
      },
      {
        id: 'resonance_lock',
        name: 'Resonance Lock',
        description: 'Stable harmonic alignment between participants',
        signature: [0.8, 0.85, 0.87, 0.85, 0.8],
        confidence: 0,
        occurrences: 0,
        lastSeen: 0
      },
      {
        id: 'dimensional_shift',
        name: 'Dimensional Shift',
        description: 'Sudden expansion of multidimensional awareness',
        signature: [0.4, 0.4, 0.8, 0.9],
        confidence: 0,
        occurrences: 0,
        lastSeen: 0
      },
      {
        id: 'synergy_emergence',
        name: 'Synergy Emergence',
        description: 'Spontaneous increase in collective synergy above individual contributions',
        signature: [0.5, 0.6, 0.8, 1.0],
        confidence: 0,
        occurrences: 0,
        lastSeen: 0
      },
      {
        id: 'silence_deepening',
        name: 'Silence Deepening',
        description: 'Progressive increase in stillness and presence quality',
        signature: [0.5, 0.6, 0.75, 0.85, 0.9],
        confidence: 0,
        occurrences: 0,
        lastSeen: 0
      },
      {
        id: 'field_stabilization',
        name: 'Field Stabilization',
        description: 'Collective field reaches stable high-coherence state',
        signature: [0.7, 0.8, 0.85, 0.87, 0.86, 0.85],
        confidence: 0,
        occurrences: 0,
        lastSeen: 0
      }
    ];

    patterns.forEach(p => this.knownPatterns.set(p.id, p));
  }

  async analyzeSession(sessionId: string): Promise<TelemetryAnalytics> {
    const { data: metricsData } = await supabase
      .from('consciousness_metrics')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    const { data: collectiveData } = await supabase
      .from('collective_consciousness_states')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (!metricsData || !collectiveData || collectiveData.length === 0) {
      throw new Error('No telemetry data found for session');
    }

    const firstTimestamp = new Date(collectiveData[0].timestamp).getTime();
    const lastTimestamp = new Date(collectiveData[collectiveData.length - 1].timestamp).getTime();
    const duration = (lastTimestamp - firstTimestamp) / 1000;

    const coherenceEvolution = collectiveData.map(d => d.coherence_average || 0.5);
    const resonanceEvolution = collectiveData.map(d => d.resonance_harmonic_center || 1.0);
    const energyEvolution = collectiveData.map(d => d.energy_total_amplitude || 0);

    const detectedPatterns = this.detectPatterns({
      coherence: coherenceEvolution,
      resonance: resonanceEvolution,
      energy: energyEvolution
    });

    await this.savePatterns(sessionId, detectedPatterns);

    const insights = this.generateInsights(collectiveData, detectedPatterns);

    const participantCorrelations = new Map();

    const averageMetrics = this.calculateAverageMetrics(collectiveData);
    const peakMetrics = this.calculatePeakMetrics(collectiveData);

    return {
      sessionId,
      duration,
      totalSamples: collectiveData.length,
      averageMetrics: averageMetrics as any,
      peakMetrics: peakMetrics as any,
      patterns: detectedPatterns,
      insights,
      timeline: {
        coherenceEvolution,
        resonanceEvolution,
        energyEvolution
      },
      participantCorrelations
    };
  }

  private detectPatterns(timeSeries: {
    coherence: number[];
    resonance: number[];
    energy: number[];
  }): ConsciousnessPattern[] {
    const detected: ConsciousnessPattern[] = [];

    this.knownPatterns.forEach((pattern, id) => {
      const coherenceMatch = this.matchPattern(timeSeries.coherence, pattern.signature);
      const resonanceMatch = this.matchPattern(timeSeries.resonance, pattern.signature);

      const confidence = Math.max(coherenceMatch, resonanceMatch);

      if (confidence > 0.7) {
        const detectedPattern: ConsciousnessPattern = {
          ...pattern,
          confidence,
          occurrences: pattern.occurrences + 1,
          lastSeen: Date.now()
        };
        detected.push(detectedPattern);
      }
    });

    return detected;
  }

  private matchPattern(timeSeries: number[], signature: number[]): number {
    const windowSize = signature.length;
    let bestMatch = 0;

    for (let i = 0; i <= timeSeries.length - windowSize; i++) {
      const window = timeSeries.slice(i, i + windowSize);
      const similarity = this.calculateSimilarity(window, signature);
      bestMatch = Math.max(bestMatch, similarity);
    }

    return bestMatch;
  }

  private calculateSimilarity(series1: number[], series2: number[]): number {
    if (series1.length !== series2.length) return 0;

    let totalDiff = 0;
    for (let i = 0; i < series1.length; i++) {
      totalDiff += Math.abs(series1[i] - series2[i]);
    }

    const avgDiff = totalDiff / series1.length;
    return Math.max(0, 1 - avgDiff);
  }

  private async savePatterns(sessionId: string, patterns: ConsciousnessPattern[]): Promise<void> {
    if (patterns.length === 0) return;

    const { error } = await supabase
      .from('consciousness_patterns')
      .insert(
        patterns.map(p => ({
          session_id: sessionId,
          name: p.name,
          description: p.description,
          signature: p.signature,
          confidence: p.confidence,
          occurrences: p.occurrences,
          last_seen: new Date(p.lastSeen).toISOString()
        }))
      );

    if (error) {
      console.error('Failed to save patterns:', error);
    }
  }

  private generateInsights(
    collectiveData: any[],
    patterns: ConsciousnessPattern[]
  ): string[] {
    const insights: string[] = [];

    const avgCoherence = collectiveData.reduce((sum, d) => sum + (d.coherence_average || 0), 0) / collectiveData.length;
    if (avgCoherence > 0.8) {
      insights.push('Exceptional collective coherence maintained throughout session');
    } else if (avgCoherence > 0.6) {
      insights.push('Strong collective coherence achieved');
    } else if (avgCoherence < 0.4) {
      insights.push('Coherence remains dispersed - consider smaller groups or longer duration');
    }

    const avgSynergy = collectiveData.reduce((sum, d) => sum + (d.emergent_synergy_score || 0), 0) / collectiveData.length;
    if (avgSynergy > 0.7) {
      insights.push('High synergy: collective field exceeds sum of individual contributions');
    }

    const avgDimensionalExpansion = collectiveData.reduce((sum, d) => sum + (d.emergent_dimensional_expansion || 0), 0) / collectiveData.length;
    if (avgDimensionalExpansion > 0.7) {
      insights.push('Significant multidimensional awareness expansion detected');
    }

    patterns.forEach(pattern => {
      if (pattern.confidence > 0.8) {
        insights.push(`${pattern.name} detected with high confidence: ${pattern.description}`);
      }
    });

    const elementBalance = this.analyzeElementBalance(collectiveData);
    if (elementBalance.balanced) {
      insights.push('Elemental balance achieved - all four elements well represented');
    } else {
      insights.push(`Dominant element: ${elementBalance.dominant} (${(elementBalance.percentage * 100).toFixed(0)}%)`);
    }

    return insights;
  }

  private analyzeElementBalance(collectiveData: any[]): {
    balanced: boolean;
    dominant: string;
    percentage: number;
  } {
    if (collectiveData.length === 0) {
      return { balanced: true, dominant: 'balanced', percentage: 0.25 };
    }

    const latest = collectiveData[collectiveData.length - 1];
    const elements = {
      fire: latest.astro_element_fire || 0.25,
      earth: latest.astro_element_earth || 0.25,
      air: latest.astro_element_air || 0.25,
      water: latest.astro_element_water || 0.25
    };

    const maxElement = Object.entries(elements).reduce((a, b) => a[1] > b[1] ? a : b);
    const balanced = maxElement[1] < 0.4;

    return {
      balanced,
      dominant: maxElement[0],
      percentage: maxElement[1]
    };
  }

  private calculateAverageMetrics(collectiveData: any[]): Partial<ConsciousnessMetrics> {
    const count = collectiveData.length;
    if (count === 0) return {};

    const sum = collectiveData.reduce((acc, d) => ({
      coherence_average: acc.coherence_average + (d.coherence_average || 0),
      resonance_harmonic_center: acc.resonance_harmonic_center + (d.resonance_harmonic_center || 0),
      energy_total_amplitude: acc.energy_total_amplitude + (d.energy_total_amplitude || 0),
      emergent_synergy_score: acc.emergent_synergy_score + (d.emergent_synergy_score || 0),
      emergent_dimensional_expansion: acc.emergent_dimensional_expansion + (d.emergent_dimensional_expansion || 0)
    }), {
      coherence_average: 0,
      resonance_harmonic_center: 0,
      energy_total_amplitude: 0,
      emergent_synergy_score: 0,
      emergent_dimensional_expansion: 0
    });

    return {
      coherence: {
        personal: sum.coherence_average / count,
        withGroup: sum.coherence_average / count,
        withField: sum.coherence_average / count,
        stability: 0.5
      },
      resonance: {
        harmonicAlignment: sum.resonance_harmonic_center / count,
        gaaSync: 0.5,
        locationResonance: 0.5,
        elementalBalance: 0.5
      },
      energetic: {
        amplitude: sum.energy_total_amplitude / count,
        frequency: 432,
        phase: 0,
        waveform: 'sine'
      },
      dimensional: {
        depth: sum.emergent_dimensional_expansion / count,
        expansion: sum.emergent_dimensional_expansion / count,
        integration: 0.5,
        transcendence: 0.5
      }
    } as any;
  }

  private calculatePeakMetrics(collectiveData: any[]): Partial<ConsciousnessMetrics> {
    if (collectiveData.length === 0) return {};

    const peakCoherence = Math.max(...collectiveData.map(d => d.coherence_peak || 0));
    const peakEnergy = Math.max(...collectiveData.map(d => d.energy_total_amplitude || 0));
    const peakSynergy = Math.max(...collectiveData.map(d => d.emergent_synergy_score || 0));
    const peakDimensional = Math.max(...collectiveData.map(d => d.emergent_dimensional_expansion || 0));

    return {
      coherence: {
        personal: peakCoherence,
        withGroup: peakCoherence,
        withField: peakCoherence,
        stability: 1.0
      },
      energetic: {
        amplitude: peakEnergy,
        frequency: 432,
        phase: 0,
        waveform: 'sine'
      },
      collective: {
        influence: 1.0,
        receptivity: 1.0,
        contribution: 1.0,
        synergy: peakSynergy
      },
      dimensional: {
        depth: peakDimensional,
        expansion: peakDimensional,
        integration: 1.0,
        transcendence: 1.0
      }
    } as any;
  }

  async getSessionInsights(sessionId: string): Promise<string[]> {
    const { data: collectiveData } = await supabase
      .from('collective_consciousness_states')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    const { data: patternsData } = await supabase
      .from('consciousness_patterns')
      .select('*')
      .eq('session_id', sessionId);

    if (!collectiveData || collectiveData.length === 0) {
      return ['No telemetry data available for this session'];
    }

    const patterns = patternsData || [];
    return this.generateInsights(collectiveData, patterns as any);
  }
}
