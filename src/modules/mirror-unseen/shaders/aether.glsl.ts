export const aetherShader = `
// Fractal Brownian Motion for depth/possibility texture
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < octaves; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

// Aether background - shifts with uncertainty
vec3 aetherBackground(vec2 uv, float time, float uncertainty, float collectivePotential) {
  float scale = 8.0 + 6.0 * uncertainty;

  float grain = fbm(uv * scale + vec2(time * 0.1, 0.0), 6);

  float amplitude = 0.15 * uncertainty;
  grain = grain * amplitude;

  vec3 baseColor = vec3(0.02, 0.03, 0.05);

  float potential = collectivePotential * 0.3;
  vec3 potentialColor = vec3(0.1, 0.08, 0.15) * potential;

  return baseColor + vec3(grain) + potentialColor;
}

// Curl noise for silence mass warping
vec2 curl(vec2 p, float strength) {
  float eps = 0.01;

  float n1 = noise(p + vec2(eps, 0.0));
  float n2 = noise(p - vec2(eps, 0.0));
  float n3 = noise(p + vec2(0.0, eps));
  float n4 = noise(p - vec2(0.0, eps));

  float dx = (n3 - n4) / (2.0 * eps);
  float dy = -(n1 - n2) / (2.0 * eps);

  return vec2(dx, dy) * strength;
}

// Silence mass warp field
vec2 silenceWarp(vec2 uv, vec2 center, float silenceSec, float maxSeconds) {
  float dist = length(uv - center);

  float silenceAmount = min(silenceSec / maxSeconds, 1.0);

  float warpStrength = 0.5 + 0.5 * silenceAmount;

  vec2 curlOffset = curl(uv * 5.0, warpStrength);

  float falloff = exp(-dist * (3.0 - silenceAmount * 2.0));

  return curlOffset * falloff * 0.02;
}

// Vesica Piscis pattern for collective potential
float vesicaPiscis(vec2 uv, float time) {
  vec2 c1 = vec2(-0.3, 0.0);
  vec2 c2 = vec2(0.3, 0.0);

  float r = 0.5;

  float d1 = length(uv - c1) - r;
  float d2 = length(uv - c2) - r;

  float vesica = max(d1, d2);

  float pulse = sin(time * 2.0) * 0.5 + 0.5;

  return smoothstep(0.02, 0.0, vesica) * pulse;
}

// Interference pattern for collective field
float interferencePattern(vec2 uv, float time, float potential) {
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);

  float pattern = sin(radius * 10.0 + time) * sin(angle * 5.0 + time * 0.5);

  float contrast = potential * 0.5;

  return pattern * contrast;
}
`;
