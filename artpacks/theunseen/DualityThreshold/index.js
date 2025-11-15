/**
 * DUALITY — THE UNSEEN & THE SEEN
 * Wave 3: Revelation | The Crown Jewel of The Unseen Series
 *
 * Where shadow meets form. Where the unexpressed becomes shape.
 * The threshold where consciousness recognizes itself.
 */

import * as THREE from 'three';

const sharedGLSL = `
#define PI 3.14159265359
#define TAU 6.28318530718
#define PHI 1.618033988749

// Simplex noise
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

// Curl noise for fluid motion
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

// Sacred geometry primitives
float sdCircle(vec2 p, vec2 center, float radius) {
  return length(p - center) - radius;
}

// Analog imperfect circle - wobbles slightly
float flowerOfLifeCircle(vec2 p, vec2 center, float radius, float thickness, float time) {
  // Add fractional wobble (0.2% variation)
  float angle = atan(p.y - center.y, p.x - center.x);
  float wobble = snoise(vec2(angle * 8.0, time * 0.3)) * 0.002 * radius;
  radius += wobble;

  float d = abs(sdCircle(p, center, radius)) - thickness;

  // Micro-blur at edges
  float blur = 0.015;
  return smoothstep(blur, 0.0, d);
}

float flowerOfLife(vec2 p, vec2 center, float radius, float thickness, float time) {
  float pattern = 0.0;
  pattern += flowerOfLifeCircle(p, center, radius, thickness, time);

  for(int i = 0; i < 6; i++) {
    float angle = float(i) * TAU / 6.0;
    // Tiny asymmetric variation per petal
    float angleWobble = snoise(vec2(float(i) * 7.3, time * 0.4)) * 0.003;
    vec2 offset = vec2(cos(angle + angleWobble), sin(angle + angleWobble)) * radius;
    pattern += flowerOfLifeCircle(p, center + offset, radius, thickness, time + float(i));
  }

  return clamp(pattern, 0.0, 1.0);
}

// Hexagonal lattice
float hexLattice(vec2 p, float scale) {
  vec2 q = vec2(p.x * 1.1547, p.y + p.x * 0.5773);
  vec2 pi = floor(q);
  vec2 pf = fract(q);

  float v = mod(pi.x + pi.y, 3.0);

  float ca = step(1.0, v);
  float cb = step(2.0, v);
  vec2 ma = step(pf.xy, pf.yx);

  return dot(ma, 1.0 - pf.yx + ca * (pf.x + pf.y - 1.0) + cb * (pf.yx - 2.0 * pf.xy));
}

// Hash for randomness
float hash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// === ORGANIC REALISM TOOLKIT ===

// Turbulent FBM - chaotic multi-octave noise
float fbm(vec2 p, float time, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    // Add distortion per octave for organic feel
    vec2 distorted = p + curl(p * 0.3 + time * 0.05, time) * 0.2;
    value += snoise(distorted * frequency) * amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Film grain - analog texture
float filmGrain(vec2 uv, float time) {
  vec2 p = uv * 1000.0 + time * 3.0;
  return hash2D(p) * 2.0 - 1.0;
}

// Lens vignette - optical falloff
float lensVignette(vec2 uv, float strength) {
  vec2 centered = uv * 2.0 - 1.0;
  float dist = length(centered);
  return 1.0 - pow(dist, 2.0) * strength;
}

// Chromatic aberration offset
vec2 chromaticOffset(vec2 uv, float amount) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  return centered * dist * amount;
}

// Dust particles - lens imperfections
float dustSpeck(vec2 uv, vec2 speckPos, float size) {
  float dist = length(uv - speckPos);
  return smoothstep(size, 0.0, dist);
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
    ${sharedGLSL}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uGain;
    uniform float uPhase;
    uniform float uSeed;

    varying vec2 vUv;

    // ═══════════════════════════════════════════════════════════
    // DUALITY CORE: The Threshold Engine
    // ═══════════════════════════════════════════════════════════

    // Calculate duality factor: 0.0 = Unseen, 1.0 = Seen
    float getDualityFactor(float coherence) {
      return smoothstep(0.15, 0.85, coherence);
    }

    // Transition character: smooth vs sharp, driven by stillness
    float getTransitionSmooth(float stillness, float dualityFactor) {
      // Low stillness = abrupt transitions (dramatic)
      // High stillness = smooth crossfades (gentle)
      float sharpness = mix(8.0, 1.0, stillness);
      return pow(dualityFactor, sharpness);
    }

    // Breathing pulse for duality oscillation
    float getDualityPulse(float time, float stillness) {
      // Slower breathing at high stillness
      float frequency = mix(0.4, 0.15, stillness);
      return sin(time * frequency) * 0.5 + 0.5;
    }

    // ═══════════════════════════════════════════════════════════
    // THE UNSEEN LAYER: Darkness, Potential, Emergence
    // ═══════════════════════════════════════════════════════════

    vec3 renderUnseenLayer(vec2 uv, float time, float seed) {
      vec2 p = (uv - 0.5) * 4.0;

      // === ORGANIC BACKGROUND: Turbulent multi-layer noise ===
      // Layer 1: Smooth atmospheric base
      float smooth = fbm(p * 0.8, time * 0.1, 3) * 0.5 + 0.5;
      // Layer 2: Chaotic turbulence
      float chaos = fbm(p * 2.3 + vec2(100.0, 50.0), time * 0.15, 4) * 0.5 + 0.5;
      // Combine with distortion
      vec2 distortion = vec2(
        fbm(p * 1.5 + time * 0.08, time, 2),
        fbm(p * 1.5 - time * 0.08 + 50.0, time, 2)
      ) * 0.3;
      p += distortion;

      vec3 atmosphere = mix(
        vec3(0.05, 0.07, 0.11),
        vec3(0.12, 0.14, 0.18),
        smooth * 0.6 + chaos * 0.4
      );

      // Whisper field currents
      vec2 flowPos = p * 2.0;
      vec2 flow = curl(flowPos + seed, time * 0.3);
      p += flow * 0.2;

      // Liminal threads - barely visible filaments
      float threads = 0.0;
      for(int i = 0; i < 5; i++) {
        float fi = float(i);
        vec2 threadPos = p + flow * (fi * 0.3);
        float noise = snoise(threadPos * (2.0 + fi * 0.5) + time * 0.1);
        threads += pow(max(0.0, noise), 3.0) * 0.15;
      }

      // Particle field - sparse luminous points
      float particles = 0.0;
      for(int i = 0; i < 8; i++) {
        vec2 gridPos = p * 3.0 + float(i) * 123.45;
        vec2 cellId = floor(gridPos);
        vec2 cellUv = fract(gridPos);

        vec2 particlePos = vec2(
          hash2D(cellId + seed),
          hash2D(cellId + seed + 13.37)
        );
        particlePos += sin(time * 0.2 + cellId.x) * 0.1;

        float dist = length(cellUv - particlePos);
        particles += smoothstep(0.03, 0.0, dist) * 0.3;
      }

      // Pregnant emptiness - subtle depth layers
      float depth = fbm(p * 0.6, time * 0.05, 3) * 0.5 + 0.5;

      // Compose unseen - enhanced visibility
      vec3 unseen = atmosphere;
      unseen += vec3(0.08, 0.10, 0.14) * threads;
      unseen += vec3(0.15, 0.18, 0.25) * particles;
      unseen += vec3(0.06, 0.08, 0.12) * depth;

      return unseen;
    }

    // ═══════════════════════════════════════════════════════════
    // THE SEEN LAYER: Light, Form, Crystallization
    // ═══════════════════════════════════════════════════════════

    vec3 renderSeenLayer(vec2 uv, float time, float seed, float gain) {
      vec2 p = (uv - 0.5) * 4.0;

      // Base luminosity - increased for visibility
      vec3 luminosity = vec3(0.18, 0.20, 0.24);

      // Sacred geometry - Flower of Life (now with organic imperfections)
      // Off-center for asymmetry (3% shift)
      vec2 flowerCenter = vec2(0.12, -0.08);
      float flowerScale = 0.6 + sin(time * 0.2) * 0.1;
      float flower = flowerOfLife(p, flowerCenter, flowerScale, 0.015, time);

      // Hexagonal lattice
      float hex = hexLattice(p * 1.5, 1.0);
      hex = smoothstep(0.05, 0.0, hex);

      // Synaptic nodes - glowing points of awareness
      float nodes = 0.0;
      for(int i = 0; i < 12; i++) {
        float fi = float(i);
        float angle = fi * TAU / 12.0 + time * 0.1;
        float radius = 1.2 + sin(time * 0.15 + fi) * 0.3;
        vec2 nodePos = vec2(cos(angle), sin(angle)) * radius;

        float nodeDist = length(p - nodePos);
        float nodeIntensity = smoothstep(0.15, 0.0, nodeDist);
        nodes += nodeIntensity * (0.8 + hash(fi + seed) * 0.4);
      }

      // Synaptic connections - lines between nodes
      float connections = 0.0;
      for(int i = 0; i < 6; i++) {
        float fi = float(i);
        float angle1 = fi * TAU / 6.0 + time * 0.1;
        float angle2 = (fi + 1.0) * TAU / 6.0 + time * 0.1;

        vec2 p1 = vec2(cos(angle1), sin(angle1)) * 1.2;
        vec2 p2 = vec2(cos(angle2), sin(angle2)) * 1.2;

        vec2 line = p2 - p1;
        vec2 toPoint = p - p1;
        float proj = clamp(dot(toPoint, line) / dot(line, line), 0.0, 1.0);
        float lineDist = length(toPoint - line * proj);

        connections += smoothstep(0.02, 0.0, lineDist) * 0.3;
      }

      // Interference patterns - wave superposition
      float interference = 0.0;
      for(int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 center = vec2(
          cos(fi * TAU / 4.0 + time * 0.1),
          sin(fi * TAU / 4.0 + time * 0.1)
        ) * 0.8;

        float wave = sin(length(p - center) * 8.0 - time * 2.0);
        interference += wave * 0.15;
      }
      interference = max(0.0, interference);

      // Golden ratio spiral emergence
      float spiral = 0.0;
      float spiralAngle = atan(p.y, p.x);
      float spiralRadius = length(p);
      float spiralPattern = sin(spiralAngle * 5.0 + log(spiralRadius + 0.1) * PHI * 3.0 - time * 0.5);
      spiral = smoothstep(0.8, 1.0, spiralPattern) * 0.2;

      // Compose seen with golden/white accents
      vec3 seen = luminosity;

      // Flower of Life - golden
      seen += vec3(0.9, 0.7, 0.4) * flower * 1.2;

      // Hexagonal lattice - white/blue
      seen += vec3(0.8, 0.9, 1.0) * hex * 0.6;

      // Synaptic nodes - bright white
      seen += vec3(1.0, 0.95, 0.85) * nodes * 1.5;

      // Connections - cyan/white
      seen += vec3(0.7, 0.9, 1.0) * connections;

      // Interference - iridescent
      seen += vec3(0.9, 0.8, 1.0) * interference;

      // Spiral - golden
      seen += vec3(1.0, 0.8, 0.5) * spiral;

      // Bloom/highlight intensity from gain
      float bloomFactor = 1.0 + gain * 2.0;
      seen *= bloomFactor;

      return seen;
    }

    // ═══════════════════════════════════════════════════════════
    // DUALITY COMPOSITOR: The Threshold Itself
    // ═══════════════════════════════════════════════════════════

    void main() {
      vec2 uv = vUv;
      float time = uTime;

      // Calculate duality metrics
      float dualityFactor = getDualityFactor(uCoherence);
      float transitionSmooth = getTransitionSmooth(uStillness, dualityFactor);
      float dualityPulse = getDualityPulse(time, uStillness);

      // Render both layers
      vec3 unseenLayer = renderUnseenLayer(uv, time, uSeed);
      vec3 seenLayer = renderSeenLayer(uv, time, uSeed, uGain);

      // Apply breathing pulse to duality in mid-range coherence
      float pulseStrength = smoothstep(0.3, 0.5, uCoherence) *
                           (1.0 - smoothstep(0.5, 0.7, uCoherence));
      float pulsedFactor = mix(transitionSmooth, transitionSmooth * dualityPulse, pulseStrength * 0.3);

      // Composite layers with transition
      vec3 color = mix(unseenLayer, seenLayer, pulsedFactor);

      // Interference zone: where layers meet, create shimmer
      float interferenceZone = smoothstep(0.35, 0.45, uCoherence) *
                               (1.0 - smoothstep(0.55, 0.65, uCoherence));
      float shimmer = snoise(uv * 20.0 + time * 0.5) * 0.5 + 0.5;
      vec3 thresholdColor = mix(
        vec3(0.4, 0.5, 0.7),
        vec3(0.9, 0.7, 0.5),
        shimmer
      );
      color = mix(color, color + thresholdColor * 0.15, interferenceZone * shimmer);

      // === PHOTOGRAPHIC DEGRADATION PASS ===

      // 1. Lens vignette (optical falloff)
      float vignette = lensVignette(uv, 0.35);
      color *= vignette;

      // 2. Chromatic aberration (subtle) - apply to current color
      vec2 chromaticShift = chromaticOffset(uv, 0.002);
      float aberrationAmount = smoothstep(0.4, 0.6, length(uv - 0.5)) * 0.008;
      color.r += aberrationAmount * (color.r - color.g);

      // 3. Bloom around highlights
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      float bloom = pow(max(0.0, luminance - 0.6), 1.5) * 0.25;
      color += vec3(0.95, 0.90, 0.85) * bloom;

      // 4. Dust specks (lens imperfections)
      float dust = 0.0;
      dust += dustSpeck(uv, vec2(0.23, 0.67), 0.008) * 0.12;
      dust += dustSpeck(uv, vec2(0.81, 0.34), 0.006) * 0.08;
      dust += dustSpeck(uv, vec2(0.15, 0.22), 0.005) * 0.10;
      dust += dustSpeck(uv, vec2(0.92, 0.78), 0.007) * 0.09;
      color = mix(color, vec3(0.4, 0.4, 0.42), dust);

      // 5. Horizontal lens gradient (sensor response)
      float lensGrad = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
      color *= 0.92 + lensGrad * 0.08;

      // 6. Film grain (analog texture)
      float grain = filmGrain(uv, time) * 0.035;
      color += vec3(grain);

      // 7. Subtle glow for high coherence
      float glowMask = smoothstep(0.6, 0.7, uCoherence);
      float glow = pow(dualityFactor, 2.0) * 0.15 * glowMask;
      color += vec3(0.88, 0.84, 0.90) * glow;

      // === NATURAL ELEMENT: Smoke wisps ===
      float smoke = fbm(uv * 3.0 + vec2(time * 0.02, time * 0.03), time * 0.1, 4);
      smoke = pow(max(0.0, smoke), 3.0) * 0.08;
      vec3 smokeColor = vec3(0.15, 0.17, 0.21);
      color = mix(color, smokeColor, smoke * (1.0 - dualityFactor * 0.7));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const dualityShader = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: false
  });

  engine.registerMaterial('dualityMaterial', dualityShader);

  engine.registerNode('dualityPlane', () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    return new THREE.Mesh(geometry, dualityShader);
  });

  engine.setParamMapper((region, coherence) => {
    return {
      uCoherence: coherence.individual || coherence.amplitude || 0,
      uStillness: coherence.stillness || 0.5,
      uGain: 0.5,
      uPhase: coherence.phase || 0,
    };
  });

  let time = 0;
  engine.onFrame((deltaTime, t, params) => {
    time += deltaTime * 0.5;

    dualityShader.uniforms.uTime.value = time;
    dualityShader.uniforms.uCoherence.value = params.uCoherence || 0;
    dualityShader.uniforms.uStillness.value = params.uStillness || 0.5;
    dualityShader.uniforms.uGain.value = params.uGain || 0.5;
    dualityShader.uniforms.uPhase.value = params.uPhase || 0;
    dualityShader.uniforms.uSeed.value = 50;

    if (window.innerWidth && window.innerHeight) {
      dualityShader.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  });
}
