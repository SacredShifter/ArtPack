import { CosmicSignature } from '../sacred-shifter-core/CosmicSignatureEncoder';
import { GAAState } from '../sacred-shifter-core/types';

export class PhaseEngine {
  static wrapPhase(phase: number): number {
    while (phase > Math.PI) phase -= 2 * Math.PI;
    while (phase < -Math.PI) phase += 2 * Math.PI;
    return phase;
  }

  static normalizeToZeroOne(radians: number): number {
    const wrapped = this.wrapPhase(radians);
    return Math.abs(wrapped) / Math.PI;
  }

  static computePhaseErrorNatal(
    signature: CosmicSignature,
    observedPhase: number
  ): number {
    const sunDegree = signature.astrology.sunHue;
    const natalPhase = (sunDegree / 360) * 2 * Math.PI;

    const error = this.wrapPhase(natalPhase - observedPhase);
    return this.normalizeToZeroOne(error);
  }

  static computePhaseErrorTransit(
    signature: CosmicSignature,
    observedPhase: number
  ): number {
    if (!signature.cosmic.currentTransits) return 0.5;

    const transitSunDegree = signature.cosmic.currentTransits.sunDegree;
    const transitPhase = (transitSunDegree / 360) * 2 * Math.PI;

    const error = this.wrapPhase(transitPhase - observedPhase);
    return this.normalizeToZeroOne(error);
  }

  static computePhaseErrorGAA(
    gaaState: GAAState,
    observedPhase: number
  ): number {
    const gaaPhase = gaaState.phase * 2 * Math.PI;

    const error = this.wrapPhase(gaaPhase - observedPhase);
    return this.normalizeToZeroOne(error);
  }

  static interpretPhaseError(error: number): {
    magnitude: number;
    category: string;
    meaning: string;
  } {
    if (error < 0.15) {
      return {
        magnitude: error,
        category: 'aligned',
        meaning: 'In phase with source'
      };
    } else if (error < 0.35) {
      return {
        magnitude: error,
        category: 'drift',
        meaning: 'Slight phase drift present'
      };
    } else if (error < 0.65) {
      return {
        magnitude: error,
        category: 'tension',
        meaning: 'Significant phase tension'
      };
    } else {
      return {
        magnitude: error,
        category: 'opposition',
        meaning: 'Near opposite phase - strong polarity'
      };
    }
  }

  static computePhaseVector(
    natalError: number,
    transitError: number,
    gaaError: number
  ): {
    x: number;
    y: number;
    magnitude: number;
    direction: number;
  } {
    const natalAngle = natalError * 2 * Math.PI;
    const transitAngle = transitError * 2 * Math.PI;
    const gaaAngle = gaaError * 2 * Math.PI;

    const x = (Math.cos(natalAngle) * 0.4 +
               Math.cos(transitAngle) * 0.3 +
               Math.cos(gaaAngle) * 0.3);

    const y = (Math.sin(natalAngle) * 0.4 +
               Math.sin(transitAngle) * 0.3 +
               Math.sin(gaaAngle) * 0.3);

    const magnitude = Math.sqrt(x * x + y * y);
    const direction = Math.atan2(y, x);

    return { x, y, magnitude, direction };
  }

  static detectPhaseLock(
    phaseHistory: number[],
    targetPhase: number,
    windowSize: number = 8
  ): {
    locked: boolean;
    stability: number;
    duration: number;
  } {
    if (phaseHistory.length < windowSize) {
      return { locked: false, stability: 0, duration: 0 };
    }

    const recent = phaseHistory.slice(-windowSize);

    const errors = recent.map(phase => {
      const error = this.wrapPhase(phase - targetPhase);
      return Math.abs(error);
    });

    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const variance = errors.reduce((sum, err) => {
      const diff = err - avgError;
      return sum + diff * diff;
    }, 0) / errors.length;

    const stability = Math.exp(-variance * 10);

    const locked = avgError < 0.1 && stability > 0.7;

    let duration = 0;
    for (let i = phaseHistory.length - 1; i >= 0; i--) {
      const error = Math.abs(this.wrapPhase(phaseHistory[i] - targetPhase));
      if (error < 0.1) {
        duration++;
      } else {
        break;
      }
    }

    return { locked, stability, duration };
  }
}
