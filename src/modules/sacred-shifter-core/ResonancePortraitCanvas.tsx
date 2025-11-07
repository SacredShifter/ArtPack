import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { packEngine } from './PackEngine';
import { GAAClock, GAARatioMapper } from './GAAClock';
import { SonicOrchestrator } from './SonicOrchestrator';
import { RegionSeed, CoherenceSample } from './types';
import { AlertCircle } from 'lucide-react';

interface ResonancePortraitCanvasProps {
  seed?: RegionSeed;
  coherence?: CoherenceSample;
  onCapture?: (dataUrl: string) => void;
  className?: string;
}

export function ResonancePortraitCanvas({
  seed,
  coherence,
  onCapture,
  className = ''
}: ResonancePortraitCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const packNodesRef = useRef<THREE.Object3D[]>([]);

  const gaaClockRef = useRef<GAAClock | null>(null);
  const orchestratorRef = useRef<SonicOrchestrator | null>(null);
  const ratioMapperRef = useRef<GAARatioMapper | null>(null);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  const defaultSeed: RegionSeed = seed || {
    region_name: 'Global Consciousness',
    lat: 0,
    lng: 0,
    timestamp: Date.now()
  };

  const defaultCoherence: CoherenceSample = coherence || {
    individual: 0.7,
    collective: 0.6,
    stillness: 0.5,
    timestamp: Date.now()
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const width = container.clientWidth;
    const height = container.clientHeight;

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
    ratioMapperRef.current = new GAARatioMapper();

    startTimeRef.current = performance.now();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    const handlePackSwitched = () => {
      packNodesRef.current.forEach(node => {
        scene.remove(node);
      });
      packNodesRef.current = [];

      const primaryNode = packEngine.createNode('primary');
      if (primaryNode) {
        scene.add(primaryNode);
        packNodesRef.current.push(primaryNode);
      }

      setError(null);
    };

    const handlePackError = (data: { error: string }) => {
      setError(data.error);
    };

    packEngine.on('switched', handlePackSwitched);
    packEngine.on('error', handlePackError);

    const currentPack = packEngine.getCurrentPack();
    if (currentPack) {
      handlePackSwitched();
    }

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const deltaTime = 16.67;

      if (!gaaClockRef.current || !orchestratorRef.current) return;

      const gaaState = gaaClockRef.current.tick(elapsed);
      const envelope = orchestratorRef.current.tick(deltaTime);

      const params = packEngine.computeParams(
        defaultSeed,
        defaultCoherence,
        gaaState,
        envelope
      );

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
      packEngine.off('error', handlePackError);

      packNodesRef.current.forEach(node => {
        scene.remove(node);
      });
      packNodesRef.current = [];

      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  const handleCapture = () => {
    if (!rendererRef.current || !onCapture) return;

    try {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      onCapture(dataUrl);
    } catch (err) {
      setError('Failed to capture image');
      console.error(err);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md px-4 py-3 bg-red-900/90 backdrop-blur-sm border border-red-500/50 rounded-lg flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-100">{error}</p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
        <span className="text-xs text-white/70 font-mono">{fps} FPS</span>
      </div>

      {onCapture && (
        <button
          onClick={handleCapture}
          className="absolute top-4 right-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
        >
          Capture
        </button>
      )}
    </div>
  );
}
