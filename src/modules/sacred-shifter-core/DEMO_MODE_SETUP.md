# Demo Mode - Visual Preview Guide

## What is Demo Mode?

**DemoMode** is an interactive showcase that lets you experience all four Sacred Shifter modes without needing real participants or database setup. Perfect for:

- **Previewing** how each mode looks and behaves
- **Testing** visual changes to art packs
- **Demonstrating** to stakeholders or users
- **Learning** how participant count affects rendering

---

## Quick Setup

### 1. Add the Route

Tell Cursor to add this route to your router:

```typescript
import { DemoMode } from './modules/sacred-shifter-core';

<Route path="/demo/sacred-shifter" element={<DemoMode />} />
```

### 2. Make Sure Collective Mandala Pack is Loaded

The demo requires the Collective Mandala pack. Ensure it's in the database:

```sql
-- Check if it exists
SELECT * FROM artpacks WHERE manifest_url = '/artpacks/CollectiveMandala/manifest.json';

-- If not, insert it
INSERT INTO artpacks (manifest_url, status, title, description, author_name)
VALUES (
  '/artpacks/CollectiveMandala/manifest.json',
  'published',
  'Collective Mandala',
  'Adaptive multi-scale visualization for 1 to 10,000+ participants',
  'Sacred Shifter Core'
);
```

### 3. Navigate to Demo

Visit: `http://localhost:5173/demo/sacred-shifter`

---

## What You'll See

### Four Interactive Buttons at Top

Click to instantly switch between modes:

**🧑 Individual (1 person)**
- Full 12-petal mandala
- Single color dominates
- Smooth, meditative breathing animation

**👥 Small Group (12 people)**
- 12 hexagonal glyphs
- Golden angle spiral distribution
- Connection web between nearby participants
- Each person has unique color

**👥👥 Large Group (200 people)**
- 200 luminous points
- Particle field with collective glow
- Center of mass visible
- Field density patterns emerge

**🌍 Massive Scale (2000 people)**
- 2000 points aggregate into field
- Statistical patterns dominate
- Emergent collective consciousness visualization
- Still maintains individual signatures (zoomed out)

### Left Sidebar

**Mode Info Card:**
- Current mode name
- Description
- Participant count
- FPS counter
- Base frequency (432 Hz)

**Controls:**
- **Play/Pause**: Freeze animation to inspect details
- **Reset**: Restart from beginning with fresh participant generation

**Sample Participants (Small Group only):**
- Shows first 12 participants
- Color dot next to each name
- See how deterministic color encoding works

**Key Features List:**
- Highlights technical innovations

### Main Canvas

Large, high-quality render of the current mode in action:
- Real-time GAA harmonic frequencies (432 Hz)
- Sonic Shifter envelope modulation (amplitude, hue, breath, tension)
- Deterministic participant positioning
- Smooth 60 FPS animation

### Bottom Info Cards

Three cards explaining:
1. **Visual Encoding** - How identity → visual signature
2. **GAA Integration** - Musical mathematics
3. **Safety Guardrails** - Photosensitive protection

---

## How It Works Under the Hood

### Simulated Participants

```typescript
const DEMO_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', ...];

function generateParticipants(count: number) {
  // Creates realistic participant data
  // Name → deterministic color hue
  // Index → golden angle position
  // Random coherence values
}
```

Each "participant" is encoded exactly as a real one would be:
- **Name hash → Color hue** (Alice = 234°, Bob = 45°, etc.)
- **Join time offset** (staggered by 1 second each)
- **Role assignment** (viewer, contributor, co-creator)
- **Personal coherence** (0.6-0.9 random)

### Mode Switching

When you click a mode button:
1. Generates appropriate number of participants (1, 12, 200, or 2000)
2. Encodes each with `ParticipantEncoder`
3. Passes to pack engine via `params.participants`
4. Pack renders adaptively based on count

### Performance

- **Individual**: 60 FPS (full complexity)
- **Small Group**: 60 FPS (12 glyphs + connections)
- **Large Group**: 45-60 FPS (200 points + field)
- **Massive**: 30-45 FPS (2000 points aggregated)

---

## Use Cases

### 1. Design Review
Show stakeholders the visual progression from 1 to 2000 participants. They can see how the system scales elegantly.

### 2. Art Pack Testing
When creating a new pack, test with all four modes to ensure adaptive rendering works correctly.

### 3. Performance Profiling
Monitor FPS as you switch modes. Identify bottlenecks at different scales.

### 4. User Onboarding
Let new users experience all modes before diving into real sessions. Builds excitement!

### 5. Conference Demos
Project Demo Mode on screen, switch between modes live to demonstrate capabilities.

---

## Customization Ideas

### Change Participant Count

Edit `DemoMode.tsx`:

```typescript
// Around line 90
switch (mode) {
  case 'individual': count = 1; break;
  case 'small_group': count = 25; break;    // Change from 12
  case 'large_group': count = 500; break;    // Change from 200
  case 'massive': count = 5000; break;       // Change from 2000
}
```

### Add More Names

```typescript
const DEMO_NAMES = [
  'Alice', 'Bob', 'Charlie', ...,
  'YourName', 'AnotherName', ...
];
```

### Adjust Frequencies

```typescript
// In useEffect, around line 115
gaaClockRef.current = new GAAClock(
  440,  // Change from 432 Hz to concert A
  [1, 2, 3, 4, 5]  // Different harmonic ratios
);
```

---

## Troubleshooting

### "Canvas is blank"
- Check browser console for errors
- Ensure Collective Mandala pack is loaded
- Verify `/artpacks/CollectiveMandala/` files exist

### "Low FPS in Massive mode"
- Expected! 2000 points is demanding
- Try reducing count to 1000
- Disable dev tools (they slow rendering)

### "Colors look wrong"
- Check shader compilation errors in console
- Ensure pack fragment shader is correct
- Verify browser supports WebGL

### "Participant names repeat"
- Normal for counts > 52 (demo name pool size)
- They get numbered: "Alice 1", "Alice 2", etc.
- Doesn't affect visual encoding (uses ID hash)

---

## Next Steps After Demo

Once you've previewed all modes:

1. **Test with Real Session**
   - Go to `/collective/create`
   - Create actual session
   - Invite real participants

2. **Customize Art Packs**
   - Create new pack with custom shaders
   - Test in Demo Mode first
   - Deploy when satisfied

3. **Performance Tune**
   - Profile at your target scale
   - Adjust LOD thresholds
   - Optimize shader code

4. **Add Analytics**
   - Track which modes users prefer
   - Monitor real-world FPS
   - Gather feedback

---

## Demo Mode vs Real Sessions

| Feature | Demo Mode | Real Sessions |
|---------|-----------|---------------|
| Participants | Simulated | Real people joining |
| Realtime | No | Yes (Supabase channels) |
| Database | Not needed | Required |
| Captures | Available | Available |
| Performance | Controlled | Variable (network) |
| Use Case | Preview/Testing | Production |

---

**Demo Mode makes Sacred Shifter Core immediately accessible.** No setup, no database, no users required—just pure visual exploration! 🎨✨

Visit `/demo/sacred-shifter` and experience the magic.
