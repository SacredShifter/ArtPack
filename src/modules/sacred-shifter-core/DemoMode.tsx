import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { packEngine } from './PackEngine';
import { GAAClock } from './GAAClock';
import { SonicOrchestrator } from './SonicOrchestrator';
import { ParticipantEncoder, ParticipantSignature } from './ParticipantEncoder';
import { RegionSeed, CoherenceSample } from './types';
import { Users, User, UsersRound, Globe, Play, Pause, RefreshCw } from 'lucide-react';

type DemoMode = 'individual' | 'small_group' | 'large_group' | 'massive';

const DEMO_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zane', 'Aria', 'Ben', 'Clara', 'David', 'Emma', 'Finn',
  'Gina', 'Hugo', 'Ivy', 'James', 'Kira', 'Liam', 'Mia', 'Nate',
  'Opal', 'Paul', 'Quincy', 'Rose', 'Simon', 'Tina', 'Ursula', 'Vince',
  'Willow', 'Xander', 'Yasmin', 'Zachary'
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
  const [mode, setMode] = useState<DemoMode>('individual');
  const [isPlaying, setIsPlaying] = useState(true);
  const [participants, setParticipants] = useState<ParticipantSignature[]>([]);
  const [fps, setFps] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const packNodesRef = useRef<THREE.Object3D[]>([]);

  const gaaClockRef = useRef<GAAClock | null>(null);
  const orchestratorRef = useRef<SonicOrchestrator | null>(null);
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
    individual: 0.75,
    collective: 0.7,
    stillness: 0.65,
    timestamp: Date.now()
  };

  useEffect(() => {
    let count = 1;
    switch (mode) {
      case 'individual': count = 1; break;
      case 'small_group': count = 12; break;
      case 'large_group': count = 200; break;
      case 'massive': count = 2000; break;
    }
    setParticipants(generateParticipants(count));
  }, [mode]);

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
  }, [participants, isPlaying]);

  const getModeInfo = () => {
    switch (mode) {
      case 'individual':
        return {
          title: 'Individual Mode',
          description: 'Solo experience with full 12-petal mandala. Your personal meditation space.',
          icon: User,
          participants: 1
        };
      case 'small_group':
        return {
          title: 'Small Group Mode',
          description: 'Each person gets a hexagonal glyph. Connection web shows relationships.',
          icon: Users,
          participants: 12
        };
      case 'large_group':
        return {
          title: 'Large Group Mode',
          description: 'Participants become luminous points. Collective field glow emerges.',
          icon: UsersRound,
          participants: 200
        };
      case 'massive':
        return {
          title: 'Massive Scale Mode',
          description: 'Statistical patterns emerge from thousands. Mass consciousness visualization.',
          icon: Globe,
          participants: 2000
        };
    }
  };

  const info = getModeInfo();
  const Icon = info.icon;

  const handleReset = () => {
    if (gaaClockRef.current) gaaClockRef.current.reset();
    if (orchestratorRef.current) orchestratorRef.current.reset();
    startTimeRef.current = performance.now();
    setParticipants(generateParticipants(info.participants));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Icon className="w-10 h-10 text-purple-400" />
            Sacred Shifter Demo
          </h1>
          <p className="text-purple-200 mb-6">
            Experience all four modes of collective visual synthesis
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={() => setMode('individual')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'individual'
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-800/40 border-purple-500/30 text-purple-200 hover:border-purple-400'
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
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-800/40 border-purple-500/30 text-purple-200 hover:border-purple-400'
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Small Group</div>
              <div className="text-xs opacity-70">2-50 people</div>
            </button>

            <button
              onClick={() => setMode('large_group')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'large_group'
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-800/40 border-purple-500/30 text-purple-200 hover:border-purple-400'
              }`}
            >
              <UsersRound className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Large Group</div>
              <div className="text-xs opacity-70">50-1000 people</div>
            </button>

            <button
              onClick={() => setMode('massive')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'massive'
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-800/40 border-purple-500/30 text-purple-200 hover:border-purple-400'
              }`}
            >
              <Globe className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Massive Scale</div>
              <div className="text-xs opacity-70">1000+ people</div>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Icon className="w-5 h-5 text-purple-400" />
                {info.title}
              </h3>
              <p className="text-sm text-purple-200/80 mb-4">{info.description}</p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-purple-200/70">
                  <span>Participants:</span>
                  <span className="text-white font-mono">{info.participants}</span>
                </div>
                <div className="flex justify-between text-purple-200/70">
                  <span>FPS:</span>
                  <span className="text-white font-mono">{fps}</span>
                </div>
                <div className="flex justify-between text-purple-200/70">
                  <span>Base Freq:</span>
                  <span className="text-white font-mono">432 Hz</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-white text-sm mb-3">Controls</h3>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
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
                onClick={handleReset}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {mode === 'small_group' && (
              <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-white text-sm mb-3">Sample Participants</h3>
                <div className="space-y-1 text-xs max-h-64 overflow-y-auto">
                  {participants.slice(0, 12).map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${p.colorHue}, ${p.colorSat * 100}%, ${p.colorLight * 100}%)`
                        }}
                      />
                      <span className="text-purple-200/70">
                        {DEMO_NAMES[i % DEMO_NAMES.length]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-white text-sm mb-3">Key Features</h3>
              <ul className="space-y-2 text-xs text-purple-200/70">
                <li>✓ Deterministic color encoding</li>
                <li>✓ Golden angle spiral distribution</li>
                <li>✓ GAA harmonic frequencies</li>
                <li>✓ Sonic Shifter envelopes</li>
                <li>✓ Real-time synchronization</li>
                <li>✓ Adaptive LOD rendering</li>
              </ul>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20">
              <canvas
                ref={canvasRef}
                className="w-full aspect-video block"
                style={{ touchAction: 'none' }}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-200 mb-2">Visual Encoding</h4>
                <p className="text-xs text-purple-200/70">
                  Each participant's name generates a unique color hue. Position determined by golden angle spiral (137.508°).
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-200 mb-2">GAA Integration</h4>
                <p className="text-xs text-purple-200/70">
                  432Hz base frequency with harmonic ratios. Musical time mapping creates organic rhythm and breathing patterns.
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-200 mb-2">Safety Guardrails</h4>
                <p className="text-xs text-purple-200/70">
                  Max 3Hz strobe rate, 85% brightness cap, 90% saturation limit. Photosensitive protection built-in.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
