export const fractalGLSL = `
// ============================================================================
// FRACTAL UTILITIES - The Unseen Series
// ============================================================================

// Mandelbrot set distance estimation
float mandelbrot(vec2 c, int maxIterations) {
  vec2 z = vec2(0.0);
  float iterations = 0.0;

  for(int i = 0; i < maxIterations; i++) {
    if(dot(z, z) > 4.0) break;

    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations += 1.0;
  }

  return iterations / float(maxIterations);
}

// Julia set distance estimation
float julia(vec2 z, vec2 c, int maxIterations) {
  float iterations = 0.0;

  for(int i = 0; i < maxIterations; i++) {
    if(dot(z, z) > 4.0) break;

    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations += 1.0;
  }

  return iterations / float(maxIterations);
}

// Burning Ship fractal
float burningShip(vec2 c, int maxIterations) {
  vec2 z = vec2(0.0);
  float iterations = 0.0;

  for(int i = 0; i < maxIterations; i++) {
    if(dot(z, z) > 4.0) break;

    z = vec2(z.x * z.x - z.y * z.y, 2.0 * abs(z.x * z.y)) + c;
    iterations += 1.0;
  }

  return iterations / float(maxIterations);
}

// Smooth fractal coloring (continuous)
float smoothFractal(vec2 c, int maxIterations) {
  vec2 z = vec2(0.0);
  float iterations = 0.0;

  for(int i = 0; i < maxIterations; i++) {
    if(dot(z, z) > 256.0) {
      float log_zn = log(dot(z, z)) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      return iterations + 1.0 - nu;
    }

    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations += 1.0;
  }

  return iterations;
}

// Fractal zoom with breath synchronization
vec2 fractalZoom(vec2 uv, vec2 center, float zoom, float breathPhase) {
  float breathScale = 1.0 + sin(breathPhase) * 0.1;
  return (uv - 0.5) / (zoom * breathScale) + center;
}

// Multi-Julia morphing between parameters
float morphingJulia(vec2 z, vec2 c1, vec2 c2, float morphFactor, int maxIterations) {
  vec2 c = mix(c1, c2, morphFactor);
  return julia(z, c, maxIterations);
}

// Fractal orbital trap coloring
vec3 orbitalTrap(vec2 c, vec2 trapCenter, int maxIterations) {
  vec2 z = vec2(0.0);
  float minDist = 1e10;
  vec3 trapColor = vec3(0.0);

  for(int i = 0; i < maxIterations; i++) {
    if(dot(z, z) > 4.0) break;

    float dist = length(z - trapCenter);
    if(dist < minDist) {
      minDist = dist;
      trapColor = vec3(float(i) / float(maxIterations));
    }

    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
  }

  return trapColor;
}

// Lyapunov fractal (stability visualization)
float lyapunov(vec2 p, vec2 sequence, int iterations) {
  float x = 0.5;
  float lambda = 0.0;

  for(int i = 0; i < iterations; i++) {
    float r = mod(float(i), 2.0) < 1.0 ? p.x : p.y;
    float deriv = r * (1.0 - 2.0 * x);
    lambda += log(abs(deriv));
    x = r * x * (1.0 - x);
  }

  return lambda / float(iterations);
}

// Koch snowflake (recursive approximation)
float kochSnowflake(vec2 p, vec2 center, float size, int depth) {
  vec2 rel = p - center;
  float angle = atan(rel.y, rel.x);
  float dist = length(rel);

  float pattern = 0.0;
  float scale = size;

  for(int i = 0; i < depth; i++) {
    float segment = mod(angle * 3.0 / (2.0 * 3.14159), 1.0);
    pattern += smoothstep(scale * 1.1, scale * 0.9, abs(dist - scale));
    scale *= 0.333;
  }

  return pattern;
}

// Sierpinski triangle
float sierpinski(vec2 p, vec2 center, float size, int iterations) {
  vec2 rel = (p - center) / size + 0.5;

  for(int i = 0; i < iterations; i++) {
    rel *= 2.0;
    if(rel.x > 1.0 && rel.y > 1.0) return 0.0;
    rel = fract(rel);
  }

  return 1.0;
}

// Dragon curve approximation
float dragonCurve(vec2 p, float iteration) {
  vec2 z = p;
  float d = 1e10;

  for(int i = 0; i < int(iteration); i++) {
    z = vec2(z.x * 0.5 - z.y * 0.5, z.x * 0.5 + z.y * 0.5);
    d = min(d, length(z));
  }

  return smoothstep(0.1, 0.0, d);
}
`;
