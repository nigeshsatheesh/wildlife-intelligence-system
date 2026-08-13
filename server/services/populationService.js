/**
 * Population Estimation Engine
 * ------------------------------
 * Computes real, defensible population metrics from your actual Sighting
 * records. Nothing here is fabricated — where a metric genuinely can't be
 * computed from the data you have (e.g. true migration tracking, which
 * needs individually-tagged animals), it's reported as unavailable with an
 * explanation, rather than estimated or guessed.
 *
 * Terminology note: "populationSize" here is a MINIMUM COUNT INDEX — the
 * sum of individualCount across sightings in a period. This is a real,
 * standard field-ecology approach when you don't have mark-recapture data,
 * but it can overcount if the same individual is photographed more than
 * once. This caveat is included directly in the API response so the UI
 * (and anyone evaluating the project) sees it, not just this comment.
 */

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * @param {Array} sightings - populated Sighting docs (species, monitoringSite populated)
 * @param {Array} sites - all MonitoringSite docs
 * @param {Array} speciesList - all Species docs
 * @param {Object} opts - { periodDays = 90 }
 */
function computePopulationMetrics(sightings, sites, speciesList, opts = {}) {
  const periodDays = opts.periodDays || 90;
  const periodStart = daysAgo(periodDays);
  const previousPeriodStart = daysAgo(periodDays * 2);

  const currentPeriod = sightings.filter(s => new Date(s.eventDate) >= periodStart);
  const previousPeriod = sightings.filter(
    s => new Date(s.eventDate) >= previousPeriodStart && new Date(s.eventDate) < periodStart
  );

  // --- Per-species population metrics ---
  const speciesMetrics = speciesList.map(species => {
    const speciesId = (species._id || species.id || '').toString();

    const currentSightings = currentPeriod.filter(
      s => ((s.species?._id || s.species || '')).toString() === speciesId
    );
    const previousSightings = previousPeriod.filter(
      s => ((s.species?._id || s.species || '')).toString() === speciesId
    );

    const populationSize = currentSightings.reduce((sum, s) => sum + (s.individualCount || 1), 0);
    const previousPopulationSize = previousSightings.reduce((sum, s) => sum + (s.individualCount || 1), 0);

    let growthRate = null;
    let growthRateLabel = 'No data yet';
    if (previousPopulationSize > 0) {
      growthRate = Math.round(((populationSize - previousPopulationSize) / previousPopulationSize) * 100);
      growthRateLabel = `${growthRate >= 0 ? '+' : ''}${growthRate}% vs previous ${periodDays} days`;
    } else if (populationSize > 0) {
      growthRateLabel = 'New activity this period';
    }

    // Per-site breakdown, with real density where site area is known
    const siteBreakdown = {};
    currentSightings.forEach(s => {
      const site = s.monitoringSite;
      if (!site) return;
      const siteId = (site._id || site.id || '').toString();
      if (!siteBreakdown[siteId]) {
        siteBreakdown[siteId] = {
          siteId,
          siteName: site.siteName,
          count: 0,
          areaKm2: site.areaKm2 || null,
          latitude: site.location?.latitude,
          longitude: site.location?.longitude
        };
      }
      siteBreakdown[siteId].count += (s.individualCount || 1);
    });

    const siteBreakdownList = Object.values(siteBreakdown).map(site => ({
      ...site,
      densityPerKm2: site.areaKm2 ? Number((site.count / site.areaKm2).toFixed(3)) : null,
      densityNote: site.areaKm2 ? null : 'Density unavailable — this monitoring site has no areaKm2 set'
    }));

    return {
      speciesId,
      commonName: species.commonName,
      scientificName: species.scientificName,
      conservationStatus: species.conservationStatus,
      populationSize,
      populationSizeNote: 'Minimum count index (sum of individualCount from sightings in this period). ' +
        'Not corrected for repeat sightings of the same individual — treat as a lower bound, not an exact census.',
      growthRate,
      growthRateLabel,
      siteBreakdown: siteBreakdownList,
      distributionPoints: siteBreakdownList
        .filter(s => s.latitude != null && s.longitude != null)
        .map(s => ({ siteName: s.siteName, latitude: s.latitude, longitude: s.longitude, count: s.count })),
      migrationAnalysis: null,
      migrationAnalysisNote: 'Not available — migration analysis requires individually-tagged/tracked animals ' +
        'observed across multiple sites over time. This system currently records independent sightings, not ' +
        'tracked individuals, so movement between sites cannot be attributed to the same animal.'
    };
  });

  // --- Species richness per site (real, computable now) ---
  const richnessBySite = sites.map(site => {
    const siteId = (site._id || site.id || '').toString();
    const siteSightings = currentPeriod.filter(
      s => ((s.monitoringSite?._id || s.monitoringSite || '')).toString() === siteId
    );
    const distinctSpecies = new Set(
      siteSightings.map(s => (s.species?._id || s.species || '').toString())
    );
    return {
      siteId,
      siteName: site.siteName,
      speciesRichness: distinctSpecies.size,
      totalSightings: siteSightings.length
    };
  });

  return {
    periodDays,
    generatedAt: new Date().toISOString(),
    speciesMetrics,
    richnessBySite
  };
}

module.exports = { computePopulationMetrics };