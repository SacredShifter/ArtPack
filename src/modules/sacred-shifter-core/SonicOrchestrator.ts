import { SonicEnvelope } from './types';

export class SonicOrchestrator {
  private envelopes: Map<string, EnvelopeGenerator>;
  private globalTime: number;

  constructor() {
    this.envelopes = new Map();
    this.globalTime = 0;

    this.envelopes.set('amplitude', new EnvelopeGenerator('sine', 4000, 0.3, 1.0));
    this.envelopes.set('hueShift', new EnvelopeGenerator('triangle', 8000, 0, 360));
    this.envelopes.set('breathRate', new EnvelopeGenerator('sine', 6000, 0.5, 2.0));
    this.envelopes.set('tension', new EnvelopeGenerator('sawtooth', 12000, 0, 1.0));
  }

  tick(deltaMs: number): SonicEnvelope {
    this.globalTime += deltaMs;

    return {
      amplitude: this.envelopes.get('amplitude')!.getValue(this.globalTime),
      hueShift: this.envelopes.get('hueShift')!.getValue(this.globalTime),
      breathRate: this.envelopes.get('breathRate')!.getValue(this.globalTime),
      tension: this.envelopes.get('tension')!.getValue(this.globalTime)
    };
  }

  setEnvelope(name: string, type: 'sine' | 'triangle' | 'sawtooth' | 'square', periodMs: number, min: number, max: number): void {
    this.envelopes.set(name, new EnvelopeGenerator(type, periodMs, min, max));
  }

  getEnvelope(name: string): EnvelopeGenerator | undefined {
    return this.envelopes.get(name);
  }

  reset(): void {
    this.globalTime = 0;
  }
}

class EnvelopeGenerator {
  constructor(
    private type: 'sine' | 'triangle' | 'sawtooth' | 'square',
    private periodMs: number,
    private min: number,
    private max: number
  ) {}

  getValue(timeMs: number): number {
    const phase = (timeMs % this.periodMs) / this.periodMs;
    const range = this.max - this.min;

    let normalized: number;

    switch (this.type) {
      case 'sine':
        normalized = (Math.sin(phase * Math.PI * 2) + 1) / 2;
        break;
      case 'triangle':
        normalized = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        break;
      case 'sawtooth':
        normalized = phase;
        break;
      case 'square':
        normalized = phase < 0.5 ? 0 : 1;
        break;
    }

    return this.min + normalized * range;
  }

  setPeriod(ms: number): void {
    this.periodMs = ms;
  }

  setRange(min: number, max: number): void {
    this.min = min;
    this.max = max;
  }
}
