import { useState } from 'react';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import { BirthData } from './AstrologicalCalculator';

interface BirthDataInputProps {
  onComplete: (birthData: BirthData) => void;
  onSkip?: () => void;
}

export function BirthDataInput({ onComplete, onSkip }: BirthDataInputProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    city: '',
    noTime: false
  });

  const [searching, setSearching] = useState(false);
  const [locationResults, setLocationResults] = useState<any[]>([]);

  const handleCitySearch = async (query: string) => {
    if (query.length < 3) {
      setLocationResults([]);
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await response.json();
      setLocationResults(data);
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (location: any) => {
    setFormData({
      ...formData,
      city: location.display_name
    });
    setLocationResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) return;

    const selectedLocation = locationResults[0] || {
      lat: 0,
      lon: 0,
      display_name: formData.city
    };

    const birthData: BirthData = {
      date: new Date(formData.date),
      time: formData.noTime ? undefined : formData.time,
      location: {
        lat: parseFloat(selectedLocation.lat),
        lng: parseFloat(selectedLocation.lon),
        city: selectedLocation.display_name,
        timezone: 'UTC'
      }
    };

    onComplete(birthData);
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-purple-500/40 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-purple-400" />
        <div>
          <h3 className="text-xl font-bold text-white">Unlock Your Cosmic Signature</h3>
          <p className="text-sm text-purple-200/70">Your birth chart will create your unique visual identity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-purple-200 mb-2">
            <Calendar className="w-4 h-4" />
            Birth Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-4 py-2 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-purple-200 mb-2">
            <Clock className="w-4 h-4" />
            Birth Time (Optional)
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            disabled={formData.noTime}
            className="w-full px-4 py-2 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label className="flex items-center gap-2 mt-2 text-xs text-purple-200/70 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.noTime}
              onChange={(e) => setFormData({ ...formData, noTime: e.target.checked, time: '' })}
              className="rounded"
            />
            I don't know my birth time
          </label>
          {formData.noTime && (
            <p className="text-xs text-purple-300/60 mt-1">
              We'll use noon (12:00) as default. Your rising sign may be approximate.
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-purple-200 mb-2">
            <MapPin className="w-4 h-4" />
            Birth Location
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => {
              setFormData({ ...formData, city: e.target.value });
              handleCitySearch(e.target.value);
            }}
            placeholder="Start typing city name..."
            required
            className="w-full px-4 py-2 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {searching && (
            <p className="text-xs text-purple-300/70 mt-2">Searching locations...</p>
          )}

          {locationResults.length > 0 && (
            <div className="mt-2 bg-slate-900/90 border border-purple-500/30 rounded-lg overflow-hidden">
              {locationResults.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectLocation(location)}
                  className="w-full px-4 py-2 text-left text-sm text-purple-100 hover:bg-purple-600/20 transition-colors border-b border-purple-500/10 last:border-b-0"
                >
                  {location.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-200 mb-2">What we'll calculate:</h4>
          <ul className="space-y-1 text-xs text-purple-200/70">
            <li>☉ Sun Sign → Your primary color & energy</li>
            <li>☽ Moon Sign → Your emotional luminosity</li>
            <li>↑ Rising Sign → Your rotation & outer expression</li>
            <li>♃ Planetary positions → Unique visual modifiers</li>
            <li>⚹ Aspects → Connections to other participants</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Calculate My Chart
          </button>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-6 py-3 bg-slate-700/60 text-purple-200 rounded-lg hover:bg-slate-700 transition-all"
            >
              Skip
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 text-xs text-purple-300/50 text-center">
        Your birth data is encrypted and only used for visual encoding. You can hide it from other participants.
      </div>
    </div>
  );
}
