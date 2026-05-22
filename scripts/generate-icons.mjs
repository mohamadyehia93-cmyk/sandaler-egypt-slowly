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

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>

    <!-- Sun, top-left corner area -->
    <circle cx="220" cy="180" r="42" fill="#FAEEDA" opacity="0.9"/>

    <!-- Felucca sail and hull, decorative left side -->
    <g transform="translate(140, 240)">
      <path d="M 80 0 L 80 140 L 160 140 Z" fill="white" opacity="0.88"/>
      <path d="M 0 145 Q 80 168 160 145 L 145 175 Q 80 192 15 175 Z" fill="white" opacity="0.85"/>
    </g>

    <!-- Text content, right-aligned to avoid felucca -->
    <text x="700" y="280" font-family="Cairo, sans-serif" font-weight="800" font-size="96" fill="white">Sandal</text>
    <text x="700" y="345" font-family="Cairo, sans-serif" font-weight="400" font-size="32" fill="#FAEEDA" opacity="0.92">Discover Egypt. Slowly.</text>
    <text x="700" y="395" font-family="Cairo, sans-serif" font-weight="400" font-size="22" fill="white" opacity="0.6">اكتشف مصر. ببطء.</text>

    <!-- Bottom byline -->
    <line x1="700" y1="540" x2="900" y2="540" stroke="white" stroke-width="2" opacity="0.3"/>
    <text x="700" y="580" font-family="Cairo, sans-serif" font-weight="500" font-size="22" fill="white" opacity="0.75">Egypt's slow rural tourism platform</text>
  </svg>
`;
await sharp(Buffer.from(ogSvg)).png().toFile('public/og-image.png');
console.log('  ✓ og-image.png (1200×630)');
