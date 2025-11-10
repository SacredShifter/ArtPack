import { noiseGLSL } from './noise.glsl';
import { flowGLSL } from './flow.glsl';
import { geometryGLSL } from './geometry.glsl';
import { fractalGLSL } from './fractal.glsl';
import { reactivityGLSL } from './reactivity.glsl';

export const unSeenShaderCore = `
${noiseGLSL}
${flowGLSL}
${geometryGLSL}
${fractalGLSL}
${reactivityGLSL}
`;

export { noiseGLSL, flowGLSL, geometryGLSL, fractalGLSL, reactivityGLSL };
