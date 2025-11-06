import * as THREE from 'three';
import type { EngineAPI, RegionSeed, CoherenceSample } from '../types';

const vertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uHue;
  uniform float uAmplitude;
  uniform float uHaloIntensity;
  uniform float uCoherencePhase;

  varying vec3 vPosition;
  varying vec3 vNormal;

  vec3 hslToRgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c / 2.0;

    vec3 rgb;
    if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);

    return rgb + m;
  }

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);

    float wave = sin(vPosition.y * 3.0 + uTime * 2.0 + uCoherencePhase) * 0.5 + 0.5;
    float pulse = sin(uTime * 1.5) * 0.3 + 0.7;

    float hue = mod(uHue + wave * 0.15 + uTime * 0.05, 1.0);
    float saturation = 0.7 + wave * 0.2;
    float lightness = 0.3 + fresnel * 0.4 + wave * 0.2 * uAmplitude;

    vec3 baseColor = hslToRgb(hue, saturation, lightness);

    float halo = fresnel * uHaloIntensity * pulse;
    vec3 haloColor = hslToRgb(mod(hue + 0.1, 1.0), 0.9, 0.6);

    vec3 finalColor = baseColor + haloColor * halo;

    float alpha = 0.85 + fresnel * 0.15;

    gl_FragColor = vec4(finalColor * uAmplitude, alpha);
  }
`;

let torusKnotGeometry: THREE.TorusKnotGeometry | null = null;
let material: THREE.ShaderMaterial | null = null;

export function register(engine: EngineAPI): void {
  if (!torusKnotGeometry) {
    torusKnotGeometry = new THREE.TorusKnotGeometry(10, 3, 128, 16);
  }

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uHue: { value: 0.5 },
      uAmplitude: { value: 1.0 },
      uHaloIntensity: { value: 0.6 },
      uCoherencePhase: { value: 0 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  engine.registerMaterial('auroraShader', material);

  engine.registerNode('auroraKnot', () => {
    if (!material) {
      throw new Error('Material not initialized');
    }
    const mesh = new THREE.Mesh(torusKnotGeometry, material);
    mesh.position.set(0, 0, 0);
    return mesh;
  });

  engine.setParamMapper((region: RegionSeed, coherence: CoherenceSample) => {
    const entropyNorm = Math.min(region.entropy / 100, 1);

    const baseHue = (region.lat + 90) / 180;
    const harmonicShift = region.harmonics.length > 0
      ? region.harmonics.reduce((a, b) => a + b, 0) / region.harmonics.length / 10
      : 0;

    const hue = (baseHue + harmonicShift) % 1.0;

    const amplitude = 0.5 + coherence.amplitude * 0.5;
    const haloIntensity = 0.4 + entropyNorm * 0.4;

    return {
      hue,
      amplitude,
      haloIntensity,
      coherencePhase: coherence.phase,
      brightness: amplitude * 0.8,
      saturation: 0.7 + entropyNorm * 0.2
    };
  });

  let elapsedTime = 0;
  engine.onFrame((deltaTime: number, params: Record<string, any>) => {
    elapsedTime += deltaTime;

    if (material) {
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uHue.value = params.hue ?? 0.5;
      material.uniforms.uAmplitude.value = params.amplitude ?? 1.0;
      material.uniforms.uHaloIntensity.value = params.haloIntensity ?? 0.6;
      material.uniforms.uCoherencePhase.value = params.coherencePhase ?? 0;
    }
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2.5,
    maxBrightness: 0.8,
    maxSaturation: 0.9,
    lowSensoryMode: false
  });
}

export function cleanup(): void {
  if (material) {
    material.dispose();
    material = null;
  }

  if (torusKnotGeometry) {
    torusKnotGeometry.dispose();
    torusKnotGeometry = null;
  }
}
