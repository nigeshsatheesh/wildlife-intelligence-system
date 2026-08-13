/**
 * Habitat Intelligence Engine (activity-based proxy)
 * -----------------------------------------------------
 * IMPORTANT HONESTY NOTE: this is NOT satellite/vegetation-based habitat
 * analysis. This system has no remote-sensing data pipeline (no Sentinel
 * Hub / Google Earth Engine integration), so it cannot detect real
 * vegetation loss or habitat degradation from imagery. What it CAN
 * honestly compute from real data you have is: how much verified wildlife
 * activity a site shows, how many distinct species use it, and whether
 * at-risk species have been recorded there. These are legitimate,
 * commonly-used proxies for habitat value in field ecology when remote
 * sensing isn't available — but they are proxies, and are labeled as such
 * everywhere they're surfaced.
 */

const RISK_WEIGHT = { Critical: 3, Vulnerable: 2, 'Moderate Concern': 1, Healthy: 0, Excellent: 0 };

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function computeHabitatMetrics(sightings, sites, speciesList, opts = {}) {
  const periodDays = opts.periodDays || 90;
  const periodStart = daysAgo(periodDays);
  const previousPeriodStart = daysAgo(periodDays * 2);
  const totalCatalogedSpecies = speciesList.length || 1;

  const speciesById = new Map(speciesList.map(sp => [(sp._id || sp.id || '').toString(), sp]));

  const siteReports = sites.map(site => {
    const siteId = (site._id || site.id || '').toString();

    const siteSightings = sightings.filter(
      s => ((s.monitoringSite?._id || s.monitoringSite || '')).toString() === siteId
    );
    const currentSightings = siteSightings.filter(s => new Date(s.eventDate) >= periodStart);
    const previousSightings = siteSightings.filter(
      s => new Date(s.eventDate) >= previousPeriodStart && new Date(s.eventDate) < periodStart
    );

    // --- Species Richness Index (real, computed) ---
    const currentSpeciesIds = new Set(currentSightings.map(s => (s.species?._id || s.species || '').toString()));
    const previousSpeciesIds = new Set(previousSightings.map(s => (s.species?._id || s.species || '').toString()));
    const richnessIndex = Math.round((currentSpeciesIds.size / totalCatalogedSpecies) * 100);
    const richnessTrend = currentSpeciesIds.size - previousSpeciesIds.size;

    // --- Monitoring Activity Level (real, based on recency) ---
    const sortedByDate = [...siteSightings].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    const lastSightingDate = sortedByDate[0] ? new Date(sortedByDate[0].eventDate) : null;
    const daysSinceLastSighting = lastSightingDate
      ? Math.floor((Date.now() - lastSightingDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    let activityLevel;
    if (daysSinceLastSighting === null) activityLevel = 'No Data';
    else if (daysSinceLastSighting <= 14) activityLevel = 'Active';
    else if (daysSinceLastSighting <= 60) activityLevel = 'Moderate';
    else activityLevel = 'Stale';

    // --- Conservation Priority Score (real, based on at-risk species actually sighted here) ---
    let riskScoreRaw = 0;
    currentSightings.forEach(s => {
      const sp = s.species?.conservationStatus
        ? s.species
        : speciesById.get((s.species || '').toString());
      const status = sp?.conservationStatus;
      riskScoreRaw += RISK_WEIGHT[status] || 0;
    });
    // Normalize against a reasonable ceiling so the score sits roughly 0-100
    const conservationPriorityScore = Math.min(100, Math.round((riskScoreRaw / 15) * 100));

    // --- Rule-based recommendations (deterministic, explainable — not ML) ---
    const recommendations = [];

    if (activityLevel === 'Stale' || activityLevel === 'No Data') {
      recommendations.push(
        `No verified sightings at ${site.siteName} in over ${daysSinceLastSighting ?? periodDays} days — ` +
        `verify camera trap / sensor is still operational.`
      );
    }
    if (richnessTrend < 0) {
      recommendations.push(
        `Species richness at ${site.siteName} dropped from ${previousSpeciesIds.size} to ${currentSpeciesIds.size} ` +
        `distinct species vs the previous ${periodDays}-day period — investigate possible habitat disturbance or ` +
        `reduced monitoring coverage.`
      );
    }
    if (conservationPriorityScore >= 50) {
      recommendations.push(
        `${site.siteName} shows strong presence of Critical/Vulnerable species — prioritize this site for ` +
        `anti-poaching patrols and continuous monitoring.`
      );
    }
    if (!site.areaKm2) {
      recommendations.push(
        `${site.siteName} has no area (km²) set — add one to enable real population density and carrying-capacity analysis.`
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(`${site.siteName} shows stable activity and no immediate concerns based on current data.`);
    }

    return {
      siteId,
      siteName: site.siteName,
      habitatType: site.habitatType,
      richnessIndex,
      richnessIndexNote: 'Proxy metric: % of your catalogued species observed at this site in the period. ' +
        'Not a vegetation or satellite-based measure.',
      richnessTrend,
      activityLevel,
      daysSinceLastSighting,
      conservationPriorityScore,
      conservationPriorityNote: 'Weighted by how many Critical/Vulnerable-status sightings occurred at this site. ' +
        'High score = important refuge for at-risk species, not a "danger" score.',
      recommendations
    };
  });

  return {
    periodDays,
    generatedAt: new Date().toISOString(),
    methodologyNote: 'These are activity-based proxy metrics derived from verified sighting records — this ' +
      'system does not currently ingest satellite or vegetation-index data, so no true remote-sensing-based ' +
      'habitat degradation detection is performed.',
    siteReports
  };
}

module.exports = { computeHabitatMetrics };