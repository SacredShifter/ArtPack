export function register(engine) {
  const THREE = engine.getThree();

  const fragmentShader = `
    uniform float uTime;
    uniform float uPhase;
    uniform float uLFO;
    uniform float uAmplitude;
    uniform float uCoherence;
    uniform float uStillness;
    uniform float uParticipantCount;

    // Cosmic signature data for each participant
    uniform vec3 uParticipantColors[100];
    uniform vec2 uParticipantPositions[100];
    uniform float uParticipantAmplitudes[100];
    uniform float uParticipantJoinTimes[100];

    // NEW: Astrological & Cosmic data
    uniform float uSunHues[100];
    uniform float uMoonLuminosities[100];
    uniform float uRisingRotations[100];
    uniform float uElementIntensities[100];
    uniform float uLocationResonances[100];
    uniform float uTransitIntensities[100];
    uniform float uGAAAlignments[100];
    uniform float uMultidimensionalDepths[100];

    // NEW: Planetary influence uniforms
    uniform float uCurrentSunDegree;
    uniform float uCurrentMoonDegree;
    uniform float uMoonPhase;
    uniform float uCollectiveDepth;

    // NEW: Synastry connections (participant pairs with compatibility)
    uniform vec2 uSynastryPairs[200];
    uniform float uSynastryStrengths[200];
    uniform vec3 uSynastryColors[200];
    uniform float uSynastryCount;

    varying vec2 vUv;

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

    // Sacred geometry: Flower of Life pattern
    float flowerOfLife(vec2 uv, float scale) {
      float pattern = 1.0;
      for (float i = 0.0; i < 6.0; i++) {
        float angle = i * 1.047197551;
        vec2 center = vec2(cos(angle), sin(angle)) * scale;
        float circle = length(uv - center) - scale;
        pattern = min(pattern, abs(circle));
      }
      return pattern;
    }

    // Vesica Piscis for synastry connections
    float vesicaPiscis(vec2 uv, vec2 p1, vec2 p2, float r) {
      float d1 = length(uv - p1) - r;
      float d2 = length(uv - p2) - r;
      return max(d1, d2);
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

      // COSMIC BACKGROUND: Planetary transit overlay
      float transitLayer = 0.0;
      float sunAngle = (uCurrentSunDegree / 360.0) * 6.28318;
      float moonAngle = (uCurrentMoonDegree / 360.0) * 6.28318;

      // Sun transit ring
      float sunRing = abs(radius - 0.9) - 0.02;
      float sunHighlight = smoothstep(0.05, 0.0, abs(angle - sunAngle));
      transitLayer += exp(-sunRing * 50.0) * sunHighlight * 0.3;

      // Moon phase visualization in background
      float moonGlow = exp(-length(uv - vec2(cos(moonAngle), sin(moonAngle)) * 0.95) * 10.0);
      transitLayer += moonGlow * uMoonPhase * 0.4;

      vec3 transitColor = hsl2rgb(vec3(0.15, 0.6, 0.5));
      finalColor += transitColor * transitLayer;

      // SYNASTRY WEB: Deep connections between compatible souls
      int synCount = int(min(uSynastryCount, 200.0));
      for (int s = 0; s < synCount; s++) {
        vec2 pair = uSynastryPairs[s];
        int i = int(pair.x);
        int j = int(pair.y);

        if (i >= 0 && j >= 0 && i < count && j < count) {
          vec2 p1 = uParticipantPositions[i];
          vec2 p2 = uParticipantPositions[j];
          float strength = uSynastryStrengths[s];
          vec3 synColor = uSynastryColors[s];

          // Draw connection line with vesica piscis sacred geometry
          float lineDist = abs(
            (p2.y - p1.y) * uv.x - (p2.x - p1.x) * uv.y + p2.x * p1.y - p2.y * p1.x
          ) / length(p2 - p1);

          float connectionDist = length(p2 - p1);

          // Only draw if participants are within connection range
          if (connectionDist < 1.5) {
            // Pulsing energy flow along connection
            float flowPhase = uTime * 2.0 + float(s) * 0.5;
            float flow = sin(flowPhase + length(uv - p1) * 5.0) * 0.5 + 0.5;

            float lineGlow = exp(-lineDist * 60.0) * strength * flow * 0.25;

            // Vesica piscis at midpoint for high compatibility
            if (strength > 0.7) {
              vec2 midpoint = (p1 + p2) * 0.5;
              float vesica = vesicaPiscis(uv, p1, p2, connectionDist * 0.3);
              float vesicaGlow = smoothstep(0.05, 0.0, vesica) * 0.2;
              lineGlow += vesicaGlow * sin(uTime * 1.5 + float(s));
            }

            finalColor += synColor * lineGlow;
          }
        }
      }

      // INDIVIDUAL MODE: Full cosmic mandala
      if (count == 1) {
        float pulse = sin(uTime * 2.0 + uPhase * 6.28) * 0.5 + 0.5;
        float breathe = sin(uTime * 0.5) * 0.5 + 0.5;

        // Flower of Life sacred geometry base
        float flowerPattern = flowerOfLife(uv, 0.25);
        float flowerGlow = exp(-flowerPattern * 15.0) * 0.4;
        finalColor += vec3(1.0, 0.95, 0.9) * flowerGlow * (0.5 + pulse * 0.5);

        // 12-petal mandala with astrological house influence
        float mandala = 0.0;
        for (float i = 0.0; i < 12.0; i++) {
          float petalAngle = angle + i * 0.523598776;
          vec2 petalUv = vec2(cos(petalAngle), sin(petalAngle)) * radius;

          // Petal size modulated by house strength
          float houseModulation = sin(i * 0.5 + uPhase * 6.28) * 0.05;
          float petalShape = sdCircle(petalUv - vec2(0.3, 0.0), 0.2 + pulse * 0.1 + houseModulation);
          float petalGlow = exp(-abs(petalShape) * 8.0);
          mandala += smoothstep(0.02, 0.0, petalShape) + petalGlow * 0.3;
        }

        // Color from Sun sign, luminosity from Moon, rotation from Rising
        vec3 cosmicColor = hsl2rgb(vec3(
          uSunHues[0] / 360.0,
          0.8,
          0.5 + uMoonLuminosities[0] * 0.3
        ));

        finalColor += cosmicColor * mandala * uAmplitude;

        // Multidimensional depth ring
        float depthRing = abs(radius - 0.7) - 0.02;
        float depthGlow = exp(-depthRing * 30.0) * uMultidimensionalDepths[0];
        finalColor += vec3(0.8, 0.6, 1.0) * depthGlow * (0.5 + breathe * 0.5);

      // SMALL GROUP MODE: Cosmic signatures with full astrological encoding
      } else if (count <= 50) {

        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          vec3 participantColor = uParticipantColors[i];
          float participantAmp = uParticipantAmplitudes[i];
          float joinTime = uParticipantJoinTimes[i];

          // Astrological modulation
          float sunHue = uSunHues[i];
          float moonLum = uMoonLuminosities[i];
          float risingRotation = uRisingRotations[i];
          float elementIntensity = uElementIntensities[i];
          float locationResonance = uLocationResonances[i];
          float transitIntensity = uTransitIntensities[i];
          float gaaAlignment = uGAAAlignments[i];
          float dimensionalDepth = uMultidimensionalDepths[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          // Rotation speed from Rising sign modality
          float personalSpin = uTime * risingRotation * 0.3 + float(i) * 0.5;
          float c = cos(-personalSpin);
          float s = sin(-personalSpin);
          vec2 rotatedOffset = vec2(
            offset.x * c - offset.y * s,
            offset.x * s + offset.y * c
          );

          // HEXAGONAL GLYPH with element intensity affecting size
          float glyphSize = 0.35 + elementIntensity * 0.15;
          float glyph = sdHexagon(rotatedOffset * 5.0, glyphSize + sin(uTime + float(i)) * 0.08);
          float glyphMask = smoothstep(0.03, 0.0, glyph);
          float glyphEdge = smoothstep(0.06, 0.03, abs(glyph));

          // Personal pulse synced to GAA alignment
          float pulse = sin(uTime * 1.5 * gaaAlignment + float(i) * 0.618) * 0.5 + 0.5;

          // Energy field modulated by transit intensity and location resonance
          float energyField = exp(-dist * (2.5 + transitIntensity)) * participantAmp *
                              (0.7 + pulse * 0.3) * locationResonance;

          // Ripple effect for newly joined (first 5 seconds)
          float newness = max(0.0, 1.0 - joinTime / 5.0);
          float ripple = sin(dist * 15.0 - uTime * 3.0) * newness * 0.5;
          energyField += max(0.0, ripple);

          // Color from Sun sign, modulated by Moon luminosity
          vec3 color = hsl2rgb(vec3(
            sunHue / 360.0,
            0.75 + pulse * 0.15,
            0.4 + moonLum * 0.4 + energyField * 0.2
          ));

          // Multidimensional depth aura
          float depthAura = exp(-dist * 1.5) * dimensionalDepth * 0.3;
          vec3 depthColor = hsl2rgb(vec3((sunHue + 180.0) / 360.0, 0.6, 0.5));

          // COMBINE: solid glyph + edge + energy + depth
          vec3 participantContribution =
            color * (glyphMask * 1.2 + glyphEdge * 0.8 + energyField * 0.6) * participantAmp +
            depthColor * depthAura;

          finalColor += participantContribution;

          collectiveField += color * energyField * 0.3 * locationResonance;
          totalGlow += energyField;
        }

        // Collective field glow in background
        finalColor += collectiveField * uCoherence * 0.4;

      // LARGE GROUP MODE: Cosmic field with visible individual contributions
      } else {

        for (int i = 0; i < count; i++) {
          vec2 participantPos = uParticipantPositions[i];
          float participantAmp = uParticipantAmplitudes[i];
          float sunHue = uSunHues[i];
          float moonLum = uMoonLuminosities[i];
          float locationResonance = uLocationResonances[i];
          float dimensionalDepth = uMultidimensionalDepths[i];

          vec2 offset = uv - participantPos;
          float dist = length(offset);

          // Bright point with cosmic signature
          float pulse = sin(uTime * 2.0 + float(i) * 0.1) * 0.5 + 0.5;
          float point = exp(-dist * 25.0) * participantAmp * (0.8 + pulse * 0.2);

          // Energy field with location resonance
          float field = exp(-dist * 5.0) * participantAmp * locationResonance * 0.5;

          // Depth halo
          float depthHalo = exp(-dist * 3.0) * dimensionalDepth * 0.2;

          vec3 color = hsl2rgb(vec3(
            sunHue / 360.0,
            0.85,
            0.5 + moonLum * 0.3 + point * 0.2
          ));

          finalColor += color * (point + field + depthHalo);
          collectiveField += color * field * 0.3;
        }

        // EMERGENT COLLECTIVE FIELD with multidimensional depth
        float fieldDensity = totalGlow / max(1.0, float(count));
        float fieldPattern = sin(radius * 10.0 + uTime) * sin(angle * 5.0 + uTime * 0.5);

        vec3 fieldColor = hsl2rgb(vec3(0.7, 0.6 + fieldPattern * 0.2, 0.5));
        finalColor += (collectiveField + fieldColor * fieldDensity * 0.3) * uCoherence * uCollectiveDepth;
      }

      // SACRED CENTER with lunar phase influence
      float centerGlow = exp(-radius * 2.0) * uStillness * 0.4;
      float centerPulse = sin(uTime * 0.5) * 0.5 + 0.5;
      float lunarModulation = 0.5 + uMoonPhase * 0.5;
      finalColor += vec3(1.0, 0.95, 0.85) * centerGlow * (0.5 + centerPulse * 0.5) * lunarModulation;

      // Outer cosmic field ambient with collective depth
      float ambientField = exp(-radius * 0.5) * (totalGlow / max(1.0, uParticipantCount)) * 0.2 * uCollectiveDepth;
      finalColor += vec3(0.6, 0.5, 0.8) * ambientField;

      finalColor *= uAmplitude;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
      uParticipantJoinTimes: { value: new Array(100).fill(999) },

      uSunHues: { value: new Array(100).fill(180) },
      uMoonLuminosities: { value: new Array(100).fill(0.6) },
      uRisingRotations: { value: new Array(100).fill(1.0) },
      uElementIntensities: { value: new Array(100).fill(0.5) },
      uLocationResonances: { value: new Array(100).fill(0.7) },
      uTransitIntensities: { value: new Array(100).fill(0.5) },
      uGAAAlignments: { value: new Array(100).fill(1.0) },
      uMultidimensionalDepths: { value: new Array(100).fill(0.5) },

      uCurrentSunDegree: { value: 0 },
      uCurrentMoonDegree: { value: 0 },
      uMoonPhase: { value: 0.5 },
      uCollectiveDepth: { value: 0.5 },

      uSynastryPairs: { value: new Array(200).fill(new THREE.Vector2(-1, -1)) },
      uSynastryStrengths: { value: new Array(200).fill(0) },
      uSynastryColors: { value: new Array(200).fill(new THREE.Vector3(0.5, 0.5, 0.5)) },
      uSynastryCount: { value: 0 }
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
    stillness: coherence.stillness,
    regionSeed: seed
  }));

  const participantJoinTimes = new Map();

  engine.onFrame((deltaTime, params) => {
    material.uniforms.uTime.value += deltaTime;
    material.uniforms.uPhase.value = params.musicalPhase || 0;
    material.uniforms.uLFO.value = params.lfoValue || 0;
    material.uniforms.uAmplitude.value = params.amplitude || 1;
    material.uniforms.uCoherence.value = params.coherenceLevel || 0.7;
    material.uniforms.uStillness.value = params.stillness || 0.5;

    if (params.participants && Array.isArray(params.participants)) {
      const participants = params.participants;
      material.uniforms.uParticipantCount.value = participants.length;

      participants.forEach((participant, i) => {
        if (i < 100) {
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

          // COSMIC DATA if available
          if (participant.cosmic) {
            material.uniforms.uLocationResonances.value[i] = participant.cosmic.locationResonance || 0.7;
            material.uniforms.uTransitIntensities.value[i] = participant.cosmic.transitInfluence?.intensity || 0.5;
            material.uniforms.uGAAAlignments.value[i] = participant.cosmic.gaaAlignment?.phaseSync || 1.0;
            material.uniforms.uMultidimensionalDepths.value[i] = participant.cosmic.multidimensionalDepth || 0.5;

            if (participant.cosmic.currentTransits) {
              material.uniforms.uCurrentSunDegree.value = participant.cosmic.currentTransits.sunDegree;
              material.uniforms.uCurrentMoonDegree.value = participant.cosmic.currentTransits.moonDegree;
              material.uniforms.uMoonPhase.value = participant.cosmic.currentTransits.moonPhase;
            }
          }

          // ASTROLOGICAL DATA if available
          if (participant.astrology) {
            material.uniforms.uSunHues.value[i] = participant.astrology.sunHue || 180;
            material.uniforms.uMoonLuminosities.value[i] = participant.astrology.moonLuminosity || 0.6;
            material.uniforms.uRisingRotations.value[i] = participant.astrology.risingRotation || 1.0;
            material.uniforms.uElementIntensities.value[i] = participant.astrology.elementIntensity || 0.5;
          }
        }
      });

      // SYNASTRY CONNECTIONS
      let synergyIndex = 0;
      participants.forEach((p1, i) => {
        if (p1.synastry && i < 100) {
          p1.synastry.forEach((connection, otherId) => {
            const j = participants.findIndex(p => p.id === otherId);
            if (j >= 0 && j < 100 && synergyIndex < 200) {
              material.uniforms.uSynastryPairs.value[synergyIndex].set(i, j);
              material.uniforms.uSynastryStrengths.value[synergyIndex] = connection.visualIntensity;

              if (connection.aspectColors && connection.aspectColors.length > 0) {
                const color = connection.aspectColors[0];
                material.uniforms.uSynastryColors.value[synergyIndex].set(color[0], color[1], color[2]);
              }

              synergyIndex++;
            }
          });
        }
      });
      material.uniforms.uSynastryCount.value = synergyIndex;

      // COLLECTIVE COSMIC FIELD if available
      if (params.collectiveCosmicField) {
        material.uniforms.uCollectiveDepth.value = params.collectiveCosmicField.collectiveDepth || 0.5;
      }
    }
  });

  engine.defineSafetyCaps({
    maxStrobeHz: 2,
    maxBrightness: 0.8,
    maxSaturation: 0.85
  });
}

export function cleanup() {
  console.log('Cosmic Mandala pack cleaned up');
}
