import * as THREE from 'three';

const synapticCore = `
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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash1D(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float sdCircle(vec2 p, vec2 center, float radius) {
  return length(p - center) - radius;
}

float sdSegment(vec2 p, vec2 a, vec2 b, float thickness) {
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
    ${synapticCore}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uGain;
    uniform float uPhase;
    uniform float uSeed;

    varying vec2 vUv;

    #define NODE_COUNT 24.0

    float coherenceToSymmetry(float coherence) {
      return smoothstep(0.4, 0.9, coherence);
    }

    float gainToPulseSpeed(float gain) {
      return 1.0 + gain * 3.0;
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float symmetry = coherenceToSymmetry(uCoherence);
      float pulseSpeed = gainToPulseSpeed(uGain);
      float breath = sin(uPhase) * 0.5 + 0.5;

      vec2 nodes[24];
      float nodeActivation[24];
      float nodeDepth[24];
      float nodeFiring[24];

      for(float i = 0.0; i < NODE_COUNT; i++) {
        float seed = i * 47.3 + uSeed;

        float angle = (i / NODE_COUNT) * 6.28318 * mix(1.0, 0.5, symmetry);
        float radius = 0.5 + hash(vec2(seed)) * 0.5;

        float depthLayer = hash1D(seed + 1000.0);
        nodeDepth[int(i)] = 0.5 + depthLayer * 0.5;

        float microJitterX = snoise(vec2(uTime * 0.3, seed)) * 0.015 * (1.0 - uStillness);
        float microJitterY = snoise(vec2(uTime * 0.3, seed + 100.0)) * 0.015 * (1.0 - uStillness);

        float x = cos(angle + uTime * 0.1 * (1.0 - symmetry)) * radius + microJitterX;
        float y = sin(angle + uTime * 0.1 * (1.0 - symmetry)) * radius + microJitterY;

        nodes[int(i)] = vec2(x, y) * nodeDepth[int(i)];

        float pulse = sin(uTime * pulseSpeed + seed) * 0.5 + 0.5;
        nodeActivation[int(i)] = pulse;

        float activationWave = sin(uTime * 2.0 - float(i) * 0.5) * 0.5 + 0.5;
        nodeFiring[int(i)] = pow(activationWave, 3.0);
      }

      float burstPhase = sin(uTime * 0.5) * 0.5 + 0.5;
      float synchronousBurst = pow(burstPhase, 8.0) * uCoherence;

      float field = 0.0;
      float trailField = 0.0;

      for(int i = 0; i < int(NODE_COUNT); i++) {
        vec2 node = nodes[i];
        float depth = nodeDepth[i];
        float parallaxScale = mix(0.7, 1.3, depth);

        vec2 parallaxNode = node * parallaxScale;
        float dist = length(p - parallaxNode);

        float nodeBrightness = nodeActivation[i] * (0.5 + nodeFiring[i] * 0.5 + synchronousBurst);

        float nodeGlow = exp(-dist * (8.0 * depth)) * nodeBrightness;
        field += nodeGlow * 0.5 * depth;

        float nodeCore = smoothstep(0.03 * depth, 0.01 * depth, dist);
        field += nodeCore * nodeBrightness * 1.5;

        float fireTrail = exp(-dist * 4.0) * nodeFiring[i] * 0.3;
        vec2 flowDir = normalize(node);
        float directionalTrail = exp(-sdSegment(p, parallaxNode, parallaxNode + flowDir * 0.15 * nodeFiring[i], 0.005));
        trailField += directionalTrail * nodeFiring[i] * 0.4;
      }

      for(int i = 0; i < int(NODE_COUNT); i++) {
        for(int j = i + 1; j < int(NODE_COUNT); j++) {
          vec2 a = nodes[i];
          vec2 b = nodes[j];
          float depthA = nodeDepth[i];
          float depthB = nodeDepth[j];
          float avgDepth = (depthA + depthB) * 0.5;

          float connectionDist = length(a - b);
          if(connectionDist < 1.2) {
            float strength = 1.0 - connectionDist / 1.2;
            strength *= nodeActivation[i] * nodeActivation[j];

            float strandPulse = sin(uPhase * 0.5) * 0.5 + 0.5;
            float thicknessMod = 0.002 * (0.8 + strandPulse * 0.4);

            float lineDist = sdSegment(p, a, b, thicknessMod);
            float connection = smoothstep(0.015, 0.0, lineDist);

            float travelWave = sin((uTime * pulseSpeed * 2.0) - connectionDist * 5.0) * 0.5 + 0.5;
            connection *= strength * (0.3 + travelWave * 0.4 + synchronousBurst * 0.3);

            field += connection * 0.3 * avgDepth;
          }
        }
      }

      float ambientActivity = snoise(p * 4.0 + uTime * 0.5) * 0.5 + 0.5;
      ambientActivity = pow(ambientActivity, 3.0);
      field += ambientActivity * uCoherence * 0.1;

      float vignetteDist = length(p);
      float vignette = smoothstep(1.5, 0.5, vignetteDist);
      field *= vignette;

      vec3 baseColor = vec3(0.02, 0.015, 0.03);
      vec3 synapticColor = vec3(0.15, 0.12, 0.3);
      vec3 pulseColor = vec3(0.3, 0.25, 0.5);
      vec3 fireColor = vec3(0.4, 0.3, 0.6);

      vec3 color = baseColor;
      color = mix(color, synapticColor, field * 0.7);
      color = mix(color, pulseColor, field * ambientActivity * 0.4);
      color = mix(color, fireColor, trailField);

      color *= 0.85 + breath * 0.08;
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

  engine.registerMaterial('synaptic-field-material', material);

  engine.registerNode('synaptic-field-canvas', () => {
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
    time += deltaTime * 0.3;

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
    maxStrobeHz: 2.5,
    maxBrightness: 0.8,
    maxSaturation: 0.7,
    lowSensoryMode: false,
  });
}

export function cleanup() {
}
