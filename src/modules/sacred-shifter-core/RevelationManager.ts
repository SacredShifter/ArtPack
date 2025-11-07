import { createClient } from '@supabase/supabase-js';
import { ArchetypeLibrary } from './ArchetypeLibrary';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export enum RevelationPhase {
  RECOGNITION = 'recognition',
  REFLECTION = 'reflection',
  INTEGRATION = 'integration',
  REVELATION = 'revelation',
  SEAL = 'seal'
}

export interface PhaseTeaching {
  phase: RevelationPhase;
  caption: string;
  audioScript?: string;
  visualCue: string;
}

export class RevelationManager {
  private currentPhase: RevelationPhase = RevelationPhase.RECOGNITION;
  private phaseStartTime: number = Date.now();
  private sessionId: string;
  private userId: string;

  private coherenceHistory: number[] = [];
  private residualHistory: number[] = [];

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.recordPhaseEntry(RevelationPhase.RECOGNITION);
  }

  update(metrics: {
    coherence: number;
    complexity: number;
    polarity: number;
    residual: number;
    uncertainty: number;
  }): PhaseTeaching | null {
    this.coherenceHistory.push(metrics.coherence);
    this.residualHistory.push(metrics.residual);

    if (this.coherenceHistory.length > 30) {
      this.coherenceHistory.shift();
      this.residualHistory.shift();
    }

    const transition = this.checkPhaseTransition(metrics);

    if (transition) {
      this.recordPhaseEntry(transition.nextPhase, transition.trigger, transition.value);
      this.currentPhase = transition.nextPhase;
      this.phaseStartTime = Date.now();

      return this.getTeachingForPhase(transition.nextPhase, metrics);
    }

    return null;
  }

  private checkPhaseTransition(metrics: any): {
    nextPhase: RevelationPhase;
    trigger: string;
    value: number;
  } | null {
    const timeInPhase = (Date.now() - this.phaseStartTime) / 1000;

    switch (this.currentPhase) {
      case RevelationPhase.RECOGNITION:
        if (metrics.coherence >= 0.6 && timeInPhase >= 10) {
          return {
            nextPhase: RevelationPhase.REFLECTION,
            trigger: 'coherence_sustained',
            value: metrics.coherence
          };
        }
        break;

      case RevelationPhase.REFLECTION:
        const avgCoherence = this.average(this.coherenceHistory);
        const residualFalling = this.isDecreasing(this.residualHistory);

        if (avgCoherence >= 0.6 && residualFalling && timeInPhase >= 15) {
          return {
            nextPhase: RevelationPhase.INTEGRATION,
            trigger: 'tension_resolving',
            value: metrics.residual
          };
        }
        break;

      case RevelationPhase.INTEGRATION:
        if (metrics.coherence > 0.85 && metrics.uncertainty < 0.4 && timeInPhase >= 10) {
          return {
            nextPhase: RevelationPhase.REVELATION,
            trigger: 'high_coherence_low_uncertainty',
            value: metrics.coherence
          };
        }
        break;

      case RevelationPhase.REVELATION:
        if (timeInPhase >= 20) {
          return {
            nextPhase: RevelationPhase.SEAL,
            trigger: 'revelation_sustained',
            value: timeInPhase
          };
        }
        break;
    }

    return null;
  }

  private getTeachingForPhase(phase: RevelationPhase, metrics: any): PhaseTeaching {
    const teachings: Record<RevelationPhase, PhaseTeaching> = {
      [RevelationPhase.RECOGNITION]: {
        phase,
        caption: 'Notice how your rhythm finds symmetry.',
        audioScript: 'Breathe. Watch the field respond to your presence.',
        visualCue: 'visible_mandala_only'
      },
      [RevelationPhase.REFLECTION]: {
        phase,
        caption: 'Every asymmetry you see is a pressure asking to be known.',
        audioScript: 'The unseen becomes visible. Observe without judgment.',
        visualCue: 'unseen_layer_fades_in'
      },
      [RevelationPhase.INTEGRATION]: {
        phase,
        caption: 'Tension can resolve into pattern when met with attention.',
        audioScript: 'Feel the geometry shifting. Your awareness shapes the field.',
        visualCue: 'forms_morph_toward_balance'
      },
      [RevelationPhase.REVELATION]: {
        phase,
        caption: 'Integration reveals new dimension.',
        audioScript: 'You have arrived. This form is your current truth.',
        visualCue: 'lift_to_3d_light_through'
      },
      [RevelationPhase.SEAL]: {
        phase,
        caption: 'This form records the harmony you generated. Re-view it to retrain the same pattern.',
        audioScript: 'Your sigil is complete. Return to it whenever you wish to remember this state.',
        visualCue: 'freeze_export_sigil'
      }
    };

    return teachings[phase];
  }

  getCurrentPhase(): RevelationPhase {
    return this.currentPhase;
  }

  getTimeInPhase(): number {
    return (Date.now() - this.phaseStartTime) / 1000;
  }

  shouldShowUnseenLayer(): boolean {
    return this.currentPhase !== RevelationPhase.RECOGNITION;
  }

  shouldMorphForms(): boolean {
    return (
      this.currentPhase === RevelationPhase.INTEGRATION ||
      this.currentPhase === RevelationPhase.REVELATION
    );
  }

  shouldLiftTo3D(): boolean {
    return (
      this.currentPhase === RevelationPhase.REVELATION ||
      this.currentPhase === RevelationPhase.SEAL
    );
  }

  shouldFreeze(): boolean {
    return this.currentPhase === RevelationPhase.SEAL;
  }

  getVisualizationCues(metrics: any): string[] {
    const cues: string[] = [];

    if (metrics.coherence > 0.7) {
      cues.push('Pulses aligning - coherence building');
    }

    if (metrics.complexity > 0.6) {
      cues.push(`${Math.round(3 + 9 * metrics.complexity)} forces active`);
    }

    if (Math.abs(metrics.polarity - 0.5) < 0.1) {
      cues.push('Opposites balanced');
    }

    if (metrics.residual > 0.5 && this.currentPhase === RevelationPhase.REFLECTION) {
      cues.push('Tension visible - opportunity for integration');
    }

    if (metrics.uncertainty > 0.6) {
      cues.push('Uncertainty present - possibility field open');
    }

    return cues;
  }

  private async recordPhaseEntry(
    phase: RevelationPhase,
    triggerMetric?: string,
    triggerValue?: number
  ) {
    const { error } = await supabase.from('revelation_phases').insert({
      session_id: this.sessionId,
      user_id: this.userId,
      phase_name: phase,
      entered_at: new Date().toISOString(),
      trigger_metric: triggerMetric,
      trigger_value: triggerValue,
      teaching_shown: this.getTeachingForPhase(phase, {}).caption
    });

    if (error) {
      console.error('Failed to record phase entry:', error);
    }
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private isDecreasing(values: number[]): boolean {
    if (values.length < 5) return false;

    const recent = values.slice(-5);
    let decreasingCount = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i] < recent[i - 1]) decreasingCount++;
    }

    return decreasingCount >= 3;
  }

  async getPhaseHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('revelation_phases')
      .select('*')
      .eq('session_id', this.sessionId)
      .eq('user_id', this.userId)
      .order('entered_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch phase history:', error);
      return [];
    }

    return data || [];
  }
}
