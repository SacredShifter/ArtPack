import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CollectiveCanvas } from './CollectiveCanvas';
import { PackSwitcher } from './PackSwitcher';
import { CollectiveSession } from './CollectiveSession';
import { ParticipantIdentity } from './ParticipantEncoder';
import { Sparkles, UserPlus, Download, Users, Share2 } from 'lucide-react';

export function JoinSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [participantId, setParticipantId] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    initials: '',
    role: 'viewer' as 'viewer' | 'contributor' | 'co-creator'
  });

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;

      const sessionData = await CollectiveSession.getSession(sessionId);
      if (sessionData) {
        setSessionTitle(sessionData.title);
      }
    };

    loadSession();
  }, [sessionId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) return;

    const id = `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const identity: ParticipantIdentity = {
      id,
      name: formData.name || undefined,
      initials: formData.initials || undefined,
      joinedAt: Date.now(),
      role: formData.role,
      personalCoherence: 0.7 + Math.random() * 0.2
    };

    try {
      const session = new CollectiveSession(sessionId);
      await session.initialize();
      await session.addParticipant(identity);

      setParticipantId(id);
      setJoined(true);
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  const handleCapture = (dataUrl: string) => {
    setCapturedImage(dataUrl);
  };

  const handleDownload = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `collective-portrait-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Session link copied to clipboard!');
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-purple-400" />
                {sessionTitle || 'Collective Resonance Session'}
              </h1>
              <p className="text-purple-200">
                Join others in creating a living, breathing artwork together
              </p>
            </div>

            <button
              onClick={handleShare}
              className="px-4 py-2 bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-lg text-purple-200 hover:text-white hover:border-purple-400 transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>
        </header>

        {!joined ? (
          <div className="max-w-md mx-auto">
            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Join the Circle</h2>
              </div>

              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Alex"
                    className="w-full px-4 py-2 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Initials (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase().slice(0, 3) })}
                    placeholder="e.g., AK"
                    maxLength={3}
                    className="w-full px-4 py-2 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-purple-300/70 mt-1">
                    Your initials will be encoded into the visual artwork
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Participation Style
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-900/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="viewer">Observer - Watch the magic unfold</option>
                    <option value="contributor">Contributor - Add your energy</option>
                    <option value="co-creator">Co-Creator - Deep engagement</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Users className="w-5 h-5" />
                  Join Session
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1 space-y-4">
              <PackSwitcher />

              {capturedImage && (
                <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-white text-sm">Your Capture</h3>
                  <img
                    src={capturedImage}
                    alt="Captured collective portrait"
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
                <h3 className="font-semibold text-white text-sm mb-3">Your Signature</h3>
                <div className="space-y-2 text-xs text-purple-200/70">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="text-white">{formData.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Initials:</span>
                    <span className="text-white">{formData.initials || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="text-white capitalize">{formData.role}</span>
                  </div>
                </div>
              </div>
            </aside>

            <main className="lg:col-span-3">
              <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20">
                <div className="aspect-video">
                  <CollectiveCanvas
                    sessionId={sessionId}
                    onCapture={handleCapture}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
