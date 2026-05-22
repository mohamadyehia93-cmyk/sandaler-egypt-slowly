import fs from 'fs';

const en = JSON.parse(fs.readFileSync('src/i18n/locales/en/common.json', 'utf-8'));
const ar = JSON.parse(fs.readFileSync('src/i18n/locales/ar/common.json', 'utf-8'));

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) Object.assign(result, flatten(v, key));
    else result[key] = v;
  }
  return result;
}

const enFlat = flatten(en);
const arFlat = flatten(ar);
const enKeys = new Set(Object.keys(enFlat));
const arKeys = new Set(Object.keys(arFlat));

const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
const missingInEn = [...arKeys].filter(k => !enKeys.has(k));

if (missingInAr.length === 0 && missingInEn.length === 0) {
  console.log(`✓ All ${enKeys.size} keys present in both languages.`);
  process.exit(0);
}

if (missingInAr.length) {
  console.log(`\n✗ Missing in Arabic (${missingInAr.length}):`);
  missingInAr.forEach(k => console.log(`  - ${k}: "${enFlat[k]}"`));
}
if (missingInEn.length) {
  console.log(`\n✗ Missing in English (${missingInEn.length}):`);
  missingInEn.forEach(k => console.log(`  - ${k}`));
}
process.exit(1);
