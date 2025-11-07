import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

const docs = [
  {
    slug: 'user-guide',
    title: 'Sacred Shifter User Guide',
    description: 'Complete guide to using Sacred Shifter - what the metrics mean, how to interpret forms, and practical tips for deepening your practice',
    category: 'guide',
    icon: 'book-open',
    color_gradient: 'from-cyan-500 to-blue-500',
    page_count: '27 pages',
    file: 'SACRED_SHIFTER_USER_GUIDE.md',
    order: 1
  },
  {
    slug: 'developer-guide',
    title: 'Developer Integration Guide',
    description: 'Integration guide for Cursor AI and developers - architecture, APIs, code examples, and complete database schema reference',
    category: 'guide',
    icon: 'code',
    color_gradient: 'from-purple-500 to-pink-500',
    page_count: '35 pages',
    file: 'SACRED_SHIFTER_DEVELOPER_GUIDE.md',
    order: 2
  },
  {
    slug: 'scientific-references',
    title: 'Scientific Research References',
    description: 'Complete research mapping - all 6 consciousness metrics linked to peer-reviewed neuroscience and psychology papers',
    category: 'science',
    icon: 'microscope',
    color_gradient: 'from-emerald-500 to-teal-500',
    page_count: '18 pages',
    file: 'SACRED_SHIFTER_SCIENCE.md',
    order: 3
  },
  {
    slug: 'quick-reference',
    title: 'Quick Reference Guide',
    description: 'Cheat sheet - visual interpretation guide, metrics lookup table, common troubleshooting, and keyboard shortcuts',
    category: 'reference',
    icon: 'zap',
    color_gradient: 'from-yellow-500 to-orange-500',
    page_count: '4 pages',
    file: 'SACRED_SHIFTER_QUICK_REFERENCE.md',
    order: 4
  },
  {
    slug: 'integration-guide',
    title: 'Sacred Shifter Integration',
    description: 'Technical integration guide for embedding Sacred Shifter into existing applications and consciousness platforms',
    category: 'guide',
    icon: 'plug',
    color_gradient: 'from-blue-500 to-indigo-500',
    page_count: '22 pages',
    file: 'SACRED_SHIFTER_INTEGRATION.md',
    order: 5
  },
  {
    slug: 'revolutionary-features',
    title: 'Revolutionary Features',
    description: 'Overview of groundbreaking capabilities - from collective coherence to temporal resonance archives',
    category: 'overview',
    icon: 'sparkles',
    color_gradient: 'from-pink-500 to-rose-500',
    page_count: '12 pages',
    file: 'REVOLUTIONARY_FEATURES.md',
    order: 6
  },
  {
    slug: 'implementation-complete',
    title: 'Implementation Status',
    description: 'Complete system implementation report - all modules, database schemas, and integration points documented',
    category: 'reference',
    icon: 'check-circle',
    color_gradient: 'from-green-500 to-emerald-500',
    page_count: '15 pages',
    file: 'IMPLEMENTATION_COMPLETE.md',
    order: 7
  },
  {
    slug: 'cosmic-system',
    title: 'Cosmic System Architecture',
    description: 'Deep dive into the metaphysical OS architecture - event horizons, semantic labeling, and consciousness telemetry',
    category: 'architecture',
    icon: 'network',
    color_gradient: 'from-violet-500 to-purple-500',
    page_count: '10 pages',
    file: 'COSMIC_SYSTEM_COMPLETE.md',
    order: 8
  }
];

async function uploadDocs() {
  console.log('📚 Uploading documentation to Supabase...\n');

  for (const doc of docs) {
    try {
      const content = readFileSync(doc.file, 'utf-8');

      const { data, error } = await supabase
        .from('documentation')
        .upsert({
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          icon: doc.icon,
          color_gradient: doc.color_gradient,
          page_count: doc.page_count,
          content: content,
          order: doc.order,
          is_published: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'slug'
        });

      if (error) {
        console.error(`❌ Failed to upload ${doc.title}:`, error.message);
      } else {
        console.log(`✅ Uploaded: ${doc.title} (${doc.page_count})`);
      }
    } catch (err) {
      console.error(`❌ Error reading ${doc.file}:`, err.message);
    }
  }

  console.log('\n🎉 Documentation upload complete!');
}

uploadDocs().catch(console.error);
