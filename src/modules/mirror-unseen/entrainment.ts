export interface EntrainmentState {
  locked: boolean;
  deltaPct: number;
  userTempo: number;
  masterTempo: number;
  lockDuration: number;
  confidence: number;
}

export class EntrainmentEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private rmsHistory: number[] = [];
  private tempoHistory: number[] = [];
  private lockStartTime: number | null = null;

  private readonly LOCK_THRESHOLD = 0.04;
  private readonly LOCK_DURATION_THRESHOLD = 8000;
  private readonly RMS_WINDOW = 100;

  async initialize(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      return true;
    } catch (error) {
      console.error('Failed to initialize entrainment engine:', error);
      return false;
    }
  }

  destroy() {
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  update(): { rms: number; tempo: number } | null {
    if (!this.analyser) return null;

    const dataArray = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(dataArray);

    const rms = this.calculateRMS(dataArray);
    this.rmsHistory.push(rms);
    if (this.rmsHistory.length > this.RMS_WINDOW) {
      this.rmsHistory.shift();
    }

    const tempo = this.extractTempo(this.rmsHistory);
    if (tempo > 0) {
      this.tempoHistory.push(tempo);
      if (this.tempoHistory.length > 30) {
        this.tempoHistory.shift();
      }
    }

    return { rms, tempo };
  }

  checkEntrainment(masterBPM: number): EntrainmentState {
    if (this.tempoHistory.length < 10) {
      return {
        locked: false,
        deltaPct: 1.0,
        userTempo: 0,
        masterTempo: masterBPM,
        lockDuration: 0,
        confidence: 0
      };
    }

    const recentTempos = this.tempoHistory.slice(-10);
    const userBPM = recentTempos.reduce((a, b) => a + b, 0) / recentTempos.length;

    const deltaPct = Math.abs(userBPM - masterBPM) / masterBPM;

    const now = Date.now();
    const isWithinThreshold = deltaPct < this.LOCK_THRESHOLD;

    if (isWithinThreshold) {
      if (this.lockStartTime === null) {
        this.lockStartTime = now;
      }
    } else {
      this.lockStartTime = null;
    }

    const lockDuration = this.lockStartTime ? now - this.lockStartTime : 0;
    const locked = lockDuration >= this.LOCK_DURATION_THRESHOLD;

    const tempoVariance = this.calculateVariance(recentTempos);
    const confidence = Math.max(0, 1.0 - tempoVariance / 10);

    return {
      locked,
      deltaPct: Math.min(1.0, deltaPct),
      userTempo: userBPM,
      masterTempo: masterBPM,
      lockDuration,
      confidence
    };
  }

  private calculateRMS(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  private extractTempo(rmsHistory: number[]): number {
    if (rmsHistory.length < 30) return 0;

    const autocorr = this.autocorrelation(rmsHistory);

    let maxPeak = 0;
    let maxPeakLag = 0;

    for (let lag = 10; lag < autocorr.length / 2; lag++) {
      if (autocorr[lag] > maxPeak) {
        const isLocalMax = (lag === 0) ||
          (autocorr[lag] > autocorr[lag - 1] && autocorr[lag] > autocorr[lag + 1]);

        if (isLocalMax) {
          maxPeak = autocorr[lag];
          maxPeakLag = lag;
        }
      }
    }

    if (maxPeakLag === 0) return 0;

    const sampleRate = 60;
    const periodInSamples = maxPeakLag;
    const periodInSeconds = periodInSamples / sampleRate;

    const bpm = 60 / periodInSeconds;

    if (bpm < 20 || bpm > 200) return 0;

    return bpm;
  }

  private autocorrelation(signal: number[]): number[] {
    const n = signal.length;
    const result: number[] = new Array(n).fill(0);

    const mean = signal.reduce((a, b) => a + b, 0) / n;
    const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

    if (variance === 0) return result;

    for (let lag = 0; lag < n; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += (signal[i] - mean) * (signal[i + lag] - mean);
      }
      result[lag] = sum / (variance * (n - lag));
    }

    return result;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  interpretEntrainment(state: EntrainmentState): {
    category: string;
    description: string;
    visualEffect: string;
  } {
    if (!state.locked && state.deltaPct > 0.2) {
      return {
        category: 'independent',
        description: 'Operating at own natural rhythm',
        visualEffect: 'phase-drift moiré'
      };
    } else if (!state.locked && state.deltaPct <= 0.2) {
      return {
        category: 'approaching',
        description: 'Beginning to sync with field',
        visualEffect: 'gentle pull toward phase'
      };
    } else if (state.locked && state.lockDuration < 30000) {
      return {
        category: 'locked',
        description: 'Entrained with collective rhythm',
        visualEffect: 'phase-locked ring ripple'
      };
    } else {
      return {
        category: 'deep_sync',
        description: 'Deep synchronization - breathing as one',
        visualEffect: 'strong coherent pulse'
      };
    }
  }

  static lockEntrainSimple(userBpm: number, masterBpm: number, secsLocked: number): {
    locked: boolean;
    deltaPct: number;
  } {
    const deltaPct = Math.abs(userBpm - masterBpm) / masterBpm;
    const locked = deltaPct < 0.04 && secsLocked >= 8;
    return { locked, deltaPct: Math.min(deltaPct, 1.0) };
  }
}
