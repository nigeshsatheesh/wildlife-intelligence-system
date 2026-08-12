const speciesImageMap = {
  tiger: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80',
  elephant: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80',
  eagle: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=600&q=80',
  wolf: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?auto=format&fit=crop&w=600&q=80',
  lynx: 'https://images.unsplash.com/photo-1540573133985-780688d1728b?auto=format&fit=crop&w=600&q=80',
  fox: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=600&q=80',
  lion: 'https://images.unsplash.com/photo-1541414746645-6b01a7d71d10?auto=format&fit=crop&w=600&q=80',
  leopard: 'https://images.unsplash.com/photo-1513187997483-5b65dee35c2e?auto=format&fit=crop&w=600&q=80',
  zebra: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80',
  bear: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
  deer: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
  owl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=600&q=80',
  squirrel: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=600&q=80'
};

export function getSpeciesImageUrl(species) {
  if (!species) return speciesImageMap['tiger'];
  if (species.imageUrl) return species.imageUrl;

  const label = (species.classifierLabel || species.commonName || '').toString().toLowerCase();
  if (speciesImageMap[label]) return speciesImageMap[label];

  const normalizedName = species.commonName?.toLowerCase().replace(/\s+/g, ' ') || '';
  for (const key of Object.keys(speciesImageMap)) {
    if (normalizedName.includes(key)) {
      return speciesImageMap[key];
    }
  }

  return speciesImageMap['tiger'];
}
