import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface JournalEntry {
  id?: string;
  userId: string;
  sigilId?: string;
  sessionId: string;
  timestamp: number;
  reflectionText: string;
  tags: string[];
  beforeMetrics?: Record<string, number>;
  afterMetrics?: Record<string, number>;
}

export class IntegrationJournal {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async createEntry(entry: Omit<JournalEntry, 'id' | 'timestamp' | 'userId'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('integration_journal')
      .insert({
        user_id: this.userId,
        sigil_id: entry.sigilId,
        session_id: entry.sessionId,
        reflection_text: entry.reflectionText,
        tags: entry.tags,
        before_metrics: entry.beforeMetrics || {},
        after_metrics: entry.afterMetrics || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create journal entry:', error);
      return null;
    }

    return data.id;
  }

  async getEntries(limit: number = 50): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('integration_journal')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch journal entries:', error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      sigilId: d.sigil_id,
      sessionId: d.session_id,
      timestamp: new Date(d.created_at).getTime(),
      reflectionText: d.reflection_text,
      tags: d.tags || [],
      beforeMetrics: d.before_metrics,
      afterMetrics: d.after_metrics
    }));
  }

  async getEntriesForSigil(sigilId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('integration_journal')
      .select('*')
      .eq('user_id', this.userId)
      .eq('sigil_id', sigilId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch sigil entries:', error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      sigilId: d.sigil_id,
      sessionId: d.session_id,
      timestamp: new Date(d.created_at).getTime(),
      reflectionText: d.reflection_text,
      tags: d.tags || [],
      beforeMetrics: d.before_metrics,
      afterMetrics: d.after_metrics
    }));
  }

  async searchByTag(tag: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('integration_journal')
      .select('*')
      .eq('user_id', this.userId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false});

    if (error) {
      console.error('Failed to search by tag:', error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      sigilId: d.sigil_id,
      sessionId: d.session_id,
      timestamp: new Date(d.created_at).getTime(),
      reflectionText: d.reflection_text,
      tags: d.tags || [],
      beforeMetrics: d.before_metrics,
      afterMetrics: d.after_metrics
    }));
  }

  async getAllTags(): Promise<Map<string, number>> {
    const entries = await this.getEntries(1000);
    const tagCounts = new Map<string, number>();

    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return tagCounts;
  }

  static generatePrompts(metrics: {
    coherence: number;
    complexity: number;
    polarity: number;
    residual: number;
    uncertainty: number;
  }): string[] {
    const prompts: string[] = [];

    prompts.push('What shifted in your awareness?');

    if (metrics.coherence > 0.7) {
      prompts.push('Describe the quality of alignment you felt.');
    }

    if (metrics.residual < 0.3) {
      prompts.push('What tension resolved during this session?');
    }

    if (metrics.complexity > 0.6) {
      prompts.push('What complexity became clear?');
    }

    if (Math.abs(metrics.polarity - 0.5) < 0.1) {
      prompts.push('How did opposites feel integrated?');
    }

    if (metrics.uncertainty > 0.5) {
      prompts.push('What unknown became comfortable?');
    }

    return prompts;
  }

  async analyzeGrowth(): Promise<{
    totalEntries: number;
    coherenceTrend: 'improving' | 'stable' | 'declining';
    commonTags: string[];
    insights: string[];
  }> {
    const entries = await this.getEntries(100);

    if (entries.length < 3) {
      return {
        totalEntries: entries.length,
        coherenceTrend: 'stable',
        commonTags: [],
        insights: ['Keep journaling to build insights over time.']
      };
    }

    const coherenceValues = entries
      .filter(e => e.afterMetrics?.coherence)
      .map(e => e.afterMetrics!.coherence);

    let coherenceTrend: 'improving' | 'stable' | 'declining' = 'stable';

    if (coherenceValues.length >= 5) {
      const recent = coherenceValues.slice(0, 5);
      const earlier = coherenceValues.slice(-5);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

      if (recentAvg > earlierAvg + 0.1) {
        coherenceTrend = 'improving';
      } else if (recentAvg < earlierAvg - 0.1) {
        coherenceTrend = 'declining';
      }
    }

    const tagCounts = await this.getAllTags();
    const commonTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const insights: string[] = [];

    if (coherenceTrend === 'improving') {
      insights.push('Your coherence is steadily improving across sessions.');
    } else if (coherenceTrend === 'declining') {
      insights.push('Consider revisiting past sigils to re-anchor successful states.');
    }

    if (entries.length >= 10) {
      insights.push(`You've created ${entries.length} journal entries - building deep self-knowledge.`);
    }

    if (commonTags.length > 0) {
      insights.push(`Your most explored themes: ${commonTags.join(', ')}`);
    }

    return {
      totalEntries: entries.length,
      coherenceTrend,
      commonTags,
      insights
    };
  }
}
