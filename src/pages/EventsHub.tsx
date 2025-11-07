import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollectiveEventManager } from '../modules/sacred-shifter-core/CollectiveEventManager';
import type { CollectiveEvent } from '../modules/sacred-shifter-core/CollectiveEventManager';
import { Calendar, Users, Clock, Sparkles, Globe } from 'lucide-react';

export function EventsHub() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CollectiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const upcomingEvents = await CollectiveEventManager.getUpcomingEvents();
    setEvents(upcomingEvents);
    setLoading(false);
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  function getEventGradient(index: number): string {
    const gradients = [
      'from-cyan-500/20 to-purple-500/20',
      'from-purple-500/20 to-pink-500/20',
      'from-blue-500/20 to-cyan-500/20',
      'from-pink-500/20 to-orange-500/20'
    ];
    return gradients[index % gradients.length];
  }

  function getEventBorder(index: number): string {
    const borders = [
      'border-cyan-500/50',
      'border-purple-500/50',
      'border-blue-500/50',
      'border-pink-500/50'
    ];
    return borders[index % borders.length];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#1a1a2e] to-[#0a0a14] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full">
          <defs>
            <pattern id="constellation-bg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="30" r="1" fill="#8b5cf6" />
              <circle cx="80" cy="60" r="1.5" fill="#06b6d4" />
              <circle cx="150" cy="40" r="1" fill="#ec4899" />
              <circle cx="120" cy="120" r="1" fill="#8b5cf6" />
              <line x1="20" y1="30" x2="80" y2="60" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
              <line x1="80" y1="60" x2="150" y2="40" stroke="#06b6d4" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#constellation-bg)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <Globe className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Collective Events
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join live ceremonies where hundreds gather in synchronized consciousness
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500" />
              <div className="w-16 h-16" />
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl mb-6">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Upcoming Events</h3>
            <p className="text-slate-400">Check back soon for collective experiences</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`group relative bg-gradient-to-br ${getEventGradient(index)} backdrop-blur-xl border ${getEventBorder(index)} rounded-3xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden`}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="absolute top-4 right-4">
                  {event.status === 'live' ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-300 font-semibold">LIVE</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-slate-900/60 border border-slate-700/50 rounded-full">
                      <span className="text-xs text-slate-400 font-medium">Upcoming</span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 flex items-center justify-center mb-4">
                      <Sparkles className="w-10 h-10 text-cyan-400" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">{formatDate(event.scheduled_start)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300">{event.duration_minutes} minutes</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span className="text-slate-300">
                        {event.current_participants} / {event.max_participants || '∞'} participants
                      </span>
                    </div>
                  </div>

                  {event.intention && (
                    <div className="px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-full">
                      <span className="text-xs text-slate-400">Intention: </span>
                      <span className="text-sm text-white font-medium">{event.intention}</span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-3">Want to host an event?</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Create collective experiences for your community with synchronized visual fields
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30">
              Create Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
