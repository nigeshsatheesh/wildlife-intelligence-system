const speciesImages = {
  'Asian Elephant': '/species-images/asian-elephant.jpg',
  'African Elephant': '/species-images/asian-elephant.jpg',
  'Elephant': '/species-images/asian-elephant.jpg',
  'Asiatic Lion': '/species-images/asiatic-lion.jpg',
  'Bengal Tiger': '/species-images/bengal-tiger.jpg',
  'Eurasian Owl': '/species-images/eurasian-owl.jpg',
  'Golden Eagle': '/species-images/golden-eagle.jpg',
  'Indian Giant Squirrel': '/species-images/indian-giant-squirrel.jpg',
  'Indian Wolf': '/species-images/indian-wolf.jpg',
  'Eurasian Wolf': '/species-images/indian-wolf.jpg',
  'Wolf': '/species-images/indian-wolf.jpg',
  'Leopard': '/species-images/leopard.jpg',
  'Plains Zebra': '/species-images/plains-zebra.jpg',
  'Red Fox': '/species-images/red-fox.jpg',
  'Sambar Deer': '/species-images/sambar-deer.jpg',
  'Sloth Bear': '/species-images/sloth-bear.jpg'
};

const externalFallback = {
  tiger: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80'
};

export function getSpeciesImageUrl(species) {
  if (!species) return '/species-images/bengal-tiger.jpg';

  const name = species.commonName || '';
  // 1. Prioritize real local high-res photo by species name
  if (speciesImages[name]) {
    return speciesImages[name];
  }

  // 2. Use direct imageUrl if non-unsplash or if local
  if (species.imageUrl && !species.imageUrl.includes('unsplash.com')) {
    return species.imageUrl;
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