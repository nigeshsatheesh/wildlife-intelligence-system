const speciesImages = {
  'asian elephant': '/species-images/asian-elephant.jpg',
  'african elephant': '/species-images/asian-elephant.jpg',
  'elephant': '/species-images/asian-elephant.jpg',
  'elephas maximus': '/species-images/asian-elephant.jpg',

  'asiatic lion': '/species-images/asiatic-lion.jpg',
  'lion': '/species-images/asiatic-lion.jpg',
  'panthera leo': '/species-images/asiatic-lion.jpg',
  'panthera leo persica': '/species-images/asiatic-lion.jpg',

  'bengal tiger': '/species-images/bengal-tiger.jpg',
  'tiger': '/species-images/bengal-tiger.jpg',
  'panthera tigris': '/species-images/bengal-tiger.jpg',
  'panthera tigris tigris': '/species-images/bengal-tiger.jpg',

  'eurasian owl': '/species-images/eurasian-owl.jpg',
  'owl': '/species-images/eurasian-owl.jpg',
  'bubo bubo': '/species-images/eurasian-owl.jpg',

  'golden eagle': '/species-images/golden-eagle.jpg',
  'eagle': '/species-images/golden-eagle.jpg',
  'aquila chrysaetos': '/species-images/golden-eagle.jpg',

  'indian giant squirrel': '/species-images/indian-giant-squirrel.jpg',
  'giant squirrel': '/species-images/indian-giant-squirrel.jpg',
  'squirrel': '/species-images/indian-giant-squirrel.jpg',
  'ratufa indica': '/species-images/indian-giant-squirrel.jpg',

  'indian wolf': '/species-images/indian-wolf.jpg',
  'eurasian wolf': '/species-images/indian-wolf.jpg',
  'wolf': '/species-images/indian-wolf.jpg',
  'canis lupus': '/species-images/indian-wolf.jpg',
  'canis lupus pallipes': '/species-images/indian-wolf.jpg',

  'leopard': '/species-images/leopard.jpg',
  'panthera pardus': '/species-images/leopard.jpg',

  'plains zebra': '/species-images/plains-zebra.jpg',
  'zebra': '/species-images/plains-zebra.jpg',
  'equus quagga': '/species-images/plains-zebra.jpg',

  'red fox': '/species-images/red-fox.jpg',
  'fox': '/species-images/red-fox.jpg',
  'vulpes vulpes': '/species-images/red-fox.jpg',

  'sambar deer': '/species-images/sambar-deer.jpg',
  'deer': '/species-images/sambar-deer.jpg',
  'rusa unicolor': '/species-images/sambar-deer.jpg',

  'sloth bear': '/species-images/sloth-bear.jpg',
  'bear': '/species-images/sloth-bear.jpg',
  'melursus ursinus': '/species-images/sloth-bear.jpg'
};

export function getSpeciesImageUrl(species) {
  if (!species) return '/species-images/bengal-tiger.jpg';

  let term = '';
  if (typeof species === 'string') {
    term = species.toLowerCase();
  } else if (typeof species === 'object') {
    term = [
      species.commonName,
      species.scientificName,
      species.classifierLabel,
      species.name
    ].filter(Boolean).join(' ').toLowerCase();
  }

  // Exact or substring match in our local catalog
  for (const [key, path] of Object.entries(speciesImages)) {
    if (term.includes(key)) {
      return path;
    }
  }

  // Keyword fallbacks
  if (term.includes('tiger') || term.includes('tigris')) return '/species-images/bengal-tiger.jpg';
  if (term.includes('lion') || term.includes('persica')) return '/species-images/asiatic-lion.jpg';
  if (term.includes('elephant') || term.includes('elephas')) return '/species-images/asian-elephant.jpg';
  if (term.includes('owl') || term.includes('bubo')) return '/species-images/eurasian-owl.jpg';
  if (term.includes('fox') || term.includes('vulpes')) return '/species-images/red-fox.jpg';
  if (term.includes('leopard') || term.includes('pardus')) return '/species-images/leopard.jpg';
  if (term.includes('bear') || term.includes('ursinus')) return '/species-images/sloth-bear.jpg';
  if (term.includes('wolf') || term.includes('lupus')) return '/species-images/indian-wolf.jpg';
  if (term.includes('eagle') || term.includes('aquila')) return '/species-images/golden-eagle.jpg';
  if (term.includes('squirrel') || term.includes('ratufa')) return '/species-images/indian-giant-squirrel.jpg';
  if (term.includes('zebra')) return '/species-images/plains-zebra.jpg';
  if (term.includes('deer')) return '/species-images/sambar-deer.jpg';

  // Default fallback to local Bengal Tiger
  return '/species-images/bengal-tiger.jpg';
}