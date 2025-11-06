import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const packs = [
  {
    id: 'b64313f4-5d52-4487-9cf3-0edc86376d39',
    title: 'Eternal Void',
    version: '1.0.0',
    manifestUrl: 'https://mikltjgbvxrxndtszorb.supabase.co/storage/v1/object/public/resonance_artifacts/artpacks/eternal-void/1.0.0/manifest.json'
  },
  {
    id: '5940e2ac-abe5-4683-9b4f-74af1a50c951',
    title: 'Golden Ratio Spiral',
    version: '1.0.0',
    manifestUrl: 'https://mikltjgbvxrxndtszorb.supabase.co/storage/v1/object/public/resonance_artifacts/artpacks/golden-ratio-spiral/1.0.0/manifest.json'
  },
  {
    id: '54d55e7d-55d2-46fb-a637-5bb4019c1f0b',
    title: 'Flower of Life Genesis',
    version: '1.0.0',
    manifestUrl: 'https://mikltjgbvxrxndtszorb.supabase.co/storage/v1/object/public/resonance_artifacts/artpacks/flower-of-life/1.0.0/manifest.json'
  },
  {
    id: 'eb9c0da3-9b4e-4056-b135-eded6fc4c6f4',
    title: 'Consciousness Fractal',
    version: '1.0.0',
    manifestUrl: 'https://mikltjgbvxrxndtszorb.supabase.co/storage/v1/object/public/resonance_artifacts/artpacks/consciousness-fractal/1.0.0/manifest.json'
  },
  {
    id: 'b678441d-f1c5-423c-99d2-3ded4d1a8834',
    title: 'Fractal Bloom (Organic)',
    version: '2.0.0',
    manifestUrl: 'https://mikltjgbvxrxndtszorb.supabase.co/storage/v1/object/public/resonance_artifacts/artpacks/fractal-bloom-organic/2.0.0/manifest.json'
  }
];

async function updateUrls() {
  console.log('🔗 Updating art pack manifest URLs in database...\n');

  for (const pack of packs) {
    const { error } = await supabase
      .from('artpacks')
      .update({
        manifest_url: pack.manifestUrl,
        version: pack.version,
        updated_at: new Date().toISOString()
      })
      .eq('id', pack.id);

    if (error) {
      console.error(`❌ ${pack.title}: ${error.message}`);
    } else {
      console.log(`✅ ${pack.title}: URL updated`);
    }
  }

  console.log('\n✨ Done!');
}

updateUrls();
