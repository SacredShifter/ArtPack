import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const packs = [
  {
    id: 'eternal-void',
    version: '1.0.0',
    dir: 'EternalVoid',
    dbId: 'b64313f4-5d52-4487-9cf3-0edc86376d39'
  },
  {
    id: 'golden-ratio-spiral',
    version: '1.0.0',
    dir: 'GoldenRatio',
    dbId: '5940e2ac-abe5-4683-9b4f-74af1a50c951'
  },
  {
    id: 'flower-of-life',
    version: '1.0.0',
    dir: 'FlowerOfLife',
    dbId: '54d55e7d-55d2-46fb-a637-5bb4019c1f0b'
  },
  {
    id: 'consciousness-fractal',
    version: '1.0.0',
    dir: 'ConsciousnessFractal',
    dbId: 'eb9c0da3-9b4e-4056-b135-eded6fc4c6f4'
  },
  {
    id: 'fractal-bloom-organic',
    version: '2.0.0',
    dir: 'FractalBloom_Real',
    dbId: 'b678441d-f1c5-423c-99d2-3ded4d1a8834'
  }
];

async function uploadPack(pack) {
  console.log(`\n📦 Uploading ${pack.id}...`);

  const basePath = join(__dirname, '..', 'artpacks', pack.dir);
  const storagePath = `artpacks/${pack.id}/${pack.version}`;

  try {
    // Upload manifest.json
    const manifestContent = readFileSync(join(basePath, 'manifest.json'));
    const { error: manifestError } = await supabase.storage
      .from('resonance_artifacts')
      .upload(`${storagePath}/manifest.json`, manifestContent, {
        contentType: 'application/json',
        upsert: true
      });

    if (manifestError) throw manifestError;
    console.log(`  ✅ Uploaded manifest.json`);

    // Upload index.js
    const indexContent = readFileSync(join(basePath, 'index.js'));
    const { error: indexError } = await supabase.storage
      .from('resonance_artifacts')
      .upload(`${storagePath}/index.js`, indexContent, {
        contentType: 'application/javascript',
        upsert: true
      });

    if (indexError) throw indexError;
    console.log(`  ✅ Uploaded index.js`);

    // Update database with correct manifest URL
    const manifestUrl = `${storagePath}/manifest.json`;
    const { error: updateError } = await supabase
      .from('artpacks')
      .update({
        manifest_url: manifestUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', pack.dbId);

    if (updateError) throw updateError;
    console.log(`  ✅ Updated database record`);

    // Get public URL to verify
    const { data } = supabase.storage
      .from('resonance_artifacts')
      .getPublicUrl(`${storagePath}/manifest.json`);

    console.log(`  🔗 Public URL: ${data.publicUrl}`);

    return true;
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Sacred Shifter art pack upload...\n');

  let successCount = 0;
  for (const pack of packs) {
    const success = await uploadPack(pack);
    if (success) successCount++;
  }

  console.log(`\n✨ Complete! ${successCount}/${packs.length} packs uploaded successfully.`);
}

main();
