import * as THREE from 'three';

const waveCore = `
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

#define PI 3.14159265359
#define TAU 6.28318530718

float circularWave(vec2 p, vec2 center, float time, float frequency) {
  float dist = length(p - center);
  return sin(dist * frequency - time);
}

float planeWave(vec2 p, vec2 direction, float time, float frequency) {
  return sin(dot(p, direction) * frequency - time);
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
    ${waveCore}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uGain;
    uniform float uPhase;
    uniform float uSeed;

    varying vec2 vUv;

    float coherenceToStability(float coherence) {
      return smoothstep(0.3, 0.9, coherence);
    }

    float breathToAmplitude(float breathPhase, float baseAmp) {
      return sin(breathPhase) * baseAmp;
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float stability = coherenceToStability(uCoherence);
      float breathAmp = breathToAmplitude(uPhase, 0.3);
      float baseAmplitude = 0.5 + breathAmp;

      float freq1 = 4.0 + stability * 2.0;
      float freq2 = 5.0 + stability * 1.5;
      float freq3 = 3.5 + stability * 2.5;

      vec2 center1 = vec2(-0.4, 0.3);
      vec2 center2 = vec2(0.5, -0.2);
      vec2 center3 = vec2(0.0, 0.5);

      float wave1 = circularWave(p, center1, uTime * 1.2, freq1);
      float wave2 = circularWave(p, center2, uTime * 1.5, freq2);
      float wave3 = circularWave(p, center3, uTime * 0.9, freq3);

      vec2 dir1 = normalize(vec2(1.0, 0.5));
      vec2 dir2 = normalize(vec2(-0.7, 1.0));
      float planeWave1 = planeWave(p, dir1, uTime * 2.0, 3.0);
      float planeWave2 = planeWave(p, dir2, uTime * 1.7, 3.5);

      float interference = (wave1 + wave2 + wave3) / 3.0;
      interference += (planeWave1 + planeWave2) * 0.3;

      interference *= baseAmplitude;

      float standingWave = sin(length(p) * 8.0 * stability) *
                           cos(atan(p.y, p.x) * 4.0 + uTime * 0.5);
      interference += standingWave * stability * 0.4;

      float modulation = snoise(p * 2.0 + uTime * 0.3) * 0.5 + 0.5;
      interference *= 0.7 + modulation * 0.3;

      interference = (interference + 1.0) * 0.5;

      float resonanceBands = abs(fract(interference * 5.0) - 0.5) * 2.0;
      resonanceBands = pow(resonanceBands, 0.7);

      float field = mix(interference, resonanceBands, stability * 0.6);

      float dist = length(p);
      float vignette = smoothstep(1.5, 0.4, dist);
      field *= vignette;

      vec3 baseColor = vec3(0.02, 0.015, 0.03);
      vec3 waveColor1 = vec3(0.1, 0.15, 0.3);
      vec3 waveColor2 = vec3(0.2, 0.15, 0.35);
      vec3 resonanceColor = vec3(0.25, 0.2, 0.4);

      vec3 color = baseColor;
      color = mix(color, waveColor1, field * 0.5);
      color = mix(color, waveColor2, field * interference * 0.3);
      color = mix(color, resonanceColor, resonanceBands * stability * 0.4);

      color *= 0.88 + sin(uPhase) * 0.06;

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

  engine.registerMaterial('interference-realm-material', material);

  engine.registerNode('interference-realm-canvas', () => {
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
    time += deltaTime * 0.25;

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
    maxStrobeHz: 2.0,
    maxBrightness: 0.75,
    maxSaturation: 0.65,
    lowSensoryMode: true,
  });
}

export function cleanup() {
}
