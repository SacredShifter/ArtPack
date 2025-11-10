import * as THREE from 'three';

const noiseGLSL = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 curl(vec2 p, float time) {
  float eps = 0.01;
  float n1 = snoise(p + vec2(eps, 0.0) + time * 0.05);
  float n2 = snoise(p - vec2(eps, 0.0) + time * 0.05);
  float n3 = snoise(p + vec2(0.0, eps) + time * 0.05);
  float n4 = snoise(p - vec2(0.0, eps) + time * 0.05);
  float dx = (n1 - n2) / (2.0 * eps);
  float dy = (n3 - n4) / (2.0 * eps);
  return vec2(dy, -dx);
}
`;

export function register(engine) {
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
    ${noiseGLSL}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uGain;
    uniform float uPhase;
    uniform float uSeed;

    varying vec2 vUv;

    float coherenceToVisibility(float coherence) {
      return smoothstep(0.2, 0.85, coherence);
    }

    float stillnessToMotionSpeed(float stillness) {
      return mix(1.0, 0.15, stillness);
    }

    float gainToIntensity(float gain, float baseIntensity) {
      return baseIntensity * (1.0 + gain * 1.5);
    }

    float breathToPulse(float breathPhase) {
      return sin(breathPhase) * 0.5 + 0.5;
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float motionSpeed = stillnessToMotionSpeed(uStillness);
      float visibility = coherenceToVisibility(uCoherence);
      float intensity = gainToIntensity(uGain, 1.0);
      float breath = breathToPulse(uPhase);

      vec2 flow = curl(p * 2.0, uTime * motionSpeed * 0.3);

      vec2 samplePos = p + flow * 0.3;
      float fog1 = snoise(samplePos * 1.5 + uTime * 0.05 * motionSpeed);
      float fog2 = snoise(samplePos * 2.5 + uTime * 0.08 * motionSpeed + 100.0);
      float fog3 = snoise(samplePos * 4.0 + uTime * 0.12 * motionSpeed + 200.0);

      float fogDensity = (fog1 * 0.5 + fog2 * 0.3 + fog3 * 0.2);
      fogDensity = pow(abs(fogDensity), 2.0);

      float dist = length(p);
      float vignette = smoothstep(1.2, 0.4, dist);

      float revealedFog = fogDensity * visibility * vignette;

      vec3 baseColor = vec3(0.04, 0.03, 0.05);
      vec3 fogColor = vec3(0.12, 0.08, 0.18);

      vec3 color = mix(baseColor, fogColor, revealedFog * 0.6);

      color *= intensity * (0.95 + breath * 0.08);

      color *= 0.55;

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

  engine.registerMaterial('whisper-field-material', material);

  engine.registerNode('whisper-field-canvas', () => {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  });

  engine.setParamMapper((seed, coherence) => {
    return {
      uCoherence: coherence.individual || coherence.amplitude || 0.5,
      uStillness: coherence.stillness || 0.5,
      uGain: 0.5,
      uPhase: coherence.phase || 0.0,
    };
  });

  let time = 0;
  engine.onFrame((deltaTime, t, params) => {
    time += deltaTime * 0.2;

    uniforms.uTime.value = time;
    uniforms.uCoherence.value = params.uCoherence || 0.5;
    uniforms.uStillness.value = params.uStillness || 0.5;
    uniforms.uGain.value = params.uGain || 0.5;
    uniforms.uPhase.value = params.uPhase || 0.0;

    if (window.innerWidth && window.innerHeight) {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 0.5,
    maxBrightness: 0.5,
    maxSaturation: 0.4,
    lowSensoryMode: true,
  });
}

export function cleanup() {
}
