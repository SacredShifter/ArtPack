# 🚀 Sacred Shifter Core - Cursor Quick Start Guide

## 30-Second Setup

### 1. Add Routes
```typescript
import { DemoMode } from './modules/sacred-shifter-core';

<Route path="/demo/sacred-shifter" element={<DemoMode />} />
```

### 2. Insert Pack in Database
```sql
INSERT INTO artpacks (manifest_url, status, title, description)
VALUES ('/artpacks/CollectiveMandala/manifest.json', 'published',
        'Collective Mandala', 'Multi-scale visualization');
```

### 3. Visit Demo
```
http://localhost:5173/demo/sacred-shifter
```

**That's it!** Click the four mode buttons and watch the visuals transform.

---

## What You'll See

| Mode | Count | Visual Style |
|------|-------|-------------|
| 👤 **Individual** | 1 | Full 12-petal mandala |
| 👥 **Small Group** | 12 | Hexagonal glyphs + connection web |
| 👥👥 **Large Group** | 200 | Luminous points + field glow |
| 🌍 **Massive** | 2000 | Statistical field patterns |

**Key Features:**
- Each participant = unique color (deterministic from name)
- Golden angle spiral positioning (137.508°)
- 432 Hz GAA harmonics
- Sonic Shifter envelope modulation
- 60 FPS smooth animation

---

## Full Integration (When Ready)

### Add All Routes
```typescript
import {
  DemoMode,
  PortraitGenerator,
  CreateSessionPage,
  JoinSessionPage
} from './modules/sacred-shifter-core';

// Demo/preview
<Route path="/demo/sacred-shifter" element={<DemoMode />} />

// Solo portraits
<Route path="/portrait/:sessionId?" element={<PortraitGenerator />} />

// Collective sessions
<Route path="/collective/create" element={<CreateSessionPage />} />
<Route path="/collective/session/:sessionId" element={<JoinSessionPage />} />
```

### Database is Already Set Up ✅
These tables exist and are ready:
- `artpacks` - Art pack manifests
- `collective_sessions` - Session containers
- `session_participants` - Individual participants
- Supabase Realtime enabled

---

## File Structure

Everything is in `src/modules/sacred-shifter-core/`:

**Core Engine:**
- `PackEngine.ts` - Runtime orchestration
- `GAAClock.ts` - 432 Hz harmonics
- `SonicOrchestrator.ts` - Envelope generators

**Collective Mode:**
- `ParticipantEncoder.ts` - Identity → Visual signature
- `CollectiveSession.ts` - Real-time session management
- `CollectiveCanvas.tsx` - Multi-participant renderer

**Pages:**
- `DemoMode.tsx` - Interactive preview (no DB needed)
- `CreateSessionPage.tsx` - Create collective session
- `JoinSessionPage.tsx` - Join session flow
- `PortraitGenerator.tsx` - Solo portrait page

**Art Pack:**
- `/public/artpacks/CollectiveMandala/` - Adaptive rendering pack

---

## Testing Checklist

- [ ] Demo loads at `/demo/sacred-shifter`
- [ ] Can switch between all 4 modes
- [ ] Animation runs at 30-60 FPS
- [ ] Play/Pause and Reset buttons work
- [ ] Colors are vibrant and distinct
- [ ] No console errors

---

## Quick Troubleshooting

**Blank screen?**
→ Check console, verify pack in database

**Low FPS?**
→ Close dev tools, try smaller mode

**Need help?**
→ Read `DEMO_INSTRUCTIONS_FOR_CURSOR.md`

---

## What Makes This Special

1. **Scale-Invariant**: Works for 1 or 10,000 participants
2. **Deterministic**: Same identity = same visual signature always
3. **Beautiful**: Sacred geometry + 432 Hz harmonics
4. **Real-Time**: Supabase Realtime synchronization
5. **Safe**: Photosensitive protection built-in
6. **Fast**: 60 FPS with hundreds of participants

---

**Ready to see the magic?**
Add the route, visit `/demo/sacred-shifter`, and click those mode buttons! 🎨✨
