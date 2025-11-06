import { useState, useEffect } from 'react';
import { artPackEngine } from './ArtPackEngine';
import { LoadedPack } from './types';
import { Package, ChevronDown, AlertCircle } from 'lucide-react';

export function PackSwitcher() {
  const [packs, setPacks] = useState<LoadedPack[]>([]);
  const [currentPackId, setCurrentPackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    const updatePacks = () => {
      setPacks(artPackEngine.getAllPacks());
      setCurrentPackId(artPackEngine.getCurrentPackId());
    };

    updatePacks();

    const handleLoaded = () => updatePacks();
    const handleSwitched = () => updatePacks();
    const handleError = (data: { error: string }) => {
      setError(data.error);
      setLoading(false);
    };

    artPackEngine.on('loaded', handleLoaded);
    artPackEngine.on('switched', handleSwitched);
    artPackEngine.on('error', handleError);

    return () => {
      artPackEngine.off('loaded', handleLoaded);
      artPackEngine.off('switched', handleSwitched);
      artPackEngine.off('error', handleError);
    };
  }, []);

  const handlePackChange = async (packId: string) => {
    if (packId === currentPackId) return;

    setLoading(true);
    setError(null);

    try {
      await artPackEngine.switchPack(packId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch pack');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCustomPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await artPackEngine.loadPack(customUrl);
      setCustomUrl('');
      setShowLoadForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pack');
    } finally {
      setLoading(false);
    }
  };

  const currentPack = packs.find(p => p.manifest.id === currentPackId);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Art Pack</h3>
        </div>
        {currentPack && (
          <span className="text-xs text-gray-500">
            v{currentPack.manifest.version}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="relative">
        <select
          value={currentPackId || ''}
          onChange={(e) => handlePackChange(e.target.value)}
          disabled={loading || packs.length === 0}
          className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
        >
          {packs.length === 0 && (
            <option value="">No packs loaded</option>
          )}
          {packs.map(pack => (
            <option key={pack.manifest.id} value={pack.manifest.id}>
              {pack.manifest.name} {pack.manifest.author && `by ${pack.manifest.author}`}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {currentPack && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>{currentPack.manifest.description}</p>
          {currentPack.manifest.safety?.photosensitiveWarning && (
            <p className="text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Photosensitive warning
            </p>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-gray-200">
        {!showLoadForm ? (
          <button
            onClick={() => setShowLoadForm(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Load from URL
          </button>
        ) : (
          <form onSubmit={handleLoadCustomPack} className="space-y-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/pack/manifest.json"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !customUrl.trim()}
                className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLoadForm(false);
                  setCustomUrl('');
                }}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
