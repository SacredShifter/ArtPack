import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { packEngine } from '../modules/sacred-shifter-core/PackEngine';
import { GAAClock } from '../modules/sacred-shifter-core/GAAClock';
import { GuidedSessionEngine } from '../modules/sacred-shifter-core/GuidedSessionEngine';
import type { BreathCue } from '../modules/sacred-shifter-core/GuidedSessionEngine';
import { RevelationPhase } from '../modules/sacred-shifter-core/RevelationManager';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

export function GuidedSessionPlayer() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<RevelationPhase>(RevelationPhase.RECOGNITION);
  const [breathGuidance, setBreathGuidance] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [narration, setNarration] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GuidedSessionEngine>(new GuidedSessionEngine());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gaaClockRef = useRef<GAAClock | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    loadSession();
    setupVisualization();
  }, [sessionId]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);

        const cues = engineRef.current.getActiveCues(currentPhase);

        if (cues.breath) {
          const guidance = engineRef.current.generateBreathGuidance(cues.breath);
          setBreathGuidance(guidance);
        }

        if (cues.sound && cues.sound.length > 0) {
          const latestSound = cues.sound[cues.sound.length - 1];
          if (latestSound.type === 'narration' && latestSound.content) {
            setNarration(latestSound.content);
            setTimeout(() => setNarration(''), latestSound.duration_sec * 1000);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentPhase]);

  async function loadSession() {
    await engineRef.current.loadSession(sessionId!);
    const loadedSession = engineRef.current['currentSession'];
    setSession(loadedSession);
  }

  async function handleStart() {
    await engineRef.current.startSession('demo-user');
    startTimeRef.current = Date.now();
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(!isPlaying);
  }

  function handleReset() {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setCurrentPhase(RevelationPhase.RECOGNITION);
    setIsPlaying(false);
  }

  function setupVisualization() {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6;

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

    let animStartTime = performance.now();

    const animate = () => {
      requestAnimationFrame(animate);

      if (!isPlaying) return;

      const elapsed = performance.now() - animStartTime;
      const gaaState = gaaClockRef.current!.tick(elapsed);

      const coherence = breathGuidance?.currentStep === 'inhale' ? 0.7 : 0.5;

      const params = packEngine.computeParams(
        { region_name: 'Session', lat: 0, lng: 0, timestamp: Date.now() },
        { individual: coherence, collective: coherence, stillness: 0.6, timestamp: Date.now() },
        gaaState,
        { amplitude: 0.8, frequency: 0.3, phase: 0, waveform: 'sine' }
      );

      packEngine.runFrameCallbacks(0.016, params);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!camera || !renderer) return;
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }

  function getBreathStepLabel(step: string): string {
    const labels: Record<string, string> = {
      'inhale': 'Breathe In',
      'hold1': 'Hold',
      'exhale': 'Breathe Out',
      'hold2': 'Hold'
    };
    return labels[step] || step;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a14]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20">
          <defs>
            <pattern id="breath-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1" fill="#06b6d4" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#breath-grid)" />
        </svg>
      </div>

      <button
        onClick={() => navigate('/sessions')}
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full px-8 py-3">
          <h2 className="text-xl font-semibold text-white text-center">{session.title}</h2>
        </div>
      </div>

      {!isPlaying && elapsedTime === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-500/50 flex items-center justify-center">
                <Play className="w-20 h-20 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-3 max-w-md">
              <h3 className="text-2xl font-bold text-white">{session.title}</h3>
              <p className="text-slate-400">{session.description}</p>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                <span>{session.duration_minutes} min</span>
                <span>•</span>
                <span className="capitalize">{session.difficulty}</span>
                <span>•</span>
                <span>{session.intention}</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
            >
              Begin Session
            </button>
          </div>
        </div>
      )}

      {isPlaying && breathGuidance && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="text-center space-y-12">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 blur-3xl transition-all duration-1000"
                style={{
                  transform: `scale(${breathGuidance.currentStep === 'inhale' ? 1.5 : breathGuidance.currentStep === 'exhale' ? 0.5 : 1})`
                }}
              />
              <div
                className="relative w-64 h-64 rounded-full border-4 border-cyan-500/50 flex items-center justify-center transition-all duration-1000"
                style={{
                  transform: `scale(${breathGuidance.currentStep === 'inhale' ? 1.2 : breathGuidance.currentStep === 'exhale' ? 0.8 : 1})`
                }}
              >
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">
                    {Math.ceil(breathGuidance.timeRemaining)}
                  </div>
                  <div className="text-2xl text-cyan-400 font-medium">
                    {getBreathStepLabel(breathGuidance.currentStep)}
                  </div>
                </div>
              </div>
            </div>

            {narration && (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/50 rounded-3xl px-12 py-6 max-w-2xl mx-auto">
                <p className="text-lg text-white leading-relaxed">{narration}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full px-8 py-4">
          <div className="flex items-center gap-8">
            <div className="text-white font-mono text-lg tabular-nums">
              {formatTime(elapsedTime)} / {session.duration_minutes}:00
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePause}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>

              <button
                onClick={handleReset}
                className="w-12 h-12 rounded-full bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-400">
              Phase: <span className="text-cyan-400 capitalize">{currentPhase}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
