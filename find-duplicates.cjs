const fs = require('fs');
const content = fs.readFileSync('/tmp/cc-agent/59768710/project/duality-full.glsl', 'utf8');

const lines = content.split('\n');
const functions = {};

lines.forEach((line, i) => {
  const match = line.match(/^\s*(float|vec2|vec3|vec4|void|mat2|mat3|mat4)\s+([a-zA-Z_]\w*)\s*\(/);
  if (match) {
    const funcName = match[2];
    if (!functions[funcName]) {
      functions[funcName] = [];
    }
    functions[funcName].push(i + 1);
  }
});

console.log("Duplicate function definitions:");
let hasDuplicates = false;
Object.entries(functions).forEach(([name, lines]) => {
  if (lines.length > 1) {
    console.log(`  ${name}: lines ${lines.join(', ')}`);
    hasDuplicates = true;
  }
});

if (!hasDuplicates) {
  console.log("  None found");
}

console.log("\nAll functions:", Object.keys(functions).sort().join(', '));
