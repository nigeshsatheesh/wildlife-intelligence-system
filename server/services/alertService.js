const Notification = require('../models/Notification');
const Species = require('../models/Species');
const Sighting = require('../models/Sighting');
const MonitoringSite = require('../models/MonitoringSite');

async function evaluateSightingAlert(sighting, req) {
  try {
    let speciesDoc = null;
    let siteDoc = null;

    if (req && req.isMongoConnected) {
      if (sighting.species) {
        speciesDoc = await Species.findById(sighting.species._id || sighting.species);
      }
      if (sighting.monitoringSite) {
        siteDoc = await MonitoringSite.findById(sighting.monitoringSite._id || sighting.monitoringSite);
      }
    } else if (req && req.memoryDb) {
      const spId = sighting.species?._id || sighting.species;
      speciesDoc = req.memoryDb.species.find(s => s._id === spId || s.id === spId);
      const stId = sighting.monitoringSite?._id || sighting.monitoringSite;
      siteDoc = req.memoryDb.sites.find(s => s._id === stId || s.id === stId);
    }

    if (speciesDoc && ['Critical', 'Vulnerable'].includes(speciesDoc.conservationStatus)) {
      const notificationData = {
        type: 'endangered_sighting',
        severity: speciesDoc.conservationStatus === 'Critical' ? 'critical' : 'warning',
        title: `${speciesDoc.conservationStatus} Species Sighting Recorded`,
        message: `A ${speciesDoc.commonName} (${speciesDoc.scientificName}) was observed at ${siteDoc ? siteDoc.siteName : 'a monitoring site'}.`,
        relatedSpecies: speciesDoc._id || speciesDoc.id,
        relatedSite: siteDoc ? (siteDoc._id || siteDoc.id) : null,
        relatedSighting: sighting._id || sighting.id,
        roleTargets: ['Admin', 'Conservation Officer', 'Researcher', 'Forest Department Officer'],
        read: false,
        createdAt: new Date()
      };

      if (req && req.isMongoConnected) {
        await Notification.create(notificationData);
      } else if (req && req.memoryDb) {
        req.memoryDb.notifications = req.memoryDb.notifications || [];
        req.memoryDb.notifications.unshift({
          _id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
          ...notificationData
        });
      }
    }
  } catch (err) {
    console.error('Error evaluating sighting alert:', err);
  }
}

async function evaluateAllAlerts(req) {
  try {
    let speciesList = [];
    let sightingsList = [];
    let sitesList = [];

    if (req && req.isMongoConnected) {
      speciesList = await Species.find();
      sightingsList = await Sighting.find();
      sitesList = await MonitoringSite.find();
    } else if (req && req.memoryDb) {
      speciesList = req.memoryDb.species || [];
      sightingsList = req.memoryDb.sightings || [];
      sitesList = req.memoryDb.sites || [];
    }

    const createdNotifications = [];
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Rule A: Population Decline Check
    speciesList.forEach(sp => {
      const spSightings = sightingsList.filter(sg => {
        const sId = sg.species?._id?.toString() || sg.species?.toString();
        return sId === sp._id?.toString();
      });

      const thisMonthCount = spSightings.filter(s => new Date(s.eventDate) >= startOfThisMonth).length;
      const lastMonthCount = spSightings.filter(s => new Date(s.eventDate) >= startOfLastMonth && new Date(s.eventDate) < startOfThisMonth).length;

      if (lastMonthCount >= 2 && thisMonthCount < lastMonthCount * 0.7) {
        const declinePct = Math.round(((lastMonthCount - thisMonthCount) / lastMonthCount) * 100);
        createdNotifications.push({
          type: 'population_decline',
          severity: sp.conservationStatus === 'Critical' ? 'critical' : 'warning',
          title: `Population Decline Detected: ${sp.commonName}`,
          message: `Sightings for ${sp.commonName} dropped by ${declinePct}% vs last month (${lastMonthCount} -> ${thisMonthCount}).`,
          relatedSpecies: sp._id,
          roleTargets: ['Admin', 'Conservation Officer', 'Researcher'],
          read: false,
          createdAt: new Date()
        });
      }
    });

    // Rule B: Habitat Degradation / Low Activity Check
    sitesList.forEach(site => {
      const siteSightings = sightingsList.filter(sg => {
        const stId = sg.monitoringSite?._id?.toString() || sg.monitoringSite?.toString();
        return stId === site._id?.toString();
      });

      if (siteSightings.length === 0) {
        createdNotifications.push({
          type: 'habitat_degradation',
          severity: 'info',
          title: `No Active Field Records: ${site.siteName}`,
          message: `Monitoring site ${site.siteName} has no recorded sightings in the system database.`,
          relatedSite: site._id,
          roleTargets: ['Admin', 'Forest Department Officer'],
          read: false,
          createdAt: new Date()
        });
      }
    });

    // Save alerts to DB or memoryDb
    if (req && req.isMongoConnected) {
      for (const notif of createdNotifications) {
        const exists = await Notification.findOne({ title: notif.title, read: false });
        if (!exists) {
          await Notification.create(notif);
        }
      }
    } else if (req && req.memoryDb) {
      req.memoryDb.notifications = req.memoryDb.notifications || [];
      createdNotifications.forEach(notif => {
        const exists = req.memoryDb.notifications.find(n => n.title === notif.title && !n.read);
        if (!exists) {
          req.memoryDb.notifications.unshift({
            _id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
            ...notif
          });
        }
      });
    }

    return createdNotifications;
  } catch (err) {
    console.error('Error evaluating all system alerts:', err);
    return [];
  }
}

module.exports = {
  evaluateSightingAlert,
  evaluateAllAlerts
};
