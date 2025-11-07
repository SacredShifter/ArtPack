import { useState, useEffect } from 'react';
import { packEngine } from './PackEngine';
import { supabase } from './TourContextResolver';
import { LoadedPack } from './types';
import { Package, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';

export function PackSwitcher() {
  const [packs, setPacks] = useState<LoadedPack[]>([]);
  const [currentPackId, setCurrentPackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updatePacks = () => {
      setPacks(packEngine.getAllPacks());
      setCurrentPackId(packEngine.getCurrentPackId());
    };

    updatePacks();

    const loadPacksFromDatabase = async () => {
      setLoading(true);
      try {
        const { data: artpacks, error: dbError } = await supabase
          .from('artpacks')
          .select('manifest_url')
          .eq('status', 'published')
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;

        if (artpacks && artpacks.length > 0) {
          for (const pack of artpacks) {
            try {
              await packEngine.loadPack(pack.manifest_url);
            } catch (packError) {
              console.error(`Failed to load pack from ${pack.manifest_url}:`, packError);
            }
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load packs from database';
        setError(errorMsg);
        console.error('Database loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPacksFromDatabase();

    const handleLoaded = () => updatePacks();
    const handleSwitched = () => updatePacks();
    const handleError = (data: { error: string }) => {
      setError(data.error);
      setLoading(false);
    };

    packEngine.on('loaded', handleLoaded);
    packEngine.on('switched', handleSwitched);
    packEngine.on('error', handleError);

    return () => {
      packEngine.off('loaded', handleLoaded);
      packEngine.off('switched', handleSwitched);
      packEngine.off('error', handleError);
    };
  }, []);

  const handlePackChange = async (packId: string) => {
    if (packId === currentPackId) return;

    setLoading(true);
    setError(null);

    try {
      await packEngine.switchPack(packId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch pack');
    } finally {
      setLoading(false);
    }
  };

  const currentPack = packs.find(p => p.manifest.id === currentPackId);

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Sacred Shifter Pack</h3>
        </div>
        {currentPack && (
          <span className="text-xs text-purple-300/70">
            v{currentPack.manifest.version}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="relative">
        <select
          value={currentPackId || ''}
          onChange={(e) => handlePackChange(e.target.value)}
          disabled={loading || packs.length === 0}
          className="w-full px-3 py-2 pr-10 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none backdrop-blur-sm"
        >
          {packs.length === 0 && (
            <option value="">
              {loading ? 'Loading packs...' : 'No packs available'}
            </option>
          )}
          {packs.map(pack => (
            <option key={pack.manifest.id} value={pack.manifest.id}>
              {pack.manifest.name}
              {pack.manifest.author && ` by ${pack.manifest.author}`}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
        )}
      </div>

      {currentPack && (
        <div className="space-y-2">
          <p className="text-sm text-purple-200/80">{currentPack.manifest.description}</p>

          {currentPack.manifest.essenceLabels && currentPack.manifest.essenceLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentPack.manifest.essenceLabels.map(label => (
                <span
                  key={label}
                  className="px-2 py-0.5 bg-purple-500/20 border border-purple-400/30 rounded text-xs text-purple-200"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {currentPack.manifest.safety?.photosensitiveWarning && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/30 border border-amber-500/40 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-200">Photosensitive warning</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
