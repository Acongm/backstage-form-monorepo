// This is a simple index file that re-exports all components
// In a real project, you might want to use a more sophisticated approach

const fs = require('fs');
const path = require('path');

// Get all component names from the components directory
const componentsDir = path.join(__dirname, 'src/components');
const components = fs.readdirSync(componentsDir).filter(file => {
  return fs.statSync(path.join(componentsDir, file)).isDirectory();
});

// Generate export statements
let exportStatements = '';
components.forEach(component => {
  exportStatements += `export { default as ${component} } from './${component}.esm.js';\n`;
});

// Write to dist/index.esm.js
fs.writeFileSync(path.join(__dirname, 'dist/index.esm.js'), exportStatements);

// For UMD, we need a different approach
// This is a simplified version - in practice, you'd want to use webpack's multi-entry feature
console.log('Generated index files for all components');