const fs = require('fs');

const reportPath = 'lighthouse-report.json';

if (!fs.existsSync(reportPath)) {
  console.error(`Missing ${reportPath}. Run Lighthouse before checking scores.`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const thresholds = {
  performance: 55,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
};

let failed = false;

for (const [category, minimum] of Object.entries(thresholds)) {
  const score = Math.round((report.categories[category]?.score ?? 0) * 100);

  if (score < minimum) {
    console.error(`${category} score ${score} is below required ${minimum}`);
    failed = true;
  } else {
    console.log(`${category} score ${score} meets required ${minimum}`);
  }
}

if (failed) {
  process.exit(1);
}
