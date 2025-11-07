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
    uniform float uParticipantJoinTimes[100];

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

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      uv *= 2.0;

      float angle = atan(uv.y, uv.x);
      float radius = length(uv);

      vec3 finalColor = vec3(0.0);
      vec3 collectiveField = vec3(0.0);
      float totalGlow = 0.0;

      int count = int(min(uParticipantCount, 100.0));

      // INDIVIDUAL MODE: Full mandala for one person
      if (count == 1) {
        float pulse = sin(uTime * 2.0 + uPhase * 6.28) * 0.5 + 0.5;
        float breathe = sin(uTime * 0.5) * 0.5 + 0.5;
        float mandala = 0.0;

        // 12-petal sacred geometry
        for (float i = 0.0; i < 12.0; i++) {
          float petalAngle = angle + i * 0.523598776;
          vec2 petalUv = vec2(cos(petalAngle), sin(petalAngle)) * radius;

          float petalShape = sdCircle(petalUv - vec2(0.3, 0.0), 0.2 + pulse * 0.1 + breathe * 0.05);
          float petalGlow = exp(-abs(petalShape) * 8.0);
          mandala += smoothstep(0.02, 0.0, petalShape) + petalGlow * 0.3;
        }

        vec3 color = hsl2rgb(vec3(uParticipantColors[0].x / 360.0, 0.8, 0.6));
        finalColor = color * mandala * uAmplitude;

        // Add sacred center
        float centerDist = length(uv);
        float centerGlow = exp(-centerDist * 4.0) * (0.5 + pulse * 0.5);
        finalColor += vec3(1.0, 0.95, 0.9) * centerGlow * 0.5;

      // SMALL GROUP MODE: Each person gets a unique glyph with strong presence
      } else if (count <= 50) {

        // First pass: Individual signatures - MAKE THEM BOLD
        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          vec3 participantColor = uParticipantColors[i];
          float participantAmp = uParticipantAmplitudes[i];
          float joinTime = uParticipantJoinTimes[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          // Unique rotation for each person based on their signature
          float personalSpin = uTime * 0.3 + float(i) * 0.5;
          float glyphAngle = atan(offset.y, offset.x);

          // Rotate glyph around its center
          float c = cos(-personalSpin);
          float s = sin(-personalSpin);
          vec2 rotatedOffset = vec2(
            offset.x * c - offset.y * s,
            offset.x * s + offset.y * c
          );

          // HEXAGONAL GLYPH - their personal geometric signature
          float glyph = sdHexagon(rotatedOffset * 5.0, 0.35 + sin(uTime + float(i)) * 0.08);
          float glyphMask = smoothstep(0.03, 0.0, glyph);

          // Strong edge glow to make signature pop
          float glyphEdge = smoothstep(0.06, 0.03, abs(glyph));

          // Personal energy pulse - breathing with their own rhythm
          float pulse = sin(uTime * 1.5 + float(i) * 0.618) * 0.5 + 0.5;

          // Energy field around each person - THIS MAKES THEM VISIBLE
          float energyField = exp(-dist * 2.5) * participantAmp * (0.7 + pulse * 0.3);

          // Ripple effect for newly joined (first 5 seconds)
          float newness = max(0.0, 1.0 - joinTime / 5.0);
          float ripple = sin(dist * 15.0 - uTime * 3.0) * newness * 0.5;
          energyField += max(0.0, ripple);

          // Convert HSL to RGB with dynamic saturation based on activity
          vec3 color = hsl2rgb(vec3(
            participantColor.x / 360.0,
            0.75 + pulse * 0.15,
            0.55 + energyField * 0.2
          ));

          // COMBINE: solid glyph + bright edge + energy field
          vec3 participantContribution = color * (
            glyphMask * 1.2 +              // Solid presence
            glyphEdge * 0.8 +              // Defined border
            energyField * 0.6              // Radiating energy
          ) * participantAmp;

          finalColor += participantContribution;

          // Track for collective field
          collectiveField += color * energyField * 0.3;
          totalGlow += energyField;
        }

        // CONNECTION WEB - shows relationships between people
        float connectionWeb = 0.0;
        for (int i = 0; i < count - 1; i++) {
          for (int j = i + 1; j < count; j++) {
            vec2 p1 = uParticipantPositions[i];
            vec2 p2 = uParticipantPositions[j];
            float dist12 = length(p2 - p1);

            // Only connect nearby participants
            if (dist12 < 0.6) {
              // Distance from point to line segment
              float lineDist = abs(
                (p2.y - p1.y) * uv.x - (p2.x - p1.x) * uv.y + p2.x * p1.y - p2.y * p1.x
              ) / length(p2 - p1);

              // Pulsing connection based on coherence
              float pulse = sin(uTime * 2.0 + float(i) * 0.1 + float(j) * 0.1) * 0.5 + 0.5;
              float lineGlow = exp(-lineDist * 80.0) * 0.15 * uCoherence * (0.5 + pulse * 0.5);

              // Energy flowing along connection
              float flow = sin(uTime * 3.0 + dist12 * 10.0);
              connectionWeb += lineGlow * (1.0 + flow * 0.3);
            }
          }
        }

        // Add connection web with collective color
        vec3 webColor = hsl2rgb(vec3(0.75, 0.6, 0.5));
        finalColor += webColor * connectionWeb;

        // Collective field glow in background
        finalColor += collectiveField * uCoherence * 0.4;

      // LARGE GROUP MODE: Luminous points with visible energy contributions
      } else {

        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          vec3 participantColor = uParticipantColors[i];
          float participantAmp = uParticipantAmplitudes[i];
          float joinTime = uParticipantJoinTimes[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          // Each person is a bright point with radiating energy
          float pulse = sin(uTime * 2.0 + float(i) * 0.1) * 0.5 + 0.5;
          float point = exp(-dist * 25.0) * participantAmp * (0.8 + pulse * 0.2);

          // Larger energy field - their contribution to the whole
          float field = exp(-dist * 5.0) * participantAmp * 0.5;

          // Ripple for new joins
          float newness = max(0.0, 1.0 - joinTime / 5.0);
          float ripple = sin(dist * 20.0 - uTime * 4.0) * newness * 0.3;

          vec3 color = hsl2rgb(vec3(
            participantColor.x / 360.0,
            0.85,
            0.6 + point * 0.3
          ));

          finalColor += color * (point + field + max(0.0, ripple));
          collectiveField += color * field * 0.3;
        }

        // COLLECTIVE FIELD - the emergent whole
        float fieldDensity = totalGlow / max(1.0, float(count));
        float fieldPattern = sin(radius * 10.0 + uTime) * sin(angle * 5.0 + uTime * 0.5);

        // Dominant collective color with dynamic patterns
        vec3 fieldColor = hsl2rgb(vec3(0.7, 0.6 + fieldPattern * 0.2, 0.5));
        finalColor += (collectiveField + fieldColor * fieldDensity * 0.3) * uCoherence;
      }

      // SACRED CENTER - the still point we all share
      float centerGlow = exp(-radius * 2.0) * uStillness * 0.4;
      float centerPulse = sin(uTime * 0.5) * 0.5 + 0.5;
      finalColor += vec3(1.0, 0.95, 0.85) * centerGlow * (0.5 + centerPulse * 0.5);

      // Outer field ambient glow - shows total collective energy
      float ambientField = exp(-radius * 0.5) * (totalGlow / max(1.0, uParticipantCount)) * 0.2;
      finalColor += vec3(0.6, 0.5, 0.8) * ambientField;

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
      uParticipantJoinTimes: { value: new Array(100).fill(999) }
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

  const startTime = performance.now();
  const participantJoinTimes = new Map();

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
          // Track when each participant joined for ripple effect
          if (!participantJoinTimes.has(participant.id)) {
            participantJoinTimes.set(participant.id, performance.now());
          }
          const joinTime = (performance.now() - participantJoinTimes.get(participant.id)) / 1000;

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
          material.uniforms.uParticipantJoinTimes.value[i] = joinTime;
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
