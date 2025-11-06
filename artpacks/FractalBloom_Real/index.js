import * as THREE from 'three';

export function register(engine) {
  const bloomShader = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 0 },
      uBloomPhase: { value: 0 },
      uPetalCount: { value: 5.0 },
      uLayerDepth: { value: 1.0 },
      uHue: { value: 0.85 }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uCoherence;
      uniform float uBloomPhase;
      uniform float uPetalCount;
      uniform float uLayerDepth;
      uniform float uHue;

      varying vec2 vUv;

      const float PI = 3.14159265359;
      const float PHI = 1.618033988749;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // Complex operations
      vec2 complexMul(vec2 a, vec2 b) {
        return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
      }

      vec2 complexPow(vec2 z, float n) {
        float r = length(z);
        float theta = atan(z.y, z.x);
        return pow(r, n) * vec2(cos(n * theta), sin(n * theta));
      }

      // Organic Julia-based petal
      float fractalPetal(vec2 z, float time, float petalIndex) {
        // Rotating Julia constant
        float angle = time * 0.3 + petalIndex * 2.0 * PI / uPetalCount;
        vec2 c = vec2(cos(angle), sin(angle)) * 0.7885; // Magic number for pretty Julia

        float iter = 0.0;
        float maxIter = 16.0 + uLayerDepth * 16.0;

        for(float i = 0.0; i < 64.0; i++) {
          if(i >= maxIter) break;

          z = complexPow(z, 2.0) + c;

          if(length(z) > 2.0) {
            iter = i;
            break;
          }
          iter = i;
        }

        return iter / maxIter;
      }

      // Recursive petal structure
      float recursivePetals(vec2 p, float time, int depth) {
        float pattern = 0.0;
        float scale = 1.0;
        vec2 center = vec2(0.0);

        for(int layer = 0; layer < 5; layer++) {
          if(layer >= depth) break;

          float angle = atan(p.y - center.y, p.x - center.x);
          float radius = length(p - center);

          // Petal count increases with layer
          float petals = uPetalCount + float(layer) * 2.0;

          // Petal shape using modulo
          float petalAngle = mod(angle + time * 0.1, 2.0 * PI / petals);
          petalAngle = abs(petalAngle - PI / petals);

          // Petal distance field
          float petalDist = radius * (1.0 + 0.3 * sin(petalAngle * petals * 0.5));

          // Julia fractal on petal surface
          vec2 petalUV = vec2(
            petalDist * cos(angle),
            petalDist * sin(angle)
          ) * scale;

          float fractal = fractalPetal(petalUV, time, float(layer));
          pattern = max(pattern, fractal * (1.0 - float(layer) * 0.15));

          // Recurse with smaller scale
          scale *= PHI;
          p *= 1.5;
        }

        return pattern;
      }

      // Mandala grid for structure
      float mandalaGrid(vec2 p, float time) {
        float grid = 0.0;

        // Circular rings
        float radius = length(p);
        float ringPattern = fract(radius * 3.0 - time * 0.2);
        grid += smoothstep(0.95, 1.0, ringPattern) * 0.3;

        // Radial spokes
        float angle = atan(p.y, p.x);
        float spokePattern = abs(sin(angle * uPetalCount + time * 0.1));
        grid += pow(spokePattern, 20.0) * 0.2;

        return grid;
      }

      // Blooming animation
      float bloomGrow(float dist, float phase) {
        // Bloom opens from center
        return smoothstep(phase * 3.0, phase * 3.0 - 0.5, dist);
      }

      void main() {
        vec2 p = (vUv - 0.5) * 3.0;

        // Bloom expansion
        float bloom = 0.5 + uBloomPhase * 0.5;
        p /= bloom;

        // Rotate slowly
        float rotation = uTime * 0.05;
        float c = cos(rotation);
        float s = sin(rotation);
        p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

        // Calculate depth based on coherence
        int depth = int(1.0 + uLayerDepth * 4.0);

        // Main fractal petal pattern
        float fractalValue = recursivePetals(p, uTime, depth);

        // Add mandala structure
        float mandala = mandalaGrid(p, uTime);
        fractalValue = max(fractalValue, mandala);

        // Blooming growth animation
        float dist = length(p);
        float growthMask = bloomGrow(dist, uBloomPhase);
        fractalValue *= growthMask;

        // Central glow
        float centerGlow = exp(-dist * 0.5) * 0.4;

        // Pulsing energy
        float pulse = sin(uTime * 2.0 - dist * 3.0) * 0.5 + 0.5;
        pulse = pow(pulse, 10.0) * uCoherence * 0.3;

        // Color based on fractal depth
        float hue = uHue + fractalValue * 0.3 - uTime * 0.01;
        float sat = 0.6 + uCoherence * 0.3 + fractalValue * 0.2;
        float val = 0.2 + fractalValue * 0.8 + centerGlow;

        vec3 color = hsv2rgb(vec3(hue, sat, val));

        // Add iridescent shimmer
        float shimmer = sin(uTime * 5.0 + dist * 10.0 + fractalValue * 20.0) * 0.5 + 0.5;
        color += shimmer * 0.15 * uCoherence * vec3(1.0, 0.9, 0.8);

        // Energy pulse
        color += pulse * vec3(1.0, 0.8, 0.6);

        // Vignette
        float vignette = smoothstep(2.0, 0.5, length(p));
        color *= vignette * 0.8 + 0.2;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false
  });

  engine.registerMaterial('bloomMaterial', bloomShader);

  engine.registerNode('bloomPlane', () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    return new THREE.Mesh(geometry, bloomShader);
  });

  engine.setParamMapper((region, coherence) => {
    return {
      coherence: coherence.amplitude,
      bloomPhase: coherence.amplitude,
      petalCount: 5.0 + Math.floor(coherence.amplitude * 3.0),
      layerDepth: 1.0 + coherence.amplitude * 4.0,
      hue: (region.lat + 90) / 180 * 0.4 + 0.7
    };
  });

  let time = 0;

  engine.onFrame((deltaTime, params) => {
    time += deltaTime * 0.8;

    bloomShader.uniforms.uTime.value = time;
    bloomShader.uniforms.uCoherence.value = params.coherence;
    bloomShader.uniforms.uBloomPhase.value = params.bloomPhase;
    bloomShader.uniforms.uPetalCount.value = params.petalCount;
    bloomShader.uniforms.uLayerDepth.value = params.layerDepth;
    bloomShader.uniforms.uHue.value = params.hue;
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2.0,
    maxBrightness: 0.85,
    maxSaturation: 0.85
  });
}

export function cleanup() {
  // Cleanup
}
