import { useState, useEffect } from 'react';
import { Search, Upload as UploadIcon, Download, Heart, Shield, Sparkles, Star, TrendingUp, Clock, Filter, X } from 'lucide-react';
import { GalleryAPI } from './GalleryAPI';
import { GalleryValidator } from './GalleryValidator';
import { GalleryUploader } from './GalleryUploader';
import { GalleryDetail } from './GalleryDetail';
import type { ArtPackRecord, SortOption, FilterOption } from './types';

export function GalleryView() {
  const [packs, setPacks] = useState<ArtPackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPack, setSelectedPack] = useState<ArtPackRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    loadPacks();
  }, [sortBy, filterBy]);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const data = await GalleryAPI.listPacks(sortBy, filterBy, searchTerm);
      setPacks(data);
    } catch (error) {
      console.error('Failed to load packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPacks();
  };

  const handleInstall = async (pack: ArtPackRecord) => {
    setInstallingId(pack.id);
    try {
      await GalleryAPI.installPack(pack.id);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setInstallingId(null);
    }
  };

  const getSafetyBadge = (pack: ArtPackRecord) => {
    const score = GalleryValidator.getSafetyScore(pack.safety_report);
    const { label, color } = GalleryValidator.getSafetyLabel(score);

    const colorClasses = {
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30'
    };

    return (
      <div className={`px-2 py-0.5 rounded border text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
        {label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-purple-400" />
                Art Pack Gallery
              </h1>
              <p className="text-purple-200">
                Discover and install community-created visual experiences
              </p>
            </div>

            <button
              onClick={() => setShowUploader(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-purple-500/30"
            >
              <UploadIcon className="w-5 h-5" />
              Upload Pack
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search packs by name, author, or tags..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-purple-200 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-slate-800/50 border border-purple-500/30 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Sort By
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'featured', label: 'Featured', icon: Star },
                      { value: 'newest', label: 'Newest', icon: Clock },
                      { value: 'popular', label: 'Popular', icon: Download },
                      { value: 'trending', label: 'Trending', icon: TrendingUp }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value as SortOption)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all flex items-center gap-2 justify-center
                          ${sortBy === value
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-800/50 border-purple-500/30 text-purple-200 hover:bg-slate-700/50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Filter
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'all', label: 'All Packs' },
                      { value: 'safe', label: 'Safe Only' },
                      { value: 'featured', label: 'Featured' },
                      { value: 'favorites', label: 'Favorites' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFilterBy(value as FilterOption)}
                        className={`
                          px-4 py-2 rounded-lg border transition-all
                          ${filterBy === value
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-800/50 border-purple-500/30 text-purple-200 hover:bg-slate-700/50'
                          }
                        `}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-purple-300 text-lg">Loading packs...</div>
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-purple-200 text-lg">No packs found</p>
            <p className="text-purple-300 text-sm mt-2">Try adjusting your filters or be the first to upload!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packs.map((pack, index) => (
              <div
                key={pack.id}
                className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20"
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <div
                  className="aspect-video bg-gradient-to-br from-purple-600/20 to-indigo-600/20 relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPack(pack)}
                >
                  {pack.thumbnail_url ? (
                    <img
                      src={pack.thumbnail_url}
                      alt={pack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-purple-300 opacity-50" />
                    </div>
                  )}

                  {pack.curator_featured && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded text-xs font-semibold text-yellow-900 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPack(pack);
                      }}
                      className="w-full py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate">
                      {pack.title}
                    </h3>
                    <p className="text-sm text-purple-300">
                      by {pack.author_name}
                    </p>
                  </div>

                  {pack.description && (
                    <p className="text-sm text-purple-200 line-clamp-2">
                      {pack.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {getSafetyBadge(pack)}
                    {pack.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-purple-300 pt-2 border-t border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {pack.installed_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {pack.favorite_count}
                      </span>
                    </div>
                    <span>v{pack.version}</span>
                  </div>

                  <button
                    onClick={() => handleInstall(pack)}
                    disabled={installingId === pack.id}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    {installingId === pack.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Install
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploader && (
        <GalleryUploader
          onSuccess={() => {
            setShowUploader(false);
            loadPacks();
          }}
          onClose={() => setShowUploader(false)}
        />
      )}

      {selectedPack && (
        <GalleryDetail
          pack={selectedPack}
          onClose={() => setSelectedPack(null)}
          onInstall={handleInstall}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
