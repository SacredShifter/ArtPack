# Knowledge Card System

## Overview

The Knowledge Card System transforms consciousness artifacts from simple visual captures into **educational art pieces** that teach users about the sacred geometry, metaphysical principles, and consciousness states embedded in each pack.

When a user captures a snapshot with "Include Knowledge Card" enabled, the system:

1. Generates contextual knowledge based on the current pack and consciousness state
2. Composites a beautiful semi-transparent overlay onto the bottom 35% of the image
3. Renders educational content with sophisticated typography
4. Downloads a single artifact containing both visual art and wisdom

## Architecture

### Core Components

#### `PackKnowledge.ts`
Knowledge templates and dynamic interpretation engine.

**Key Features:**
- Static pack essence, elements, and metaphysical science
- Dynamic interpretation based on coherence and stillness metrics
- Beautiful text formatting with sections and hierarchy
- Timestamp and branding

**Example Usage:**
```typescript
import { generateKnowledgeCard } from './PackKnowledge';

const knowledgeText = generateKnowledgeCard(
  'hidden-lattice',
  85,  // coherence percentage
  60,  // stillness percentage
  Date.now()
);
```

#### `KnowledgeCardCompositor.ts`
Canvas compositing engine for burning knowledge onto images.

**Key Features:**
- Preserves original canvas content
- Adds semi-transparent gradient overlay
- Sophisticated typography rendering with multiple text styles
- Automatic word wrapping for long content
- High-quality PNG output (1.0 quality)

**Example Usage:**
```typescript
import { KnowledgeCardCompositor } from './KnowledgeCardCompositor';

const blob = await KnowledgeCardCompositor.composite(canvas, {
  knowledgeText: generatedText,
  overlayOpacity: 0.92,
  padding: 40,
  fontSize: 14,
  lineHeight: 1.6
});
```

## Knowledge Card Structure

Each knowledge card contains:

### Header
- Pack title (ALL CAPS, bold, spaced)
- Capture timestamp (formatted date and time)

### Consciousness State
- Coherence percentage + interpretation
- Stillness percentage + interpretation

### Essence
Short description of what the pack represents

### Visual Elements
- Element name
- Technical description
- Symbolic meaning

### What This Reveals
Dynamic interpretation based on current metrics:
- High coherence states
- Low coherence states
- Balanced states
- Extreme stillness/movement

### Metaphysical Science
Educational content about:
- Real scientific principles
- Consciousness theory
- Sacred geometry
- Natural patterns

### Footer
Branding and series identification

## Typography System

The compositor automatically styles text based on content:

| Pattern | Style | Purpose |
|---------|-------|---------|
| `ALL CAPS LINE` | Bold, 1.2x size, 95% opacity | Section headers |
| `━━━━━━━` | Horizontal line, 20% opacity | Separators |
| `• Item` | Regular, 80% opacity | Bullet points |
| `  → Symbol` | Italic, 0.95x size, light blue | Symbolism indent |
| `  Indent` | 0.95x size, 75% opacity | Regular indent |
| `Key: value` | Regular, 85% opacity | Metadata pairs |
| Body text | Regular, 80% opacity | Default text |

## Pack Knowledge Templates

Each of The Unseen Series packs has unique knowledge:

### Eternal Void
- **Elements**: Atmospheric depth, particle fields, pregnant emptiness
- **Science**: Quantum vacuum, pre-cognitive awareness, void meditation
- **Dynamic**: Interprets deep meditation states vs. active patterns in darkness

### Whisper Field
- **Elements**: Flow fields, curl noise, ultra-soft gradients
- **Science**: Morphogenetic fields, subtle body awareness, pre-cognitive sensing
- **Dynamic**: Interprets movement energy vs. stillness in flow

### Liminal Threads
- **Elements**: Connection strands, web structure, threshold points
- **Science**: Quantum entanglement, mycelial networks, collective coherence
- **Dynamic**: Interprets network visibility and active weaving states

### Hidden Lattice
- **Elements**: Flower of Life, hexagonal grid, layered depth
- **Science**: Platonic solids, cymatics, information architecture
- **Dynamic**: Interprets crystalline clarity vs. hidden geometric truth

### Synaptic Field
- **Elements**: Neural nodes, firing patterns, network density
- **Science**: Neural networks, emergence, collective intelligence
- **Dynamic**: Interprets high activity vs. quiet mind states

### Interference Realm
- **Elements**: Wave patterns, resonance bands, interference nodes
- **Science**: Wave interference, standing waves, resonance theory
- **Dynamic**: Interprets phase alignment and turbulence states

## Adding New Packs

To add knowledge for a new pack:

1. **Edit `PackKnowledge.ts`**
   ```typescript
   export const PACK_KNOWLEDGE: Record<string, PackKnowledgeTemplate> = {
     'your-new-pack': {
       title: 'YOUR PACK NAME',
       essence: 'Description of what it represents',
       elements: [
         {
           name: 'Element Name',
           description: 'Technical description',
           symbolism: 'What it means symbolically'
         }
       ],
       science: [
         'Scientific principle 1',
         'Scientific principle 2'
       ],
       getInterpretation: (coherence, stillness) => {
         if (coherence > 80) return "High coherence message";
         if (stillness < 20) return "High movement message";
         return "Default interpretation";
       }
     }
   };
   ```

2. **Test the output**
   - Capture with different coherence/stillness values
   - Verify text fits in overlay (35% of canvas height)
   - Check typography and readability

## Design Philosophy

### Educational First
Every knowledge card should:
- Teach something real about consciousness/geometry
- Connect visual elements to meaning
- Provide integration guidance
- Balance technical and poetic language

### Museum Quality
The artifacts should feel like:
- Gallery pieces with artist statements
- Educational exhibits
- Collectible wisdom

### Shareable Wisdom
Each capture becomes:
- A teaching tool
- A conversation starter
- A credibility signal
- A brand ambassador

## Technical Notes

### Canvas Preservation
The system requires `preserveDrawingBuffer: true` on the WebGL renderer to ensure accurate captures.

### Performance
- Compositing adds ~100-200ms to capture time
- Text rendering is synchronous on main thread
- High-resolution canvases work fine (tested up to 4K)

### Font Support
The compositor uses `"Inter", system-ui, sans-serif` font stack. Falls back gracefully if Inter is not loaded.

### Quality
- PNG output at 1.0 quality (maximum)
- Overlay gradient opacity: 0.92 (adjustable)
- Text anti-aliasing: native canvas subpixel rendering

## Future Enhancements

Potential improvements:
- AI-generated insights based on session telemetry
- Collective session stats (participant count, avg coherence)
- QR codes linking to deeper content
- Animated knowledge card previews
- Multi-language support
- Accessibility features (high-contrast mode)

## Integration Example

Complete implementation in `UnseenSeriesDemo.tsx`:

```typescript
import { generateKnowledgeCard } from '../modules/artpacks/PackKnowledge';
import { KnowledgeCardCompositor } from '../modules/artpacks/KnowledgeCardCompositor';

const [includeKnowledgeCard, setIncludeKnowledgeCard] = useState(true);

const captureSnapshot = async () => {
  if (includeKnowledgeCard) {
    const knowledgeText = generateKnowledgeCard(
      currentPack.id,
      coherence * 100,
      stillness * 100,
      Date.now()
    );

    blob = await KnowledgeCardCompositor.composite(canvas, {
      knowledgeText,
      overlayOpacity: 0.92,
      padding: 40,
      fontSize: 14,
      lineHeight: 1.6
    });
  } else {
    blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });
  }

  // Download with descriptive filename
  a.download = `unseen-${packId}-${suffix}-${timestamp}.png`;
};
```

---

**This system transforms Sacred Shifter from a visual tool into a consciousness education platform.**

Every capture becomes a teaching moment. Every share spreads wisdom. Every artifact is museum-quality.

🎨📚✨
