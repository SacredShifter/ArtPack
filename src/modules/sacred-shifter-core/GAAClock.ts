import { GAAState } from './types';

export class GAAClock {
  private startTime: number;
  private baseFreq: number;
  private ratios: number[];

  constructor(baseFreq: number = 432, ratios: number[] = [1, 1.5, 2, 3, 4]) {
    this.startTime = performance.now();
    this.baseFreq = baseFreq;
    this.ratios = ratios;
  }

  tick(elapsedMs: number): GAAState {
    const seconds = elapsedMs / 1000;
    const musicalTime = seconds * this.baseFreq;

    const phase = (musicalTime % 1);
    const lfo = Math.sin(seconds * Math.PI * 0.5);

    const harmonics = this.ratios.map(ratio =>
      this.baseFreq * ratio
    );

    return {
      phase,
      lfo,
      baseFreq: this.baseFreq,
      harmonics,
      musicalTime
    };
  }

  setBaseFreq(freq: number): void {
    this.baseFreq = freq;
  }

  setRatios(ratios: number[]): void {
    this.ratios = ratios;
  }

  reset(): void {
    this.startTime = performance.now();
  }
}

export class GAARatioMapper {
  private ratioMap: Map<string, number[]>;

  constructor() {
    this.ratioMap = new Map([
      ['golden', [1, 1.618, 2.618, 4.236]],
      ['fibonacci', [1, 1, 2, 3, 5, 8]],
      ['harmonic', [1, 2, 3, 4, 5, 6]],
      ['pentatonic', [1, 1.125, 1.333, 1.5, 1.777]],
      ['octave', [1, 2, 4, 8]]
    ]);
  }

  getRatios(name: string): number[] {
    return this.ratioMap.get(name) || this.ratioMap.get('harmonic')!;
  }

  setCustomRatios(name: string, ratios: number[]): void {
    this.ratioMap.set(name, ratios);
  }

  getAllPresets(): string[] {
    return Array.from(this.ratioMap.keys());
  }
}
