export interface UncertaintySource {
  name: string;
  sigma: number;
  weight: number;
}

export class UncertaintyEngine {
  private sources: Map<string, UncertaintySource> = new Map();

  constructor() {
    this.initializeDefaultSources();
  }

  private initializeDefaultSources() {
    this.sources.set('ephemeris', {
      name: 'Ephemeris Interpolation',
      sigma: 0.05,
      weight: 0.2
    });

    this.sources.set('location', {
      name: 'Geographic Precision',
      sigma: 0.10,
      weight: 0.15
    });

    this.sources.set('birth_time', {
      name: 'Birth Time Accuracy',
      sigma: 0.15,
      weight: 0.25
    });

    this.sources.set('clock_drift', {
      name: 'Clock Synchronization',
      sigma: 0.02,
      weight: 0.1
    });

    this.sources.set('sensor', {
      name: 'Sensor Noise',
      sigma: 0.08,
      weight: 0.15
    });

    this.sources.set('model', {
      name: 'Model Approximation',
      sigma: 0.12,
      weight: 0.15
    });
  }

  updateSource(name: string, sigma: number) {
    const source = this.sources.get(name);
    if (source) {
      source.sigma = Math.max(0, Math.min(1, sigma));
    }
  }

  computeAggregate(): number {
    let product = 1.0;
    let totalWeight = 0;

    this.sources.forEach(source => {
      const normalized = source.sigma;
      product *= (1 - normalized * source.weight);
      totalWeight += source.weight;
    });

    const uncertainty = 1 - product;

    return Math.max(0, Math.min(1, uncertainty));
  }

  getSourceBreakdown(): UncertaintySource[] {
    return Array.from(this.sources.values()).sort((a, b) =>
      (b.sigma * b.weight) - (a.sigma * a.weight)
    );
  }

  interpretUncertainty(score: number): {
    level: string;
    description: string;
    recommendation: string;
  } {
    if (score < 0.2) {
      return {
        level: 'low',
        description: 'High confidence in all upstream models',
        recommendation: 'Rendering can be assertive'
      };
    } else if (score < 0.4) {
      return {
        level: 'moderate',
        description: 'Some model uncertainty present',
        recommendation: 'Reduce saturation slightly'
      };
    } else if (score < 0.6) {
      return {
        level: 'significant',
        description: 'Notable gaps in data or precision',
        recommendation: 'Add visible grain texture'
      };
    } else {
      return {
        level: 'high',
        description: 'Substantial unknowns in the system',
        recommendation: 'Render as possibility field, not assertion'
      };
    }
  }

  calibrateFromBirthData(hasExactTime: boolean, locationPrecision: number) {
    if (!hasExactTime) {
      this.updateSource('birth_time', 0.4);
    } else {
      this.updateSource('birth_time', 0.1);
    }

    const locationSigma = Math.max(0.05, 1.0 - locationPrecision);
    this.updateSource('location', locationSigma);
  }

  calibrateFromTransitData(ephemerisQuality: number) {
    const ephemerisSigma = 1.0 - ephemerisQuality;
    this.updateSource('ephemeris', ephemerisSigma);
  }

  estimateFromSampleVariance(samples: number[], expectedValue: number): number {
    if (samples.length < 2) return 0.5;

    const variance = samples.reduce((sum, val) => {
      const diff = val - expectedValue;
      return sum + diff * diff;
    }, 0) / samples.length;

    const standardDev = Math.sqrt(variance);

    return Math.min(1.0, standardDev);
  }
}
