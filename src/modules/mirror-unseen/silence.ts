export interface SilenceMetrics {
  duration: number;
  quality: number;
  depth: number;
  continuity: number;
}

export interface ActivitySignal {
  timestamp: number;
  type: 'click' | 'key' | 'scroll' | 'focus';
  intensity: number;
}

export class SilenceEngine {
  private activityBuffer: ActivitySignal[] = [];
  private silenceStartTime: number | null = null;
  private currentSilenceDuration: number = 0;
  private windowSize: number = 90000;

  private pointerVelocityHistory: number[] = [];
  private focusStable: boolean = true;
  private micRMSHistory: number[] = [];

  recordActivity(type: ActivitySignal['type'], intensity: number = 1.0) {
    const signal: ActivitySignal = {
      timestamp: Date.now(),
      type,
      intensity
    };

    this.activityBuffer.push(signal);

    this.pruneBuffer();

    if (this.isBurstyActivity(signal)) {
      this.resetSilence();
    }
  }

  recordPointerVelocity(velocity: number) {
    this.pointerVelocityHistory.push(velocity);
    if (this.pointerVelocityHistory.length > 30) {
      this.pointerVelocityHistory.shift();
    }

    if (velocity > 100) {
      this.resetSilence();
    }
  }

  recordFocusState(focused: boolean) {
    if (!focused && this.focusStable) {
      this.resetSilence();
    }
    this.focusStable = focused;
  }

  recordMicRMS(rms: number) {
    this.micRMSHistory.push(rms);
    if (this.micRMSHistory.length > 30) {
      this.micRMSHistory.shift();
    }
  }

  computeSilenceMetrics(): SilenceMetrics {
    const now = Date.now();

    if (this.silenceStartTime === null) {
      this.silenceStartTime = now;
    }

    if (!this.isInSilence()) {
      this.resetSilence();
    } else {
      this.currentSilenceDuration = (now - this.silenceStartTime) / 1000;
    }

    const quality = this.computeQuality();
    const depth = this.computeDepth();
    const continuity = this.computeContinuity();

    return {
      duration: this.currentSilenceDuration,
      quality,
      depth,
      continuity
    };
  }

  private isInSilence(): boolean {
    const recentActivity = this.getRecentActivity(5000);

    if (recentActivity.length > 0) {
      const totalIntensity = recentActivity.reduce((sum, a) => sum + a.intensity, 0);
      if (totalIntensity > 0.5) return false;
    }

    if (this.pointerVelocityHistory.length > 0) {
      const avgVelocity = this.pointerVelocityHistory.reduce((a, b) => a + b, 0) / this.pointerVelocityHistory.length;
      if (avgVelocity > 20) return false;
    }

    if (!this.focusStable) return false;

    return true;
  }

  private isBurstyActivity(signal: ActivitySignal): boolean {
    const recentSimilar = this.activityBuffer.filter(a =>
      a.type === signal.type &&
      signal.timestamp - a.timestamp < 1000
    );

    return recentSimilar.length > 3;
  }

  private resetSilence() {
    this.silenceStartTime = null;
    this.currentSilenceDuration = 0;
  }

  private computeQuality(): number {
    if (this.currentSilenceDuration === 0) return 0;

    const pointerStillness = this.computePointerStillness();
    const breathSteadiness = this.computeBreathSteadiness();
    const focusStrength = this.focusStable ? 1.0 : 0.3;

    return (pointerStillness * 0.3 + breathSteadiness * 0.4 + focusStrength * 0.3);
  }

  private computeDepth(): number {
    if (this.currentSilenceDuration < 10) {
      return this.currentSilenceDuration / 10;
    } else if (this.currentSilenceDuration < 60) {
      return 0.5 + (this.currentSilenceDuration - 10) / 100;
    } else {
      return Math.min(1.0, 0.5 + this.currentSilenceDuration / 120);
    }
  }

  private computeContinuity(): number {
    if (this.currentSilenceDuration === 0) return 0;

    const interruptions = this.countInterruptions();

    return Math.max(0, 1.0 - interruptions * 0.1);
  }

  private computePointerStillness(): number {
    if (this.pointerVelocityHistory.length === 0) return 1.0;

    const avgVelocity = this.pointerVelocityHistory.reduce((a, b) => a + b, 0) / this.pointerVelocityHistory.length;

    return Math.max(0, 1.0 - avgVelocity / 50);
  }

  private computeBreathSteadiness(): number {
    if (this.micRMSHistory.length < 10) return 0.5;

    const variance = this.calculateVariance(this.micRMSHistory);

    return Math.max(0, 1.0 - variance * 10);
  }

  private countInterruptions(): number {
    if (this.silenceStartTime === null) return 0;

    const silencePeriodActivity = this.activityBuffer.filter(a =>
      a.timestamp >= this.silenceStartTime!
    );

    return silencePeriodActivity.filter(a => a.intensity > 0.3).length;
  }

  private getRecentActivity(windowMs: number): ActivitySignal[] {
    const now = Date.now();
    return this.activityBuffer.filter(a => now - a.timestamp < windowMs);
  }

  private pruneBuffer() {
    const now = Date.now();
    this.activityBuffer = this.activityBuffer.filter(a =>
      now - a.timestamp < this.windowSize
    );
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  interpretSilence(metrics: SilenceMetrics): {
    category: string;
    description: string;
    visualWeight: number;
  } {
    if (metrics.duration < 5) {
      return {
        category: 'nascent',
        description: 'Silence beginning to form',
        visualWeight: 0.2
      };
    } else if (metrics.duration < 30) {
      return {
        category: 'settling',
        description: 'Awareness settling into stillness',
        visualWeight: 0.5
      };
    } else if (metrics.duration < 120) {
      return {
        category: 'deep',
        description: 'Deep silence presence established',
        visualWeight: 0.8
      };
    } else {
      return {
        category: 'profound',
        description: 'Profound stillness - witnessing awareness',
        visualWeight: 1.0
      };
    }
  }
}
