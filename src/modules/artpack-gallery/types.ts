export interface ArtPackRecord {
  id: string;
  manifest_url: string;
  preview_url: string | null;
  thumbnail_url: string | null;
  author_id: string | null;
  author_name: string;
  title: string;
  description: string;
  version: string;
  license: string;
  tags: string[];
  color_palette: ColorPalette;
  safety_passed: boolean;
  safety_report: SafetyReport;
  signature: string | null;
  installed_count: number;
  favorite_count: number;
  curator_featured: boolean;
  status: 'draft' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ColorPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  colors?: string[];
}

export interface SafetyReport {
  valid: boolean;
  warnings: string[];
  errors: string[];
  checks: {
    strobeRate?: { passed: boolean; value: number };
    brightness?: { passed: boolean; value: number };
    contrastFlash?: { passed: boolean };
    saturatedRed?: { passed: boolean };
  };
  timestamp: string;
}

export interface PackReview {
  id: string;
  pack_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PackFavorite {
  user_id: string;
  pack_id: string;
  created_at: string;
}

export interface UploadMetadata {
  title: string;
  description: string;
  author_name: string;
  license: string;
  tags: string[];
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  safetyReport: SafetyReport;
}

export type SortOption = 'newest' | 'popular' | 'trending' | 'featured';
export type FilterOption = 'all' | 'safe' | 'featured' | 'favorites';
