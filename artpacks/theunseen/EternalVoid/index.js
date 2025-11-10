import * as THREE from 'three';

export function register(engine) {
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uCoherence: { value: 0 },
    uStillness: { value: 0.5 },
    uBreathPhase: { value: 0 },
    uVoidDepth: { value: 1.0 }
  };

  const voidShader = new THREE.ShaderMaterial({
    uniforms,
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
      uniform vec2 uResolution;
      uniform float uCoherence;
      uniform float uStillness;
      uniform float uBreathPhase;
      uniform float uVoidDepth;

      varying vec2 vUv;
      varying vec3 vPosition;

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

      float voidField(vec2 p, float time) {
        float n = 0.0;
        float amplitude = 1.0;
        float frequency = 1.0;

        for(int i = 0; i < 4; i++) {
          n += amplitude * smoothNoise(p * frequency + time * 0.03);
          amplitude *= 0.5;
          frequency *= 2.0;
        }

        return n;
      }

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        p.x *= uResolution.x / uResolution.y;
        float dist = length(p);

        float breath = sin(uBreathPhase * 3.14159 * 2.0) * 0.5 + 0.5;

        float voidTex = voidField(vUv * 3.0, uTime * 0.1);
        voidTex = pow(voidTex, 3.5 - uCoherence * 2.5);

        float portal = 1.0 - smoothstep(0.0, 0.8 + breath * 0.15, dist);
        portal = pow(portal, 2.5 + uVoidDepth);

        vec3 voidColor = vec3(0.03, 0.015, 0.04);
        vec3 portalColor = vec3(0.08, 0.03, 0.12);

        vec3 color = mix(voidColor, portalColor, portal * 0.4);

        color += voidTex * uCoherence * 0.2 * vec3(0.12, 0.06, 0.18);

        float vignette = smoothstep(1.2, 0.3, dist);
        color *= vignette * 0.8 + 0.3;

        color *= 0.95 + breath * 0.08;

        color *= mix(1.0, 0.7, 1.0 - uStillness);

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
      uCoherence: coherence.individual || coherence.amplitude || 0,
      uStillness: coherence.stillness || 0.5,
      uBreathPhase: coherence.phase || 0,
      uVoidDepth: 1.0 + (coherence.individual || coherence.amplitude || 0) * 0.5,
    };
  });

  let time = 0;
  engine.onFrame((deltaTime, t, params) => {
    time += deltaTime * 0.25;

    voidShader.uniforms.uTime.value = time;
    voidShader.uniforms.uCoherence.value = params.uCoherence || 0;
    voidShader.uniforms.uStillness.value = params.uStillness || 0.5;
    voidShader.uniforms.uBreathPhase.value = params.uBreathPhase || 0;
    voidShader.uniforms.uVoidDepth.value = params.uVoidDepth || 1.0;

    if (window.innerWidth && window.innerHeight) {
      voidShader.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 0.5,
    maxBrightness: 0.3,
    maxSaturation: 0.4,
    lowSensoryMode: true
  });
}

export function cleanup() {
}
