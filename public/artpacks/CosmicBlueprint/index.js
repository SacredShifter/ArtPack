export function register(engine) {
  const THREE = engine.getThree();

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uPhase;
    uniform float uLFO;
    uniform float uAmplitude;
    uniform float uCoherence;
    uniform float uStillness;

    uniform float uParticipantCount;
    uniform vec3 uParticipantColors[100];
    uniform vec2 uParticipantPositions[100];
    uniform float uParticipantAmplitudes[100];
    uniform float uParticipantRotations[100];
    uniform float uParticipantElements[100];

    uniform float uFireBalance;
    uniform float uEarthBalance;
    uniform float uAirBalance;
    uniform float uWaterBalance;

    varying vec2 vUv;
    varying vec3 vPosition;

    vec3 hsl2rgb(vec3 c) {
      vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }

    float sdCircle(vec2 p, float r) {
      return length(p) - r;
    }

    float sdHexagon(vec2 p, float r) {
      const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
      p = abs(p);
      p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
      p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
      return length(p) * sign(p.y);
    }

    float sdZodiacGlyph(vec2 p, float element, float time) {
      if (element < 0.25) {
        float angle = atan(p.y, p.x) * 6.0 + time;
        float r = length(p);
        float star = abs(sin(angle)) * 0.3 + 0.7;
        return r - 0.2 * star;
      }
      else if (element < 0.5) {
        return sdHexagon(p, 0.2);
      }
      else if (element < 0.75) {
        vec2 p1 = p - vec2(0.15, 0.0);
        vec2 p2 = p + vec2(0.15, 0.0);
        return min(sdCircle(p1, 0.1), sdCircle(p2, 0.1));
      }
      else {
        float wave = sin(p.x * 10.0 + time * 2.0) * 0.05;
        return abs(p.y - wave) - 0.02;
      }
    }

    void main() {
      vec2 uv = vUv - 0.5;
      uv *= 2.0;

      float angle = atan(uv.y, uv.x);
      float radius = length(uv);

      vec3 finalColor = vec3(0.0);
      float totalGlow = 0.0;

      int count = int(min(uParticipantCount, 100.0));

      vec3 zodiacRing = vec3(0.0);
      for (float i = 0.0; i < 12.0; i++) {
        float ringAngle = (i / 12.0) * 6.28318;
        float dist = abs(atan(uv.y, uv.x) - ringAngle);
        if (dist > 3.14159) dist = 6.28318 - dist;

        float zodiacGlow = exp(-dist * 20.0) * 0.1;
        vec3 zodiacColor = hsl2rgb(vec3(i / 12.0, 0.6, 0.5));
        zodiacRing += zodiacColor * zodiacGlow;
      }

      finalColor += zodiacRing * 0.3;

      if (count >= 1) {
        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          vec3 participantColor = uParticipantColors[i];
          float participantAmp = uParticipantAmplitudes[i];
          float participantRot = uParticipantRotations[i];
          float participantElem = uParticipantElements[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          float rotatedAngle = atan(offset.y, offset.x) + uTime * participantRot;
          vec2 rotatedOffset = vec2(cos(rotatedAngle), sin(rotatedAngle)) * dist;

          float glyph = sdZodiacGlyph(rotatedOffset * 5.0, participantElem, uTime);
          float glyphMask = smoothstep(0.02, 0.0, glyph);

          float pulse = sin(uTime * 2.0 + float(i) * 0.1 + uPhase * 6.28) * 0.5 + 0.5;
          float glow = exp(-dist * 3.0) * participantAmp * pulse;

          vec3 color = hsl2rgb(vec3(participantColor.x / 360.0, participantColor.y, participantColor.z));

          finalColor += (color * glyphMask + color * glow * 0.3) * participantAmp;
          totalGlow += glow;
        }

        if (count >= 2) {
          for (int i = 0; i < count - 1; i++) {
            for (int j = i + 1; j < min(i + 5, count); j++) {
              vec2 p1 = uParticipantPositions[i];
              vec2 p2 = uParticipantPositions[j];

              float lineDist = abs(
                (p2.y - p1.y) * uv.x - (p2.x - p1.x) * uv.y + p2.x * p1.y - p2.y * p1.x
              ) / length(p2 - p1);

              float aspectStrength = 0.1 * uCoherence;
              float lineGlow = exp(-lineDist * 50.0) * aspectStrength;

              vec3 aspectColor = mix(
                hsl2rgb(vec3(uParticipantColors[i].x / 360.0, 0.8, 0.6)),
                hsl2rgb(vec3(uParticipantColors[j].x / 360.0, 0.8, 0.6)),
                0.5
              );

              finalColor += aspectColor * lineGlow;
            }
          }
        }
      }

      vec3 elementField = vec3(0.0);
      elementField += hsl2rgb(vec3(0.0, 0.9, 0.5)) * uFireBalance * 0.3;
      elementField += hsl2rgb(vec3(0.33, 0.7, 0.4)) * uEarthBalance * 0.3;
      elementField += hsl2rgb(vec3(0.55, 0.8, 0.6)) * uAirBalance * 0.3;
      elementField += hsl2rgb(vec3(0.6, 0.8, 0.5)) * uWaterBalance * 0.3;

      float fieldDensity = totalGlow / max(float(count), 1.0);
      finalColor += elementField * fieldDensity;

      float centerGlow = exp(-radius * 2.0) * uStillness * 0.4;
      vec3 centerColor = vec3(1.0, 0.95, 0.85);
      finalColor += centerColor * centerGlow;

      float outerRing = smoothstep(0.88, 0.9, radius) * smoothstep(0.92, 0.9, radius);
      finalColor += vec3(0.5, 0.3, 0.8) * outerRing * 0.5;

      finalColor *= uAmplitude;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uLFO: { value: 0 },
      uAmplitude: { value: 1 },
      uCoherence: { value: 0.7 },
      uStillness: { value: 0.5 },
      uParticipantCount: { value: 0 },
      uParticipantColors: { value: new Array(100).fill(new THREE.Vector3(180, 0.7, 0.5)) },
      uParticipantPositions: { value: new Array(100).fill(new THREE.Vector2(0, 0)) },
      uParticipantAmplitudes: { value: new Array(100).fill(0.7) },
      uParticipantRotations: { value: new Array(100).fill(1.0) },
      uParticipantElements: { value: new Array(100).fill(0.0) },
      uFireBalance: { value: 0.25 },
      uEarthBalance: { value: 0.25 },
      uAirBalance: { value: 0.25 },
      uWaterBalance: { value: 0.25 }
    },
    vertexShader,
    fragmentShader,
    transparent: true
  });

  engine.registerNode('primary', () => {
    const geometry = new THREE.PlaneGeometry(4, 4);
    return new THREE.Mesh(geometry, material);
  });

  engine.setParamMapper((seed, coherence, gaa, envelope) => ({
    musicalPhase: gaa.phase,
    lfoValue: gaa.lfo,
    amplitude: envelope.amplitude,
    coherenceLevel: coherence.collective,
    stillness: coherence.stillness
  }));

  engine.onFrame((deltaTime, params) => {
    material.uniforms.uTime.value += deltaTime;
    material.uniforms.uPhase.value = params.musicalPhase || 0;
    material.uniforms.uLFO.value = params.lfoValue || 0;
    material.uniforms.uAmplitude.value = params.amplitude || 1;
    material.uniforms.uCoherence.value = params.coherenceLevel || 0.7;
    material.uniforms.uStillness.value = params.stillness || 0.5;

    if (params.participants && Array.isArray(params.participants)) {
      material.uniforms.uParticipantCount.value = params.participants.length;

      let fireCount = 0, earthCount = 0, airCount = 0, waterCount = 0;

      params.participants.forEach((participant, i) => {
        if (i < 100) {
          const astro = participant.astrology;

          material.uniforms.uParticipantColors.value[i].set(
            astro ? astro.sunHue : participant.colorHue,
            astro ? participant.colorSat : 0.7,
            astro ? astro.moonLuminosity * 0.6 : 0.5
          );

          const angle = (participant.positionAngle * Math.PI) / 180;
          const radius = participant.positionRadius * 0.8;
          material.uniforms.uParticipantPositions.value[i].set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
          );

          material.uniforms.uParticipantAmplitudes.value[i] = participant.amplitude;

          if (astro) {
            material.uniforms.uParticipantRotations.value[i] = astro.risingRotation;

            const elementMap = { fire: 0.0, earth: 0.33, air: 0.66, water: 1.0 };
            material.uniforms.uParticipantElements.value[i] = elementMap[astro.element] || 0.0;

            if (astro.element === 'fire') fireCount++;
            else if (astro.element === 'earth') earthCount++;
            else if (astro.element === 'air') airCount++;
            else if (astro.element === 'water') waterCount++;
          } else {
            material.uniforms.uParticipantRotations.value[i] = 1.0;
            material.uniforms.uParticipantElements.value[i] = 0.0;
          }
        }
      });

      const total = params.participants.length;
      if (total > 0) {
        material.uniforms.uFireBalance.value = fireCount / total;
        material.uniforms.uEarthBalance.value = earthCount / total;
        material.uniforms.uAirBalance.value = airCount / total;
        material.uniforms.uWaterBalance.value = waterCount / total;
      }
    }
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2,
    maxBrightness: 0.85,
    maxSaturation: 0.9
  });
}

export function cleanup() {
  console.log('Cosmic Blueprint pack cleaned up');
}
