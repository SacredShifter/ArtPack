export const flowGLSL = `
// ============================================================================
// FLOW FIELD UTILITIES - The Unseen Series
// ============================================================================

// Curl noise for organic flow fields
vec2 curl(vec2 p, float time) {
  float eps = 0.01;

  float n1 = snoise(p + vec2(eps, 0.0) + time * 0.1);
  float n2 = snoise(p - vec2(eps, 0.0) + time * 0.1);
  float n3 = snoise(p + vec2(0.0, eps) + time * 0.1);
  float n4 = snoise(p - vec2(0.0, eps) + time * 0.1);

  float dx = (n1 - n2) / (2.0 * eps);
  float dy = (n3 - n4) / (2.0 * eps);

  return vec2(dy, -dx);
}

// Vortex field (circular flow)
vec2 vortex(vec2 p, vec2 center, float strength) {
  vec2 dir = p - center;
  float dist = length(dir);
  float angle = atan(dir.y, dir.x);

  float vortexStrength = strength / (dist + 0.1);
  return vec2(
    -sin(angle) * vortexStrength,
    cos(angle) * vortexStrength
  );
}

// Radial flow (expansion/contraction)
vec2 radialFlow(vec2 p, vec2 center, float strength, float phase) {
  vec2 dir = normalize(p - center);
  float dist = length(p - center);
  float pulse = sin(phase + dist * 3.0) * 0.5 + 0.5;

  return dir * strength * pulse;
}

// Directional drift (like wind)
vec2 drift(vec2 p, float time, vec2 direction, float speed) {
  float noise = snoise(p * 0.5 + time * speed);
  return direction * (noise * 0.5 + 0.5);
}

// Breathing flow field (expansion and contraction)
vec2 breathingField(vec2 p, vec2 center, float breathPhase, float amplitude) {
  vec2 dir = p - center;
  float dist = length(dir);

  float breath = sin(breathPhase) * amplitude;
  float scale = 1.0 + breath * (1.0 / (dist + 0.5));

  return dir * breath * scale;
}

// Wave propagation flow
vec2 wavePropagation(vec2 p, float time, float frequency, float amplitude) {
  float wave1 = sin(p.x * frequency + time * 2.0);
  float wave2 = cos(p.y * frequency + time * 1.5);

  return vec2(wave2, wave1) * amplitude;
}

// Divergence field (sources and sinks)
float divergence(vec2 p, vec2 flowField) {
  float eps = 0.01;

  vec2 fx1 = curl(p + vec2(eps, 0.0), 0.0);
  vec2 fx2 = curl(p - vec2(eps, 0.0), 0.0);
  vec2 fy1 = curl(p + vec2(0.0, eps), 0.0);
  vec2 fy2 = curl(p - vec2(0.0, eps), 0.0);

  float dx = (fx1.x - fx2.x) / (2.0 * eps);
  float dy = (fy1.y - fy2.y) / (2.0 * eps);

  return dx + dy;
}

// Particle advection along flow field
vec2 advect(vec2 position, vec2 flowField, float deltaTime, float damping) {
  return position + flowField * deltaTime * damping;
}

// Layered flow (multiple octaves)
vec2 layeredFlow(vec2 p, float time, int octaves) {
  vec2 flow = vec2(0.0);
  float amplitude = 1.0;
  float frequency = 1.0;

  for(int i = 0; i < octaves; i++) {
    flow += curl(p * frequency, time * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return flow;
}
`;
