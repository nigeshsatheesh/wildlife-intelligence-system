// Local static images (real photos from your training dataset) — checked first.
const speciesImages = {
  'Asian Elephant': '/images/asian-elephant.jpg',
  'Asiatic Lion': '/images/asiatic-lion.jpg',
  'Bengal Tiger': '/images/bengal-tiger.jpg',
  'Eurasian Owl': '/images/eurasian-owl.jpg',
  'Golden Eagle': '/images/golden-eagle.jpg',
  'Indian Giant Squirrel': '/images/indian-giant-squirrel.jpg',
  'Indian Wolf': '/images/indian-wolf.jpg',
  'Leopard': '/images/leopard.jpg',
  'Plains Zebra': '/images/plains-zebra.jpg',
  'Red Fox': '/images/red-fox.jpg',
  'Sambar Deer': '/images/sambar-deer.jpg',
  'Sloth Bear': '/images/sloth-bear.jpg'
};

const externalFallback = {
  tiger: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80'
};

export function getSpeciesImageUrl(species) {
  if (!species) return externalFallback.tiger;

  // 1. Use image URL stored directly on the species record, if present
  if (species.imageUrl) return species.imageUrl;

  // 2. Use the locally copied real dataset photo, matched by common name
  if (speciesImages[species.commonName]) {
    return speciesImages[species.commonName];
  }

  // 3. Fall back to the dynamic server endpoint (reads from data/raw-images/)
  let rawLabel = (species.classifierLabel || species.commonName || '').toString().toLowerCase();
  const mapping = {
    tiger: 'tiger', panthera: 'tiger', tigris: 'tiger',
    elephant: 'elephant', loxodonta: 'elephant',
    canis: 'wolf', lupus: 'wolf', wolf: 'wolf',
    fox: 'fox', vulpes: 'fox',
    leopard: 'leopard',
    lion: 'lion',
    bubo: 'owl', owl: 'owl',
    eagle: 'eagle', aquila: 'eagle',
    squirrel: 'squirrel', ratufa: 'squirrel',
    zebra: 'zebra',
    deer: 'deer',
    bear: 'bear'
  };
  for (const key of Object.keys(mapping)) {
    if (rawLabel.includes(key)) {
      return `/raw-images/thumbnail/${encodeURIComponent(mapping[key])}`;
    }
  }

  // 4. Last resort
  return externalFallback.tiger;
}