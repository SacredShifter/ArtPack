import * as THREE from 'three';

const shaderCore = `
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

float hash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

vec2 curl(vec2 p, float time) {
  float eps = 0.01;
  float n1 = snoise(p + vec2(eps, 0.0) + time * 0.1);
  float n2 = snoise(p - vec2(eps, 0.0) + time * 0.1);
  float n3 = snoise(p + vec2(0.0, eps) + time * 0.1);
  float n4 = snoise(p - vec2(0.0, eps) + time * 0.1);
  float dx = (n1 - n2) / (2.0 * eps);
  float dy = (n3 - n4) / (2.0 * eps);
  return vec2(dy, -dx);
}

float sdLine(vec2 p, vec2 a, vec2 b, float thickness) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - thickness;
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
    ${shaderCore}

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

    float coherenceToDensity(float coherence) {
      return 3.0 + coherence * 12.0;
    }

    float gainToAlignment(float gain) {
      return gain;
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float visibility = coherenceToVisibility(uCoherence);
      float threadDensity = coherenceToDensity(uCoherence);
      float alignment = gainToAlignment(uGain);

      float microJitterX = snoise(vec2(uTime * 0.15, 1.0)) * 0.012 * (1.0 - uStillness);
      float microJitterY = snoise(vec2(uTime * 0.15, 2.0)) * 0.012 * (1.0 - uStillness);
      vec2 jitteredP = p + vec2(microJitterX, microJitterY);

      vec2 flowField = curl(jitteredP * 2.0, uTime * 0.3);

      float threads = 0.0;
      float glowField = 0.0;

      float synchronousBurst = pow(sin(uTime * 0.45) * 0.5 + 0.5, 8.0) * uCoherence;

      for(float i = 0.0; i < 15.0; i++) {
        if(i >= threadDensity) break;

        float offset = i * 47.3 + uSeed;

        float threadDepth = 0.5 + hash(offset) * 0.5;
        float parallaxScale = mix(0.85, 1.15, threadDepth);

        vec2 seed = vec2(
          snoise(vec2(offset * 0.1, uTime * 0.02 + offset)),
          snoise(vec2(offset * 0.1 + 100.0, uTime * 0.02 + offset))
        );

        vec2 start = seed * 1.5 * parallaxScale;
        vec2 flowStart = curl(start, uTime * 0.2);
        vec2 end = start + flowStart * (0.5 + alignment * 0.5);

        float activationWave = sin(uTime * 1.8 - i * 0.4) * 0.5 + 0.5;
        activationWave = pow(activationWave, 4.0);

        float thicknessPulse = sin(uPhase * 0.5 + i * 0.15) * 0.5 + 0.5;
        float lineThickness = 0.002 * (0.8 + thicknessPulse * 0.4) * threadDepth;

        float lineDist = sdLine(jitteredP, start, end, lineThickness);
        float thread = smoothstep(0.01, 0.0, lineDist);

        float pulse = sin(uPhase + i * 0.2) * 0.5 + 0.5;
        thread *= (0.3 + pulse * 0.2) * (0.7 + activationWave * 0.3 + synchronousBurst);

        threads += thread * threadDepth;

        vec2 threadCenter = (start + end) * 0.5;
        float threadGlow = exp(-length(jitteredP - threadCenter) * 3.0) * activationWave * 0.25 * threadDepth;
        glowField += threadGlow;

        vec2 threadDir = normalize(end - start);
        float trailDist = sdLine(jitteredP, start, start + threadDir * 0.08 * activationWave, 0.003);
        float trail = exp(-trailDist * 50.0) * activationWave * 0.2;
        glowField += trail;
      }

      threads *= visibility;
      glowField *= visibility;

      float dist = length(p);
      float vignette = smoothstep(1.3, 0.5, dist);
      threads *= vignette;
      glowField *= vignette;

      vec3 baseColor = vec3(0.02, 0.015, 0.025);
      vec3 threadColor = vec3(0.15, 0.1, 0.2);
      vec3 glowColor = vec3(0.25, 0.18, 0.35);

      vec3 color = mix(baseColor, threadColor, threads * 0.6);
      color = mix(color, glowColor, glowField);

      color *= 0.85 + sin(uPhase) * 0.05;
      color += vec3(synchronousBurst * 0.15);

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

  engine.registerMaterial('liminal-threads-material', material);

  engine.registerNode('liminal-threads-canvas', () => {
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
    maxStrobeHz: 1.0,
    maxBrightness: 0.6,
    maxSaturation: 0.5,
    lowSensoryMode: true,
  });
}

export function cleanup() {
}
