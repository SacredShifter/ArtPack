const fs = require('fs');
const content = fs.readFileSync('/tmp/cc-agent/59768710/project/artpacks/theunseen/DualityThreshold/index.js', 'utf8');

const match = content.match(/const fragmentShader = `([\s\S]*?)`;[\s\S]*?const vertexShader/);
if (!match) {
  console.log("ERROR: Could not extract shader");
  process.exit(1);
}

const shader = match[1];
fs.writeFileSync('/tmp/cc-agent/59768710/project/duality.glsl', shader);
console.log("✓ Extracted shader");
console.log("Lines:", shader.split('\n').length);

// Check brace balance
let braceBalance = 0;
shader.split('').forEach(c => {
  if (c === '{') braceBalance++;
  if (c === '}') braceBalance--;
});

console.log("Brace balance:", braceBalance === 0 ? "✓ OK" : `✗ MISMATCH (${braceBalance})`);

// Check for undefined functions
const lines = shader.split('\n');
const definedFuncs = new Set();
lines.forEach(line => {
  const funcDef = line.match(/^\s*(float|vec2|vec3|vec4|void)\s+(\w+)\s*\(/);
  if (funcDef) definedFuncs.add(funcDef[2]);
});

console.log("\nDefined functions:", Array.from(definedFuncs).sort().join(', '));

// Look for undefined function calls
const builtins = new Set(['sin', 'cos', 'tan', 'abs', 'floor', 'ceil', 'fract', 'mod', 'min', 'max',
                 'clamp', 'mix', 'step', 'smoothstep', 'length', 'distance', 'dot', 'cross',
                 'normalize', 'pow', 'exp', 'log', 'sqrt', 'texture2D', 'vec2', 'vec3', 'vec4',
                 'atan', 'asin', 'acos', 'radians', 'degrees']);

const undefinedCalls = new Set();
lines.forEach((line, i) => {
  const calls = line.matchAll(/([a-zA-Z_]\w*)\s*\(/g);
  for (const match of calls) {
    const funcName = match[1];
    if (!builtins.has(funcName) && !definedFuncs.has(funcName)) {
      undefinedCalls.add(`${funcName} (line ${i+1})`);
    }
  }
});

if (undefinedCalls.size > 0) {
  console.log("\n✗ Undefined function calls:");
  Array.from(undefinedCalls).slice(0, 10).forEach(call => console.log(`  - ${call}`));
} else {
  console.log("\n✓ All function calls resolved");
}
