import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { packEngine } from '../modules/sacred-shifter-core/PackEngine';
import { GAAClock } from '../modules/sacred-shifter-core/GAAClock';
import { CollectiveEventManager } from '../modules/sacred-shifter-core/CollectiveEventManager';
import type { FieldSnapshot } from '../modules/sacred-shifter-core/CollectiveEventManager';
import { ArrowLeft, Users, Activity, Zap } from 'lucide-react';

export function CollectiveEventViewer() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [fieldSnapshot, setFieldSnapshot] = useState<FieldSnapshot | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [avgCoherence, setAvgCoherence] = useState(0);
  const [synchronyScore, setSynchronyScore] = useState(0);
  const [localCoherence, setLocalCoherence] = useState(0.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<CollectiveEventManager>(new CollectiveEventManager());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gaaClockRef = useRef<GAAClock | null>(null);

  useEffect(() => {
    loadEvent();
    setupVisualization();

    return () => {
      if (isJoined) {
        managerRef.current.leaveEvent();
      }
    };
  }, [eventId]);

  useEffect(() => {
    if (isJoined) {
      const interval = setInterval(async () => {
        const history = await managerRef.current.getFieldHistory(eventId!, 1);
        if (history.length > 0) {
          const latest = history[history.length - 1];
          setFieldSnapshot(latest);
          setParticipantCount(latest.participant_count);
          setAvgCoherence(latest.avg_coherence);
          setSynchronyScore(latest.synchrony_score);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isJoined, eventId]);

  useEffect(() => {
    const coherenceInterval = setInterval(() => {
      const newCoherence = Math.min(1, Math.max(0, localCoherence + (Math.random() - 0.5) * 0.1));
      setLocalCoherence(newCoherence);

      if (isJoined) {
        managerRef.current.recordCoherenceSample(newCoherence);
      }
    }, 1000);

    return () => clearInterval(coherenceInterval);
  }, [isJoined, localCoherence]);

  async function loadEvent() {
    const { data } = await (window as any).supabase
      .from('collective_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (data) {
      setEvent(data);
    }
  }

  async function handleJoin() {
    const success = await managerRef.current.joinEvent(eventId!, 'demo-user');
    if (success) {
      setIsJoined(true);
    }
  }

  function setupVisualization() {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    gaaClockRef.current = new GAAClock(432, [1, 1.5, 2, 3, 4]);

    packEngine.loadPack('/artpacks/CollectiveMandala/manifest.json').then(() => {
      const node = packEngine.createNode('primary');
      if (node) {
        scene.add(node);
      }
    });

    let startTime = performance.now();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = performance.now() - startTime;
      const gaaState = gaaClockRef.current!.tick(elapsed);

      const params = packEngine.computeParams(
        { region_name: 'Collective Field', lat: 0, lng: 0, timestamp: Date.now() },
        { individual: avgCoherence, collective: avgCoherence, stillness: synchronyScore, timestamp: Date.now() },
        gaaState,
        { amplitude: avgCoherence, frequency: 0.5, phase: 0, waveform: 'sine' }
      );

      packEngine.runFrameCallbacks(0.016, params);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a14]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <defs>
            <pattern id="constellation" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="30" r="1" fill="#8b5cf6" />
              <circle cx="80" cy="60" r="1.5" fill="#06b6d4" />
              <circle cx="150" cy="40" r="1" fill="#ec4899" />
              <circle cx="120" cy="120" r="1" fill="#8b5cf6" />
              <line x1="20" y1="30" x2="80" y2="60" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
              <line x1="80" y1="60" x2="150" y2="40" stroke="#06b6d4" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#constellation)" />
        </svg>
      </div>

      <button
        onClick={() => navigate('/events')}
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {!isJoined && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/30 blur-xl" />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 flex items-center justify-center">
                <Users className="w-16 h-16 text-cyan-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white">{event.title}</h2>
            <p className="text-slate-400 max-w-md">{event.description}</p>

            <button
              onClick={handleJoin}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
            >
              Join the Field
            </button>
          </div>
        </div>
      )}

      {isJoined && (
        <>
          <div className="absolute top-8 right-8 z-40 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 w-80">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white font-semibold">LIVE</span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants
                    </span>
                    <span className="text-2xl font-bold text-white tabular-nums">{participantCount}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Collective Coherence
                    </span>
                    <span className="text-xl font-bold text-cyan-400 tabular-nums">{(avgCoherence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000 ease-out"
                      style={{ width: `${avgCoherence * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Synchrony
                    </span>
                    <span className="text-xl font-bold text-purple-400 tabular-nums">{(synchronyScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                      style={{ width: `${synchronyScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 w-80">
              <div className="text-sm text-slate-400 mb-2">Your Coherence</div>
              <div className="text-3xl font-bold text-white tabular-nums mb-3">{(localCoherence * 100).toFixed(0)}%</div>
              <div className="h-16 relative">
                <svg className="w-full h-full" viewBox="0 0 100 30">
                  <path
                    d={`M 0,15 Q 25,${15 - localCoherence * 10} 50,15 T 100,15`}
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full px-8 py-4">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Intention</div>
                  <div className="text-sm text-white font-medium">{event.intention}</div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Frequency</div>
                  <div className="text-sm text-cyan-400 font-mono font-semibold">432 Hz</div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Field State</div>
                  <div className="text-sm text-purple-400 font-medium">{fieldSnapshot?.field_geometry || 'Forming'}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
