import { CosmicSignature } from '../sacred-shifter-core/CosmicSignatureEncoder';
import { GAAState } from '../sacred-shifter-core/types';
import { PredictedState, ObservedState } from './types';

const NORMALIZER = 2.0;

export class ResidualEngine {
  static computePredicted(
    signature: CosmicSignature,
    gaaState: GAAState
  ): PredictedState {
    const expectedAmplitude = signature.amplitude * signature.cosmic.locationResonance;

    const expectedCoherence = signature.cosmic.gaaAlignment.phaseSync *
                              signature.cosmic.locationResonance;

    const expectedPhase = gaaState.phase;

    const elementTempoMap: Record<string, number> = {
      fire: 1.5,
      air: 1.25,
      earth: 1.0,
      water: 0.75
    };
    const expectedTempo = 60 * elementTempoMap[signature.astrology.element] || 60;

    return {
      expectedAmplitude,
      expectedCoherence,
      expectedPhase,
      expectedTempo
    };
  }

  static computeResidual(predicted: PredictedState, observed: ObservedState): number {
    const pred = [
      predicted.expectedAmplitude,
      predicted.expectedCoherence,
      predicted.expectedPhase,
      predicted.expectedTempo / 100
    ];

    const obs = [
      observed.actualAmplitude,
      observed.actualCoherence,
      observed.actualPhase,
      observed.actualTempo / 100
    ];

    let sumSquaredDiff = 0;
    for (let i = 0; i < pred.length; i++) {
      const diff = obs[i] - pred[i];
      sumSquaredDiff += diff * diff;
    }

    const residual = Math.sqrt(sumSquaredDiff) / NORMALIZER;
    return Math.min(1.0, residual);
  }

  static interpretResidual(residual: number): {
    magnitude: number;
    category: string;
    meaning: string;
  } {
    if (residual < 0.2) {
      return {
        magnitude: residual,
        category: 'aligned',
        meaning: 'Behavior matches cosmic signature closely'
      };
    } else if (residual < 0.5) {
      return {
        magnitude: residual,
        category: 'moderate',
        meaning: 'Some divergence from expected pattern'
      };
    } else if (residual < 0.7) {
      return {
        magnitude: residual,
        category: 'significant',
        meaning: 'Notable tension between signature and expression'
      };
    } else {
      return {
        magnitude: residual,
        category: 'high',
        meaning: 'Strong unseen pressures or unintegrated aspects'
      };
    }
  }

  static residualVector(predicted: PredictedState, observed: ObservedState): {
    amplitude: number;
    coherence: number;
    phase: number;
    tempo: number;
  } {
    return {
      amplitude: observed.actualAmplitude - predicted.expectedAmplitude,
      coherence: observed.actualCoherence - predicted.expectedCoherence,
      phase: this.wrapPhase(observed.actualPhase - predicted.expectedPhase),
      tempo: observed.actualTempo - predicted.expectedTempo
    };
  }

  private static wrapPhase(phase: number): number {
    while (phase > Math.PI) phase -= 2 * Math.PI;
    while (phase < -Math.PI) phase += 2 * Math.PI;
    return phase;
  }
}
