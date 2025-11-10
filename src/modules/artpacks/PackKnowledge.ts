/**
 * The Unseen Series - Pack Knowledge System
 * Museum-quality knowledge cards for consciousness artifacts
 */

export interface PackKnowledgeTemplate {
  title: string;
  essence: string;
  visualNote: string;
  getInterpretation: (coherence: number, stillness: number) => string;
  foundation: string;
}

function interpretState(coherence: number, stillness: number): string {
  const cDesc =
    coherence < 20 ? "Pre-formation. Chaos holds the field." :
    coherence < 40 ? "Order emerging. Patterns forming beneath surface." :
    coherence < 60 ? "Equilibrium. Structure becoming visible." :
    coherence < 80 ? "Clarity. Strong pattern recognition." :
    "Crystalline. Maximum resolution achieved.";

  const sDesc =
    stillness < 20 ? "Rapid flux. High kinetic energy." :
    stillness < 40 ? "Active flow. Motion seeking form." :
    stillness < 60 ? "Poised between rest and motion." :
    stillness < 80 ? "Deep calm. Subtle pulse beneath stillness." :
    "Absolute quiet. Pure presence.";

  return `Coherence: ${coherence.toFixed(0)}% — ${cDesc}\nStillness: ${stillness.toFixed(0)}% — ${sDesc}`;
}

export const PACK_KNOWLEDGE: Record<string, PackKnowledgeTemplate> = {
  'eternal-void': {
    title: 'ETERNAL VOID',
    essence: 'The primordial dark. Not absence, but pregnant silence — the field before form, awareness before thought. Here, consciousness rests in its most fundamental state, watching itself from within the unseen.',
    visualNote: 'Atmospheric depths. Sparse luminous points suspended in darkness. Space that feels full despite emptiness. The void breathes.',
    foundation: 'Quantum vacuum potential. Pre-cognitive awareness. Zero-point field of infinite possibility. The silence before the first vibration.',
    getInterpretation: (coherence, stillness) => {
      if (coherence < 30 && stillness > 70) {
        return "Deep meditation state achieved. You have touched the threshold where consciousness dissolves into pure being.";
      }
      if (coherence > 60) {
        return "Even emptiness reveals structure at high coherence. The void becomes luminous. This is the paradox.";
      }
      return "The void invites surrender. Release form. Rest in the dark that knows itself.";
    }
  },

  'whisper-field': {
    title: 'WHISPER FIELD',
    essence: 'The earliest stirrings of awareness moving through the unseen. A quiet pulse beneath the dark — not yet form, not yet thought, only potential shifting toward expression.',
    visualNote: 'Barely perceptible currents. Soft modulation in shadow. Shapes half-formed, dissolving, reforming. The whisper before the rise.',
    foundation: 'Morphogenetic fields guiding pre-formation. Subtle energy preceding physical sensation. The threshold where knowing precedes thinking.',
    getInterpretation: (coherence, stillness) => {
      if (stillness < 30) {
        return "High kinetic state. Consciousness explores itself through movement, dancing at the edge of manifestation.";
      }
      if (coherence > 70 && stillness > 70) {
        return "Equilibrium achieved. Movement within stillness. The whisper becomes audible without breaking silence.";
      }
      return "Listen beneath the surface. Even in quiet, consciousness moves. Attend to what stirs.";
    }
  },

  'liminal-threads': {
    title: 'LIMINAL THREADS',
    essence: 'The web revealed. Invisible currents become visible filaments — evidence of connection that precedes separation. Each point touches every other point through the architecture of awareness itself.',
    visualNote: 'Luminous strands weaving through darkness. Intersection nodes pulsing with convergence. The network of all-touching-all, made visible.',
    foundation: 'Non-local connection. Quantum entanglement as metaphor and mechanism. Mycelial intelligence. Distributed consciousness operating as unified field.',
    getInterpretation: (coherence, stillness) => {
      if (coherence > 60) {
        return "The infrastructure becomes visible. This is the lattice underlying apparent separation — always present, now seen.";
      }
      if (stillness < 40) {
        return "Active weaving. New connections forming in real-time. The web restructures itself through your attention.";
      }
      return "Connection precedes isolation. The threads are always present, whether visible or not. You are held.";
    }
  },

  'hidden-lattice': {
    title: 'HIDDEN LATTICE',
    essence: 'Sacred architecture made visible. Geometric principles that organize chaos into cosmos — the blueprint consciousness uses to structure itself into recognizable form.',
    visualNote: 'Overlapping circles. Hexagonal grids. Crystalline layers creating dimensional depth. Order revealing itself through symmetry and proportion.',
    foundation: 'Platonic forms as consciousness scaffolding. Cymatics — sound creating geometry. The mathematics of manifestation.',
    getInterpretation: (coherence, stillness) => {
      if (coherence > 80) {
        return "Maximum clarity achieved. The hidden order stands fully revealed. This is the architecture beneath all appearance.";
      }
      if (coherence < 40) {
        return "The lattice remains veiled. Increase coherence to witness the geometric truth that structures reality.";
      }
      return "Sacred geometry is always present beneath the surface. It does not appear — it is revealed.";
    }
  },

  'synaptic-field': {
    title: 'SYNAPTIC FIELD',
    essence: 'Intelligence awakening to itself. The moment awareness recognizes its own patterns — thought-forms emerging, connections firing, the network becoming conscious of being a network.',
    visualNote: 'Glowing nodes of concentrated presence. Cascading activation patterns. Dense interconnection creating emergent complexity.',
    foundation: 'Neural architecture as consciousness template. Emergence from simple rules. Collective intelligence operating as singular mind.',
    getInterpretation: (coherence, stillness) => {
      if (coherence > 70 && stillness < 30) {
        return "High activity, high clarity. Rapid insight state. The network processes itself at speed, watching its own thinking.";
      }
      if (stillness > 70) {
        return "Quiet observation. The network rests while remaining aware. Consciousness witnesses without disturbing itself.";
      }
      return "Intelligence is pattern recognizing pattern. Watch the watching. This is the recursion.";
    }
  },

  'interference-realm': {
    title: 'INTERFERENCE REALM',
    essence: 'Where waves meet and reality manifests. Form emerges through interference — not from substance, but from patterns meeting patterns, creating standing waves of being.',
    visualNote: 'Concentric ripples propagating outward. Resonance zones where frequencies align. Nodes of constructive and destructive interference.',
    foundation: 'Wave superposition creating form from oscillation. Standing waves as stable patterns. Resonance theory — alignment amplifies.',
    getInterpretation: (coherence, stillness) => {
      if (coherence > 60) {
        return "Strong resonance achieved. Waves aligned. Interference patterns clear. You are in phase with the field.";
      }
      if (stillness < 30) {
        return "High turbulence. Multiple frequencies competing. The chaos before coherence — necessary, not wrong.";
      }
      return "Everything vibrates. Form is frozen music. Where patterns meet, reality appears.";
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

Captured • ${formattedDate} • ${formattedTime}

CONSCIOUSNESS STATE
${interpretState(coherence, stillness)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESSENCE
${pack.essence}

VISUAL ELEMENTS
${pack.visualNote}

REVELATION
${pack.getInterpretation(coherence, stillness)}

FOUNDATION
${pack.foundation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Unseen Series — Sacred Shifter
Consciousness made visible`;
}
