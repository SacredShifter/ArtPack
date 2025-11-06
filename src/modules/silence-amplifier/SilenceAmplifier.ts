import type { IModule, ModuleManifest, GlobalEventHorizon } from '../../core/types';

export class SilenceAmplifier implements IModule {
  readonly manifest: ModuleManifest = {
    id: 'silence-amplifier',
    name: 'Silence Amplifier',
    version: '1.0.0',
    essenceLabels: ['meditative', 'stillness', 'presence', 'paradoxical', 'zen'],
    capabilities: [
      'track-stillness',
      'reward-presence',
      'amplify-visuals-on-stillness',
      'detect-micro-movements',
      'generate-stillness-score'
    ],
    telosAlignment: [
      'support-meditative-states',
      'facilitate-transcendence',
      'enable-creative-expression'
    ],
    dependencies: ['artpack-system'],
    resourceFootprintMB: 3,
    integrityScore: 97
  };

  private geh: GlobalEventHorizon | null = null;
  private isActive = false;

  private lastMousePosition = { x: 0, y: 0 };
  private lastScrollPosition = 0;
  private stillnessStartTime: number | null = null;
  private totalStillnessTime = 0;
  private currentStillnessStreak = 0;

  private stillnessThresholdMs = 2000;
  private mouseMoveThreshold = 5;

  private visualAmplification = 1.0;
  private maxAmplification = 3.0;
  private amplificationRate = 0.1;

  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private scrollHandler: ((e: Event) => void) | null = null;
  private keyPressHandler: ((e: KeyboardEvent) => void) | null = null;
  private stillnessCheckInterval: number | null = null;

  async initialize(geh: GlobalEventHorizon): Promise<void> {
    this.geh = geh;

    this.geh.subscribe('artpack-frame-rendered', this.applyAmplification.bind(this));

    this.geh.publish({
      type: 'silence-amplifier-initialized',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['system', 'lifecycle', 'meditative'],
      payload: { ready: true }
    });
  }

  async activate(): Promise<void> {
    this.isActive = true;
    this.setupEventListeners();
    this.startStillnessTracking();

    this.geh?.publish({
      type: 'silence-amplifier-activated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle', 'meditative'],
      payload: { tracking: true }
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;
    this.removeEventListeners();
    this.stopStillnessTracking();
    this.visualAmplification = 1.0;

    this.geh?.publish({
      type: 'silence-amplifier-deactivated',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['lifecycle'],
      payload: { tracking: false }
    });
  }

  async destroy(): Promise<void> {
    await this.deactivate();
    this.geh = null;
  }

  getExposedItems(): Record<string, any> {
    return {
      getStillnessScore: () => this.calculateStillnessScore(),
      getTotalStillnessTime: () => this.totalStillnessTime,
      getCurrentStreak: () => this.currentStillnessStreak,
      getAmplification: () => this.visualAmplification
    };
  }

  private setupEventListeners(): void {
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.scrollHandler = this.handleScroll.bind(this);
    this.keyPressHandler = this.handleKeyPress.bind(this);

    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('scroll', this.scrollHandler);
    document.addEventListener('keydown', this.keyPressHandler);
  }

  private removeEventListeners(): void {
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.scrollHandler) {
      document.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.keyPressHandler) {
      document.removeEventListener('keydown', this.keyPressHandler);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const deltaX = Math.abs(event.clientX - this.lastMousePosition.x);
    const deltaY = Math.abs(event.clientY - this.lastMousePosition.y);
    const totalDelta = deltaX + deltaY;

    if (totalDelta > this.mouseMoveThreshold) {
      this.breakStillness('mouse-movement');
    }

    this.lastMousePosition = { x: event.clientX, y: event.clientY };
  }

  private handleScroll(event: Event): void {
    const currentScroll = window.scrollY;
    const delta = Math.abs(currentScroll - this.lastScrollPosition);

    if (delta > 10) {
      this.breakStillness('scroll');
    }

    this.lastScrollPosition = currentScroll;
  }

  private handleKeyPress(event: KeyboardEvent): void {
    this.breakStillness('keyboard');
  }

  private breakStillness(reason: string): void {
    if (this.stillnessStartTime !== null) {
      const stillnessDuration = Date.now() - this.stillnessStartTime;
      this.totalStillnessTime += stillnessDuration;

      this.geh?.publish({
        type: 'stillness-broken',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['stillness', 'interaction'],
        payload: {
          reason,
          duration: stillnessDuration,
          streak: this.currentStillnessStreak
        }
      });
    }

    this.stillnessStartTime = null;
    this.currentStillnessStreak = 0;

    this.reduceAmplification();
  }

  private startStillnessTracking(): void {
    this.stillnessCheckInterval = window.setInterval(() => {
      this.checkStillness();
    }, 1000);
  }

  private stopStillnessTracking(): void {
    if (this.stillnessCheckInterval !== null) {
      clearInterval(this.stillnessCheckInterval);
      this.stillnessCheckInterval = null;
    }
  }

  private checkStillness(): void {
    if (!this.isActive) return;

    const now = Date.now();

    if (this.stillnessStartTime === null) {
      this.stillnessStartTime = now;
    }

    const stillnessDuration = now - this.stillnessStartTime;

    if (stillnessDuration > this.stillnessThresholdMs) {
      this.currentStillnessStreak = Math.floor(stillnessDuration / 1000);

      this.increaseAmplification();

      if (this.currentStillnessStreak % 30 === 0) {
        this.geh?.publish({
          type: 'stillness-milestone-reached',
          timestamp: Date.now(),
          sourceModule: this.manifest.id,
          labels: ['stillness', 'milestone', 'meditative'],
          payload: {
            streak: this.currentStillnessStreak,
            amplification: this.visualAmplification,
            totalStillness: this.totalStillnessTime
          },
          resonanceSignature: 70
        });
      }
    }
  }

  private increaseAmplification(): void {
    if (this.visualAmplification < this.maxAmplification) {
      this.visualAmplification = Math.min(
        this.visualAmplification + this.amplificationRate * 0.01,
        this.maxAmplification
      );

      this.geh?.publish({
        type: 'visual-amplification-increased',
        timestamp: Date.now(),
        sourceModule: this.manifest.id,
        labels: ['visual', 'stillness', 'reward'],
        payload: {
          amplification: this.visualAmplification,
          streak: this.currentStillnessStreak
        }
      });
    }
  }

  private reduceAmplification(): void {
    this.visualAmplification = Math.max(
      1.0,
      this.visualAmplification - 0.1
    );

    this.geh?.publish({
      type: 'visual-amplification-decreased',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['visual', 'stillness'],
      payload: {
        amplification: this.visualAmplification
      }
    });
  }

  private applyAmplification(event: any): void {
    if (!this.isActive || this.visualAmplification === 1.0) return;

    this.geh?.publish({
      type: 'apply-stillness-amplification',
      timestamp: Date.now(),
      sourceModule: this.manifest.id,
      labels: ['visual', 'stillness', 'modifier'],
      payload: {
        amplification: this.visualAmplification,
        modifiers: {
          brightness: 1.0 + (this.visualAmplification - 1.0) * 0.3,
          complexity: 1.0 + (this.visualAmplification - 1.0) * 0.5,
          speed: 1.0 - (this.visualAmplification - 1.0) * 0.2
        }
      }
    });
  }

  private calculateStillnessScore(): number {
    const streakScore = Math.min(this.currentStillnessStreak / 300, 1);
    const totalScore = Math.min(this.totalStillnessTime / 600000, 1);
    const amplificationScore = (this.visualAmplification - 1.0) / (this.maxAmplification - 1.0);

    return (streakScore * 0.4 + totalScore * 0.3 + amplificationScore * 0.3) * 100;
  }
}
