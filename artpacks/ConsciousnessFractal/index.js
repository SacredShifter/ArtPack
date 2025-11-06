import * as THREE from 'three';

export function register(engine) {
  const fractalShader = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 0 },
      uZoom: { value: 1.0 },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uIterations: { value: 64 },
      uHue: { value: 0.65 },
      uStillnessDepth: { value: 1.0 }
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
      uniform float uZoom;
      uniform vec2 uOffset;
      uniform float uIterations;
      uniform float uHue;
      uniform float uStillnessDepth;

      varying vec2 vUv;

      const float PI = 3.14159265359;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // Complex number operations
      vec2 complexMul(vec2 a, vec2 b) {
        return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
      }

      vec2 complexPow(vec2 z, float n) {
        float r = length(z);
        float theta = atan(z.y, z.x);
        float rn = pow(r, n);
        return vec2(rn * cos(n * theta), rn * sin(n * theta));
      }

      // Mandelbrot-inspired consciousness fractal
      float consciousnessFractal(vec2 c, float time, float maxIter) {
        vec2 z = vec2(0.0);
        float iter = 0.0;

        // Breathing offset
        vec2 breath = vec2(
          sin(time * 0.5) * 0.1,
          cos(time * 0.3) * 0.1
        );

        c += breath * (1.0 - uCoherence);

        for(float i = 0.0; i < 256.0; i++) {
          if(i >= maxIter) break;

          // z = z^2 + c with consciousness modulation
          z = complexPow(z, 2.0 + sin(time * 0.2) * 0.5) + c;

          // Escape condition
          if(length(z) > 4.0) {
            // Smooth iteration count
            iter = i - log2(log2(length(z)));
            break;
          }

          iter = i;
        }

        return iter / maxIter;
      }

      // Julia set for variety
      float juliaSet(vec2 z, float time, float maxIter) {
        // Dynamic Julia constant that breathes
        vec2 c = vec2(
          -0.4 + sin(time * 0.1) * 0.3,
          0.6 + cos(time * 0.07) * 0.3
        );

        float iter = 0.0;

        for(float i = 0.0; i < 256.0; i++) {
          if(i >= maxIter) break;

          z = complexPow(z, 2.0) + c;

          if(length(z) > 4.0) {
            iter = i - log2(log2(length(z)));
            break;
          }

          iter = i;
        }

        return iter / maxIter;
      }

      // Burning ship fractal for shadow work
      float burningShip(vec2 c, float maxIter) {
        vec2 z = vec2(0.0);
        float iter = 0.0;

        for(float i = 0.0; i < 256.0; i++) {
          if(i >= maxIter) break;

          // z = (|Re(z)| + i|Im(z)|)^2 + c
          z = vec2(abs(z.x), abs(z.y));
          z = complexPow(z, 2.0) + c;

          if(length(z) > 4.0) {
            iter = i - log2(log2(length(z)));
            break;
          }

          iter = i;
        }

        return iter / maxIter;
      }

      void main() {
        vec2 uv = (vUv - 0.5) * 2.0;

        // Zoom controlled by coherence and stillness
        float zoom = uZoom / (1.0 + uCoherence * 0.5 + uStillnessDepth * 0.5);
        vec2 c = uv * zoom + uOffset;

        // Rotate with time
        float angle = uTime * 0.1;
        float cosA = cos(angle);
        float sinA = sin(angle);
        c = vec2(c.x * cosA - c.y * sinA, c.x * sinA + c.y * cosA);

        // Choose fractal based on coherence
        float fractalValue;
        if(uCoherence < 0.3) {
          // Low coherence: burning ship (shadow)
          fractalValue = burningShip(c, uIterations);
        } else if(uCoherence < 0.7) {
          // Medium: Mandelbrot (integration)
          fractalValue = consciousnessFractal(c, uTime, uIterations);
        } else {
          // High: Julia (transcendence)
          fractalValue = juliaSet(c, uTime, uIterations);
        }

        // Color mapping
        float hue = uHue + fractalValue * 0.5 + uTime * 0.02;
        float sat = 0.7 + uCoherence * 0.3;
        float val = 0.3 + fractalValue * 0.7;

        // Add depth layers at high stillness
        if(uStillnessDepth > 1.5) {
          float layerValue = consciousnessFractal(c * 1.618, uTime * 0.5, uIterations * 0.5);
          hue += layerValue * 0.2;
          val = mix(val, val * 1.3, layerValue * 0.3);
        }

        vec3 color = hsv2rgb(vec3(hue, sat, val));

        // Add glow at boundaries
        float glow = smoothstep(0.98, 1.0, fractalValue);
        color += glow * vec3(1.0, 0.9, 0.8) * uCoherence;

        // Vignette
        float vignette = smoothstep(1.0, 0.3, length(uv));
        color *= vignette * 0.7 + 0.3;

        // Subtle pulse
        color *= 0.95 + sin(uTime * 2.0) * 0.05 * uCoherence;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false
  });

  engine.registerMaterial('fractalMaterial', fractalShader);

  engine.registerNode('fractalPlane', () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    return new THREE.Mesh(geometry, fractalShader);
  });

  engine.setParamMapper((region, coherence) => {
    return {
      coherence: coherence.amplitude,
      iterations: Math.floor(32 + coherence.amplitude * 96),
      hue: (region.lat + 90) / 180 * 0.3 + 0.5,
      zoomLevel: 1.5 + region.entropy / 50
    };
  });

  let time = 0;
  let zoom = 1.5;
  let stillnessDepth = 1.0;

  // Listen for stillness amplification events
  engine.onFrame((deltaTime, params) => {
    time += deltaTime * 0.5;

    // Gentle zoom controlled by coherence
    const targetZoom = params.zoomLevel;
    zoom += (targetZoom - zoom) * deltaTime * 0.5;

    // Journey deeper with time
    const offset = new THREE.Vector2(
      -0.5 + Math.sin(time * 0.1) * 0.2,
      0.0 + Math.cos(time * 0.07) * 0.2
    );

    fractalShader.uniforms.uTime.value = time;
    fractalShader.uniforms.uCoherence.value = params.coherence;
    fractalShader.uniforms.uZoom.value = zoom;
    fractalShader.uniforms.uOffset.value = offset;
    fractalShader.uniforms.uIterations.value = params.iterations;
    fractalShader.uniforms.uHue.value = params.hue;
    fractalShader.uniforms.uStillnessDepth.value = stillnessDepth;

    // Gradually increase depth (resets on movement via Silence Amplifier)
    stillnessDepth = Math.min(stillnessDepth + deltaTime * 0.1, 3.0);
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2.5,
    maxBrightness: 0.85,
    maxSaturation: 0.9
  });
}

export function cleanup() {
  // Cleanup
}
