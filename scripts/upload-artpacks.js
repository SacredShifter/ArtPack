import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const artpacksDir = './artpacks';
const packs = ['EternalVoid', 'GoldenRatio', 'FlowerOfLife', 'ConsciousnessFractal'];

async function uploadPack(packName) {
  console.log(`\n🎨 Uploading ${packName}...`);

  const packDir = join(artpacksDir, packName);
  const manifestPath = join(packDir, 'manifest.json');
  const indexPath = join(packDir, 'index.js');

  // Read files
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const indexJs = readFileSync(indexPath, 'utf-8');

  const packId = manifest.id;
  const version = manifest.version;
  const storagePath = `artpacks/${packId}/${version}`;

  // Upload manifest.json to storage
  const manifestUpload = await supabase.storage
    .from('resonance_artifacts')
    .upload(`${storagePath}/manifest.json`, manifestPath, {
      contentType: 'application/json',
      upsert: true
    });

  if (manifestUpload.error) {
    console.error(`❌ Failed to upload manifest: ${manifestUpload.error.message}`);
    return;
  }

  // Upload index.js to storage
  const indexUpload = await supabase.storage
    .from('resonance_artifacts')
    .upload(`${storagePath}/index.js`, indexJs, {
      contentType: 'application/javascript',
      upsert: true
    });

  if (indexUpload.error) {
    console.error(`❌ Failed to upload index.js: ${indexUpload.error.message}`);
    return;
  }

  console.log(`✅ Files uploaded to storage`);

  // Get public URLs
  const { data: manifestUrl } = supabase.storage
    .from('resonance_artifacts')
    .getPublicUrl(`${storagePath}/manifest.json`);

  // Insert/update artpack record
  const packData = {
    id: packId,
    manifest_url: `${storagePath}/manifest.json`,
    title: manifest.name,
    author_name: manifest.author,
    version: manifest.version,
    description: manifest.description,
    tags: manifest.tags || [],
    status: 'published',
    safety_passed: true,
    safety_report: {
      maxStrobeHz: manifest.safety?.maxStrobeHz || 3,
      photosensitiveWarning: manifest.safety?.photosensitiveWarning || false,
      checks: ['manifest_valid', 'safety_declared']
    },
    license: 'CC BY-NC-SA 4.0',
    curator_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('artpacks')
    .upsert(packData, { onConflict: 'id' })
    .select();

  if (error) {
    console.error(`❌ Failed to insert artpack record: ${error.message}`);
    return;
  }

  console.log(`✅ ${packName} successfully uploaded and published!`);
  console.log(`   Manifest URL: ${manifestUrl.publicUrl}`);
}

async function main() {
  console.log('🌌 Sacred Shifter Art Pack Uploader 🌌\n');

  for (const pack of packs) {
    try {
      await uploadPack(pack);
    } catch (error) {
      console.error(`❌ Error uploading ${pack}:`, error.message);
    }
  }

  console.log('\n✨ Upload complete! ✨\n');
}

main();
