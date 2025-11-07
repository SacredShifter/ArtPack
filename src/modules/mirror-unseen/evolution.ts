import { EvoInputs, EvoParams, FormType, PhaseTransition } from './types';

export class EvolutionEngine {
  private currentForm: FormType = 'circle';
  private transitionStartTime: number | null = null;
  private metricHoldStart: Map<string, number> = new Map();
  private readonly HOLD_THRESHOLD = 5000;

  computeEvoParams(inputs: EvoInputs, elementRatios: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  }): EvoParams {
    const entropy = this.calculateElementEntropy(elementRatios);

    const m = Math.round(3 + 9 * entropy);

    const n1 = this.lerp(0.5, 8.0, inputs.Cx);

    const rPol = Math.max(0, Math.min(1, Math.abs(inputs.Pol - 0.5) * 2.0));
    const n2 = this.lerp(0.8, 4.0, rPol);
    const n3 = n2;

    const lift = this.smoothstep(0.6, 0.85, inputs.Coh);

    const merkaba = inputs.Coh > 0.9 && rPol < 0.1;

    const vesicaStrength = inputs.Syn > 0.7 ? inputs.Syn : 0;

    const starMix = inputs.Res > 0.55 ? (inputs.Res - 0.55) / 0.45 : 0;

    const hazeIntensity = inputs.U > 0.6 ? (inputs.U - 0.6) / 0.4 : 0;

    return {
      m,
      n1,
      n2,
      n3,
      lift,
      merkaba,
      vesicaStrength,
      starMix,
      hazeIntensity
    };
  }

  checkTransition(inputs: EvoInputs, params: EvoParams): PhaseTransition | null {
    const now = Date.now();

    const potentialTransitions: Array<{
      to: FormType;
      condition: boolean;
      metric: string;
      value: number;
    }> = [
      {
        to: 'polygon',
        condition: params.m >= 5 && inputs.Cx > 0.35,
        metric: 'complexity',
        value: inputs.Cx
      },
      {
        to: 'flower',
        condition: inputs.Cx > 0.6 && inputs.Coh > 0.5,
        metric: 'coherent_complexity',
        value: (inputs.Cx + inputs.Coh) / 2
      },
      {
        to: 'star',
        condition: inputs.Res > 0.55,
        metric: 'residual',
        value: inputs.Res
      },
      {
        to: 'platonic',
        condition: inputs.Coh > 0.85 && params.lift > 0.7,
        metric: 'coherence_lift',
        value: inputs.Coh
      },
      {
        to: 'merkaba',
        condition: inputs.Coh > 0.9 && Math.abs(inputs.Pol - 0.5) < 0.05,
        metric: 'balanced_transcendence',
        value: inputs.Coh
      }
    ];

    for (const transition of potentialTransitions) {
      if (transition.condition && transition.to !== this.currentForm) {
        const key = `${this.currentForm}->${transition.to}`;

        if (!this.metricHoldStart.has(key)) {
          this.metricHoldStart.set(key, now);
        }

        const holdDuration = now - this.metricHoldStart.get(key)!;

        if (holdDuration >= this.HOLD_THRESHOLD) {
          const phaseTransition: PhaseTransition = {
            sessionId: '',
            timestamp: now,
            fromForm: this.currentForm,
            toForm: transition.to,
            triggerMetric: transition.metric,
            thresholdValue: transition.value,
            holdDurationSec: holdDuration / 1000
          };

          this.currentForm = transition.to;
          this.transitionStartTime = now;

          this.metricHoldStart.clear();

          return phaseTransition;
        }
      } else {
        const key = `${this.currentForm}->${transition.to}`;
        this.metricHoldStart.delete(key);
      }
    }

    return null;
  }

  getCurrentForm(): FormType {
    return this.currentForm;
  }

  getTransitionProgress(): number {
    if (this.transitionStartTime === null) return 1.0;

    const elapsed = Date.now() - this.transitionStartTime;
    const transitionDuration = 2000;

    const progress = Math.min(1.0, elapsed / transitionDuration);

    return this.easeInOutCubic(progress);
  }

  private calculateElementEntropy(ratios: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  }): number {
    const values = [ratios.fire, ratios.earth, ratios.air, ratios.water];

    let entropy = 0;
    for (const p of values) {
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    const maxEntropy = Math.log2(4);
    return entropy / maxEntropy;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  private smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  interpretForm(formType: FormType, params: EvoParams): {
    meaning: string;
    activeFo rces: string[];
    visualDescription: string;
  } {
    switch (formType) {
      case 'circle':
        return {
          meaning: 'Unity and wholeness - undifferentiated potential',
          activeForces: ['centered', 'simple', 'complete'],
          visualDescription: 'Perfect circle with smooth boundaries'
        };

      case 'polygon':
        return {
          meaning: `${params.m}-fold diversity of forces active`,
          activeForces: ['relational', 'structured', 'defined'],
          visualDescription: `${params.m}-sided polygon with ${params.n1 > 4 ? 'sharp' : 'rounded'} edges`
        };

      case 'flower':
        return {
          meaning: 'Complex yet cohered - integrated multiplicity',
          activeForces: ['harmonic', 'balanced', 'flourishing'],
          visualDescription: `${params.m}-petal flower with elegant lobes`
        };

      case 'star':
        return {
          meaning: 'Tension and unintegrated threads seeking resolution',
          activeForces: ['dynamic', 'pointed', 'polarized'],
          visualDescription: 'Star form with sharp projections showing active stress lines'
        };

      case 'platonic':
        return {
          meaning: 'Stable entrainment - lifted to higher dimension',
          activeForces: ['coherent', 'elevated', 'structured'],
          visualDescription: '3D Platonic solid based on dominant element'
        };

      case 'merkaba':
        return {
          meaning: 'High coherence + balanced polarity = transcendence vehicle',
          activeForces: ['unified', 'balanced', 'transcendent'],
          visualDescription: 'Interpenetrating tetrahedra - sacred geometry of transformation'
        };

      default:
        return {
          meaning: 'Unknown form',
          activeForces: [],
          visualDescription: 'Undefined'
        };
    }
  }

  static getElementalPlatonic(element: 'fire' | 'earth' | 'air' | 'water'): {
    name: string;
    faces: number;
    vertices: number;
    edges: number;
  } {
    const platonics = {
      fire: { name: 'Tetrahedron', faces: 4, vertices: 4, edges: 6 },
      air: { name: 'Octahedron', faces: 8, vertices: 6, edges: 12 },
      earth: { name: 'Cube', faces: 6, vertices: 8, edges: 12 },
      water: { name: 'Icosahedron', faces: 20, vertices: 12, edges: 30 }
    };

    return platonics[element];
  }
}
