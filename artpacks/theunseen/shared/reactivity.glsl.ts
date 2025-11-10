export const reactivityGLSL = `
// ============================================================================
// REACTIVITY UTILITIES - The Unseen Series
// Precise mapping formulas for consciousness metrics
// ============================================================================

// Coherence → Clarity mapping
float coherenceToClarity(float coherence, float threshold) {
  return smoothstep(threshold, 0.85, coherence);
}

// Coherence → Pattern visibility
float coherenceToVisibility(float coherence) {
  return smoothstep(0.2, 0.85, coherence);
}

// Coherence → Geometric snap strength
float coherenceToSnapStrength(float coherence) {
  return coherence;
}

// Stillness → Motion speed modulation
float stillnessToMotionSpeed(float stillness) {
  return mix(1.0, 0.1, stillness);
}

// Stillness → Particle drift reduction
float stillnessToParticleDrift(float stillness) {
  return mix(0.02, 0.0, stillness);
}

// Stillness → Structural stability
float stillnessToStability(float stillness) {
  return smoothstep(0.3, 0.9, stillness);
}

// Gain → Energy/intensity boost
float gainToIntensity(float gain, float baseIntensity) {
  return baseIntensity * (1.0 + gain * 2.0);
}

// Gain → Brightness boost (gamma-corrected)
float gainToBrightness(float gain) {
  return pow(gain, 2.2);
}

// Gain → Pulse speed
float gainToPulseSpeed(float gain) {
  return 1.0 + gain * 3.0;
}

// Breath phase → Wave amplitude
float breathToWaveAmplitude(float breathPhase, float baseAmplitude) {
  return sin(breathPhase) * baseAmplitude;
}

// Breath phase → Expansion/contraction
float breathToScale(float breathPhase, float range) {
  return 1.0 + sin(breathPhase) * range;
}

// Breath phase → Organic pulsing
float breathToPulse(float breathPhase) {
  return sin(breathPhase) * 0.5 + 0.5;
}

// Combined coherence + stillness → Revelation
float revelationFactor(float coherence, float stillness) {
  return coherence * stillness;
}

// Combined metrics → Layer opacity
float layerOpacity(float coherence, float stillness, float minOpacity, float maxOpacity) {
  float factor = revelationFactor(coherence, stillness);
  return mix(minOpacity, maxOpacity, factor);
}

// Threshold-based unlock
float unlockThreshold(float metric, float threshold, float smoothness) {
  return smoothstep(threshold - smoothness, threshold + smoothness, metric);
}

// Progressive intensity based on collective presence
float collectiveIntensity(float individualCoherence, float collectiveCoherence, float groupSize) {
  float groupBoost = min(groupSize * 0.01, 0.3);
  return mix(individualCoherence, collectiveCoherence, 0.5) + groupBoost;
}

// Safety-capped brightness
float safeBrightness(float brightness, float maxBrightness) {
  return min(brightness, maxBrightness);
}

// Safety-capped saturation
float safeSaturation(float saturation, float maxSaturation) {
  return min(saturation, maxSaturation);
}

// Low sensory mode dampening
vec3 lowSensoryMode(vec3 color, bool enabled, float dampFactor) {
  if(enabled) {
    return color * dampFactor;
  }
  return color;
}

// Smooth metric interpolation (prevents jarring changes)
float smoothMetric(float current, float target, float smoothing) {
  return mix(current, target, smoothing);
}

// Exponential ease for reveals
float exponentialEase(float t, float power) {
  return pow(t, power);
}

// Circular ease for breath
float circularEase(float t) {
  return 1.0 - sqrt(1.0 - t * t);
}

// Sigmoid activation (neural-inspired)
float sigmoid(float x, float steepness) {
  return 1.0 / (1.0 + exp(-steepness * x));
}

// Hysteresis (prevents flickering near thresholds)
float hysteresis(float value, float lowThreshold, float highThreshold, float previousState) {
  if(previousState < 0.5) {
    return value > highThreshold ? 1.0 : 0.0;
  } else {
    return value < lowThreshold ? 0.0 : 1.0;
  }
}
`;
