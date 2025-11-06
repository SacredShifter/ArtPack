import { useState, useEffect } from 'react';
import { X, Download, Heart, Shield, Star, Calendar, User, FileText, AlertCircle, CheckCircle, Award, ExternalLink } from 'lucide-react';
import { GalleryAPI } from './GalleryAPI';
import { GalleryValidator } from './GalleryValidator';
import type { ArtPackRecord, PackReview } from './types';

interface GalleryDetailProps {
  pack: ArtPackRecord;
  onClose: () => void;
  onInstall: (pack: ArtPackRecord) => Promise<void>;
}

export function GalleryDetail({ pack, onClose, onInstall }: GalleryDetailProps) {
  const [reviews, setReviews] = useState<PackReview[]>([]);
  const [installing, setInstalling] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [pack.id]);

  const loadReviews = async () => {
    try {
      const [reviewData, avgRating] = await Promise.all([
        GalleryAPI.getPackReviews(pack.id),
        GalleryAPI.getAverageRating(pack.id)
      ]);
      setReviews(reviewData);
      setAverageRating(avgRating);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await onInstall(pack);
    } finally {
      setInstalling(false);
    }
  };

  const safetyScore = GalleryValidator.getSafetyScore(pack.safety_report);
  const { label: safetyLabel, color: safetyColor } = GalleryValidator.getSafetyLabel(safetyScore);

  const safetyColorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-300',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-300',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-300'
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full border border-purple-500/30 my-8">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-t-2xl overflow-hidden">
            {pack.preview_url ? (
              <img
                src={pack.preview_url}
                alt={pack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Shield className="w-24 h-24 text-purple-300 opacity-50 mx-auto" />
                  <p className="text-purple-200">Preview not available</p>
                </div>
              </div>
            )}

            {pack.curator_featured && (
              <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-500/90 to-amber-500/90 backdrop-blur-sm rounded-lg flex items-center gap-2 font-semibold text-yellow-900 shadow-lg">
                <Award className="w-5 h-5" />
                Curator Featured
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-3 bg-black/50 backdrop-blur-md hover:bg-black/70 rounded-xl transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {pack.title}
              </h1>
              <div className="flex items-center gap-4 text-purple-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{pack.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(pack.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 transition-all transform hover:scale-105 disabled:scale-100 flex items-center gap-2 shadow-lg shadow-purple-500/30"
            >
              {installing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Install Pack
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-sm">Downloads</span>
                <Download className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{pack.installed_count}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pink-300 text-sm">Favorites</span>
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-2xl font-bold text-white">{pack.favorite_count}</p>
            </div>

            <div className={`p-4 bg-gradient-to-br border rounded-xl ${safetyColorClasses[safetyColor as keyof typeof safetyColorClasses]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Safety Score</span>
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{safetyLabel}</p>
            </div>
          </div>

          {pack.description && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Description
              </h2>
              <p className="text-purple-200 leading-relaxed">
                {pack.description}
              </p>
            </div>
          )}

          {pack.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {pack.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Safety Report
              </h3>
              <div className="p-4 bg-slate-800/50 border border-purple-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Overall Score</span>
                  <span className="font-semibold text-white">{safetyScore.toFixed(0)}%</span>
                </div>

                {pack.safety_report.checks && (
                  <div className="space-y-2 pt-2 border-t border-purple-500/20">
                    {Object.entries(pack.safety_report.checks).map(([key, check]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-purple-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {check.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pack.safety_report.warnings && pack.safety_report.warnings.length > 0 && (
                  <div className="pt-2 border-t border-purple-500/20">
                    <p className="text-xs text-yellow-300 mb-2">Warnings:</p>
                    <ul className="space-y-1">
                      {pack.safety_report.warnings.map((warning, i) => (
                        <li key={i} className="text-xs text-yellow-200 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Pack Info
              </h3>
              <div className="p-4 bg-slate-800/50 border border-purple-500/30 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-300">Version</span>
                  <span className="text-white font-mono">{pack.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">License</span>
                  <span className="text-white">{pack.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Status</span>
                  <span className="text-green-400 capitalize">{pack.status}</span>
                </div>
                {pack.signature && (
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">Verified Signature</span>
                  </div>
                )}
                <a
                  href={pack.manifest_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors pt-2 border-t border-purple-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Manifest
                </a>
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.slice(0, 3).map(review => (
                  <div
                    key={review.id}
                    className="p-4 bg-slate-800/50 border border-purple-500/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-purple-300">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-purple-200 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
