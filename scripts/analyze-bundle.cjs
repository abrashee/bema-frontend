const fs = require('fs');
const esbuild = require('esbuild');

const metafilePath = 'dist/bema-frontend/stats.json';
const outputPath = 'bundle-analysis.txt';

if (!fs.existsSync(metafilePath)) {
  console.error(`Missing ${metafilePath}. Run: npm run build:stats`);
  process.exit(1);
}

const metafile = JSON.parse(fs.readFileSync(metafilePath, 'utf8'));
const report = esbuild.analyzeMetafileSync(metafile, { verbose: true });

fs.writeFileSync(outputPath, report);
console.log(`Bundle analysis written to ${outputPath}`);
