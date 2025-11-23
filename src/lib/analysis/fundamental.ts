import { FundamentalAsset, FundamentalScoreBreakdown, ScoredAsset } from "./types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const scoreLowerIsBetter = (value: number, thresholds: { best: number; worst: number }) => {
  const { best, worst } = thresholds;
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value <= best) {
    return 100;
  }
  if (value >= worst) {
    return 0;
  }
  const ratio = (worst - value) / (worst - best);
  return clamp(Math.round(ratio * 100), 0, 100);
};

const scoreHigherIsBetter = (value: number, thresholds: { best: number; worst: number }) => {
  const { best, worst } = thresholds;
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value >= best) {
    return 100;
  }
  if (value <= worst) {
    return 0;
  }
  const ratio = (value - worst) / (best - worst);
  return clamp(Math.round(ratio * 100), 0, 100);
};

const scoreSweetSpot = (
  value: number,
  sweetSpot: { min: number; max: number },
  tolerance: { min: number; max: number }
) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value >= sweetSpot.min && value <= sweetSpot.max) {
    return 100;
  }
  if (value < sweetSpot.min) {
    const distance = sweetSpot.min - value;
    const span = sweetSpot.min - tolerance.min;
    return clamp(Math.round((1 - distance / span) * 100), 0, 100);
  }
  const distance = value - sweetSpot.max;
  const span = tolerance.max - sweetSpot.max;
  return clamp(Math.round((1 - distance / span) * 100), 0, 100);
};

export function scoreAsset(asset: FundamentalAsset): ScoredAsset {
  const valuationScore = Math.round(
    (scoreLowerIsBetter(asset.pe, { best: 10, worst: 40 }) +
      scoreLowerIsBetter(asset.pb, { best: 1, worst: 5 })) /
      2
  );

  const profitabilityScore = Math.round(
    (scoreHigherIsBetter(asset.roe, { best: 25, worst: 5 }) +
      scoreHigherIsBetter(asset.roic, { best: 20, worst: 2 })) /
      2
  );

  const financialHealthScore = scoreLowerIsBetter(asset.netDebtToEquity, {
    best: 0,
    worst: 150
  });

  const dividendScore = scoreSweetSpot(
    asset.dividendYield,
    { min: 2, max: 7 },
    { min: 0, max: 12 }
  );

  const breakdown: FundamentalScoreBreakdown = {
    valuation: valuationScore,
    profitability: profitabilityScore,
    financialHealth: financialHealthScore,
    dividend: dividendScore
  };

  const score = Math.round(
    (breakdown.valuation +
      breakdown.profitability +
      breakdown.financialHealth +
      breakdown.dividend) /
      4
  );

  return { ...asset, score, breakdown };
}

export function scoreAssets(assets: FundamentalAsset[]): ScoredAsset[] {
  return assets
    .map((asset) => scoreAsset(asset))
    .sort((first, second) => second.score - first.score);
}
