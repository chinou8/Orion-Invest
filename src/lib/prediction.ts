export type ScoreLabel = "Hausse probable" | "Baisse probable" | "Stable / incertain";

export type AnalyseScore = {
  score: number;
  label: ScoreLabel;
};

type ScoreInputs = {
  clotures: number[];
  smaCourt: number[];
  smaLong: number[];
  rsi: number[];
};

/**
 * Calcule un score synthétique en combinant les tendances des SMA et du RSI.
 */
export function determinerScore({
  clotures,
  smaCourt,
  smaLong,
  rsi
}: ScoreInputs): AnalyseScore {
  const dernierCours = clotures.at(-1) ?? NaN;
  const dernierSmaCourt = smaCourt.at(-1) ?? NaN;
  const dernierSmaLong = smaLong.at(-1) ?? NaN;
  const dernierRsi = rsi.at(-1) ?? 50;

  const diffTrend =
    Number.isFinite(dernierSmaCourt) && Number.isFinite(dernierSmaLong) && dernierSmaLong !== 0
      ? ((dernierSmaCourt - dernierSmaLong) / dernierSmaLong) * 100
      : 0;

  const momentum = ((dernierRsi - 50) / 50) * 100;

  const progression =
    Number.isFinite(dernierCours) && Number.isFinite(dernierSmaCourt) && dernierCours !== 0
      ? ((dernierCours - dernierSmaCourt) / dernierCours) * 100
      : 0;

  const scoreBrut = diffTrend * 0.5 + momentum * 0.35 + progression * 0.15;
  const score = Math.max(-100, Math.min(100, Number.isFinite(scoreBrut) ? scoreBrut : 0));

  let label: ScoreLabel = "Stable / incertain";
  if (score > 20) {
    label = "Hausse probable";
  } else if (score < -20) {
    label = "Baisse probable";
  }

  return { score: Math.round(score), label };
}
