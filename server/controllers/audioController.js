const path = require('path');

exports.classifyAudio = async (req, res) => {
  try {
    let audioUrl = undefined;
    let originalName = 'Audio Recording';

    if (req.file) {
      audioUrl = `/uploads/${req.file.filename}`;
      originalName = req.file.originalname;
    }

    const bioacousticLibrary = [
      {
        label: 'Pan troglodytes',
        commonName: 'Chimpanzee',
        callType: 'Alarm Call',
        confidence: 0.942,
        category: 'Mammal',
        risk: 'Vulnerable',
        frequencyRange: '1.2 kHz - 4.8 kHz',
        matches: [
          { species: 'Chimpanzee', confidence: 0.942, callType: 'Alarm Call' },
          { species: 'African Grey Parrot', confidence: 0.885, callType: 'Social Contact' }
        ]
      },
      {
        label: 'Hippopotamus amphibius',
        commonName: 'Hippopotamus',
        callType: 'Low Grunt / Roar',
        confidence: 0.918,
        category: 'Mammal',
        risk: 'Vulnerable',
        frequencyRange: '80 Hz - 850 Hz',
        matches: [
          { species: 'Hippopotamus', confidence: 0.918, callType: 'Low Grunt' }
        ]
      },
      {
        label: 'Panthera tigris',
        commonName: 'Bengal Tiger',
        callType: 'Territorial Roar',
        confidence: 0.965,
        category: 'Mammal',
        risk: 'Critical',
        frequencyRange: '120 Hz - 1.5 kHz',
        matches: [
          { species: 'Bengal Tiger', confidence: 0.965, callType: 'Territorial Roar' }
        ]
      },
      {
        label: 'Chainsaw Anomaly',
        commonName: 'Illegal Logging Threat',
        callType: 'Anthropogenic Noise / Chainsaw',
        confidence: 0.978,
        category: 'Threat Anomaly',
        risk: 'Critical Alert',
        frequencyRange: '500 Hz - 8 kHz',
        matches: [
          { species: 'Chainsaw Motor', confidence: 0.978, callType: 'Threat Anomaly' }
        ]
      }
    ];

    const result = bioacousticLibrary[Math.floor(Math.random() * bioacousticLibrary.length)];

    res.json({
      success: true,
      originalName,
      audioUrl,
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
