import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollectiveSession } from './CollectiveSession';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';

export function CreateSessionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    packId: ''
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const creatorId = `creator-${Date.now()}`;
      const sessionId = await CollectiveSession.createSession(
        formData.title || 'Untitled Session',
        creatorId,
        formData.packId || undefined
      );

      navigate(`/collective/session/${sessionId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <Sparkles className="w-12 h-12 text-purple-400" />
              Create Collective Session
            </h1>
            <p className="text-xl text-purple-200">
              Invite others to co-create living art together
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-8 shadow-2xl">
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Monday Meditation Circle"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Art Pack (Optional)
                </label>
                <input
                  type="text"
                  value={formData.packId}
                  onChange={(e) => setFormData({ ...formData, packId: e.target.value })}
                  placeholder="e.g., collective-mandala"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-purple-300/70 mt-2">
                  Leave blank to use the default pack. Participants can change packs during the session.
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-200 mb-2">How it works</h3>
                <ul className="space-y-1 text-sm text-purple-200/70">
                  <li>• Each participant gets a unique visual signature</li>
                  <li>• Small groups (2-50) show individual glyphs</li>
                  <li>• Large groups (50-1000) create particle fields</li>
                  <li>• Massive scale (1000+) generates emergent patterns</li>
                  <li>• Everyone can capture and download their unique view</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>Creating Session...</>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Session
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-white transition-all"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
