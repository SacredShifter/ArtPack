/**
 * The Unseen Series - Pack Knowledge System
 * Generates educational knowledge cards for captured consciousness artifacts
 */

export interface PackKnowledgeTemplate {
  title: string;
  essence: string;
  elements: {
    name: string;
    description: string;
    symbolism: string;
  }[];
  science: string[];
  getInterpretation: (coherence: number, stillness: number) => string;
}

function interpretCoherence(coherence: number): string {
  if (coherence < 20) return "Pre-formation state. Chaos reigns. Patterns dormant.";
  if (coherence < 40) return "Initial stirrings. Order begins to emerge from chaos.";
  if (coherence < 60) return "Stabilizing. Patterns becoming visible and coherent.";
  if (coherence < 80) return "High clarity. Strong pattern recognition and structure.";
  return "Crystalline perfection. Maximum pattern visibility achieved.";
}

function interpretStillness(stillness: number): string {
  if (stillness < 20) return "Rapid flux. High energy, dynamic transformation.";
  if (stillness < 40) return "Active flow. Movement with emerging stability.";
  if (stillness < 60) return "Balanced. Dynamic stillness, motion in equilibrium.";
  if (stillness < 80) return "Deep calm. Subtle movement within profound peace.";
  return "Absolute stillness. Pure presence, no disturbance.";
}

export const PACK_KNOWLEDGE: Record<string, PackKnowledgeTemplate> = {
  'eternal-void': {
    title: 'ETERNAL VOID',
    essence: 'The primordial darkness before creation. Pure potential waiting to manifest. This is consciousness in its most fundamental state - aware, but not yet formed.',
    elements: [
      {
        name: 'Atmospheric Depth',
        description: 'Layered darkness with subtle gradients',
        symbolism: 'The infinite depths of unmanifest consciousness'
      },
      {
        name: 'Particle Fields',
        description: 'Sparse luminous points in darkness',
        symbolism: 'First sparks of awareness in the void'
      },
      {
        name: 'Pregnant Emptiness',
        description: 'Space that feels full despite being empty',
        symbolism: 'The zero-point field of infinite possibility'
      }
    ],
    science: [
      'Quantum vacuum fluctuations - emptiness that seethes with potential',
      'Pre-cognitive awareness - consciousness before thought',
      'The void in meditation - dissolution of form into pure being'
    ],
    getInterpretation: (coherence, stillness) => {
      if (coherence < 30 && stillness > 70) {
        return "Deep meditation state. You've touched the void where consciousness rests before manifestation.";
      }
      if (coherence > 60) {
        return "Even the void reveals patterns at high coherence. The emptiness becomes luminous.";
      }
      return "The void invites you to release all form and rest in pure awareness.";
    }
  },

  'whisper-field': {
    title: 'WHISPER FIELD',
    essence: 'The first subtle movements of consciousness awakening. Like breath stirring still air, these are the initial currents that precede all form and thought.',
    elements: [
      {
        name: 'Flow Fields',
        description: 'Gentle, organic movement patterns',
        symbolism: 'The breath of consciousness, subtle energy currents'
      },
      {
        name: 'Curl Noise',
        description: 'Smooth, turbulence-free flow',
        symbolism: 'Natural, effortless movement without resistance'
      },
      {
        name: 'Ultra-Soft Gradients',
        description: 'Barely perceptible transitions',
        symbolism: 'The liminal space between states'
      }
    ],
    science: [
      'Morphogenetic fields - invisible patterns that guide formation',
      'Subtle body awareness - sensing energy before physical sensation',
      'Pre-cognitive sensing - knowing before thinking'
    ],
    getInterpretation: (coherence, stillness) => {
      if (stillness < 30) {
        return "High movement energy. Your consciousness is actively exploring, dancing through possibility space.";
      }
      if (coherence > 70 && stillness > 70) {
        return "Perfect balance. Movement within stillness - the whisper of awareness itself.";
      }
      return "Listen to the subtle currents. Consciousness always moves, even in silence.";
    }
  },

  'liminal-threads': {
    title: 'LIMINAL THREADS',
    essence: 'The invisible web connecting all things. These filaments reveal the interconnected nature of consciousness - how every point touches every other point through the fabric of awareness.',
    elements: [
      {
        name: 'Connection Strands',
        description: 'Luminous threads weaving through space',
        symbolism: 'Quantum entanglement, non-local connections'
      },
      {
        name: 'Web Structure',
        description: 'Organic network of intersecting paths',
        symbolism: 'Mycelial intelligence, distributed consciousness'
      },
      {
        name: 'Threshold Points',
        description: 'Nodes where threads converge',
        symbolism: 'Moments of heightened connection and coherence'
      }
    ],
    science: [
      'Quantum entanglement - instant connection across any distance',
      'Mycelial networks - decentralized intelligence in nature',
      'Collective coherence - synchronized consciousness fields'
    ],
    getInterpretation: (coherence, stillness) => {
      if (coherence > 60) {
        return "The network becomes visible. You're seeing the infrastructure of interconnection itself.";
      }
      if (stillness < 40) {
        return "Active weaving. New connections forming, the web restructuring in real-time.";
      }
      return "The threads are always there, even when invisible. Everything is connected.";
    }
  },

  'hidden-lattice': {
    title: 'HIDDEN LATTICE',
    essence: 'The sacred geometric blueprint underlying reality. These crystalline structures are the universal organizing principles - how consciousness creates order from chaos.',
    elements: [
      {
        name: 'Flower of Life',
        description: 'Seven overlapping circles forming perfect symmetry',
        symbolism: 'The seed pattern of creation, found across cultures and cosmos'
      },
      {
        name: 'Hexagonal Grid',
        description: 'Six-fold symmetry creating honeycomb structure',
        symbolism: 'Maximum efficiency pattern, divine proportion'
      },
      {
        name: 'Layered Depth',
        description: 'Multiple geometric planes creating parallax',
        symbolism: 'Dimensional awareness, multi-level consciousness'
      }
    ],
    science: [
      'Platonic solids - the five perfect geometric forms',
      'Cymatics - sound creating visible geometric patterns',
      'Information architecture - how consciousness structures data'
    ],
    getInterpretation: (coherence, stillness) => {
      if (coherence > 80) {
        return "Crystalline clarity. The hidden order is fully revealed. This is the architecture of consciousness.";
      }
      if (coherence < 40) {
        return "The lattice remains hidden. Increase coherence to see the underlying geometric truth.";
      }
      return "Sacred geometry is always present, waiting to be recognized. Look deeper.";
    }
  },

  'synaptic-field': {
    title: 'SYNAPTIC FIELD',
    essence: 'Intelligence awakening. This is consciousness lighting up like a neural network, thought-forms emerging, connections firing. The moment awareness becomes self-aware.',
    elements: [
      {
        name: 'Neural Nodes',
        description: 'Glowing points of concentrated awareness',
        symbolism: 'Individual moments of insight and recognition'
      },
      {
        name: 'Firing Patterns',
        description: 'Cascading waves of activation',
        symbolism: 'Thought propagation, idea transmission'
      },
      {
        name: 'Network Density',
        description: 'Clusters of high interconnection',
        symbolism: 'Collective intelligence, emergent complexity'
      }
    ],
    science: [
      'Neural networks - biological and artificial intelligence patterns',
      'Emergence - how complexity arises from simple interactions',
      'Collective intelligence - group minds thinking as one'
    ],
    getInterpretation: (coherence, stillness) => {
      if (coherence > 70 && stillness < 30) {
        return "High activity, high clarity. Rapid-fire insights. Your consciousness is actively processing.";
      }
      if (stillness > 70) {
        return "Quiet mind, active awareness. Consciousness observing itself without disturbance.";
      }
      return "The network is always thinking. Watch the patterns of your own awareness.";
    }
  },

  'interference-realm': {
    title: 'INTERFERENCE REALM',
    essence: 'Where waves meet and create reality. This is the principle of how consciousness manifests form - through the interference of patterns, resonance creates standing waves of being.',
    elements: [
      {
        name: 'Wave Patterns',
        description: 'Concentric ripples propagating outward',
        symbolism: 'Consciousness as wave function, probability fields'
      },
      {
        name: 'Resonance Bands',
        description: 'Zones where frequencies align',
        symbolism: 'Harmonic coherence, synchronized states'
      },
      {
        name: 'Interference Nodes',
        description: 'Points where waves amplify or cancel',
        symbolism: 'Manifestation points, where form emerges from pattern'
      }
    ],
    science: [
      'Wave interference - constructive and destructive superposition',
      'Standing waves - stable patterns from dynamic oscillation',
      'Resonance theory - how frequencies amplify through alignment'
    ],
    getInterpretation: (coherence, stillness) => {
      if (coherence > 60) {
        return "Strong resonance. Waves aligned, interference patterns clear. You're in phase with the field.";
      }
      if (stillness < 30) {
        return "High turbulence. Many frequencies competing. Chaos before coherence.";
      }
      return "Everything is vibration. Form emerges where waves meet in harmony.";
    }
  }
};

export function generateKnowledgeCard(
  packId: string,
  coherence: number,
  stillness: number,
  timestamp: number
): string {
  const pack = PACK_KNOWLEDGE[packId];
  if (!pack) return '';

  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${pack.title}
Captured: ${formattedDate} • ${formattedTime}

CONSCIOUSNESS STATE
Coherence: ${coherence.toFixed(0)}% — ${interpretCoherence(coherence)}
Stillness: ${stillness.toFixed(0)}% — ${interpretStillness(stillness)}

ESSENCE
${pack.essence}

VISUAL ELEMENTS
${pack.elements.map(el => `• ${el.name}\n  ${el.description}\n  → ${el.symbolism}`).join('\n\n')}

WHAT THIS REVEALS
${pack.getInterpretation(coherence, stillness)}

METAPHYSICAL SCIENCE
${pack.science.map(s => `• ${s}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Unseen Series — Sacred Shifter
Consciousness made visible through geometry and light`;
}
