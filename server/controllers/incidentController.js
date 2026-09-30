const Incident = require('../models/Incident');

exports.getIncidents = async (req, res) => {
  try {
    if (req.isMongoConnected) {
      const incidents = await Incident.find()
        .populate('monitoringSite')
        .populate('reportedBy', 'name email role')
        .sort({ eventDate: -1 });
      res.json(incidents);
    } else {
      res.json(req.memoryDb.incidents || []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const { title, incidentType, severity, status, monitoringSite, notes, latitude, longitude } = req.body;

    const payload = {
      title,
      incidentType: incidentType || 'Human-Wildlife Conflict',
      severity: severity || 'medium',
      status: status || 'Open',
      monitoringSite,
      reportedBy: req.user ? (req.user._id || req.user.id) : null,
      eventDate: req.body.eventDate || new Date(),
      location: {
        latitude: parseFloat(latitude) || 11.6664,
        longitude: parseFloat(longitude) || 76.6292
      },
      notes
    };

    if (req.isMongoConnected) {
      const incident = await Incident.create(payload);
      const populated = await Incident.findById(incident._id)
        .populate('monitoringSite')
        .populate('reportedBy', 'name email role');
      res.status(201).json(populated);
    } else {
      const siteDoc = (req.memoryDb.sites || []).find(s => s._id === monitoringSite) || (req.memoryDb.sites || [])[0];
      const newIncident = {
        _id: 'inc_' + Date.now(),
        ...payload,
        monitoringSite: siteDoc,
        reportedBy: { name: req.user ? req.user.name : 'Forest Department Officer' },
        createdAt: new Date()
      };
      req.memoryDb.incidents = req.memoryDb.incidents || [];
      req.memoryDb.incidents.unshift(newIncident);
      res.status(201).json(newIncident);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (req.isMongoConnected) {
      const updated = await Incident.findByIdAndUpdate(req.params.id, { status }, { new: true })
        .populate('monitoringSite')
        .populate('reportedBy', 'name email role');
      if (!updated) return res.status(404).json({ message: 'Incident not found' });
      res.json(updated);
    } else {
      req.memoryDb.incidents = req.memoryDb.incidents || [];
      const idx = req.memoryDb.incidents.findIndex(i => i._id === req.params.id);
      if (idx !== -1) {
        req.memoryDb.incidents[idx].status = status;
        res.json(req.memoryDb.incidents[idx]);
      } else {
        res.status(404).json({ message: 'Incident not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
