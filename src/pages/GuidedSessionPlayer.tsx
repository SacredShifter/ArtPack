import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { packEngine } from '../modules/sacred-shifter-core/PackEngine';
import { GAAClock } from '../modules/sacred-shifter-core/GAAClock';
import { GuidedSessionEngine } from '../modules/sacred-shifter-core/GuidedSessionEngine';
import type { BreathCue } from '../modules/sacred-shifter-core/GuidedSessionEngine';
import { RevelationManager, RevelationPhase } from '../modules/sacred-shifter-core/RevelationManager';
import { EvolutionEngine } from '../modules/mirror-unseen/evolution';
import { ArrowLeft, Play, Pause, RotateCcw, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export function GuidedSessionPlayer() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<RevelationPhase>(RevelationPhase.RECOGNITION);
  const [phaseTeaching, setPhaseTeaching] = useState<string>('');
  const [breathGuidance, setBreathGuidance] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [narration, setNarration] = useState<string>('');
  const [formType, setFormType] = useState<string>('circle');
  const [visualCues, setVisualCues] = useState<string[]>([]);

  const [evoInputs, setEvoInputs] = useState({
    Coh: 0.5,
    Cx: 0.3,
    Pol: 0.5,
    U: 0.5,
    Syn: 0.4,
    Res: 0.3
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GuidedSessionEngine>(new GuidedSessionEngine());
  const revelationRef = useRef<RevelationManager | null>(null);
  const evolutionRef = useRef<EvolutionEngine>(new EvolutionEngine());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gaaClockRef = useRef<GAAClock | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    loadSession();
    setupVisualization();
  }, [sessionId]);

  useEffect(() => {
    if (isPlaying && revelationRef.current) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);

        updateConsciousnessMetrics();

        const teaching = revelationRef.current!.update({
          coherence: evoInputs.Coh,
          complexity: evoInputs.Cx,
          polarity: evoInputs.Pol,
          residual: evoInputs.Res,
          uncertainty: evoInputs.U
        });

        if (teaching) {
          setPhaseTeaching(teaching.caption);
          setNarration(teaching.audioScript || '');
          setTimeout(() => setNarration(''), 5000);
        }

        setCurrentPhase(revelationRef.current!.getCurrentPhase());

        const elementRatios = { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 };
        const evoParams = evolutionRef.current.computeEvoParams(evoInputs, elementRatios);
        const transition = evolutionRef.current.checkTransition(evoInputs, evoParams);

        if (transition) {
          setFormType(transition.toForm);
        }

        const cues = revelationRef.current!.getVisualizationCues({
          coherence: evoInputs.Coh,
          complexity: evoInputs.Cx,
          polarity: evoInputs.Pol,
          residual: evoInputs.Res,
          uncertainty: evoInputs.U
        });
        setVisualCues(cues);

        const cues2 = engineRef.current.getActiveCues(currentPhase);
        if (cues2.breath) {
          const guidance = engineRef.current.generateBreathGuidance(cues2.breath);
          setBreathGuidance(guidance);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentPhase, evoInputs]);

  async function loadSession() {
    const loadedSession = await engineRef.current.loadSession(sessionId!);
    setSession(loadedSession);
  }

  function updateConsciousnessMetrics() {
    const breathPhase = Math.sin(Date.now() / 2000);

    setEvoInputs(prev => ({
      Coh: Math.min(1, prev.Coh + (breathPhase > 0 ? 0.01 : -0.005) + (Math.random() - 0.5) * 0.02),
      Cx: Math.max(0, Math.min(1, prev.Cx + (Math.random() - 0.5) * 0.01)),
      Pol: 0.5 + Math.sin(Date.now() / 5000) * 0.2,
      U: Math.max(0, prev.U - 0.002),
      Syn: Math.min(1, prev.Syn + (breathPhase > 0 ? 0.005 : 0)),
      Res: Math.max(0, prev.Res - 0.003)
    }));
  }

  async function handleStart() {
    await engineRef.current.startSession('demo-user');
    revelationRef.current = new RevelationManager(sessionId!, 'demo-user');
    startTimeRef.current = Date.now();
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(!isPlaying);
  }

  function handleReset() {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    revelationRef.current = new RevelationManager(sessionId!, 'demo-user');
    setCurrentPhase(RevelationPhase.RECOGNITION);
    setIsPlaying(false);
    setEvoInputs({ Coh: 0.5, Cx: 0.3, Pol: 0.5, U: 0.5, Syn: 0.4, Res: 0.3 });
    setFormType('circle');
  }

  async function captureSigil() {
    if (!canvasRef.current) return;

    const canvas = await html2canvas(canvasRef.current, {
      backgroundColor: '#0a0a14',
      scale: 2
    });

    const link = document.createElement('a');
    link.download = `sigil-${currentPhase}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
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

      const elementRatios = { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 };
      const evoParams = evolutionRef.current.computeEvoParams(evoInputs, elementRatios);

      const params = packEngine.computeParams(
        { region_name: 'Session', lat: 0, lng: 0, timestamp: Date.now() },
        { individual: evoInputs.Coh, collective: evoInputs.Coh, stillness: 0.6, timestamp: Date.now() },
        gaaState,
        { amplitude: 0.8, frequency: 0.3, phase: 0, waveform: 'sine', hueShift: 0, breathRate: 0.25, tension: evoInputs.Res },
        evoInputs,
        { lift: evoParams.lift, merkaba: evoParams.merkaba, formType: formType }
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

  function getPhaseColor(phase: RevelationPhase): string {
    const colors: Record<RevelationPhase, string> = {
      [RevelationPhase.RECOGNITION]: 'cyan',
      [RevelationPhase.REFLECTION]: 'purple',
      [RevelationPhase.INTEGRATION]: 'pink',
      [RevelationPhase.REVELATION]: 'yellow',
      [RevelationPhase.SEAL]: 'emerald'
    };
    return colors[phase];
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
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2 pointer-events-auto"
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
              className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30 pointer-events-auto"
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

      {isPlaying && (
        <div className="absolute top-24 right-8 z-50 space-y-4 pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 w-96">
            <div className={`text-xs font-semibold uppercase tracking-wider mb-3 text-${getPhaseColor(currentPhase)}-400`}>
              Phase {Object.values(RevelationPhase).indexOf(currentPhase) + 1}/5: {currentPhase}
            </div>

            <div className="text-sm text-white mb-4 leading-relaxed">
              {phaseTeaching || 'Observe the field...'}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Coherence</span>
                <span className="text-cyan-400 font-mono">{(evoInputs.Coh * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${evoInputs.Coh * 100}%` }} />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Complexity</span>
                <span className="text-purple-400 font-mono">{(evoInputs.Cx * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${evoInputs.Cx * 100}%` }} />
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Residual:</span>
                <span className="font-mono">{(evoInputs.Res * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Uncertainty:</span>
                <span className="font-mono">{(evoInputs.U * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Form:</span>
                <span className="capitalize">{formType}</span>
              </div>
            </div>

            {visualCues.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                {visualCues.map((cue, i) => (
                  <div key={i} className="text-xs text-cyan-400 mb-1">• {cue}</div>
                ))}
              </div>
            )}
          </div>

          {currentPhase === RevelationPhase.SEAL && (
            <button
              onClick={captureSigil}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <Download className="w-4 h-4" />
              Export Sigil
            </button>
          )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
