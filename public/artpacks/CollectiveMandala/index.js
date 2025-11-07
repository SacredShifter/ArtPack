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

    void main() {
      vec2 uv = vUv - 0.5;
      uv *= 2.0;

      float angle = atan(uv.y, uv.x);
      float radius = length(uv);

      vec3 finalColor = vec3(0.0);
      float totalGlow = 0.0;

      int count = int(min(uParticipantCount, 100.0));

      if (count == 1) {
        float pulse = sin(uTime * 2.0 + uPhase * 6.28) * 0.5 + 0.5;
        float mandala = 0.0;

        for (float i = 0.0; i < 12.0; i++) {
          float petalAngle = angle + i * 0.523598776;
          vec2 petalUv = vec2(cos(petalAngle), sin(petalAngle)) * radius;

          float petalShape = sdCircle(petalUv - vec2(0.3, 0.0), 0.2 + pulse * 0.1);
          mandala += smoothstep(0.02, 0.0, petalShape);
        }

        vec3 color = hsl2rgb(vec3(uParticipantColors[0].x / 360.0, 0.7, 0.6));
        finalColor = color * mandala * uAmplitude;

      } else if (count <= 50) {
        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          vec3 participantColor = uParticipantColors[i];
          float participantAmp = uParticipantAmplitudes[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          float glyphAngle = atan(offset.y, offset.x) + uTime * 0.2;
          float glyphRadius = dist;

          float glyph = sdHexagon(offset * 5.0, 0.3 + sin(uTime + float(i)) * 0.1);
          float glyphMask = smoothstep(0.02, 0.0, glyph);

          float pulse = sin(uTime * 2.0 + float(i) * 0.1) * 0.5 + 0.5;
          float glow = exp(-dist * 3.0) * participantAmp * pulse;

          vec3 color = hsl2rgb(vec3(participantColor.x / 360.0, 0.7 + pulse * 0.2, 0.5 + glow * 0.3));

          finalColor += (color * glyphMask + color * glow * 0.3) * participantAmp;
          totalGlow += glow;
        }

        float connectionWeb = 0.0;
        for (int i = 0; i < count - 1; i++) {
          for (int j = i + 1; j < count; j++) {
            vec2 p1 = uParticipantPositions[i];
            vec2 p2 = uParticipantPositions[j];

            float lineDist = abs(
              (p2.y - p1.y) * uv.x - (p2.x - p1.x) * uv.y + p2.x * p1.y - p2.y * p1.x
            ) / length(p2 - p1);

            float lineGlow = exp(-lineDist * 50.0) * 0.1 * uCoherence;
            connectionWeb += lineGlow;
          }
        }

        finalColor += vec3(0.5, 0.3, 0.8) * connectionWeb;

      } else {
        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          vec3 participantColor = uParticipantColors[i];
          float participantAmp = uParticipantAmplitudes[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          float point = exp(-dist * 20.0) * participantAmp;
          vec3 color = hsl2rgb(vec3(participantColor.x / 360.0, 0.8, 0.6));

          finalColor += color * point;
        }

        float fieldDensity = totalGlow / float(count);
        vec3 fieldColor = hsl2rgb(vec3(0.7, 0.6, 0.5));
        finalColor += fieldColor * fieldDensity * uCoherence;
      }

      float centerGlow = exp(-radius * 2.0) * uStillness * 0.3;
      finalColor += vec3(1.0, 0.9, 0.8) * centerGlow;

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
      uParticipantAmplitudes: { value: new Array(100).fill(0.7) }
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

      params.participants.forEach((participant, i) => {
        if (i < 100) {
          material.uniforms.uParticipantColors.value[i].set(
            participant.colorHue,
            participant.colorSat,
            participant.colorLight
          );

          const angle = (participant.positionAngle * Math.PI) / 180;
          const radius = participant.positionRadius * 0.8;
          material.uniforms.uParticipantPositions.value[i].set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
          );

          material.uniforms.uParticipantAmplitudes.value[i] = participant.amplitude;
        }
      });
    }
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2,
    maxBrightness: 0.8,
    maxSaturation: 0.85
  });
}

export function cleanup() {
  console.log('Collective Mandala pack cleaned up');
}
