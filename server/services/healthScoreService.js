/**
 * Ecosystem Health Scoring Engine (Aligned 5-Factor Model)
 * --------------------------------------------------------
 * Score = SpeciesDiversity * 0.30 + PopulationStability * 0.25 + HabitatQuality * 0.20
 *         + EndangeredStatus * 0.15 + EnvironmentalConditions * 0.10
 *
 * Status Bands:
 *   Excellent: >= 85
 *   Healthy: 70 - 84
 *   Moderate Concern: 50 - 69
 *   Vulnerable: 30 - 49
 *   Critical: < 30
 */

function statusForScore(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Healthy';
  if (score >= 50) return 'Moderate Concern';
  if (score >= 30) return 'Vulnerable';
  return 'Critical';
}

function computeSpeciesDiversity(speciesMetrics) {
  const active = (speciesMetrics || []).filter(sp => sp.populationSize > 0);
  if (active.length === 0) return { score: 0, note: 'No sightings recorded.' };
  if (active.length === 1) return { score: 10, note: 'Single species observed.' };

  const total = active.reduce((sum, sp) => sum + sp.populationSize, 0);
  const shannonH = -active.reduce((sum, sp) => {
    const p = sp.populationSize / total;
    return sum + (p > 0 ? p * Math.log(p) : 0);
  }, 0);

  const maxH = Math.log(active.length);
  const evenness = maxH > 0 ? shannonH / maxH : 0;
  const score = Math.round(evenness * 100);

  return {
    score,
    note: `Shannon evenness across ${active.length} active species.`
  };
}

function computePopulationStability(speciesMetrics) {
  const withData = (speciesMetrics || []).filter(sp => sp.growthRate !== null && sp.populationSize > 0);
  if (withData.length === 0) {
    return { score: 50, note: 'Neutral default (50) until MoM trends accumulate.' };
  }

  const points = withData.map(sp => {
    if (sp.growthRate >= 0) return 100;
    if (sp.growthRate >= -25) return 60;
    return 20;
  });
  const score = Math.round(points.reduce((a, b) => a + b, 0) / points.length);

  return {
    score,
    note: `Calculated from growth rate of ${withData.length} tracked species.`
  };
}

function computeHabitatQuality(siteReports) {
  const withData = (siteReports || []).filter(s => s.activityLevel !== 'No Data');
  if (withData.length === 0) return { score: 50, note: 'No active monitoring site telemetry.' };

  const score = Math.round(withData.reduce((sum, s) => sum + (s.richnessIndex || 50), 0) / withData.length);
  return {
    score,
    note: `Average species richness index across ${withData.length} site(s).`
  };
}

function computeEndangeredStatus(speciesMetrics) {
  const atRisk = (speciesMetrics || []).filter(sp =>
    ['Critical', 'Vulnerable'].includes(sp.conservationStatus)
  );

  if (atRisk.length === 0) return { score: 100, note: 'No threatened species flagged in catalog.' };

  let penalty = 0;
  atRisk.forEach(sp => {
    if (sp.populationSize === 0) penalty += 20;
    else if (sp.growthRate !== null && sp.growthRate < 0) penalty += 10;
  });

  const score = Math.max(0, 100 - penalty);
  return {
    score,
    note: `Evaluated across ${atRisk.length} Critical/Vulnerable species.`
  };
}

function computeEnvironmentalConditions(environmentReadings) {
  if (!environmentReadings || environmentReadings.length === 0) {
    return { score: 75, note: 'Default environmental score (75) — reading entries available.' };
  }

  const avgTemp = environmentReadings.reduce((sum, r) => sum + Number(r.temperature || 25), 0) / environmentReadings.length;
  const avgHumidity = environmentReadings.reduce((sum, r) => sum + Number(r.humidity || 50), 0) / environmentReadings.length;

  let score = 100;
  if (avgTemp > 35 || avgTemp < 5) score -= 25;
  if (avgHumidity < 30 || avgHumidity > 90) score -= 15;

  return {
    score: Math.max(0, Math.round(score)),
    note: `Computed from ${environmentReadings.length} sensor reading(s) (Avg Temp: ${avgTemp.toFixed(1)}°C, Avg Humidity: ${avgHumidity.toFixed(1)}%).`
  };
}

function computeHealthScore(populationMetrics, habitatMetrics, environmentReadings = []) {
  const diversity = computeSpeciesDiversity(populationMetrics?.speciesMetrics);
  const stability = computePopulationStability(populationMetrics?.speciesMetrics);
  const habitat = computeHabitatQuality(habitatMetrics?.siteReports);
  const endangered = computeEndangeredStatus(populationMetrics?.speciesMetrics);
  const environment = computeEnvironmentalConditions(environmentReadings);

  const overallScore = Math.round(
    diversity.score * 0.30 +
    stability.score * 0.25 +
    habitat.score * 0.20 +
    endangered.score * 0.15 +
    environment.score * 0.10
  );

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    status: statusForScore(overallScore),
    formula: 'Score = SpeciesDiversity*0.30 + PopulationStability*0.25 + HabitatQuality*0.20 + EndangeredStatus*0.15 + EnvironmentalConditions*0.10',
    factors: {
      speciesDiversity: { ...diversity, weight: '30%' },
      populationStability: { ...stability, weight: '25%' },
      habitatQuality: { ...habitat, weight: '20%' },
      endangeredStatus: { ...endangered, weight: '15%' },
      environmentalConditions: { ...environment, weight: '10%' }
    }
  };
}

module.exports = { computeHealthScore };