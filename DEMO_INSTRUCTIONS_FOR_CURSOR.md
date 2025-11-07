# 🎨 Sacred Shifter Demo - Instructions for Cursor

## What to Do

Add the Sacred Shifter Demo Mode to the app so you can see all four visualization modes in action.

---

## Step 1: Add the Demo Route

In your router configuration file (likely `App.tsx` or `src/main.tsx`), import and add the demo route:

```typescript
import { DemoMode } from './modules/sacred-shifter-core';

// Add this route:
<Route path="/demo/sacred-shifter" element={<DemoMode />} />
```

**Full example if using React Router:**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoMode } from './modules/sacred-shifter-core';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo/sacred-shifter" element={<DemoMode />} />
        {/* your other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Step 2: Ensure Collective Mandala Pack is in Database

Run this SQL in your Supabase SQL Editor (or via the dashboard):

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
  'Adaptive multi-scale visualization for 1 to 10,000+ participants',
  'Sacred Shifter Core'
);
```

If it already exists, you'll get a duplicate error—that's fine, just skip this step.

---

## Step 3: Start the Dev Server

```bash
npm run dev
```

---

## Step 4: Open the Demo

Navigate to:

```
http://localhost:5173/demo/sacred-shifter
```

You should see:
- Four buttons at the top (Individual, Small Group, Large Group, Massive)
- A large canvas in the center showing animated visuals
- Controls on the left sidebar (Play/Pause, Reset)
- Info about the current mode

---

## What You'll Experience

### Click "Individual" (1 person)
- See a beautiful 12-petal mandala
- Single color dominates
- Smooth, breathing animation synchronized to 432 Hz

### Click "Small Group" (12 people)
- See 12 hexagonal glyphs appear
- Each positioned using golden angle spiral (137.508°)
- Connection web drawn between nearby participants
- Each glyph has unique color based on participant name

### Click "Large Group" (200 people)
- See 200 luminous points
- Particle field with collective glow
- Notice how individual glyphs become points for performance

### Click "Massive Scale" (2000 people)
- See 2000 points aggregated into a field
- Emergent patterns from statistical aggregation
- Still maintains individual signatures (just zoomed out)
- Notice FPS may drop slightly (expected for 2000 objects)

---

## Interactive Controls

**Play/Pause Button:**
- Pause to inspect details
- Freeze frame shows exact participant positions

**Reset Button:**
- Regenerates participants with new random positions
- Restarts animation from beginning

**FPS Counter:**
- Bottom right shows current frame rate
- Expect 60 FPS for small groups, 30-45 for massive scale

---

## What Makes This Special

1. **Deterministic Color Encoding**
   - "Alice" always gets the same blue-ish hue
   - "Bob" always gets the same orange-ish hue
   - Try resetting—same names, same colors

2. **Golden Angle Spiral**
   - Participants positioned at 137.508° intervals
   - Creates natural, even distribution (like sunflower seeds)
   - No clustering, no gaps

3. **Adaptive Rendering**
   - Pack automatically switches rendering strategy
   - Small groups: detailed glyphs
   - Large groups: efficient points
   - Maintains beauty at all scales

4. **GAA Integration**
   - 432 Hz base frequency
   - Harmonic ratios: 1, 1.5, 2, 3, 4
   - Musical time creates organic rhythm

5. **Sonic Shifter Envelopes**
   - Amplitude modulates brightness
   - Hue shift cycles through colors
   - Breath rate affects pulse speed
   - Tension creates dynamic changes

---

## Troubleshooting

### "I see a blank screen"
**Check:**
1. Browser console for errors
2. Make sure Collective Mandala pack is in database
3. Verify `/public/artpacks/CollectiveMandala/` folder exists
4. Try refreshing the page

### "FPS is really low"
**Try:**
1. Close dev tools (they slow rendering)
2. Switch to a smaller mode (Individual or Small Group)
3. Reduce window size (less pixels to render)
4. Check if other apps are using GPU

### "Colors look weird or shaders fail"
**Check:**
1. Browser supports WebGL (open: `chrome://gpu`)
2. No shader compilation errors in console
3. Graphics drivers are updated

### "It works but I want to customize it"
**Edit:**
- Participant count: `DemoMode.tsx` line 90
- GAA frequency: `DemoMode.tsx` line 138
- Envelope periods: `SonicOrchestrator.ts`
- Colors/shaders: `CollectiveMandala/index.js`

---

## Next Steps

Once you've explored the demo:

1. **Create a Real Session**
   - Navigate to `/collective/create` (if route exists)
   - Create actual session
   - Share link with friends

2. **Test with Custom Pack**
   - Create your own art pack
   - Test in Demo Mode
   - See how it adapts to different scales

3. **Performance Profile**
   - Monitor FPS at each scale
   - Identify bottlenecks
   - Optimize as needed

4. **Share with Stakeholders**
   - Demo Mode is perfect for showing capabilities
   - No setup required, just click buttons
   - Impresses everyone! 🎨✨

---

## Summary

**This one route (`/demo/sacred-shifter`) lets you experience the full Sacred Shifter system without needing:**
- Real participants
- Database sessions
- Network synchronization
- Multiple devices

**Just pure, immediate visual exploration of what makes Sacred Shifter groundbreaking!**

🚀 Add the route, open the URL, click the buttons, and watch the magic unfold.
