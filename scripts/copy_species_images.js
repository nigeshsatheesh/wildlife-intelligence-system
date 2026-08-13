const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcBase = path.join(root, 'data', 'raw-images');
const dest = path.join(root, 'client', 'public', 'images');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

const map = {
  elephant: 'asian-elephant.jpg',
  lion: 'asiatic-lion.jpg',
  tiger: 'bengal-tiger.jpg',
  owl: 'eurasian-owl.jpg',
  eagle: 'golden-eagle.jpg',
  squirrel: 'indian-giant-squirrel.jpg',
  wolf: 'indian-wolf.jpg',
  leopard: 'leopard.jpg',
  zebra: 'plains-zebra.jpg',
  fox: 'red-fox.jpg',
  deer: 'sambar-deer.jpg',
  bear: 'sloth-bear.jpg'
};

for (const [folder, filename] of Object.entries(map)) {
  const dir = path.join(srcBase, folder);
  if (!fs.existsSync(dir)) {
    console.log('MISSING', folder);
    continue;
  }
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files || files.length === 0) {
    console.log('NOFILES', folder);
    continue;
  }
  const srcFile = path.join(dir, files[0]);
  const destFile = path.join(dest, filename);
  fs.copyFileSync(srcFile, destFile);
  console.log('COPIED', folder, '->', filename);
}

console.log('Done.');
