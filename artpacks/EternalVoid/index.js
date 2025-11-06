import * as THREE from 'three';

export function register(engine) {
  const voidShader = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 0 },
      uBreathPhase: { value: 0 },
      uVoidDepth: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uCoherence;
      uniform float uBreathPhase;
      uniform float uVoidDepth;

      varying vec2 vUv;
      varying vec3 vPosition;

      // Perlin-like noise function
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));

        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // The void breathes with you
      float voidField(vec2 p, float time) {
        float n = 0.0;
        float amplitude = 1.0;
        float frequency = 1.0;

        // Multi-octave void resonance
        for(int i = 0; i < 4; i++) {
          n += amplitude * smoothNoise(p * frequency + time * 0.05);
          amplitude *= 0.5;
          frequency *= 2.0;
        }

        return n;
      }

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float dist = length(p);

        // The void's breath
        float breath = sin(uBreathPhase * 3.14159 * 2.0) * 0.5 + 0.5;

        // Subtle void texture that emerges with coherence
        float voidTex = voidField(vUv * 3.0, uTime * 0.1);
        voidTex = pow(voidTex, 3.0 - uCoherence * 2.0); // Becomes visible with coherence

        // Central void portal
        float portal = 1.0 - smoothstep(0.0, 0.8 + breath * 0.2, dist);
        portal = pow(portal, 2.0 + uVoidDepth);

        // Almost-black with hints of deep purple
        vec3 voidColor = vec3(0.02, 0.01, 0.03);
        vec3 portalColor = vec3(0.05, 0.02, 0.08);

        // Subtle luminosity emerges from darkness
        vec3 color = mix(voidColor, portalColor, portal * 0.3);

        // Add texture that emerges with coherence
        color += voidTex * uCoherence * 0.15 * vec3(0.1, 0.05, 0.15);

        // Vignette - darker at edges
        float vignette = smoothstep(1.0, 0.3, dist);
        color *= vignette * 0.8 + 0.2;

        // Very subtle breath pulse
        color *= 0.95 + breath * 0.05;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false
  });

  engine.registerMaterial('voidMaterial', voidShader);

  engine.registerNode('voidPlane', () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    return new THREE.Mesh(geometry, voidShader);
  });

  engine.setParamMapper((region, coherence) => {
    return {
      coherence: coherence.amplitude,
      breathPhase: Math.sin(coherence.phase),
      voidDepth: 1.0 + coherence.amplitude * 0.5,
      regionEntropy: region.entropy / 100
    };
  });

  let time = 0;
  engine.onFrame((deltaTime, params) => {
    time += deltaTime * 0.3; // Slow, meditative time

    voidShader.uniforms.uTime.value = time;
    voidShader.uniforms.uCoherence.value = params.coherence;
    voidShader.uniforms.uBreathPhase.value = params.breathPhase;
    voidShader.uniforms.uVoidDepth.value = params.voidDepth;
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 0.5,
    maxBrightness: 0.3,
    maxSaturation: 0.4,
    lowSensoryMode: true
  });
}

export function cleanup() {
  // Minimal cleanup needed
}
