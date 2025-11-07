import { supabase } from './TourContextResolver';
import { ParticipantIdentity, ParticipantSignature, ParticipantEncoder } from './ParticipantEncoder';

export interface CollectiveSessionData {
  id: string;
  title: string;
  createdAt: number;
  createdBy: string;
  mode: 'individual' | 'small_group' | 'large_group' | 'massive';
  isLive: boolean;
  packId?: string;
  regionSeed?: string;
}

export interface ParticipantContribution {
  sessionId: string;
  participantId: string;
  identity: ParticipantIdentity;
  signature: ParticipantSignature;
  captureUrl?: string;
  timestamp: number;
}

export class CollectiveSession {
  private sessionId: string;
  private participants: Map<string, ParticipantContribution> = new Map();
  private realtimeChannel: any = null;
  private onUpdateCallback?: (participants: ParticipantContribution[]) => void;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async initialize(): Promise<void> {
    await this.loadExistingParticipants();
    await this.subscribeToRealtime();
  }

  private async loadExistingParticipants(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      if (data) {
        data.forEach((row, index) => {
          const identity: ParticipantIdentity = {
            id: row.participant_id,
            name: row.name,
            initials: row.initials,
            joinedAt: new Date(row.joined_at).getTime(),
            role: row.role || 'viewer',
            personalCoherence: row.personal_coherence
          };

          const signature = ParticipantEncoder.encode(identity, data.length, index);

          this.participants.set(row.participant_id, {
            sessionId: this.sessionId,
            participantId: row.participant_id,
            identity,
            signature,
            captureUrl: row.capture_url,
            timestamp: new Date(row.joined_at).getTime()
          });
        });
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }

  private async subscribeToRealtime(): Promise<void> {
    this.realtimeChannel = supabase
      .channel(`session:${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${this.sessionId}`
        },
        (payload) => {
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  private handleRealtimeUpdate(payload: any): void {
    const participants = Array.from(this.participants.values());

    if (payload.eventType === 'INSERT') {
      const row = payload.new;
      const identity: ParticipantIdentity = {
        id: row.participant_id,
        name: row.name,
        initials: row.initials,
        joinedAt: new Date(row.joined_at).getTime(),
        role: row.role || 'viewer',
        personalCoherence: row.personal_coherence
      };

      const signature = ParticipantEncoder.encode(identity, participants.length + 1, participants.length);

      this.participants.set(row.participant_id, {
        sessionId: this.sessionId,
        participantId: row.participant_id,
        identity,
        signature,
        timestamp: new Date(row.joined_at).getTime()
      });
    } else if (payload.eventType === 'UPDATE') {
      const row = payload.new;
      const existing = this.participants.get(row.participant_id);
      if (existing) {
        existing.identity.personalCoherence = row.personal_coherence;
        existing.captureUrl = row.capture_url;

        const allParticipants = Array.from(this.participants.values());
        const index = allParticipants.findIndex(p => p.participantId === row.participant_id);
        existing.signature = ParticipantEncoder.encode(existing.identity, allParticipants.length, index);
      }
    } else if (payload.eventType === 'DELETE') {
      this.participants.delete(payload.old.participant_id);
    }

    if (this.onUpdateCallback) {
      this.onUpdateCallback(Array.from(this.participants.values()));
    }
  }

  async addParticipant(identity: ParticipantIdentity): Promise<ParticipantSignature> {
    try {
      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: this.sessionId,
          participant_id: identity.id,
          name: identity.name,
          initials: identity.initials,
          role: identity.role,
          personal_coherence: identity.personalCoherence || 0.7,
          joined_at: new Date(identity.joinedAt).toISOString()
        });

      if (error) throw error;

      const participants = Array.from(this.participants.values());
      const signature = ParticipantEncoder.encode(identity, participants.length + 1, participants.length);

      return signature;
    } catch (error) {
      console.error('Failed to add participant:', error);
      throw error;
    }
  }

  async updateParticipantCapture(participantId: string, captureUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('session_participants')
        .update({ capture_url: captureUrl })
        .eq('session_id', this.sessionId)
        .eq('participant_id', participantId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update capture:', error);
      throw error;
    }
  }

  getParticipants(): ParticipantContribution[] {
    return Array.from(this.participants.values());
  }

  getParticipantCount(): number {
    return this.participants.size;
  }

  getSessionMode(): CollectiveSessionData['mode'] {
    const count = this.participants.size;
    if (count === 1) return 'individual';
    if (count <= 50) return 'small_group';
    if (count <= 1000) return 'large_group';
    return 'massive';
  }

  onUpdate(callback: (participants: ParticipantContribution[]) => void): void {
    this.onUpdateCallback = callback;
  }

  async destroy(): Promise<void> {
    if (this.realtimeChannel) {
      await supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.participants.clear();
  }

  static async createSession(title: string, createdBy: string, packId?: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('collective_sessions')
        .insert({
          title,
          created_by: createdBy,
          is_live: true,
          pack_id: packId,
          mode: 'individual'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  static async getSession(sessionId: string): Promise<CollectiveSessionData | null> {
    try {
      const { data, error } = await supabase
        .from('collective_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        createdAt: new Date(data.created_at).getTime(),
        createdBy: data.created_by,
        mode: data.mode,
        isLive: data.is_live,
        packId: data.pack_id
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }
}
