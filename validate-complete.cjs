const fs = require('fs');

// Import and execute the module to get the actual compiled shader
const content = fs.readFileSync('/tmp/cc-agent/59768710/project/artpacks/theunseen/DualityThreshold/index.js', 'utf8');

// Extract sharedGLSL
const sharedMatch = content.match(/const sharedGLSL = `([\s\S]*?)`;/);
if (!sharedMatch) {
  console.log("ERROR: Could not find sharedGLSL");
  process.exit(1);
}
const sharedGLSL = sharedMatch[1];

// Extract fragmentShader template
const fragMatch = content.match(/const fragmentShader = `\s*\$\{sharedGLSL\}([\s\S]*?)`;[\s\S]*?const vertexShader/);
if (!fragMatch) {
  console.log("ERROR: Could not find fragmentShader");
  process.exit(1);
}
const fragmentBody = fragMatch[1];

// Construct the full shader
const fullShader = sharedGLSL + fragmentBody;

console.log("✓ Constructed full shader");
console.log(`  sharedGLSL: ${sharedGLSL.split('\n').length} lines`);
console.log(`  fragmentBody: ${fragmentBody.split('\n').length} lines`);
console.log(`  Total: ${fullShader.split('\n').length} lines`);

// Check brace balance
let braceBalance = 0;
fullShader.split('').forEach(c => {
  if (c === '{') braceBalance++;
  if (c === '}') braceBalance--;
});
console.log(`\nBrace balance: ${braceBalance === 0 ? '✓ OK' : '✗ FAIL ('+braceBalance+')'}`);

// Check for all expected functions
const expectedFuncs = ['snoise', 'curl', 'hash2D', 'fbm3', 'fbm4', 'filmGrain',
                       'flowerOfLife', 'renderUnseenLayer', 'renderSeenLayer'];
console.log("\nFunction checks:");
expectedFuncs.forEach(func => {
  const regex = new RegExp(`\\b${func}\\s*\\(`);
  const found = regex.test(fullShader);
  console.log(`  ${found ? '✓' : '✗'} ${func}`);
});

// Save full shader
fs.writeFileSync('/tmp/cc-agent/59768710/project/duality-full.glsl', fullShader);
console.log("\n✓ Saved to duality-full.glsl");
