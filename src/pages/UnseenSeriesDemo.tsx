import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Sliders, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import * as THREE from 'three';

interface Pack {
  id: string;
  name: string;
  description: string;
  wave: number;
  order: number;
  powerRating: number;
  motionProfile: string;
  loadModule: () => Promise<any>;
}

const UNSEEN_PACKS: Pack[] = [
  {
    id: 'eternal-void',
    name: 'Eternal Void',
    description: 'The pregnant darkness. Empty. Atmospheric. Dark stillness.',
    wave: 1,
    order: 1,
    powerRating: 1,
    motionProfile: 'gentle',
    loadModule: () => import('../../artpacks/theunseen/EternalVoid/index.js'),
  },
  {
    id: 'whisper-field',
    name: 'Whisper Field',
    description: 'The faintest movement of unseen currents. Ultra-soft flow fields.',
    wave: 1,
    order: 2,
    powerRating: 2,
    motionProfile: 'flowing',
    loadModule: () => import('../../artpacks/theunseen/WhisperField/index.js'),
  },
  {
    id: 'liminal-threads',
    name: 'Liminal Threads',
    description: 'Invisible currents turning into filaments. The web revealed.',
    wave: 1,
    order: 3,
    powerRating: 3,
    motionProfile: 'structured',
    loadModule: () => import('../../artpacks/theunseen/LiminalThreads/index.js'),
  },
  {
    id: 'hidden-lattice',
    name: 'Hidden Lattice',
    description: 'Sacred geometry grids and crystalline structures emerge.',
    wave: 2,
    order: 4,
    powerRating: 3,
    motionProfile: 'structured',
    loadModule: () => import('../../artpacks/theunseen/HiddenLattice/index.js'),
  },
  {
    id: 'synaptic-field',
    name: 'Synaptic Field',
    description: 'Intelligence forming. Neural networks lighting up with electrical fire.',
    wave: 2,
    order: 5,
    powerRating: 4,
    motionProfile: 'dynamic',
    loadModule: () => import('../../artpacks/theunseen/SynapticField/index.js'),
  },
  {
    id: 'interference-realm',
    name: 'Interference Realm',
    description: 'Wave interactions creating emergent form. Resonance bands revealed.',
    wave: 2,
    order: 6,
    powerRating: 3,
    motionProfile: 'flowing',
    loadModule: () => import('../../artpacks/theunseen/InterferenceRealm/index.js'),
  },
];

export default function UnseenSeriesDemo() {
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoCycle, setAutoCycle] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [minimized, setMinimized] = useState(false);

  const [coherence, setCoherence] = useState(0.5);
  const [stillness, setStillness] = useState(0.5);
  const [gain, setGain] = useState(0.5);
  const [phase, setPhase] = useState(0);
  const [capturing, setCapturing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const currentPack = UNSEEN_PACKS[currentPackIndex];

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      const camera = cameraRef.current as THREE.PerspectiveCamera;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    loadCurrentPack();
  }, [currentPackIndex]);

  useEffect(() => {
    if (autoCycle && isPlaying) {
      const interval = setInterval(() => {
        setCurrentPackIndex((prev) => (prev + 1) % UNSEEN_PACKS.length);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [autoCycle, isPlaying]);

  useEffect(() => {
    let phaseInterval: NodeJS.Timeout;
    if (isPlaying) {
      startAnimation();
      phaseInterval = setInterval(() => {
        setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
      }, 50);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    return () => clearInterval(phaseInterval);
  }, [isPlaying, coherence, stillness, gain, phase]);

  const loadCurrentPack = async () => {
    if (!sceneRef.current || !rendererRef.current) return;

    if (engineRef.current?.cleanup) {
      engineRef.current.cleanup();
    }

    while (sceneRef.current.children.length > 0) {
      sceneRef.current.remove(sceneRef.current.children[0]);
    }

    const mockEngine = {
      scene: sceneRef.current,
      materials: {} as Record<string, THREE.Material>,
      nodes: {} as Record<string, THREE.Object3D>,
      frameCallbacks: [] as Array<(deltaTime: number, t: number, params: any) => void>,
      paramMapper: null as ((seed: any, coherence: any) => any) | null,

      registerMaterial(name: string, material: THREE.Material) {
        this.materials[name] = material;
      },

      registerNode(name: string, factory: () => THREE.Object3D) {
        const node = factory();
        this.nodes[name] = node;
        this.scene.add(node);
      },

      setParamMapper(mapper: (seed: any, coherence: any) => any) {
        this.paramMapper = mapper;
      },

      onFrame(callback: (deltaTime: number, t: number, params: any) => void) {
        this.frameCallbacks.push(callback);
      },

      defineSafetyCaps(caps: any) {
        // Safety caps acknowledged
      },

      cleanup() {
        Object.values(this.materials).forEach((mat) => mat.dispose());
        Object.values(this.nodes).forEach((node) => this.scene.remove(node));
      },
    };

    try {
      const module = await currentPack.loadModule();
      if (module.register) {
        module.register(mockEngine);
        engineRef.current = mockEngine;
        engineRef.current.moduleCleanup = module.cleanup;

        if (!isPlaying) {
          setIsPlaying(true);
        }

        startAnimation();
      }
    } catch (error) {
      console.error('Failed to load pack:', error);
    }
  };

  const startAnimation = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const animate = (time: number) => {
      const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      if (engineRef.current?.paramMapper && engineRef.current?.frameCallbacks) {
        const params = engineRef.current.paramMapper(
          { entropy: 50 },
          {
            individual: coherence,
            amplitude: coherence,
            stillness: stillness,
            phase: phase,
          }
        );

        engineRef.current.frameCallbacks.forEach((callback: any) => {
          callback(deltaTime, time / 1000, params);
        });
      }

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const nextPack = () => {
    setCurrentPackIndex((prev) => (prev + 1) % UNSEEN_PACKS.length);
  };

  const selectPack = (index: number) => {
    setCurrentPackIndex(index);
  };

  const captureSnapshot = async () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    setCapturing(true);

    try {
      // Force a fresh render
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Wait a frame to ensure render is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = canvasRef.current!;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unseen-${currentPack.id}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => setCapturing(false), 1000);
    } catch (error) {
      console.error('Capture failed:', error);
      setCapturing(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute top-6 left-6 z-10 max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden transition-all">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
            onClick={() => setMinimized(!minimized)}
          >
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">
                The Unseen Series
              </h1>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                {currentPack.order}/6
              </span>
            </div>
            <button className="text-purple-300 hover:text-purple-200 transition-colors">
              {minimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          {!minimized && (
            <div className="p-6 pt-2">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-purple-200 mb-1">
                  {currentPack.name}
                </h2>
                <p className="text-sm text-purple-300/70 mb-2">
                  {currentPack.description}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                    {currentPack.motionProfile}
                  </span>
                  <span className="text-purple-400">
                    {'⚡'.repeat(currentPack.powerRating)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {UNSEEN_PACKS.map((pack, index) => (
                  <button
                    key={pack.id}
                    onClick={() => selectPack(index)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      index === currentPackIndex
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-slate-800/60 text-purple-300 hover:bg-slate-700/80'
                    }`}
                  >
                    {pack.order}. {pack.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={nextPack}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg transition-colors"
                  title="Next Pack"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showControls
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-slate-800 text-purple-400'
                  }`}
                  title="Toggle Controls"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={captureSnapshot}
                disabled={capturing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg transition-all shadow-lg"
              >
                <Camera className="w-4 h-4" />
                {capturing ? 'Capturing...' : 'Capture Snapshot'}
              </button>

              <label className="flex items-center gap-2 mt-3 text-sm text-purple-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCycle}
                  onChange={(e) => setAutoCycle(e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
                Auto-cycle packs (15s)
              </label>
            </div>
          )}
        </div>
      </div>

      {showControls && (
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Consciousness Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-purple-300 mb-2">
                  Coherence: {(coherence * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={coherence}
                  onChange={(e) => setCoherence(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-xs text-purple-400/70 mt-1">
                  Pattern visibility & clarity
                </p>
              </div>

              <div>
                <label className="block text-sm text-purple-300 mb-2">
                  Stillness: {(stillness * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stillness}
                  onChange={(e) => setStillness(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-xs text-purple-400/70 mt-1">
                  Motion speed & stability
                </p>
              </div>

              <div>
                <label className="block text-sm text-purple-300 mb-2">
                  Gain: {(gain * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={gain}
                  onChange={(e) => setGain(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <p className="text-xs text-purple-400/70 mt-1">
                  Energy & intensity
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6 z-10">
        <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-xl px-4 py-2">
          <p className="text-xs text-purple-300/70">
            Pack {currentPack.order} of {UNSEEN_PACKS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
