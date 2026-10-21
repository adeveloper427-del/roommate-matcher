const sharp = require('sharp');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

const PRIMARY = '#C1793D';
const PRIMARY_DARK = '#8C5423';
const PRIMARY_LIGHT = '#F3A65A';

function flatIconSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PRIMARY_LIGHT}"/>
        <stop offset="50%" stop-color="${PRIMARY}"/>
        <stop offset="100%" stop-color="${PRIMARY_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" rx="180" fill="url(#bg)"/>
    <text x="512" y="700" font-family="Georgia, 'Times New Roman', serif" font-size="620" font-weight="700"
      text-anchor="middle" fill="#FFFFFF">R</text>
  </svg>`;
}

function backgroundSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PRIMARY_LIGHT}"/>
        <stop offset="50%" stop-color="${PRIMARY}"/>
        <stop offset="100%" stop-color="${PRIMARY_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)"/>
  </svg>`;
}

function foregroundSvg(fillColor) {
  // Adaptive icon safe zone is the center ~66%, so keep the glyph well inside it.
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <text x="512" y="640" font-family="Georgia, 'Times New Roman', serif" font-size="440" font-weight="700"
      text-anchor="middle" fill="${fillColor}">R</text>
  </svg>`;
}

function transparentIconSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <text x="512" y="700" font-family="Georgia, 'Times New Roman', serif" font-size="620" font-weight="700"
      text-anchor="middle" fill="${PRIMARY}">R</text>
  </svg>`;
}

async function run() {
  await sharp(Buffer.from(flatIconSvg(1024))).png().toFile(path.join(ASSETS, 'icon.png'));
  await sharp(Buffer.from(backgroundSvg())).png().toFile(path.join(ASSETS, 'android-icon-background.png'));
  await sharp(Buffer.from(foregroundSvg('#FFFFFF')))
    .png()
    .toFile(path.join(ASSETS, 'android-icon-foreground.png'));
  await sharp(Buffer.from(foregroundSvg('#FFFFFF')))
    .png()
    .toFile(path.join(ASSETS, 'android-icon-monochrome.png'));
  await sharp(Buffer.from(flatIconSvg(196))).resize(196, 196).png().toFile(path.join(ASSETS, 'favicon.png'));
  await sharp(Buffer.from(transparentIconSvg(1024)))
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'));

  console.log('Icons generated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
