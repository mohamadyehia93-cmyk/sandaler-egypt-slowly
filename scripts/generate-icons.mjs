import sharp from 'sharp';
import fs from 'fs';

const svgBuffer = fs.readFileSync('public/sandal-logo.svg');

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

console.log('Generating PWA icons from public/sandal-logo.svg...');
for (const { name, size } of sizes) {
  await sharp(svgBuffer).resize(size, size).png().toFile(`public/${name}`);
  console.log(`  ✓ ${name} (${size}×${size})`);
}

// OG image 1200x630
const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1A7A74"/>
        <stop offset="100%" stop-color="#0F4A45"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="600" cy="180" r="50" fill="#FAEEDA" opacity="0.9"/>
    <path d="M200 360 Q400 300 600 340 Q800 380 1000 320 L1000 480 Q800 540 600 500 Q400 460 200 520 Z" fill="white" opacity="0.92"/>
    <text x="600" y="270" text-anchor="middle" font-family="Cairo, sans-serif" font-weight="800" font-size="80" fill="white">Sandal</text>
    <text x="600" y="320" text-anchor="middle" font-family="Cairo, sans-serif" font-weight="400" font-size="28" fill="#FAEEDA" opacity="0.9">Discover Egypt. Slowly.</text>
    <text x="600" y="595" text-anchor="middle" font-family="Cairo, sans-serif" font-weight="400" font-size="22" fill="white" opacity="0.7">Egypt's slow rural tourism platform</text>
  </svg>
`;
await sharp(Buffer.from(ogSvg)).png().toFile('public/og-image.png');
console.log('  ✓ og-image.png (1200×630)');
