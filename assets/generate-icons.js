const sharp = require('sharp');
const path = require('path');

const dir = __dirname;
const jobs = [
  ['src-icon-full.svg', 'icon.png', 1024, false],
  ['src-icon-full.svg', 'favicon.png', 196, false],
  ['src-icon-full.svg', 'android-icon-background.png', 1024, false],
  ['src-icon-foreground.svg', 'android-icon-foreground.png', 1024, true],
  ['src-icon-monochrome.svg', 'android-icon-monochrome.png', 1024, true],
  ['src-splash.svg', 'splash-icon.png', 1024, true],
];

(async () => {
  for (const [src, out, size, transparent] of jobs) {
    let img = sharp(path.join(dir, src)).resize(size, size);
    if (!transparent) img = img.flatten({ background: '#145c39' });
    await img.png().toFile(path.join(dir, out));
    console.log('wrote', out);
  }
})();
