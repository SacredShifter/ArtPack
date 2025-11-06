# Art Pack Gallery

The Art Pack Gallery is Sacred Shifter's community-driven marketplace for discovering, sharing, and installing visual experiences. It provides a complete ecosystem for artists to publish their work and users to enhance their resonance portraits with new styles.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Gallery System                          │
├─────────────────────────────────────────────────────────────┤
│  GalleryView → Browse & Search → GalleryDetail → Install   │
│       ↓              ↓                ↓             ↓        │
│  GalleryAPI ← Supabase DB → Validation → ArtPackEngine     │
│       ↓                          ↓                           │
│  Storage Bucket            Safety Checks                     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. GalleryAPI

Supabase-backed API layer providing:

- **Pack Discovery**: Search, sort, and filter published packs
- **Upload Management**: ZIP archive upload with metadata
- **Reviews & Ratings**: Community feedback system
- **Favorites**: User collections and bookmarks
- **Analytics**: Download counts and trending metrics

**Key Methods:**

```typescript
// Browse packs
await GalleryAPI.listPacks('featured', 'safe', 'aurora');

// Get pack details
const pack = await GalleryAPI.getPackById(packId);

// Install pack
await GalleryAPI.installPack(packId, userId);

// Upload new pack
const url = await GalleryAPI.uploadPackArchive(file, metadata, userId);
```

### 2. GalleryValidator

Comprehensive safety validation system:

**Manifest Validation:**
- Required fields (id, name, version, entry, minEngine)
- Semantic version format
- License specification
- Safety declarations

**Shader Safety Analysis:**
- Strobe rate detection (frequency > 10Hz flagged)
- Brightness checks (values > 1.5 warned)
- Saturated red detection (photosensitive trigger)
- Rapid color cycling analysis
- High-contrast flash detection

**Safety Scoring:**
```typescript
const score = GalleryValidator.getSafetyScore(report);
// Returns 0-100 score based on:
// - Passed checks (each worth points)
// - Warning penalty (-5 points each)
// - Error penalty (-20 points each)
```

**Safety Labels:**
- 90-100: Excellent (green)
- 75-89: Good (blue)
- 60-74: Fair (yellow)
- 40-59: Caution (orange)
- 0-39: Warning (red)

### 3. SignatureUtils

JWT-based pack verification:

```typescript
// Sign manifest (curator only)
const signature = await SignatureUtils.signManifest(manifest, privateKey);

// Verify signature
const payload = await SignatureUtils.verifySignature(signature, publicKey);

// Check validity
const isValid = await SignatureUtils.isSignatureValid(signature);
```

Uses RSA-256 algorithm with demo keys included. Replace with production curator keys for live deployment.

### 4. UI Components

#### GalleryView
Main browsing interface featuring:
- Animated grid layout with fade-in effects
- Real-time search with tag matching
- Sorting: Featured / Newest / Popular / Trending
- Filtering: All / Safe Only / Featured / Favorites
- Install button with loading states
- Responsive design (mobile → desktop)

#### GalleryDetail
Immersive pack information modal:
- Large preview image/video
- Comprehensive metadata display
- Safety report with detailed checks
- Community reviews and ratings
- Installation statistics
- Manifest link and verification status

#### GalleryUploader
Drag-and-drop upload experience:
- ZIP file validation (max 10MB)
- Real-time validation feedback
- Metadata form (title, description, author, license, tags)
- Progress indicator
- Error handling with clear messaging

## Database Schema

### `artpacks` Table

Core pack registry with rich metadata:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| manifest_url | text | Public manifest.json URL |
| preview_url | text | Preview media (webm/gif/png) |
| thumbnail_url | text | Grid thumbnail |
| author_id | uuid | Reference to auth.users |
| author_name | text | Display name |
| title | text | Pack name |
| description | text | Rich description |
| version | text | Semantic version |
| license | text | License type (MIT, GPL, etc) |
| tags | text[] | Searchable tags |
| color_palette | jsonb | Dominant colors for UI |
| safety_passed | boolean | Validation result |
| safety_report | jsonb | Detailed validation data |
| signature | text | JWT verification signature |
| installed_count | integer | Download counter |
| favorite_count | integer | Favorites counter |
| curator_featured | boolean | Curator highlight |
| status | text | draft / published / rejected |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Update timestamp |

### `pack_favorites` Table

User bookmarks:
- user_id → auth.users
- pack_id → artpacks
- Automatic favorite_count increment/decrement via triggers

### `pack_reviews` Table

Community feedback:
- rating (1-5 stars)
- comment text
- One review per user per pack
- Only visible for published packs

### `pack_installations` Table

Analytics tracking:
- Records each installation
- Supports anonymous users
- Drives installed_count metric

## Row Level Security (RLS)

### Public Access
- Anyone can view published packs
- Anyone can view reviews for published packs
- Anyone can record installations

### Authenticated Access
- Users can view their own drafts
- Users can create packs (author_id = auth.uid())
- Users can update/delete their own packs
- Users can favorite packs
- Users can write/edit their own reviews

### No Admin Backdoors
All curator actions (featuring, rejection) must go through authenticated pathways. No bypasses for safety.

## For Artists: Publishing Your Pack

### 1. Create Your Pack

Follow the [Art Pack authoring guide](../artpacks/README.md) to build your visual experience.

**Required files:**
```
my-pack/
├── manifest.json
├── index.ts
└── (optional) shaders/, textures/, etc.
```

### 2. Package as ZIP

```bash
cd my-pack
zip -r my-pack.zip .
```

**Checklist before packaging:**
- Manifest has all required fields
- Safety declarations are accurate
- Entry point exports `register()` function
- All resources are self-contained
- File size < 10MB

### 3. Upload via Gallery

1. Click "Upload Pack" in Gallery view
2. Drag-drop your ZIP or browse
3. Fill in metadata:
   - **Title**: Display name (required)
   - **Author Name**: Your name (required)
   - **Description**: What makes your pack unique
   - **License**: Choose appropriate license
   - **Tags**: Searchable keywords (e.g., "geometric", "dreamy", "minimal")
4. Review validation warnings
5. Submit for publication

### 4. Validation Process

Your pack undergoes automated safety checks:

**Pass Criteria:**
- Manifest valid
- Strobe rate ≤ 3Hz
- No critical safety violations
- File size within limits

**Warnings (allowed):**
- Minor brightness concerns
- Missing optional fields
- Performance considerations

**Failures (must fix):**
- Invalid manifest structure
- Dangerous strobe patterns
- File size exceeded
- Missing entry point

### 5. Post-Publication

- Pack appears in gallery immediately
- Users can install with one click
- Reviews and ratings accumulate
- Curator may feature exceptional packs

## For Curators: Managing the Gallery

### Featured Packs

Update pack to highlight in gallery:

```typescript
await GalleryAPI.updatePack(packId, {
  curator_featured: true
});
```

Featured packs appear:
- At top of "Featured" sort
- With special badge in grid view
- In detail view with award icon

### Safety Review

Check detailed safety report:

```typescript
const pack = await GalleryAPI.getPackById(packId);
const score = GalleryValidator.getSafetyScore(pack.safety_report);

if (score < 60) {
  console.warn('Manual review recommended');
}
```

### Content Moderation

Change pack status:

```typescript
// Reject inappropriate content
await GalleryAPI.updatePack(packId, {
  status: 'rejected'
});

// Return to draft for fixes
await GalleryAPI.updatePack(packId, {
  status: 'draft'
});
```

### Signature Verification

Verify curator-signed packs:

```typescript
const isValid = await SignatureUtils.isSignatureValid(pack.signature);
```

## Safety Philosophy

Sacred Shifter prioritizes user safety, especially for photosensitive individuals and those seeking low-sensory experiences.

### Photosensitive Guidelines

**Red Flags:**
- Flashing > 3Hz
- Pure saturated red flashes
- High-contrast strobing
- Rapid full-screen color changes

**Best Practices:**
- Use smooth transitions
- Avoid pure white/black alternation
- Respect low-sensory mode
- Test with photosensitive simulators

### Accessibility Commitments

1. **Low-Sensory Mode**: All packs must respect `lowSensoryMode` cap
2. **Safety Warnings**: Declare photosensitive content honestly
3. **Gradual Intensity**: Ramp up, don't shock
4. **Escape Routes**: Users can always switch packs instantly

## Technical Implementation Notes

### Storage Strategy

Packs are stored in Supabase Storage bucket `artpacks/`:

```
artpacks/
  ├── {user_id}/
  │   ├── {timestamp}-{pack-name}.zip
  │   └── ...
  └── ...
```

Public URLs generated automatically for manifest access.

### Pack Installation Flow

```typescript
// 1. User clicks "Install"
await GalleryAPI.installPack(packId, userId);

// 2. Fetch pack metadata
const pack = await GalleryAPI.getPackById(packId);

// 3. Load into ArtPackEngine
await artPackEngine.loadPack(pack.manifest_url);

// 4. Record installation
// (happens automatically in installPack)

// 5. Increment counter
// (triggers via database function)
```

### Search Implementation

Search matches across:
- `title` (case-insensitive partial match)
- `description` (case-insensitive partial match)
- `author_name` (case-insensitive partial match)
- `tags` (array contains match)

Uses PostgreSQL full-text capabilities for performance.

### Trending Algorithm

Trending sort uses `favorite_count` as proxy for recent interest. Future enhancement could implement time-decay scoring:

```sql
-- Future trending score
rank = (favorite_count * 10 + installed_count) /
       (days_since_created + 1)
```

## Future Enhancements

### Phase 2: Enhanced Community
- [ ] User profiles with galleries
- [ ] Pack collections/playlists
- [ ] Comments on packs
- [ ] Curator spotlight feed
- [ ] "Inspired by" remix attribution

### Phase 3: Advanced Features
- [ ] Animated preview generation
- [ ] Pack preview in gallery (live render)
- [ ] Version history and updates
- [ ] Dependency management for shared modules
- [ ] Automated preview video generation

### Phase 4: Marketplace
- [ ] Premium packs with licensing
- [ ] Donation/tip system for artists
- [ ] Curator marketplace with verification tiers
- [ ] Pack bundles and collections
- [ ] Seasonal/themed pack challenges

### Phase 5: Developer Tools
- [ ] CLI: `create-resonance-pack` generator
- [ ] VS Code extension for pack development
- [ ] Local testing environment
- [ ] Performance profiling tools
- [ ] Shader playground

## Support & Community

For questions, feedback, or collaboration:

- Report issues in pack uploads
- Suggest new safety checks
- Propose gallery features
- Share your creations

## License

Gallery system code is part of Sacred Shifter core.
Individual packs retain their declared licenses.

---

**Remember**: The Gallery is a sacred digital space. Create with intention, share with generosity, and experience with gratitude.
