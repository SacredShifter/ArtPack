import * as THREE from 'three';

const geometryCore = `
#define PI 3.14159265359
#define TAU 6.28318530718
#define PHI 1.618033988749

float sdCircle(vec2 p, vec2 center, float radius) {
  return length(p - center) - radius;
}

float flowerOfLifeCircle(vec2 p, vec2 center, float radius, float thickness) {
  float d = abs(sdCircle(p, center, radius)) - thickness;
  return smoothstep(0.01, 0.0, d);
}

float flowerOfLife(vec2 p, vec2 center, float radius, float thickness) {
  float pattern = 0.0;

  pattern += flowerOfLifeCircle(p, center, radius, thickness);

  for(int i = 0; i < 6; i++) {
    float angle = float(i) * TAU / 6.0;
    vec2 offset = vec2(cos(angle), sin(angle)) * radius;
    pattern += flowerOfLifeCircle(p, center + offset, radius, thickness);
  }

  return clamp(pattern, 0.0, 1.0);
}

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

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float triangleGrid(vec2 p, float size, float thickness) {
  float pattern = 0.0;

  vec2 vertices[3];
  vertices[0] = vec2(0.0, size);
  vertices[1] = vec2(size * 0.866, -size * 0.5);
  vertices[2] = vec2(-size * 0.866, -size * 0.5);

  for(int i = 0; i < 3; i++) {
    int next = (i + 1) % 3;
    float line = sdSegment(p, vertices[i], vertices[next]);
    pattern += smoothstep(thickness * 1.5, thickness * 0.5, line);
  }

  return clamp(pattern, 0.0, 1.0);
}

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
    ${geometryCore}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uGain;
    uniform float uPhase;
    uniform float uSeed;

    varying vec2 vUv;

    float coherenceToClarity(float coherence) {
      return smoothstep(0.3, 0.9, coherence);
    }

    float stillnessToStability(float stillness) {
      return smoothstep(0.3, 0.9, stillness);
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float clarity = coherenceToClarity(uCoherence);
      float stability = stillnessToStability(uStillness);
      float breath = sin(uPhase) * 0.5 + 0.5;

      float scale = 0.4 + breath * 0.05;

      float rotation = uTime * 0.05 * (1.0 - stability);
      float c = cos(rotation);
      float s = sin(rotation);
      mat2 rot = mat2(c, -s, s, c);
      vec2 rotP = rot * p;

      float lattice = 0.0;

      float hex = hexLattice(rotP * 3.0, 1.0);
      lattice += smoothstep(0.95, 0.98, hex) * 0.3;

      float flowerRadius = scale * 0.6;
      float flowerThickness = 0.005 + clarity * 0.003;
      float flower = flowerOfLife(rotP, vec2(0.0), flowerRadius, flowerThickness);
      lattice += flower * 0.5;

      for(float i = 0.0; i < 3.0; i++) {
        float layerScale = 0.3 + i * 0.25;
        float layerRotation = rotation + i * PI / 3.0;
        float lc = cos(layerRotation);
        float ls = sin(layerRotation);
        mat2 layerRot = mat2(lc, -ls, ls, lc);
        vec2 layerP = layerRot * p;

        float tri = triangleGrid(layerP, layerScale, 0.005);
        lattice += tri * (0.15 + clarity * 0.1) * (1.0 - i * 0.2);
      }

      float crystallineNoise = snoise(rotP * 8.0 + uTime * 0.1) * 0.5 + 0.5;
      crystallineNoise = pow(crystallineNoise, 3.0);
      lattice += crystallineNoise * clarity * 0.15;

      lattice *= clarity;

      float dist = length(p);
      float vignette = smoothstep(1.4, 0.4, dist);
      lattice *= vignette;

      vec3 baseColor = vec3(0.02, 0.015, 0.03);
      vec3 latticeColor = vec3(0.15, 0.12, 0.25);
      vec3 highlightColor = vec3(0.25, 0.20, 0.35);

      vec3 color = baseColor;
      color = mix(color, latticeColor, lattice * 0.6);
      color = mix(color, highlightColor, lattice * crystallineNoise * 0.3);

      color *= 0.90 + breath * 0.05;
      color *= mix(1.0, 0.7, 1.0 - stability);

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

  engine.registerMaterial('hidden-lattice-material', material);

  engine.registerNode('hidden-lattice-canvas', () => {
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
    maxStrobeHz: 1.5,
    maxBrightness: 0.7,
    maxSaturation: 0.6,
    lowSensoryMode: true,
  });
}

export function cleanup() {
}
