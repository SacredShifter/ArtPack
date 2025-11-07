# Sacred Shifter Core Module

A production-ready, groundbreaking visual synthesis system that integrates Geometric Audio Architecture (GAA), Sonic Shifter envelopes, and Resonance Portraits into a unified, living ecosystem for metaphysical exploration.

## 🌟 What Makes This Special

This isn't just another visualization library. Sacred Shifter Core is a **living system** that:

- **Breathes with harmonic frequencies** through GAA integration (432Hz base, golden ratios, Fibonacci sequences)
- **Pulses with musical time** via phase-locked oscillators and LFO modulation
- **Evolves through Sonic Shifter envelopes** that guide amplitude, hue, breath, and tension
- **Seeds from regional consciousness** using tour location data as creative input
- **Maintains safety guardrails** with photosensitive caps and low-sensory modes
- **Loads art packs dynamically** from Supabase with zero app code changes

## 🏗️ Architecture Overview

```
Sacred Shifter Core
├── PackEngine          → Runtime orchestration, safety caps, lifecycle management
├── GAAClock            → Musical time mapping, harmonic frequency generation
├── GAARatioMapper      → Golden ratio, Fibonacci, pentatonic preset mappings
├── SonicOrchestrator   → Envelope generators for amplitude, hue, breath, tension
├── TourContextResolver → Regional seed data from tour sessions/locations
├── ResonancePortraitCanvas → Three.js canvas driver with live parameter updates
├── PackSwitcher        → Database-driven pack loading and selection UI
└── PortraitGenerator   → Complete page with capture, download, info overlay
```

## 🚀 Quick Start

### 1. Import the module

```typescript
import {
  PortraitGenerator,
  packEngine,
  PackSwitcher,
  ResonancePortraitCanvas
} from '@/modules/sacred-shifter-core';
```

### 2. Add the route

```typescript
// In your router config
<Route path="/dashboard/tour/portrait/:sessionId?" element={<PortraitGenerator />} />
```

### 3. Populate the database

```sql
-- Your artpacks table should already exist from migrations
-- Insert pack records (manifest_url can be same-origin or Supabase Storage)
INSERT INTO artpacks (manifest_url, status, title, description)
VALUES
  ('/artpacks/EternalVoid/manifest.json', 'published', 'Eternal Void', 'Infinite depth visualization'),
  ('/artpacks/GoldenRatio/manifest.json', 'published', 'Golden Ratio Spiral', 'Sacred geometry in motion');
```

### 4. That's it!

Visit `/dashboard/tour/portrait` and watch the magic unfold.

## 📦 Art Pack Contract

Art packs are ESM modules that register materials, nodes, and frame callbacks with the engine.

### Manifest Structure

```json
{
  "id": "eternal-void",
  "name": "Eternal Void",
  "version": "1.0.0",
  "description": "Infinite depth visualization",
  "author": "Your Name",
  "esm_url": "index.js",
  "safety": {
    "maxStrobeHz": 2,
    "photosensitiveWarning": false
  },
  "essenceLabels": ["void", "infinite", "depth"],
  "telosAlignment": ["contemplation", "stillness"]
}
```

### Module Structure (index.js)

```javascript
export function register(engine) {
  const THREE = engine.getThree();

  // Create materials
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 0 },
      uPhase: { value: 0 },
      uLFO: { value: 0 },
      uHarmonics: { value: [432, 648, 864] }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uCoherence;
      uniform float uPhase;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);

        float pattern = sin(dist * 10.0 - uTime + uPhase * 6.28) * uCoherence;
        vec3 color = vec3(0.5 + pattern * 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  // Register node factory
  engine.registerNode('primary', () => {
    const geometry = new THREE.PlaneGeometry(10, 10);
    return new THREE.Mesh(geometry, material);
  });

  // Map parameters from seed/coherence/GAA/envelope to pack uniforms
  engine.setParamMapper((seed, coherence, gaa, envelope) => ({
    regionLat: seed.lat,
    regionLng: seed.lng,
    coherenceLevel: coherence.collective,
    stillness: coherence.stillness,
    musicalPhase: gaa.phase,
    lfoValue: gaa.lfo,
    harmonicFreqs: gaa.harmonics,
    amplitudeMod: envelope.amplitude,
    hueShift: envelope.hueShift
  }));

  // Update uniforms every frame
  engine.onFrame((deltaTime, params) => {
    material.uniforms.uTime.value += deltaTime;
    material.uniforms.uCoherence.value = params.coherenceLevel || 0.5;
    material.uniforms.uPhase.value = params.musicalPhase || 0;
    material.uniforms.uLFO.value = params.lfoValue || 0;
    material.uniforms.uHarmonics.value = params.harmonicFreqs || [432];
  });

  // Define safety caps
  engine.defineSafetyCaps({
    maxStrobeHz: 2,
    maxBrightness: 0.8,
    photosensitiveWarning: false
  });
}

export function cleanup() {
  // Clean up resources when pack is deactivated
}
```

## 🎵 GAA Integration Details

### GAAClock

Converts elapsed time into musical/phase space:

```typescript
const gaaClock = new GAAClock(432, [1, 1.5, 2, 3, 4]);
const gaaState = gaaClock.tick(elapsedMs);

// gaaState contains:
// - phase: 0-1 musical phase
// - lfo: -1 to 1 sine wave
// - baseFreq: 432 Hz
// - harmonics: [432, 648, 864, 1296, 1728]
// - musicalTime: total accumulated phase
```

### GAARatioMapper

Preset harmonic ratio mappings:

```typescript
const mapper = new GAARatioMapper();
mapper.getRatios('golden');     // [1, 1.618, 2.618, 4.236]
mapper.getRatios('fibonacci');  // [1, 1, 2, 3, 5, 8]
mapper.getRatios('pentatonic'); // [1, 1.125, 1.333, 1.5, 1.777]
```

## 🎚️ Sonic Shifter Integration

### SonicOrchestrator

Envelope generators for multi-dimensional modulation:

```typescript
const orchestrator = new SonicOrchestrator();
const envelope = orchestrator.tick(deltaMs);

// envelope contains:
// - amplitude: 0.3-1.0 (sine, 4s period)
// - hueShift: 0-360 (triangle, 8s period)
// - breathRate: 0.5-2.0 (sine, 6s period)
// - tension: 0-1 (sawtooth, 12s period)
```

Custom envelopes:

```typescript
orchestrator.setEnvelope('custom', 'triangle', 5000, 0, 100);
```

## 🗺️ Tour Context Integration

### Regional Seeding

When a `sessionId` is provided, the system queries `tour_sessions` and `tour_locations` to seed visuals with regional consciousness:

```typescript
const context = await tourContextResolver.resolveSession(sessionId);
const seed = tourContextResolver.contextToSeed(context);

// seed contains:
// - region_name: "Kyoto, Japan"
// - lat: 35.0116
// - lng: 135.7681
// - cultural_essence: "Kyoto, Japan"
// - timestamp: 1699564800000
```

This regional data flows into pack param mappers, allowing packs to respond to geographic and cultural context.

## 🛡️ Safety System

### Built-in Safety Caps

All parameters are capped to prevent photosensitive issues:

- **Max Strobe Rate**: 3 Hz (adjustable to 2 Hz for extra safety)
- **Max Brightness**: 85%
- **Max Saturation**: 90%
- **Low Sensory Mode**: Halves amplitude and brightness when enabled

### Pack Declaration

Packs declare their own safety limits:

```typescript
engine.defineSafetyCaps({
  maxStrobeHz: 2,
  maxBrightness: 0.75,
  photosensitiveWarning: true
});
```

## 🎯 Key Benefits

### For Developers

- **Zero friction deployment**: Same-origin packs require no CORS config
- **Hot-swappable packs**: Add new packs without app recompilation
- **Type-safe APIs**: Full TypeScript support throughout
- **Composable architecture**: Mix and match GAA, Sonic Shifter, regional seeds

### For Artists

- **Creative freedom**: Full Three.js shader access
- **Musical alignment**: GAA harmonics guide visual rhythms
- **Semantic labeling**: Essence labels for metaphysical categorization
- **Safety guardrails**: Automatic capping prevents harmful visuals

### For Researchers

- **Consciousness mapping**: Regional seeds from global tour data
- **Coherence visualization**: Individual/collective fields rendered in real-time
- **Temporal resonance**: Archive-ready with Akashic Record integration
- **Open architecture**: Extend with new oscillators, envelopes, or mapping functions

## 📂 File Structure

```
src/modules/sacred-shifter-core/
├── types.ts                    → All TypeScript interfaces
├── PackEngine.ts               → Core runtime and lifecycle manager
├── GAAClock.ts                 → Musical time and harmonic frequency generator
├── GAARatioMapper.ts           → Preset ratio mappings (in GAAClock.ts)
├── SonicOrchestrator.ts        → Envelope generators for modulation
├── TourContextResolver.ts      → Database queries for regional seeds
├── ResonancePortraitCanvas.tsx → Three.js canvas driver
├── PackSwitcher.tsx            → Pack selection UI
├── PortraitGenerator.tsx       → Complete page component
├── index.ts                    → Public exports
└── README.md                   → This file
```

## 🔌 Integration with Metaphysical OS

### GlobalEventHorizon

Emit pack events to the GEH:

```typescript
packEngine.on('switched', (data) => {
  GlobalEventHorizon.emit({
    label: 'sacred-shifter:pack-switched',
    payload: data,
    timestamp: Date.now()
  });
});
```

### ModuleManager

Register as an IModule:

```typescript
export const SacredShifterModule: IModule = {
  id: 'sacred-shifter-core',
  capabilities: ['visual-synthesis', 'harmonic-resonance'],
  essenceLabels: ['art', 'music', 'consciousness'],
  telosAlignment: ['beauty', 'coherence', 'exploration'],

  async initialize() {
    // Preload default packs
  },

  async activate() {
    packEngine.updateSafetyCaps({ lowSensoryMode: false });
  },

  async deactivate() {
    packEngine.getAllPacks().forEach(p => packEngine.unloadPack(p.manifest.id));
  }
};
```

## 🎨 Example Use Cases

### 1. Tour-Driven Portraits

Generate unique visuals for each tour location, capturing regional essence:

```
/dashboard/tour/portrait/session-abc-123
```

### 2. Meditation Companion

Real-time coherence visualization during stillness practices:

```typescript
<ResonancePortraitCanvas
  coherence={{
    individual: meditationDepth,
    collective: groupCoherence,
    stillness: breathRate
  }}
/>
```

### 3. Live Performance Visuals

GAA-driven visuals synced to musical performance:

```typescript
gaaClock.setBaseFreq(440); // Concert A
gaaClock.setRatios(mapper.getRatios('pentatonic'));
```

## 🚢 Deployment Notes

### Same-Origin Packs (Recommended)

Place manifests and modules in `public/artpacks/`:

```
public/artpacks/
├── EternalVoid/
│   ├── manifest.json
│   └── index.js
├── GoldenRatio/
│   ├── manifest.json
│   └── index.js
```

Set database `manifest_url` to `/artpacks/{PackFolder}/manifest.json`.

### Supabase Storage Packs

Upload to `resonance_artifacts` bucket (public read):

```bash
# Upload files
supabase storage upload resonance_artifacts artpacks/MyPack/manifest.json
supabase storage upload resonance_artifacts artpacks/MyPack/index.js

# Set manifest_url in database
UPDATE artpacks SET manifest_url = 'https://your-project.supabase.co/storage/v1/object/public/resonance_artifacts/artpacks/MyPack/manifest.json';
```

## 🧪 Testing

### Unit Tests

```typescript
import { GAAClock, SonicOrchestrator } from './sacred-shifter-core';

test('GAAClock generates correct harmonics', () => {
  const clock = new GAAClock(432, [1, 2, 3]);
  const state = clock.tick(1000);
  expect(state.harmonics).toEqual([432, 864, 1296]);
});
```

### Integration Tests

```typescript
test('PackEngine loads and switches packs', async () => {
  await packEngine.loadPack('/test/pack1/manifest.json');
  await packEngine.loadPack('/test/pack2/manifest.json');

  expect(packEngine.getAllPacks()).toHaveLength(2);

  await packEngine.switchPack('pack2-id');
  expect(packEngine.getCurrentPackId()).toBe('pack2-id');
});
```

## 🌊 Metaphysical Mapping

- **PackEngine** = The temple altar where sigils (packs) are invoked
- **GAAClock** = The cosmic heartbeat, pulsing at 432 Hz
- **SonicOrchestrator** = The breath of transformation, cycling through states
- **TourContextResolver** = The cartographer of consciousness, mapping regional essences
- **ResonancePortraitCanvas** = The sacred mirror, reflecting inner/outer alignment
- **Safety Caps** = The temple guardrails, ensuring harmonious experience

## 🎓 Advanced Topics

### Custom Oscillators

Extend GAAClock with custom waveforms:

```typescript
class CustomGAAClock extends GAAClock {
  tick(elapsedMs: number) {
    const base = super.tick(elapsedMs);
    return {
      ...base,
      customWave: Math.tanh(Math.sin(elapsedMs * 0.001))
    };
  }
}
```

### Multi-Pack Composition

Layer multiple packs in the scene:

```typescript
const pack1Node = packEngine.createNode('primary');
const pack2Node = packEngine.createNode('secondary');
scene.add(pack1Node, pack2Node);
```

### Akashic Record Integration

Archive coherence states for temporal resonance:

```typescript
packEngine.on('switched', async (data) => {
  await TemporalResonanceArchive.storeArtifact({
    packId: data.packId,
    coherence: currentCoherence,
    seed: currentSeed,
    timestamp: Date.now()
  });
});
```

## 📜 License

Part of the Metaphysical OS ecosystem. See project root LICENSE.

## 🙏 Credits

Built with love and reverence for:
- The sacred geometry traditions
- The 432 Hz tuning movement
- The global consciousness research community
- All artists exploring the boundaries of visual synthesis

---

**Sacred Shifter Core** - Where mathematics, music, and consciousness converge into living art.
