export const geometryGLSL = `
// ============================================================================
// SACRED GEOMETRY UTILITIES - The Unseen Series
// ============================================================================

#define PI 3.14159265359
#define TAU 6.28318530718
#define PHI 1.618033988749

// Distance to line segment
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Distance to circle
float sdCircle(vec2 p, vec2 center, float radius) {
  return length(p - center) - radius;
}

// Flower of Life - single circle in hexagonal pattern
float flowerOfLifeCircle(vec2 p, vec2 center, float radius, float thickness) {
  float d = abs(sdCircle(p, center, radius)) - thickness;
  return smoothstep(0.01, 0.0, d);
}

// Full Flower of Life pattern (7 circles)
float flowerOfLife(vec2 p, vec2 center, float radius, float thickness) {
  float pattern = 0.0;

  // Center circle
  pattern += flowerOfLifeCircle(p, center, radius, thickness);

  // Six surrounding circles in hexagonal pattern
  for(int i = 0; i < 6; i++) {
    float angle = float(i) * TAU / 6.0;
    vec2 offset = vec2(cos(angle), sin(angle)) * radius;
    pattern += flowerOfLifeCircle(p, center + offset, radius, thickness);
  }

  return clamp(pattern, 0.0, 1.0);
}

// Metatron's Cube (extended Flower of Life)
float metatronsCube(vec2 p, vec2 center, float radius) {
  float pattern = 0.0;

  // Inner hexagon vertices
  vec2 vertices[6];
  for(int i = 0; i < 6; i++) {
    float angle = float(i) * TAU / 6.0;
    vertices[i] = center + vec2(cos(angle), sin(angle)) * radius;
  }

  // Connect all vertices with lines
  for(int i = 0; i < 6; i++) {
    for(int j = i + 1; j < 6; j++) {
      float line = sdSegment(p, vertices[i], vertices[j]);
      pattern += smoothstep(0.01, 0.0, line - 0.005);
    }
  }

  return clamp(pattern, 0.0, 1.0);
}

// Golden spiral
float goldenSpiral(vec2 p, vec2 center, float time, float scale) {
  vec2 rel = p - center;
  float angle = atan(rel.y, rel.x);
  float dist = length(rel);

  float spiral = mod(angle + log(dist / scale) / log(PHI) + time, TAU);
  return smoothstep(0.2, 0.0, abs(spiral - PI));
}

// Platonic solid projection - Tetrahedron
float tetrahedron(vec2 p, vec2 center, float size, float rotation) {
  float pattern = 0.0;

  vec2 vertices[3];
  for(int i = 0; i < 3; i++) {
    float angle = rotation + float(i) * TAU / 3.0;
    vertices[i] = center + vec2(cos(angle), sin(angle)) * size;
  }

  for(int i = 0; i < 3; i++) {
    int next = (i + 1) % 3;
    float line = sdSegment(p, vertices[i], vertices[next]);
    pattern += smoothstep(0.015, 0.0, line - 0.003);
  }

  return clamp(pattern, 0.0, 1.0);
}

// Hexagonal lattice
float hexLattice(vec2 p, float scale) {
  vec2 q = vec2(p.x * 1.1547, p.y + p.x * 0.5773);
  vec2 pi = floor(q);
  vec2 pf = fract(q);

  float v = mod(pi.x + pi.y, 3.0);

  float ca = step(1.0, v);
  float cb = step(2.0, v);
  vec2 ma = step(pf.xy, pf.yx);

  return dot(ma, 1.0 - pf.yx + ca * (pf.x + pf.y - 1.0) + cb * (pf.yx - 2.0 * pf.xy));
}

// Sri Yantra inspired - nested triangles
float sriYantra(vec2 p, vec2 center, float size, float layers) {
  float pattern = 0.0;

  for(float i = 0.0; i < layers; i++) {
    float scale = size * (1.0 - i / layers);
    float rotation = i * PI / layers;

    // Upward triangle
    pattern += tetrahedron(p, center, scale, rotation);

    // Downward triangle
    pattern += tetrahedron(p, center, scale, rotation + PI);
  }

  return clamp(pattern, 0.0, 1.0);
}

// Vesica Piscis (intersection of two circles)
float vesicaPiscis(vec2 p, vec2 center, float radius, float separation) {
  vec2 c1 = center - vec2(separation * 0.5, 0.0);
  vec2 c2 = center + vec2(separation * 0.5, 0.0);

  float d1 = sdCircle(p, c1, radius);
  float d2 = sdCircle(p, c2, radius);

  return smoothstep(0.02, 0.0, max(d1, d2));
}

// Fibonacci lattice point distribution
vec2 fibonacciLattice(int index, int total) {
  float i = float(index);
  float n = float(total);

  float theta = i * TAU / PHI;
  float r = sqrt(i / n);

  return vec2(cos(theta) * r, sin(theta) * r);
}
`;
