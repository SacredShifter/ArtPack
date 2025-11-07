import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { packEngine } from './PackEngine';
import { GAAClock } from './GAAClock';
import { SonicOrchestrator } from './SonicOrchestrator';
import { ParticipantEncoder, ParticipantSignature } from './ParticipantEncoder';
import { RegionSeed, CoherenceSample } from './types';
import { SnapshotCapture } from './SnapshotCapture';
import { RevelationManager, RevelationPhase } from './RevelationManager';
import { ArchetypeLibrary } from './ArchetypeLibrary';
import { SigilExporter } from './SigilExporter';
import { TelemetryEngine } from '../../modules/consciousness-telemetry/TelemetryEngine';
import { ResidualEngine } from '../../modules/mirror-unseen/residuals';
import { UncertaintyEngine } from '../../modules/mirror-unseen/uncertainty';
import { SilenceEngine } from '../../modules/mirror-unseen/silence';
import { EvolutionEngine } from '../../modules/mirror-unseen/evolution';
import {
  Users, User, UsersRound, Globe, Play, Pause, RefreshCw, Camera, Download,
  Eye, EyeOff, Brain, Sparkles, TrendingUp, Activity, Zap, BookOpen
} from 'lucide-react';

type DemoMode = 'individual' | 'small_group' | 'large_group' | 'massive';

const DEMO_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zane', 'Aria', 'Ben', 'Clara', 'David', 'Emma', 'Finn'
];

function generateParticipants(count: number): ParticipantSignature[] {
  const participants: ParticipantSignature[] = [];

  for (let i = 0; i < count; i++) {
    const name = DEMO_NAMES[i % DEMO_NAMES.length] + (i >= DEMO_NAMES.length ? ` ${Math.floor(i / DEMO_NAMES.length)}` : '');
    const initials = name.substring(0, 2).toUpperCase();

    const identity = {
      id: `demo-${i}`,
      name,
      initials,
      joinedAt: Date.now() - (count - i) * 1000,
      role: (i % 3 === 0 ? 'co-creator' : i % 2 === 0 ? 'contributor' : 'viewer') as any,
      personalCoherence: 0.6 + Math.random() * 0.3
    };

    const signature = ParticipantEncoder.encode(identity, count, i);
    participants.push(signature);
  }

  return participants;
}

export function DemoMode() {
  const [mode, setMode] = useState<DemoMode>('small_group');
  const [isPlaying, setIsPlaying] = useState(true);
  const [participants, setParticipants] = useState<ParticipantSignature[]>([]);
  const [fps, setFps] = useState(0);
  const [showUnseen, setShowUnseen] = useState(false);

  const [revelationPhase, setRevelationPhase] = useState<RevelationPhase>(RevelationPhase.RECOGNITION);
  const [metrics, setMetrics] = useState({
    coherence: 0.5,
    complexity: 0.5,
    polarity: 0.5,
    residual: 0.3,
    uncertainty: 0.5
  });
  const [currentArchetype, setCurrentArchetype] = useState<any>(null);
  const [formType, setFormType] = useState('circle');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const packNodesRef = useRef<THREE.Object3D[]>([]);

  const gaaClockRef = useRef<GAAClock | null>(null);
  const orchestratorRef = useRef<SonicOrchestrator | null>(null);
  const revelationManagerRef = useRef<RevelationManager | null>(null);
  const silenceEngineRef = useRef<SilenceEngine | null>(null);
  const evolutionEngineRef = useRef<EvolutionEngine | null>(null);
  const uncertaintyEngineRef = useRef<UncertaintyEngine | null>(null);

  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  const seed: RegionSeed = {
    region_name: 'Demo Realm',
    lat: 37.7749,
    lng: -122.4194,
    timestamp: Date.now()
  };

  const coherence: CoherenceSample = {
    individual: metrics.coherence,
    collective: metrics.coherence * 0.9,
    stillness: 1 - metrics.residual,
    timestamp: Date.now()
  };

  useEffect(() => {
    packEngine.loadPack('/artpacks/CollectiveMandala/manifest.json').catch(err => {
      console.error('Failed to load art pack:', err);
    });

    revelationManagerRef.current = new RevelationManager('demo-session', 'demo-user');
    silenceEngineRef.current = new SilenceEngine();
    evolutionEngineRef.current = new EvolutionEngine();
    uncertaintyEngineRef.current = new UncertaintyEngine();
  }, []);

  useEffect(() => {
    let count = 1;
    switch (mode) {
      case 'individual': count = 1; break;
      case 'small_group': count = 12; break;
      case 'large_group': count = 50; break;
      case 'massive': count = 200; break;
    }
    setParticipants(generateParticipants(count));
  }, [mode]);

  useEffect(() => {
    setInterval(() => {
      const newMetrics = {
        coherence: Math.min(1, metrics.coherence + (Math.random() - 0.45) * 0.05),
        complexity: Math.min(1, Math.max(0, metrics.complexity + (Math.random() - 0.5) * 0.03)),
        polarity: Math.min(1, Math.max(0, metrics.polarity + (Math.random() - 0.5) * 0.02)),
        residual: Math.max(0, metrics.residual + (Math.random() - 0.55) * 0.04),
        uncertainty: Math.max(0, Math.min(1, metrics.uncertainty + (Math.random() - 0.5) * 0.03))
      };
      setMetrics(newMetrics);

      if (revelationManagerRef.current) {
        const teaching = revelationManagerRef.current.update(newMetrics);
        if (teaching) {
          setRevelationPhase(teaching.phase);
        } else {
          setRevelationPhase(revelationManagerRef.current.getCurrentPhase());
        }
      }

      const archetype = ArchetypeLibrary.detectArchetype(newMetrics);
      setCurrentArchetype(archetype);

      if (evolutionEngineRef.current) {
        const evoInputs = {
          Coh: newMetrics.coherence,
          Cx: newMetrics.complexity,
          Pol: newMetrics.polarity,
          U: newMetrics.uncertainty,
          Syn: 0.7,
          Res: newMetrics.residual
        };

        const transition = evolutionEngineRef.current.checkTransition(evoInputs, {
          m: 6, n1: 2, n2: 2, n3: 2, lift: 0,
          merkaba: false, vesicaStrength: 0, starMix: 0, hazeIntensity: 0
        });

        if (transition) {
          setFormType(transition.toForm);
        } else {
          setFormType(evolutionEngineRef.current.getCurrentForm());
        }
      }
    }, 2000);
  }, [metrics]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    gaaClockRef.current = new GAAClock(432, [1, 1.5, 2, 3, 4]);
    orchestratorRef.current = new SonicOrchestrator();

    startTimeRef.current = performance.now();

    const handleResize = () => {
      if (!camera || !renderer) return;
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    const handlePackSwitched = () => {
      packNodesRef.current.forEach(node => scene.remove(node));
      packNodesRef.current = [];

      const primaryNode = packEngine.createNode('primary');
      if (primaryNode) {
        scene.add(primaryNode);
        packNodesRef.current.push(primaryNode);
      }
    };

    packEngine.on('switched', handlePackSwitched);

    const currentPack = packEngine.getCurrentPack();
    if (currentPack) {
      handlePackSwitched();
    }

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isPlaying) return;

      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const deltaTime = 16.67;

      if (!gaaClockRef.current || !orchestratorRef.current) return;

      const gaaState = gaaClockRef.current.tick(elapsed);
      const envelope = orchestratorRef.current.tick(deltaTime);

      const params = packEngine.computeParams(seed, coherence, gaaState, envelope);
      params.participants = participants;

      packEngine.runFrameCallbacks(deltaTime / 1000, params);

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      frameCountRef.current++;
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(Math.round(frameCountRef.current * 1000 / (now - lastFpsUpdateRef.current)));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      packEngine.off('switched', handlePackSwitched);
      packNodesRef.current.forEach(node => scene.remove(node));
      packNodesRef.current = [];
      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, [participants, isPlaying, coherence]);

  const getPhaseColor = (phase: RevelationPhase) => {
    const colors = {
      [RevelationPhase.RECOGNITION]: 'bg-slate-600',
      [RevelationPhase.REFLECTION]: 'bg-purple-600',
      [RevelationPhase.INTEGRATION]: 'bg-blue-600',
      [RevelationPhase.REVELATION]: 'bg-yellow-600',
      [RevelationPhase.SEAL]: 'bg-green-600'
    };
    return colors[phase] || 'bg-slate-600';
  };

  const getPhaseLabel = (phase: RevelationPhase) => {
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-cyan-400" />
            Sacred Shifter: Pedagogical Demo
          </h1>
          <p className="text-cyan-200 mb-6">
            Consciousness Telemetry • Mirror of the Unseen • Learning Sigils
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={() => setMode('individual')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'individual'
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-800/40 border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Individual</div>
              <div className="text-xs opacity-70">1 person</div>
            </button>

            <button
              onClick={() => setMode('small_group')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'small_group'
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-800/40 border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Small Group</div>
              <div className="text-xs opacity-70">2-50</div>
            </button>

            <button
              onClick={() => setMode('large_group')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'large_group'
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-800/40 border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <UsersRound className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Large Group</div>
              <div className="text-xs opacity-70">50-200</div>
            </button>

            <button
              onClick={() => setMode('massive')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'massive'
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-800/40 border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <Globe className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Massive</div>
              <div className="text-xs opacity-70">200+</div>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Revelation Phase
              </h3>

              <div className="space-y-2">
                {[
                  RevelationPhase.RECOGNITION,
                  RevelationPhase.REFLECTION,
                  RevelationPhase.INTEGRATION,
                  RevelationPhase.REVELATION,
                  RevelationPhase.SEAL
                ].map(phase => (
                  <div
                    key={phase}
                    className={`p-2 rounded-lg transition-all ${
                      revelationPhase === phase
                        ? `${getPhaseColor(phase)} text-white font-semibold`
                        : 'bg-slate-700/30 text-cyan-200/50'
                    }`}
                  >
                    <div className="text-sm">{getPhaseLabel(phase)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Consciousness Metrics
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-200">Coherence</span>
                    <span className="text-white font-mono">{(metrics.coherence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                      style={{ width: `${metrics.coherence * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-200">Complexity</span>
                    <span className="text-white font-mono">{(metrics.complexity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${metrics.complexity * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-200">Residual Tension</span>
                    <span className="text-white font-mono">{(metrics.residual * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                      style={{ width: `${metrics.residual * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-200">Uncertainty</span>
                    <span className="text-white font-mono">{(metrics.uncertainty * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all"
                      style={{ width: `${metrics.uncertainty * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {currentArchetype && (
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md border border-cyan-400/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Current Archetype
                </h3>
                <div className="text-lg font-bold text-cyan-100 mb-2">
                  {currentArchetype.name}
                </div>
                <div className="text-sm text-cyan-200/80 mb-3">
                  {currentArchetype.teaching}
                </div>
                <div className="text-xs text-cyan-200/60">
                  Form: {formType}
                </div>
              </div>
            )}

            <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-white text-sm mb-3">Controls</h3>

              <button
                onClick={() => setShowUnseen(!showUnseen)}
                className={`w-full px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  showUnseen
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-cyan-200'
                }`}
              >
                {showUnseen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showUnseen ? 'Hide Unseen' : 'Show Unseen'}
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-all flex items-center justify-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (gaaClockRef.current) gaaClockRef.current.reset();
                  startTimeRef.current = performance.now();
                }}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/20">
              <canvas
                ref={canvasRef}
                className="w-full aspect-video block"
                style={{ touchAction: 'none' }}
              />

              <div className="p-4 border-t border-cyan-500/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-cyan-200">FPS: <span className="text-white font-mono">{fps}</span></span>
                    <span className="text-cyan-200">Participants: <span className="text-white font-mono">{participants.length}</span></span>
                    <span className="text-cyan-200">Frequency: <span className="text-white font-mono">432Hz</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Telemetry System
                </h4>
                <p className="text-xs text-cyan-200/70">
                  Real-time capture of coherence, residual tension, phase errors, and collective emergence metrics.
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Mirror of Unseen
                </h4>
                <p className="text-xs text-cyan-200/70">
                  Reveals gaps between predicted and observed states. Residuals, uncertainty, and phase drift visualized.
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Learning Sigils
                </h4>
                <p className="text-xs text-cyan-200/70">
                  Geometric states become teachable moments. Archetypes train regulation through beauty.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
