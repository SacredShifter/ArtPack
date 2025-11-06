import * as THREE from 'three';

const PHI = 1.618033988749;
const INV_PHI = 0.618033988749;

export function register(engine) {
  const spiralShader = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 0 },
      uBreath: { value: 0 },
      uRotation: { value: 0 },
      uHue: { value: 0.15 }
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
      uniform float uBreath;
      uniform float uRotation;
      uniform float uHue;

      varying vec2 vUv;

      const float PHI = 1.618033988749;
      const float PI = 3.14159265359;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // Rotate point
      vec2 rotate(vec2 p, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
      }

      // Golden spiral distance field
      float goldenSpiral(vec2 p, float rotation) {
        p = rotate(p, rotation);

        float angle = atan(p.y, p.x);
        float radius = length(p);

        // Logarithmic spiral based on golden ratio
        // r = a * e^(b*θ) where b = ln(φ)/π
        float spiralRadius = exp(0.15915494 * angle); // ln(φ)/π ≈ 0.15915494

        // Multiple arms
        float minDist = 1000.0;
        for(float i = 0.0; i < 5.0; i++) {
          float armAngle = angle + i * 2.0 * PI / PHI;
          float armRadius = exp(0.15915494 * armAngle);
          float dist = abs(radius - armRadius);
          minDist = min(minDist, dist);
        }

        return minDist;
      }

      // Fibonacci rectangle grid
      float fibonacciGrid(vec2 p) {
        float grid = 0.0;

        // Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13...
        float fib[8];
        fib[0] = 1.0; fib[1] = 1.0;
        for(int i = 2; i < 8; i++) {
          fib[i] = fib[i-1] + fib[i-2];
        }

        // Create grid based on Fibonacci proportions
        for(int i = 0; i < 7; i++) {
          float size = fib[i] * 0.1;
          vec2 gridP = mod(p, size) - size * 0.5;
          float d = max(abs(gridP.x), abs(gridP.y));
          if(d < 0.005) grid = 1.0;
        }

        return grid;
      }

      void main() {
        vec2 p = (vUv - 0.5) * 4.0;
        p *= 1.0 + uBreath * 0.2; // Breathe with the spiral

        // Golden spiral
        float spiral = goldenSpiral(p, uRotation);
        spiral = smoothstep(0.08, 0.02, spiral);

        // Fibonacci grid (subtle)
        float grid = fibonacciGrid(p);

        // Central glow
        float centerDist = length(p);
        float glow = exp(-centerDist * 0.5) * 0.3;

        // Dynamic hue based on angle and coherence
        float angle = atan(p.y, p.x);
        float hue = uHue + angle / (2.0 * PI) * 0.2 + uCoherence * 0.1;

        // Golden color scheme
        vec3 spiralColor = hsv2rgb(vec3(hue, 0.7, 0.9));
        vec3 glowColor = hsv2rgb(vec3(hue + 0.1, 0.5, 0.6));
        vec3 gridColor = vec3(0.9, 0.8, 0.5); // Gold
        vec3 bgColor = vec3(0.05, 0.03, 0.08);

        // Compose
        vec3 color = bgColor;
        color = mix(color, glowColor, glow);
        color = mix(color, spiralColor, spiral * (0.8 + uCoherence * 0.2));
        color = mix(color, gridColor, grid * 0.3 * uCoherence);

        // Add shimmer at high coherence
        if(uCoherence > 0.7) {
          float shimmer = sin(uTime * 3.0 + centerDist * 5.0) * 0.5 + 0.5;
          color += shimmer * 0.2 * vec3(1.0, 0.9, 0.6);
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false
  });

  engine.registerMaterial('spiralMaterial', spiralShader);

  engine.registerNode('spiralPlane', () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    return new THREE.Mesh(geometry, spiralShader);
  });

  engine.setParamMapper((region, coherence) => {
    return {
      coherence: coherence.amplitude,
      breath: Math.sin(coherence.phase) * 0.5 + 0.5,
      hue: (region.lat + 90) / 180 * 0.2 + 0.1,
      rotationSpeed: coherence.frequency
    };
  });

  let time = 0;
  let rotation = 0;

  engine.onFrame((deltaTime, params) => {
    time += deltaTime;
    rotation += deltaTime * params.rotationSpeed * 0.2;

    spiralShader.uniforms.uTime.value = time;
    spiralShader.uniforms.uCoherence.value = params.coherence;
    spiralShader.uniforms.uBreath.value = params.breath;
    spiralShader.uniforms.uRotation.value = rotation;
    spiralShader.uniforms.uHue.value = params.hue;
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2.0,
    maxBrightness: 0.85,
    maxSaturation: 0.8
  });
}

export function cleanup() {
  // Minimal cleanup
}
