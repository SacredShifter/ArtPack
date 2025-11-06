import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { artPackEngine } from '../../modules/artpacks';
import type { RegionSeed, CoherenceSample } from '../../modules/artpacks';
import { Play, Pause, Download, RefreshCw } from 'lucide-react';

export function ResonancePortraitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentNodeRef = useRef<THREE.Object3D | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentRegion, setCurrentRegion] = useState<RegionSeed>({
    lat: 37.7749,
    lon: -122.4194,
    entropy: 42,
    harmonics: [1.5, 2.3, 3.7, 5.1]
  });
  const [coherence, setCoherence] = useState<CoherenceSample>({
    timestamp: Date.now(),
    amplitude: 0.7,
    phase: 0,
    frequency: 1.2
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return;

      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const loadInitialPack = async () => {
      try {
        const manifestUrl = new URL(
          './modules/artpacks/SamplePack_AuroraTriad/manifest.json',
          window.location.origin
        );
        await artPackEngine.loadPack(manifestUrl);
        updateSceneWithCurrentPack();
      } catch (error) {
        console.error('Failed to load initial pack:', error);
      }
    };

    loadInitialPack();

    const handlePackSwitched = () => {
      updateSceneWithCurrentPack();
    };

    artPackEngine.on('switched', handlePackSwitched);

    return () => {
      artPackEngine.off('switched', handlePackSwitched);
    };
  }, []);

  const updateSceneWithCurrentPack = () => {
    if (!sceneRef.current) return;

    if (currentNodeRef.current) {
      sceneRef.current.remove(currentNodeRef.current);
      currentNodeRef.current = null;
    }

    const currentPack = artPackEngine.getCurrentPack();
    if (!currentPack) return;

    const nodeNames = Array.from(artPackEngine['nodes'].keys());
    if (nodeNames.length > 0) {
      const newNode = artPackEngine.createNode(nodeNames[0]);
      if (newNode) {
        sceneRef.current.add(newNode);
        currentNodeRef.current = newNode;
      }
    }
  };

  useEffect(() => {
    const coherenceInterval = setInterval(() => {
      setCoherence(prev => ({
        timestamp: Date.now(),
        amplitude: 0.5 + Math.sin(Date.now() / 1000) * 0.3,
        phase: (prev.phase + 0.1) % (Math.PI * 2),
        frequency: 1.0 + Math.sin(Date.now() / 2000) * 0.5
      }));
    }, 100);

    return () => clearInterval(coherenceInterval);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const deltaTime = clockRef.current.getDelta();
      const params = artPackEngine.computeParams(currentRegion, coherence);

      artPackEngine.runFrameCallbacks(deltaTime, params);

      if (currentNodeRef.current) {
        currentNodeRef.current.rotation.y += 0.005;
        currentNodeRef.current.rotation.x += 0.003;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, currentRegion, coherence]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const randomizeRegion = () => {
    setCurrentRegion({
      lat: Math.random() * 180 - 90,
      lon: Math.random() * 360 - 180,
      entropy: Math.random() * 100,
      harmonics: Array.from({ length: 4 }, () => Math.random() * 10)
    });
  };

  const exportImage = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `resonance-portrait-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="aspect-video bg-slate-900 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={randomizeRegion}
            className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            title="Randomize Region"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={exportImage}
            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            title="Export PNG"
          >
            <Download className="w-5 h-5" />
          </button>

          <div className="ml-auto text-sm text-gray-600">
            <span className="font-medium">Coherence:</span> {(coherence.amplitude * 100).toFixed(0)}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-700">Region Seed</h4>
            <div className="text-gray-600">
              <p>Lat: {currentRegion.lat.toFixed(2)}°</p>
              <p>Lon: {currentRegion.lon.toFixed(2)}°</p>
              <p>Entropy: {currentRegion.entropy.toFixed(0)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-gray-700">Coherence Field</h4>
            <div className="text-gray-600">
              <p>Amplitude: {coherence.amplitude.toFixed(2)}</p>
              <p>Phase: {coherence.phase.toFixed(2)}</p>
              <p>Frequency: {coherence.frequency.toFixed(2)} Hz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
