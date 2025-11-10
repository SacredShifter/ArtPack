import { useState, useEffect } from 'react';
import { Lock, Check, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface Pack {
  id: string;
  name: string;
  order: number;
  motion_profile: string;
  power_rating: number;
  unlocked: boolean;
  completed: boolean;
  thumbnail_url?: string;
  color_palette?: {
    primary: string;
    accent: string;
  };
}

interface SeriesTimelineProps {
  seriesId: string;
  seriesName: string;
  packs: Pack[];
  currentPackId: string | null;
  onPackSelect: (packId: string) => void;
  userMetrics?: {
    coherence: number;
    stillness: number;
    gain: number;
  };
}

export function SeriesTimeline({
  seriesId,
  seriesName,
  packs,
  currentPackId,
  onPackSelect,
  userMetrics,
}: SeriesTimelineProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sortedPacks = [...packs].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const container = document.getElementById('series-timeline-scroll');
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [packs]);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('series-timeline-scroll');
    if (!container) return;

    const scrollAmount = 300;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const getPackStatusClass = (pack: Pack) => {
    if (pack.id === currentPackId) {
      return 'ring-4 ring-purple-500 ring-opacity-70 shadow-lg shadow-purple-500/50';
    }
    if (!pack.unlocked) {
      return 'opacity-50 grayscale';
    }
    if (pack.completed) {
      return 'ring-2 ring-green-500/50';
    }
    return 'ring-2 ring-purple-500/30 hover:ring-purple-500/60';
  };

  const getPackGlow = (pack: Pack) => {
    if (!pack.unlocked) return '';
    if (pack.id === currentPackId) {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div className="relative bg-slate-900/60 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-2xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">{seriesName}</h2>
        <p className="text-sm text-purple-300/70">
          Journey through {sortedPacks.length} progressive experiences
        </p>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/50 rounded-full p-2 shadow-lg transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-purple-300" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/50 rounded-full p-2 shadow-lg transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-purple-300" />
          </button>
        )}

        <div
          id="series-timeline-scroll"
          className="flex gap-6 overflow-x-auto py-4 px-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-slate-800/50"
          style={{ scrollbarWidth: 'thin' }}
        >
          {sortedPacks.map((pack, index) => (
            <div key={pack.id} className="relative flex-shrink-0">
              <button
                onClick={() => pack.unlocked && onPackSelect(pack.id)}
                disabled={!pack.unlocked}
                className={`relative flex flex-col items-center gap-3 transition-all duration-300 ${
                  pack.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`relative w-32 h-32 rounded-xl overflow-hidden border-2 transition-all duration-300 ${getPackStatusClass(
                    pack
                  )} ${getPackGlow(pack)}`}
                  style={{
                    backgroundColor: pack.color_palette?.primary || '#0a0a0f',
                  }}
                >
                  {pack.thumbnail_url && pack.unlocked ? (
                    <img
                      src={pack.thumbnail_url}
                      alt={pack.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {!pack.unlocked && (
                        <Lock className="w-8 h-8 text-slate-500" />
                      )}
                      {pack.unlocked && !pack.completed && (
                        <Play className="w-8 h-8 text-purple-400/50" />
                      )}
                      {pack.completed && (
                        <Check className="w-8 h-8 text-green-400" />
                      )}
                    </div>
                  )}

                  {pack.id === currentPackId && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" />
                    </div>
                  )}

                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      pack.unlocked
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {pack.order}
                  </div>

                  {pack.completed && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center max-w-[140px]">
                  <div
                    className={`font-semibold text-sm mb-1 ${
                      pack.unlocked ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {pack.name}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        pack.unlocked
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      {pack.motion_profile}
                    </span>
                    <span
                      className={`${
                        pack.unlocked ? 'text-purple-400' : 'text-slate-600'
                      }`}
                    >
                      {'⚡'.repeat(pack.power_rating)}
                    </span>
                  </div>
                </div>
              </button>

              {index < sortedPacks.length - 1 && (
                <div
                  className={`absolute top-16 -right-4 w-8 h-0.5 ${
                    sortedPacks[index + 1].unlocked
                      ? 'bg-gradient-to-r from-purple-500 to-purple-400'
                      : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {userMetrics && (
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-purple-300/70">Coherence:</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${userMetrics.coherence * 100}%` }}
                />
              </div>
              <span className="text-purple-200">
                {(userMetrics.coherence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-300/70">Stillness:</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${userMetrics.stillness * 100}%` }}
                />
              </div>
              <span className="text-purple-200">
                {(userMetrics.stillness * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
