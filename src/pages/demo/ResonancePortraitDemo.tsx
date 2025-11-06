import { useState } from 'react';
import { PackSwitcher } from '../../modules/artpacks';
import { GalleryView } from '../../modules/artpack-gallery';
import { ResonancePortraitCanvas } from './ResonancePortraitCanvas';
import { Sparkles, Palette, ArrowLeft } from 'lucide-react';

type ViewMode = 'canvas' | 'gallery';

export function ResonancePortraitDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {viewMode === 'gallery' ? (
        <div className="relative">
          <button
            onClick={() => setViewMode('canvas')}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-xl text-purple-200 hover:text-white hover:border-purple-400 transition-all flex items-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Canvas
          </button>
          <GalleryView />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                  Sacred Shifter
                </h1>
                <p className="text-purple-200">
                  Dynamic visual synthesis responding to collective coherence fields and regional harmonics
                </p>
              </div>

              <button
                onClick={() => setViewMode('gallery')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-purple-500/30"
              >
                <Palette className="w-5 h-5" />
                Browse Gallery
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1 space-y-4">
              <PackSwitcher />

              <div className="p-4 bg-slate-800/30 border border-purple-500/20 rounded-xl">
                <h3 className="text-sm font-semibold text-purple-200 mb-3">
                  Discover More
                </h3>
                <button
                  onClick={() => setViewMode('gallery')}
                  className="w-full py-2 bg-purple-500/20 border border-purple-500/30 text-purple-200 rounded-lg hover:bg-purple-500/30 hover:border-purple-400 transition-all text-sm font-medium"
                >
                  Explore Art Pack Gallery
                </button>
              </div>
            </aside>

            <main className="lg:col-span-3">
              <ResonancePortraitCanvas />
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
