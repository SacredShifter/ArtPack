export interface Archetype {
  id: string;
  name: string;
  geometryType: string;
  conditions: {
    coherence?: { min?: number; max?: number };
    complexity?: { min?: number; max?: number };
    polarity?: { min?: number; max?: number };
    residual?: { min?: number; max?: number };
    uncertainty?: { min?: number; max?: number };
  };
  teaching: string;
  aphorism: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  visualDescription: string;
  trainsSkill: string;
}

export class ArchetypeLibrary {
  private static archetypes: Map<string, Archetype> = new Map([
    [
      'still_point',
      {
        id: 'still_point',
        name: 'Still Point',
        geometryType: 'circle',
        conditions: {
          coherence: { min: 0.7 },
          complexity: { max: 0.3 }
        },
        teaching: 'Presence arises when motion rests.',
        aphorism: 'In stillness, awareness finds itself.',
        colorPalette: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#0f3460'
        },
        visualDescription: 'Perfect circle with smooth, radiant boundaries',
        trainsSkill: 'Breath regulation and focused presence'
      }
    ],
    [
      'harmonic_union',
      {
        id: 'harmonic_union',
        name: 'Harmonic Union',
        geometryType: 'flower',
        conditions: {
          complexity: { min: 0.4, max: 0.7 },
          polarity: { min: 0.45, max: 0.55 }
        },
        teaching: 'Opposites interlace to sustain motion.',
        aphorism: 'Balance is not stillness, but dancing opposites.',
        colorPalette: {
          primary: '#48cae4',
          secondary: '#90e0ef',
          accent: '#00b4d8'
        },
        visualDescription: '6-petal flower with balanced lobes',
        trainsSkill: 'Emotional balance and cognitive flexibility'
      }
    ],
    [
      'shadow_reveal',
      {
        id: 'shadow_reveal',
        name: 'Shadow Reveal',
        geometryType: 'star',
        conditions: {
          residual: { min: 0.55 },
          uncertainty: { min: 0.5 }
        },
        teaching: 'What resists light defines structure.',
        aphorism: 'Your edges are your teachers.',
        colorPalette: {
          primary: '#9d4edd',
          secondary: '#c77dff',
          accent: '#7209b7'
        },
        visualDescription: 'Starburst with sharp projections showing tension lines',
        trainsSkill: 'Shadow integration and discomfort tolerance'
      }
    ],
    [
      'stability_motion',
      {
        id: 'stability_motion',
        name: 'Stability in Motion',
        geometryType: 'platonic',
        conditions: {
          coherence: { min: 0.75 },
          complexity: { min: 0.5 }
        },
        teaching: 'Form anchors flow.',
        aphorism: 'Structure enables rather than constrains.',
        colorPalette: {
          primary: '#2a9d8f',
          secondary: '#264653',
          accent: '#e76f51'
        },
        visualDescription: 'Platonic solid (element-specific) with rotating facets',
        trainsSkill: 'Dynamic stability and adaptive coherence'
      }
    ],
    [
      'shared_field',
      {
        id: 'shared_field',
        name: 'Shared Field',
        geometryType: 'vesica',
        conditions: {
          coherence: { min: 0.6 }
        },
        teaching: 'Resonance grows through relation.',
        aphorism: 'Two becomes vesica becomes field.',
        colorPalette: {
          primary: '#06ffa5',
          secondary: '#05f7a4',
          accent: '#04e595'
        },
        visualDescription: 'Vesica piscis network connecting multiple centers',
        trainsSkill: 'Collective attunement and empathic resonance'
      }
    ],
    [
      'emergence',
      {
        id: 'emergence',
        name: 'Emergence',
        geometryType: 'complex_polygon',
        conditions: {
          complexity: { min: 0.7 },
          coherence: { min: 0.6 }
        },
        teaching: 'Complexity organizes itself when held in awareness.',
        aphorism: 'More parts, one pattern.',
        colorPalette: {
          primary: '#f72585',
          secondary: '#b5179e',
          accent: '#7209b7'
        },
        visualDescription: 'High-order polygon (9+ sides) with intricate symmetry',
        trainsSkill: 'Cognitive flexibility and pattern recognition'
      }
    ],
    [
      'transcendence',
      {
        id: 'transcendence',
        name: 'Transcendence',
        geometryType: 'merkaba',
        conditions: {
          coherence: { min: 0.9 },
          polarity: { min: 0.48, max: 0.52 },
          uncertainty: { max: 0.3 }
        },
        teaching: 'Integration reveals new dimension.',
        aphorism: 'When opposites unite perfectly, form transcends itself.',
        colorPalette: {
          primary: '#ffd60a',
          secondary: '#ffc300',
          accent: '#ffffff'
        },
        visualDescription: 'Interpenetrating tetrahedra (Merkaba) with light passing through',
        trainsSkill: 'Non-dual awareness and dimensional expansion'
      }
    ],
    [
      'adaptive_flow',
      {
        id: 'adaptive_flow',
        name: 'Adaptive Flow',
        geometryType: 'morphing',
        conditions: {
          complexity: { min: 0.5 },
          residual: { min: 0.3, max: 0.6 }
        },
        teaching: 'Tension can resolve into pattern when met with attention.',
        aphorism: 'Resistance becomes resource when recognized.',
        colorPalette: {
          primary: '#06ffa5',
          secondary: '#fffb46',
          accent: '#fe00fe'
        },
        visualDescription: 'Continuously morphing between forms',
        trainsSkill: 'Adaptive regulation and fluidity'
      }
    ]
  ]);

  static getArchetype(id: string): Archetype | undefined {
    return this.archetypes.get(id);
  }

  static detectArchetype(metrics: {
    coherence: number;
    complexity: number;
    polarity: number;
    residual: number;
    uncertainty: number;
  }): Archetype | null {
    for (const [id, archetype] of this.archetypes) {
      if (this.matchesConditions(metrics, archetype.conditions)) {
        return archetype;
      }
    }
    return null;
  }

  private static matchesConditions(
    metrics: Record<string, number>,
    conditions: Archetype['conditions']
  ): boolean {
    for (const [metric, range] of Object.entries(conditions)) {
      const value = metrics[metric];
      if (value === undefined) continue;

      if (range.min !== undefined && value < range.min) return false;
      if (range.max !== undefined && value > range.max) return false;
    }
    return true;
  }

  static getAllArchetypes(): Archetype[] {
    return Array.from(this.archetypes.values());
  }

  static getTeachingForMetrics(metrics: {
    coherence: number;
    complexity: number;
    polarity: number;
    residual: number;
    uncertainty: number;
  }): {
    archetype: Archetype | null;
    teaching: string;
    skill: string;
  } {
    const archetype = this.detectArchetype(metrics);

    if (archetype) {
      return {
        archetype,
        teaching: archetype.teaching,
        skill: archetype.trainsSkill
      };
    }

    return {
      archetype: null,
      teaching: 'Observe without judgment. All states are teachers.',
      skill: 'Awareness itself'
    };
  }

  static getVisualizationCue(metricName: string, value: number): {
    force: string;
    trains: string;
    visualization: string;
  } {
    const cues: Record<string, any> = {
      coherence: {
        force: 'Coherence',
        trains: 'Breath + focus synchronization',
        visualization: value > 0.7
          ? 'Pulses aligning rhythmically'
          : 'Scattered, seeking rhythm'
      },
      complexity: {
        force: 'Complexity',
        trains: 'Cognitive flexibility',
        visualization: value > 0.6
          ? `${Math.round(3 + 9 * value)} petals branching`
          : 'Simple, few facets'
      },
      polarity: {
        force: 'Polarity',
        trains: 'Emotional balance',
        visualization: Math.abs(value - 0.5) < 0.1
          ? 'Warm and cool balanced'
          : value > 0.5
          ? 'Hot colors dominant'
          : 'Cool colors dominant'
      },
      uncertainty: {
        force: 'Uncertainty',
        trains: 'Comfort with unknown',
        visualization: value > 0.6
          ? 'Soft haze, possibility field'
          : 'Crisp edges, clear forms'
      },
      residual: {
        force: 'Residual Tension',
        trains: 'Shadow integration',
        visualization: value > 0.5
          ? 'Star spikes showing tension'
          : 'Smooth curves, tension resolved'
      }
    };

    return cues[metricName] || {
      force: metricName,
      trains: 'Awareness',
      visualization: 'Observe the field'
    };
  }
}
