import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface SnapshotMetadata {
  mode: string;
  participantCount: number;
  timestamp: number;
  fps?: number;
}

export class SnapshotCapture {
  static async captureCanvas(
    canvas: HTMLCanvasElement,
    metadata: SnapshotMetadata
  ): Promise<{ imageUrl: string; recordId: string } | null> {
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const filename = `snapshot-${Date.now()}-${metadata.mode}.png`;
      const filePath = `snapshots/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('resonance_artifacts')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('resonance_artifacts')
        .getPublicUrl(filePath);

      const { data: record, error: dbError } = await supabase
        .from('session_snapshots')
        .insert({
          image_url: publicUrlData.publicUrl,
          mode: metadata.mode,
          participant_count: metadata.participantCount,
          fps: metadata.fps,
          created_at: new Date(metadata.timestamp).toISOString()
        })
        .select('id')
        .maybeSingle();

      if (dbError) {
        console.error('Failed to save snapshot metadata:', dbError);
      }

      return {
        imageUrl: publicUrlData.publicUrl,
        recordId: record?.id || ''
      };
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
      return null;
    }
  }

  static downloadImage(canvas: HTMLCanvasElement, filename: string) {
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  }
}
