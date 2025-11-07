export const superformulaShader = `
// Gielis Superformula - generates everything from circles to stars
float superformulaRadius(float angle, float m, float n1, float n2, float n3, float a, float b) {
  float t1 = pow(abs(cos(m * angle / 4.0) / a), n2);
  float t2 = pow(abs(sin(m * angle / 4.0) / b), n3);
  float sum = t1 + t2;

  if (sum == 0.0) return 0.0;

  return pow(sum, -1.0 / max(n1, 0.0001));
}

// SDF for superformula shape
float sdSuperformula(vec2 p, float m, float n1, float n2, float n3) {
  float angle = atan(p.y, p.x);
  float r = length(p);
  float rs = superformulaRadius(angle, m, n1, n2, n3, 1.0, 1.0);
  return r - rs;
}

// Morphing between two superformula shapes
float sdSuperformulaMorph(
  vec2 p,
  float m1, float n1_1, float n2_1, float n3_1,
  float m2, float n1_2, float n2_2, float n3_2,
  float t
) {
  float angle = atan(p.y, p.x);
  float r = length(p);

  float m = mix(m1, m2, t);
  float n1 = mix(n1_1, n1_2, t);
  float n2 = mix(n2_1, n2_2, t);
  float n3 = mix(n3_1, n3_2, t);

  float rs = superformulaRadius(angle, m, n1, n2, n3, 1.0, 1.0);
  return r - rs;
}

// Star overlay (for residual visualization)
float sdStar(vec2 p, float r, float n, float m) {
  float angle = atan(p.y, p.x) + 3.14159;
  float a = 6.28318 / n;
  float sector = mod(angle, a) - a * 0.5;

  vec2 p1 = r * vec2(cos(sector), sin(sector));
  vec2 p2 = r * m * vec2(cos(sector + a), sin(sector + a));

  vec2 q = p - p1;
  vec2 edge = p2 - p1;
  float h = clamp(dot(q, edge) / dot(edge, edge), 0.0, 1.0);

  return length(q - edge * h);
}

// Blend superformula with star based on residual
float sdEvolvedForm(vec2 p, float m, float n1, float n2, float n3, float starMix) {
  float superDist = sdSuperformula(p, m, n1, n2, n3);
  float starDist = sdStar(p, 0.8, m, 0.5);

  return mix(superDist, starDist, starMix);
}
`;
