const fs = require('fs');
const content = fs.readFileSync('/tmp/cc-agent/59768710/project/artpacks/theunseen/DualityThreshold/index.js', 'utf8');

// Extract sharedGLSL
const sharedMatch = content.match(/const sharedGLSL = `([\s\S]*?)`;/);
const sharedGLSL = sharedMatch ? sharedMatch[1] : '';

// Extract fragmentShader template
const fragMatch = content.match(/const fragmentShader = `([\s\S]*?)\$\{sharedGLSL\}([\s\S]*?)`;[\s\S]*?const vertexShader/);

if (fragMatch) {
  console.log("BEFORE ${sharedGLSL}:");
  console.log(fragMatch[1].split('\n').slice(0, 5).join('\n'));
  console.log("\nAFTER ${sharedGLSL}:");
  console.log(fragMatch[2].split('\n').slice(0, 10).join('\n'));
}

console.log("\nsharedGLSL starts with:", sharedGLSL.split('\n').slice(0, 3).join('\n'));
