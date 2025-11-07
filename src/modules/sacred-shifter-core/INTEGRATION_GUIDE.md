# Sacred Shifter Core - Collective Mode Integration Guide

This guide shows you how to integrate the complete Collective Mode system where individuals, small groups, and massive gatherings can co-create living artworks together.

## 🌟 What's New: Collective Mode

### Features

1. **Multi-Scale Support**
   - **Individual (1)**: Personal resonance portrait with full mandala display
   - **Small Group (2-50)**: Each person gets a unique glyph positioned using golden angle spiral
   - **Large Group (50-1000)**: Participants become luminous points with connection web
   - **Massive (1000+)**: Emergent field patterns from statistical aggregation

2. **Participant Identity Encoding**
   - Name/Initials → Unique color hue (deterministic from name hash)
   - Join timestamp → Phase offset in animation
   - Role (viewer/contributor/co-creator) → Affects geometry complexity
   - Personal coherence → Brightness and amplitude

3. **Real-Time Synchronization**
   - Supabase Realtime channels for live participant updates
   - Automatic visual updates as people join/leave
   - Session mode auto-switches based on participant count

4. **Individual Captures**
   - Each participant can capture the collective artwork
   - Download their unique perspective
   - Personal signature remains encoded in the visual

## 🗄️ Database Schema

Already migrated! Two new tables:

### `collective_sessions`
```sql
- id (uuid, pk)
- title (text) - "Monday Meditation Circle"
- created_by (text) - Creator identifier
- mode (text) - individual/small_group/large_group/massive (auto-updates)
- is_live (boolean) - Session status
- pack_id (text) - Optional art pack
- created_at (timestamptz)
```

### `session_participants`
```sql
- id (uuid, pk)
- session_id (uuid, fk)
- participant_id (text) - Unique per participant
- name (text) - Optional display name
- initials (text) - Used for glyph generation
- role (text) - viewer/contributor/co-creator
- personal_coherence (numeric) - 0-1 score
- capture_url (text) - Saved artwork URL
- joined_at (timestamptz)
```

## 🎨 New Art Pack: Collective Mandala

Located at: `/public/artpacks/CollectiveMandala/`

**Features:**
- Adapts rendering based on participant count
- Small groups: Hexagonal glyphs with connection webs
- Large groups: Particle field with collective glow
- Individual: Full 12-petal mandala
- Each participant's color is deterministic from their name
- Golden angle spiral positioning ensures even distribution

## 📋 Integration Steps

### 1. Add Routes

```typescript
import {
  CreateSessionPage,
  JoinSessionPage
} from './modules/sacred-shifter-core';

// In your router:
<Route path="/collective/create" element={<CreateSessionPage />} />
<Route path="/collective/session/:sessionId" element={<JoinSessionPage />} />
```

### 2. Add Collective Mandala Pack to Database

```sql
INSERT INTO artpacks (
  manifest_url,
  status,
  title,
  description,
  author_name
) VALUES (
  '/artpacks/CollectiveMandala/manifest.json',
  'published',
  'Collective Mandala',
  'Each participant becomes a petal in a living, breathing mandala',
  'Sacred Shifter Core'
);
```

### 3. Create a Session (Programmatically)

```typescript
import { CollectiveSession } from '@/modules/sacred-shifter-core';

const sessionId = await CollectiveSession.createSession(
  'Monday Meditation Circle',
  'creator-user-id',
  'collective-mandala' // optional pack ID
);

// Share this link with participants:
const joinUrl = `${window.location.origin}/collective/session/${sessionId}`;
```

### 4. Use CollectiveCanvas Directly

```typescript
import { CollectiveCanvas } from '@/modules/sacred-shifter-core';

<CollectiveCanvas
  sessionId="your-session-id"
  onCapture={(dataUrl) => {
    // Handle captured image
  }}
/>
```

## 🎯 User Flows

### Flow 1: Create & Share

1. User visits `/collective/create`
2. Enters session title
3. System creates session, generates shareable link
4. User shares link with friends

### Flow 2: Join & Participate

1. Participant visits shared link `/collective/session/{id}`
2. Enters optional name, initials, and role
3. Clicks "Join Session"
4. Canvas renders with their signature visible
5. Real-time updates as others join
6. Can capture and download their unique view

### Flow 3: Massive Event

1. Organizer creates session
2. Projects canvas on large screen
3. Shares QR code with audience
4. Hundreds/thousands join via phones
5. Visual evolves in real-time as crowd engages
6. Each person captures their personal artifact

## 🎨 Visual Encoding Details

### Color Assignment
```typescript
// Name → Hue (0-360)
const hue = stringToHash(name) % 360;

// Examples:
"Alice" → 234° (blue-ish)
"Bob" → 45° (orange-ish)
"Charlie" → 167° (cyan-ish)
```

### Position Assignment (Golden Angle Spiral)
```typescript
const angle = (participantIndex * 137.508) % 360;
const radius = 0.3 + (participantIndex / totalParticipants) * 0.6;
```

This ensures even distribution without clustering.

### Geometry Scaling
- **1 participant**: Full mandala (12 petals)
- **2-50**: Hexagonal glyphs per person
- **50-1000**: Circular points with glow
- **1000+**: Statistical field (points + emergent patterns)

## 🔧 Advanced Usage

### Custom Participant Encoding

```typescript
import { ParticipantEncoder } from '@/modules/sacred-shifter-core';

const signature = ParticipantEncoder.encode(
  identity,
  totalParticipants,
  participantIndex
);

// signature contains:
// - seedValue: numeric hash of identity
// - colorHue, colorSat, colorLight
// - positionAngle, positionRadius
// - amplitude, rotationSpeed
// - geometryType: 'point' | 'glyph' | 'mandala'
```

### Generate Collective Stats

```typescript
import { ParticipantEncoder } from '@/modules/sacred-shifter-core';

const stats = ParticipantEncoder.generateCollectiveStats(signatures);

// Returns:
// - totalEnergy: sum of all amplitudes
// - avgCoherence: mean coherence
// - dominantHue: most common color family
// - centerOfMass: [x, y] weighted center
// - diversityIndex: 0-1 color diversity score
```

### Real-Time Event Handling

```typescript
const session = new CollectiveSession(sessionId);
await session.initialize();

session.onUpdate((participants) => {
  console.log(`${participants.length} participants active`);
  console.log(`Session mode: ${session.getSessionMode()}`);

  // Update your UI or analytics
});
```

## 🖼️ Creating Custom Collective Art Packs

Your pack can access participant data via the `params.participants` array:

```javascript
export function register(engine) {
  const THREE = engine.getThree();

  // ... create materials/shaders ...

  engine.onFrame((deltaTime, params) => {
    if (params.participants && Array.isArray(params.participants)) {
      const count = params.participants.length;

      params.participants.forEach((participant, i) => {
        // participant.colorHue (0-360)
        // participant.colorSat (0-1)
        // participant.colorLight (0-1)
        // participant.positionAngle (0-360)
        // participant.positionRadius (0-1)
        // participant.amplitude (0-1)
        // participant.geometryType ('point' | 'glyph' | 'mandala')

        // Render this participant's signature
      });
    }
  });
}
```

## 🚀 Performance Considerations

- **50 participants**: 60 FPS on modern hardware
- **500 participants**: 45-60 FPS (shader-optimized)
- **5000 participants**: 30 FPS (statistical aggregation)

Tips:
1. Use instanced rendering for massive scale
2. LOD (Level of Detail) based on participant count
3. Aggregate distant participants into field density
4. Limit realtime update frequency at massive scale

## 🌊 Metaphysical Interpretation

- **Session** = Sacred circle, container for collective energy
- **Participants** = Unique souls, each with signature vibration
- **Golden Angle** = Natural growth pattern (sunflower, nautilus)
- **Color Encoding** = Individual essence made visible
- **Real-Time Updates** = Living, breathing organism
- **Captures** = Personal artifacts from collective moment

## 📊 Analytics & Insights

Track session metrics:

```typescript
const session = new CollectiveSession(sessionId);
const participants = session.getParticipants();

// Distribution analysis
const roleDistribution = {
  viewers: participants.filter(p => p.identity.role === 'viewer').length,
  contributors: participants.filter(p => p.identity.role === 'contributor').length,
  coCreators: participants.filter(p => p.identity.role === 'co-creator').length
};

// Temporal analysis
const joinTimes = participants.map(p => p.identity.joinedAt);
const sessionDuration = Math.max(...joinTimes) - Math.min(...joinTimes);
```

## 🎓 Example Use Cases

### 1. Meditation Groups
- 5-20 meditators join
- Each person's "stillness" affects their glyph brightness
- Capture collective coherence at peak moment

### 2. Conference Keynotes
- 500-2000 attendees scan QR code
- Massive field visualization on main screen
- Real-time engagement metric

### 3. Online Communities
- Async participation over days
- Members join at different times
- Time-lapse shows community growth

### 4. Therapy Circles
- 6-12 participants in safe space
- Individual signatures remain private (anonymous mode)
- Capture group's energetic snapshot

---

**Sacred Shifter Core - Collective Mode** transforms gatherings into living art, where every individual contributes their unique essence to a shared masterpiece.
