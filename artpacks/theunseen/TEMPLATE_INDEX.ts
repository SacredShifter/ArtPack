import * as THREE from 'three';
import { unSeenShaderCore } from './shared/index';

export function register(engine: any) {
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uCoherence: { value: 0.5 },
    uStillness: { value: 0.5 },
    uGain: { value: 0.5 },
    uPhase: { value: 0.0 },
    uSeed: { value: Math.random() * 1000 },
  };

  const fragmentShader = `
    ${unSeenShaderCore}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uGain;
    uniform float uPhase;
    uniform float uSeed;

    varying vec2 vUv;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      // ==================================================================
      // PACK-SPECIFIC VISUAL LOGIC GOES HERE
      // ==================================================================

      // Example: Use shared utilities
      float noise = snoise(p * 3.0 + uTime * 0.1);
      vec2 flow = curl(p, uTime);

      // Apply reactivity
      float clarity = coherenceToClarity(uCoherence, 0.3);
      float motionSpeed = stillnessToMotionSpeed(uStillness);
      float intensity = gainToIntensity(uGain, 1.0);
      float breath = breathToPulse(uPhase);

      // Build color
      vec3 color = vec3(0.02, 0.01, 0.03);
      color += vec3(noise) * clarity * 0.1;
      color *= intensity;
      color *= 0.95 + breath * 0.05;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    fragmentShader,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    transparent: false,
  });

  engine.registerMaterial('pack-material', material);

  engine.registerNode('pack-canvas', () => {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  });

  engine.setParamMapper((seed: any, coherence: any) => {
    return {
      uCoherence: coherence.individual || coherence.amplitude || 0.5,
      uStillness: coherence.stillness || 0.5,
      uGain: 0.5,
      uPhase: coherence.phase || 0.0,
    };
  });

  let time = 0;
  engine.onFrame((deltaTime: number, t: number, params: any) => {
    time += deltaTime * 0.3;

    uniforms.uTime.value = time;
    uniforms.uCoherence.value = params.uCoherence || 0.5;
    uniforms.uStillness.value = params.uStillness || 0.5;
    uniforms.uGain.value = params.uGain || 0.5;
    uniforms.uPhase.value = params.uPhase || 0.0;
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 1.5,
    maxBrightness: 0.7,
    maxSaturation: 0.6,
    lowSensoryMode: true,
  });
}

export function cleanup() {
  // Release resources if needed
}
