import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface CollectiveEvent {
  id: string;
  title: string;
  description: string;
  scheduled_start: Date;
  duration_minutes: number;
  event_type: string;
  intention: string;
  max_participants?: number;
  current_participants: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  broadcast_url?: string;
  field_seed: any;
  is_public: boolean;
}

export interface FieldSnapshot {
  id: string;
  event_id: string;
  timestamp: Date;
  participant_count: number;
  avg_coherence: number;
  std_coherence: number;
  dominant_archetype?: string;
  synchrony_score: number;
  element_ratios: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  field_geometry: string;
  emergence_markers: any;
}

export class CollectiveEventManager {
  static async getUpcomingEvents(): Promise<CollectiveEvent[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('collective_events')
      .select('*')
      .eq('is_public', true)
      .in('status', ['scheduled', 'live'])
      .gte('scheduled_start', now)
      .order('scheduled_start', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }

    return data.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      scheduled_start: new Date(d.scheduled_start),
      duration_minutes: d.duration_minutes,
      event_type: d.event_type,
      intention: d.intention,
      max_participants: d.max_participants,
      current_participants: d.current_participants,
      status: d.status,
      broadcast_url: d.broadcast_url,
      field_seed: d.field_seed,
      is_public: d.is_public
    }));
  }

  async getFieldHistory(eventId: string, lastNMinutes: number = 10): Promise<FieldSnapshot[]> {
    const cutoff = new Date(Date.now() - lastNMinutes * 60 * 1000);

    const { data, error } = await supabase
      .from('collective_field_snapshots')
      .select('*')
      .eq('event_id', eventId)
      .gte('timestamp', cutoff.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to fetch field history:', error);
      return [];
    }

    return data.map(d => ({
      id: d.id,
      event_id: d.event_id,
      timestamp: new Date(d.timestamp),
      participant_count: d.participant_count,
      avg_coherence: d.avg_coherence,
      std_coherence: d.std_coherence,
      dominant_archetype: d.dominant_archetype,
      synchrony_score: d.synchrony_score,
      element_ratios: d.element_ratios,
      field_geometry: d.field_geometry,
      emergence_markers: d.emergence_markers
    }));
  }

  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    return true;
  }

  async leaveEvent(): Promise<boolean> {
    return true;
  }

  recordCoherenceSample(coherence: number) {
  }
}
