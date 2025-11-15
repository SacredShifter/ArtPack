const fs = require('fs');
const content = fs.readFileSync('/tmp/cc-agent/59768710/project/artpacks/theunseen/DualityThreshold/index.js', 'utf8');

const match = content.match(/const fragmentShader = `([\s\S]*?)`;[\s\S]*?const vertexShader/);
if (!match) {
  console.log("ERROR: Could not extract shader");
  process.exit(1);
}

const shader = match[1];
fs.writeFileSync('/tmp/duality.glsl', shader);
console.log("Extracted to /tmp/duality.glsl");
console.log("Lines:", shader.split('\n').length);

let braceBalance = 0;
shader.split('').forEach(c => {
  if (c === '{') braceBalance++;
  if (c === '}') braceBalance--;
});
console.log("Brace balance:", braceBalance);
