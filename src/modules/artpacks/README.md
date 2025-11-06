# Art Pack Framework

Dynamic, pluggable visual systems for Sacred Shifter's Resonance Portrait engine. Art Packs are self-contained modules that define shaders, materials, 3D nodes, and animation logic responding to real-time coherence data and regional seed parameters.

## Architecture

### Core Components

- **ArtPackEngine**: Singleton registry managing materials, nodes, parameter mapping, and frame callbacks
- **PackSwitcher**: React UI component for loading and switching packs
- **Type System**: Comprehensive TypeScript interfaces for type-safe pack development

### Data Flow

```
RegionSeed + CoherenceSample
        ↓
  paramMapper (your function)
        ↓
   Shader uniforms + frame logic
        ↓
  Rendered visual output
```

## Creating an Art Pack

### 1. Manifest Structure

Create `manifest.json`:

```json
{
  "id": "your-pack-id",
  "name": "Display Name",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Brief description of visual style and behavior",
  "entry": "index.ts",
  "minEngine": "1.0.0",
  "safety": {
    "maxStrobeHz": 2.5,
    "photosensitiveWarning": false
  }
}
```

#### Required Fields

- `id`: Unique identifier (kebab-case recommended)
- `name`: Human-readable pack name
- `version`: Semantic version
- `entry`: Entry point file relative to manifest
- `minEngine`: Minimum engine version required

#### Safety Guidelines

- `maxStrobeHz`: Maximum flicker frequency (≤3 Hz recommended)
- `photosensitiveWarning`: Set true if pack contains rapid color/brightness changes

### 2. Entry Point Implementation

Create `index.ts`:

```typescript
import * as THREE from 'three';
import type { EngineAPI, RegionSeed, CoherenceSample } from '../types';

export function register(engine: EngineAPI): void {
  // Register materials
  const material = new THREE.ShaderMaterial({
    vertexShader: `...`,
    fragmentShader: `...`,
    uniforms: {
      uTime: { value: 0 },
      uHue: { value: 0.5 }
    }
  });

  engine.registerMaterial('myMaterial', material);

  // Register node factories
  engine.registerNode('myNode', () => {
    const geometry = new THREE.SphereGeometry(10, 32, 32);
    return new THREE.Mesh(geometry, material);
  });

  // Map environmental/physiological data to shader params
  engine.setParamMapper((region: RegionSeed, coherence: CoherenceSample) => {
    return {
      hue: (region.lat + 90) / 180,
      amplitude: coherence.amplitude,
      brightness: coherence.amplitude * 0.8
    };
  });

  // Animation loop
  let time = 0;
  engine.onFrame((deltaTime: number, params: Record<string, any>) => {
    time += deltaTime;
    material.uniforms.uTime.value = time;
    material.uniforms.uHue.value = params.hue;
  });

  // Define safety caps
  engine.defineSafetyCaps({
    maxStrobeHz: 2.5,
    maxBrightness: 0.8,
    maxSaturation: 0.9
  });
}

export function cleanup(): void {
  // Dispose resources when pack is unloaded
}
```

### 3. Engine API Reference

#### `registerMaterial(name: string, material: THREE.Material)`

Register a Three.js material (ShaderMaterial, MeshStandardMaterial, etc.)

#### `registerNode(name: string, factory: () => THREE.Object3D)`

Register a factory function that creates 3D objects. Factory is called each time a new instance is needed.

#### `setParamMapper(fn: (region, coherence) => Record<string, any>)`

Define how environmental and physiological inputs map to shader parameters.

**Inputs:**
- `RegionSeed`: Geographic location and harmonic entropy
  - `lat`, `lon`: Coordinates
  - `entropy`: Regional entropy value (0-100)
  - `harmonics`: Array of harmonic frequencies

- `CoherenceSample`: Live collective field data
  - `timestamp`: Sample time
  - `amplitude`: Field strength (0-1)
  - `phase`: Current phase angle
  - `frequency`: Dominant frequency

**Outputs:**
Return any key-value pairs to pass to frame callbacks. Common params:
- `hue`, `saturation`, `brightness`
- `amplitude`, `phase`
- Custom uniforms for your shaders

#### `onFrame(fn: (deltaTime, params) => void)`

Register animation callback executed every frame.

- `deltaTime`: Time since last frame (seconds)
- `params`: Result from `paramMapper` with safety caps applied

#### `defineSafetyCaps(caps: Partial<SafetyCaps>)`

Declare safe operating bounds:

```typescript
{
  maxStrobeHz: 3,           // Maximum flicker rate
  maxBrightness: 0.85,      // Max luminance (0-1)
  maxSaturation: 0.9,       // Max color saturation (0-1)
  lowSensoryMode: false     // Reduce intensity for accessibility
}
```

## Safety Requirements

### Critical Rules

1. **No strobing above 3 Hz**: Respect photosensitive epilepsy guidelines
2. **Brightness caps**: Never exceed maxBrightness (default 0.85)
3. **Low-sensory mode**: Reduce amplitude/brightness when enabled
4. **Resource cleanup**: Always implement `cleanup()` to dispose materials/geometries

### Testing Checklist

- [ ] No rapid flashing or strobing
- [ ] Brightness stays within safe range
- [ ] Low-sensory mode reduces intensity appropriately
- [ ] Resources properly disposed on pack switch
- [ ] Params gracefully handle missing/null values

## Example: Aurora Triad Pack

See `SamplePack_AuroraTriad/` for complete working example featuring:

- Custom shader material with fresnel halo effect
- TorusKnot geometry
- Hue derived from latitude + regional harmonics
- Amplitude driven by live coherence field
- Sine-wave modulation for smooth animation
- Proper safety caps and resource cleanup

## Loading Packs

### Programmatically

```typescript
import { artPackEngine } from './modules/artpacks/ArtPackEngine';

await artPackEngine.loadPack('https://example.com/pack/manifest.json');
await artPackEngine.switchPack('pack-id');
```

### Via UI

Use `<PackSwitcher />` component for user-facing pack selection and loading.

## Distribution

### Self-Hosted

1. Host manifest.json and entry file(s) on static server
2. Ensure CORS headers allow loading from Sacred Shifter domains
3. Share manifest URL

### Signed Packs (Future)

- ZIP archives with signature verification
- Curated marketplace integration
- CLI tool: `create-resonance-pack`

## Advanced Topics

### Multi-Node Packs

Register multiple node factories for complex scenes:

```typescript
engine.registerNode('background', createBackground);
engine.registerNode('foreground', createForeground);
engine.registerNode('particles', createParticles);
```

### Dynamic Geometry

Update geometry in frame callbacks for responsive visuals:

```typescript
engine.onFrame((delta, params) => {
  geometry.attributes.position.needsUpdate = true;
  // Modify vertices based on params
});
```

### Post-Processing

Register materials for post-processing passes (integration with existing renderer pipeline TBD).

## Support

For questions, examples, or pack submissions, reach out to the Sacred Shifter community.

---

**Remember**: Art Packs are shared creative expressions. Prioritize safety, accessibility, and respect for diverse sensory experiences.
