import { createClient } from '@supabase/supabase-js';
import { artPackEngine } from '../artpacks/ArtPackEngine';
import type { ArtPackRecord, UploadMetadata, PackReview, SortOption, FilterOption } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class GalleryAPI {
  static async listPacks(
    sort: SortOption = 'newest',
    filter: FilterOption = 'all',
    searchTerm?: string
  ): Promise<ArtPackRecord[]> {
    let query = supabase
      .from('artpacks')
      .select('*')
      .eq('status', 'published');

    if (filter === 'safe') {
      query = query.eq('safety_passed', true);
    } else if (filter === 'featured') {
      query = query.eq('curator_featured', true);
    }

    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,author_name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`
      );
    }

    switch (sort) {
      case 'popular':
        query = query.order('installed_count', { ascending: false });
        break;
      case 'trending':
        query = query.order('favorite_count', { ascending: false });
        break;
      case 'featured':
        query = query.order('curator_featured', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch packs: ${error.message}`);
    }

    return data || [];
  }

  static async getPackById(packId: string): Promise<ArtPackRecord | null> {
    const { data, error } = await supabase
      .from('artpacks')
      .select('*')
      .eq('id', packId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch pack: ${error.message}`);
    }

    return data;
  }

  static async getPackReviews(packId: string): Promise<PackReview[]> {
    const { data, error } = await supabase
      .from('pack_reviews')
      .select('*')
      .eq('pack_id', packId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return data || [];
  }

  static async getUserFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('pack_favorites')
      .select('pack_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }

    return (data || []).map(f => f.pack_id);
  }

  static async toggleFavorite(packId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('pack_favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('pack_id', packId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('pack_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('pack_id', packId);

      if (error) throw new Error(`Failed to remove favorite: ${error.message}`);
      return false;
    } else {
      const { error } = await supabase
        .from('pack_favorites')
        .insert({ user_id: userId, pack_id: packId });

      if (error) throw new Error(`Failed to add favorite: ${error.message}`);
      return true;
    }
  }

  static async addReview(
    packId: string,
    userId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    const { error } = await supabase
      .from('pack_reviews')
      .upsert({
        pack_id: packId,
        user_id: userId,
        rating,
        comment
      });

    if (error) {
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }

  static async uploadPackArchive(
    file: File,
    metadata: UploadMetadata,
    userId: string
  ): Promise<string> {
    const timestamp = Date.now();
    const sanitizedTitle = metadata.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filePath = `${userId}/${timestamp}-${sanitizedTitle}.zip`;

    const { error: uploadError } = await supabase.storage
      .from('artpacks')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('artpacks')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  static async createPackRecord(
    record: Partial<ArtPackRecord>,
    userId: string
  ): Promise<ArtPackRecord> {
    const { data, error } = await supabase
      .from('artpacks')
      .insert({
        ...record,
        author_id: userId,
        status: 'published'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pack record: ${error.message}`);
    }

    return data;
  }

  static async installPack(packId: string, userId?: string): Promise<void> {
    const pack = await this.getPackById(packId);
    if (!pack) {
      throw new Error('Pack not found');
    }

    await artPackEngine.loadPack(pack.manifest_url);

    await supabase
      .from('pack_installations')
      .insert({
        pack_id: packId,
        user_id: userId || null
      });

    await supabase
      .from('artpacks')
      .update({ installed_count: pack.installed_count + 1 })
      .eq('id', packId);
  }

  static async getAverageRating(packId: string): Promise<number> {
    const { data, error } = await supabase
      .from('pack_reviews')
      .select('rating')
      .eq('pack_id', packId);

    if (error || !data || data.length === 0) {
      return 0;
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return sum / data.length;
  }

  static async getMyPacks(userId: string): Promise<ArtPackRecord[]> {
    const { data, error } = await supabase
      .from('artpacks')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch your packs: ${error.message}`);
    }

    return data || [];
  }

  static async updatePack(packId: string, updates: Partial<ArtPackRecord>): Promise<void> {
    const { error } = await supabase
      .from('artpacks')
      .update(updates)
      .eq('id', packId);

    if (error) {
      throw new Error(`Failed to update pack: ${error.message}`);
    }
  }

  static async deletePack(packId: string): Promise<void> {
    const { error } = await supabase
      .from('artpacks')
      .delete()
      .eq('id', packId);

    if (error) {
      throw new Error(`Failed to delete pack: ${error.message}`);
    }
  }

  static async searchByTags(tags: string[]): Promise<ArtPackRecord[]> {
    const { data, error } = await supabase
      .from('artpacks')
      .select('*')
      .eq('status', 'published')
      .overlaps('tags', tags);

    if (error) {
      throw new Error(`Failed to search by tags: ${error.message}`);
    }

    return data || [];
  }

  static extractColorPalette(colors: string[]): { primary: string; secondary: string; accent: string } {
    return {
      primary: colors[0] || '#667eea',
      secondary: colors[1] || '#764ba2',
      accent: colors[2] || '#f093fb'
    };
  }
}
