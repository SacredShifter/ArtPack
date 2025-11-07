# Sacred Shifter — Developer Integration Guide

## For Cursor AI & Human Developers

This guide helps you seamlessly integrate Sacred Shifter into your projects or extend its capabilities.

---

## Architecture Overview

```
User Interaction
    ↓
Consciousness Metrics (EvoInputs)
    ↓
EvolutionEngine → EvoParams
    ↓
RevelationManager → Phase Transitions
    ↓
PackEngine → Geometry Rendering
    ↓
Visual Feedback Loop
```

---

## Core Modules

### 1. **EvolutionEngine** (`src/modules/mirror-unseen/evolution.ts`)

**Purpose:** Converts consciousness metrics into geometry parameters

**Key Types:**
```typescript
interface EvoInputs {
  Coh: number;    // Coherence (0-1)
  Cx: number;     // Complexity (0-1)
  Pol: number;    // Polarity Balance (0-1, 0.5 = balanced)
  U: number;      // Uncertainty (0-1)
  Syn: number;    // Synchrony (0-1)
  Res: number;    // Residual Tension (0-1)
}

interface EvoParams {
  m: number;               // Polygon sides (3-12)
  n1: number;              // Superformula param (0.5-8.0)
  n2: number;              // Superformula param (0.8-4.0)
  n3: number;              // Superformula param (0.8-4.0)
  lift: number;            // 3D elevation (0-1)
  merkaba: boolean;        // Transcendent state flag
  vesicaStrength: number;  // Connection lines (0-1)
  starMix: number;         // Tension spikes (0-1)
  hazeIntensity: number;   // Uncertainty blur (0-1)
}
```

**Usage:**
```typescript
import { EvolutionEngine } from './modules/mirror-unseen/evolution';

const engine = new EvolutionEngine();

const inputs: EvoInputs = {
  Coh: 0.75,  // 75% coherence
  Cx: 0.6,    // 60% complexity
  Pol: 0.5,   // Balanced polarity
  U: 0.3,     // 30% uncertainty
  Syn: 0.8,   // 80% synchrony
  Res: 0.2    // 20% residual
};

const elementRatios = { fire: 0.3, earth: 0.2, air: 0.25, water: 0.25 };

const params = engine.computeEvoParams(inputs, elementRatios);
// params.m = 8, params.n1 = 5.3, params.lift = 0.65, etc.

const transition = engine.checkTransition(inputs, params);
if (transition) {
  console.log(`Transitioning from ${transition.fromForm} to ${transition.toForm}`);
  console.log(`Triggered by ${transition.triggerMetric} = ${transition.thresholdValue}`);
}
```

**Form Evolution Logic:**
```typescript
// Transitions require 5 seconds of sustained metric thresholds

Circle → Polygon:  m >= 5 && Cx > 0.35
Polygon → Flower:  Cx > 0.6 && Coh > 0.5
Flower → Star:     Res > 0.55
Star → Platonic:   Coh > 0.85 && lift > 0.7
Platonic → Merkaba: Coh > 0.9 && |Pol - 0.5| < 0.05
```

---

### 2. **RevelationManager** (`src/modules/sacred-shifter-core/RevelationManager.ts`)

**Purpose:** Orchestrates 5-phase consciousness journey with teaching texts

**Key Methods:**
```typescript
import { RevelationManager, RevelationPhase } from './modules/sacred-shifter-core/RevelationManager';

const manager = new RevelationManager(sessionId, userId);

// Update with current metrics
const teaching = manager.update({
  coherence: 0.75,
  complexity: 0.6,
  polarity: 0.5,
  residual: 0.2,
  uncertainty: 0.3
});

if (teaching) {
  console.log(`Phase: ${teaching.phase}`);
  console.log(`Teaching: ${teaching.caption}`);
  console.log(`Audio: ${teaching.audioScript}`);
  console.log(`Visual Cue: ${teaching.visualCue}`);
}

// Query current state
const phase = manager.getCurrentPhase();  // RevelationPhase.INTEGRATION
const timeInPhase = manager.getTimeInPhase();  // seconds

// Check visual modifiers
const showUnseen = manager.shouldShowUnseenLayer();     // true after Recognition
const morphing = manager.shouldMorphForms();            // true during Integration/Revelation
const lift3D = manager.shouldLiftTo3D();                // true during Revelation/Seal
const frozen = manager.shouldFreeze();                  // true during Seal
```

**Phase Transition Thresholds:**
```typescript
Recognition → Reflection:  Coh >= 0.6 for 10+ sec
Reflection → Integration:  Avg Coh >= 0.6 + residual decreasing for 15+ sec
Integration → Revelation:  Coh > 0.85 && U < 0.4 for 10+ sec
Revelation → Seal:         timeInPhase >= 20 sec
```

---

### 3. **PackEngine** (`src/modules/sacred-shifter-core/PackEngine.ts`)

**Purpose:** Renders art packs with consciousness-driven parameters

**Extended ResonanceParams:**
```typescript
interface ResonanceParams {
  // Standard params (time, GAA, breath)
  uTime: number;
  uCoherence: number;
  uStillness: number;
  uPhase: number;
  uLFO: number;
  uAmplitude: number;
  uBreathRate: number;
  uHarmonics: number[];

  // Evolution params (NEW - wired to consciousness)
  uCoh: number;         // Direct coherence feed
  uCx: number;          // Complexity feed
  uPol: number;         // Polarity feed
  uU: number;           // Uncertainty feed
  uSyn: number;         // Synchrony feed
  uRes: number;         // Residual feed
  uFormType: string;    // 'circle', 'polygon', 'flower', 'star', 'platonic', 'merkaba'
  uLift: number;        // 0-1, 3D elevation amount
  uMerkaba: boolean;    // True when transcendent state achieved
}
```

**Usage in Animation Loop:**
```typescript
import { packEngine } from './modules/sacred-shifter-core/PackEngine';
import { EvolutionEngine } from './modules/mirror-unseen/evolution';

const evolutionEngine = new EvolutionEngine();

function animate() {
  requestAnimationFrame(animate);

  // Your consciousness metrics (from HRV sensor, interaction patterns, etc.)
  const evoInputs = {
    Coh: 0.75,
    Cx: 0.6,
    Pol: 0.5,
    U: 0.3,
    Syn: 0.8,
    Res: 0.2
  };

  // Compute geometry parameters
  const elementRatios = { fire: 0.3, earth: 0.2, air: 0.25, water: 0.25 };
  const evoParams = evolutionEngine.computeEvoParams(evoInputs, elementRatios);

  // Get current form type
  const formType = evolutionEngine.getCurrentForm();  // 'flower'

  // Compute full render params
  const params = packEngine.computeParams(
    regionSeed,
    coherenceSample,
    gaaState,
    sonicEnvelope,
    evoInputs,      // Pass consciousness metrics
    {
      lift: evoParams.lift,
      merkaba: evoParams.merkaba,
      formType
    }
  );

  // Update geometry
  packEngine.runFrameCallbacks(deltaTime, params);

  renderer.render(scene, camera);
}
```

---

### 4. **Art Pack Integration**

**To make art packs respond to consciousness metrics, use these uniforms in your shaders:**

```glsl
// In your fragment shader
uniform float uCoh;        // Coherence (0-1)
uniform float uCx;         // Complexity (0-1)
uniform float uPol;        // Polarity (0-1)
uniform float uU;          // Uncertainty (0-1)
uniform float uRes;        // Residual (0-1)
uniform float uSyn;        // Synchrony (0-1)
uniform float uLift;       // 3D lift amount (0-1)
uniform bool uMerkaba;     // Transcendent flag

// Example: Adjust petal count with complexity
float petalCount = 3.0 + 9.0 * uCx;  // 3-12 petals

// Example: Add spikes when residual is high
float spikeMix = smoothstep(0.5, 0.7, uRes);
geometry = mix(smoothGeometry, spikedGeometry, spikeMix);

// Example: Apply haze when uncertain
float hazeAmount = smoothstep(0.6, 1.0, uU);
color = mix(color, hazedColor, hazeAmount);

// Example: Lift to 3D during revelation
vec3 lifted = vec3(pos.xy, pos.z + uLift * 5.0);

// Example: Activate merkaba geometry
if (uMerkaba) {
  // Render interpenetrating tetrahedra
}
```

---

## Implementing Consciousness Metric Sources

### Option 1: Simulated (Demo Mode)
```typescript
function updateSimulatedMetrics(deltaTime: number): EvoInputs {
  const breathPhase = Math.sin(Date.now() / 2000);  // 2-second breath cycle

  return {
    Coh: 0.5 + breathPhase * 0.2,  // Oscillates with breath
    Cx: 0.4 + Math.random() * 0.2,  // Random walk
    Pol: 0.5 + Math.sin(Date.now() / 5000) * 0.1,  // Slow drift
    U: Math.max(0, 0.6 - elapsedTime * 0.01),  // Decreases over time
    Syn: 0.5,  // Constant (solo mode)
    Res: Math.max(0, 0.5 - elapsedTime * 0.02)  // Decreases as you settle
  };
}
```

### Option 2: HRV Sensor (Production)
```typescript
import { HRVMonitor } from './hrv-monitor';  // Your HRV library

const hrvMonitor = new HRVMonitor();

function computeCoherenceFromHRV(hrvData: HRVData): number {
  // Use HeartMath coherence algorithm
  const coherenceScore = hrvMonitor.calculateCoherence(hrvData);
  return coherenceScore;  // 0-1
}

function computeComplexityFromHRV(hrvData: HRVData): number {
  // Use sample entropy or approximate entropy
  const entropy = calculateSampleEntropy(hrvData.rrIntervals);
  return Math.min(1, entropy / 2.0);  // Normalize to 0-1
}
```

### Option 3: Interaction Patterns
```typescript
class InteractionMetrics {
  private clickTimestamps: number[] = [];
  private mousePositions: { x: number, y: number, t: number }[] = [];

  trackClick(timestamp: number) {
    this.clickTimestamps.push(timestamp);
    if (this.clickTimestamps.length > 30) this.clickTimestamps.shift();
  }

  trackMouse(x: number, y: number, t: number) {
    this.mousePositions.push({ x, y, t });
    if (this.mousePositions.length > 100) this.mousePositions.shift();
  }

  getCoherence(): number {
    // Measure regularity of click intervals
    if (this.clickTimestamps.length < 5) return 0.5;

    const intervals = [];
    for (let i = 1; i < this.clickTimestamps.length; i++) {
      intervals.push(this.clickTimestamps[i] - this.clickTimestamps[i-1]);
    }

    const mean = intervals.reduce((a,b) => a+b) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Low stdDev = high coherence
    return Math.max(0, 1 - stdDev / mean);
  }

  getComplexity(): number {
    // Measure path complexity
    if (this.mousePositions.length < 10) return 0.3;

    let totalDistance = 0;
    for (let i = 1; i < this.mousePositions.length; i++) {
      const dx = this.mousePositions[i].x - this.mousePositions[i-1].x;
      const dy = this.mousePositions[i].y - this.mousePositions[i-1].y;
      totalDistance += Math.sqrt(dx*dx + dy*dy);
    }

    // Normalize by time span and screen size
    const timeSpan = this.mousePositions[this.mousePositions.length-1].t - this.mousePositions[0].t;
    const complexity = (totalDistance / timeSpan) / 1000;  // Arbitrary scale

    return Math.min(1, complexity);
  }

  getResidual(): number {
    // Measure jitter or sudden direction changes
    if (this.mousePositions.length < 5) return 0.3;

    let jitterCount = 0;
    for (let i = 2; i < this.mousePositions.length; i++) {
      const angle1 = Math.atan2(
        this.mousePositions[i-1].y - this.mousePositions[i-2].y,
        this.mousePositions[i-1].x - this.mousePositions[i-2].x
      );
      const angle2 = Math.atan2(
        this.mousePositions[i].y - this.mousePositions[i-1].y,
        this.mousePositions[i].x - this.mousePositions[i-1].x
      );

      const angleDiff = Math.abs(angle1 - angle2);
      if (angleDiff > Math.PI / 2) jitterCount++;  // Sharp turn
    }

    return jitterCount / (this.mousePositions.length - 2);
  }
}
```

---

## Database Schema

### Revelation Phases Table
```sql
CREATE TABLE revelation_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  phase_name TEXT NOT NULL,  -- 'recognition', 'reflection', 'integration', 'revelation', 'seal'
  entered_at TIMESTAMPTZ NOT NULL,
  trigger_metric TEXT,       -- 'coherence_sustained', 'tension_resolving', etc.
  trigger_value FLOAT,
  teaching_shown TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_revelation_phases_session ON revelation_phases(session_id, user_id);
```

### Consciousness Telemetry Table
```sql
CREATE TABLE consciousness_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  coherence FLOAT NOT NULL CHECK (coherence >= 0 AND coherence <= 1),
  complexity FLOAT NOT NULL CHECK (complexity >= 0 AND complexity <= 1),
  polarity FLOAT NOT NULL CHECK (polarity >= 0 AND polarity <= 1),
  uncertainty FLOAT NOT NULL CHECK (uncertainty >= 0 AND uncertainty <= 1),
  residual FLOAT NOT NULL CHECK (residual >= 0 AND residual <= 1),
  synchrony FLOAT NOT NULL CHECK (synchrony >= 0 AND synchrony <= 1),
  form_type TEXT,  -- 'circle', 'polygon', 'flower', 'star', 'platonic', 'merkaba'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_telemetry_session ON consciousness_telemetry(session_id, timestamp);
```

### Collective Field Snapshots Table
```sql
CREATE TABLE collective_field_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  participant_count INTEGER NOT NULL,
  avg_coherence FLOAT NOT NULL,
  std_coherence FLOAT NOT NULL,
  dominant_archetype TEXT,
  synchrony_score FLOAT NOT NULL,
  element_ratios JSONB NOT NULL,  -- { fire: 0.3, earth: 0.2, air: 0.25, water: 0.25 }
  field_geometry TEXT NOT NULL,   -- 'mandala', 'flower', 'platonic', etc.
  emergence_markers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_field_snapshots_event ON collective_field_snapshots(event_id, timestamp);
```

---

## Real-Time Collective Sync (Supabase)

### Setup Realtime Subscription
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

function subscribeToCollectiveField(eventId: string, onUpdate: (snapshot: FieldSnapshot) => void) {
  const channel = supabase
    .channel(`collective-field-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'collective_field_snapshots',
        filter: `event_id=eq.${eventId}`
      },
      (payload) => {
        onUpdate(payload.new as FieldSnapshot);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Usage
const unsubscribe = subscribeToCollectiveField('event-1', (snapshot) => {
  console.log(`Participants: ${snapshot.participant_count}`);
  console.log(`Avg Coherence: ${snapshot.avg_coherence}`);
  console.log(`Synchrony: ${snapshot.synchrony_score}`);

  // Update UI
  setParticipantCount(snapshot.participant_count);
  setAvgCoherence(snapshot.avg_coherence);
});
```

### Aggregate User Metrics into Field
```typescript
class CollectiveAggregator {
  private userMetrics: Map<string, EvoInputs> = new Map();

  updateUserMetrics(userId: string, metrics: EvoInputs) {
    this.userMetrics.set(userId, metrics);
  }

  removeUser(userId: string) {
    this.userMetrics.delete(userId);
  }

  computeFieldSnapshot(eventId: string): FieldSnapshot {
    const users = Array.from(this.userMetrics.values());

    if (users.length === 0) {
      return {
        event_id: eventId,
        timestamp: new Date(),
        participant_count: 0,
        avg_coherence: 0,
        std_coherence: 0,
        synchrony_score: 0,
        element_ratios: { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 },
        field_geometry: 'circle'
      };
    }

    // Average metrics
    const avgCoherence = users.reduce((sum, u) => sum + u.Coh, 0) / users.length;
    const avgComplexity = users.reduce((sum, u) => sum + u.Cx, 0) / users.length;
    const avgSynchrony = users.reduce((sum, u) => sum + u.Syn, 0) / users.length;

    // Std dev of coherence
    const variance = users.reduce((sum, u) => sum + Math.pow(u.Coh - avgCoherence, 2), 0) / users.length;
    const stdCoherence = Math.sqrt(variance);

    // Synchrony score (inverse of std dev)
    const synchronyScore = Math.max(0, 1 - stdCoherence * 2);

    // Determine field geometry
    let fieldGeometry = 'circle';
    if (avgCoherence > 0.85) fieldGeometry = 'platonic';
    else if (avgComplexity > 0.6) fieldGeometry = 'flower';
    else if (avgCoherence > 0.5) fieldGeometry = 'mandala';

    return {
      event_id: eventId,
      timestamp: new Date(),
      participant_count: users.length,
      avg_coherence: avgCoherence,
      std_coherence: stdCoherence,
      synchrony_score: synchronyScore,
      element_ratios: { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 },
      field_geometry: fieldGeometry
    };
  }

  async saveSnapshot(eventId: string) {
    const snapshot = this.computeFieldSnapshot(eventId);

    const { error } = await supabase
      .from('collective_field_snapshots')
      .insert({
        event_id: snapshot.event_id,
        timestamp: snapshot.timestamp.toISOString(),
        participant_count: snapshot.participant_count,
        avg_coherence: snapshot.avg_coherence,
        std_coherence: snapshot.std_coherence,
        synchrony_score: snapshot.synchrony_score,
        element_ratios: snapshot.element_ratios,
        field_geometry: snapshot.field_geometry
      });

    if (error) console.error('Failed to save field snapshot:', error);
  }
}

// Use in event loop
const aggregator = new CollectiveAggregator();

setInterval(() => {
  aggregator.saveSnapshot('event-1');
}, 1000);  // Save every second during live event
```

---

## Adding Sacred Shifter to Your Project

### Minimal Integration
```typescript
import { EvolutionEngine } from './modules/mirror-unseen/evolution';
import { RevelationManager } from './modules/sacred-shifter-core/RevelationManager';
import { packEngine } from './modules/sacred-shifter-core/PackEngine';

// 1. Create engines
const evolutionEngine = new EvolutionEngine();
const revelationManager = new RevelationManager('session-1', 'user-1');

// 2. Load art pack
await packEngine.loadPack('/artpacks/CollectiveMandala/manifest.json');

// 3. Setup scene
const scene = new THREE.Scene();
const node = packEngine.createNode('primary');
if (node) scene.add(node);

// 4. Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Get consciousness metrics (from your source)
  const evoInputs = getUserMetrics();

  // Compute geometry params
  const evoParams = evolutionEngine.computeEvoParams(evoInputs, elementRatios);

  // Check for phase transitions
  const teaching = revelationManager.update({
    coherence: evoInputs.Coh,
    complexity: evoInputs.Cx,
    polarity: evoInputs.Pol,
    residual: evoInputs.Res,
    uncertainty: evoInputs.U
  });

  if (teaching) {
    showTeachingText(teaching.caption);
  }

  // Render with consciousness params
  const params = packEngine.computeParams(
    regionSeed,
    coherenceSample,
    gaaState,
    sonicEnvelope,
    evoInputs,
    { lift: evoParams.lift, merkaba: evoParams.merkaba, formType: evolutionEngine.getCurrentForm() }
  );

  packEngine.runFrameCallbacks(deltaTime, params);
  renderer.render(scene, camera);
}
```

---

## Testing Your Integration

### Unit Tests
```typescript
describe('EvolutionEngine', () => {
  it('should transition from circle to polygon when complexity increases', () => {
    const engine = new EvolutionEngine();

    const inputs = { Coh: 0.5, Cx: 0.4, Pol: 0.5, U: 0.5, Syn: 0.5, Res: 0.3 };
    const params = engine.computeEvoParams(inputs, elementRatios);

    expect(params.m).toBeGreaterThanOrEqual(3);
    expect(params.m).toBeLessThanOrEqual(12);
    expect(engine.getCurrentForm()).toBe('circle');

    // Simulate sustained high complexity
    for (let i = 0; i < 60; i++) {
      const transition = engine.checkTransition(inputs, params);
      if (transition) {
        expect(transition.toForm).toBe('polygon');
        break;
      }
      await wait(100);
    }
  });
});
```

---

## Common Pitfalls

1. **Forgetting to pass evoInputs to packEngine.computeParams()**
   - Result: Geometry doesn't respond to consciousness
   - Fix: Always pass the 6th and 7th parameters

2. **Not holding metrics for 5+ seconds**
   - Result: Form transitions don't trigger
   - Fix: EvolutionEngine requires sustained thresholds

3. **Updating metrics too slowly**
   - Result: Jerky animations
   - Fix: Update at 10-100Hz for smooth feedback

4. **Using random values without autocorrelation**
   - Result: Unrealistic metric drift
   - Fix: Use Ornstein-Uhlenbeck process or low-pass filtered noise

---

## Next Steps

1. Read the **Scientific Mapping Table** in User Guide
2. Review the **GuidedSessionPlayer** source code (`src/pages/GuidedSessionPlayer.tsx`)
3. Experiment with **custom EvoInputs** sources
4. Create your own **art packs** that respond to consciousness metrics
5. Host a **live collective event** and observe emergence

**Sacred Shifter is designed to be hackable. Extend it, remix it, and share what you build.**

---

## Support

- Full scientific references: `/SACRED_SHIFTER_SCIENCE.md`
- Example implementations: `/src/pages/GuidedSessionPlayer.tsx`, `/src/pages/CollectiveEventViewer.tsx`
- Community: Join an event at Events Hub

**Welcome to the field. May your code reveal truth.** 🌌
