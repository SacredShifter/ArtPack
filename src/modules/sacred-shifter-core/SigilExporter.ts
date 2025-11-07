import html2canvas from 'html2canvas';
import { createClient } from '@supabase/supabase-js';
import { ArchetypeLibrary, Archetype } from './ArchetypeLibrary';
import { EvoParams } from '../mirror-unseen/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface SigilMetadata {
  sessionId: string;
  userId: string;
  timestamp: number;
  archetype: Archetype | null;
  metrics: {
    coherence: number;
    complexity: number;
    polarity: number;
    uncertainty: number;
    residual: number;
  };
  evoParams: EvoParams;
  dominantFrequency: number;
}

export class SigilExporter {
  static async captureSigil(
    canvasElement: HTMLCanvasElement | HTMLElement,
    metadata: SigilMetadata
  ): Promise<{ sigilId: string; imageUrl: string } | null> {
    try {
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const fileName = `sigil_${metadata.userId}_${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resonance_artifacts')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Failed to upload sigil:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('resonance_artifacts')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      const svgData = this.generateSVG(metadata.evoParams);

      const { data: sigilData, error: insertError } = await supabase
        .from('learning_sigils')
        .insert({
          user_id: metadata.userId,
          session_id: metadata.sessionId,
          archetype_name: metadata.archetype?.name || 'Unknown',
          geometry_type: metadata.archetype?.geometryType || 'custom',
          image_url: imageUrl,
          svg_data: svgData,
          coherence: metadata.metrics.coherence,
          complexity: metadata.metrics.complexity,
          polarity: metadata.metrics.polarity,
          uncertainty: metadata.metrics.uncertainty,
          residual: metadata.metrics.residual,
          symmetry_m: metadata.evoParams.m,
          n1: metadata.evoParams.n1,
          n2: metadata.evoParams.n2,
          n3: metadata.evoParams.n3,
          lift: metadata.evoParams.lift,
          dominant_frequency: metadata.dominantFrequency,
          teaching_text: metadata.archetype?.teaching,
          color_palette: metadata.archetype?.colorPalette
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to save sigil metadata:', insertError);
        return null;
      }

      await this.updateArchetypeInstance(metadata);

      return {
        sigilId: sigilData.id,
        imageUrl
      };
    } catch (error) {
      console.error('Failed to capture sigil:', error);
      return null;
    }
  }

  static async getUserSigils(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('learning_sigils')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch sigils:', error);
      return [];
    }

    return data || [];
  }

  static async revisitSigil(sigilId: string): Promise<void> {
    const { error } = await supabase
      .from('learning_sigils')
      .update({
        revisit_count: supabase.rpc('increment', { row_id: sigilId }),
        last_revisited: new Date().toISOString()
      })
      .eq('id', sigilId);

    if (error) {
      console.error('Failed to update revisit count:', error);
    }
  }

  private static generateSVG(params: EvoParams): string {
    const { m, n1, n2, n3, lift } = params;
    const size = 400;
    const center = size / 2;
    const radius = size * 0.4;

    const points: string[] = [];
    const steps = 360;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const r = this.superformulaRadius(angle, m, n1, n2, n3);
      const x = center + r * radius * Math.cos(angle);
      const y = center + r * radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    const pathData = `M ${points.join(' L ')} Z`;

    const liftTransform = lift > 0
      ? `transform="perspective(800) rotateX(${lift * 30})"`
      : '';

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <defs>
          <radialGradient id="glow">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8"/>
            <stop offset="100%" style="stop-color:#4488ff;stop-opacity:0"/>
          </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="#000000"/>
        <g ${liftTransform}>
          <path d="${pathData}" fill="url(#glow)" stroke="#ffffff" stroke-width="2" opacity="0.9"/>
        </g>
      </svg>
    `.trim();
  }

  private static superformulaRadius(
    angle: number,
    m: number,
    n1: number,
    n2: number,
    n3: number
  ): number {
    const t1 = Math.pow(Math.abs(Math.cos((m * angle) / 4)), n2);
    const t2 = Math.pow(Math.abs(Math.sin((m * angle) / 4)), n3);
    const sum = t1 + t2;

    if (sum === 0) return 0;

    return Math.pow(sum, -1 / Math.max(n1, 0.0001));
  }

  private static async updateArchetypeInstance(metadata: SigilMetadata): Promise<void> {
    if (!metadata.archetype) return;

    const { data: existing } = await supabase
      .from('archetype_instances')
      .select('*')
      .eq('user_id', metadata.userId)
      .eq('archetype_id', metadata.archetype.id)
      .single();

    if (existing) {
      await supabase
        .from('archetype_instances')
        .update({
          occurrence_count: existing.occurrence_count + 1,
          last_seen: new Date().toISOString(),
          avg_coherence: (existing.avg_coherence * existing.occurrence_count + metadata.metrics.coherence) / (existing.occurrence_count + 1)
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('archetype_instances').insert({
        user_id: metadata.userId,
        archetype_id: metadata.archetype.id,
        occurrence_count: 1,
        avg_coherence: metadata.metrics.coherence
      });
    }
  }

  static async exportCollection(userId: string): Promise<{
    sigils: any[];
    archetypes: Map<string, number>;
    insights: string[];
  }> {
    const sigils = await this.getUserSigils(userId);

    const archetypes = new Map<string, number>();
    sigils.forEach(sigil => {
      const count = archetypes.get(sigil.archetype_name) || 0;
      archetypes.set(sigil.archetype_name, count + 1);
    });

    const insights: string[] = [];

    if (sigils.length > 0) {
      const avgCoherence = sigils.reduce((sum, s) => sum + s.coherence, 0) / sigils.length;
      insights.push(`Average coherence across ${sigils.length} sigils: ${(avgCoherence * 100).toFixed(0)}%`);
    }

    const mostCommon = Array.from(archetypes.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostCommon) {
      insights.push(`Most manifested archetype: ${mostCommon[0]} (${mostCommon[1]} times)`);
    }

    return { sigils, archetypes, insights };
  }
}
