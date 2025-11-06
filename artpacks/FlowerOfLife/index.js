import * as THREE from 'three';

export function register(engine) {
  const flowerShader = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 0 },
      uBloomPhase: { value: 0 },
      uComplexity: { value: 1.0 },
      uHue: { value: 0.55 }
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
      uniform float uComplexity;
      uniform float uHue;

      varying vec2 vUv;

      const float PI = 3.14159265359;
      const float TWO_PI = 6.28318530718;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // Circle distance field
      float circle(vec2 p, vec2 center, float radius) {
        return length(p - center) - radius;
      }

      // Flower of Life pattern
      float flowerOfLife(vec2 p, float scale, float phase) {
        p *= scale;

        float radius = 1.0;
        float minDist = 1000.0;

        // Central circle
        minDist = min(minDist, abs(circle(p, vec2(0.0), radius)));

        // Six surrounding circles (seed of life)
        for(float i = 0.0; i < 6.0; i++) {
          float angle = i * TWO_PI / 6.0 + phase;
          vec2 center = vec2(cos(angle), sin(angle)) * radius;
          minDist = min(minDist, abs(circle(p, center, radius)));
        }

        // Second ring - emergent complexity
        if(uComplexity > 1.5) {
          for(float i = 0.0; i < 12.0; i++) {
            float angle = i * TWO_PI / 12.0 + phase * 0.5;
            vec2 center = vec2(cos(angle), sin(angle)) * radius * 1.732; // sqrt(3)
            minDist = min(minDist, abs(circle(p, center, radius)));
          }
        }

        // Third ring - full complexity
        if(uComplexity > 2.5) {
          for(float i = 0.0; i < 18.0; i++) {
            float angle = i * TWO_PI / 18.0 - phase * 0.3;
            vec2 center = vec2(cos(angle), sin(angle)) * radius * 2.646; // 2*sqrt(1.732)
            minDist = min(minDist, abs(circle(p, center, radius)));
          }
        }

        return minDist;
      }

      // Vesica piscis (intersection)
      float vesicaPiscis(vec2 p, float offset) {
        float c1 = circle(p, vec2(-offset, 0.0), 1.0);
        float c2 = circle(p, vec2(offset, 0.0), 1.0);
        return max(-c1, -c2); // Intersection
      }

      // Platonic solid hint at high coherence
      float metatronsCube(vec2 p, float phase) {
        float pattern = 0.0;

        // Connect all vertices of nested circles
        for(float i = 0.0; i < 6.0; i++) {
          float angle1 = i * TWO_PI / 6.0 + phase;
          vec2 v1 = vec2(cos(angle1), sin(angle1));

          for(float j = i + 1.0; j < 6.0; j++) {
            float angle2 = j * TWO_PI / 6.0 + phase;
            vec2 v2 = vec2(cos(angle2), sin(angle2));

            // Line from v1 to v2
            vec2 dir = normalize(v2 - v1);
            vec2 perp = vec2(-dir.y, dir.x);
            float distToLine = abs(dot(p - v1, perp));

            float lineLength = length(v2 - v1);
            float alongLine = dot(p - v1, dir);

            if(alongLine > 0.0 && alongLine < lineLength && distToLine < 0.02) {
              pattern = 1.0;
            }
          }
        }

        return pattern;
      }

      void main() {
        vec2 p = (vUv - 0.5) * 3.0;

        // Bloom effect - expand with coherence
        p /= 1.0 + uBloomPhase * 0.3;

        // Main flower pattern
        float flower = flowerOfLife(p, 1.0, uTime * 0.1);
        float flowerLine = smoothstep(0.05, 0.02, flower);

        // Vesica piscis glow in center
        float vesica = vesicaPiscis(p, 0.5);
        float vesicaGlow = smoothstep(0.0, -0.5, vesica) * 0.4;

        // Metatron's cube appears at high coherence
        float metatron = 0.0;
        if(uCoherence > 0.7) {
          metatron = metatronsCube(p, uTime * 0.05);
        }

        // Radial glow from center
        float centerDist = length(p);
        float centerGlow = exp(-centerDist * 0.8) * 0.5;

        // Pulsing energy rings
        float rings = sin(centerDist * 10.0 - uTime * 2.0) * 0.5 + 0.5;
        rings = pow(rings, 10.0) * uCoherence * 0.3;

        // Color scheme - violet to cyan gradient
        float hue = uHue + centerDist * 0.1 - uTime * 0.02;
        vec3 lineColor = hsv2rgb(vec3(hue, 0.8, 1.0));
        vec3 glowColor = hsv2rgb(vec3(hue + 0.1, 0.6, 0.8));
        vec3 vesicaColor = hsv2rgb(vec3(hue - 0.1, 0.9, 1.0));
        vec3 bgColor = vec3(0.02, 0.01, 0.05);

        // Compose
        vec3 color = bgColor;
        color += centerGlow * glowColor;
        color += vesicaGlow * vesicaColor;
        color = mix(color, lineColor, flowerLine);
        color += rings * glowColor;
        color = mix(color, vec3(1.0, 0.95, 0.8), metatron * 0.6);

        // Subtle shimmer
        float shimmer = sin(uTime * 5.0 + centerDist * 8.0) * 0.5 + 0.5;
        color += shimmer * 0.1 * uCoherence * glowColor;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false
  });

  engine.registerMaterial('flowerMaterial', flowerShader);

  engine.registerNode('flowerPlane', () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    return new THREE.Mesh(geometry, flowerShader);
  });

  engine.setParamMapper((region, coherence) => {
    return {
      coherence: coherence.amplitude,
      bloomPhase: coherence.amplitude,
      complexity: 1.0 + coherence.amplitude * 2.5,
      hue: (region.lat + 90) / 180 * 0.2 + 0.45
    };
  });

  let time = 0;

  engine.onFrame((deltaTime, params) => {
    time += deltaTime;

    flowerShader.uniforms.uTime.value = time;
    flowerShader.uniforms.uCoherence.value = params.coherence;
    flowerShader.uniforms.uBloomPhase.value = params.bloomPhase;
    flowerShader.uniforms.uComplexity.value = params.complexity;
    flowerShader.uniforms.uHue.value = params.hue;
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 1.5,
    maxBrightness: 0.85,
    maxSaturation: 0.85
  });
}

export function cleanup() {
  // Cleanup if needed
}
