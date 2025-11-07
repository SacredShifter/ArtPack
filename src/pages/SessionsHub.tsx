import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuidedSessionEngine } from '../modules/sacred-shifter-core/GuidedSessionEngine';
import type { GuidedSession } from '../modules/sacred-shifter-core/GuidedSessionEngine';
import { Wind, Target, Clock, TrendingUp, BookOpen, Calendar } from 'lucide-react';

export function SessionsHub() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<GuidedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const publicSessions = await GuidedSessionEngine.getPublicSessions();

    if (publicSessions.length === 0) {
      const defaults = GuidedSessionEngine.getDefaultSessions();
      for (const session of defaults) {
        await GuidedSessionEngine.createSession(session, 'system');
      }
      const refreshed = await GuidedSessionEngine.getPublicSessions();
      setSessions(refreshed);
    } else {
      setSessions(publicSessions);
    }

    setLoading(false);
  }

  function getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      'beginner': 'text-green-400 border-green-500/50',
      'intermediate': 'text-cyan-400 border-cyan-500/50',
      'advanced': 'text-purple-400 border-purple-500/50'
    };
    return colors[difficulty] || 'text-slate-400 border-slate-500/50';
  }

  function getSessionIcon(index: number) {
    const icons = [Wind, Target, TrendingUp];
    const Icon = icons[index % icons.length];
    return Icon;
  }

  function getCardGradient(index: number): string {
    const gradients = [
      'from-cyan-500/20 to-blue-500/20',
      'from-purple-500/20 to-pink-500/20',
      'from-blue-500/20 to-cyan-500/20'
    ];
    return gradients[index % gradients.length];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#1a1a2e] to-[#0a0a14] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full">
          <defs>
            <pattern id="breath-constellation" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="40" r="1" fill="#06b6d4" />
              <circle cx="90" cy="70" r="1.5" fill="#8b5cf6" />
              <circle cx="120" cy="30" r="1" fill="#ec4899" />
              <line x1="30" y1="40" x2="90" y2="70" stroke="#06b6d4" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#breath-constellation)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-purple-500/50 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Collective Events</span>
          </button>
          <button
            onClick={() => navigate('/docs')}
            className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Documentation</span>
          </button>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <Wind className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Guided Sessions
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Structured practices with breath, sound, and movement synced to living geometry
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500" />
              <div className="w-16 h-16" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sessions.map((session, index) => {
              const Icon = getSessionIcon(index);

              return (
                <div
                  key={session.id}
                  className={`group relative bg-gradient-to-br ${getCardGradient(index)} backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer`}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                  </div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-cyan-400" />
                      </div>

                      <div className={`px-3 py-1 border rounded-full text-xs font-semibold capitalize ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {session.title}
                    </h3>

                    <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                      {session.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300">{session.duration_minutes} minutes</span>
                      </div>

                      {session.intention && (
                        <div className="flex items-center gap-3 text-sm">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-slate-300">{session.intention}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {session.breath_patterns.length > 0 && (
                        <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                          <span className="text-xs text-cyan-300">Breath Work</span>
                        </div>
                      )}
                      {session.sound_cues.length > 0 && (
                        <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                          <span className="text-xs text-purple-300">Guided Audio</span>
                        </div>
                      )}
                      {session.movement_sequences.length > 0 && (
                        <div className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full">
                          <span className="text-xs text-pink-300">Movement</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                      <button className="w-full py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 rounded-full font-semibold text-sm hover:from-cyan-500/30 hover:to-purple-500/30 transition-all">
                        Start Session
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">How It Works</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 flex items-center justify-center">
                  <Wind className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-white font-semibold">Follow Your Breath</h4>
                <p className="text-sm text-slate-400">
                  Visual cues guide your breathing rhythm in sync with the geometry
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50 flex items-center justify-center">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold">Listen to Guidance</h4>
                <p className="text-sm text-slate-400">
                  Narration and tones support your journey through each phase
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 border border-pink-500/50 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-pink-400" />
                </div>
                <h4 className="text-white font-semibold">Watch Transformation</h4>
                <p className="text-sm text-slate-400">
                  Forms evolve as you progress, teaching through sacred geometry
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
