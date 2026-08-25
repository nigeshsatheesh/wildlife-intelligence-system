// server/services/healthScoreService.js
/**
 * Wildlife Health Scoring Engine
 * --------------------------------
 * Combines outputs from the Population and Habitat engines into a single
 * Ecosystem Health Score, per the spec's weighted model:
 *   Species Diversity (30%) + Population Stability (25%) + Habitat Quality (20%)
 *   + Endangered Species Status (15%) + Environmental Conditions (10%)
 *
 * HONESTY NOTE: This system has no satellite/sensor data pipeline, so
 * "Environmental Conditions" cannot be computed from real data. Rather than
 * fabricate a number, that factor is reported as unavailable and the other
 * four weights are renormalized to sum to 100%. This mirrors how migration
 * analysis and vegetation-based habitat degradation are already handled
 * elsewhere in this codebase.
 */

const RAW_WEIGHTS = {
  speciesDiversity: 30,
  populationStability: 25,
  habitatQuality: 20,
  endangeredStatus: 15,
  environmentalConditions: 10 // excluded from computation, kept here for transparency
};

const COMPUTABLE_WEIGHT_SUM =
  RAW_WEIGHTS.speciesDiversity +
  RAW_WEIGHTS.populationStability +
  RAW_WEIGHTS.habitatQuality +
  RAW_WEIGHTS.endangeredStatus; // 90

const NORMALIZED_WEIGHTS = {
  speciesDiversity: RAW_WEIGHTS.speciesDiversity / COMPUTABLE_WEIGHT_SUM,       // 0.333
  populationStability: RAW_WEIGHTS.populationStability / COMPUTABLE_WEIGHT_SUM, // 0.278
  habitatQuality: RAW_WEIGHTS.habitatQuality / COMPUTABLE_WEIGHT_SUM,           // 0.222
  endangeredStatus: RAW_WEIGHTS.endangeredStatus / COMPUTABLE_WEIGHT_SUM        // 0.167
};

function statusForScore(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Healthy';
  if (score >= 50) return 'Moderate Concern';
  if (score >= 30) return 'Vulnerable';
  return 'Critical';
}

// --- Species Diversity: Shannon evenness index, normalized 0-100 ---
function computeSpeciesDiversity(speciesMetrics) {
  const active = speciesMetrics.filter(sp => sp.populationSize > 0);
  if (active.length === 0) {
    return { score: 0, note: 'No sightings recorded in this period — diversity cannot be assessed.' };
  }
  if (active.length === 1) {
    return { score: 0, note: 'Only one species observed this period — no diversity by definition.' };
  }

  const total = active.reduce((sum, sp) => sum + sp.populationSize, 0);
  const shannonH = -active.reduce((sum, sp) => {
    const p = sp.populationSize / total;
    return sum + p * Math.log(p);
  }, 0);

  const maxH = Math.log(active.length); // max possible diversity given species count
  const evenness = maxH > 0 ? shannonH / maxH : 0;
  const score = Math.round(evenness * 100);

  return {
    score,
    note: `Shannon evenness index across ${active.length} species with recorded sightings this period.`
  };
}

// --- Population Stability: average per-species stability points from growthRate ---
function computePopulationStability(speciesMetrics) {
  const withData = speciesMetrics.filter(sp => sp.growthRate !== null && sp.populationSize > 0);
  const withoutData = speciesMetrics.filter(sp => sp.growthRate === null && sp.populationSize > 0);

  if (withData.length === 0) {
    return {
      score: 50,
      note: 'No species have two consecutive periods of data yet — score defaulted to neutral (50) ' +
        'until growth trends become available.'
    };
  }

  const points = withData.map(sp => {
    if (sp.growthRate >= 0) return 100;
    if (sp.growthRate >= -25) return 60;
    return 20;
  });
  const score = Math.round(points.reduce((a, b) => a + b, 0) / points.length);

  return {
    score,
    note: `Based on growth trend for ${withData.length} species with sufficient history` +
      (withoutData.length > 0 ? ` (${withoutData.length} species excluded — no prior-period data yet).` : '.')
  };
}

// --- Habitat Quality: average richnessIndex across sites ---
function computeHabitatQuality(siteReports) {
  const withData = siteReports.filter(s => s.activityLevel !== 'No Data');
  if (withData.length === 0) {
    return { score: 0, note: 'No monitoring sites have recorded activity yet.' };
  }
  const score = Math.round(withData.reduce((sum, s) => sum + s.richnessIndex, 0) / withData.length);
  return {
    score,
    note: `Average species-richness index across ${withData.length} active monitoring site(s).`
  };
}

// --- Endangered Species Status: penalty-based ---
function computeEndangeredStatus(speciesMetrics) {
  const atRisk = speciesMetrics.filter(sp =>
    sp.conservationStatus === 'Critical' || sp.conservationStatus === 'Vulnerable'
  );

  if (atRisk.length === 0) {
    return { score: 100, note: 'No species currently classified Critical or Vulnerable in the catalog.' };
  }

  let penalty = 0;
  atRisk.forEach(sp => {
    if (sp.populationSize === 0) penalty += 20;
    else if (sp.growthRate !== null && sp.growthRate < 0) penalty += 10;
  });

  const score = Math.max(0, 100 - penalty);
  return {
    score,
    note: `Evaluated across ${atRisk.length} Critical/Vulnerable species: penalized for zero sightings ` +
      `(-20 each) or declining trend (-10 each) this period.`
  };
}

/**
 * @param {Object} populationMetrics - output of computePopulationMetrics()
 * @param {Object} habitatMetrics - output of computeHabitatMetrics()
 */
function computeHealthScore(populationMetrics, habitatMetrics) {
  const diversity = computeSpeciesDiversity(populationMetrics.speciesMetrics);
  const stability = computePopulationStability(populationMetrics.speciesMetrics);
  const habitat = computeHabitatQuality(habitatMetrics.siteReports);
  const endangered = computeEndangeredStatus(populationMetrics.speciesMetrics);

  const overallScore = Math.round(
    diversity.score * NORMALIZED_WEIGHTS.speciesDiversity +
    stability.score * NORMALIZED_WEIGHTS.populationStability +
    habitat.score * NORMALIZED_WEIGHTS.habitatQuality +
    endangered.score * NORMALIZED_WEIGHTS.endangeredStatus
  );

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    status: statusForScore(overallScore),
    weightingNote: 'Environmental Conditions (10% in the original spec) is not tracked — this system has no ' +
      'satellite or sensor data integration. The remaining four factors are renormalized to sum to 100%, ' +
      'rather than substituting a fabricated value.',
    factors: {
      speciesDiversity: {
        ...diversity,
        weight: `${(NORMALIZED_WEIGHTS.speciesDiversity * 100).toFixed(1)}%`,
        specWeight: `${RAW_WEIGHTS.speciesDiversity}%`
      },
      populationStability: {
        ...stability,
        weight: `${(NORMALIZED_WEIGHTS.populationStability * 100).toFixed(1)}%`,
        specWeight: `${RAW_WEIGHTS.populationStability}%`
      },
      habitatQuality: {
        ...habitat,
        weight: `${(NORMALIZED_WEIGHTS.habitatQuality * 100).toFixed(1)}%`,
        specWeight: `${RAW_WEIGHTS.habitatQuality}%`
      },
      endangeredStatus: {
        ...endangered,
        weight: `${(NORMALIZED_WEIGHTS.endangeredStatus * 100).toFixed(1)}%`,
        specWeight: `${RAW_WEIGHTS.endangeredStatus}%`
      },
      environmentalConditions: {
        score: null,
        weight: '0%',
        specWeight: `${RAW_WEIGHTS.environmentalConditions}%`,
        unavailableReason: 'No satellite/sensor data source integrated in this system.'
      }
    }
  };
}

module.exports = { computeHealthScore };