// Prefer serving representative images from the project dataset (server exposes /raw-images and /raw-images/thumbnail/:label)
const externalFallback = {
  tiger: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80'
};

export function getSpeciesImageUrl(species) {
  if (!species) return externalFallback.tiger;
  if (species.imageUrl) return species.imageUrl;

  let rawLabel = (species.classifierLabel || species.commonName || '').toString().toLowerCase();
  // Normalize some common patterns to folder keys in data/raw-images
  const mapping = {
    tiger: 'tiger',
    panthera: 'tiger',
    tigris: 'tiger',
    elephant: 'elephant',
    loxodonta: 'elephant',
    canis: 'wolf',
    lupus: 'wolf',
    wolf: 'wolf',
    fox: 'fox',
    vulpes: 'fox',
    leopard: 'leopard',
    panthera_pardus: 'leopard',
    lion: 'lion',
    bubo: 'owl',
    owl: 'owl',
    eagle: 'eagle',
    aquila: 'eagle',
    squirrel: 'squirrel',
    ratufa: 'squirrel',
    zebra: 'zebra',
    deer: 'deer',
    bear: 'bear'
  };

  for (const key of Object.keys(mapping)) {
    if (rawLabel.includes(key)) {
      const folder = mapping[key];
      return `/raw-images/thumbnail/${encodeURIComponent(folder)}`;
    }
  }

  // As a last resort, try using the full label as folder name
  if (rawLabel) return `/raw-images/thumbnail/${encodeURIComponent(rawLabel)}`;

  return externalFallback.tiger;
}
