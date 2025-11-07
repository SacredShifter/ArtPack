import { createClient } from '@supabase/supabase-js';
import { TourContext, RegionSeed } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class TourContextResolver {
  private cache: Map<string, TourContext> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000;

  async resolveSession(sessionId: string): Promise<TourContext | null> {
    const cached = this.cache.get(sessionId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    try {
      const { data: session, error } = await supabase
        .from('tour_sessions')
        .select('id, location_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (error) throw error;
      if (!session) return null;

      let context: TourContext = {
        sessionId: session.id,
        timestamp: Date.now()
      };

      if (session.location_id) {
        const { data: location } = await supabase
          .from('tour_locations')
          .select('id, region_name, coordinates')
          .eq('id', session.location_id)
          .maybeSingle();

        if (location) {
          context.locationId = location.id;
          context.regionName = location.region_name;
          context.coordinates = location.coordinates;
        }
      }

      this.cache.set(sessionId, context);
      return context;
    } catch (error) {
      console.error('Failed to resolve tour context:', error);
      return null;
    }
  }

  contextToSeed(context: TourContext): RegionSeed {
    return {
      region_name: context.regionName || 'Unknown',
      lat: context.coordinates?.lat || 0,
      lng: context.coordinates?.lng || 0,
      cultural_essence: context.regionName,
      timestamp: context.timestamp
    };
  }

  getDefaultSeed(): RegionSeed {
    return {
      region_name: 'Global Consciousness',
      lat: 0,
      lng: 0,
      timestamp: Date.now()
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const tourContextResolver = new TourContextResolver();
