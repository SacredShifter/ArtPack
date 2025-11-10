export type TransitionType = 'fade' | 'crossfade' | 'immediate';

export interface JourneyStep {
  packId: string;
  duration?: number;
  waitForMetric?: {
    coherence?: number;
    stillness?: number;
    gain?: number;
    [key: string]: number | undefined;
  };
  transitionType: TransitionType;
  intensity?: 'gentle' | 'medium' | 'crescendo' | 'peak';
  trigger?: 'auto' | 'threshold-met' | 'peak-moment' | 'manual';
}

export interface JourneyScript {
  id: string;
  name: string;
  description: string;
  seriesId?: string;
  steps: JourneyStep[];
  totalEstimatedDuration?: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  telos: string[];
}

export class JourneyScriptEngine {
  private currentScript: JourneyScript | null = null;
  private currentStepIndex = 0;
  private stepStartTime = 0;
  private isRunning = false;
  private isPaused = false;
  private currentMetrics: Record<string, number> = {};

  private callbacks: {
    onStepChange?: (step: JourneyStep, index: number) => void;
    onComplete?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onStop?: () => void;
  } = {};

  loadScript(script: JourneyScript) {
    this.currentScript = script;
    this.currentStepIndex = 0;
    this.stepStartTime = 0;
    this.isRunning = false;
    this.isPaused = false;
  }

  start() {
    if (!this.currentScript) {
      throw new Error('No script loaded');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.stepStartTime = Date.now();

    this.executeCurrentStep();
  }

  pause() {
    this.isPaused = true;
    this.callbacks.onPause?.();
  }

  resume() {
    this.isPaused = false;
    this.callbacks.onResume?.();
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.callbacks.onStop?.();
  }

  updateMetrics(metrics: Record<string, number>) {
    this.currentMetrics = { ...metrics };

    if (!this.isRunning || this.isPaused || !this.currentScript) {
      return;
    }

    this.checkStepCompletion();
  }

  private executeCurrentStep() {
    if (!this.currentScript) return;

    const step = this.currentScript.steps[this.currentStepIndex];
    if (!step) {
      this.complete();
      return;
    }

    this.stepStartTime = Date.now();
    this.callbacks.onStepChange?.(step, this.currentStepIndex);
  }

  private checkStepCompletion() {
    if (!this.currentScript) return;

    const step = this.currentScript.steps[this.currentStepIndex];
    if (!step) return;

    let shouldAdvance = false;

    if (step.duration) {
      const elapsed = Date.now() - this.stepStartTime;
      if (elapsed >= step.duration * 1000) {
        shouldAdvance = true;
      }
    }

    if (step.waitForMetric && !shouldAdvance) {
      const allMetricsMet = Object.entries(step.waitForMetric).every(
        ([key, threshold]) => {
          const currentValue = this.currentMetrics[key];
          return currentValue !== undefined && currentValue >= (threshold || 0);
        }
      );

      if (allMetricsMet) {
        shouldAdvance = true;
      }
    }

    if (step.trigger === 'manual') {
      shouldAdvance = false;
    }

    if (shouldAdvance) {
      this.nextStep();
    }
  }

  private nextStep() {
    if (!this.currentScript) return;

    this.currentStepIndex++;

    if (this.currentStepIndex >= this.currentScript.steps.length) {
      this.complete();
    } else {
      this.executeCurrentStep();
    }
  }

  private complete() {
    this.isRunning = false;
    this.callbacks.onComplete?.();
  }

  manualAdvance() {
    if (this.isRunning && !this.isPaused) {
      this.nextStep();
    }
  }

  getCurrentStep(): { step: JourneyStep; index: number } | null {
    if (!this.currentScript) return null;

    const step = this.currentScript.steps[this.currentStepIndex];
    return step ? { step, index: this.currentStepIndex } : null;
  }

  getProgress(): number {
    if (!this.currentScript) return 0;

    return this.currentStepIndex / this.currentScript.steps.length;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  on(
    event: 'stepChange' | 'complete' | 'pause' | 'resume' | 'stop',
    callback: any
  ) {
    if (event === 'stepChange') {
      this.callbacks.onStepChange = callback;
    } else if (event === 'complete') {
      this.callbacks.onComplete = callback;
    } else if (event === 'pause') {
      this.callbacks.onPause = callback;
    } else if (event === 'resume') {
      this.callbacks.onResume = callback;
    } else if (event === 'stop') {
      this.callbacks.onStop = callback;
    }
  }
}

export const UNSEEN_FULL_JOURNEY: JourneyScript = {
  id: 'unseen-full-awakening',
  name: 'The Unseen: Full Awakening',
  description:
    'Complete journey through all 9 packs of The Unseen Series. From void to emergence, experience the full arc of consciousness expansion.',
  seriesId: 'the-unseen',
  steps: [
    {
      packId: 'eternal-void-unseen',
      duration: 90,
      transitionType: 'fade',
      intensity: 'gentle',
      trigger: 'auto',
    },
    {
      packId: 'whisper-field',
      waitForMetric: { stillness: 0.7 },
      transitionType: 'fade',
      intensity: 'gentle',
      trigger: 'threshold-met',
    },
    {
      packId: 'liminal-threads',
      waitForMetric: { coherence: 0.75 },
      transitionType: 'crossfade',
      intensity: 'medium',
      trigger: 'threshold-met',
    },
  ],
  totalEstimatedDuration: 1800,
  tags: ['complete', 'advanced', 'ceremonial', 'transformation'],
  difficulty: 'advanced',
  telos: ['facilitate-transcendence', 'process-shadow', 'support-meditative-states'],
};

export const UNSEEN_WAVE1_INTRO: JourneyScript = {
  id: 'unseen-wave1-intro',
  name: 'The Unseen: Wave 1 Introduction',
  description:
    'Experience the first three packs of The Unseen Series. Perfect for beginners exploring consciousness visualization.',
  seriesId: 'the-unseen',
  steps: [
    {
      packId: 'eternal-void-unseen',
      duration: 60,
      transitionType: 'fade',
      intensity: 'gentle',
      trigger: 'auto',
    },
    {
      packId: 'whisper-field',
      duration: 90,
      transitionType: 'fade',
      intensity: 'gentle',
      trigger: 'auto',
    },
    {
      packId: 'liminal-threads',
      duration: 90,
      transitionType: 'crossfade',
      intensity: 'medium',
      trigger: 'auto',
    },
  ],
  totalEstimatedDuration: 240,
  tags: ['wave1', 'beginner', 'introduction'],
  difficulty: 'beginner',
  telos: ['support-meditative-states', 'facilitate-transcendence'],
};
