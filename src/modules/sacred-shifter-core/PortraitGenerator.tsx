import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResonancePortraitCanvas } from './ResonancePortraitCanvas';
import { PackSwitcher } from './PackSwitcher';
import { tourContextResolver } from './TourContextResolver';
import { RegionSeed, CoherenceSample } from './types';
import { Sparkles, ArrowLeft, Download, Info } from 'lucide-react';

export function PortraitGenerator() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [seed, setSeed] = useState<RegionSeed | undefined>();
  const [coherence] = useState<CoherenceSample>({
    individual: 0.7 + Math.random() * 0.2,
    collective: 0.6 + Math.random() * 0.3,
    stillness: 0.5 + Math.random() * 0.3,
    timestamp: Date.now()
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const loadTourContext = async () => {
      if (sessionId) {
        const context = await tourContextResolver.resolveSession(sessionId);
        if (context) {
          setSeed(tourContextResolver.contextToSeed(context));
        } else {
          setSeed(tourContextResolver.getDefaultSeed());
        }
      } else {
        setSeed(tourContextResolver.getDefaultSeed());
      }
    };

    loadTourContext();
  }, [sessionId]);

  const handleCapture = (dataUrl: string) => {
    setCapturedImage(dataUrl);
  };

  const handleDownload = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `resonance-portrait-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-lg text-purple-200 hover:text-white hover:border-purple-400 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                  Resonance Portrait Generator
                </h1>
                <p className="text-purple-200">
                  Visual synthesis powered by GAA harmonic frequencies and Sonic Shifter envelopes
                </p>
                {seed && seed.region_name !== 'Global Consciousness' && (
                  <p className="text-sm text-purple-300 mt-1">
                    Seeded from: {seed.region_name}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-3 bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-lg text-purple-200 hover:text-white hover:border-purple-400 transition-all"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </header>

        {showInfo && (
          <div className="mb-6 p-6 bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">System Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-purple-300 mb-2">GAA Integration</h4>
                <ul className="space-y-1 text-purple-200/70">
                  <li>Base frequency: 432 Hz</li>
                  <li>Harmonic ratios: Golden, Fibonacci, Pentatonic</li>
                  <li>Phase-locked oscillators</li>
                  <li>Musical time mapping</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-300 mb-2">Sonic Shifter</h4>
                <ul className="space-y-1 text-purple-200/70">
                  <li>Amplitude envelopes</li>
                  <li>Hue shift modulation</li>
                  <li>Breath rate cycling</li>
                  <li>Tension gradients</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-300 mb-2">Coherence Fields</h4>
                <ul className="space-y-1 text-purple-200/70">
                  <li>Individual: {(coherence.individual * 100).toFixed(0)}%</li>
                  <li>Collective: {(coherence.collective * 100).toFixed(0)}%</li>
                  <li>Stillness: {(coherence.stillness * 100).toFixed(0)}%</li>
                  <li>Regional seed: Active</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <PackSwitcher />

            {capturedImage && (
              <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-white text-sm">Captured Portrait</h3>
                <img
                  src={capturedImage}
                  alt="Captured resonance portrait"
                  className="w-full rounded-lg border border-purple-500/30"
                />
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}

            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-white text-sm mb-3">Safety Caps</h3>
              <ul className="space-y-2 text-xs text-purple-200/70">
                <li className="flex justify-between">
                  <span>Max Strobe:</span>
                  <span className="text-white">3 Hz</span>
                </li>
                <li className="flex justify-between">
                  <span>Max Brightness:</span>
                  <span className="text-white">85%</span>
                </li>
                <li className="flex justify-between">
                  <span>Max Saturation:</span>
                  <span className="text-white">90%</span>
                </li>
              </ul>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20">
              <div className="aspect-video">
                {seed && (
                  <ResonancePortraitCanvas
                    seed={seed}
                    coherence={coherence}
                    onCapture={handleCapture}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
