import type { GESemanticEvent, EventQueryFilter, ResonanceField, GlobalEventHorizon as IGEH } from './types';

type EventHandler = (event: GESemanticEvent) => void | Promise<void>;

export class GlobalEventHorizon implements IGEH {
  private static instance: GlobalEventHorizon;

  private subscriptions: Map<string, Map<string, EventHandler>> = new Map();
  private eventHistory: GESemanticEvent[] = [];
  private resonanceCalculator: ResonanceCalculator;

  private readonly MAX_HISTORY = 10000;
  private readonly RESONANCE_WINDOW_MS = 60000;

  private constructor() {
    this.resonanceCalculator = new ResonanceCalculator();
  }

  static getInstance(): GlobalEventHorizon {
    if (!GlobalEventHorizon.instance) {
      GlobalEventHorizon.instance = new GlobalEventHorizon();
    }
    return GlobalEventHorizon.instance;
  }

  publish(event: GESemanticEvent): void {
    event.resonanceSignature = this.resonanceCalculator.calculateResonance(event);

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.shift();
    }

    const handlers = this.subscriptions.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          const result = handler(event);
          if (result instanceof Promise) {
            result.catch(err => {
              console.error(`Error in async handler for ${event.type}:`, err);
            });
          }
        } catch (err) {
          console.error(`Error in handler for ${event.type}:`, err);
        }
      });
    }

    const wildcardHandlers = this.subscriptions.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error('Error in wildcard handler:', err);
        }
      });
    }
  }

  subscribe(eventType: string, handler: EventHandler): string {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Map());
    }

    const subscriptionId = `${eventType}_${Date.now()}_${Math.random()}`;
    this.subscriptions.get(eventType)!.set(subscriptionId, handler);

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    const [eventType] = subscriptionId.split('_');
    const handlers = this.subscriptions.get(eventType);
    if (handlers) {
      handlers.delete(subscriptionId);
      if (handlers.size === 0) {
        this.subscriptions.delete(eventType);
      }
    }
  }

  queryHistory(filters: EventQueryFilter): GESemanticEvent[] {
    let results = this.eventHistory;

    if (filters.types && filters.types.length > 0) {
      results = results.filter(e => filters.types!.includes(e.type));
    }

    if (filters.labels && filters.labels.length > 0) {
      results = results.filter(e =>
        filters.labels!.some(label => e.labels.includes(label))
      );
    }

    if (filters.sourceModules && filters.sourceModules.length > 0) {
      results = results.filter(e => filters.sourceModules!.includes(e.sourceModule));
    }

    if (filters.timeRange) {
      results = results.filter(e =>
        e.timestamp >= filters.timeRange!.start &&
        e.timestamp <= filters.timeRange!.end
      );
    }

    if (filters.limit) {
      results = results.slice(-filters.limit);
    }

    return results;
  }

  getResonanceField(): ResonanceField {
    const now = Date.now();
    const recentEvents = this.eventHistory.filter(
      e => now - e.timestamp < this.RESONANCE_WINDOW_MS
    );

    const labelCounts = new Map<string, number>();
    const moduleCounts = new Map<string, number>();
    let totalResonance = 0;

    recentEvents.forEach(event => {
      event.labels.forEach(label => {
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      });
      moduleCounts.set(event.sourceModule, (moduleCounts.get(event.sourceModule) || 0) + 1);
      totalResonance += event.resonanceSignature || 0;
    });

    const dominantLabels = Array.from(labelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => label);

    const activeModules = Array.from(moduleCounts.keys());

    const globalCoherence = recentEvents.length > 0
      ? totalResonance / recentEvents.length
      : 0;

    const eventDensity = recentEvents.length / (this.RESONANCE_WINDOW_MS / 1000);

    return {
      globalCoherence,
      activeModules,
      eventDensity,
      dominantLabels
    };
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getEventCount(): number {
    return this.eventHistory.length;
  }
}

class ResonanceCalculator {
  private labelWeights: Map<string, number> = new Map([
    ['peak-state', 10],
    ['coherence', 8],
    ['transcendence', 9],
    ['user-action', 5],
    ['biometric', 7],
    ['visual', 4],
    ['system', 2],
    ['lifecycle', 1]
  ]);

  calculateResonance(event: GESemanticEvent): number {
    let score = 0;

    event.labels.forEach(label => {
      score += this.labelWeights.get(label) || 3;
    });

    if (event.payload?.amplitude !== undefined) {
      score *= (1 + event.payload.amplitude);
    }

    if (event.payload?.coherenceScore !== undefined) {
      score *= event.payload.coherenceScore;
    }

    return Math.min(score, 100);
  }
}

export const geh = GlobalEventHorizon.getInstance();
